import React, { useState } from 'react';
import {
  AudioLines,
  Box,
  ChevronDown,
  Coins,
  CreditCard,
  GitBranch,
  Globe2,
  Heart,
  Home,
  Image as ImageIcon,
  Library,
  MoreHorizontal,
  Rocket,
  ScanLine,
  Settings,
  Video,
  Wand2,
  Workflow,
} from 'lucide-react';
import './WhatsNewView.css';
import MorePanel from './MorePanel.jsx';
import LuminaLogo from './LuminaLogo.jsx';
import { openUiAction } from './uiActions.js';

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

const RELEASES = [
  {
    version: 'v1.6.5',
    menuLabel: 'v1.6.5 - 30 June 2026',
    date: '30 June 2026',
    title: 'Gemini Omni Flash is now on Lumina.',
    subtitle: 'Scenes that feel directed, not just generated. From a prompt or a reference image.',
    artwork: 'omni',
    likes: 7766,
    bullets: [
      'Gemini Omni Flash is now live on Lumina. Built on a deep understanding of how the real world looks and moves — lighting that makes sense, physics that hold, scenes that feel coherent from the first frame.',
      '720p clips up to 10 seconds from a text prompt or reference image.',
      'Motion, gravity, and lighting that behave the way they should.',
      'Scenes grounded in real narrative logic — not just visually plausible, but genuinely coherent.',
      'Refine what you make through conversation — just tell it what to change and it updates the clip.',
    ],
  },
  {
    version: 'v1.6.4',
    menuLabel: 'v1.6.4 - 18 June 2026',
    date: '18 June 2026',
    title: 'Motion 2.0 brings every frame to life.',
    subtitle: 'Faster, smoother video generation with natural movement and camera control.',
    artwork: 'motion',
    likes: 6421,
    bullets: [
      'Create cinematic movement with improved subject consistency across every frame.',
      'Use camera direction to control pans, zooms, tracking shots and reveal moments.',
      'Generate polished five-second clips in less time.',
      'Start from text or animate one of your existing Lumina images.',
    ],
  },
  {
    version: 'v1.6.3',
    menuLabel: 'v1.6.3 - 04 June 2026',
    date: '04 June 2026',
    title: 'Realtime Canvas has a brand-new flow.',
    subtitle: 'Sketch, guide and generate without breaking your creative rhythm.',
    artwork: 'canvas',
    likes: 5184,
    bullets: [
      'A cleaner canvas keeps tools close while giving your ideas more room.',
      'Reference controls now update generations as you draw.',
      'Save reusable canvas presets for your favorite workflows.',
      'Export high-resolution results directly to your Library.',
    ],
  },
];

function WhatsNewSidebar({ onNavigate, moreOpen, onToggleMore }) {
  return (
    <aside className="whats-new-sidebar">
      <button type="button" className="whats-new-brand" aria-label="Lumina home" onClick={() => onNavigate('Home')}>
        <span><LuminaLogo size={27} /></span>
      </button>

      <nav className="whats-new-nav" aria-label="What's New navigation">
        {NAV_ITEMS.map(({ label, icon: Icon, badge }) => (
          <button
            type="button"
            key={label}
            className={`whats-new-nav-item ${label === "What's New" ? 'is-active' : ''}`}
            onClick={() => onNavigate(label)}
          >
            <Icon size={17} strokeWidth={1.75} />
            <span>{label}</span>
            {badge && <small>{badge}</small>}
          </button>
        ))}
      </nav>

      <div className="whats-new-sidebar-bottom">
        <button
          type="button"
          className={`whats-new-nav-item ${moreOpen ? 'is-active' : ''}`}
          onClick={onToggleMore}
          aria-expanded={moreOpen}
        >
          <MoreHorizontal size={17} />
          <span>More</span>
        </button>
        <i />
        <button type="button" className="whats-new-nav-item" onClick={() => openUiAction('settings')}>
          <Settings size={17} />
          <span>Settings</span>
        </button>
        <span className="whats-new-balance"><Coins size={13} /> 150</span>
        <button type="button" className="whats-new-upgrade" onClick={() => onNavigate('Plans')}>Upgrade</button>
        <button type="button" className="whats-new-profile" aria-label="Open profile" onClick={() => openUiAction('profile')}>
          <b>D</b>
          <ChevronDown size={12} />
        </button>
      </div>
    </aside>
  );
}

