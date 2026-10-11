import { useEffect, useRef, useState } from 'react';

/**
 * Banayad na linya sa scroll. Gumagamit ng IntersectionObserver
 * at nagiging simple kung hindi supported (hal. SSR o test).
 *
 * threshold ay 0 dahil ANG OBSERVER AY NAGTA-TRIGGER LAMANG kapag
 * binagsak ng ratio ang ibinigay na threshold. Isang seksyong mas
 * mahaba sa viewport (hal. ang charter sheet, footer, subscribe card —
 * lalo na sa mobile) ay kailumang hindi nasaanman ma-abot ang 0.12,
 * kaya hindi napapailaw ang callback at nananatiling nakatago ang
 * nilalaman (opacity: 0) kahit nasa screen na ito.
 */
export function useInView({ threshold = 0, rootMargin = '0px 0px -8% 0px', once = true } = {}) {
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

    // Panangga: kung may quirk ang observer sa mobile browser (o pumutok),
    // huwag manatiling nakatago ang nilalaman na nasa loob na ng screen.
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