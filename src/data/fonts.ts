export interface FontOption {
  id: string;
  label: string;
  category: 'Cơ bản' | 'Viết tay' | 'Retro';
  cssFamily: string;
}

export const FONT_OPTIONS: FontOption[] = [
  {
    id: 'be-vietnam',
    label: 'Be Vietnam Pro',
    category: 'Cơ bản',
    cssFamily: "'Be Vietnam Pro', system-ui, sans-serif",
  },
  {
    id: 'patrick-hand',
    label: 'Patrick Hand',
    category: 'Viết tay',
    cssFamily: "'Patrick Hand', cursive",
  },
  {
    id: 'mali',
    label: 'Mali (Dễ thương)',
    category: 'Viết tay',
    cssFamily: "'Mali', cursive",
  },
  {
    id: 'pangolin',
    label: 'Pangolin (Doodle)',
    category: 'Viết tay',
    cssFamily: "'Pangolin', cursive",
  },
  {
    id: 'dancing-script',
    label: 'Dancing Script',
    category: 'Viết tay',
    cssFamily: "'Dancing Script', cursive",
  },
  {
    id: 'lobster',
    label: 'Lobster (Retro)',
    category: 'Retro',
    cssFamily: "'Lobster', cursive",
  },
  {
    id: 'bungee',
    label: 'Bungee (Poster)',
    category: 'Retro',
    cssFamily: "'Bungee', cursive",
  },
  {
    id: 'space-mono',
    label: 'Space Mono (Máy chữ)',
    category: 'Retro',
    cssFamily: "'Space Mono', monospace",
  },
  {
    id: 'playfair',
    label: 'Playfair (Cổ điển)',
    category: 'Retro',
    cssFamily: "'Playfair Display', serif",
  },
];

export const DEFAULT_FONT_FAMILY = FONT_OPTIONS[0].cssFamily;
