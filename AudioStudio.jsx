import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  AudioLines,
  BadgeCheck,
  ChevronDown,
  CircleHelp,
  Coins,
  GitBranch,
  Globe2,
  Image as ImageIcon,
  Music2,
  Pause,
  Play,
  RefreshCcw,
  Search,
  Video,
  Workflow,
} from 'lucide-react';
import './AudioStudio.css';
import LuminaLogo from './LuminaLogo.jsx';

const AUDIO_TABS = [
  { label: 'Image', icon: ImageIcon },
  { label: 'Video', icon: Video },
  { label: 'Audio', icon: AudioLines, badge: 'New' },
  { label: '3D', icon: Globe2 },
  { label: 'Flow State', icon: Workflow },
  { label: 'Blueprints', icon: GitBranch },
];

const COLLECTIONS = ['No collection', 'Music concepts', 'Campaign audio', 'Favorites'];

function formatDuration(seconds) {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return remainder ? `${minutes}m ${remainder}s` : `${minutes}m`;
}

function Toggle({ active, onClick, label }) {
  return (
    <button
      type="button"
      className={`audio-toggle ${active ? 'is-active' : ''}`}
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
    >
      <span />
    </button>
  );
}

function Waveform({ seed }) {
  const bars = useMemo(
    () => Array.from({ length: 36 }, (_, index) => 6 + ((index * 13 + seed * 9) % 24)),
    [seed],
  );

  return (
    <div className="audio-waveform" aria-hidden="true">
      {bars.map((height, index) => <i key={index} style={{ height }} />)}
    </div>
  );
}

