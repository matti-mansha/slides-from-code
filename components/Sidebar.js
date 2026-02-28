'use client';

import { useRef, useState } from 'react';

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
              <div className="thumb-frame">
                <iframe
                  title={`thumb-${slide.id}`}
                  sandbox="allow-scripts allow-same-origin"
                  srcDoc={slide.code}
                  tabIndex={-1}
                />
              </div>

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
