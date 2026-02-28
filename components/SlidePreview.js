'use client';

import { useEffect, useState, useRef } from 'react';

const ZOOM_STEPS = [25, 50, 75, 100, 125, 150, 200];
const SLIDE_W = 1280; // natural px — 16:9 base width
const SLIDE_H = 720;  // natural px

export default function SlidePreview({
  code,
  slideIndex,
  totalSlides,
  onPrev,
  onNext,
  onDesignModeToggle,
  designMode,
}) {
  const [renderedCode, setRenderedCode] = useState(code);
  const [zoom, setZoom] = useState('fit');
  const stageRef = useRef(null);
  const [stageW, setStageW] = useState(0);
  const [stageH, setStageH] = useState(0);

  // Debounce preview update
  useEffect(() => {
    const t = setTimeout(() => setRenderedCode(code), 280);
    return () => clearTimeout(t);
  }, [code]);

  // Observe container size for "fit" calculation
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([entry]) => {
      setStageW(entry.contentRect.width);
      setStageH(entry.contentRect.height);
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // ── Zoom math ──
  // fitScale: largest scale where slide fits fully in the stage (with 16px gap each side)
  const fitScale = stageW > 0
    ? Math.min((stageW - 32) / SLIDE_W, (stageH - 32) / SLIDE_H)
    : 1;
  const scale  = zoom === 'fit' ? fitScale : zoom / 100;

  // The wrapper div has the VISUAL (scaled) size so layout + scrolling work correctly.
  // The iframe inside is always SLIDE_W×SLIDE_H and shrunk with CSS transform.
  const visW = Math.round(SLIDE_W * scale);
  const visH = Math.round(SLIDE_H * scale);

  const zoomPct = Math.round((zoom === 'fit' ? fitScale : zoom / 100) * 100);

  function zoomIn() {
    const cur = Math.round(fitScale * 100);
    const base = zoom === 'fit' ? cur : zoom;
    const next = ZOOM_STEPS.find(z => z > base);
    if (next) setZoom(next);
  }

  function zoomOut() {
    const cur = Math.round(fitScale * 100);
    const base = zoom === 'fit' ? cur : zoom;
    const next = [...ZOOM_STEPS].reverse().find(z => z < base);
    if (next) setZoom(next);
  }

  const zoomLabel = zoom === 'fit' ? 'Fit' : `${zoom}%`;

  return (
    <div className="preview-panel">
      {/* Toolbar */}
      <div className="preview-toolbar">
        <span className="preview-label">Preview</span>

        {/* Zoom controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <button
            className="btn btn-ghost btn-icon btn-sm"
            onClick={zoomOut}
            title="Zoom out"
            style={{ fontSize: 15, fontWeight: 700 }}
          >−</button>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setZoom('fit')}
            style={{ minWidth: 52, fontSize: 11 }}
            title="Fit to window"
          >
            {zoomLabel}
          </button>
          <button
            className="btn btn-ghost btn-icon btn-sm"
            onClick={zoomIn}
            title="Zoom in"
            style={{ fontSize: 15, fontWeight: 700 }}
          >+</button>
        </div>

        {/* Slide nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <button className="btn btn-ghost btn-sm btn-icon" onClick={onPrev} title="Previous">‹</button>
          <span style={{ fontSize: 11, color: 'var(--muted)', minWidth: 46, textAlign: 'center' }}>
            {slideIndex + 1} / {totalSlides}
          </span>
          <button className="btn btn-ghost btn-sm btn-icon" onClick={onNext} title="Next">›</button>
        </div>

        {/* Design mode toggle */}
        <button
          className={`btn btn-sm ${designMode ? 'btn-accent' : 'btn-ghost'}`}
          onClick={onDesignModeToggle}
          title="Visual design editor — click to select, drag to move"
          style={{ gap: 4 }}
        >
          ✦ {designMode ? 'Editing' : 'Design'}
        </button>
      </div>

      {/* Stage */}
      <div
        ref={stageRef}
        className="preview-stage"
        style={{
          overflow: zoom !== 'fit' ? 'auto' : 'hidden',
          alignItems: zoom !== 'fit' ? 'flex-start' : 'center',
          justifyContent: zoom !== 'fit' ? 'flex-start' : 'center',
          padding: 16,
        }}
      >
        {/*
          Wrapper is the VISUAL size (scaled). overflow:hidden clips the
          transform-scaled iframe so no content spills out.
        */}
        <div style={{ flexShrink: 0, width: visW, height: visH, overflow: 'hidden', position: 'relative' }}>
          <iframe
            key={designMode ? 'design' : 'preview'}
            title="slide-preview"
            sandbox="allow-scripts allow-same-origin"
            srcDoc={renderedCode}
            style={{
              width: SLIDE_W,
              height: SLIDE_H,
              border: 'none',
              display: 'block',
              background: '#fff',
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              position: 'absolute',
              top: 0,
              left: 0,
            }}
          />
        </div>
      </div>
    </div>
  );
}
