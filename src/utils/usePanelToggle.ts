import { useCallback, useState } from 'react';

/**
 * Show/hide state for a floating panel, remembered per browser.
 * First visit: open on a wide board; on a compact one (phone / small embed) use `openWhenCompact`.
 */
export function usePanelToggle(
  key: string,
  isCompact: boolean,
  openWhenCompact = false,
  /** Host's first-visit choice; overrides the defaults above when set. */
  hostDefault?: boolean
): [boolean, () => void] {
  const storageKey = `drawcustom.panel.${key}`;
  const [open, setOpen] = useState<boolean>(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved === '1' || saved === '0') return saved === '1';
    } catch {
      // Storage blocked: fall back to the default below
    }
    if (hostDefault !== undefined) return hostDefault;
    return isCompact ? openWhenCompact : true;
  });

  const toggle = useCallback(() => {
    setOpen((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(storageKey, next ? '1' : '0');
      } catch {
        // Ignore: the toggle still works for this session
      }
      return next;
    });
  }, [storageKey]);

  return [open, toggle];
}
