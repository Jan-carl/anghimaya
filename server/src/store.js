import fs from 'node:fs';
import path from 'node:path';
import { config } from './config.js';
import { slugify } from './lib/validate.js';
import {
  COLLECTIONS,
  fetchAll,
  getClient,
  isSupabaseConfigured,
  isUuid,
  mirrorAll,
  newUuid,
  supabaseStatus,
} from './lib/supabase.js';

const EMPTY = { articles: [], ticker_alerts: [], editions: [] };
const MAX_SYNC_RETRIES = 5;

function ensureDirs() {
  fs.mkdirSync(config.paths.data, { recursive: true });
  fs.mkdirSync(config.paths.uploads, { recursive: true });
}

let state = structuredClone(EMPTY);

function load() {
  ensureDirs();
  if (!fs.existsSync(config.paths.store)) {
    fs.writeFileSync(config.paths.store, JSON.stringify(state, null, 2), 'utf8');
    return;
  }

  try {
    const parsed = JSON.parse(fs.readFileSync(config.paths.store, 'utf8'));
    state = { ...structuredClone(EMPTY), ...parsed };
  } catch (err) {
    console.error('[store] store.json ay hindi wasto — nagsimula sa blangkong estado.', err.message);
    state = structuredClone(EMPTY);
  }
}

let writeQueued = false;
function writeLocal() {
  if (writeQueued) return;
  writeQueued = true;
  queueMicrotask(() => {
    writeQueued = false;
    const tmp = `${config.paths.store}.tmp`;
    try {
      fs.writeFileSync(tmp, JSON.stringify(state, null, 2), 'utf8');
      fs.renameSync(tmp, config.paths.store);
    } catch (err) {
      console.error('[store] nabigo ang pag-save:', err.message);
    }
  });
}

const sync = { connected: false, lastSyncAt: null, lastError: null, retries: 0, syncing: false, queued: false };
let syncTimer = null;

function scheduleSync() {
  if (!isSupabaseConfigured()) return;
  clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    syncNow().catch(() => {});
  }, 400);
}

export async function syncNow() {
  if (!isSupabaseConfigured()) return;
  if (sync.syncing) {
    sync.queued = true;
    return;
  }

  const client = await getClient();
  if (!client) {
    sync.connected = false;
    return;
  }

  sync.syncing = true;
  try {
    await mirrorAll(client, state);
    sync.connected = true;
    sync.lastError = null;
    sync.retries = 0;
    sync.lastSyncAt = new Date().toISOString();
  } catch (err) {
    sync.connected = false;
    sync.lastError = err.message;
    sync.retries += 1;
    console.error(`[store] Supabase sync #${sync.retries} nabigo:`, err.message);

    if (sync.retries <= MAX_SYNC_RETRIES) {
      const delay = Math.min(30_000, 1_000 * 2 ** (sync.retries - 1));
      clearTimeout(syncTimer);
      syncTimer = setTimeout(() => {
        syncNow().catch(() => {});
      }, delay);
    }
  } finally {
    sync.syncing = false;
    if (sync.queued) {
      sync.queued = false;
      scheduleSync();
    }
  }
}

export function syncStatus() {
  return {
    ...supabaseStatus(),
    connected: sync.connected,
    syncing: sync.syncing,
    lastSyncAt: sync.lastSyncAt,
    lastError: sync.lastError,
  };
}

async function hydrate() {
  if (!isSupabaseConfigured()) return;

  const client = await getClient();
  if (!client) return;

  try {
    const remote = await fetchAll(client);
    let seeded = false;

    for (const collection of COLLECTIONS) {
      if (remote[collection]?.length) {
        state[collection] = remote[collection];
        continue;
      }
      if (!state[collection]?.length) continue;

      for (const record of state[collection]) {
        if (isUuid(record.id)) continue;
        record.id = newUuid();
      }
      seeded = true;
    }

    writeLocal();
    if (seeded) await syncNow();
    console.log(`[store] Supabase ang pinagkukunan — sin synced ang ${COLLECTIONS.length} na talaan.`);
  } catch (err) {
    sync.connected = false;
    sync.lastError = err.message;
    console.error('[store] Hindi mabuksan ang Supabase — lokal na JSON store ang gagamitin:', err.message);
  }
}

function persist() {
  writeLocal();
  scheduleSync();
}

