import React, { useState } from 'react';
import { Search, ExternalLink, ArrowLeft, ArrowRight } from 'lucide-react';
import './BlueprintsView.css';

const FILTERS = [
  'All',
  'Creatives & Graphic Designers',
  'Marketing Professionals',
  'Content Creators',
  'Photographers & Videographers'
];

const MOCK_CARDS = [
  { id: 1, title: '', span: 'col-2 row-2', bg: 'linear-gradient(145deg, #1f1f1f, #2a2a2a)' }, // Placeholder for the collage
  { id: 2, title: 'Storyboard Sheet', span: 'col-1 row-1', bg: 'linear-gradient(145deg, #2a2c26, #3a3b35)' },
  { id: 3, title: 'Product Photography', span: 'col-1 row-1', bg: 'linear-gradient(145deg, #1b261b, #2b3b2b)' },
  { id: 4, title: 'Portrait Retouch', span: 'col-1 row-1', bg: 'linear-gradient(145deg, #2c2535, #3c3545)' },
  { id: 5, title: 'Concept Art', span: 'col-1 row-1', bg: 'linear-gradient(145deg, #252b35, #353b45)' },
];

export default function BlueprintsView({ onBack }) {
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="blueprints-view">
      <header className="blueprints-header">
        <div className="bp-header-left">
          <button type="button" className="bp-back-btn" onClick={onBack} aria-label="Back to previous tab">
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
          <nav className="bp-nav-left">
            <button className="bp-nav-item is-active">Explore</button>
            <button className="bp-nav-item">Liked</button>
            <button className="bp-nav-item">Your Generations</button>
          </nav>
        </div>
        <div className="bp-nav-right">
          <button className="bp-feedback-btn">
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
              />
              <button className="bp-search-btn">
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
            <h2>Ideate</h2>
            <button className="bp-view-more">
              View More <ArrowRight size={14} />
            </button>
          </div>
          
          <div className="bp-masonry-grid">
            {MOCK_CARDS.map(card => (
              <div 
                key={card.id} 
                className={`bp-card ${card.span}`}
                style={{ background: card.bg }}
              >
                {card.title && <div className="bp-card-overlay">
                  <h3>{card.title}</h3>
                </div>}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
