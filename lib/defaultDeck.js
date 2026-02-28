export function createSlide(index = 1, code = null) {
  return {
    id: `slide-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: `Slide ${index}`,
    code: code !== null ? code : `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 100vw; height: 100vh;
      background: #0f172a; color: #e2e8f0;
      font-family: Inter, system-ui, sans-serif;
      display: flex; align-items: center; justify-content: center;
    }
    h1 { font-size: 3rem; font-weight: 700; }
  </style>
</head>
<body>
  <h1>New Slide</h1>
</body>
</html>`,
    notes: '',
    transition: 'fade',
  };
}

export const INITIAL_DECK = {
  title: 'Untitled Deck',
  slides: [
    {
      id: 'slide-default-1',
      title: 'Intro',
      notes: 'Welcome the audience. Introduce yourself and the topic.',
      transition: 'fade',
      code: `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 100vw; height: 100vh;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      background: linear-gradient(135deg, #0f172a 0%, #312e81 100%);
      color: #fff;
      font-family: Inter, system-ui, sans-serif;
    }
    .eyebrow {
      font-size: 0.85rem; letter-spacing: 0.2em;
      text-transform: uppercase; color: #818cf8;
      margin-bottom: 1.2rem;
    }
    h1 {
      font-size: 4rem; font-weight: 800;
      letter-spacing: -0.03em; line-height: 1.1;
      margin-bottom: 1.2rem; text-align: center;
    }
    .sub { font-size: 1.4rem; color: #94a3b8; }
  </style>
</head>
<body>
  <p class="eyebrow">Slides from Code</p>
  <h1>Build Beautiful<br>Presentations</h1>
  <p class="sub">Edit HTML · CSS · JS to craft each slide</p>
</body>
</html>`,
    },
    {
      id: 'slide-default-2',
      title: 'Key Features',
      notes: 'Walk through each feature briefly.',
      transition: 'fade',
      code: `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 100vw; height: 100vh;
      background: #0f172a; color: #e2e8f0;
      font-family: Inter, system-ui, sans-serif;
    }
    .slide { height: 100%; padding: 60px 80px; display: flex; flex-direction: column; }
    h2 {
      font-size: 2.4rem; font-weight: 700; color: #fff;
      margin-bottom: 2rem; padding-bottom: 1rem;
      border-bottom: 2px solid #3730a3;
    }
    ul { list-style: none; display: flex; flex-direction: column; gap: 1rem; }
    li { display: flex; align-items: center; gap: 14px; font-size: 1.25rem; color: #cbd5e1; }
    .icon { font-size: 1.5rem; }
  </style>
</head>
<body>
  <div class="slide">
    <h2>What You Can Do</h2>
    <ul>
      <li><span class="icon">⚡</span> Write slides in pure HTML, CSS &amp; JS</li>
      <li><span class="icon">🎨</span> Apply templates or start from scratch</li>
      <li><span class="icon">📺</span> Present fullscreen with transitions</li>
      <li><span class="icon">💾</span> Auto-save &amp; export as JSON or HTML</li>
    </ul>
  </div>
</body>
</html>`,
    },
  ],
};
