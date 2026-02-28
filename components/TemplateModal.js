'use client';

import { useState, useMemo } from 'react';
import { SLIDE_TEMPLATES } from '@/lib/templates';

const CATEGORY_ICON = {
  Intro: '🎯',
  Content: '📝',
  Layout: '🗂',
  Technical: '💻',
  Data: '📊',
  Basic: '⬜',
};

export default function TemplateModal({ onSelect, onClose }) {
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('All');

  const categories = useMemo(() => {
    const cats = ['All', ...new Set(SLIDE_TEMPLATES.map(t => t.category))];
    return cats;
  }, []);

  const filtered = filter === 'All'
    ? SLIDE_TEMPLATES
    : SLIDE_TEMPLATES.filter(t => t.category === filter);

  const byCategory = useMemo(() => {
    if (filter !== 'All') return { [filter]: filtered };
    const map = {};
    SLIDE_TEMPLATES.forEach(t => {
      if (!map[t.category]) map[t.category] = [];
      map[t.category].push(t);
    });
    return map;
  }, [filter, filtered]);

  function handleApply() {
    if (!selected) return;
    onSelect(selected.code);
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h2 className="modal-title">Choose a Template</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>

        {/* Category filter */}
        <div style={{ display: 'flex', gap: 6, padding: '10px 20px 0', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <button
              key={cat}
              className={`btn btn-sm ${filter === cat ? 'btn-accent' : 'btn-ghost'}`}
              onClick={() => setFilter(cat)}
              style={{ marginBottom: 10 }}
            >
              {CATEGORY_ICON[cat] || '📁'} {cat}
            </button>
          ))}
        </div>

        <div className="modal-body">
          {Object.entries(byCategory).map(([cat, templates]) => (
            <div key={cat} className="template-category">
              {filter === 'All' && (
                <div className="template-cat-label">
                  {CATEGORY_ICON[cat] || '📁'} {cat}
                </div>
              )}
              <div className="template-grid">
                {templates.map(tmpl => (
                  <div
                    key={tmpl.id}
                    className={`template-card ${selected?.id === tmpl.id ? 'selected' : ''}`}
                    onClick={() => setSelected(tmpl)}
                    onDoubleClick={() => { setSelected(tmpl); onSelect(tmpl.code); }}
                  >
                    <div
                      className="template-thumb-preview"
                      style={{ background: tmpl.thumbGradient || '#1e2235' }}
                    >
                      <span>{CATEGORY_ICON[tmpl.category] || '📄'}</span>
                    </div>
                    <div className="template-card-info">
                      <p className="template-card-name">{tmpl.name}</p>
                      <p className="template-card-desc">{tmpl.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-accent"
            onClick={handleApply}
            disabled={!selected}
          >
            Use Template
          </button>
        </div>
      </div>
    </div>
  );
}
