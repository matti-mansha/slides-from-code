export const defaultSlideCode = `<!doctype html>
<html>
  <head>
    <style>
      body {
        margin: 0;
        width: 100vw;
        height: 100vh;
        display: grid;
        place-items: center;
        background: linear-gradient(140deg, #0f172a, #312e81);
        color: #ffffff;
        font-family: Inter, system-ui, sans-serif;
      }
      h1 {
        font-size: 3.2rem;
        margin: 0;
      }
      p {
        margin-top: 0.6rem;
        color: #dbeafe;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>Slides from Code</h1>
      <p>Edit code to build your deck.</p>
    </main>
  </body>
</html>`;

export const initialDeck = {
  title: 'Untitled Deck',
  slides: [
    {
      id: 'slide-1',
      title: 'Intro',
      code: defaultSlideCode,
    },
  ],
};
