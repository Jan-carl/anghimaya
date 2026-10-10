import { tagalogDate } from '../lib/format.js';

/** Manipis na dateline sa itaas ng pahayagan. */
export function Dateline() {
  return (
    <div className="dateline">
      <div className="container dateline__inner">
        <span className="dateline__org">Politeknikong Unibersidad ng Pilipinas — Campus ng Lopez</span>
        <span>Tomo XXVII · Blg. 1 · Taong Panuruan 2026–2027</span>
        <span>{tagalogDate()} · Lungsod ng Lopez, Quezon</span>
      </div>
    </div>
  );
}

export default Dateline;