'use client';

import { useRef, useCallback, useEffect, useState } from 'react';

const CLOSE_MAP = { '{': '}', '(': ')', '[': ']', '"': '"', "'": "'", '`': '`' };

function getIndent(str) {
  const m = str.match(/^(\s*)/);
  return m ? m[1] : '';
}

export default function CodeEditor({ code, onChange, onNoteToggle, showNotes }) {
  const textareaRef = useRef(null);
  const lineNumRef = useRef(null);
  const [lineCount, setLineCount] = useState(1);

  // Sync line numbers
  useEffect(() => {
    const lines = (code || '').split('\n').length;
    setLineCount(lines);
  }, [code]);

  // Sync scroll between line numbers and textarea
  function syncScroll() {
    if (lineNumRef.current && textareaRef.current) {
      lineNumRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  }

  const handleKeyDown = useCallback((e) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const { value, selectionStart: ss, selectionEnd: se } = ta;

    // Tab → insert 2 spaces
    if (e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey) {
        // Un-indent: remove up to 2 leading spaces from current line
        const lineStart = value.lastIndexOf('\n', ss - 1) + 1;
        const lineText = value.slice(lineStart, se);
        const stripped = lineText.replace(/^  /, '');
        const removed = lineText.length - stripped.length;
        if (removed > 0) {
          const next = value.slice(0, lineStart) + stripped + value.slice(se);
          onChange(next);
          requestAnimationFrame(() => {
            ta.setSelectionRange(ss - removed, se - removed);
          });
        }
      } else {
        const next = value.slice(0, ss) + '  ' + value.slice(se);
        onChange(next);
        requestAnimationFrame(() => ta.setSelectionRange(ss + 2, ss + 2));
      }
      return;
    }

    // Enter → auto-indent
    if (e.key === 'Enter') {
      e.preventDefault();
      const lineStart = value.lastIndexOf('\n', ss - 1) + 1;
      const currentLine = value.slice(lineStart, ss);
      const indent = getIndent(currentLine);
      // Extra indent after opening brace/bracket
      const lastChar = currentLine.trimEnd().slice(-1);
      const extraIndent = ['{', '(', '['].includes(lastChar) ? '  ' : '';
      const insert = '\n' + indent + extraIndent;
      const next = value.slice(0, ss) + insert + value.slice(se);
      onChange(next);
      requestAnimationFrame(() => {
        const pos = ss + insert.length;
        ta.setSelectionRange(pos, pos);
      });
      return;
    }

    // Auto-close brackets / quotes
    if (CLOSE_MAP[e.key] && ss === se) {
      e.preventDefault();
      const close = CLOSE_MAP[e.key];
      const next = value.slice(0, ss) + e.key + close + value.slice(se);
      onChange(next);
      requestAnimationFrame(() => ta.setSelectionRange(ss + 1, ss + 1));
      return;
    }

    // Skip over closing char if already there
    if (Object.values(CLOSE_MAP).includes(e.key) && ss === se) {
      if (value[ss] === e.key) {
        e.preventDefault();
        ta.setSelectionRange(ss + 1, ss + 1);
        return;
      }
    }

    // Ctrl+/ → toggle HTML comment on current line
    if ((e.ctrlKey || e.metaKey) && e.key === '/') {
      e.preventDefault();
      const lineStart = value.lastIndexOf('\n', ss - 1) + 1;
      const lineEnd = value.indexOf('\n', ss);
      const end = lineEnd === -1 ? value.length : lineEnd;
      const line = value.slice(lineStart, end);
      let toggled;
      if (line.trim().startsWith('<!--') && line.trim().endsWith('-->')) {
        toggled = line.replace(/<!--\s?/, '').replace(/\s?-->/, '');
      } else {
        toggled = `<!-- ${line.trim()} -->`;
      }
      const next = value.slice(0, lineStart) + toggled + value.slice(end);
      onChange(next);
      return;
    }

    // Ctrl+Shift+D → duplicate line
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
      e.preventDefault();
      const lineStart = value.lastIndexOf('\n', ss - 1) + 1;
      const lineEnd = value.indexOf('\n', ss);
      const end = lineEnd === -1 ? value.length : lineEnd;
      const line = value.slice(lineStart, end);
      const next = value.slice(0, end) + '\n' + line + value.slice(end);
      onChange(next);
      requestAnimationFrame(() => {
        const newPos = ss + line.length + 1;
        ta.setSelectionRange(newPos, newPos);
      });
      return;
    }
  }, [code, onChange]);

  const charCount = (code || '').length;

  return (
    <div className="editor-panel">
      {/* Code area */}
      <div className="code-editor-area">
        {/* Line numbers */}
        <div className="line-numbers" ref={lineNumRef} aria-hidden="true">
          {Array.from({ length: lineCount }, (_, i) => (
            <span key={i + 1} className="line-number">{i + 1}</span>
          ))}
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          className="code-textarea"
          value={code}
          onChange={e => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onScroll={syncScroll}
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
        />
      </div>

      {/* Footer */}
      <div className="editor-footer">
        <span>
          {lineCount} line{lineCount !== 1 ? 's' : ''} &nbsp;·&nbsp; {charCount} chars
        </span>
        <div className="editor-footer-actions">
          <button
            className={`btn btn-ghost btn-sm ${showNotes ? 'btn-accent' : ''}`}
            style={{ fontSize: 11 }}
            onClick={onNoteToggle}
            title="Toggle speaker notes"
          >
            Notes
          </button>
        </div>
      </div>
    </div>
  );
}