const now = () => new Date().toISOString();
const byNewest = (a, b) => new Date(b.published_at || b.created_at || 0) - new Date(a.published_at || a.created_at || 0);
const newId = (prefix) => (isSupabaseConfigured() ? newUuid() : `${prefix}_${newUuid()}`);

export const store = {
  init: async () => {
    load();
    await hydrate();
  },

  // ---------- Artikulo ----------
  listArticles({ type, category, is_lead, limit, q } = {}) {
    let list = [...state.articles];
    if (type) list = list.filter((a) => a.type === type);
    if (category) list = list.filter((a) => a.category === category);
    if (is_lead !== undefined) list = list.filter((a) => Boolean(a.is_lead) === is_lead);
    if (q) {
      list = list.filter((a) =>
        [a.title, a.deck, a.body, a.author_name, a.category].some((field) =>
          String(field ?? '').toLowerCase().includes(q),
        ),
      );
    }
    list.sort(byNewest);
    return limit ? list.slice(0, limit) : list;
  },

  getArticle(id) {
    return state.articles.find((a) => a.id === id || a.slug === id) ?? null;
  },

  createArticle(input) {
    const timestamp = now();
    const article = {
      id: newId('art'),
      title: input.title,
      slug: input.slug || slugify(input.title),
      type: input.type || 'news',
      category: input.category || 'Pangunahing Balita',
      deck: input.deck || '',
      body: input.body || '',
      author_name: input.author_name || 'Patnugutan ng Ang Himaya',
      author_role: input.author_role || 'Kawani ng Pamamahayagan',
      cover_image_url: input.cover_image_url || '',
      image_caption: input.image_caption || '',
      column_name: input.column_name || '',
      pull_quote: input.pull_quote || '',
      read_time: input.read_time || '4 min pagbasa',
      is_lead: Boolean(input.is_lead),
      is_published: input.is_published !== false,
      published_at: input.published_at || timestamp,
      created_at: timestamp,
      updated_at: timestamp,
    };

    if (article.is_lead) demoteOtherLeads(article.id);
    state.articles.unshift(article);
    persist();
    return article;
  },

  updateArticle(id, patch) {
    const index = state.articles.findIndex((a) => a.id === id);
    if (index === -1) return null;

    if (patch.is_lead) demoteOtherLeads(id);
    const next = { ...state.articles[index], ...patch, updated_at: now() };
    if (patch.title && !patch.slug) next.slug = slugify(patch.title);

    state.articles[index] = next;
    persist();
    return next;
  },

  deleteArticle(id) {
    const index = state.articles.findIndex((a) => a.id === id);
    if (index === -1) return false;
    state.articles.splice(index, 1);
    persist();
    return true;
  },

  // ---------- Kagyat na ulat ----------
  listTicker() {
    return state.ticker_alerts
      .filter((t) => t.is_active !== false)
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  },

  createTicker(message) {
    const alert = { id: newId('tick'), message, is_active: true, created_at: now() };
    state.ticker_alerts.unshift(alert);
    persist();
    return alert;
  },

  deleteTicker(id) {
    const index = state.ticker_alerts.findIndex((t) => t.id === id);
    if (index === -1) return false;
    state.ticker_alerts.splice(index, 1);
    persist();
    return true;
  },

  // ---------- Mga edisyon ----------
  listEditions() {
    return [...state.editions].sort((a, b) => (b.year || 0) - (a.year || 0));
  },

  createEdition(input) {
    const edition = {
      id: newId('ed'),
      title: input.title || '',
      volume: input.volume || 'Tomo XXVII',
      issue: input.issue || '',
      theme: input.theme || '',
      description: input.description || '',
      cover_image_url: input.cover_image_url || '',
      pdf_url: input.pdf_url || '',
      pages: input.pages ?? 16,
      year: input.year ?? new Date().getFullYear(),
      created_at: now(),
    };
    state.editions.unshift(edition);
    persist();
    return edition;
  },

  updateEdition(id, patch) {
    const index = state.editions.findIndex((e) => e.id === id);
    if (index === -1) return null;
    const next = { ...state.editions[index], ...patch, updated_at: now() };
    state.editions[index] = next;
    persist();
    return next;
  },

  deleteEdition(id) {
    const index = state.editions.findIndex((e) => e.id === id);
    if (index === -1) return false;
    state.editions.splice(index, 1);
    persist();
    return true;
  },
};

function demoteOtherLeads(exceptId) {
  for (const article of state.articles) {
    if (article.id !== exceptId && article.is_lead) article.is_lead = false;
  }
}