export default function AudioStudio({ onBack, onOpenImage, onNavigate }) {
  const [prompt, setPrompt] = useState('');
  const [duration, setDuration] = useState(60);
  const [generationCount, setGenerationCount] = useState(1);
  const [instrumentalOnly, setInstrumentalOnly] = useState(false);
  const [privateMode, setPrivateMode] = useState(false);
  const [legacyMode, setLegacyMode] = useState(false);
  const [collection, setCollection] = useState(COLLECTIONS[0]);
  const [collectionOpen, setCollectionOpen] = useState(false);
  const [generations, setGenerations] = useState([]);
  const [playingTrack, setPlayingTrack] = useState(null);
  const promptInputRef = useRef(null);
  const playbackRef = useRef(null);

  const stopPlayback = () => {
    const playback = playbackRef.current;
    playbackRef.current = null;
    if (playback) {
      window.clearTimeout(playback.timer);
      try { playback.oscillator.stop(); } catch { /* already stopped */ }
      playback.context.close().catch(() => {});
    }
    setPlayingTrack(null);
  };

  useEffect(() => () => {
    const playback = playbackRef.current;
    if (!playback) return;
    window.clearTimeout(playback.timer);
    try { playback.oscillator.stop(); } catch { /* already stopped */ }
    playback.context.close().catch(() => {});
  }, []);

  const togglePlayback = (index) => {
    if (playingTrack === index) {
      stopPlayback();
      return;
    }

    stopPlayback();
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      setPlayingTrack(index);
      return;
    }

    const context = new AudioContextClass();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = index % 2 ? 'triangle' : 'sine';
    oscillator.frequency.value = 180 + (index * 55);
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.045, context.currentTime + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 3.8);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    setPlayingTrack(index);

    const timer = window.setTimeout(() => {
      if (playbackRef.current?.oscillator === oscillator) {
        playbackRef.current = null;
        setPlayingTrack(null);
        oscillator.stop();
        context.close().catch(() => {});
      }
    }, 4000);
    playbackRef.current = { context, oscillator, timer };
  };

  const resetSettings = () => {
    setDuration(60);
    setGenerationCount(1);
    setInstrumentalOnly(false);
    setPrivateMode(false);
    setCollection(COLLECTIONS[0]);
  };

  const generateAudio = (event) => {
    event.preventDefault();
    const cleanPrompt = prompt.trim();
    if (!cleanPrompt) return;

    setGenerations(Array.from({ length: generationCount }, (_, index) => ({
      id: `${Date.now()}-${index}`,
      prompt: cleanPrompt,
      duration,
      instrumentalOnly,
      privateMode,
      collection,
    })));
  };

  return (
    <div className="audio-studio">
      <header className="audio-topbar">
        <button type="button" className="audio-brand" onClick={onBack} aria-label="Back to home">
          <ArrowLeft size={19} />
          <LuminaLogo size={19} className="audio-brand-mark" />
          <strong>LUMINA.AI</strong>
        </button>

        <div className="audio-page-title">
          <strong>AI Creation</strong>
          <CircleHelp size={15} />
          <span className="audio-credit"><Coins size={14} /> 150</span>
          <button type="button" className="audio-upgrade" onClick={() => onNavigate?.('Plans')}><BadgeCheck size={13} /> Upgrade</button>
        </div>

        <div className="audio-legacy">
          <span>Legacy Mode</span>
          <CircleHelp size={13} />
          <Toggle active={legacyMode} onClick={() => setLegacyMode((value) => !value)} label="Legacy Mode" />
        </div>
      </header>

      <div className="audio-layout">
        <aside className="audio-settings" aria-label="Audio settings">
          <div className="audio-model-card">
            <span className="audio-model-art"><Music2 size={17} /></span>
            <span><small>Model</small><strong>Music</strong></span>
            <ChevronDown size={14} />
          </div>

          <div className="audio-control-group">
            <div className="audio-setting-title">
              <span>Duration <CircleHelp size={13} /></span>
              <strong>{formatDuration(duration)}</strong>
            </div>
            <input
              className="audio-range"
              type="range"
              min="15"
              max="240"
              step="15"
              value={duration}
              aria-label="Audio duration"
              style={{ '--range-progress': `${((duration - 15) / 225) * 100}%` }}
              onChange={(event) => setDuration(Number(event.target.value))}
            />
          </div>

          <div className="audio-control-group">
            <div className="audio-setting-title">
              <span>Number of generations <CircleHelp size={13} /></span>
            </div>
            <div className="audio-count-grid">
              {[1, 2, 3, 4].map((count) => (
                <button
                  type="button"
                  key={count}
                  className={generationCount === count ? 'is-active' : ''}
                  onClick={() => setGenerationCount(count)}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>

          <div className="audio-switch-row">
            <span>Instrumental only <CircleHelp size={13} /></span>
            <Toggle
              active={instrumentalOnly}
              onClick={() => setInstrumentalOnly((value) => !value)}
              label="Instrumental only"
            />
          </div>

          <div className="audio-switch-row">
            <span>Private Mode <CircleHelp size={13} /></span>
            <div className="audio-private-control">
              <BadgeCheck size={18} />
              <Toggle
                active={privateMode}
                onClick={() => setPrivateMode((value) => !value)}
                label="Private Mode"
              />
            </div>
          </div>

          <div className="audio-collection">
            <button
              type="button"
              className="audio-collection-trigger"
              aria-expanded={collectionOpen}
              onClick={() => setCollectionOpen((value) => !value)}
            >
              <span>Add to Collection <CircleHelp size={13} /></span>
              <ChevronDown size={14} className={collectionOpen ? 'is-open' : ''} />
            </button>
            {collectionOpen && (
              <div className="audio-collection-menu">
                {COLLECTIONS.map((item) => (
                  <button
                    type="button"
                    key={item}
                    className={collection === item ? 'is-active' : ''}
                    onClick={() => {
                      setCollection(item);
                      setCollectionOpen(false);
                    }}
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
            {collection !== COLLECTIONS[0] && <small className="audio-selected-collection">{collection}</small>}
          </div>

          <button type="button" className="audio-reset" onClick={resetSettings}>
            <RefreshCcw size={15} /> Reset to Defaults
          </button>
        </aside>

        <main className="audio-workspace">
          <form className="audio-prompt" onSubmit={generateAudio}>
            <input
              ref={promptInputRef}
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Type a prompt..."
              aria-label="Audio prompt"
            />
            <button type="submit" className="audio-generate" disabled={!prompt.trim()}>
              Generate <Coins size={14} /> <span>700</span>
            </button>
          </form>

          <nav className="audio-type-tabs" aria-label="Creation type">
            {AUDIO_TABS.map(({ label, icon: Icon, badge }) => (
              <button
                type="button"
                key={label}
                className={label === 'Audio' ? 'is-active' : ''}
                onClick={() => {
                  if (label === 'Image') onOpenImage?.();
                  else if (label !== 'Audio') onNavigate?.(label);
                }}
              >
                <Icon size={15} />
                <span>{label}</span>
                {badge && <small>{badge}</small>}
              </button>
            ))}
          </nav>

          {generations.length === 0 ? (
            <div className="audio-empty-state">
              <span className="audio-empty-icon"><Music2 size={22} /></span>
              <span>
                <strong>Create your first track</strong>
                <small>Describe a mood, scene, or sound above to start generating audio.</small>
              </span>
            </div>
          ) : (
            <section className="audio-results" aria-live="polite">
              <div className="audio-results-heading">
                <div><small>RECENT CREATION</small><h1>Your audio generations</h1></div>
                <span>{generations.length} track{generations.length > 1 ? 's' : ''}</span>
              </div>
              <div className="audio-result-grid">
                {generations.map((item, index) => (
                  <article className={`audio-result-card ${playingTrack === index ? 'is-playing' : ''}`} key={item.id}>
                    <button
                      type="button"
                      className="audio-play"
                      aria-label={`${playingTrack === index ? 'Pause' : 'Play'} track ${index + 1}`}
                      aria-pressed={playingTrack === index}
                      onClick={() => togglePlayback(index)}
                    >
                      {playingTrack === index ? <Pause size={17} fill="currentColor" /> : <Play size={17} fill="currentColor" />}
                    </button>
                    <div className="audio-result-copy">
                      <strong>Generation {index + 1}</strong>
                      <p>{item.prompt}</p>
                      <span>{formatDuration(item.duration)} · {item.instrumentalOnly ? 'Instrumental' : 'Music'}{item.privateMode ? ' · Private' : ''}</span>
                    </div>
                    <Waveform seed={index + 1} />
                  </article>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>

      <button
        type="button"
        className="audio-search"
        aria-label="Search"
        onClick={() => {
          promptInputRef.current?.focus();
          promptInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }}
      >
        <Search size={22} />
      </button>
    </div>
  );
}
