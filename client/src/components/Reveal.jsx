import { useInView } from '../hooks/useInView.js';

/**
 * Nagpapakita ng elemento kapag napapasok sa viewport.
 * May fade blur at slide blur para sa marangyang animasyon (Ink.ai inspired).
 * `delay` para sa staggered na pagpasok sa loob ng isang grid.
 * `variant`: 'up' | 'down' | 'left' | 'right' | 'zoom'
 */
export function Reveal({ as: Tag = 'div', variant = 'up', delay = 0, className = '', children, ...rest }) {
  const [ref, inView] = useInView();
  const variantClass = variant && variant !== 'up' ? `reveal--${variant === 'zoom' ? 'zoom' : `slide-${variant}`}` : '';

  return (
    <Tag
      ref={ref}
      className={`reveal ${variantClass} ${className}`.trim()}
      data-visible={inView}
      style={delay ? { '--reveal-delay': `${delay}ms` } : undefined}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export default Reveal;