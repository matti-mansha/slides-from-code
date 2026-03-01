'use client';

export default function TopBar({
  deckTitle,
  onDeckTitleChange,
  view,
  onViewChange,
  splitMode,
  onSplitModeChange,
  sidebarOpen,
  onSidebarToggle,
  onNew,
  onImport,
  onExportJSON,
  onExportHTML,
  onExportPDF,
  onPresent,
  onOpenTemplates,
  onOpenShortcuts,
  isDirty,
  folderName,
  onOpenFolder,
  onCloseFolder,
}) {
  return (
    <header className="topbar">
      {/* Brand */}
      <div className="brand">
        <div className="brand-logo">S</div>
        <span className="brand-name">Slides from Code</span>
      </div>

      {/* Sidebar toggle */}
      <button
        className="btn btn-ghost btn-icon"
        onClick={onSidebarToggle}
        title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        style={{ fontSize: 16 }}
      >
        ☰
      </button>

      <div className="topbar-sep" />

      {/* Deck title */}
      <input
        className="deck-title-input"
        value={deckTitle}
        onChange={e => onDeckTitleChange(e.target.value)}
        placeholder="Untitled Deck"
        aria-label="Deck title"
      />

      {/* Folder: badge when open, button when closed */}
      {folderName ? (
        <div className="folder-badge">
          <span className="folder-badge-icon">📁</span>
          <span className="folder-badge-name" title={folderName}>{folderName}</span>
          <button
            className="folder-badge-close"
            onClick={onCloseFolder}
            title="Detach folder — revert to browser storage"
          >✕</button>
        </div>
      ) : (
        <button
          className="btn btn-ghost btn-sm"
          onClick={onOpenFolder}
          title="Open a folder on your PC as a slide deck (Chrome/Edge)"
          style={{ whiteSpace: 'nowrap' }}
        >
          📁 Open Folder
        </button>
      )}

      <div className="topbar-spacer" />

      {/* View mode */}
      <div className="topbar-group">
        <div className="view-pills">
          <button
            className={`view-pill ${view === 'edit' ? 'active' : ''}`}
            onClick={() => onViewChange('edit')}
            title="Edit view"
          >
            ✏️ Edit
          </button>
          <button
            className={`view-pill ${view === 'grid' ? 'active' : ''}`}
            onClick={() => onViewChange('grid')}
            title="Grid view (Ctrl+G)"
          >
            ⊞ Grid
          </button>
        </div>
      </div>

      {/* Split mode (only in edit view) */}
      {view === 'edit' && (
        <>
          <div className="topbar-sep" />
          <div className="topbar-group">
            <div className="view-pills">
              <button
                className={`view-pill ${splitMode === 'editor' ? 'active' : ''}`}
                onClick={() => onSplitModeChange('editor')}
                title="Editor only"
              >
                ▤
              </button>
              <button
                className={`view-pill ${splitMode === 'both' ? 'active' : ''}`}
                onClick={() => onSplitModeChange('both')}
                title="Split view"
              >
                ▥
              </button>
              <button
                className={`view-pill ${splitMode === 'preview' ? 'active' : ''}`}
                onClick={() => onSplitModeChange('preview')}
                title="Preview only"
              >
                ▦
              </button>
            </div>
          </div>
        </>
      )}

      <div className="topbar-sep" />

      {/* Actions */}
      <div className="topbar-group">
        <button className="btn btn-ghost btn-sm" onClick={onNew} title="New deck">
          New
        </button>
        <button className="btn btn-ghost btn-sm" onClick={onOpenTemplates} title="Slide templates">
          Templates
        </button>
        <button className="btn btn-ghost btn-sm" onClick={onImport} title="Import JSON deck">
          Import
        </button>

        {/* Export dropdown (simple group) */}
        <div style={{ position: 'relative', display: 'flex', gap: 0 }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={onExportJSON}
            title="Export as JSON (Ctrl+S)"
            style={{ borderRadius: 'var(--r) 0 0 var(--r)', borderRight: 0 }}
          >
            {isDirty ? '●' : ''} Export JSON
          </button>
          <button
            className="btn btn-ghost btn-sm"
            onClick={onExportHTML}
            title="Export deck to a folder (deck.json + slides/) — re-openable with Open Folder"
            style={{ borderRadius: 0, borderRight: 0 }}
          >
            Export Folder
          </button>
          <button
            className="btn btn-ghost btn-sm"
            onClick={onExportPDF}
            title="Export all slides as PDF via print dialog"
            style={{ borderRadius: '0 var(--r) var(--r) 0' }}
          >
            Export PDF
          </button>
        </div>
      </div>

      <div className="topbar-sep" />

      <div className="topbar-group">
        <button
          className="btn btn-ghost btn-icon"
          onClick={onOpenShortcuts}
          title="Keyboard shortcuts (?)"
          style={{ fontSize: 14 }}
        >
          ?
        </button>
        <button
          className="btn btn-accent btn-sm"
          onClick={onPresent}
          title="Start presentation (F5)"
        >
          ▶ Present
        </button>
      </div>
    </header>
  );
}
