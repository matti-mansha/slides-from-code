const SAMPLE_HTML = `<!doctype html>
<html>
  <head>
    <style>
      body {
        margin: 0;
        width: 100vw;
        height: 100vh;
        font-family: Inter, system-ui, sans-serif;
        background: linear-gradient(120deg, #111827, #312e81);
        color: white;
        display: grid;
        place-items: center;
      }

      .content {
        text-align: center;
      }

      h1 {
        font-size: 3.4rem;
        margin-bottom: 0.25rem;
      }

      p {
        color: #e2e8f0;
      }
    </style>
  </head>
  <body>
    <div class="content">
      <h1>Hello Slides</h1>
      <p>Code drives every slide.</p>
    </div>
  </body>
</html>`;

const state = {
  deckTitle: 'Untitled Deck',
  slides: [],
  currentSlideId: null,
  dirty: false,
};

const el = {
  slidesList: document.getElementById('slidesList'),
  codeInput: document.getElementById('codeInput'),
  slideTitleInput: document.getElementById('slideTitleInput'),
  lineNumbers: document.getElementById('lineNumbers'),
  editorMeta: document.getElementById('editorMeta'),
  previewFrame: document.getElementById('previewFrame'),
  runPreviewBtn: document.getElementById('runPreviewBtn'),
  addSlideBtn: document.getElementById('addSlideBtn'),
  duplicateSlideBtn: document.getElementById('duplicateSlideBtn'),
  deleteSlideBtn: document.getElementById('deleteSlideBtn'),
  prevSlideBtn: document.getElementById('prevSlideBtn'),
  nextSlideBtn: document.getElementById('nextSlideBtn'),
  statusText: document.getElementById('statusText'),
  deckMeta: document.getElementById('deckMeta'),
  toast: document.getElementById('toast'),
  exportBtn: document.getElementById('exportBtn'),
  importInput: document.getElementById('importInput'),
  presentBtn: document.getElementById('presentBtn'),
  presentOverlay: document.getElementById('presentOverlay'),
  presentFrame: document.getElementById('presentFrame'),
  presentPrevBtn: document.getElementById('presentPrevBtn'),
  presentNextBtn: document.getElementById('presentNextBtn'),
  presentCounter: document.getElementById('presentCounter'),
  closePresentBtn: document.getElementById('closePresentBtn'),
  newDeckBtn: document.getElementById('newDeckBtn'),
};

function uid() {
  return `slide_${Math.random().toString(36).slice(2, 10)}`;
}

function currentSlide() {
  return state.slides.find((slide) => slide.id === state.currentSlideId) || null;
}

function setDirty(flag = true) {
  state.dirty = flag;
  const suffix = flag ? ' • unsaved changes' : '';
  el.statusText.textContent = `Ready${suffix}`;
}

function updateCounts() {
  el.deckMeta.textContent = `${state.slides.length} slide${state.slides.length === 1 ? '' : 's'}`;
}

function lineNumberMarkup(lines) {
  return Array.from({ length: lines }, (_, index) => `<div>${index + 1}</div>`).join('');
}

function updateLineNumbers() {
  const lines = el.codeInput.value.split('\n').length;
  el.lineNumbers.innerHTML = lineNumberMarkup(lines);
  el.editorMeta.textContent = `${lines} lines • ${el.codeInput.value.length} chars`;
}

function showToast(msg) {
  el.toast.textContent = msg;
  el.toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    el.toast.classList.remove('show');
  }, 1800);
}

function renderSlideList() {
  el.slidesList.innerHTML = '';
  state.slides.forEach((slide, index) => {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = `slide-item${slide.id === state.currentSlideId ? ' active' : ''}`;
    const codeSnippet = slide.code.trim().replace(/\s+/g, ' ').slice(0, 58) || 'No code yet';
    item.innerHTML = `<h4>${index + 1}. ${slide.title || 'Untitled Slide'}</h4><p>${codeSnippet}</p>`;
    item.addEventListener('click', () => selectSlide(slide.id));
    el.slidesList.append(item);
  });
  updateCounts();
}

function writeHTMLToFrame(frame, html) {
  const doc = frame.contentDocument || frame.contentWindow.document;
  doc.open();
  doc.write(html || '<!doctype html><html><body></body></html>');
  doc.close();
}

function renderCurrentSlide() {
  const slide = currentSlide();
  if (!slide) {
    return;
  }
  writeHTMLToFrame(el.previewFrame, slide.code);
  if (!el.presentOverlay.hidden) {
    writeHTMLToFrame(el.presentFrame, slide.code);
    const index = state.slides.findIndex((s) => s.id === slide.id);
    el.presentCounter.textContent = `${index + 1} / ${state.slides.length}`;
  }
}

function selectSlide(slideId) {
  state.currentSlideId = slideId;
  const slide = currentSlide();
  if (!slide) {
    return;
  }
  el.slideTitleInput.value = slide.title;
  el.codeInput.value = slide.code;
  updateLineNumbers();
  renderSlideList();
  renderCurrentSlide();
}

function addSlide({ title = '', code = '' } = {}) {
  const slide = {
    id: uid(),
    title: title || `Slide ${state.slides.length + 1}`,
    code,
  };
  state.slides.push(slide);
  selectSlide(slide.id);
  setDirty();
}

