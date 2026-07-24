import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Bot,
  ChevronRight,
  CircleHelp,
  Code2,
  ExternalLink,
  Home,
  Inbox,
  LoaderCircle,
  MessageCircle,
  MessagesSquare,
  Search,
  Send,
  Sparkles,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import heroArtwork from './assets/hero-cinematic.png';
import LuminaLogo from './LuminaLogo.jsx';
import './AiAssistant.css';

const STORAGE_KEY = 'lumina-ai-assistant-messages';

const HELP_COLLECTIONS = [
  {
    id: 'account',
    title: 'Account Management',
    description: 'Manage your account, login, subscriptions, billing, tokens, and more',
    count: 13,
    icon: Users,
    articles: [
      'How to manage your Lumina account',
      'Plans, subscriptions, and billing',
      'Fast tokens and token rollover',
    ],
  },
  {
    id: 'faq',
    title: 'FAQ',
    description: 'Commercial usage, image privacy, sharing, and troubleshooting',
    count: 6,
    icon: CircleHelp,
    articles: [
      'Frequently Asked Questions',
      'Can I use generated images commercially?',
      'Image privacy and sharing',
    ],
  },
  {
    id: 'guides',
    title: 'Help Guides',
    description: 'Learn how to use Lumina AI',
    count: 22,
    icon: BookOpen,
    articles: [
      'How to Generate Images with Lumina AI',
      'How to Write Great Text-to-Image Prompts',
      'Flow State',
      'Blueprints and reusable workflows',
    ],
  },
  {
    id: 'releases',
    title: 'Feature releases',
    description: 'New features and product updates',
    count: 5,
    icon: Sparkles,
    articles: [
      'What’s new in Lumina AI',
      'New image generation models',
      'Upscaler improvements',
    ],
  },
];

const QUICK_ARTICLES = [
  'How to Generate Images with Lumina AI',
  'How to Write Great Text-to-Image Prompts',
  'Frequently Asked Questions',
  'Flow State',
];

function createMessage(role, content) {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    role,
    content,
    createdAt: new Date().toISOString(),
  };
}

function loadMessages() {
  try {
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]');
    if (!Array.isArray(stored)) return [];
    return stored
      .filter((message) => ['user', 'assistant'].includes(message?.role) && typeof message?.content === 'string')
      .slice(-40);
  } catch {
    return [];
  }
}

