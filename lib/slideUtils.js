const INTER_FONT_LINK = `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap" rel="stylesheet">`;

/**
 * Injects the Inter font link into the HTML <head> if it doesn't already
 * load from fonts.googleapis.com. This ensures slides that declare
 * font-family: Inter render correctly inside sandboxed iframes, where the
 * parent app's loaded fonts are not inherited.
 */
export function ensureInterFont(html) {
  if (!html || html.includes('fonts.googleapis.com')) return html;
  return html.replace(/(<head[^>]*>)/i, `$1\n  ${INTER_FONT_LINK}`);
}
