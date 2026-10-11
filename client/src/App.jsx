import { useState, useEffect } from 'react';
import { useContent } from './hooks/useContent.js';
import { SceneHero } from './scene/SceneHero.jsx';
import { SceneErrorBoundary } from './scene/SceneErrorBoundary.jsx';
import { NavBar } from './components/NavBar.jsx';
import { TopStory } from './components/TopStory.jsx';
import { Voices } from './components/Voices.jsx';
import { Silakbo } from './components/Silakbo.jsx';
import { Editions } from './components/Editions.jsx';
import { Masthead } from './components/Masthead.jsx';
import { Subscribe } from './components/Subscribe.jsx';
import { Footer } from './components/Footer.jsx';
import { ArticleReader } from './components/ArticleReader.jsx';

/**
 * Ang pahayagan: 3D hero sa itaas, saka ang modernong nilalaman sa ibaba.
 * Nananatiling fixed ang canvas habang dumadaloy ang mga seksyon sa ibabaw nito.
 * May kasamang Reader Mode na hango sa thefrontman.ph para sa "Basahin pa.." at mga artikulo.
 */
export function App() {
  const content = useContent();
  const [readingArticle, setReadingArticle] = useState(null);

  // Tiyakin na ang pahina ay nagsisimula sa tuktok (3D hero) sa unang load kung walang hash
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!window.location.hash || window.location.hash === '#top') {
        window.scrollTo(0, 0);
      }
    }
  }, []);

  // Linisin ang scroll state kapag bumabalik ang browser mula sa bfcache (back/forward cache)
  useEffect(() => {
    const handlePageShow = (e) => {
      if (e.persisted) {
        document.body.style.removeProperty('overflow');
        document.documentElement.style.removeProperty('overflow');
      }
    };
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  return (
    <>
      <div id="top" style={{ position: 'absolute', top: 0, left: 0, width: 1, height: 1, pointerEvents: 'none', opacity: 0 }} />

      <SceneErrorBoundary>
        <SceneHero />
      </SceneErrorBoundary>

      <div className="publication">
        <NavBar articles={content.articles} onSelectArticle={setReadingArticle} />

        <main>
          <TopStory
            lead={content.lead}
            news={content.news}
            onSelectArticle={setReadingArticle}
          />
          <Voices
            editorial={content.editorial}
            columns={content.columns}
            feature={content.feature}
            onSelectArticle={setReadingArticle}
          />
          <Silakbo
            spotlight={content.literary.spotlight}
            rest={content.literary.rest}
            onSelectArticle={setReadingArticle}
          />
          <Editions editions={[]} />
          <Masthead />
          <Subscribe />
        </main>

        <Footer />
      </div>

      {/* THE FRONTMAN ARTICLE READER VIEW (Hango sa reference screenshot ng user) */}
      {readingArticle ? (
        <ArticleReader
          article={readingArticle}
          onClose={() => setReadingArticle(null)}
        />
      ) : null}
    </>
  );
}

export default App;