function AssistantBottomNav({ active, onSelect }) {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'messages', label: 'Messages', icon: MessagesSquare },
    { id: 'help', label: 'Help', icon: CircleHelp },
  ];

  return (
    <nav className="ai-assistant-nav" aria-label="Assistant navigation">
      {tabs.map(({ id, label, icon: Icon }) => (
        <button
          type="button"
          key={id}
          className={active === id || (id === 'messages' && active === 'chat') ? 'is-active' : ''}
          onClick={() => onSelect(id)}
        >
          <Icon size={21} strokeWidth={1.8} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}

function HomeView({ onAsk, onHelp }) {
  const [query, setQuery] = useState('');
  const visibleArticles = QUICK_ARTICLES.filter((article) => (
    article.toLowerCase().includes(query.trim().toLowerCase())
  ));

  return (
    <div className="ai-assistant-home">
      <section className="ai-assistant-hero" style={{ backgroundImage: `url(${heroArtwork})` }}>
        <div className="ai-assistant-hero-shade" />
        <div className="ai-assistant-brandline">
          <span><LuminaLogo size={25} /> LUMINA.AI</span>
          <div className="ai-assistant-team" aria-label="Lumina assistant team">
            <i>LA</i><i>AI</i><b>L</b>
          </div>
        </div>
        <h2>Hi dexer1! <span>👋</span><br />How can we help?</h2>
      </section>

      <div className="ai-assistant-home-content">
        <button type="button" className="ai-assistant-ask-card" onClick={() => onAsk()}>
          <span>
            <strong>Ask a question</strong>
            <small>AI agent can help with Lumina and your prompts</small>
          </span>
          <span className="ai-assistant-ask-avatars"><Bot size={18} /><Sparkles size={18} /></span>
        </button>

        <section className="ai-assistant-links">
          <button type="button" onClick={() => onHelp('community')}>
            <span>Ask the community</span><ExternalLink size={15} />
          </button>
          <button type="button" onClick={() => onHelp('api')}>
            <span>API Guide (For Developers)</span><ExternalLink size={15} />
          </button>
          <button type="button" onClick={() => onAsk('I want to share feedback about Lumina AI: ')}>
            <span>Share your feedback!</span><ExternalLink size={15} />
          </button>
        </section>

        <section className="ai-assistant-search-card">
          <label>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search for help"
              aria-label="Search help articles"
            />
            <Search size={18} />
          </label>
          <div>
            {(query ? visibleArticles : QUICK_ARTICLES).map((article) => (
              <button type="button" key={article} onClick={() => onAsk(`Help me with: ${article}`)}>
                <span>{article}</span><ChevronRight size={17} />
              </button>
            ))}
            {query && !visibleArticles.length && (
              <p className="ai-assistant-no-results">No matching articles. Ask the AI assistant instead.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function MessagesView({ messages, onAsk, onContinue, onClear }) {
  const lastMessage = messages[messages.length - 1];

  return (
    <div className="ai-assistant-simple-view">
      <header>
        <h2>Messages</h2>
      </header>
      {messages.length ? (
        <div className="ai-assistant-thread-list">
          <button type="button" className="ai-assistant-thread-card" onClick={onContinue}>
            <span className="ai-assistant-thread-icon"><MessageCircle size={21} /></span>
            <span>
              <strong>Lumina Assistant</strong>
              <small>{lastMessage.content}</small>
            </span>
            <ChevronRight size={18} />
          </button>
          <button type="button" className="ai-assistant-clear" onClick={onClear}>
            <Trash2 size={15} /> Clear conversation
          </button>
        </div>
      ) : (
        <div className="ai-assistant-empty">
          <Inbox size={31} />
          <h3>No messages</h3>
          <p>Your conversations with Lumina Assistant will be shown here.</p>
          <button type="button" onClick={() => onAsk()}>
            Ask a question <CircleHelp size={15} />
          </button>
        </div>
      )}
    </div>
  );
}

function HelpView({ onAsk, initialQuery = '' }) {
  const [query, setQuery] = useState(initialQuery);
  const normalized = query.trim().toLowerCase();
  const filtered = useMemo(() => HELP_COLLECTIONS
    .map((collection) => ({
      ...collection,
      articles: normalized
        ? collection.articles.filter((article) => article.toLowerCase().includes(normalized))
        : collection.articles,
    }))
    .filter((collection) => (
      !normalized
      || collection.title.toLowerCase().includes(normalized)
      || collection.description.toLowerCase().includes(normalized)
      || collection.articles.length
    )), [normalized]);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  return (
    <div className="ai-assistant-simple-view ai-assistant-help">
      <header>
        <h2>Help</h2>
        <label>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search for help"
            aria-label="Search help collections"
          />
          <Search size={18} />
        </label>
      </header>
      <div className="ai-assistant-help-count">{filtered.length} collections</div>
      <div className="ai-assistant-collections">
        {filtered.map(({ id, title, description, count, icon: Icon, articles }) => (
          <section key={id}>
            <button type="button" onClick={() => onAsk(`Tell me about ${title}: ${articles[0] || description}`)}>
              <span className="ai-assistant-collection-icon"><Icon size={19} /></span>
              <span>
                <strong>{title}</strong>
                <small>{description}</small>
                <em>{count} articles</em>
              </span>
              <ChevronRight size={18} />
            </button>
          </section>
        ))}
        {!filtered.length && (
          <div className="ai-assistant-no-results ai-assistant-help-empty">
            Nothing found. Try a different phrase or ask the AI assistant.
          </div>
        )}
      </div>
    </div>
  );
}

function ChatView({
  messages,
  input,
  setInput,
  loading,
  error,
  status,
  onBack,
  onSubmit,
  scrollRef,
}) {
  return (
    <div className="ai-assistant-chat-view">
      <header>
        <button type="button" onClick={onBack} aria-label="Back to messages"><ArrowLeft size={19} /></button>
        <span>
          <strong>Lumina Assistant</strong>
          <small>
            <i className={status?.configured ? 'is-online' : ''} />
            {status?.configured ? `${status.provider} · ${status.model}` : 'API setup required'}
          </small>
        </span>
      </header>

      <div className="ai-assistant-conversation" ref={scrollRef}>
        {!messages.length && (
          <section className="ai-assistant-chat-welcome">
            <span><LuminaLogo size={29} /></span>
            <h3>How can I help?</h3>
            <p>Ask about creating images, prompts, Blueprints, Flow State, upscaling, plans, or the Lumina API.</p>
            <div>
              {[
                'Improve my image prompt',
                'How does Flow State work?',
                'Help me choose an image style',
              ].map((suggestion) => (
                <button type="button" key={suggestion} onClick={() => setInput(suggestion)}>
                  {suggestion}
                </button>
              ))}
            </div>
          </section>
        )}

        {messages.map((message) => (
          <div key={message.id} className={`ai-assistant-message ai-assistant-message--${message.role}`}>
            {message.role === 'assistant' && <span className="ai-assistant-avatar"><LuminaLogo size={17} /></span>}
            <p>{message.content}</p>
          </div>
        ))}

        {loading && (
          <div className="ai-assistant-message ai-assistant-message--assistant">
            <span className="ai-assistant-avatar"><LuminaLogo size={17} /></span>
            <p className="ai-assistant-typing"><i /><i /><i /></p>
          </div>
        )}
      </div>

      <div className="ai-assistant-composer-wrap">
        {error && <p className="ai-assistant-error">{error}</p>}
        {!status?.configured && status && (
          <p className="ai-assistant-config-note">
            Add an AI key to <code>.env.local</code>, then restart the server.
          </p>
        )}
        <form className="ai-assistant-composer" onSubmit={onSubmit}>
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                onSubmit(event);
              }
            }}
            placeholder="Ask Lumina Assistant..."
            aria-label="Message Lumina Assistant"
            rows={1}
            disabled={loading}
          />
          <button type="submit" disabled={!input.trim() || loading} aria-label="Send message">
            {loading ? <LoaderCircle className="ai-assistant-spinner" size={18} /> : <Send size={18} />}
          </button>
        </form>
        <small>AI can make mistakes. Check important information.</small>
      </div>
    </div>
  );
}

export default function AiAssistant() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState('home');
  const [messages, setMessages] = useState(loadMessages);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState(null);
  const [helpQuery, setHelpQuery] = useState('');
  const scrollRef = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => {
    const openAssistant = (event) => {
      setOpen(true);
      if (event?.detail?.view) setView(event.detail.view);
      if (event?.detail?.prefill) setInput(event.detail.prefill);
    };
    window.addEventListener('lumina:assistant:open', openAssistant);
    return () => window.removeEventListener('lumina:assistant:open', openAssistant);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-40)));
  }, [messages]);

  useEffect(() => {
    if (!open || status) return;
    fetch('/api/ai/status')
      .then((response) => response.json())
      .then((result) => setStatus(result))
      .catch(() => setStatus({
        configured: false,
        provider: '',
        model: '',
        message: 'Не вдалося перевірити налаштування AI.',
      }));
  }, [open, status]);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading, view]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const openChat = (prefill = '') => {
    setOpen(true);
    setView('chat');
    setError('');
    if (prefill) setInput(prefill);
  };

  const openHelp = (topic) => {
    setHelpQuery(topic === 'api' ? 'API' : topic === 'community' ? 'FAQ' : '');
    setView('help');
  };

  const clearConversation = () => {
    abortRef.current?.abort();
    setMessages([]);
    setLoading(false);
    setError('');
  };

  const submitMessage = async (event) => {
    event?.preventDefault?.();
    const content = input.trim();
    if (!content || loading) return;

    const userMessage = createMessage('user', content);
    const nextMessages = [...messages, userMessage].slice(-24);
    setMessages(nextMessages);
    setInput('');
    setError('');
    setLoading(true);
    setView('chat');

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages.map(({ role, content: messageContent }) => ({
            role,
            content: messageContent,
          })),
        }),
        signal: controller.signal,
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result?.error?.message || `AI request failed (HTTP ${response.status}).`);
      }

      setMessages((current) => [...current, createMessage('assistant', result.message)]);
      setStatus((current) => ({
        ...(current || {}),
        configured: true,
        provider: result.provider,
        model: result.model,
      }));
    } catch (requestError) {
      if (requestError?.name !== 'AbortError') {
        setError(requestError?.message || 'Не вдалося отримати відповідь. Спробуйте ще раз.');
      }
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
      setLoading(false);
    }
  };

  const closeAssistant = () => {
    setOpen(false);
    setError('');
  };

  return (
    <>
      <button
        type="button"
        className={`ai-assistant-launcher ${open ? 'is-hidden' : ''}`}
        onClick={() => setOpen(true)}
        aria-label="Open Lumina AI assistant"
      >
        <MessageCircle size={23} />
        <span>AI</span>
      </button>

      {open && (
        <aside className="ai-assistant-panel" role="dialog" aria-modal="false" aria-label="Lumina AI assistant">
          <button type="button" className="ai-assistant-close" onClick={closeAssistant} aria-label="Close assistant">
            <X size={19} />
          </button>

          <div className={`ai-assistant-body ${view === 'chat' ? 'ai-assistant-body--full' : ''}`}>
            {view === 'home' && <HomeView onAsk={openChat} onHelp={openHelp} />}
            {view === 'messages' && (
              <MessagesView
                messages={messages}
                onAsk={openChat}
                onContinue={() => setView('chat')}
                onClear={clearConversation}
              />
            )}
            {view === 'help' && <HelpView onAsk={openChat} initialQuery={helpQuery} />}
            {view === 'chat' && (
              <ChatView
                messages={messages}
                input={input}
                setInput={setInput}
                loading={loading}
                error={error}
                status={status}
                onBack={() => setView('messages')}
                onSubmit={submitMessage}
                scrollRef={scrollRef}
              />
            )}
          </div>

          {view !== 'chat' && <AssistantBottomNav active={view} onSelect={setView} />}
        </aside>
      )}
    </>
  );
}
