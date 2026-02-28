'use client';

import { useRef, useState, useEffect } from 'react';

/* ─── Thumbnail iframe (same pattern as Sidebar) ─────────────────────────── */
function ThumbIframe({ code, title }) {
  const wrapRef = useRef(null);
  const [scale, setScale] = useState(0.2); // sensible default for ~260px grid card

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
    <div ref={wrapRef} className="grid-card-thumb">
      <iframe
        title={title}
        sandbox="allow-scripts allow-same-origin"
        srcDoc={code}
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

export default function GridView({ slides, activeId, onSelect }) {
  return (
    <div className="grid-view" style={{ flex: 1, minWidth: 0 }}>
      <div className="grid-view-header">
        <h2 className="grid-view-title">All Slides</h2>
        <span className="grid-view-count">{slides.length} slide{slides.length !== 1 ? 's' : ''}</span>
      </div>
      <div className="grid-slides">
        {slides.map((slide, i) => (
          <div
            key={slide.id}
            className={`grid-card ${slide.id === activeId ? 'active' : ''}`}
            onClick={() => onSelect(slide.id)}
            title={`${i + 1}. ${slide.title} — double-click to edit`}
            onDoubleClick={() => onSelect(slide.id, true)}
          >
            <ThumbIframe code={slide.code} title={`grid-${slide.id}`} />
            <div className="grid-card-info">
              <span className="grid-card-num">{i + 1}</span>
              <span className="grid-card-name">{slide.title}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
