'use client';

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
            <div className="grid-card-thumb">
              <iframe
                title={`grid-${slide.id}`}
                sandbox="allow-scripts allow-same-origin"
                srcDoc={slide.code}
              />
            </div>
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
