import { useInView } from '../hooks/useInView.js';

/**
 * Nagpapakita ng elemento kapag napapasok sa viewport.
 * `delay` para sa staggered na pagpasok sa loob ng isang grid.
 */
export function Reveal({ as: Tag = 'div', delay = 0, className = '', children, ...rest }) {
  const [ref, inView] = useInView();

  return (
    <Tag
      ref={ref}
      className={`reveal ${className}`.trim()}
      data-visible={inView}
      style={delay ? { '--reveal-delay': `${delay}ms` } : undefined}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export default Reveal;