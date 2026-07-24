import React, { useState } from 'react';
import {
  ArrowUpRight,
  AudioLines,
  Bell,
  Box,
  ChevronRight,
  CreditCard,
  GitBranch,
  Globe2,
  Home,
  Image as ImageIcon,
  LayoutGrid,
  Library,
  LogIn,
  Maximize,
  Menu,
  MessageSquare,
  MoreHorizontal,
  Play,
  Rocket,
  ScanLine,
  Search,
  Sparkles,
  User,
  Video,
  Wand2,
  Workflow,
  X,
} from 'lucide-react';
import heroArtwork from './assets/hero-cinematic.png';
import galleryArtwork from './assets/gallery-sheet.png';
import GeneratorStudio from './GeneratorStudio.jsx';
import AudioStudio from './AudioStudio.jsx';
import BlueprintsView from './BlueprintsView.jsx';
import LibraryView from './LibraryView.jsx';
import FlowStateView from './FlowStateView.jsx';
import UpscalerView from './UpscalerView.jsx';
import PlansView from './PlansView.jsx';
import ApiView from './ApiView.jsx';
import WhatsNewView from './WhatsNewView.jsx';
import MorePanel from './MorePanel.jsx';
import LuminaLogo from './LuminaLogo.jsx';

const navItems = [
  { label: 'Home', icon: Home },
  { label: 'Library', icon: Library },
  { label: 'Image', icon: ImageIcon },
  { label: 'Video', icon: Video },
  { label: '3D', icon: Globe2 },
  { label: 'Audio', icon: AudioLines, badge: 'New' },
  { label: 'Flow State', icon: Workflow },
  { label: 'Blueprints', icon: GitBranch },
  { label: 'Upscaler', icon: ScanLine },
  { label: 'Plans', icon: CreditCard },
  { label: 'API', icon: Box },
  { label: "What's New", icon: Rocket },
];

const creationTypes = [
  { label: 'Image', icon: ImageIcon },
  { label: 'Video', icon: Play },
  { label: '3D', icon: Globe2 },
  { label: 'Audio', icon: AudioLines, badge: 'New' },
  { label: 'Blueprints', icon: GitBranch },
  { label: 'Upscaler', icon: Maximize },
];

const blueprints = [
  { title: 'Anime Portrait', tile: 0, badge: 'New' },
  { title: '3D Reference View Creator', tile: 1 },
  { title: 'Motion Product Showcase', tile: 2 },
  { title: 'Runner Route Hologram', tile: 3 },
  { title: 'Cinematic Scenario Product Film', tile: 4 },
  { title: 'Golden Interior Concept', tile: 5 },
  { title: 'Dynamic Product Reveal', tile: 6 },
  { title: 'Paper Cut Campaign', tile: 7 },
];

const community = [
  { title: 'Golden Hour', author: 'Studio Nova', tile: 5 },
  { title: 'Velocity', author: 'Kairo', tile: 6 },
  { title: 'Forest Signal', author: 'Mira Labs', tile: 4 },
  { title: 'Paper Skies', author: 'Owen Hart', tile: 7 },
];

function tilePosition(tile) {
  const column = tile % 4;
  const row = Math.floor(tile / 4);
  return `${column * 33.333}% ${row * 100}%`;
}

function Artwork({ tile, className = '', children, ...props }) {
  return (
    <div
      className={`artwork ${className}`}
      style={{
        backgroundImage: `url(${galleryArtwork})`,
        backgroundPosition: tilePosition(tile),
      }}
      {...props}
    >
      {children}
    </div>
  );
}

