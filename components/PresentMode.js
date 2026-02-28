'use client';

import { useState, useEffect } from 'react';

const SLIDE_W = 1280;
const SLIDE_H = 720;

export default function PresentMode({ slides, startIndex, onClose }) {
  const [index, setIndex] = useState(startIndex ?? 0);
  const [animClass, setAnimClass] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const [scale, setScale] = useState(1);

  const slide = slides[index];
  const progress = slides.length > 1 ? ((index + 1) / slides.length) * 100 : 100;

  // Compute the largest scale where the 1280×720 slide fits the screen
  useEffect(() => {
    function calcScale() {
      const s = Math.min(
        window.innerWidth  / SLIDE_W,
        window.innerHeight / SLIDE_H
      );
      setScale(s);
    }
    calcScale();
    window.addEventListener('resize', calcScale);
    return () => window.removeEventListener('resize', calcScale);
  }, []);

  function go(delta) {
    const next = index + delta;
    if (next < 0 || next >= slides.length) return;
    setAnimClass('');
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

  const visW = Math.round(SLIDE_W * scale);
  const visH = Math.round(SLIDE_H * scale);

  return (
    <div className="present-overlay">
      {/* Progress bar */}
      <div className="present-progress" style={{ width: `${progress}%` }} />

      {/* Slide stage */}
      <div className="present-stage">
        <button className="present-exit-btn" onClick={onClose}>Exit (Esc)</button>

        {/*
          Wrapper is the VISUAL size of the scaled slide.
          The iframe renders at natural 1280×720 and is shrunk with CSS scale,
          so slide content with fixed px widths is always fully visible.
        */}
        <div
          className={`present-slide ${animClass}`}
          key={index}
          style={{ width: visW, height: visH }}
        >
          <iframe
            title={`present-${index}`}
            sandbox="allow-scripts allow-same-origin"
            srcDoc={slide?.code || ''}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: SLIDE_W,
              height: SLIDE_H,
              border: 'none',
              background: '#fff',
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
            }}
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
