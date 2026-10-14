import { config } from '../config.js';

const TABLES = {
  articles: 'articles',
  ticker_alerts: 'ticker_alerts',
  editions: 'editions',
};

export const COLLECTIONS = Object.keys(TABLES);

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isUuid = (value) => UUID_RE.test(String(value ?? ''));

export const newUuid = () =>
  crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const status = { available: false, error: null };

let clientPromise = null;

export function isSupabaseConfigured() {
  return Boolean(config.supabase.url && config.supabase.serviceRoleKey);
}

export function supabaseStatus() {
  return { configured: isSupabaseConfigured(), ...status };
}

export async function getClient() {
  if (!isSupabaseConfigured()) return null;
  if (clientPromise) return clientPromise;

  clientPromise = import('@supabase/supabase-js')
    .then(({ createClient }) => {
      const client = createClient(config.supabase.url, config.supabase.serviceRoleKey, {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      });
      status.available = true;
      status.error = null;
      return client;
    })
    .catch((err) => {
      status.available = false;
      status.error = err.message;
      console.warn('[supabase] Hindi ma-load ang "@supabase/supabase-js" — lokal na JSON store ang gagamitin.');
      return null;
    });

  return clientPromise;
}

function toRow(collection, record) {
  if (collection !== 'editions') return { ...record };
  const { year, updated_at: _updated, ...rest } = record;
  return { ...rest, published_year: year ?? null };
}

function fromRow(collection, row) {
  if (collection !== 'editions') return { ...row };
  const { published_year, ...rest } = row;
  return { ...rest, year: published_year ?? null };
}

function unwrap({ data, error }, label) {
  if (error) throw new Error(`${label}: ${error.message}`);
  return data ?? [];
}

export async function fetchAll(client) {
  const result = {};
  for (const collection of COLLECTIONS) {
    result[collection] = unwrap(
      await client.from(TABLES[collection]).select('*'),
      `Hindi mabasa ang ${TABLES[collection]}`,
    ).map((row) => fromRow(collection, row));
  }
  return result;
}

export async function mirrorAll(client, state) {
  for (const collection of COLLECTIONS) {
    const table = TABLES[collection];
    const rows = (state[collection] ?? []).map((record) => toRow(collection, record));
    const localIds = new Set(rows.map((row) => row.id));

    const remote = unwrap(await client.from(table).select('id'), `Hindi mabasa ang ${table}`);
    const stale = remote.map((row) => row.id).filter((id) => !localIds.has(id));

    if (stale.length) {
      unwrap(await client.from(table).delete().in('id', stale), `Hindi nabura ang lumang datos sa ${table}`);
    }

    if (rows.length) {
      unwrap(await client.from(table).upsert(rows, { onConflict: 'id' }), `Hindi nasave ang ${table}`);
    }
  }
}