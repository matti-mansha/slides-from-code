# Slides from Code

A browser-based slide editor where every slide is a plain HTML file. Edit code, see a live preview, present fullscreen, and save your deck directly to a folder on disk — making the whole thing version-controllable with Git.

**Live:** https://slides.mantiqi.com
**GitHub:** https://github.com/matti-mansha/slides-from-code

---

## Why

Traditional presentation tools make updates painful. When slides contain technical content that changes often — architecture diagrams, API examples, metrics — re-opening a proprietary file, hunting for the right slide, and editing manually creates friction.

This tool stores each slide as a plain `.html` file in a folder you choose. You can point Claude, Codex, or any AI coding tool at those files and get clean, reviewable git diffs per slide.

---

## Features

### Editor
- Each slide is a full HTML document — write any HTML, CSS, and JavaScript
- Live preview with 300ms debounce (rendered in an isolated iframe)
- Split view modes: editor only, preview only, or side-by-side
- Code editor with tab indentation, auto-close brackets/quotes, `Ctrl+/` to toggle comments, and `Ctrl+Shift+D` to duplicate a line

### Slides
- Slide panel sidebar with live thumbnails
- Drag-to-reorder slides
- Speaker notes per slide (collapsible panel)
- 10 starter templates across 5 categories: Intro, Content, Layout, Technical, Data

### Presentation
- Fullscreen presentation mode with fade and slide transitions
- Previous/next navigation with a progress bar
- Speaker notes overlay
- Slide counter HUD

### Storage
- **Open Folder** — pick any folder on disk; the app reads and writes directly to it on every auto-save (Chrome/Edge only, requires File System Access API)
- **Auto-save** — 1.5s debounce; saves to the open folder or to `localStorage` if no folder is attached
- Folder handle is persisted in IndexedDB so the connection survives page reloads
- Unsaved changes in `localStorage` mode trigger a browser `beforeunload` warning

### Import / Export
- **Open Folder** — opens an existing deck from disk (reads `deck.json` + `slides/{id}.html`)
- **Export Folder** — writes a new folder in the same format; open it later with Open Folder
- **Export JSON** — single-file snapshot of the full deck
- **Import JSON** — restore a deck from a JSON export
- **Export PDF** — opens a print window with all slides at 16:9 (1280×720 px), one per page

### Other
- Undo / redo for structural changes
- Grid view (PowerPoint-style overview, double-click to edit)
- Toast notifications
- Keyboard shortcuts modal

---

## File Format

When a folder is attached, the deck is stored as:

```
my-deck/
├── deck.json          ← metadata: title, slide order, notes, transitions
└── slides/
    ├── slide-abc.html ← full HTML for slide 1
    ├── slide-def.html ← full HTML for slide 2
    └── ...
```

`deck.json` is intentionally small (no code) so structural changes show clean diffs. Each `slides/{id}.html` file contains only the HTML for that slide, so content changes diff per-slide.

Example `deck.json`:
```json
{
  "version": 3,
  "deckTitle": "My Presentation",
  "slides": [
    { "id": "slide-abc", "title": "Intro", "notes": "", "transition": "fade" },
    { "id": "slide-def", "title": "Key Points", "notes": "", "transition": "slide" }
  ],
  "savedAt": "2025-04-01T10:00:00.000Z"
}
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- Chrome or Edge (for Open Folder / Export Folder — requires File System Access API)

### Run locally

```bash
git clone https://github.com/matti-mansha/slides-from-code.git
cd slides-from-code
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Use with a Git repo

1. Create a folder for your deck (e.g. `~/projects/my-talk`)
2. `git init` inside it
3. In the app, click **Open Folder** and select that folder
4. Edit slides — the app auto-saves to disk
5. `git add . && git commit -m "update slides"` whenever you want a checkpoint
6. Push to GitHub as normal

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl + Z` | Undo |
| `Ctrl + Y` / `Ctrl + Shift + Z` | Redo |
| `Ctrl + N` | New slide |
| `Ctrl + D` | Duplicate current slide |
| `Ctrl + Delete` | Delete current slide |
| `Ctrl + [` / `Ctrl + ]` | Move slide left / right |
| `Ctrl + Enter` | Toggle presentation mode |
| `Ctrl + G` | Toggle grid view |
| `Tab` | Indent in editor |
| `Shift + Tab` | Unindent in editor |
| `Ctrl + /` | Toggle line comment |
| `Ctrl + Shift + D` | Duplicate line |
| `?` | Show shortcuts modal |

---

## Browser Compatibility

| Feature | Chrome / Edge | Firefox | Safari |
|---|---|---|---|
| Editor, preview, present | ✅ | ✅ | ✅ |
| Open Folder / Export Folder | ✅ | ❌ | ✅ 15.2+ |
| Export JSON / Import JSON | ✅ | ✅ | ✅ |
| Export PDF | ✅ | ✅ | ✅ |

Open Folder and Export Folder require the [File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API). On unsupported browsers, Export JSON and Import JSON provide a full workaround.

---

## Stack

- **Next.js 14** (App Router) + **React 18**
- No external UI libraries — all custom CSS
- No drag-and-drop library — native HTML5 drag events
- No rich-text editor — plain `<textarea>` with keyboard enhancements
- File System Access API + IndexedDB for folder persistence

---

## Project Structure

```
app/
  globals.css       — design system (CSS variables, all component styles)
  layout.js         — loads Inter font
  page.js           — renders <SlidesApp />

lib/
  fileSystem.js     — File System Access API + IndexedDB helpers
  templates.js      — 10 slide templates
  defaultDeck.js    — createSlide() factory + default deck
  storage.js        — localStorage save/load/clear

components/
  SlidesApp.js      — main orchestrator: all state, undo/redo, shortcuts
  TopBar.js         — header with all controls
  Sidebar.js        — slide thumbnail list with drag-to-reorder
  CodeEditor.js     — textarea editor with keyboard enhancements
  SlidePreview.js   — live iframe preview (debounced)
  GridView.js       — all-slides grid overview
  PresentMode.js    — fullscreen overlay with transitions
  TemplateModal.js  — template picker
  ShortcutsModal.js — keyboard shortcuts reference
```

---

## Contributing

Issues and pull requests are welcome.

1. Fork the repo
2. Create a branch: `git checkout -b my-feature`
3. Commit your changes
4. Open a pull request

---

## License

MIT
