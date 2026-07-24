import React, { useEffect, useState } from 'react';
import {
  Apple,
  Bot,
  Box,
  Facebook,
  Globe2,
  GraduationCap,
  LifeBuoy,
  MessageCircle,
  MessageSquare,
  Network,
  PanelsTopLeft,
  PenTool,
  Play,
  Workflow,
  X,
} from 'lucide-react';
import './MorePanel.css';

const TOOL_ITEMS = [
  {
    id: 'canvas',
    title: 'Realtime Canvas',
    description: 'Turn your sketches into art',
    icon: PanelsTopLeft,
    destination: 'Image',
  },
  {
    id: 'realtime',
    title: 'Realtime Generation',
    description: 'Generates images as you type',
    icon: Network,
    destination: 'Image',
  },
  {
    id: 'editor',
    title: 'Canvas Editor',
    description: 'Edit and refine AI creations',
    icon: PenTool,
    destination: 'Image',
  },
  {
    id: 'models',
    title: 'Models & Training',
    description: 'Customize, train, and discover models',
    icon: Box,
    destination: 'Library',
  },
];

const SUPPORT_ITEMS = [
  {
    id: 'learn',
    title: 'Learn',
    description: 'Explore tutorials and walkthroughs',
    icon: GraduationCap,
    message: 'Learning center is ready to explore.',
  },
  {
    id: 'help',
    title: 'FAQ and Help',
    description: 'Find answers and get support',
    icon: LifeBuoy,
    message: 'Help center opened.',
  },
  {
    id: 'feedback',
    title: 'Feedback',
    description: 'Share ideas and report issues',
    icon: MessageSquare,
    message: 'Feedback channel opened.',
  },
];

export default function MorePanel({ open, onClose, onNavigate, compact = false }) {
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!open) setMessage('');
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onClose, open]);

  if (!open) return null;

  const selectItem = (item) => {
    if (item.destination) {
      onClose();
      onNavigate(item.destination);
      return;
    }
    setMessage(item.message);
  };

  return (
    <>
      <button type="button" className="more-panel-scrim" onClick={onClose} aria-label="Close More menu" />
      <aside className={`more-panel ${compact ? 'more-panel--compact' : ''}`} aria-label="More menu">
        <header className="more-panel-header">
          <strong>LUMINA.AI</strong>
          <button type="button" onClick={onClose} aria-label="Close More panel">
            <X size={15} />
          </button>
        </header>

        <nav className="more-panel-links" aria-label="More tools">
          {TOOL_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button type="button" key={item.id} onClick={() => selectItem(item)}>
                <Icon size={18} strokeWidth={1.65} />
                <span>
                  <strong>{item.title}</strong>
                  <small>{item.description}</small>
                </span>
              </button>
            );
          })}

          <i />

          {SUPPORT_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button type="button" key={item.id} onClick={() => selectItem(item)}>
                <Icon size={18} strokeWidth={1.65} />
                <span>
                  <strong>{item.title}</strong>
                  <small>{item.description}</small>
                </span>
              </button>
            );
          })}
        </nav>

        {message && (
          <div className="more-panel-message" role="status">
            <MessageCircle size={14} />
            <span>{message}</span>
          </div>
        )}

        <footer className="more-panel-footer">
          <div className="more-panel-legal">
            <button type="button" onClick={() => setMessage('Terms of service opened.')}>Terms</button>
            <i />
            <button type="button" onClick={() => setMessage('DMCA information opened.')}>DMCA</button>
            <i />
            <button type="button" onClick={() => setMessage('Affiliate program opened.')}>Affiliates</button>
          </div>
          <div className="more-panel-socials">
            <button type="button" aria-label="Lumina website"><Globe2 size={17} /></button>
            <button type="button" aria-label="Discord"><MessageCircle size={17} /></button>
            <button type="button" aria-label="Community"><Bot size={17} /></button>
            <button type="button" aria-label="X"><strong>𝕏</strong></button>
            <button type="button" aria-label="Facebook"><Facebook size={17} fill="currentColor" /></button>
            <button type="button" aria-label="Apple app"><Apple size={17} fill="currentColor" /></button>
            <button type="button" aria-label="Google Play"><Play size={17} fill="currentColor" /></button>
          </div>
        </footer>
      </aside>
    </>
  );
}
