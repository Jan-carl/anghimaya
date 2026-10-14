import { useState, useEffect, useCallback, useRef } from 'react';
import { portalApi, authStorage } from './lib/api.js';
import { Header } from './components/Header.jsx';
import { LoginGate } from './components/LoginGate.jsx';
import { StatsBar } from './components/StatsBar.jsx';
import { ArticleManager } from './components/ArticleManager.jsx';
import { TickerManager } from './components/TickerManager.jsx';
import { EditionManager } from './components/EditionManager.jsx';
import { MediaStudio } from './components/MediaStudio.jsx';
import { useToast } from './components/Toast.jsx';

const ICON = {
  articles: (
    <>
      <path d="M4 5a1 1 0 0 1 1-1h11a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" />
      <path d="M7 8h6M7 11h6M7 14h4" />
    </>
  ),
  ticker: (
    <>
      <path d="M3 11v2a1 1 0 0 0 1 1h2l4 3V7L6 10H4a1 1 0 0 0-1 1z" />
      <path d="M15 9.5a3.5 3.5 0 0 1 0 5" />
      <path d="M17.5 7a7 7 0 0 1 0 10" />
    </>
  ),
  editions: (
    <>
      <path d="M5 4a1 1 0 0 1 1-1h11a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1z" />
      <path d="M9 3v18" />
      <path d="M13 8h2M13 12h2" />
    </>
  ),
  media: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="8.5" cy="9.5" r="1.5" />
      <path d="m4 17 4.5-4.5a2 2 0 0 1 2.8 0L16 17" />
      <path d="m14 15 1.6-1.6a2 2 0 0 1 2.8 0L20 15" />
    </>
  ),
};

function TabIcon({ name }) {
  return (
    <svg
      className="portal-tab-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICON[name]}
    </svg>
  );
}

export function App() {
  const { addToast } = useToast();
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState('articles');

  // Content state
  const [articles, setArticles] = useState([]);
  const [ticker, setTicker] = useState([]);
  const [editions, setEditions] = useState([]);

  // Sliding pill sa tab bar
  const tabsRef = useRef(null);
  const [pill, setPill] = useState({ opacity: 0, width: 0, transform: 'translateX(0)' });

  // Load all content
  const loadAllData = useCallback(async () => {
    try {
      const [artRes, tickRes, edRes] = await Promise.all([
        portalApi.getArticles().catch(() => ({ data: [] })),
        portalApi.getTicker().catch(() => ({ data: [] })),
        portalApi.getEditions().catch(() => ({ data: [] })),
      ]);

      setArticles(artRes.data || []);
      setTicker(tickRes.data || []);
      setEditions(edRes.data || []);
    } catch {
      addToast('Nagka-problema sa pagkuha ng datos mula sa server.', 'error');
    }
  }, [addToast]);

  // Verify session on mount
  useEffect(() => {
    const verify = async () => {
      const token = authStorage.get();
      if (!token) {
        setCheckingAuth(false);
        return;
      }

      try {
        const session = await portalApi.verifySession();
        if (session?.data?.user) {
          setUser(session.data.user);
          loadAllData();
        } else {
          authStorage.clear();
        }
      } catch {
        authStorage.clear();
      } finally {
        setCheckingAuth(false);
      }
    };

    verify();
  }, [loadAllData]);

  // Sukatin ang aktibong tab para sa sliding pill
  useEffect(() => {
    const nav = tabsRef.current;
    if (!nav) return undefined;

    const measure = () => {
      const btn = nav.querySelector('.portal-tab-button.active');
      if (!btn) return;
      setPill({
        opacity: 1,
        width: btn.offsetWidth,
        transform: `translateX(${btn.offsetLeft}px)`,
      });
    };

    measure();
    const raf = requestAnimationFrame(measure);
    window.addEventListener('resize', measure);

    let observer;
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(measure);
      observer.observe(nav);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', measure);
      observer?.disconnect();
    };
  }, [activeTab, articles.length, ticker.length, editions.length]);

  const handleLogout = () => {
    portalApi.logout();
    setUser(null);
    addToast('Naka-logout na sa Tanggapan ng Patnugutan.', 'info');
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    loadAllData();
  };

  if (checkingAuth) {
    return (
      <div className="app-boot">
        <img src="./anghimayalogo.png" alt="" aria-hidden="true" className="app-boot__crest" />
        <span>Ikinakarga ang Ang Himaya Portal</span>
      </div>
    );
  }

  const TABS = [
    { id: 'articles', full: 'Mga Artikulo', short: 'Artikulo', count: articles.length },
    { id: 'ticker', full: 'Kagyat na Ulat (Ticker)', short: 'Ticker', count: ticker.length },
    { id: 'editions', full: 'Mga Edisyon (PDF)', short: 'Edisyon', count: editions.length },
    { id: 'media', full: 'Media at mga Larawan', short: 'Media' },
  ];

  return (
    <>
      <Header user={user} onLogout={handleLogout} />

      {!user ? (
        <LoginGate onLoginSuccess={handleLoginSuccess} />
      ) : (
        <main className="portal-main portal-container">
          {/* Quick Metrics */}
          <StatsBar
            articles={articles}
            ticker={ticker}
            editions={editions}
          />

          {/* Segmented nav — pill sa desktop, bottom bar sa phone */}
          <nav className="portal-tabs-nav" aria-label="Portal Navigation" ref={tabsRef}>
            <span
              className="portal-tabs-slider"
              aria-hidden="true"
              style={pill}
            />

            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`portal-tab-button ${activeTab === tab.id ? 'active' : ''}`.trim()}
                onClick={() => setActiveTab(tab.id)}
                aria-current={activeTab === tab.id ? 'page' : undefined}
              >
                <TabIcon name={tab.id} />
                <span className="tab-label-full">{tab.full}</span>
                <span className="tab-label-short">{tab.short}</span>
                {tab.count > 0 ? (
                  <span className={`tab-badge ${tab.id === 'ticker' ? 'tab-badge--accent' : ''}`.trim()}>
                    {tab.count}
                  </span>
                ) : null}
              </button>
            ))}
          </nav>

          {/* Active Tab Views */}
          {activeTab === 'articles' ? (
            <ArticleManager
              articles={articles}
              onRefresh={loadAllData}
            />
          ) : null}

          {activeTab === 'ticker' ? (
            <TickerManager
              ticker={ticker}
              onRefresh={loadAllData}
            />
          ) : null}

          {activeTab === 'editions' ? (
            <EditionManager
              editions={editions}
              onRefresh={loadAllData}
            />
          ) : null}

          {activeTab === 'media' ? (
            <MediaStudio />
          ) : null}

          {/* Clean Broadhsheet Footer */}
          <footer className="portal-footer">
            <div>
              <strong>Ang Himaya</strong> · Tanggapan ng Patnugutan · Politeknikong Unibersidad ng
              Pilipinas — Lopez Campus
            </div>
            <div>Eksklusibong portal para sa editorial board at mga awtorisadong kawani.</div>
          </footer>
        </main>
      )}
    </>
  );
}

export default App;