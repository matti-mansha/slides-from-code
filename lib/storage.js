const DECK_KEY = 'sfc-deck-v2';

export function saveDeck(deckTitle, slides) {
  try {
    localStorage.setItem(
      DECK_KEY,
      JSON.stringify({ version: 2, deckTitle, slides, savedAt: Date.now() })
    );
    return true;
  } catch {
    return false;
  }
}

export function loadDeck() {
  try {
    const raw = localStorage.getItem(DECK_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!Array.isArray(data.slides) || data.slides.length === 0) return null;
    return data;
  } catch {
    return null;
  }
}

export function clearDeck() {
  try {
    localStorage.removeItem(DECK_KEY);
  } catch {}
}
