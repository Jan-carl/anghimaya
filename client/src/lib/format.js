const DAYS = ['Linggo', 'Lunes', 'Martes', 'Miyerkules', 'Huwebes', 'Biyernes', 'Sabado'];
const MONTHS = [
  'Enero',
  'Pebrero',
  'Marso',
  'Abril',
  'Mayo',
  'Hunyo',
  'Hulyo',
  'Agosto',
  'Setyembre',
  'Oktubre',
  'Nobyembre',
  'Disyembre',
];

/** "Huwebes, Oktubre 1, 2026 • Lungsod ng Lopez, Quezon" */
export function tagalogDate(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return `${DAYS[date.getDay()]}, ${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

/** "Oktubre 2026" */
export function tagalogMonthYear(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export function initials(name = '') {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}

export function excerpt(body = '', length = 150) {
  const text = String(body).replace(/\s+/g, ' ').trim();
  if (text.length <= length) return text;
  return `${text.slice(0, text.lastIndexOf(' ', length))}…`;
}

/** Pangunahing inage: 2 (3 para sa maliit na screen). */
export function excerptOf(body = '', words = 26) {
  return excerpt(body, words * 6);
}

export const byNewest = (a, b) =>
  new Date(b.published_at || b.created_at || 0) - new Date(a.published_at || a.created_at || 0);