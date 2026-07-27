import React, { useState } from 'react';
import { Search, ExternalLink, ArrowLeft, ArrowRight } from 'lucide-react';
import './BlueprintsView.css';
import { openAssistant, openUiAction, showUiToast } from './uiActions.js';

const FILTERS = [
  'All',
  'Creatives & Graphic Designers',
  'Marketing Professionals',
  'Content Creators',
  'Photographers & Videographers'
];

const MOCK_CARDS = [
  { id: 1, title: 'Creative Campaign Board', category: 'Marketing Professionals', span: 'col-2 row-2', bg: 'linear-gradient(145deg, #1f1f1f, #2a2a2a)', owned: true },
  { id: 2, title: 'Storyboard Sheet', category: 'Content Creators', span: 'col-1 row-1', bg: 'linear-gradient(145deg, #2a2c26, #3a3b35)', liked: true },
  { id: 3, title: 'Product Photography', category: 'Photographers & Videographers', span: 'col-1 row-1', bg: 'linear-gradient(145deg, #1b261b, #2b3b2b)', liked: true },
  { id: 4, title: 'Portrait Retouch', category: 'Photographers & Videographers', span: 'col-1 row-1', bg: 'linear-gradient(145deg, #2c2535, #3c3545)', owned: true },
  { id: 5, title: 'Concept Art', category: 'Creatives & Graphic Designers', span: 'col-1 row-1', bg: 'linear-gradient(145deg, #252b35, #353b45)' },
  { id: 6, title: 'Brand Identity Kit', category: 'Creatives & Graphic Designers', span: 'col-1 row-1', bg: 'linear-gradient(145deg, #252337, #42385c)' },
  { id: 7, title: 'Social Launch Pack', category: 'Marketing Professionals', span: 'col-1 row-1', bg: 'linear-gradient(145deg, #33261f, #65402e)' },
  { id: 8, title: 'Short Film Planner', category: 'Content Creators', span: 'col-1 row-1', bg: 'linear-gradient(145deg, #18282b, #28515a)' },
  { id: 9, title: 'Studio Lighting Map', category: 'Photographers & Videographers', span: 'col-1 row-1', bg: 'linear-gradient(145deg, #282828, #4a4038)' },
];

export default function BlueprintsView({ onBack }) {
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [activeSection, setActiveSection] = useState('Explore');
  const [showAll, setShowAll] = useState(false);

  const cleanQuery = submittedQuery.trim().toLowerCase();
  const filteredCards = MOCK_CARDS.filter((card) => {
    const matchesSection = activeSection === 'Explore'
      || (activeSection === 'Liked' ? card.liked : card.owned);
    const matchesFilter = activeFilter === 'All' || card.category === activeFilter;
    const matchesQuery = !cleanQuery || card.title.toLowerCase().includes(cleanQuery);
    return matchesSection && matchesFilter && matchesQuery;
  });
  const visibleCards = showAll ? filteredCards : filteredCards.slice(0, 5);

  const runSearch = () => {
    setSubmittedQuery(searchQuery);
    showUiToast(searchQuery.trim() ? `Searching Blueprints for “${searchQuery.trim()}”.` : 'Showing all Blueprints.');
  };

  return (
    <div className="blueprints-view">
      <header className="blueprints-header">
        <div className="bp-header-left">
          <button type="button" className="bp-back-btn" onClick={onBack} aria-label="Back to previous tab">
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
          <nav className="bp-nav-left">
            {['Explore', 'Liked', 'Your Generations'].map((section) => (
              <button
                type="button"
                key={section}
                className={`bp-nav-item ${activeSection === section ? 'is-active' : ''}`}
                onClick={() => {
                  setActiveSection(section);
                  setShowAll(false);
                }}
              >
                {section}
              </button>
            ))}
          </nav>
        </div>
        <div className="bp-nav-right">
          <button
            type="button"
            className="bp-feedback-btn"
            onClick={() => openAssistant('chat', 'I want to share feedback about Blueprints: ')}
          >
            Share Feedback <ExternalLink size={14} />
          </button>
        </div>
      </header>

      <main className="blueprints-main">
        <section className="bp-hero">
          <div className="bp-hero-bg">
            <div className="bp-gradient-sphere"></div>
            <div className="bp-gradient-wave"></div>
          </div>
          
          <div className="bp-hero-content">
            <h1>LUMINA<br />BLUEPRINTS</h1>
            <p>Ready Made AI Templates</p>
            
            <div className="bp-search-container">
              <Search className="bp-search-icon" size={16} />
              <input 
                type="text" 
                className="bp-search-input" 
                placeholder="Search Blueprints" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && runSearch()}
              />
              <button type="button" className="bp-search-btn" onClick={runSearch}>
                <Search size={14} /> Search
              </button>
            </div>
            
            <div className="bp-filters">
              {FILTERS.map(filter => (
                <button 
                  key={filter} 
                  className={`bp-filter-btn ${activeFilter === filter ? 'is-active' : ''}`}
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="bp-content-section">
          <div className="bp-section-header">
            <h2>{activeSection}</h2>
            <button
              type="button"
              className="bp-view-more"
              onClick={() => setShowAll((value) => !value)}
              disabled={filteredCards.length <= 5}
            >
              {showAll ? 'Show Less' : 'View More'} <ArrowRight size={14} />
            </button>
          </div>
          
          <div className="bp-masonry-grid">
            {visibleCards.map(card => (
              <button
                type="button"
                key={card.id} 
                className={`bp-card ${card.span}`}
                style={{ background: card.bg }}
                onClick={() => openUiAction('preview', {
                  title: card.title,
                  subtitle: card.category,
                  message: 'This Blueprint is ready to use as a starting point for your next Lumina creation.',
                  meta: card.owned ? 'Your Blueprint' : card.liked ? 'Liked Blueprint' : 'Community Blueprint',
                })}
              >
                <div className="bp-card-overlay">
                  <h3>{card.title}</h3>
                </div>
              </button>
            ))}
            {!visibleCards.length && (
              <div className="bp-empty-state">No Blueprints match these filters.</div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
