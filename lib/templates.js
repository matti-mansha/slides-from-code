export const SLIDE_TEMPLATES = [
  {
    id: 'title-dark',
    name: 'Title Slide',
    category: 'Intro',
    description: 'Bold centered title with gradient',
    thumbGradient: 'linear-gradient(135deg, #0f172a 0%, #312e81 100%)',
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
    .sub { font-size: 1.4rem; color: #94a3b8; text-align: center; }
  </style>
</head>
<body>
  <p class="eyebrow">Your Company</p>
  <h1>Presentation Title</h1>
  <p class="sub">A compelling subtitle goes here</p>
</body>
</html>`,
  },
  {
    id: 'bullets',
    name: 'Bullet Points',
    category: 'Content',
    description: 'Title with a bulleted list',
    thumbGradient: 'linear-gradient(135deg, #0f2027 0%, #2c5364 100%)',
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
    li { display: flex; align-items: flex-start; gap: 12px; font-size: 1.3rem; color: #cbd5e1; }
    li::before { content: '▸'; color: #818cf8; flex-shrink: 0; margin-top: 3px; }
  </style>
</head>
<body>
  <div class="slide">
    <h2>Key Points</h2>
    <ul>
      <li>First important point goes here</li>
      <li>Second point with supporting detail</li>
      <li>Third point to reinforce the message</li>
      <li>Fourth point wrapping up the ideas</li>
    </ul>
  </div>
</body>
</html>`,
  },
  {
    id: 'two-column',
    name: 'Two Column',
    category: 'Layout',
    description: 'Split layout with two content columns',
    thumbGradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    code: `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 100vw; height: 100vh;
      background: #111827; color: #e5e7eb;
      font-family: Inter, system-ui, sans-serif;
    }
    .slide { height: 100%; padding: 50px 60px; display: flex; flex-direction: column; }
    h2 { font-size: 2.2rem; font-weight: 700; color: #fff; margin-bottom: 2rem; }
    .cols { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; flex: 1; }
    .col {
      background: #1f2937; border-radius: 12px; padding: 28px;
      border: 1px solid #374151;
    }
    .col h3 {
      font-size: 1rem; font-weight: 600; color: #818cf8;
      margin-bottom: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em;
    }
    .col p { font-size: 1rem; color: #9ca3af; line-height: 1.7; }
  </style>
</head>
<body>
  <div class="slide">
    <h2>Comparing Two Approaches</h2>
    <div class="cols">
      <div class="col">
        <h3>Option A</h3>
        <p>Description of the first option. Explain the benefits and trade-offs clearly.</p>
      </div>
      <div class="col">
        <h3>Option B</h3>
        <p>Description of the second option. Explain the benefits and trade-offs clearly.</p>
      </div>
    </div>
  </div>
</body>
</html>`,
  },
  {
    id: 'code-slide',
    name: 'Code Snippet',
    category: 'Technical',
    description: 'Code block with syntax highlight theme',
    thumbGradient: '#0d1117',
    code: `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 100vw; height: 100vh;
      background: #0d1117; color: #e6edf3;
      font-family: Inter, system-ui, sans-serif;
    }
    .slide { height: 100%; padding: 50px 60px; display: flex; flex-direction: column; }
    h2 { font-size: 2rem; font-weight: 700; color: #fff; margin-bottom: 1.5rem; }
    pre {
      background: #161b22; border: 1px solid #30363d;
      border-radius: 12px; padding: 28px;
      font-size: 1.05rem; line-height: 1.7; flex: 1; overflow: auto;
      font-family: 'SF Mono', Consolas, 'Courier New', monospace;
    }
    .kw { color: #ff7b72; }
    .fn { color: #d2a8ff; }
    .str { color: #a5d6ff; }
    .cmt { color: #8b949e; font-style: italic; }
    .num { color: #79c0ff; }
    .op { color: #ff7b72; }
  </style>
</head>
<body>
  <div class="slide">
    <h2>Code Example</h2>
    <pre><code><span class="cmt">// Fetch data with error handling</span>
<span class="kw">async function</span> <span class="fn">fetchData</span>(url) {
  <span class="kw">const</span> response = <span class="kw">await</span> <span class="fn">fetch</span>(url);

  <span class="kw">if</span> (!response.ok) {
    <span class="kw">throw new</span> Error(<span class="str">\`HTTP \${response.status}\`</span>);
  }

  <span class="kw">return</span> response.<span class="fn">json</span>();
}</code></pre>
  </div>
</body>
</html>`,
  },
  {
    id: 'stats',
    name: 'Stats / Numbers',
    category: 'Data',
    description: 'Large impactful numbers with labels',
    thumbGradient: 'linear-gradient(135deg, #0f172a 0%, #042f2e 100%)',
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
      background: linear-gradient(135deg, #0f172a 0%, #042f2e 100%);
      color: #fff; font-family: Inter, system-ui, sans-serif;
    }
    h2 { font-size: 1.6rem; color: #94a3b8; margin-bottom: 3.5rem; }
    .stats { display: flex; gap: 80px; }
    .stat { text-align: center; }
    .num { font-size: 5rem; font-weight: 900; color: #34d399; line-height: 1; }
    .label { margin-top: 0.6rem; font-size: 1rem; color: #94a3b8; letter-spacing: 0.08em; text-transform: uppercase; }
  </style>
</head>
<body>
  <h2>Our Impact This Year</h2>
  <div class="stats">
    <div class="stat">
      <div class="num">99%</div>
      <div class="label">Uptime</div>
    </div>
    <div class="stat">
      <div class="num">50K+</div>
      <div class="label">Users</div>
    </div>
    <div class="stat">
      <div class="num">4.9★</div>
      <div class="label">Rating</div>
    </div>
  </div>
</body>
</html>`,
  },
  {
    id: 'quote',
    name: 'Quote',
    category: 'Intro',
    description: 'Large inspirational pull quote',
    thumbGradient: '#1e1b4b',
    code: `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 100vw; height: 100vh;
      display: flex; align-items: center; justify-content: center;
      background: #1e1b4b;
      font-family: Georgia, 'Times New Roman', serif;
    }
    .quote { max-width: 820px; text-align: center; padding: 40px; }
    .marks { font-size: 7rem; line-height: 0.5; color: #4338ca; display: block; margin-bottom: 0.8rem; }
    blockquote {
      font-size: 2rem; line-height: 1.5; color: #e0e7ff;
      margin: 1rem 0; font-style: italic;
    }
    cite {
      font-size: 1rem; color: #818cf8; font-style: normal;
      font-family: Inter, system-ui, sans-serif;
    }
  </style>
</head>
<body>
  <div class="quote">
    <span class="marks">"</span>
    <blockquote>The best way to predict the future is to create it.</blockquote>
    <cite>— Peter Drucker</cite>
  </div>
</body>
</html>`,
  },
  {
    id: 'section-break',
    name: 'Section Break',
    category: 'Layout',
    description: 'Visual divider slide between sections',
    thumbGradient: 'linear-gradient(90deg, #4f46e5 0%, #7c3aed 100%)',
    code: `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 100vw; height: 100vh;
      display: flex; align-items: center; justify-content: center;
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      color: #fff; font-family: Inter, system-ui, sans-serif;
    }
    .content { text-align: center; }
    .section-num {
      font-size: 0.9rem; letter-spacing: 0.3em;
      text-transform: uppercase; color: #c4b5fd; margin-bottom: 1rem;
    }
    h1 { font-size: 4rem; font-weight: 800; }
    .line { width: 80px; height: 4px; background: #c4b5fd; margin: 1.5rem auto; border-radius: 2px; }
    .sub { font-size: 1.2rem; color: #ddd6fe; }
  </style>
</head>
<body>
  <div class="content">
    <p class="section-num">Section 01</p>
    <h1>Getting Started</h1>
    <div class="line"></div>
    <p class="sub">Let's dive in</p>
  </div>
</body>
</html>`,
  },
  {
    id: 'timeline',
    name: 'Timeline',
    category: 'Data',
    description: 'Horizontal timeline with milestones',
    thumbGradient: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)',
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
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      padding: 60px;
    }
    h2 { font-size: 2.2rem; font-weight: 700; margin-bottom: 3rem; color: #fff; }
    .timeline { position: relative; width: 100%; }
    .line {
      position: absolute; top: 20px; left: 0; right: 0;
      height: 2px; background: #1e3a5f;
    }
    .line-fill {
      position: absolute; top: 20px; left: 0; width: 75%;
      height: 2px; background: linear-gradient(90deg, #6366f1, #8b5cf6);
    }
    .steps { display: flex; justify-content: space-between; position: relative; }
    .step { text-align: center; flex: 1; }
    .dot {
      width: 40px; height: 40px; border-radius: 50%;
      background: #1e3a5f; border: 2px solid #334155;
      margin: 0 auto 12px; display: grid; place-items: center;
      font-weight: 700; font-size: 0.85rem; color: #64748b;
    }
    .step.done .dot { background: #6366f1; border-color: #818cf8; color: #fff; }
    .step.current .dot { background: #8b5cf6; border-color: #a78bfa; color: #fff; box-shadow: 0 0 0 6px rgba(139,92,246,0.2); }
    .step-title { font-size: 0.9rem; font-weight: 600; color: #94a3b8; }
    .step.done .step-title, .step.current .step-title { color: #e2e8f0; }
    .step-date { font-size: 0.75rem; color: #475569; margin-top: 4px; }
  </style>
</head>
<body>
  <h2>Project Milestones</h2>
  <div class="timeline">
    <div class="line"></div>
    <div class="line-fill"></div>
    <div class="steps">
      <div class="step done">
        <div class="dot">✓</div>
        <div class="step-title">Discovery</div>
        <div class="step-date">Jan 2025</div>
      </div>
      <div class="step done">
        <div class="dot">✓</div>
        <div class="step-title">Design</div>
        <div class="step-date">Feb 2025</div>
      </div>
      <div class="step done">
        <div class="dot">✓</div>
        <div class="step-title">Build</div>
        <div class="step-date">Mar 2025</div>
      </div>
      <div class="step current">
        <div class="dot">4</div>
        <div class="step-title">Launch</div>
        <div class="step-date">Apr 2025</div>
      </div>
      <div class="step">
        <div class="dot">5</div>
        <div class="step-title">Scale</div>
        <div class="step-date">Q3 2025</div>
      </div>
    </div>
  </div>
</body>
</html>`,
  },
  {
    id: 'blank-dark',
    name: 'Blank Dark',
    category: 'Basic',
    description: 'Empty dark canvas to start from scratch',
    thumbGradient: '#0f172a',
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
      display: flex; align-items: center; justify-content: center;
    }
  </style>
</head>
<body>
  <!-- Your content here -->
</body>
</html>`,
  },
  {
    id: 'blank-light',
    name: 'Blank Light',
    category: 'Basic',
    description: 'Empty white canvas to start from scratch',
    thumbGradient: '#f8fafc',
    code: `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 100vw; height: 100vh;
      background: #ffffff; color: #1e293b;
      font-family: Inter, system-ui, sans-serif;
      display: flex; align-items: center; justify-content: center;
    }
  </style>
</head>
<body>
  <!-- Your content here -->
</body>
</html>`,
  },
];
