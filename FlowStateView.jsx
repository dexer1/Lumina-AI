import React, { useRef, useState } from 'react';
import {
  Aperture,
  ArrowLeft,
  AudioLines,
  ChevronDown,
  CircleHelp,
  Coins,
  GitBranch,
  Globe2,
  Image as ImageIcon,
  Lightbulb,
  Lock,
  MessageSquare,
  Palette,
  Play,
  RefreshCcw,
  Shield,
  Sparkles,
  Wand2,
  Workflow,
} from 'lucide-react';
import flowReference from './assets/flow-state-reference.png';
import './FlowStateView.css';

const FLOW_TABS = [
  { label: 'Image', icon: ImageIcon },
  { label: 'Video', icon: Play },
  { label: 'Audio', icon: AudioLines, badge: 'New' },
  { label: '3D', icon: Globe2 },
  { label: 'Flow State', icon: Workflow },
  { label: 'Blueprints', icon: GitBranch },
];

const STYLE_OPTIONS = {
  vibe: ['Randomize', 'Retro editorial', 'Bold minimal', 'Soft surreal'],
  lighting: ['Randomize', 'Golden hour', 'Studio softbox', 'Neon contrast'],
  shot: ['Randomize', 'Hero close-up', 'Wide composition', 'Isometric'],
  color: ['Randomize', 'Warm coral', 'Electric cyan', 'Muted cream'],
};

const INSPIRATIONS = [
  {
    id: 1,
    prompt: 'Flat retro vector illustration, art deco style, sleek minimalist shapes, textured gradient shading, poster composition, cream sports car and a bold crimson sun.',
  },
  {
    id: 2,
    prompt: '3D C4D style, minimalist composition. Tilted basalt rock fragment with delicate flowers, coral formations, soft moss and a warm peach background.',
  },
  {
    id: 3,
    prompt: 'Minimalist 3D graphic design, abstract shapes, varied textures, playful design, bright colors, soft studio lighting and flowing coral ribbons.',
  },
];

function Toggle({ active, onChange, label, accent = 'violet' }) {
  return (
    <button
      type="button"
      className={`flow-toggle is-${accent} ${active ? 'is-active' : ''}`}
      aria-label={label}
      aria-pressed={active}
      onClick={() => onChange(!active)}
    >
      <span />
    </button>
  );
}

function StyleControl({ icon: Icon, label, value, onRandomize }) {
  return (
    <button type="button" className="flow-style-control" onClick={onRandomize}>
      <span><Icon size={18} /></span>
      <span><small>{label}</small><strong>{value}</strong></span>
    </button>
  );
}

