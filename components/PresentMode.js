'use client';

import { useState, useEffect } from 'react';

export default function PresentMode({ slides, startIndex, onClose }) {
  const [index, setIndex] = useState(startIndex ?? 0);
  const [animClass, setAnimClass] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const [dir, setDir] = useState(1); // 1=forward, -1=back

  const slide = slides[index];
  const progress = slides.length > 1 ? ((index + 1) / slides.length) * 100 : 100;

  function go(delta) {
    const next = index + delta;
    if (next < 0 || next >= slides.length) return;
    setDir(delta);
    setAnimClass('');
    // Defer so animation re-triggers
    requestAnimationFrame(() => {
      setIndex(next);
      const cls = delta > 0 ? 'slide-enter-right' : 'slide-enter-left';
      requestAnimationFrame(() => setAnimClass(cls));
    });
  }

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); go(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
      if (e.key === 'n' || e.key === 'N') setShowNotes(v => !v);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <div className="present-overlay">
      {/* Progress bar */}
      <div className="present-progress" style={{ width: `${progress}%` }} />

      {/* Slide stage */}
      <div className="present-stage">
        <button className="present-exit-btn" onClick={onClose}>Exit (Esc)</button>

        <div className={`present-slide ${animClass}`} key={index}>
          <iframe
            title={`present-${index}`}
            sandbox="allow-scripts allow-same-origin"
            srcDoc={slide?.code || ''}
          />
        </div>

        {/* Notes overlay */}
        {showNotes && slide?.notes && (
          <div className="present-notes">{slide.notes}</div>
        )}
      </div>

      {/* HUD */}
      <div className="present-hud">
        <button
          className="btn btn-ghost btn-sm"
          style={{ color: 'rgba(255,255,255,0.6)', borderColor: 'rgba(255,255,255,0.15)' }}
          onClick={() => go(-1)}
          disabled={index === 0}
        >
          ← Prev
        </button>

        <span className="present-counter">{index + 1} / {slides.length}</span>

        <button
          className="btn btn-ghost btn-sm"
          style={{ color: 'rgba(255,255,255,0.6)', borderColor: 'rgba(255,255,255,0.15)' }}
          onClick={() => go(1)}
          disabled={index === slides.length - 1}
        >
          Next →
        </button>

        <div style={{ width: 1, height: 18, background: 'rgba(255,255,255,0.12)', margin: '0 4px' }} />

        <button
          className="btn btn-ghost btn-sm"
          style={{
            color: showNotes ? 'var(--accent-light)' : 'rgba(255,255,255,0.5)',
            borderColor: showNotes ? 'var(--accent)' : 'rgba(255,255,255,0.15)',
          }}
          onClick={() => setShowNotes(v => !v)}
          title="Toggle speaker notes (N)"
        >
          Notes
        </button>
      </div>
    </div>
  );
}
