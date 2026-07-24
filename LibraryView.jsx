import React, { useMemo, useState } from 'react';
import {
  AudioLines,
  Box,
  ChevronDown,
  Coins,
  CreditCard,
  Eye,
  GitBranch,
  Globe2,
  Heart,
  Home,
  Image as ImageIcon,
  LayoutGrid,
  Library,
  MessageSquare,
  Minus,
  MoreHorizontal,
  Play,
  Plus,
  Rocket,
  ScanLine,
  Search,
  Settings,
  ShieldCheck,
  Square,
  Video,
  Wand2,
  Workflow,
} from 'lucide-react';
import './LibraryView.css';
import MorePanel from './MorePanel.jsx';
import LuminaLogo from './LuminaLogo.jsx';

const NAV_ITEMS = [
  { label: 'Home', icon: Home },
  { label: 'Library', icon: Library },
  { label: 'Image', icon: ImageIcon },
  { label: 'Video', icon: Video },
  { label: 'Audio', icon: AudioLines, badge: 'New' },
  { label: '3D', icon: Globe2 },
  { label: 'Flow State', icon: Workflow },
  { label: 'Blueprints', icon: GitBranch },
  { label: 'Upscaler', icon: ScanLine },
  { label: 'Plans', icon: CreditCard },
  { label: 'API', icon: Box },
  { label: "What's New", icon: Rocket },
];

const LIBRARY_TABS = [
  'Your Generations',
  'Your Uploads',
  'Follower Feed',
  'Liked Feed',
  'Collections',
];

const FILTERS = [
  { label: 'All', icon: LayoutGrid },
  { label: 'Video', icon: Play },
  { label: 'Blueprints', icon: GitBranch },
  { label: '3D', icon: Globe2 },
  { label: 'Audio', icon: AudioLines },
];

const GENERATIONS = [
  {
    id: 'tech-startup',
    title: 'Tech Startup',
    type: 'All',
    author: 'dexer1',
    prompt: 'An intense jet black bold acrylic painting of a modern minimalist tech startup logo. The logo displays a geometric mark with clean, confident edges.',
    artwork: 'startup',
  },
  {
    id: 'tech-turn',
    title: 'Tech turn',
    type: 'All',
    author: 'dexer1',
    prompt: 'A glowing cyan technology emblem on a pure black background, geometric hexagonal form, vivid electric blue aura.',
    artwork: 'neon',
  },
];

function LibrarySidebar({ onNavigate, moreOpen, onToggleMore }) {
  return (
    <aside className="library-sidebar">
      <button
        type="button"
        className="library-brand"
        aria-label="Lumina home"
        onClick={() => onNavigate('Home')}
      >
        <span><LuminaLogo size={27} /></span>
      </button>

      <nav className="library-nav" aria-label="Library navigation">
        {NAV_ITEMS.map(({ label, icon: Icon, badge }) => (
          <button
            type="button"
            key={label}
            className={`library-nav-item ${label === 'Library' ? 'is-active' : ''}`}
            onClick={() => onNavigate(label)}
          >
            <Icon size={17} strokeWidth={1.75} />
            <span>{label}</span>
            {badge && <small>{badge}</small>}
          </button>
        ))}
      </nav>

      <div className="library-sidebar-bottom">
        <button
          type="button"
          className={`library-nav-item ${moreOpen ? 'is-active' : ''}`}
          onClick={onToggleMore}
          aria-expanded={moreOpen}
        >
          <MoreHorizontal size={17} />
          <span>More</span>
        </button>
        <i />
        <button type="button" className="library-nav-item">
          <Settings size={17} />
          <span>Settings</span>
        </button>
        <span className="library-balance"><Coins size={13} /> 150</span>
        <button type="button" className="library-upgrade">Upgrade</button>
        <button type="button" className="library-profile" aria-label="Open profile">
          <b>D</b>
          <ChevronDown size={12} />
        </button>
      </div>
    </aside>
  );
}

function StartupArtwork() {
  return (
    <div className="library-startup-art" aria-label="Tech Startup artwork">
      <span className="startup-symbol"><i /><i /><i /><i /></span>
      <strong>Tech Startup</strong>
    </div>
  );
}

function NeonArtwork() {
  return (
    <div className="library-neon-art" aria-label="Tech turn artwork">
      <span className="neon-glow">
        <i><i><i /></i></i>
      </span>
      <strong>Tech&nbsp; turn</strong>
    </div>
  );
}

