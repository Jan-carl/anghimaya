/**
 * Kagyat na ulat. Umiikot ang track para laging may gumagalaw na teksto;
 * duma-doble ang items para tuloy-tuloy ang pag-ikot.
 */
export function Ticker({ items = [] }) {
  if (items.length === 0) return null;

  const loop = [...items, ...items];

  return (
    <div className="ticker">
      <div className="container ticker__inner">
        <span className="ticker__label">Kagyat na Ulat</span>
        <div className="ticker__viewport">
          <div className="ticker__track">
            {loop.map((item, index) => (
              <span className="ticker__item" key={`${item.id}-${index}`}>
                {item.message}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Ticker;