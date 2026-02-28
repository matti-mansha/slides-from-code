'use client';

import { useRef, useState, useEffect } from 'react';

/* ─── Thumbnail iframe ───────────────────────────────────────────────────────
   Renders the slide at its natural 1280×720 size, then scales it down to fill
   the thumb-frame container. Uses ResizeObserver so scale is always exact.
──────────────────────────────────────────────────────────────────────────── */
function ThumbIframe({ code, title }) {
  const wrapRef = useRef(null);
  const [scale, setScale] = useState(0.18); // sensible default for 248px sidebar

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([entry]) => {
      setScale(entry.contentRect.width / 1280);
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={wrapRef} className="thumb-frame">
      <iframe
        title={title}
        sandbox="allow-scripts allow-same-origin"
        srcDoc={code}
        tabIndex={-1}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 1280,
          height: 720,
          border: 'none',
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}

export default function Sidebar({ slides, activeId, onSelect, onAdd, onDuplicate, onDelete, onReorder }) {
  const [dragId, setDragId] = useState(null);
  const [overInfo, setOverInfo] = useState(null); // { id, pos: 'top'|'bottom' }
  const dragCounterRef = useRef(0);

  function handleDragStart(e, id) {
    setDragId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  }

  function handleDragEnd() {
    setDragId(null);
    setOverInfo(null);
    dragCounterRef.current = 0;
  }

  function handleDragOver(e, id) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const rect = e.currentTarget.getBoundingClientRect();
    const mid = rect.top + rect.height / 2;
    const pos = e.clientY < mid ? 'top' : 'bottom';
    setOverInfo({ id, pos });
  }

  function handleDrop(e, targetId) {
    e.preventDefault();
    if (!dragId || dragId === targetId) {
      setDragId(null);
      setOverInfo(null);
      return;
    }
    const fromIdx = slides.findIndex(s => s.id === dragId);
    const toIdx = slides.findIndex(s => s.id === targetId);
    const pos = overInfo?.pos;
    let insertIdx = pos === 'top' ? toIdx : toIdx + 1;
    if (fromIdx < insertIdx) insertIdx--;
    onReorder(fromIdx, insertIdx);
    setDragId(null);
    setOverInfo(null);
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-head">
        <span className="sidebar-label">Slides</span>
        <div className="sidebar-tools">
          <button
            className="btn btn-icon btn-ghost"
            onClick={onAdd}
            title="Add slide (after current)"
          >
            +
          </button>
          <button
            className="btn btn-icon btn-ghost"
            onClick={onDuplicate}
            title="Duplicate slide"
            style={{ fontSize: 14 }}
          >
            ⧉
          </button>
          <button
            className="btn btn-icon btn-ghost"
            onClick={onDelete}
            title="Delete slide"
            style={{ color: 'var(--danger)', fontSize: 16 }}
          >
            ×
          </button>
        </div>
      </div>

      <div className="slides-list">
        {slides.map((slide, idx) => {
          const isActive = slide.id === activeId;
          const isDragging = slide.id === dragId;
          const isOverTop = overInfo?.id === slide.id && overInfo.pos === 'top';
          const isOverBottom = overInfo?.id === slide.id && overInfo.pos === 'bottom';

          return (
            <div
              key={slide.id}
              className={[
                'slide-thumb',
                isActive ? 'active' : '',
                isDragging ? 'dragging' : '',
                isOverTop ? 'drag-over-top' : '',
                isOverBottom ? 'drag-over-bottom' : '',
              ].join(' ')}
              onClick={() => onSelect(slide.id)}
              draggable
              onDragStart={e => handleDragStart(e, slide.id)}
              onDragEnd={handleDragEnd}
              onDragOver={e => handleDragOver(e, slide.id)}
              onDrop={e => handleDrop(e, slide.id)}
            >
              {/* Thumbnail iframe */}
              <ThumbIframe code={slide.code} title={`thumb-${slide.id}`} />

              {/* Meta */}
              <div className="thumb-meta">
                <span className="thumb-num">{idx + 1}</span>
                <span className="thumb-title">{slide.title}</span>
              </div>

              {/* Hover actions */}
              <div className="thumb-actions">
                <button
                  className="btn btn-icon btn-ghost"
                  style={{ width: 22, height: 22, fontSize: 11, padding: 0, background: 'var(--surface-3)' }}
                  onClick={e => { e.stopPropagation(); onDuplicate(slide.id); }}
                  title="Duplicate"
                >
                  ⧉
                </button>
                <button
                  className="btn btn-icon btn-ghost"
                  style={{ width: 22, height: 22, fontSize: 13, padding: 0, background: 'var(--surface-3)', color: 'var(--danger)' }}
                  onClick={e => { e.stopPropagation(); onDelete(slide.id); }}
                  title="Delete"
                >
                  ×
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