function GenerationCard({ generation, selectMode, selected, onSelect, onRemix }) {
  return (
    <article
      className={`library-card library-card--${generation.artwork} ${selected ? 'is-selected' : ''}`}
      onClick={() => selectMode && onSelect(generation.id)}
    >
      {selectMode && (
        <button
          type="button"
          className={`library-card-check ${selected ? 'is-checked' : ''}`}
          aria-label={`Select ${generation.title}`}
          aria-pressed={selected}
          onClick={(event) => {
            event.stopPropagation();
            onSelect(generation.id);
          }}
        >
          {selected && <span>✓</span>}
        </button>
      )}

      {generation.artwork === 'startup' && (
        <div className="library-card-author">
          <span>D</span>
          <strong>{generation.author}</strong>
          <div>
            <b>0</b>
            <Heart size={17} />
            <ShieldCheck size={15} />
          </div>
        </div>
      )}

      {generation.artwork === 'neon' && (
        <button type="button" className="library-card-eye" aria-label="Preview Tech turn">
          <Eye size={16} />
        </button>
      )}

      <div className="library-card-artwork">
        {generation.artwork === 'startup' ? <StartupArtwork /> : <NeonArtwork />}
      </div>

      {generation.artwork === 'startup' && (
        <div className="library-card-footer">
          <p>{generation.prompt}</p>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onRemix(generation.prompt);
            }}
          >
            <Wand2 size={14} />
            Remix
          </button>
        </div>
      )}
    </article>
  );
}

export default function LibraryView({ onNavigate, onRemix }) {
  const [activeTab, setActiveTab] = useState('Your Generations');
  const [activeFilter, setActiveFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [newMenuOpen, setNewMenuOpen] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState([]);
  const [zoom, setZoom] = useState(100);
  const [moreOpen, setMoreOpen] = useState(false);

  const visibleGenerations = useMemo(() => {
    const cleanQuery = submittedQuery.trim().toLowerCase();
    return GENERATIONS.filter((generation) => {
      const matchesFilter = activeFilter === 'All' || generation.type === activeFilter;
      const matchesQuery = !cleanQuery
        || generation.title.toLowerCase().includes(cleanQuery)
        || generation.prompt.toLowerCase().includes(cleanQuery);
      return matchesFilter && matchesQuery;
    });
  }, [activeFilter, submittedQuery]);

  const toggleSelection = (id) => {
    setSelected((current) => (
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    ));
  };

  const submitSearch = (event) => {
    event.preventDefault();
    setSubmittedQuery(query);
  };

  return (
    <div className="library-view">
      <LibrarySidebar
        onNavigate={onNavigate}
        moreOpen={moreOpen}
        onToggleMore={() => setMoreOpen((open) => !open)}
      />
      <MorePanel
        open={moreOpen}
        compact
        onClose={() => setMoreOpen(false)}
        onNavigate={(destination) => {
          setMoreOpen(false);
          onNavigate(destination);
        }}
      />

      <main
        className="library-main"
        style={{ '--library-card-size': `${Math.round(385 * (zoom / 100))}px` }}
      >
        <header className="library-header">
          <h1>Library</h1>
          <nav className="library-tabs" aria-label="Library sections">
            {LIBRARY_TABS.map((tab) => (
              <button
                type="button"
                key={tab}
                className={activeTab === tab ? 'is-active' : ''}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </nav>
        </header>

        <section className="library-toolbar" aria-label="Library controls">
          <form className="library-search" onSubmit={submitSearch}>
            <label>
              <Search size={15} />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search gallery"
                aria-label="Search gallery"
              />
            </label>
            <button type="submit">Search</button>
          </form>

          <div className="library-new-wrap">
            <button
              type="button"
              className={`library-new ${newMenuOpen ? 'is-open' : ''}`}
              aria-expanded={newMenuOpen}
              onClick={() => setNewMenuOpen((open) => !open)}
            >
              <Wand2 size={14} />
              New
              <ChevronDown size={13} />
            </button>
            {newMenuOpen && (
              <div className="library-new-menu">
                <button type="button" onClick={() => onNavigate('Image')}>New image</button>
                <button type="button" onClick={() => onNavigate('Video')}>New video</button>
                <button type="button" onClick={() => onNavigate('Audio')}>New audio</button>
              </div>
            )}
          </div>

          <div className="library-filters" aria-label="Generation type">
            {FILTERS.map(({ label, icon: Icon }) => (
              <button
                type="button"
                key={label}
                className={activeFilter === label ? 'is-active' : ''}
                onClick={() => setActiveFilter(label)}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>

          <div className="library-view-controls">
            <button
              type="button"
              className={`library-select ${selectMode ? 'is-active' : ''}`}
              onClick={() => {
                setSelectMode((active) => !active);
                if (selectMode) setSelected([]);
              }}
            >
              <Square size={15} />
              Select
            </button>
            <Minus size={14} />
            <input
              type="range"
              min="78"
              max="120"
              value={zoom}
              onChange={(event) => setZoom(Number(event.target.value))}
              aria-label="Gallery zoom"
            />
            <Plus size={14} />
          </div>
        </section>

        <section className="library-gallery" aria-live="polite">
          {visibleGenerations.map((generation) => (
            <GenerationCard
              key={generation.id}
              generation={generation}
              selectMode={selectMode}
              selected={selected.includes(generation.id)}
              onSelect={toggleSelection}
              onRemix={onRemix}
            />
          ))}

          {!visibleGenerations.length && (
            <div className="library-empty">
              <Search size={25} />
              <strong>No generations found</strong>
              <span>Try another search or content filter.</span>
            </div>
          )}
        </section>
      </main>

      <button type="button" className="library-chat" aria-label="Open help chat">
        <MessageSquare size={19} />
      </button>
    </div>
  );
}
