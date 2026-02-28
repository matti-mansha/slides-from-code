'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';

import TopBar from './TopBar';
import Sidebar from './Sidebar';
import CodeEditor from './CodeEditor';
import SlidePreview from './SlidePreview';
import GridView from './GridView';
import PresentMode from './PresentMode';
import TemplateModal from './TemplateModal';
import ShortcutsModal from './ShortcutsModal';

import { INITIAL_DECK, createSlide } from '@/lib/defaultDeck';
import { saveDeck, loadDeck } from '@/lib/storage';

// ── Helpers ──────────────────────────────────────────────────────────────────

function escapeAttr(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildHTMLBundle(deckTitle, slides) {
  const slideDivs = slides
    .map(
      (s, i) => `
  <div class="slide" id="s${i}" style="display:${i === 0 ? 'block' : 'none'}">
    <iframe srcdoc="${escapeAttr(s.code)}" sandbox="allow-scripts allow-same-origin"
      style="width:100%;height:100%;border:none;"></iframe>
  </div>`
    )
    .join('');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${deckTitle.replace(/</g, '&lt;')}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{background:#000;height:100vh;overflow:hidden;font-family:system-ui,sans-serif}
    .slide{width:100vw;height:100vh;display:none}
    .prog{position:fixed;top:0;left:0;height:3px;background:#6366f1;transition:width .3s;z-index:9}
    .hud{
      position:fixed;bottom:18px;left:50%;transform:translateX(-50%);
      display:flex;align-items:center;gap:10px;
      background:rgba(0,0,0,.8);backdrop-filter:blur(10px);
      border:1px solid rgba(255,255,255,.12);border-radius:100px;
      padding:8px 16px;opacity:0;transition:opacity .3s;z-index:9;
    }
    body:hover .hud{opacity:1}
    .hud button{
      background:rgba(255,255,255,.12);border:none;color:#fff;
      padding:5px 14px;border-radius:100px;cursor:pointer;font-size:13px;
    }
    .hud button:hover{background:rgba(255,255,255,.25)}
    .hud button:disabled{opacity:.3;cursor:default}
    #ctr{color:rgba(255,255,255,.6);font-size:13px;min-width:54px;text-align:center}
  </style>
</head>
<body>
  <div class="prog" id="prog"></div>
  ${slideDivs}
  <div class="hud">
    <button id="prev" onclick="go(-1)">← Prev</button>
    <span id="ctr">1 / ${slides.length}</span>
    <button id="next" onclick="go(1)">Next →</button>
  </div>
  <script>
    var cur=0,total=${slides.length};
    function show(n){
      document.getElementById('s'+cur).style.display='none';
      cur=Math.max(0,Math.min(n,total-1));
      document.getElementById('s'+cur).style.display='block';
      document.getElementById('ctr').textContent=(cur+1)+' / '+total;
      document.getElementById('prog').style.width=((cur+1)/total*100)+'%';
      document.getElementById('prev').disabled=cur===0;
      document.getElementById('next').disabled=cur===total-1;
    }
    function go(d){show(cur+d);}
    document.addEventListener('keydown',function(e){
      if(e.key==='ArrowRight'||e.key===' '){e.preventDefault();go(1);}
      if(e.key==='ArrowLeft'){e.preventDefault();go(-1);}
    });
    show(0);
  </script>
</body>
</html>`;
}

function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function SlidesApp() {
  // ── Deck State ─────────────────────────────────────────────────────────────
  const [deckTitle, setDeckTitle] = useState(INITIAL_DECK.title);
  const [slides, setSlides] = useState(INITIAL_DECK.slides);
  const [activeId, setActiveId] = useState(INITIAL_DECK.slides[0].id);

  // ── UI State ───────────────────────────────────────────────────────────────
  const [view, setView] = useState('edit'); // 'edit' | 'grid'
  const [splitMode, setSplitMode] = useState('both'); // 'both' | 'editor' | 'preview'
  const [showNotes, setShowNotes] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // ── Modal / Overlay State ──────────────────────────────────────────────────
  const [isPresenting, setIsPresenting] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  // ── Status ─────────────────────────────────────────────────────────────────
  const [isDirty, setIsDirty] = useState(false);
  const [status, setStatus] = useState('Ready');
  const [toasts, setToasts] = useState([]);

  // ── History (for structural undo/redo) ────────────────────────────────────
  const historyRef = useRef([]);
  const historyIdxRef = useRef(0);

  // ── File input ref ─────────────────────────────────────────────────────────
  const fileInputRef = useRef(null);

  // ── Derived ────────────────────────────────────────────────────────────────
  const activeIndex = useMemo(
    () => slides.findIndex(s => s.id === activeId),
    [slides, activeId]
  );
  const activeSlide = slides[activeIndex] ?? slides[0] ?? null;

  // ── Boot: load from localStorage ──────────────────────────────────────────
  useEffect(() => {
    const saved = loadDeck();
    if (saved && Array.isArray(saved.slides) && saved.slides.length > 0) {
      const normalized = saved.slides.map(s => ({
        id: s.id || createSlide().id,
        title: s.title || 'Untitled',
        code: typeof s.code === 'string' ? s.code : '',
        notes: s.notes || '',
        transition: s.transition || 'fade',
      }));
      setDeckTitle(saved.deckTitle || INITIAL_DECK.title);
      setSlides(normalized);
      setActiveId(normalized[0].id);
      setStatus('Restored from auto-save');
    }
    // Initialise history with current (possibly loaded) state
    historyRef.current = [{ slides: (saved?.slides ?? INITIAL_DECK.slides), deckTitle: saved?.deckTitle ?? INITIAL_DECK.title }];
    historyIdxRef.current = 0;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auto-save ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!slides.length) return;
    const t = setTimeout(() => {
      saveDeck(deckTitle, slides);
      setIsDirty(false);
      setStatus(s => (s === 'Editing…' || s === 'Unsaved changes' ? 'Auto-saved' : s));
    }, 1500);
    return () => clearTimeout(t);
  }, [slides, deckTitle]);

  // ── Toast helper ───────────────────────────────────────────────────────────
  function toast(msg) {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, msg }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 2200);
  }

  function markDirty(msg = 'Unsaved changes') {
    setIsDirty(true);
    setStatus(msg);
  }

  // ── History ────────────────────────────────────────────────────────────────
  function snapshot() {
    return { slides: JSON.parse(JSON.stringify(slides)), deckTitle };
  }

  function pushHistory() {
    const snap = snapshot();
    historyRef.current = historyRef.current.slice(0, historyIdxRef.current + 1);
    historyRef.current.push(snap);
    if (historyRef.current.length > 60) historyRef.current.shift();
    else historyIdxRef.current++;
  }

  function applySnapshot(snap) {
    setSlides(snap.slides);
    setDeckTitle(snap.deckTitle);
    setActiveId(snap.slides[0]?.id ?? '');
    markDirty('Undo applied');
  }

  function undo() {
    if (historyIdxRef.current <= 0) { toast('Nothing to undo'); return; }
    historyIdxRef.current--;
    applySnapshot(historyRef.current[historyIdxRef.current]);
  }

  function redo() {
    if (historyIdxRef.current >= historyRef.current.length - 1) { toast('Nothing to redo'); return; }
    historyIdxRef.current++;
    applySnapshot(historyRef.current[historyIdxRef.current]);
  }

  // ── Slide Operations ───────────────────────────────────────────────────────
  function updateSlide(id, patch) {
    setSlides(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s));
    markDirty('Editing…');
  }

  function addSlide(code = null) {
    pushHistory();
    const next = createSlide(slides.length + 1, code);
    setSlides(prev => {
      const idx = prev.findIndex(s => s.id === activeId);
      const arr = [...prev];
      arr.splice(idx + 1, 0, next);
      return arr;
    });
    setActiveId(next.id);
    markDirty('Slide added');
    toast('Slide added');
  }

  function duplicateSlide(id) {
    const src = slides.find(s => s.id === (id || activeId));
    if (!src) return;
    pushHistory();
    const clone = { ...src, id: createSlide().id, title: src.title + ' (copy)' };
    setSlides(prev => {
      const idx = prev.findIndex(s => s.id === src.id);
      const arr = [...prev];
      arr.splice(idx + 1, 0, clone);
      return arr;
    });
    setActiveId(clone.id);
    markDirty('Slide duplicated');
    toast('Slide duplicated');
  }

  function deleteSlide(id) {
    const targetId = id || activeId;
    if (slides.length === 1) { toast('Cannot delete the only slide'); return; }
    pushHistory();
    setSlides(prev => {
      const idx = prev.findIndex(s => s.id === targetId);
      const arr = prev.filter(s => s.id !== targetId);
      if (targetId === activeId) {
        setActiveId(arr[Math.max(0, idx - 1)].id);
      }
      return arr;
    });
    markDirty('Slide deleted');
    toast('Slide deleted');
  }

  function moveSlide(delta) {
    const nextIdx = activeIndex + delta;
    if (nextIdx < 0 || nextIdx >= slides.length) return;
    pushHistory();
    setSlides(prev => {
      const arr = [...prev];
      const [item] = arr.splice(activeIndex, 1);
      arr.splice(nextIdx, 0, item);
      return arr;
    });
    markDirty('Slide reordered');
  }

  function reorderSlides(fromIdx, toIdx) {
    if (fromIdx === toIdx) return;
    pushHistory();
    setSlides(prev => {
      const arr = [...prev];
      const [item] = arr.splice(fromIdx, 1);
      arr.splice(toIdx, 0, item);
      return arr;
    });
    markDirty('Slide reordered');
  }

  function navigate(delta) {
    const next = activeIndex + delta;
    if (next < 0 || next >= slides.length) return;
    setActiveId(slides[next].id);
  }

  // ── New deck ───────────────────────────────────────────────────────────────
  function handleNewDeck() {
    if (isDirty && !window.confirm('Discard unsaved changes and start a new deck?')) return;
    pushHistory();
    const first = createSlide(1);
    first.title = 'Intro';
    setSlides([first]);
    setDeckTitle('Untitled Deck');
    setActiveId(first.id);
    setIsDirty(false);
    setStatus('New deck created');
    toast('New deck created');
  }

  // ── Template apply ─────────────────────────────────────────────────────────
  function handleTemplateSelect(code) {
    addSlide(code);
    setShowTemplates(false);
  }

  // ── Export JSON ────────────────────────────────────────────────────────────
  function exportJSON() {
    const safe = (deckTitle.trim() || 'deck').toLowerCase().replace(/\s+/g, '-');
    const payload = JSON.stringify(
      { version: 2, deckTitle, slides, exportedAt: new Date().toISOString() },
      null,
      2
    );
    downloadFile(`${safe}.json`, payload, 'application/json');
    setIsDirty(false);
    setStatus('Exported as JSON');
    toast('Exported as JSON');
  }

  // ── Export HTML bundle ─────────────────────────────────────────────────────
  function exportHTML() {
    const safe = (deckTitle.trim() || 'deck').toLowerCase().replace(/\s+/g, '-');
    const html = buildHTMLBundle(deckTitle, slides);
    downloadFile(`${safe}.html`, html, 'text/html');
    toast('Exported as HTML');
  }

  // ── Import JSON ────────────────────────────────────────────────────────────
  async function handleImportFile(file) {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!Array.isArray(data.slides) || data.slides.length === 0) throw new Error('Invalid deck');
      const imported = data.slides.map((s, i) => ({
        id: s.id || createSlide().id,
        title: s.title || `Slide ${i + 1}`,
        code: typeof s.code === 'string' ? s.code : '',
        notes: s.notes || '',
        transition: s.transition || 'fade',
      }));
      pushHistory();
      setSlides(imported);
      setDeckTitle(data.deckTitle || 'Imported Deck');
      setActiveId(imported[0].id);
      setIsDirty(false);
      setStatus('Deck imported');
      toast('Deck imported');
    } catch {
      toast('Import failed — invalid file format');
    }
  }

  // ── Keyboard Shortcuts ─────────────────────────────────────────────────────
  useEffect(() => {
    function onKey(e) {
      const inEditor = ['TEXTAREA', 'INPUT'].includes(e.target?.tagName);
      const mod = e.metaKey || e.ctrlKey;

      // Save
      if (mod && e.key === 's') { e.preventDefault(); exportJSON(); return; }

      // Presentation mode keys
      if (isPresenting) {
        if (e.key === 'Escape') { e.preventDefault(); setIsPresenting(false); }
        return;
      }

      // Close modals
      if (e.key === 'Escape') {
        if (showTemplates) { setShowTemplates(false); return; }
        if (showShortcuts) { setShowShortcuts(false); return; }
      }

      // Shortcuts modal
      if (!inEditor && e.key === '?') { setShowShortcuts(v => !v); return; }

      // Undo / redo (outside text fields)
      if (mod && !inEditor) {
        if (e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); return; }
        if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) { e.preventDefault(); redo(); return; }
        if (e.key === 'g') { e.preventDefault(); setView(v => v === 'grid' ? 'edit' : 'grid'); return; }
        if (e.key === 'd') { e.preventDefault(); duplicateSlide(); return; }
      }

      if (!inEditor) {
        if (e.key === 'F5' || (mod && e.key === 'Enter')) { e.preventDefault(); setIsPresenting(true); return; }
        if (e.altKey && e.key === 'ArrowUp') { e.preventDefault(); moveSlide(-1); return; }
        if (e.altKey && e.key === 'ArrowDown') { e.preventDefault(); moveSlide(1); return; }
        if (e.key === 'ArrowLeft') { e.preventDefault(); navigate(-1); return; }
        if (e.key === 'ArrowRight') { e.preventDefault(); navigate(1); return; }
        if (e.key === 'Delete' || e.key === 'Backspace') { deleteSlide(); return; }
      }
    }

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="app">
      {/* ── Top Bar ─────────────────────────────────────────── */}
      <TopBar
        deckTitle={deckTitle}
        onDeckTitleChange={v => { setDeckTitle(v); markDirty('Title updated'); }}
        view={view}
        onViewChange={setView}
        splitMode={splitMode}
        onSplitModeChange={setSplitMode}
        sidebarOpen={sidebarOpen}
        onSidebarToggle={() => setSidebarOpen(v => !v)}
        onNew={handleNewDeck}
        onImport={() => fileInputRef.current?.click()}
        onExportJSON={exportJSON}
        onExportHTML={exportHTML}
        onPresent={() => setIsPresenting(true)}
        onOpenTemplates={() => setShowTemplates(true)}
        onOpenShortcuts={() => setShowShortcuts(true)}
        isDirty={isDirty}
      />

      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        hidden
        onChange={e => {
          const file = e.target.files?.[0];
          if (file) handleImportFile(file);
          e.target.value = '';
        }}
      />

      {/* ── Workspace ───────────────────────────────────────── */}
      <div className={`workspace ${!sidebarOpen ? 'sidebar-collapsed' : ''}`}>
        {/* Sidebar */}
        <Sidebar
          slides={slides}
          activeId={activeId}
          onSelect={id => { setActiveId(id); if (view === 'grid') setView('edit'); }}
          onAdd={() => addSlide()}
          onDuplicate={duplicateSlide}
          onDelete={deleteSlide}
          onReorder={reorderSlides}
        />

        {/* Main content */}
        {view === 'grid' ? (
          <GridView
            slides={slides}
            activeId={activeId}
            onSelect={(id, switchToEdit) => {
              setActiveId(id);
              if (switchToEdit) setView('edit');
            }}
          />
        ) : (
          <div className="main-area">
            {/* Editor column */}
            <div className={`editor-col ${splitMode === 'preview' ? 'hidden' : ''}`}>
              {/* Slide title input */}
              <div className="panel-toolbar">
                <input
                  className="slide-title-input"
                  value={activeSlide?.title ?? ''}
                  onChange={e => updateSlide(activeId, { title: e.target.value })}
                  placeholder="Slide title"
                  aria-label="Slide title"
                />
                <div style={{ display: 'flex', gap: 4 }}>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => moveSlide(-1)}
                    disabled={activeIndex === 0}
                    title="Move slide up (Alt+↑)"
                  >↑</button>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => moveSlide(1)}
                    disabled={activeIndex >= slides.length - 1}
                    title="Move slide down (Alt+↓)"
                  >↓</button>
                </div>
              </div>

              {/* Code editor */}
              <CodeEditor
                code={activeSlide?.code ?? ''}
                onChange={code => updateSlide(activeId, { code })}
                showNotes={showNotes}
                onNoteToggle={() => setShowNotes(v => !v)}
              />

              {/* Notes panel */}
              {showNotes && (
                <div className="notes-panel">
                  <div className="notes-header">
                    <span>Speaker Notes</span>
                    <button
                      className="btn btn-ghost btn-icon"
                      style={{ width: 20, height: 20, padding: 0, fontSize: 12 }}
                      onClick={() => setShowNotes(false)}
                    >✕</button>
                  </div>
                  <textarea
                    className="notes-textarea"
                    value={activeSlide?.notes ?? ''}
                    onChange={e => updateSlide(activeId, { notes: e.target.value })}
                    placeholder="Write speaker notes for this slide…"
                  />
                </div>
              )}
            </div>

            {/* Preview column */}
            <div className={`preview-col ${splitMode === 'editor' ? 'hidden' : ''}`}>
              <SlidePreview
                code={activeSlide?.code ?? ''}
                slideIndex={activeIndex}
                totalSlides={slides.length}
                onPrev={() => navigate(-1)}
                onNext={() => navigate(1)}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Status Bar ──────────────────────────────────────── */}
      <footer className="statusbar">
        <span className="status-item">
          <span className={`status-dot ${isDirty ? 'dirty' : 'saved'}`} />
          {status}
        </span>
        <span className="statusbar-spacer" />
        <span className="status-item">
          Slide {activeIndex + 1} of {slides.length}
        </span>
        <span className="status-item" style={{ color: 'var(--muted)' }}>
          {(activeSlide?.code || '').split('\n').length} lines
        </span>
      </footer>

      {/* ── Overlays ─────────────────────────────────────────── */}

      {isPresenting && (
        <PresentMode
          slides={slides}
          startIndex={activeIndex}
          onClose={() => setIsPresenting(false)}
        />
      )}

      {showTemplates && (
        <TemplateModal
          onSelect={handleTemplateSelect}
          onClose={() => setShowTemplates(false)}
        />
      )}

      {showShortcuts && (
        <ShortcutsModal onClose={() => setShowShortcuts(false)} />
      )}

      {/* ── Toast stack ──────────────────────────────────────── */}
      <div className="toast-stack" aria-live="polite">
        {toasts.map(t => (
          <div key={t.id} className="toast">{t.msg}</div>
        ))}
      </div>
    </div>
  );
}