function Sidebar({ active, onSelect, mobileOpen, onClose, moreOpen, onToggleMore }) {
  return (
    <aside className={`sidebar ${mobileOpen ? 'sidebar--open' : ''}`}>
      <button className="mobile-close" onClick={onClose} aria-label="Close navigation">
        <X size={19} />
      </button>

      <button className="brand" aria-label="Lumina home" onClick={() => onSelect('Home')}>
        <span className="brand-mark"><LuminaLogo size={29} /></span>
      </button>

      <nav className="nav-list" aria-label="Main navigation">
        {navItems.map(({ label, icon: Icon, badge }) => (
          <button
            key={label}
            className={`nav-item ${active === label ? 'nav-item--active' : ''}`}
            onClick={() => { onSelect(label); onClose(); }}
          >
            {badge && <span className="nav-badge">{badge}</span>}
            <Icon size={21} strokeWidth={1.75} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <button
          className={`nav-item ${moreOpen ? 'nav-item--active' : ''}`}
          onClick={onToggleMore}
          aria-expanded={moreOpen}
        >
          <MoreHorizontal size={21} strokeWidth={1.75} />
          <span>More</span>
        </button>
        <button className="sign-button sign-button--ghost"><LogIn size={16} /> <span>Sign Up</span></button>
        <button className="sign-button"><User size={16} /> <span>Sign In</span></button>
      </div>
    </aside>
  );
}

export default function App() {
  const [activeNav, setActiveNav] = useState('Home');
  const [prompt, setPrompt] = useState('');
  const [creationType, setCreationType] = useState('Image');
  const [menuOpen, setMenuOpen] = useState(false);
  const [view, setView] = useState('home');
  const [studioPrompt, setStudioPrompt] = useState('');
  const [studioTab, setStudioTab] = useState('image');
  const [moreOpen, setMoreOpen] = useState(false);
  const [blueprintsReturn, setBlueprintsReturn] = useState({ view: 'home', activeNav: 'Home' });

  const openBlueprints = () => {
    setBlueprintsReturn({
      view: view === 'blueprints' ? 'home' : view,
      activeNav: view === 'blueprints' ? 'Home' : activeNav,
    });
    setActiveNav('Blueprints');
    setView('blueprints');
  };

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setStudioPrompt(prompt.trim());
    setStudioTab(creationType.toLowerCase() === 'video' ? 'video' : (creationType.toLowerCase() === '3d' ? '3d' : 'image'));
    setView('studio');
  };

  const handleNavigation = (label) => {
    setMoreOpen(false);
    if (label === 'Blueprints') {
      openBlueprints();
      return;
    }
    setActiveNav(label);
    if (label === 'Library') {
      setView('library');
    } else if (label === 'Image' || label === 'Video' || label === '3D') {
      setStudioTab(label.toLowerCase());
      setView('studio');
    } else if (label === 'Audio') {
      setView('audio');
    } else if (label === 'Flow State') {
      setView('flow');
    } else if (label === 'Upscaler') {
      setView('upscaler');
    } else if (label === 'Plans') {
      setView('plans');
    } else if (label === 'API') {
      setView('api');
    } else if (label === "What's New") {
      setView('whats-new');
    } else {
      setView('home');
    }
  };

  if (view === 'library') {
    return (
      <LibraryView
        onNavigate={handleNavigation}
        onRemix={(remixPrompt) => {
          setStudioPrompt(remixPrompt);
          setStudioTab('image');
          setActiveNav('Image');
          setView('studio');
        }}
      />
    );
  }

  if (view === 'flow') {
    return (
      <FlowStateView
        onBack={() => {
          setActiveNav('Home');
          setView('home');
        }}
        onNavigate={handleNavigation}
      />
    );
  }

  if (view === 'upscaler') {
    return (
      <UpscalerView
        onBack={() => {
          setActiveNav('Home');
          setView('home');
        }}
      />
    );
  }

  if (view === 'plans') {
    return (
      <PlansView
        onBack={() => {
          setActiveNav('Home');
          setView('home');
        }}
      />
    );
  }

  if (view === 'api') {
    return (
      <ApiView
        onBack={() => {
          setActiveNav('Home');
          setView('home');
        }}
      />
    );
  }

  if (view === 'whats-new') {
    return <WhatsNewView onNavigate={handleNavigation} />;
  }

  if (view === 'studio') {
    return (
      <GeneratorStudio
        initialPrompt={studioPrompt}
        initialTab={studioTab}
        onBack={() => setView('home')}
        onNavigate={(nextView) => {
          if (nextView === 'blueprints') {
            openBlueprints();
          } else {
            setView(nextView);
          }
        }}
      />
    );
  }
  
  if (view === 'blueprints') {
    return (
      <BlueprintsView
        onBack={() => {
          setActiveNav(blueprintsReturn.activeNav);
          setView(blueprintsReturn.view);
        }}
      />
    );
  }

  if (view === 'audio') {
    return (
      <AudioStudio
        onBack={() => setView('home')}
        onNavigate={handleNavigation}
        onOpenImage={() => {
          setActiveNav('Image');
          setView('studio');
        }}
      />
    );
  }

  return (
    <div className="app-shell">
      <style>{styles}</style>
      <Sidebar
        active={activeNav}
        onSelect={handleNavigation}
        mobileOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        moreOpen={moreOpen}
        onToggleMore={() => setMoreOpen((open) => !open)}
      />
      <MorePanel
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
        onNavigate={handleNavigation}
      />
      {menuOpen && <button className="scrim" onClick={() => setMenuOpen(false)} aria-label="Close menu" />}

      <main className="page">
        <header className="mobile-header">
          <button className="icon-button" onClick={() => setMenuOpen(true)} aria-label="Open navigation">
            <Menu size={20} />
          </button>
          <div className="mobile-logo"><LuminaLogo size={17} /> LUMINA</div>
          <button className="icon-button" aria-label="Notifications"><Bell size={19} /></button>
        </header>

        <section className="hero" style={{ backgroundImage: `url(${heroArtwork})` }}>
          <div className="hero-shade" />
          <div className="hero-content">
            <p className="eyebrow"><span /> GENERATIVE CREATIVE SUITE <span /></p>
            <h1>YOURS TO CREATE</h1>
            <div className="prompt-shell">
              <button className="prompt-upload" aria-label="Open image studio" onClick={() => setView('studio')}><ImageIcon size={19} /></button>
              <input
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && handleGenerate()}
                placeholder="Type a prompt..."
                aria-label="Image prompt"
              />
              <button className="surprise-button" aria-label="Enhance prompt"><Sparkles size={17} /></button>
              <button className="generate-button" disabled={!prompt.trim()} onClick={handleGenerate}>
                Generate
                <ArrowUpRight size={15} />
              </button>
            </div>

            <div className="creation-types">
              {creationTypes.map(({ label, icon: Icon, badge }) => (
                <button
                  key={label}
                  className={`creation-type ${creationType === label ? 'creation-type--active' : ''}`}
                  onClick={() => {
                    setCreationType(label);
                    if (label === 'Image' || label === 'Video' || label === '3D') {
                      setActiveNav(label);
                      setStudioTab(label.toLowerCase());
                      setView('studio');
                    } else if (label === 'Audio') {
                      setActiveNav('Audio');
                      setView('audio');
                    } else if (label === 'Blueprints') {
                      openBlueprints();
                    } else if (label === 'Upscaler') {
                      setActiveNav('Upscaler');
                      setView('upscaler');
                    }
                  }}
                >
                  <span className="creation-icon">
                    {badge && <small>{badge}</small>}
                    <Icon size={20} strokeWidth={1.55} />
                  </span>
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <div className="content">
          <section className="section-block">
            <div className="section-heading">
              <div>
                <span className="section-kicker">CURATED WORKFLOWS</span>
                <h2>Featured Blueprints</h2>
              </div>
              <button className="view-all">View More <ChevronRight size={15} /></button>
            </div>

            <div className="blueprint-row">
              {blueprints.map((blueprint) => (
                <Artwork key={blueprint.title} tile={blueprint.tile} className="blueprint-card" tabIndex={0}>
                  {blueprint.badge && <span className="card-badge">{blueprint.badge}</span>}
                  <button className="card-action" aria-label={`Open ${blueprint.title}`}><ArrowUpRight size={16} /></button>
                  <div className="card-gradient" />
                  <div className="card-copy">
                    <span>BLUEPRINT</span>
                    <h3>{blueprint.title}</h3>
                  </div>
                </Artwork>
              ))}
            </div>
          </section>

          <section className="section-block community-section">
            <div className="section-heading">
              <div>
                <span className="section-kicker">MADE WITH LUMINA</span>
                <h2>Community Creations</h2>
              </div>
              <div className="community-actions">
                <button className="filter-button"><LayoutGrid size={16} /> Explore</button>
                <button className="view-all">View All <ChevronRight size={15} /></button>
              </div>
            </div>

            <div className="community-grid">
              {community.map((item) => (
                <Artwork key={item.title} tile={item.tile} className="community-card" tabIndex={0}>
                  <div className="community-overlay">
                    <div>
                      <h3>{item.title}</h3>
                      <p>by {item.author}</p>
                    </div>
                    <button aria-label={`View ${item.title}`}><Maximize size={17} /></button>
                  </div>
                </Artwork>
              ))}
            </div>
          </section>

          <footer>
            <span><LuminaLogo size={16} /> LUMINA</span>
            <p>Imagine it. Create it. Make it yours.</p>
          </footer>
        </div>
      </main>

      <button className="chat-button" aria-label="Open help chat"><MessageSquare size={20} /></button>
      <button className="quick-search" aria-label="Search"><Search size={17} /></button>
    </div>
  );
}

const styles = `
  :root {
    color-scheme: dark;
    --bg: #070707;
    --panel: #101010;
    --line: rgba(255,255,255,.11);
    --muted: #929292;
    --violet: #7557f6;
    --violet-bright: #8a6cff;
  }

  * { box-sizing: border-box; }
  html { background: var(--bg); }
  body { margin: 0; background: var(--bg); color: #fff; }
  button, input { font: inherit; }
  button { color: inherit; }

  .app-shell {
    min-height: 100vh;
    background: var(--bg);
    color: #fff;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    overflow-x: hidden;
  }

  .sidebar {
    position: fixed;
    inset: 8px auto 8px 8px;
    z-index: 50;
    width: 78px;
    border: 1px solid rgba(255,255,255,.16);
    border-radius: 22px;
    background: rgba(13,13,13,.94);
    backdrop-filter: blur(20px);
    display: flex;
    flex-direction: column;
    align-items: center;
    box-shadow: 0 12px 40px rgba(0,0,0,.4);
  }

  .brand {
    width: 76px;
    height: 62px;
    border: 0;
    border-radius: 22px 22px 12px 12px;
    background: transparent;
    cursor: pointer;
    display: grid;
    place-items: center;
  }

  .brand-mark {
    width: 40px;
    height: 40px;
    display: grid;
    place-items: center;
    border: 1px solid rgba(255,255,255,.24);
    border-radius: 13px;
    background: linear-gradient(145deg, #2d2d2d, #090909);
    box-shadow: inset 0 1px rgba(255,255,255,.12);
  }

  .nav-list {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    overflow-y: auto;
    scrollbar-width: none;
    padding: 2px 7px 8px;
  }
  .nav-list::-webkit-scrollbar { display: none; }

  .nav-item {
    position: relative;
    width: 64px;
    min-height: 51px;
    padding: 7px 3px 6px;
    border: 0;
    border-radius: 13px;
    background: transparent;
    color: #a9a9a9;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    cursor: pointer;
    transition: .2s ease;
  }
  .nav-item span { font-size: 9.5px; font-weight: 650; line-height: 1.05; white-space: nowrap; }
  .nav-item:hover { color: #fff; background: rgba(255,255,255,.07); }
  .nav-item--active {
    color: #fff;
    background: linear-gradient(145deg, #343434, #232323);
    box-shadow: inset 0 1px rgba(255,255,255,.1), 0 7px 18px rgba(0,0,0,.28);
  }
  .nav-item--active::before {
    content: '';
    position: absolute;
    left: -7px;
    width: 3px;
    height: 23px;
    border-radius: 4px;
    background: #8d76ff;
    box-shadow: 0 0 12px #7c5cff;
  }

  .nav-item .nav-badge {
    position: absolute;
    top: 2px;
    right: 1px;
    background: #f4f4f4;
    color: #111;
    padding: 2px 4px;
    border-radius: 8px;
    font-size: 7px;
  }

  .sidebar-bottom {
    width: 100%;
    margin-top: auto;
    padding: 7px 7px 10px;
    display: grid;
    gap: 5px;
    justify-items: center;
    border-top: 1px solid rgba(255,255,255,.07);
  }
  .sidebar-bottom .nav-item { min-height: 44px; }

  .sign-button {
    width: 64px;
    min-height: 32px;
    padding: 0 7px;
    border: 0;
    border-radius: 9px;
    background: var(--violet);
    font-size: 9.5px;
    font-weight: 750;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 5px;
    white-space: nowrap;
    transition: transform .18s ease, background-color .18s ease, box-shadow .18s ease;
  }
  .sign-button:hover { transform: translateY(-1px); background: var(--violet-bright); box-shadow: 0 5px 14px rgba(117,87,246,.3); }
  .sign-button--ghost { background: #242424; color: #ddd; border: 1px solid rgba(255,255,255,.1); }
  .sign-button--ghost:hover { background: #303030; box-shadow: none; }
  .nav-item:focus-visible, .sign-button:focus-visible, .brand:focus-visible { outline: 2px solid var(--violet-bright); outline-offset: 2px; }

  .page { min-height: 100vh; margin-left: 94px; }
  .mobile-header { display: none; }

  .hero {
    min-height: 448px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    background-size: cover;
    background-position: center 31%;
    overflow: hidden;
  }

  .hero::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 50% 15%, transparent 0, rgba(0,0,0,.06) 43%, rgba(0,0,0,.52) 100%);
  }
  .hero-shade {
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom, rgba(5,5,5,.05) 0%, rgba(5,5,5,.1) 44%, #070707 98%);
  }

  .hero-content {
    width: min(900px, calc(100% - 60px));
    position: relative;
    z-index: 2;
    margin-top: -7px;
    text-align: center;
  }

  .eyebrow {
    margin: 0 0 7px;
    color: rgba(255,255,255,.72);
    font-size: 9px;
    font-weight: 800;
    letter-spacing: .28em;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }
  .eyebrow span { display: block; width: 24px; height: 1px; background: rgba(255,255,255,.4); }

  .hero h1 {
    margin: 0 0 28px;
    font-size: clamp(46px, 5.3vw, 76px);
    line-height: .95;
    letter-spacing: -.055em;
    font-weight: 950;
    text-shadow: 0 7px 28px rgba(0,0,0,.32);
  }

  .prompt-shell {
    width: 100%;
    height: 62px;
    border: 1px solid rgba(255,255,255,.16);
    border-radius: 21px;
    padding: 7px;
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(18,18,18,.87);
    backdrop-filter: blur(24px);
    box-shadow: inset 0 1px rgba(255,255,255,.04), 0 18px 46px rgba(0,0,0,.32);
    transition: .25s ease;
  }
  .prompt-shell:focus-within { border-color: rgba(138,108,255,.65); box-shadow: 0 0 0 3px rgba(117,87,246,.12), 0 18px 46px rgba(0,0,0,.32); }
  .prompt-shell--submitted { border-color: #8a6cff; transform: scale(1.008); }

  .prompt-shell input {
    min-width: 0;
    flex: 1;
    border: 0;
    outline: 0;
    background: transparent;
    color: #fff;
    font-size: 14px;
    font-weight: 550;
  }
  .prompt-shell input::placeholder { color: #8b8b8b; }

  .prompt-upload, .surprise-button {
    width: 42px;
    height: 42px;
    flex: 0 0 auto;
    border-radius: 14px;
    border: 1px solid rgba(255,255,255,.09);
    background: rgba(255,255,255,.06);
    display: grid;
    place-items: center;
    color: #bdbdbd;
    cursor: pointer;
  }
  .surprise-button { border-radius: 50%; background: #1f2121; color: #fff; }
  .prompt-upload:hover, .surprise-button:hover { color: #fff; background: rgba(255,255,255,.11); }

  .generate-button {
    height: 42px;
    min-width: 120px;
    border: 0;
    border-radius: 14px;
    padding: 0 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    color: #fff;
    background: linear-gradient(135deg, #8467ff, #6546e9);
    font-weight: 750;
    font-size: 12px;
    cursor: pointer;
    box-shadow: 0 7px 20px rgba(86,59,220,.3);
  }
  .generate-button:disabled { color: #696969; background: #242424; box-shadow: none; cursor: default; }

  .creation-types {
    display: flex;
    justify-content: center;
    gap: clamp(14px, 3vw, 36px);
    margin-top: 23px;
  }
  .creation-type {
    min-width: 53px;
    padding: 0;
    border: 0;
    background: transparent;
    color: #b9b9b9;
    font-size: 10px;
    font-weight: 620;
    cursor: pointer;
    display: grid;
    justify-items: center;
    gap: 7px;
  }
  .creation-icon {
    position: relative;
    width: 48px;
    height: 48px;
    border: 1px solid rgba(255,255,255,.12);
    border-radius: 17px;
    background: rgba(17,17,17,.78);
    display: grid;
    place-items: center;
    transition: .2s ease;
  }
  .creation-icon small {
    position: absolute;
    top: -7px;
    right: -1px;
    padding: 2px 5px;
    border-radius: 8px;
    background: white;
    color: #111;
    font-size: 7px;
    font-weight: 800;
  }
  .creation-type:hover, .creation-type--active { color: #fff; }
  .creation-type:hover .creation-icon, .creation-type--active .creation-icon {
    border-color: rgba(139,108,255,.65);
    background: rgba(117,87,246,.16);
    box-shadow: inset 0 0 20px rgba(117,87,246,.12), 0 0 24px rgba(105,76,241,.12);
  }

  .content { padding: 5px 20px 36px 12px; }
  .section-block { max-width: 1780px; margin: 0 auto 31px; }
  .section-heading {
    display: flex;
    justify-content: space-between;
    align-items: end;
    gap: 20px;
    margin-bottom: 14px;
  }
  .section-heading h2 { margin: 2px 0 0; font-size: 20px; letter-spacing: -.025em; }
  .section-kicker { color: #6f6f6f; font-size: 8px; font-weight: 800; letter-spacing: .18em; }
  .view-all {
    border: 0;
    padding: 8px 0;
    background: transparent;
    color: #d0d0d0;
    font-size: 11px;
    font-weight: 650;
    display: flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
  }
  .view-all:hover { color: #fff; }

  .blueprint-row {
    display: grid;
    grid-template-columns: repeat(8, minmax(150px, 1fr));
    gap: 5px;
    overflow-x: auto;
    padding-bottom: 5px;
    scrollbar-width: thin;
    scrollbar-color: #333 transparent;
  }

  .artwork {
    background-repeat: no-repeat;
    background-size: 400% 200%;
  }

  .blueprint-card {
    position: relative;
    min-width: 150px;
    height: 244px;
    border-radius: 14px;
    overflow: hidden;
    cursor: pointer;
    outline: none;
    isolation: isolate;
    transition: transform .25s ease, filter .25s ease;
  }
  .blueprint-card:hover, .blueprint-card:focus-visible { transform: translateY(-4px); filter: brightness(1.06); z-index: 2; }
  .card-gradient { position: absolute; inset: 38% 0 0; background: linear-gradient(transparent, rgba(0,0,0,.9)); z-index: -1; }
  .card-copy { position: absolute; z-index: 2; inset: auto 12px 12px; text-align: left; }
  .card-copy span { color: rgba(255,255,255,.66); font-size: 7px; font-weight: 800; letter-spacing: .15em; }
  .card-copy h3 { margin: 3px 0 0; font-size: 13px; line-height: 1.13; max-width: 150px; }
  .card-badge { position: absolute; z-index: 2; top: 9px; left: 9px; padding: 4px 7px; border-radius: 10px; background: #fff; color: #111; font-size: 8px; font-weight: 800; }
  .card-action {
    position: absolute;
    z-index: 3;
    top: 9px;
    right: 9px;
    width: 31px;
    height: 31px;
    border-radius: 50%;
    border: 1px solid rgba(255,255,255,.18);
    background: rgba(0,0,0,.45);
    backdrop-filter: blur(12px);
    display: grid;
    place-items: center;
    opacity: 0;
    transform: scale(.88);
    transition: .2s ease;
    cursor: pointer;
  }
  .blueprint-card:hover .card-action { opacity: 1; transform: scale(1); }

  .community-section { margin-top: 27px; }
  .community-actions { display: flex; align-items: center; gap: 16px; }
  .filter-button {
    border: 1px solid var(--line);
    border-radius: 10px;
    padding: 7px 10px;
    background: #111;
    display: flex;
    align-items: center;
    gap: 6px;
    color: #aaa;
    font-size: 10px;
    cursor: pointer;
  }
  .community-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 5px; }
  .community-card {
    position: relative;
    height: clamp(210px, 20vw, 340px);
    border-radius: 12px;
    overflow: hidden;
    outline: none;
    cursor: pointer;
    transition: .25s ease;
  }
  .community-card:hover { transform: translateY(-3px); }
  .community-overlay {
    position: absolute;
    inset: auto 0 0;
    padding: 54px 16px 14px;
    background: linear-gradient(transparent, rgba(0,0,0,.85));
    display: flex;
    align-items: end;
    justify-content: space-between;
    opacity: 0;
    transition: .2s ease;
  }
  .community-card:hover .community-overlay, .community-card:focus-visible .community-overlay { opacity: 1; }
  .community-overlay h3 { margin: 0; font-size: 14px; }
  .community-overlay p { margin: 2px 0 0; color: #aaa; font-size: 9px; }
  .community-overlay button {
    width: 34px;
    height: 34px;
    border: 1px solid rgba(255,255,255,.2);
    border-radius: 50%;
    background: rgba(255,255,255,.1);
    display: grid;
    place-items: center;
    cursor: pointer;
  }

  footer {
    max-width: 1780px;
    margin: 45px auto 0;
    padding: 25px 0 5px;
    border-top: 1px solid rgba(255,255,255,.08);
    color: #666;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 10px;
  }
  footer span { color: #aaa; font-weight: 850; letter-spacing: .13em; display: flex; gap: 6px; align-items: center; }

  .chat-button, .quick-search {
    position: fixed;
    right: 18px;
    bottom: 18px;
    z-index: 40;
    width: 47px;
    height: 47px;
    border: 0;
    border-radius: 50%;
    background: linear-gradient(135deg, #8769ff, #6543ee);
    box-shadow: 0 10px 30px rgba(86,56,230,.4);
    display: grid;
    place-items: center;
    cursor: pointer;
  }
  .quick-search { bottom: 75px; width: 36px; height: 36px; right: 23px; background: #1d1d1d; border: 1px solid var(--line); box-shadow: none; color: #a8a8a8; }

  .mobile-close, .scrim { display: none; }

  @media (max-height: 850px) and (min-width: 821px) {
    .sidebar { overflow-y: auto; scrollbar-width: none; }
    .sidebar-bottom { position: relative; margin-top: 4px; }
    .brand { height: 56px; }
    .nav-list { gap: 1px; }
    .nav-item { min-height: 46px; padding-block: 5px; }
    .sidebar-bottom .nav-item { min-height: 40px; }
    .sign-button { min-height: 30px; }
  }

  @media (max-width: 1180px) {
    .blueprint-row { grid-template-columns: repeat(8, 170px); }
    .community-grid { grid-template-columns: repeat(2, 1fr); }
    .community-card { height: 300px; }
  }

  @media (max-width: 820px) {
    .sidebar {
      inset: 8px auto 8px 8px;
      transform: translateX(-115%);
      transition: transform .25s ease;
    }
    .sidebar--open { transform: translateX(0); }
    .mobile-close { display: grid; position: absolute; top: 12px; right: -42px; width: 34px; height: 34px; border: 1px solid var(--line); border-radius: 11px; background: #151515; place-items: center; }
    .scrim { display: block; position: fixed; inset: 0; z-index: 45; border: 0; background: rgba(0,0,0,.7); backdrop-filter: blur(4px); }
    .page { margin-left: 0; }
    .mobile-header {
      height: 54px;
      padding: 0 13px;
      position: absolute;
      inset: 0 0 auto;
      z-index: 10;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .mobile-logo { font-size: 11px; font-weight: 900; letter-spacing: .15em; display: flex; align-items: center; gap: 5px; }
    .icon-button { width: 36px; height: 36px; border: 1px solid var(--line); border-radius: 11px; background: rgba(10,10,10,.5); display: grid; place-items: center; }
    .hero { min-height: 520px; background-position: 50% center; }
    .hero-content { width: calc(100% - 28px); margin-top: 22px; }
    .hero h1 { font-size: clamp(40px, 11vw, 62px); margin-bottom: 23px; }
    .prompt-shell { height: auto; min-height: 58px; border-radius: 18px; }
    .generate-button { min-width: 48px; width: 48px; padding: 0; font-size: 0; }
    .generate-button svg { width: 17px; height: 17px; }
    .creation-types { overflow-x: auto; justify-content: flex-start; padding: 0 8px 8px; gap: 17px; }
    .creation-type { min-width: 55px; }
    .content { padding: 7px 12px 30px; }
  }

  @media (max-width: 620px) {
    .eyebrow { font-size: 7px; }
    .prompt-upload { display: none; }
    .prompt-shell input { padding-left: 7px; font-size: 12px; }
    .section-heading { align-items: center; }
    .section-heading h2 { font-size: 17px; }
    .community-actions .filter-button { display: none; }
    .community-grid { grid-template-columns: 1fr; }
    .community-card { height: 340px; }
    .community-overlay { opacity: 1; }
    footer { flex-direction: column; gap: 8px; text-align: center; }
  }
`;
