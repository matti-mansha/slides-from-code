'use client';

import { useEffect, useState, useRef, useCallback } from 'react';

const ZOOM_STEPS = [25, 50, 75, 100, 125, 150, 200];
const SLIDE_NATURAL_W = 1280; // px — 16:9 base width

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

  // Derived zoom %
  const fitZoomPct = stageW > 0
    ? Math.min((stageW - 32) / SLIDE_NATURAL_W, (stageH - 32) / (SLIDE_NATURAL_W * 9 / 16)) * 100
    : 100;
  const zoomPct = zoom === 'fit' ? fitZoomPct : zoom;
  const frameW = SLIDE_NATURAL_W * zoomPct / 100;
  const frameH = frameW * 9 / 16;

  function zoomIn() {
    const cur = zoom === 'fit' ? fitZoomPct : zoom;
    const next = ZOOM_STEPS.find(z => z > cur);
    if (next) setZoom(next);
  }

  function zoomOut() {
    const cur = zoom === 'fit' ? fitZoomPct : zoom;
    const next = [...ZOOM_STEPS].reverse().find(z => z < cur);
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
            style={{ minWidth: 46, fontSize: 11 }}
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
        <div style={{ flexShrink: 0 }}>
          <iframe
            key={designMode ? 'design' : 'preview'}
            title="slide-preview"
            sandbox="allow-scripts allow-same-origin"
            srcDoc={renderedCode}
            style={{
              width: frameW,
              height: frameH,
              border: 'none',
              display: 'block',
              background: '#fff',
            }}
          />
        </div>
      </div>
    </div>
  );
}
