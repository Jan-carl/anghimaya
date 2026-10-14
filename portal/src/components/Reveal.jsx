import { useInView } from '../hooks/useInView.js';

/**
 * Ink.ai style reveal — fade + blur + slide, in-sync sa client front-end.
 * Ang CSS ang may hawak ng galaw; `data-visible` lang ang switch dito.
 */
export function Reveal({
  as: Tag = 'div',
  variant = 'up',
  delay = 0,
  className = '',
  children,
  ...rest
}) {
  const [ref, inView] = useInView();

  const variantClass = variant && variant !== 'up' ? ` reveal--${variant}` : '';

  return (
    <Tag
      ref={ref}
      className={`reveal${variantClass} ${className}`.trim()}
      data-visible={inView}
      style={delay ? { '--reveal-delay': `${delay}ms` } : undefined}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export default Reveal;