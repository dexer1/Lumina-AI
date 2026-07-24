import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Calculator,
  Check,
  Code2,
  Copy,
  ExternalLink,
  FileText,
  KeyRound,
  MessageCircle,
  MessageSquare,
  Send,
  X,
} from 'lucide-react';
import './ApiView.css';

const API_SNIPPET = `curl --request POST \\
  --url https://api.lumina.ai/v1/generations \\
  --header 'authorization: Bearer YOUR_API_KEY' \\
  --header 'content-type: application/json' \\
  --data '{"prompt":"A cinematic city at dusk"}'`;

const qualityOptions = {
  standard: { label: 'Standard', rate: 0.004 },
  high: { label: 'High quality', rate: 0.008 },
  ultra: { label: 'Ultra quality', rate: 0.016 },
};

function Dialog({ title, children, onClose, wide = false }) {
  return (
    <div className="api-dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className={`api-dialog ${wide ? 'api-dialog--wide' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button type="button" className="api-dialog-close" onClick={onClose} aria-label="Close dialog">
          <X size={17} />
        </button>
        <h2>{title}</h2>
        {children}
      </section>
    </div>
  );
}

export default function ApiView({ onBack }) {
  const [noticeVisible, setNoticeVisible] = useState(true);
  const [section, setSection] = useState('started');
  const [dialog, setDialog] = useState('');
  const [quantity, setQuantity] = useState(1000);
  const [quality, setQuality] = useState('standard');
  const [copied, setCopied] = useState(false);
  const [contactSent, setContactSent] = useState(false);

  const estimate = useMemo(
    () => (quantity * qualityOptions[quality].rate).toFixed(2),
    [quality, quantity],
  );

  const copySnippet = async () => {
    try {
      await navigator.clipboard.writeText(API_SNIPPET);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className={`api-view ${noticeVisible ? '' : 'api-view--notice-hidden'}`}>
      {noticeVisible && (
        <div className="api-notice" role="status">
          <span><AlertCircle size={14} /> Free trial API credit allocation is temporarily unavailable.</span>
          <button type="button" onClick={() => setNoticeVisible(false)} aria-label="Dismiss API notice">
            <X size={13} />
          </button>
        </div>
      )}

      <header className="api-topbar">
        <button type="button" className="api-brand" onClick={onBack} aria-label="Back to home">
          <ArrowLeft size={17} />
          <strong>LUMINA.AI</strong>
        </button>
        <h1>Lumina API</h1>
      </header>

      <aside className="api-sidebar" aria-label="API navigation">
        <section className="api-side-card">
          <h2>API Tools</h2>
          <div className="api-side-links">
            <button
              type="button"
              className={section === 'started' ? 'is-active' : ''}
              onClick={() => setSection('started')}
            >
              <Code2 size={15} />
              <span>Get Started</span>
            </button>
            <button
              type="button"
              className={section === 'pricing' ? 'is-active' : ''}
              onClick={() => setSection('pricing')}
            >
              <Calculator size={15} />
              <span>Pricing Calculator</span>
            </button>
          </div>
        </section>

        <section className="api-side-card api-support-card">
          <h2>Help and Support</h2>
          <div className="api-side-links">
            <button type="button" onClick={() => setDialog('docs')}>
              <FileText size={15} />
              <span>API Docs</span>
              <ExternalLink className="api-side-end" size={14} />
            </button>
            <button type="button" onClick={() => setDialog('contact')}>
              <MessageCircle size={15} />
              <span>Contact Us</span>
            </button>
          </div>
        </section>
      </aside>

      <main className="api-main">
        {section === 'started' ? (
          <section className="api-empty-state" aria-labelledby="api-start-title">
            <span className="api-code-icon" aria-hidden="true"><Code2 size={37} strokeWidth={2.15} /></span>
            <h2 id="api-start-title">Go from API key to first generation in minutes</h2>
            <p>Get $5 in free credit and start generating — no charge, no commitment.</p>
            <button type="button" className="api-primary-action" onClick={() => setDialog('access')}>
              Get API access
            </button>
          </section>
        ) : (
          <section className="api-calculator" aria-labelledby="api-calculator-title">
            <span className="api-calculator-icon"><Calculator size={22} /></span>
            <p className="api-eyebrow">PLAN YOUR USAGE</p>
            <h2 id="api-calculator-title">API Pricing Calculator</h2>
            <p className="api-calculator-copy">Estimate generation credits before you start building.</p>

            <label className="api-range-label" htmlFor="api-quantity">
              <span>Images per month</span>
              <strong>{quantity.toLocaleString()}</strong>
            </label>
            <input
              id="api-quantity"
              type="range"
              min="100"
              max="10000"
              step="100"
              value={quantity}
              onChange={(event) => setQuantity(Number(event.target.value))}
            />

            <div className="api-quality" aria-label="Generation quality">
              {Object.entries(qualityOptions).map(([value, option]) => (
                <button
                  type="button"
                  key={value}
                  className={quality === value ? 'is-active' : ''}
                  onClick={() => setQuality(value)}
                >
                  <span>{option.label}</span>
                  <small>${option.rate.toFixed(3)} / image</small>
                </button>
              ))}
            </div>

            <div className="api-estimate">
              <span>Estimated monthly credits</span>
              <strong>${estimate}</strong>
            </div>
            <button type="button" className="api-primary-action" onClick={() => setDialog('access')}>
              Get API access
            </button>
          </section>
        )}
      </main>

      <button type="button" className="api-chat" onClick={() => setDialog('contact')} aria-label="Open help chat">
        <MessageSquare size={20} />
      </button>

      {dialog === 'access' && (
        <Dialog title="Get API access" onClose={() => setDialog('')}>
          <span className="api-dialog-icon"><KeyRound size={22} /></span>
          <p>Connect your Lumina account to create API keys, manage credits and monitor generations.</p>
          <div className="api-access-steps">
            <span><Check size={14} /> Create a secure API key</span>
            <span><Check size={14} /> Receive $5 in starter credit when available</span>
            <span><Check size={14} /> Start with our generation endpoint</span>
          </div>
          <button type="button" className="api-dialog-action" onClick={() => setDialog('docs')}>
            Continue to quick start
          </button>
        </Dialog>
      )}

      {dialog === 'docs' && (
        <Dialog title="API quick start" onClose={() => setDialog('')} wide>
          <p>Send your first image generation request with a Lumina API key.</p>
          <div className="api-code-block">
            <pre>{API_SNIPPET}</pre>
            <button type="button" onClick={copySnippet} aria-label="Copy API example">
              {copied ? <Check size={15} /> : <Copy size={15} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </Dialog>
      )}

      {dialog === 'contact' && (
        <Dialog title={contactSent ? 'Message sent' : 'Contact API support'} onClose={() => {
          setDialog('');
          setContactSent(false);
        }}>
          {contactSent ? (
            <div className="api-contact-success">
              <span><Check size={24} /></span>
              <p>Thanks — the API team will get back to you shortly.</p>
            </div>
          ) : (
            <form className="api-contact-form" onSubmit={(event) => {
              event.preventDefault();
              setContactSent(true);
            }}>
              <label>
                Work email
                <input type="email" placeholder="you@company.com" required />
              </label>
              <label>
                How can we help?
                <textarea placeholder="Tell us about your API project..." required />
              </label>
              <button type="submit" className="api-dialog-action"><Send size={15} /> Send message</button>
            </form>
          )}
        </Dialog>
      )}
    </div>
  );
}
