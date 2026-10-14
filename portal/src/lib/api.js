const API_PREFIX = '/api';

const TOKEN_KEY = 'himaya_portal_token';

export const authStorage = {
  get: () => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set: (token) => {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      // ignore
    }
  },
  clear: () => {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      // ignore
    }
  },
};

export async function apiFetch(path, options = {}) {
  const token = authStorage.get();
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Kung hindi FormData, lagyan ng JSON Content-Type kung may body
  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_PREFIX}${path}`, {
    ...options,
    headers,
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const errorMsg = data?.error || data?.message || `Error ${response.status}: ${response.statusText}`;
    const err = new Error(errorMsg);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const portalApi = {
  // Auth
  async login({ passcode, email }) {
    const res = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ passcode, email }),
    });
    if (res?.token) {
      authStorage.set(res.token);
    }
    return res;
  },

  async verifySession() {
    return apiFetch('/auth/session');
  },

  logout() {
    authStorage.clear();
  },

  // Health
  async getHealth() {
    return apiFetch('/health');
  },

  // Articles
  async getArticles(params = {}) {
    const qs = new URLSearchParams();
    if (params.type) qs.set('type', params.type);
    if (params.category) qs.set('category', params.category);
    if (params.q) qs.set('q', params.q);
    if (params.limit) qs.set('limit', params.limit);
    const query = qs.toString();
    return apiFetch(`/articles${query ? `?${query}` : ''}`);
  },

  async getArticle(id) {
    return apiFetch(`/articles/${id}`);
  },

  async createArticle(article) {
    return apiFetch('/articles', {
      method: 'POST',
      body: JSON.stringify(article),
    });
  },

  async updateArticle(id, article) {
    return apiFetch(`/articles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(article),
    });
  },

  async deleteArticle(id) {
    return apiFetch(`/articles/${id}`, {
      method: 'DELETE',
    });
  },

  // Ticker Alerts
  async getTicker() {
    return apiFetch('/ticker');
  },

  async createTicker(message) {
    return apiFetch('/ticker', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  },

  async deleteTicker(id) {
    return apiFetch(`/ticker/${id}`, {
      method: 'DELETE',
    });
  },

  // Editions
  async getEditions() {
    return apiFetch('/editions');
  },

  async createEdition(edition) {
    return apiFetch('/editions', {
      method: 'POST',
      body: JSON.stringify(edition),
    });
  },

  async updateEdition(id, edition) {
    return apiFetch(`/editions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(edition),
    });
  },

  async deleteEdition(id) {
    return apiFetch(`/editions/${id}`, {
      method: 'DELETE',
    });
  },

  // File Upload
  async uploadImage(file, folder = 'ang-himaya') {
    const formData = new FormData();
    formData.append('image', file);
    if (folder) formData.append('folder', folder);

    return apiFetch('/upload', {
      method: 'POST',
      body: formData,
    });
  },
};
