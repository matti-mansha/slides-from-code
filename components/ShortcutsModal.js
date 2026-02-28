'use client';

const SECTIONS = [
  {
    title: 'Deck',
    rows: [
      { desc: 'Save / Export JSON',   keys: ['Ctrl', 'S'] },
      { desc: 'New deck',             keys: ['Ctrl', 'Shift', 'N'] },
      { desc: 'Import deck',          keys: ['Ctrl', 'O'] },
      { desc: 'Toggle grid view',     keys: ['Ctrl', 'G'] },
      { desc: 'Undo structural change', keys: ['Ctrl', 'Z'] },
      { desc: 'Redo',                 keys: ['Ctrl', 'Y'] },
    ],
  },
  {
    title: 'Slides',
    rows: [
      { desc: 'Add slide after current', keys: ['Ctrl', 'Shift', '+'] },
      { desc: 'Duplicate current slide', keys: ['Ctrl', 'D'] },
      { desc: 'Delete current slide',    keys: ['Del'] },
      { desc: 'Move slide up',           keys: ['Alt', '↑'] },
      { desc: 'Move slide down',         keys: ['Alt', '↓'] },
      { desc: 'Previous slide',          keys: ['←'] },
      { desc: 'Next slide',              keys: ['→'] },
    ],
  },
  {
    title: 'Editor',
    rows: [
      { desc: 'Indent (Tab)',         keys: ['Tab'] },
      { desc: 'Un-indent',            keys: ['Shift', 'Tab'] },
      { desc: 'Toggle comment',       keys: ['Ctrl', '/'] },
      { desc: 'Duplicate line',       keys: ['Ctrl', 'Shift', 'D'] },
    ],
  },
  {
    title: 'Presentation',
    rows: [
      { desc: 'Start presentation',   keys: ['F5'] },
      { desc: 'Next slide',           keys: ['→ / Space'] },
      { desc: 'Previous slide',       keys: ['←'] },
      { desc: 'Exit presentation',    keys: ['Esc'] },
    ],
  },
  {
    title: 'General',
    rows: [
      { desc: 'Show this panel',      keys: ['?'] },
      { desc: 'Toggle notes panel',   keys: ['Ctrl', 'Shift', 'N'] },
    ],
  },
];

export default function ShortcutsModal({ onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-sm" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h2 className="modal-title">Keyboard Shortcuts</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose} title="Close">✕</button>
        </div>
        <div className="modal-body">
          {SECTIONS.map(section => (
            <div key={section.title} className="shortcuts-section">
              <div className="shortcuts-section-title">{section.title}</div>
              {section.rows.map(row => (
                <div key={row.desc} className="shortcut-row">
                  <span className="shortcut-desc">{row.desc}</span>
                  <span className="shortcut-keys">
                    {row.keys.map(k => <kbd key={k}>{k}</kbd>)}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