export default function FlowStateView({ onBack, onNavigate }) {
  const promptRef = useRef(null);
  const [prompt, setPrompt] = useState('');
  const [dimension, setDimension] = useState('1:1');
  const [promptEnhance, setPromptEnhance] = useState(true);
  const [privateMode, setPrivateMode] = useState(false);
  const [scrollToGenerate, setScrollToGenerate] = useState(true);
  const [generated, setGenerated] = useState(false);
  const [styles, setStyles] = useState({
    vibe: 'Randomize',
    lighting: 'Randomize',
    shot: 'Randomize',
    color: 'Randomize',
  });

  const randomizeStyle = (key) => {
    const values = STYLE_OPTIONS[key];
    const currentIndex = values.indexOf(styles[key]);
    const nextValue = values[(currentIndex + 1) % values.length];
    setStyles((current) => ({ ...current, [key]: nextValue }));
  };

  const clearStyles = () => {
    setStyles({
      vibe: 'Randomize',
      lighting: 'Randomize',
      shot: 'Randomize',
      color: 'Randomize',
    });
  };

  const resetDefaults = () => {
    clearStyles();
    setDimension('1:1');
    setPromptEnhance(true);
    setPrivateMode(false);
    setScrollToGenerate(true);
  };

  const usePrompt = (value) => {
    setPrompt(value);
    setGenerated(false);
    requestAnimationFrame(() => {
      promptRef.current?.focus();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  const enhancePrompt = () => {
    const cleanPrompt = prompt.trim();
    if (!cleanPrompt) return;
    const suffix = 'cinematic composition, refined materials, balanced lighting, premium detail';
    if (!cleanPrompt.toLowerCase().includes('cinematic composition')) {
      setPrompt(`${cleanPrompt}, ${suffix}`);
    }
  };

  const generate = (event) => {
    event.preventDefault();
    if (!prompt.trim()) return;
    setGenerated(true);
  };

  return (
    <div className="flow-state-view">
      <header className="flow-topbar">
        <button type="button" className="flow-brand" onClick={onBack} aria-label="Back to home">
          <ArrowLeft size={17} />
          <strong>LUMINA.AI</strong>
        </button>

        <div className="flow-title">
          <strong>AI Creation</strong>
          <CircleHelp size={14} />
        </div>

        <div className="flow-account">
          <span><Coins size={12} /> 150</span>
          <button type="button"><Shield size={12} /> Upgrade</button>
        </div>
      </header>

      <aside className="flow-settings" aria-label="Flow State settings">
        <div className="flow-mode-card">
          <span><small>Mode</small><strong>Flow State</strong></span>
          <Lock size={16} />
        </div>

        <div className="flow-settings-heading">
          <strong>Style</strong>
          <button type="button" onClick={clearStyles}><Wand2 size={12} /> Clear all</button>
        </div>

        <div className="flow-style-stack">
          <StyleControl icon={Wand2} label="Vibe" value={styles.vibe} onRandomize={() => randomizeStyle('vibe')} />
          <StyleControl icon={Lightbulb} label="Lighting" value={styles.lighting} onRandomize={() => randomizeStyle('lighting')} />
          <StyleControl icon={Aperture} label="Shot Type" value={styles.shot} onRandomize={() => randomizeStyle('shot')} />
          <StyleControl icon={Palette} label="Color Theme" value={styles.color} onRandomize={() => randomizeStyle('color')} />
        </div>

        <div className="flow-dimensions">
          <strong>Image Dimensions</strong>
          <div>
            {[
              ['2:3', 'portrait'],
              ['1:1', 'square'],
              ['16:9', 'landscape'],
              ['Custom', 'custom'],
            ].map(([label, shape]) => (
              <button
                type="button"
                key={label}
                className={dimension === label ? 'is-active' : ''}
                onClick={() => setDimension(label)}
              >
                <span className={`flow-dimension-icon is-${shape}`} />
                <small>{label}</small>
              </button>
            ))}
          </div>
        </div>

        <div className="flow-toggle-list">
          <div>
            <span>Prompt Enhance <CircleHelp size={12} /></span>
            <Toggle active={promptEnhance} onChange={setPromptEnhance} label="Prompt Enhance" />
          </div>
          <div>
            <span>Private Mode <CircleHelp size={12} /></span>
            <span className="flow-private-control">
              <Shield size={13} />
              <Toggle active={privateMode} onChange={setPrivateMode} label="Private Mode" accent="neutral" />
            </span>
          </div>
          <div>
            <span>Scroll to Generate <CircleHelp size={12} /></span>
            <Toggle active={scrollToGenerate} onChange={setScrollToGenerate} label="Scroll to Generate" />
          </div>
        </div>

        <button type="button" className="flow-reset" onClick={resetDefaults}>
          <RefreshCcw size={14} />
          Reset to Defaults
        </button>
      </aside>

      <main className="flow-canvas">
        <div className="flow-workspace">
          <form className="flow-prompt" onSubmit={generate}>
            <input
              ref={promptRef}
              value={prompt}
              onChange={(event) => {
                setPrompt(event.target.value);
                setGenerated(false);
              }}
              placeholder="Type a prompt..."
              aria-label="Flow State prompt"
            />
            <em>1 token per image</em>
            <button
              type="button"
              className="flow-enhance"
              aria-label="Enhance Flow State prompt"
              onClick={enhancePrompt}
              disabled={!prompt.trim()}
            >
              <Sparkles size={16} />
            </button>
            <button type="submit" className="flow-generate" disabled={!prompt.trim()}>
              {generated ? 'Generated' : 'Generate'}
            </button>
          </form>

          <nav className="flow-tabs" aria-label="Creation mode">
            {FLOW_TABS.map(({ label, icon: Icon, badge }) => (
              <button
                type="button"
                key={label}
                className={label === 'Flow State' ? 'is-active' : ''}
                onClick={() => label !== 'Flow State' && onNavigate(label)}
              >
                <Icon size={14} />
                <span>{label}</span>
                {badge && <small>{badge}</small>}
              </button>
            ))}
          </nav>

          <h1>LOOKING FOR INSPIRATION?</h1>

          <section className="flow-inspiration-grid">
            {INSPIRATIONS.map((item) => (
              <article className="flow-inspiration-card" key={item.id}>
                <div
                  className={`flow-inspiration-art flow-inspiration-art--${item.id}`}
                  style={{ backgroundImage: `url(${flowReference})` }}
                  aria-label={`Flow State inspiration ${item.id}`}
                />
                <div className="flow-inspiration-footer">
                  <p>{item.prompt}</p>
                  <button type="button" onClick={() => usePrompt(item.prompt)}>Use Prompt</button>
                </div>
              </article>
            ))}
          </section>
        </div>
      </main>

      {generated && (
        <div className="flow-generated-toast" role="status">
          <Sparkles size={14} />
          Flow State generation prepared in {dimension}
        </div>
      )}

      <button type="button" className="flow-chat" aria-label="Open help chat">
        <MessageSquare size={19} />
      </button>
    </div>
  );
}