function removeCurrentSlide() {
  if (state.slides.length === 1) {
    showToast('A deck needs at least one slide.');
    return;
  }
  const idx = state.slides.findIndex((slide) => slide.id === state.currentSlideId);
  state.slides.splice(idx, 1);
  const next = state.slides[Math.max(0, idx - 1)];
  selectSlide(next.id);
  setDirty();
}

function duplicateCurrentSlide() {
  const slide = currentSlide();
  if (!slide) return;
  addSlide({ title: `${slide.title} copy`, code: slide.code });
  showToast('Slide duplicated');
}

function navigateSlide(direction) {
  const idx = state.slides.findIndex((slide) => slide.id === state.currentSlideId);
  const nextIdx = idx + direction;
  if (nextIdx < 0 || nextIdx >= state.slides.length) return;
  selectSlide(state.slides[nextIdx].id);
}

function saveSlideFromEditor() {
  const slide = currentSlide();
  if (!slide) return;
  slide.title = el.slideTitleInput.value.trim() || 'Untitled Slide';
  slide.code = el.codeInput.value;
  renderSlideList();
  updateLineNumbers();
  setDirty();
}

function exportDeck() {
  const payload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    deckTitle: state.deckTitle,
    slides: state.slides,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${state.deckTitle.toLowerCase().replace(/\s+/g, '-') || 'slides-deck'}.json`;
  a.click();
  URL.revokeObjectURL(url);
  setDirty(false);
  showToast('Deck exported');
}

async function importDeck(file) {
  const text = await file.text();
  const payload = JSON.parse(text);
  if (!payload || !Array.isArray(payload.slides) || payload.slides.length === 0) {
    throw new Error('Invalid deck format');
  }
  state.deckTitle = payload.deckTitle || 'Imported Deck';
  state.slides = payload.slides.map((slide, idx) => ({
    id: slide.id || uid(),
    title: slide.title || `Slide ${idx + 1}`,
    code: typeof slide.code === 'string' ? slide.code : '',
  }));
  selectSlide(state.slides[0].id);
  setDirty(false);
  showToast('Deck imported');
}

function openPresentation() {
  renderCurrentSlide();
  el.presentOverlay.hidden = false;
  const idx = state.slides.findIndex((slide) => slide.id === state.currentSlideId);
  el.presentCounter.textContent = `${idx + 1} / ${state.slides.length}`;
}

function closePresentation() {
  el.presentOverlay.hidden = true;
}

function initDeck() {
  state.slides = [];
  addSlide({ title: 'Intro', code: SAMPLE_HTML });
  setDirty(false);
}

el.codeInput.addEventListener('input', () => {
  updateLineNumbers();
  saveSlideFromEditor();
});

el.slideTitleInput.addEventListener('input', saveSlideFromEditor);

el.codeInput.addEventListener('scroll', () => {
  el.lineNumbers.style.transform = `translateY(-${el.codeInput.scrollTop}px)`;
});

el.codeInput.addEventListener('keydown', (event) => {
  if (event.key === 'Tab') {
    event.preventDefault();
    const start = el.codeInput.selectionStart;
    const end = el.codeInput.selectionEnd;
    el.codeInput.value = `${el.codeInput.value.slice(0, start)}  ${el.codeInput.value.slice(end)}`;
    el.codeInput.selectionStart = el.codeInput.selectionEnd = start + 2;
    saveSlideFromEditor();
  }

  if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
    event.preventDefault();
    renderCurrentSlide();
    showToast('Slide rendered');
  }

  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
    event.preventDefault();
    exportDeck();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !el.presentOverlay.hidden) {
    closePresentation();
  }

  if (event.key === 'ArrowRight' && !el.presentOverlay.hidden) {
    navigateSlide(1);
  }

  if (event.key === 'ArrowLeft' && !el.presentOverlay.hidden) {
    navigateSlide(-1);
  }
});

el.addSlideBtn.addEventListener('click', () => {
  addSlide({ title: `Slide ${state.slides.length + 1}`, code: '<section><h1>New Slide</h1></section>' });
  showToast('Slide added');
});

el.duplicateSlideBtn.addEventListener('click', duplicateCurrentSlide);
el.deleteSlideBtn.addEventListener('click', removeCurrentSlide);
el.runPreviewBtn.addEventListener('click', () => {
  renderCurrentSlide();
  showToast('Slide rendered');
});
el.prevSlideBtn.addEventListener('click', () => navigateSlide(-1));
el.nextSlideBtn.addEventListener('click', () => navigateSlide(1));
el.exportBtn.addEventListener('click', exportDeck);
el.presentBtn.addEventListener('click', openPresentation);
el.closePresentBtn.addEventListener('click', closePresentation);
el.presentPrevBtn.addEventListener('click', () => navigateSlide(-1));
el.presentNextBtn.addEventListener('click', () => navigateSlide(1));
el.newDeckBtn.addEventListener('click', () => {
  if (state.dirty && !window.confirm('Discard current unsaved changes and create a new deck?')) {
    return;
  }
  initDeck();
  showToast('New deck created');
});

el.importInput.addEventListener('change', async (event) => {
  const [file] = event.target.files;
  if (!file) return;

  try {
    await importDeck(file);
  } catch (error) {
    showToast('Import failed: invalid file');
  } finally {
    event.target.value = '';
  }
});

initDeck();
renderCurrentSlide();
updateLineNumbers();