function OmniArtwork() {
  return (
    <div className="release-art release-art--omni" aria-label="Gemini Omni Flash artwork">
      <span className="omni-word omni-word--top">GEMINI</span>
      <span className="omni-word omni-word--bottom">OMNI</span>
      <span className="omni-sculpture" aria-hidden="true">
        {Array.from({ length: 10 }, (_, index) => <i key={index} style={{ '--ring': index }} />)}
      </span>
    </div>
  );
}

function MotionArtwork() {
  return (
    <div className="release-art release-art--motion" aria-label="Motion 2.0 artwork">
      <span className="motion-grid" />
      <span className="motion-orbit"><i /><i /><i /></span>
      <strong>MOTION<br />2.0</strong>
    </div>
  );
}

function CanvasArtwork() {
  return (
    <div className="release-art release-art--canvas" aria-label="Realtime Canvas artwork">
      <span className="canvas-swatch canvas-swatch--one" />
      <span className="canvas-swatch canvas-swatch--two" />
      <span className="canvas-swatch canvas-swatch--three" />
      <strong>REALTIME<br />CANVAS</strong>
    </div>
  );
}

function ReleaseArtwork({ type }) {
  if (type === 'motion') return <MotionArtwork />;
  if (type === 'canvas') return <CanvasArtwork />;
  return <OmniArtwork />;
}

export default function WhatsNewView({ onNavigate }) {
  const [releaseIndex, setReleaseIndex] = useState(0);
  const [releaseMenuOpen, setReleaseMenuOpen] = useState(false);
  const [likedVersions, setLikedVersions] = useState([]);
  const [moreOpen, setMoreOpen] = useState(false);

  const release = RELEASES[releaseIndex];
  const liked = likedVersions.includes(release.version);

  const toggleLike = () => {
    setLikedVersions((current) => (
      current.includes(release.version)
        ? current.filter((version) => version !== release.version)
        : [...current, release.version]
    ));
  };

  return (
    <div className="whats-new-view">
      <WhatsNewSidebar
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

      <main className="whats-new-main">
        <header className="whats-new-header">
          <Rocket size={31} strokeWidth={1.7} />
          <div>
            <h1>What's New</h1>
            <p>{release.menuLabel}</p>
          </div>

          <div className="release-menu-wrap">
            <button
              type="button"
              className={`release-menu-trigger ${releaseMenuOpen ? 'is-open' : ''}`}
              onClick={() => setReleaseMenuOpen((open) => !open)}
              aria-expanded={releaseMenuOpen}
            >
              {release.menuLabel}
              <ChevronDown size={13} />
            </button>
            {releaseMenuOpen && (
              <div className="release-menu" role="menu">
                {RELEASES.map((item, index) => (
                  <button
                    type="button"
                    key={item.version}
                    className={index === releaseIndex ? 'is-active' : ''}
                    onClick={() => {
                      setReleaseIndex(index);
                      setReleaseMenuOpen(false);
                    }}
                  >
                    <span>{item.version}</span>
                    <small>{item.date}</small>
                  </button>
                ))}
              </div>
            )}
          </div>
        </header>

        <article className="release-post" key={release.version}>
          <div className="release-date"><span /> <strong>{release.date}</strong> <span /></div>
          <h2><Wand2 size={23} /> {release.title}</h2>
          <p className="release-subtitle">{release.subtitle}</p>

          <ReleaseArtwork type={release.artwork} />

          <ul className="release-bullets">
            {release.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
          </ul>

          <button type="button" className="release-create" onClick={() => onNavigate('Image')}>
            Create something
          </button>
          <button
            type="button"
            className={`release-like ${liked ? 'is-liked' : ''}`}
            onClick={toggleLike}
            aria-pressed={liked}
          >
            <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
            {release.likes + (liked ? 1 : 0)}
          </button>
        </article>
      </main>

    </div>
  );
}
