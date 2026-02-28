'use client';

import { useEffect, useState } from 'react';

export default function SlidePreview({ code, slideIndex, totalSlides, onPrev, onNext }) {
  // Debounce the rendered code for performance
  const [renderedCode, setRenderedCode] = useState(code);

  useEffect(() => {
    const t = setTimeout(() => setRenderedCode(code), 280);
    return () => clearTimeout(t);
  }, [code]);

  return (
    <div className="preview-panel">
      <div className="preview-toolbar">
        <span className="preview-label">Preview</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button className="btn btn-ghost btn-sm btn-icon" onClick={onPrev} title="Previous slide">‹</button>
          <span style={{ fontSize: 11, color: 'var(--muted)', minWidth: 50, textAlign: 'center' }}>
            {slideIndex + 1} / {totalSlides}
          </span>
          <button className="btn btn-ghost btn-sm btn-icon" onClick={onNext} title="Next slide">›</button>
        </div>
      </div>
      <div className="preview-stage">
        <iframe
          title="slide-preview"
          className="preview-frame"
          sandbox="allow-scripts allow-same-origin"
          srcDoc={renderedCode}
        />
      </div>
    </div>
  );
}
