'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { initialDeck } from '@/lib/defaultDeck';

function createSlide(index) {
  return {
    id: `slide-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: `Slide ${index}`,
    code: '<!doctype html><html><body><h1>New Slide</h1></body></html>',
  };
}

function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function SlidesStudio() {
  const [deckTitle, setDeckTitle] = useState(initialDeck.title);
  const [slides, setSlides] = useState(initialDeck.slides);
  const [activeId, setActiveId] = useState(initialDeck.slides[0].id);
  const [status, setStatus] = useState('Ready');
  const [toast, setToast] = useState('');
  const [presenting, setPresenting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const fileInputRef = useRef(null);

  const activeIndex = useMemo(() => slides.findIndex((s) => s.id === activeId), [slides, activeId]);
  const activeSlide = slides[activeIndex] ?? slides[0];

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 1800);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    const onKeyDown = (event) => {
      const editorTarget = event.target?.tagName === 'TEXTAREA' || event.target?.tagName === 'INPUT';

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        handleExport();
      }
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        event.preventDefault();
        showToast('Slide rendered');
        setStatus('Rendered preview');
      }

      if (presenting) {
        if (event.key === 'Escape') {
          event.preventDefault();
          setPresenting(false);
        }
        if (event.key === 'ArrowRight') {
          event.preventDefault();
          navigateSlide(1);
        }
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          navigateSlide(-1);
        }
      }

      if (!editorTarget && event.altKey && event.key === 'ArrowUp') {
        event.preventDefault();
        reorderSlide(-1);
      }
      if (!editorTarget && event.altKey && event.key === 'ArrowDown') {
        event.preventDefault();
        reorderSlide(1);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  const showToast = (message) => setToast(message);

  const markDirty = (nextStatus = 'Unsaved changes') => {
    setIsDirty(true);
    setStatus(nextStatus);
  };

  const updateSlide = (id, patch) => {
    setSlides((prev) => prev.map((slide) => (slide.id === id ? { ...slide, ...patch } : slide)));
    markDirty();
  };

  const addSlide = () => {
    const next = createSlide(slides.length + 1);
    setSlides((prev) => [...prev, next]);
    setActiveId(next.id);
    showToast('Slide added');
    markDirty('Slide added');
  };

  const duplicateSlide = () => {
    if (!activeSlide) return;
    const clone = { ...activeSlide, id: createSlide(0).id, title: `${activeSlide.title} Copy` };
    setSlides((prev) => {
      const index = prev.findIndex((s) => s.id === activeId);
      const next = [...prev];
      next.splice(index + 1, 0, clone);
      return next;
    });
    setActiveId(clone.id);
    showToast('Slide duplicated');
    markDirty('Slide duplicated');
  };

  const deleteSlide = () => {
    if (slides.length === 1) {
      showToast('A deck requires at least one slide');
      return;
    }
    setSlides((prev) => {
      const index = prev.findIndex((s) => s.id === activeId);
      const next = prev.filter((s) => s.id !== activeId);
      const safeIndex = Math.max(0, index - 1);
      setActiveId(next[safeIndex].id);
      return next;
    });
    showToast('Slide deleted');
    markDirty('Slide deleted');
  };

  const navigateSlide = (direction) => {
    const nextIndex = activeIndex + direction;
    if (nextIndex < 0 || nextIndex >= slides.length) return;
    setActiveId(slides[nextIndex].id);
    setStatus('Slide changed');
  };

  const reorderSlide = (direction) => {
    const nextIndex = activeIndex + direction;
    if (nextIndex < 0 || nextIndex >= slides.length) return;
    setSlides((prev) => {
      const next = [...prev];
      const [picked] = next.splice(activeIndex, 1);
      next.splice(nextIndex, 0, picked);
      return next;
    });
    setStatus('Slide reordered');
    markDirty('Slide reordered');
  };

  const handleExport = () => {
    const safeName = deckTitle.trim().toLowerCase().replace(/\s+/g, '-') || 'slides-deck';
    downloadJson(`${safeName}.json`, {
      version: 1,
      deckTitle,
      exportedAt: new Date().toISOString(),
      slides,
    });
    setStatus('Deck exported');
    setIsDirty(false);
    showToast('Deck exported');
  };

  const handleImport = async (file) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!Array.isArray(data.slides) || data.slides.length === 0) throw new Error('Invalid deck');
      const importedSlides = data.slides.map((slide, idx) => ({
        id: slide.id || `slide-import-${idx + 1}`,
        title: slide.title || `Slide ${idx + 1}`,
        code: typeof slide.code === 'string' ? slide.code : '<!doctype html><html><body></body></html>',
      }));
      setSlides(importedSlides);
      setActiveId(importedSlides[0].id);
      setDeckTitle(data.deckTitle || 'Imported Deck');
      setStatus('Deck imported');
      setIsDirty(false);
      showToast('Deck imported');
    } catch {
      showToast('Import failed');
      setStatus('Import failed');
    }
  };

  const createNewDeck = () => {
    if (isDirty && !window.confirm('Discard unsaved changes and create a new deck?')) return;
    const first = createSlide(1);
    first.title = 'Intro';
    first.code = initialDeck.slides[0].code;
    setDeckTitle(initialDeck.title);
    setSlides([first]);
    setActiveId(first.id);
    setStatus('New deck created');
    setIsDirty(false);
    showToast('New deck created');
  };

  const codeLines = (activeSlide?.code || '').split('\n').length;

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="badge">S</div>
          <div>
            <h1>Slides from Code</h1>
            <p>Production deck builder powered by HTML/CSS/JS slides.</p>
          </div>
        </div>

        <div className="header-controls">
          <input
            className="deck-title"
            value={deckTitle}
            onChange={(event) => {
              setDeckTitle(event.target.value);
              markDirty('Deck title updated');
            }}
            aria-label="Deck title"
          />
          <button className="btn ghost" onClick={createNewDeck}>New deck</button>
          <button className="btn ghost" onClick={() => fileInputRef.current?.click()}>Import</button>
          <input
            hidden
            ref={fileInputRef}
            type="file"
            accept="application/json"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) handleImport(file);
              event.target.value = '';
            }}
          />
          <button className="btn ghost" onClick={handleExport}>Export</button>
          <button className="btn accent" onClick={() => setPresenting(true)}>Present</button>
        </div>
      </header>

      <main className="workspace">
        <aside className="sidebar">
          <div className="sidebar-head">
            <h2>Slides</h2>
            <div className="toolbar">
              <button className="icon" onClick={addSlide} title="Add slide">+</button>
              <button className="icon" onClick={duplicateSlide} title="Duplicate slide">⧉</button>
              <button className="icon danger" onClick={deleteSlide} title="Delete slide">×</button>
            </div>
          </div>
          <div className="slides-list">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                className={`slide-card ${slide.id === activeId ? 'active' : ''}`}
                onClick={() => setActiveId(slide.id)}
              >
                <div className="thumb-wrap">
                  <iframe title={`thumb-${slide.id}`} sandbox="allow-scripts allow-same-origin" srcDoc={slide.code} />
                </div>
                <div className="meta">
                  <h3>{index + 1}. {slide.title}</h3>
                  <p>{slide.code.length} chars</p>
                </div>
              </button>
            ))}
          </div>
        </aside>

        <section className="content">
          <article className="editor">
            <div className="panel-head">
              <input
                className="slide-title"
                value={activeSlide?.title ?? ''}
                onChange={(event) => updateSlide(activeId, { title: event.target.value })}
                placeholder="Slide title"
              />
              <div className="panel-actions">
                <button className="btn ghost tiny" onClick={() => reorderSlide(-1)}>Move up</button>
                <button className="btn ghost tiny" onClick={() => reorderSlide(1)}>Move down</button>
              </div>
            </div>

            <div className="editor-body">
              <div className="line-numbers" aria-hidden>
                {Array.from({ length: codeLines }, (_, idx) => (
                  <div key={idx + 1}>{idx + 1}</div>
                ))}
              </div>
              <textarea
                value={activeSlide?.code ?? ''}
                onChange={(event) => updateSlide(activeId, { code: event.target.value })}
                spellCheck={false}
              />
            </div>

            <div className="panel-foot">
              <span>{codeLines} lines · {(activeSlide?.code || '').length} chars</span>
              <button className="btn accent" onClick={() => showToast('Slide rendered')}>Render</button>
            </div>
          </article>

          <article className="preview">
            <div className="panel-head">
              <h2>Preview</h2>
              <div className="panel-actions">
                <button className="btn ghost tiny" onClick={() => navigateSlide(-1)}>Prev</button>
                <button className="btn ghost tiny" onClick={() => navigateSlide(1)}>Next</button>
              </div>
            </div>
            <div className="preview-stage">
              <iframe title="active-slide-preview" sandbox="allow-scripts allow-same-origin" srcDoc={activeSlide?.code || ''} />
            </div>
          </article>
        </section>
      </main>

      <footer className="statusbar">
        <span>{status}{isDirty ? ' • unsaved' : ''}</span>
        <span>{slides.length} slide{slides.length === 1 ? '' : 's'}</span>
      </footer>

      {presenting ? (
        <div className="present">
          <button className="close" onClick={() => setPresenting(false)}>Exit (Esc)</button>
          <div className="present-stage">
            <iframe title="presentation" sandbox="allow-scripts allow-same-origin" srcDoc={activeSlide?.code || ''} />
          </div>
          <div className="present-nav">
            <button className="btn ghost" onClick={() => navigateSlide(-1)}>Prev</button>
            <span>{activeIndex + 1} / {slides.length}</span>
            <button className="btn ghost" onClick={() => navigateSlide(1)}>Next</button>
          </div>
        </div>
      ) : null}

      <div className={`toast ${toast ? 'show' : ''}`}>{toast}</div>
    </div>
  );
}
