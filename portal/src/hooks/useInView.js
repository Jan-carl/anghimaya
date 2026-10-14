import { useEffect, useRef, useState } from 'react';

/**
 * Hook para sa Ink.ai style fade blur + slide blur animations sa viewport.
 */
export function useInView({ threshold = 0, rootMargin = '0px 0px -5% 0px', once = true } = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(node);

    const raf = requestAnimationFrame(() => {
      if (!node.isConnected) return;
      const rect = node.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) setInView(true);
    });

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [threshold, rootMargin, once]);

  return [ref, inView];
}
