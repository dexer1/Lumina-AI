import React, { useEffect, useState } from 'react';
import {
  Bell,
  Check,
  ChevronRight,
  CircleUserRound,
  Eye,
  LogIn,
  Save,
  Settings,
  UserPlus,
  X,
} from 'lucide-react';
import { UI_ACTION_EVENT, showUiToast } from './uiActions.js';
import './UiActionCenter.css';

const DEFAULT_PREFERENCES = {
  notifications: true,
  autoplay: false,
  compact: false,
};

function ActionIcon({ type }) {
  if (type === 'signup') return <UserPlus size={24} />;
  if (type === 'signin') return <LogIn size={24} />;
  if (type === 'notifications') return <Bell size={24} />;
  if (type === 'settings') return <Settings size={24} />;
  if (type === 'preview') return <Eye size={24} />;
  return <CircleUserRound size={24} />;
}

export default function UiActionCenter() {
  const [action, setAction] = useState(null);
  const [toast, setToast] = useState(null);
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);

  useEffect(() => {
    const handleAction = (event) => {
      if (event.detail?.type === 'toast') {
        setToast({
          message: event.detail.message,
          tone: event.detail.tone || 'default',
        });
        return;
      }
      setAction(event.detail || null);
    };
    window.addEventListener(UI_ACTION_EVENT, handleAction);
    return () => window.removeEventListener(UI_ACTION_EVENT, handleAction);
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const close = () => setAction(null);

  const submitAccount = (event) => {
    event.preventDefault();
    const isSignUp = action.type === 'signup';
    close();
    showUiToast(isSignUp ? 'Account created for this demo session.' : 'Signed in for this demo session.', 'success');
  };

  const renderContent = () => {
    if (action.type === 'signin' || action.type === 'signup') {
      const isSignUp = action.type === 'signup';
      return (
        <form className="ui-action-form" onSubmit={submitAccount}>
          {isSignUp && (
            <label>
              <span>Name</span>
              <input name="name" placeholder="Your name" required />
            </label>
          )}
          <label>
            <span>Email</span>
            <input name="email" type="email" placeholder="you@example.com" required />
          </label>
          <label>
            <span>Password</span>
            <input name="password" type="password" minLength={6} placeholder="At least 6 characters" required />
          </label>
          <button type="submit">{isSignUp ? 'Create account' : 'Sign in'}</button>
        </form>
      );
    }

    if (action.type === 'notifications') {
      return (
        <div className="ui-action-notifications">
          <article><i /><span><strong>Your Lumina workspace is ready</strong><small>All core creation tools are available.</small></span></article>
          <article><i /><span><strong>AI Assistant connected</strong><small>You can ask for prompt and workflow help.</small></span></article>
          <button type="button" onClick={() => {
            close();
            showUiToast('All notifications marked as read.', 'success');
          }}>
            <Check size={15} /> Mark all as read
          </button>
        </div>
      );
    }

    if (action.type === 'settings') {
      const options = [
        ['notifications', 'Product notifications', 'Receive important workspace updates'],
        ['autoplay', 'Autoplay previews', 'Automatically play generated media previews'],
        ['compact', 'Compact interface', 'Reduce spacing in galleries and controls'],
      ];
      return (
        <div className="ui-action-settings">
          {options.map(([key, title, description]) => (
            <button
              type="button"
              key={key}
              className={preferences[key] ? 'is-active' : ''}
              aria-pressed={preferences[key]}
              onClick={() => setPreferences((current) => ({ ...current, [key]: !current[key] }))}
            >
              <span><strong>{title}</strong><small>{description}</small></span>
              <i />
            </button>
          ))}
          <button type="button" className="ui-action-save" onClick={() => {
            close();
            showUiToast('Settings saved.', 'success');
          }}>
            <Save size={15} /> Save settings
          </button>
        </div>
      );
    }

    if (action.type === 'profile') {
      return (
        <div className="ui-action-profile">
          <div><b>D</b><span><strong>dexer1</strong><small>Lumina creator · 150 credits</small></span></div>
          <button type="button" onClick={() => setAction({ type: 'settings', title: 'Settings' })}>
            Account settings <ChevronRight size={16} />
          </button>
          <button type="button" onClick={() => {
            close();
            showUiToast('Signed out from this demo session.');
          }}>
            Sign out <ChevronRight size={16} />
          </button>
        </div>
      );
    }

    return (
      <div className="ui-action-preview">
        {action.artwork && <div className="ui-action-preview-art" style={{ backgroundImage: action.artwork }} />}
        <p>{action.message || 'This action is ready.'}</p>
        {action.meta && <small>{action.meta}</small>}
        <button type="button" onClick={close}>Done</button>
      </div>
    );
  };

  const title = action?.title
    || (action?.type === 'signin' ? 'Welcome back'
      : action?.type === 'signup' ? 'Create your Lumina account'
        : action?.type === 'notifications' ? 'Notifications'
          : action?.type === 'settings' ? 'Settings'
            : action?.type === 'profile' ? 'Your profile'
              : 'Preview');

  return (
    <>
      {action && (
        <div className="ui-action-backdrop" role="presentation" onMouseDown={close}>
          <section
            className="ui-action-dialog"
            role="dialog"
            aria-modal="true"
            aria-label={title}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header>
              <span><ActionIcon type={action.type} /></span>
              <div><h2>{title}</h2>{action.subtitle && <p>{action.subtitle}</p>}</div>
              <button type="button" onClick={close} aria-label="Close dialog"><X size={18} /></button>
            </header>
            {renderContent()}
          </section>
        </div>
      )}

      {toast && (
        <div className={`ui-action-toast ${toast.tone === 'success' ? 'is-success' : ''}`} role="status">
          {toast.tone === 'success' && <Check size={16} />}
          <span>{toast.message}</span>
        </div>
      )}
    </>
  );
}
