/**
 * The board's text fonts (see data/fonts.ts). They must be present wherever the board is
 * embedded, so the board loads them itself instead of relying on the host page.
 */
export const DRAWCUSTOM_FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&family=Bungee' +
  '&family=Dancing+Script:wght@500;700&family=Lobster&family=Mali:wght@500;600;700&family=Pangolin' +
  '&family=Patrick+Hand&family=Playfair+Display:wght@500;700&family=Space+Mono:wght@400;700&display=swap';

const LINK_ID = 'drawcustom-fonts';

/** Adds the font stylesheet to <head> once per page (no-op if already there). */
export function ensureDrawCustomFonts(): void {
  if (typeof document === 'undefined' || document.getElementById(LINK_ID)) return;
  const link = document.createElement('link');
  link.id = LINK_ID;
  link.rel = 'stylesheet';
  link.href = DRAWCUSTOM_FONTS_URL;
  document.head.appendChild(link);
}
