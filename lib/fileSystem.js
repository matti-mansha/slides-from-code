// ── IndexedDB helpers ─────────────────────────────────────────────────────────
// FileSystemDirectoryHandle cannot be stored in localStorage; IDB supports it.

const IDB_DB = 'sfc-fs';
const IDB_STORE = 'handles';
const IDB_KEY = 'folder';

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(IDB_STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveHandleToIDB(handle) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).put(handle, IDB_KEY);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
}

export async function loadHandleFromIDB() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readonly');
    const req = tx.objectStore(IDB_STORE).get(IDB_KEY);
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror = () => reject(req.error);
  });
}

export async function clearHandleFromIDB() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).delete(IDB_KEY);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
}

// ── Feature detection ─────────────────────────────────────────────────────────

export function isFileSystemSupported() {
  return typeof window !== 'undefined' && 'showDirectoryPicker' in window;
}

// ── Permission management ─────────────────────────────────────────────────────

export async function requestPermission(dirHandle) {
  const opts = { mode: 'readwrite' };
  if ((await dirHandle.queryPermission(opts)) === 'granted') return true;
  return (await dirHandle.requestPermission(opts)) === 'granted';
}

// ── Folder picker ─────────────────────────────────────────────────────────────

export async function pickFolder() {
  // Throws DOMException('AbortError') if the user cancels
  return window.showDirectoryPicker({ mode: 'readwrite' });
}

// ── Read deck from folder ─────────────────────────────────────────────────────
// Returns { deckTitle, slides } or null if no deck.json exists (new/empty folder)

export async function readDeckFromFolder(dirHandle) {
  // 1. Read deck.json
  let deckMeta = null;
  try {
    const metaHandle = await dirHandle.getFileHandle('deck.json');
    const file = await metaHandle.getFile();
    deckMeta = JSON.parse(await file.text());
  } catch {
    return null; // no deck.json — caller treats this as a new folder
  }

  // 2. Try to get the slides/ sub-directory
  let slidesDir = null;
  try {
    slidesDir = await dirHandle.getDirectoryHandle('slides');
  } catch {
    slidesDir = null;
  }

  // 3. Read each slide's HTML and merge with metadata
  const slides = await Promise.all(
    (deckMeta.slides ?? []).map(async (s) => {
      let code = '';
      if (slidesDir) {
        try {
          const fh = await slidesDir.getFileHandle(`${s.id}.html`);
          const f = await fh.getFile();
          code = await f.text();
        } catch {
          code = ''; // missing .html — degrade gracefully
        }
      }
      return {
        id: s.id,
        title: s.title ?? 'Untitled',
        notes: s.notes ?? '',
        transition: s.transition ?? 'fade',
        code,
      };
    })
  );

  return {
    deckTitle: deckMeta.deckTitle ?? 'Untitled Deck',
    slides,
  };
}

// ── Write deck to folder ──────────────────────────────────────────────────────
// deck.json holds metadata only (no code) → small, git-diff-friendly
// slides/{id}.html holds each slide's full HTML → meaningful per-slide diffs

export async function writeDeckToFolder(dirHandle, deckTitle, slides) {
  // 1. Ensure slides/ sub-directory exists
  const slidesDir = await dirHandle.getDirectoryHandle('slides', { create: true });

  // 2. Write each slide's HTML
  await Promise.all(
    slides.map(async (s) => {
      const fh = await slidesDir.getFileHandle(`${s.id}.html`, { create: true });
      const writable = await fh.createWritable();
      await writable.write(s.code ?? '');
      await writable.close();
    })
  );

  // 3. Delete orphaned HTML files (slides removed from the deck)
  const currentIds = new Set(slides.map(s => s.id));
  for await (const [name] of slidesDir.entries()) {
    if (name.endsWith('.html')) {
      const id = name.slice(0, -5);
      if (!currentIds.has(id)) {
        await slidesDir.removeEntry(name);
      }
    }
  }

  // 4. Write deck.json (metadata only — code lives in slides/)
  const meta = {
    version: 3,
    deckTitle,
    slides: slides.map(s => ({
      id: s.id,
      title: s.title,
      notes: s.notes,
      transition: s.transition,
    })),
    savedAt: new Date().toISOString(),
  };
  const metaHandle = await dirHandle.getFileHandle('deck.json', { create: true });
  const metaWritable = await metaHandle.createWritable();
  await metaWritable.write(JSON.stringify(meta, null, 2));
  await metaWritable.close();
}
