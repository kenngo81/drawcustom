export type IconPackName =
  | 'Doodle Pastel'
  | 'Cảm xúc & Trang trí'
  | 'Thú cưng & Đồ chơi'
  | 'Nét màu Marker'
  | 'Highlight Kawaii'
  | 'Kids Doodle'
  | 'Summer Vibes';

export interface CuteIconItem {
  id: string;
  name: string;
  pack: IconPackName;
  viewBox: string;
  svgMarkup: string;
}

export const CUTE_ICON_PACKS: CuteIconItem[] = [
  // === Doodle Pastel ===
  {
    id: 'heart-arrow',
    name: 'Tim mũi tên',
    pack: 'Doodle Pastel',
    viewBox: '0 0 64 64',
    svgMarkup: `
      <path d="M10 50 L54 14" stroke="#2b2d42" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M46 13 L55 13 L54 22" fill="none" stroke="#2b2d42" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M12 44 L8 52 L16 49" fill="#ffd166" stroke="#2b2d42" stroke-width="2" stroke-linejoin="round"/>
      <path d="M32 52 C18 42 12 33 12 24 C12 17 18 13 24 13 C28 13 30.8 15.2 32 18 C33.2 15.2 36 13 40 13 C46 13 52 17 52 24 C52 33 46 42 32 52 Z" fill="#ef476f" stroke="#2b2d42" stroke-width="2.5" stroke-linejoin="round"/>
    `,
  },
  {
    id: 'alarm-clock',
    name: 'Đồng hồ báo thức',
    pack: 'Doodle Pastel',
    viewBox: '0 0 64 64',
    svgMarkup: `
      <circle cx="15" cy="17" r="7" fill="#ff8fab" stroke="#2b2d42" stroke-width="2.5"/>
      <circle cx="49" cy="17" r="7" fill="#ff8fab" stroke="#2b2d42" stroke-width="2.5"/>
      <line x1="20" y1="50" x2="15" y2="56" stroke="#2b2d42" stroke-width="3" stroke-linecap="round"/>
      <line x1="44" y1="50" x2="49" y2="56" stroke="#2b2d42" stroke-width="3" stroke-linecap="round"/>
      <circle cx="32" cy="34" r="20" fill="#ff8fab" stroke="#2b2d42" stroke-width="2.5"/>
      <circle cx="32" cy="34" r="14.5" fill="#fff1e6" stroke="#2b2d42" stroke-width="2"/>
      <path d="M32 24 V34 L39 38" fill="none" stroke="#2b2d42" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    `,
  },
  {
    id: 'star-shine',
    name: 'Ngôi sao lấp lánh',
    pack: 'Doodle Pastel',
    viewBox: '0 0 64 64',
    svgMarkup: `
      <path d="M32 8 L38.8 22.8 L55 24.8 L43 36 L46.2 52 L32 44.2 L17.8 52 L21 36 L9 24.8 L25.2 22.8 Z" fill="#ffd166" stroke="#2b2d42" stroke-width="2.5" stroke-linejoin="round"/>
      <circle cx="28" cy="31" r="1.6" fill="#2b2d42"/>
      <circle cx="36" cy="31" r="1.6" fill="#2b2d42"/>
      <path d="M29.5 35 Q32 37.5 34.5 35" fill="none" stroke="#2b2d42" stroke-width="1.8" stroke-linecap="round"/>
    `,
  },
  {
    id: 'cherry-pair',
    name: 'Quả Cherry',
    pack: 'Doodle Pastel',
    viewBox: '0 0 64 64',
    svgMarkup: `
      <path d="M22 40 C22 26 28 16 36 10" fill="none" stroke="#2b2d42" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M43 41 C43 27 40 18 36 10" fill="none" stroke="#2b2d42" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M36 10 C42 8 50 11 52 17 C45 19 38 17 36 10 Z" fill="#8ac926" stroke="#2b2d42" stroke-width="2.2" stroke-linejoin="round"/>
      <circle cx="21" cy="45" r="10" fill="#ef476f" stroke="#2b2d42" stroke-width="2.5"/>
      <circle cx="43" cy="46" r="10" fill="#ef476f" stroke="#2b2d42" stroke-width="2.5"/>
      <circle cx="17.5" cy="41.5" r="2" fill="#ffffff"/>
      <circle cx="39.5" cy="42.5" r="2" fill="#ffffff"/>
    `,
  },
  {
    id: 'saturn-planet',
    name: 'Hành tinh Saturn',
    pack: 'Doodle Pastel',
    viewBox: '0 0 64 64',
    svgMarkup: `
      <circle cx="32" cy="32" r="14" fill="#64dfdf" stroke="#2b2d42" stroke-width="2.5"/>
      <ellipse cx="32" cy="32" rx="26" ry="7.5" transform="rotate(-22 32 32)" fill="none" stroke="#ff6b6b" stroke-width="5"/>
      <ellipse cx="32" cy="32" rx="26" ry="7.5" transform="rotate(-22 32 32)" fill="none" stroke="#2b2d42" stroke-width="2"/>
      <circle cx="27" cy="27" r="2.2" fill="#ffffff"/>
    `,
  },
  {
    id: 'diamond-gem',
    name: 'Kim cương xanh',
    pack: 'Doodle Pastel',
    viewBox: '0 0 64 64',
    svgMarkup: `
      <polygon points="18,14 46,14 56,27 32,53 8,27" fill="#72efdd" stroke="#2b2d42" stroke-width="2.5" stroke-linejoin="round"/>
      <line x1="8" y1="27" x2="56" y2="27" stroke="#2b2d42" stroke-width="2"/>
      <polyline points="18,14 24,27 32,53 40,27 46,14" fill="none" stroke="#2b2d42" stroke-width="2" stroke-linejoin="round"/>
    `,
  },
  {
    id: 'coffee-mug',
    name: 'Ly cà phê hồng',
    pack: 'Doodle Pastel',
    viewBox: '0 0 64 64',
    svgMarkup: `
      <path d="M44 26 H50 C54 26 56 29 56 33 C56 37 54 40 50 40 H44" fill="none" stroke="#2b2d42" stroke-width="3" stroke-linecap="round"/>
      <path d="M16 20 H44 V43 C44 49 39 54 33 54 H27 C21 54 16 49 16 43 Z" fill="#ffafcc" stroke="#2b2d42" stroke-width="2.5" stroke-linejoin="round"/>
      <ellipse cx="30" cy="20" rx="14" ry="4.5" fill="#9c6644" stroke="#2b2d42" stroke-width="2.2"/>
    `,
  },
  {
    id: 'rainbow-clouds',
    name: 'Cầu vồng & Mây',
    pack: 'Doodle Pastel',
    viewBox: '0 0 64 64',
    svgMarkup: `
      <path d="M14 40 A18 18 0 0 1 50 40" fill="none" stroke="#ef476f" stroke-width="4.5" stroke-linecap="round"/>
      <path d="M18.5 40 A13.5 13.5 0 0 1 45.5 40" fill="none" stroke="#ffd166" stroke-width="4" stroke-linecap="round"/>
      <path d="M23 40 A9 9 0 0 1 41 40" fill="none" stroke="#4cc9f0" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M8 44 C8 40 12 38 15 39 C17 36 22 37 22 41 C24 41 25 44 23 46 H10 C8 46 8 45 8 44 Z" fill="#bde0fe" stroke="#2b2d42" stroke-width="2" stroke-linejoin="round"/>
      <path d="M40 44 C40 40 44 38 47 39 C49 36 54 37 54 41 C56 41 57 44 55 46 H42 C40 46 40 45 40 44 Z" fill="#bde0fe" stroke="#2b2d42" stroke-width="2" stroke-linejoin="round"/>
    `,
  },
  {
    id: 'retro-camera',
    name: 'Máy ảnh Retro',
    pack: 'Doodle Pastel',
    viewBox: '0 0 64 64',
    svgMarkup: `
      <rect x="10" y="16" width="44" height="34" rx="10" fill="#48cae4" stroke="#2b2d42" stroke-width="2.5"/>
      <path d="M10 26 C10 19 15 16 20 16 H44 C49 16 54 19 54 26 V28 H10 Z" fill="#ff758f" stroke="#2b2d42" stroke-width="2.5"/>
      <rect x="39" y="19" width="8" height="5" rx="2" fill="#ffd166" stroke="#2b2d42" stroke-width="1.8"/>
      <circle cx="32" cy="36" r="10" fill="#edf2f4" stroke="#2b2d42" stroke-width="2.5"/>
      <circle cx="32" cy="36" r="6" fill="#4361ee" stroke="#2b2d42" stroke-width="2"/>
      <circle cx="30" cy="34" r="1.8" fill="#ffffff"/>
    `,
  },
  {
    id: 'sunny-sun',
    name: 'Mặt trời rực rỡ',
    pack: 'Doodle Pastel',
    viewBox: '0 0 64 64',
    svgMarkup: `
      <circle cx="32" cy="32" r="14" fill="#ffd166" stroke="#2b2d42" stroke-width="2.5"/>
      <path d="M32 7 V13 M32 51 V57 M7 32 H13 M51 32 H57 M14 14 L19 19 M45 45 L50 50 M50 14 L45 19 M19 45 L14 50" stroke="#ff758f" stroke-width="3.5" stroke-linecap="round"/>
      <circle cx="27" cy="30" r="1.8" fill="#2b2d42"/>
      <circle cx="37" cy="30" r="1.8" fill="#2b2d42"/>
      <path d="M28 35 Q32 39 36 35" fill="none" stroke="#2b2d42" stroke-width="2" stroke-linecap="round"/>
    `,
  },
  {
    id: 'cute-pencil',
    name: 'Bút chì màu',
    pack: 'Doodle Pastel',
    viewBox: '0 0 64 64',
    svgMarkup: `
      <g transform="rotate(35 32 32)">
        <rect x="24" y="10" width="16" height="9" rx="3" fill="#ffafcc" stroke="#2b2d42" stroke-width="2.3"/>
        <rect x="24" y="19" width="16" height="5" fill="#e5e5e5" stroke="#2b2d42" stroke-width="2.3"/>
        <rect x="24" y="24" width="16" height="22" fill="#ffd166" stroke="#2b2d42" stroke-width="2.3"/>
        <polygon points="24,46 40,46 32,58" fill="#f4d58d" stroke="#2b2d42" stroke-width="2.3" stroke-linejoin="round"/>
        <polygon points="29.5,54 34.5,54 32,58" fill="#2b2d42"/>
      </g>
    `,
  },

  // === Cảm xúc & Trang trí ===
  {
    id: 'speech-heart',
    name: 'Bong bóng tim',
    pack: 'Cảm xúc & Trang trí',
    viewBox: '0 0 64 64',
    svgMarkup: `
      <path d="M32 12 C18 12 8 20 8 30 C8 36 12 41 18 44 L15 53 L26 47 C28 47.5 30 48 32 48 C46 48 56 40 56 30 C56 20 46 12 32 12 Z" fill="#bde0fe" stroke="#2b2d42" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M32 39 C24 33 21 29 21 24.5 C21 21.5 23.5 19.5 26.5 19.5 C28.5 19.5 30.5 20.8 32 22.8 C33.5 20.8 35.5 19.5 37.5 19.5 C40.5 19.5 43 21.5 43 24.5 C43 29 40 33 32 39 Z" fill="#ef476f" stroke="#2b2d42" stroke-width="2"/>
    `,
  },
  {
    id: 'speech-zap',
    name: 'Bong bóng tia sét',
    pack: 'Cảm xúc & Trang trí',
    viewBox: '0 0 64 64',
    svgMarkup: `
      <path d="M32 12 C18 12 8 20 8 30 C8 36 12 41 18 44 L15 53 L26 47 C28 47.5 30 48 32 48 C46 48 56 40 56 30 C56 20 46 12 32 12 Z" fill="#6c63ff" stroke="#2b2d42" stroke-width="2.5" stroke-linejoin="round"/>
      <polygon points="35,19 25,31 31,31 28,42 39,29 33,29" fill="#ffd166" stroke="#2b2d42" stroke-width="1.8" stroke-linejoin="round"/>
    `,
  },
  {
    id: 'fluffy-cloud',
    name: 'Đám mây xanh',
    pack: 'Cảm xúc & Trang trí',
    viewBox: '0 0 64 64',
    svgMarkup: `
      <path d="M16 46 H49 C54 46 58 42 58 37 C58 32.5 54.5 29 50 28.5 C49 20 42 15 34 15 C27 15 21.5 19.5 20 26 C13 26.5 8 31.5 8 37.5 C8 42.2 11.5 46 16 46 Z" fill="#a8dadc" stroke="#2b2d42" stroke-width="2.5" stroke-linejoin="round"/>
      <circle cx="26" cy="34" r="1.8" fill="#2b2d42"/>
      <circle cx="38" cy="34" r="1.8" fill="#2b2d42"/>
      <path d="M29 38 Q32 41 35 38" fill="none" stroke="#2b2d42" stroke-width="2" stroke-linecap="round"/>
    `,
  },
  {
    id: 'sunflower',
    name: 'Hoa hướng dương',
    pack: 'Cảm xúc & Trang trí',
    viewBox: '0 0 64 64',
    svgMarkup: `
      <path d="M32 34 V56" stroke="#2b2d42" stroke-width="2.8" stroke-linecap="round"/>
      <path d="M32 46 C26 42 22 44 21 48 C25 50 30 49 32 46 Z" fill="#8ac926" stroke="#2b2d42" stroke-width="2"/>
      <path d="M32 43 C38 39 42 41 43 45 C39 47 34 46 32 43 Z" fill="#8ac926" stroke="#2b2d42" stroke-width="2"/>
      <circle cx="32" cy="22" r="13" fill="#ffd166" stroke="#2b2d42" stroke-width="2.5" stroke-dasharray="6 2"/>
      <circle cx="32" cy="22" r="7.5" fill="#9c6644" stroke="#2b2d42" stroke-width="2.2"/>
    `,
  },
  {
    id: 'thumbs-up',
    name: 'Like dễ thương',
    pack: 'Cảm xúc & Trang trí',
    viewBox: '0 0 64 64',
    svgMarkup: `
      <rect x="11" y="28" width="11" height="22" rx="3" fill="#ff758f" stroke="#2b2d42" stroke-width="2.5"/>
      <path d="M22 30 L30 14 C31.5 11 36 12 36 16 V26 H47 C51 26 53 29 52 33 L49 46 C48 49 45 50 42 50 H22 Z" fill="#ffcad4" stroke="#2b2d42" stroke-width="2.5" stroke-linejoin="round"/>
    `,
  },

  // === Thú cưng & Đồ chơi (Theo bộ ảnh 1 & 2) ===
  {
    id: 'cute-puppy',
    name: 'Cún con',
    pack: 'Thú cưng & Đồ chơi',
    viewBox: '0 0 64 64',
    svgMarkup: `
      <ellipse cx="17" cy="24" rx="6" ry="11" transform="rotate(14 17 24)" fill="#8d5524" stroke="#1e1e1e" stroke-width="2.5"/>
      <ellipse cx="47" cy="24" rx="6" ry="11" transform="rotate(-14 47 24)" fill="#8d5524" stroke="#1e1e1e" stroke-width="2.5"/>
      <rect x="20" y="34" width="24" height="20" rx="9" fill="#e0ac69" stroke="#1e1e1e" stroke-width="2.5"/>
      <path d="M44 46 Q52 44 51 37" fill="none" stroke="#1e1e1e" stroke-width="3" stroke-linecap="round"/>
      <circle cx="32" cy="23" r="14" fill="#e0ac69" stroke="#1e1e1e" stroke-width="2.5"/>
      <circle cx="37" cy="21" r="5" fill="#8d5524"/>
      <circle cx="26" cy="22" r="2" fill="#1e1e1e"/>
      <circle cx="37" cy="22" r="2" fill="#1e1e1e"/>
      <ellipse cx="32" cy="26" rx="2.5" ry="1.8" fill="#1e1e1e"/>
      <path d="M28 29 Q32 32 36 29" fill="none" stroke="#1e1e1e" stroke-width="2" stroke-linecap="round"/>
    `,
  },
  {
    id: 'cute-kitty',
    name: 'Mèo cam',
    pack: 'Thú cưng & Đồ chơi',
    viewBox: '0 0 64 64',
    svgMarkup: `
      <path d="M43 49 Q54 49 54 40" fill="none" stroke="#f4a261" stroke-width="5" stroke-linecap="round"/>
      <path d="M43 49 Q54 49 54 40" fill="none" stroke="#1e1e1e" stroke-width="2.4" stroke-linecap="round"/>
      <rect x="20" y="35" width="23" height="18" rx="8" fill="#f4a261" stroke="#1e1e1e" stroke-width="2.5"/>
      <polygon points="18,10 25,18 17,22" fill="#f4a261" stroke="#1e1e1e" stroke-width="2.5" stroke-linejoin="round"/>
      <polygon points="46,10 39,18 47,22" fill="#f4a261" stroke="#1e1e1e" stroke-width="2.5" stroke-linejoin="round"/>
      <ellipse cx="32" cy="25" rx="14" ry="12" fill="#f4a261" stroke="#1e1e1e" stroke-width="2.5"/>
      <circle cx="27" cy="23" r="2" fill="#1e1e1e"/>
      <circle cx="37" cy="23" r="2" fill="#1e1e1e"/>
      <path d="M29 27 Q32 30 35 27" fill="none" stroke="#1e1e1e" stroke-width="2" stroke-linecap="round"/>
      <line x1="12" y1="24" x2="19" y2="25" stroke="#1e1e1e" stroke-width="2" stroke-linecap="round"/>
      <line x1="45" y1="25" x2="52" y2="24" stroke="#1e1e1e" stroke-width="2" stroke-linecap="round"/>
    `,
  },
  {
    id: 'cute-frog',
    name: 'Ếch xanh',
    pack: 'Thú cưng & Đồ chơi',
    viewBox: '0 0 64 64',
    svgMarkup: `
      <circle cx="21" cy="17" r="6" fill="#70e000" stroke="#1e1e1e" stroke-width="2.5"/>
      <circle cx="43" cy="17" r="6" fill="#70e000" stroke="#1e1e1e" stroke-width="2.5"/>
      <ellipse cx="32" cy="43" rx="16" ry="11" fill="#70e000" stroke="#1e1e1e" stroke-width="2.5"/>
      <ellipse cx="32" cy="27" rx="17" ry="12" fill="#70e000" stroke="#1e1e1e" stroke-width="2.5"/>
      <circle cx="21" cy="17" r="2.2" fill="#1e1e1e"/>
      <circle cx="43" cy="17" r="2.2" fill="#1e1e1e"/>
      <circle cx="21" cy="29" r="3" fill="#ffafcc"/>
      <circle cx="43" cy="29" r="3" fill="#ffafcc"/>
      <path d="M25 30 Q32 35 39 30" fill="none" stroke="#1e1e1e" stroke-width="2.2" stroke-linecap="round"/>
    `,
  },
  {
    id: 'cute-butterfly',
    name: 'Bướm vàng',
    pack: 'Thú cưng & Đồ chơi',
    viewBox: '0 0 64 64',
    svgMarkup: `
      <ellipse cx="20" cy="24" rx="11" ry="9" transform="rotate(-20 20 24)" fill="#ffb703" stroke="#1e1e1e" stroke-width="2.5"/>
      <ellipse cx="44" cy="24" rx="11" ry="9" transform="rotate(20 44 24)" fill="#ffb703" stroke="#1e1e1e" stroke-width="2.5"/>
      <ellipse cx="22" cy="41" rx="8" ry="7" transform="rotate(15 22 41)" fill="#fb8500" stroke="#1e1e1e" stroke-width="2.5"/>
      <ellipse cx="42" cy="41" rx="8" ry="7" transform="rotate(-15 42 41)" fill="#fb8500" stroke="#1e1e1e" stroke-width="2.5"/>
      <rect x="29" y="20" width="6" height="28" rx="3" fill="#582f0e" stroke="#1e1e1e" stroke-width="2.2"/>
      <path d="M30 20 Q24 11 20 13 M34 20 Q40 11 44 13" fill="none" stroke="#1e1e1e" stroke-width="2.2" stroke-linecap="round"/>
    `,
  },
  {
    id: 'cute-snail',
    name: 'Ốc sên',
    pack: 'Thú cưng & Đồ chơi',
    viewBox: '0 0 64 64',
    svgMarkup: `
      <path d="M10 47 Q32 52 54 47 Q56 43 49 42 L20 42 Q14 34 12 28 Q9 28 9 36 Q9 44 10 47 Z" fill="#ffd166" stroke="#1e1e1e" stroke-width="2.5" stroke-linejoin="round"/>
      <circle cx="38" cy="34" r="14" fill="#f4a261" stroke="#1e1e1e" stroke-width="2.5"/>
      <path d="M38 34 C38 30 43 30 43 34 C43 39 34 40 34 33 C34 26 45 25 47 33" fill="none" stroke="#1e1e1e" stroke-width="2.2" stroke-linecap="round"/>
      <line x1="11" y1="28" x2="9" y2="20" stroke="#1e1e1e" stroke-width="2.2" stroke-linecap="round"/>
      <line x1="15" y1="28" x2="17" y2="20" stroke="#1e1e1e" stroke-width="2.2" stroke-linecap="round"/>
      <circle cx="9" cy="19" r="2" fill="#1e1e1e"/>
      <circle cx="17" cy="19" r="2" fill="#1e1e1e"/>
    `,
  },
  {
    id: 'cute-fish',
    name: 'Cá xanh',
    pack: 'Thú cưng & Đồ chơi',
    viewBox: '0 0 64 64',
    svgMarkup: `
      <polygon points="44,32 57,21 55,32 57,43" fill="#219ebc" stroke="#1e1e1e" stroke-width="2.5" stroke-linejoin="round"/>
      <ellipse cx="28" cy="32" rx="19" ry="13" fill="#4cc9f0" stroke="#1e1e1e" stroke-width="2.5"/>
      <path d="M23 20 Q28 11 35 19" fill="#219ebc" stroke="#1e1e1e" stroke-width="2.3"/>
      <circle cx="17" cy="29" r="2.2" fill="#1e1e1e"/>
      <path d="M25 26 Q28 32 25 38" fill="none" stroke="#1e1e1e" stroke-width="2" stroke-linecap="round"/>
    `,
  },
  {
    id: 'cute-bear',
    name: 'Gấu bông Teddy',
    pack: 'Thú cưng & Đồ chơi',
    viewBox: '0 0 64 64',
    svgMarkup: `
      <circle cx="19" cy="16" r="6" fill="#b07d62" stroke="#1e1e1e" stroke-width="2.5"/>
      <circle cx="45" cy="16" r="6" fill="#b07d62" stroke="#1e1e1e" stroke-width="2.5"/>
      <ellipse cx="32" cy="43" rx="12" ry="13" fill="#b07d62" stroke="#1e1e1e" stroke-width="2.5"/>
      <ellipse cx="32" cy="44" rx="7" ry="8" fill="#e6ccb2"/>
      <circle cx="32" cy="24" r="13" fill="#b07d62" stroke="#1e1e1e" stroke-width="2.5"/>
      <ellipse cx="32" cy="27" rx="5.5" ry="4" fill="#e6ccb2"/>
      <circle cx="27" cy="21" r="1.8" fill="#1e1e1e"/>
      <circle cx="37" cy="21" r="1.8" fill="#1e1e1e"/>
      <circle cx="32" cy="25.5" r="2" fill="#1e1e1e"/>
      <circle cx="17" cy="40" r="4.5" fill="#b07d62" stroke="#1e1e1e" stroke-width="2.3"/>
      <circle cx="47" cy="40" r="4.5" fill="#b07d62" stroke="#1e1e1e" stroke-width="2.3"/>
    `,
  },
  {
    id: 'cute-ladybug',
    name: 'Bọ rùa đỏ',
    pack: 'Thú cưng & Đồ chơi',
    viewBox: '0 0 64 64',
    svgMarkup: `
      <path d="M14 28 L8 25 M13 37 L7 38 M15 45 L10 49 M50 28 L56 25 M51 37 L57 38 M49 45 L54 49" stroke="#1e1e1e" stroke-width="2.4" stroke-linecap="round"/>
      <circle cx="32" cy="18" r="8" fill="#2b2d42" stroke="#1e1e1e" stroke-width="2.5"/>
      <ellipse cx="32" cy="37" rx="16" ry="17" fill="#ef476f" stroke="#1e1e1e" stroke-width="2.5"/>
      <line x1="32" y1="21" x2="32" y2="54" stroke="#1e1e1e" stroke-width="2.5"/>
      <circle cx="24" cy="31" r="3" fill="#1e1e1e"/>
      <circle cx="40" cy="31" r="3" fill="#1e1e1e"/>
      <circle cx="25" cy="43" r="2.8" fill="#1e1e1e"/>
      <circle cx="39" cy="43" r="2.8" fill="#1e1e1e"/>
    `,
  },
  {
    id: 'blue-car',
    name: 'Ô tô xanh',
    pack: 'Thú cưng & Đồ chơi',
    viewBox: '0 0 64 64',
    svgMarkup: `
      <path d="M18 32 L24 19 H42 L48 32 H54 C56 32 57 34 57 37 V44 H9 V36 C9 33 12 32 18 32 Z" fill="#4cc9f0" stroke="#1e1e1e" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M25 22 L21 31 H31 V22 Z M34 22 V31 H45 L41 22 Z" fill="#e0fbfc" stroke="#1e1e1e" stroke-width="2" stroke-linejoin="round"/>
      <circle cx="20" cy="45" r="6" fill="#4a4e69" stroke="#1e1e1e" stroke-width="2.5"/>
      <circle cx="45" cy="45" r="6" fill="#4a4e69" stroke="#1e1e1e" stroke-width="2.5"/>
      <circle cx="20" cy="45" r="2" fill="#ffffff"/>
      <circle cx="45" cy="45" r="2" fill="#ffffff"/>
    `,
  },
  {
    id: 'cozy-house',
    name: 'Ngôi nhà nhỏ',
    pack: 'Thú cưng & Đồ chơi',
    viewBox: '0 0 64 64',
    svgMarkup: `
      <rect x="14" y="13" width="6" height="12" fill="#e76f51" stroke="#1e1e1e" stroke-width="2.2"/>
      <rect x="14" y="30" width="36" height="24" fill="#ef476f" stroke="#1e1e1e" stroke-width="2.5"/>
      <polygon points="8,31 32,12 56,31" fill="#457b9d" stroke="#1e1e1e" stroke-width="2.5" stroke-linejoin="round"/>
      <rect x="27" y="40" width="10" height="14" rx="1" fill="#ffd166" stroke="#1e1e1e" stroke-width="2.2"/>
      <rect x="18" y="35" width="6" height="6" fill="#a8dadc" stroke="#1e1e1e" stroke-width="2"/>
      <rect x="40" y="35" width="6" height="6" fill="#a8dadc" stroke="#1e1e1e" stroke-width="2"/>
    `,
  },
  {
    id: 'space-rocket',
    name: 'Tên lửa',
    pack: 'Thú cưng & Đồ chơi',
    viewBox: '0 0 64 64',
    svgMarkup: `
      <path d="M18 46 L10 54 L22 50 Z" fill="#f77f00" stroke="#1e1e1e" stroke-width="2.2" stroke-linejoin="round"/>
      <path d="M22 36 L14 40 L20 45 Z M38 42 L34 50 L29 44 Z" fill="#ef476f" stroke="#1e1e1e" stroke-width="2.2" stroke-linejoin="round"/>
      <path d="M22 42 C24 25 36 14 50 14 C50 28 39 40 22 42 Z" fill="#4cc9f0" stroke="#1e1e1e" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M39 16 C44 15 48 14 50 14 C50 16 49 20 48 25 Z" fill="#ef476f" stroke="#1e1e1e" stroke-width="2"/>
      <circle cx="36" cy="28" r="4.5" fill="#ffffff" stroke="#1e1e1e" stroke-width="2.2"/>
    `,
  },
  {
    id: 'paper-plane',
    name: 'Máy bay giấy',
    pack: 'Thú cưng & Đồ chơi',
    viewBox: '0 0 64 64',
    svgMarkup: `
      <polygon points="8,30 56,14 42,48 29,37" fill="#90e0ef" stroke="#1e1e1e" stroke-width="2.5" stroke-linejoin="round"/>
      <polyline points="56,14 29,37 31,49 36,42" fill="#48cae4" stroke="#1e1e1e" stroke-width="2.2" stroke-linejoin="round"/>
      <path d="M14 44 Q18 52 12 56" fill="none" stroke="#1e1e1e" stroke-width="2" stroke-dasharray="3 3" stroke-linecap="round"/>
    `,
  },
  {
    id: 'idea-bulb',
    name: 'Bóng đèn ý tưởng',
    pack: 'Thú cưng & Đồ chơi',
    viewBox: '0 0 64 64',
    svgMarkup: `
      <path d="M32 6 V11 M14 14 L18 18 M50 14 L46 18 M9 28 H14 M50 28 H55" stroke="#1e1e1e" stroke-width="2.3" stroke-linecap="round"/>
      <path d="M22 28 C22 21 26.5 16 32 16 C37.5 16 42 21 42 28 C42 33 38 36 37 42 H27 C26 36 22 33 22 28 Z" fill="#ffd166" stroke="#1e1e1e" stroke-width="2.5" stroke-linejoin="round"/>
      <rect x="27" y="42" width="10" height="8" rx="2" fill="#adb5bd" stroke="#1e1e1e" stroke-width="2.3"/>
      <path d="M29 30 Q32 24 35 30" fill="none" stroke="#1e1e1e" stroke-width="2" stroke-linecap="round"/>
    `,
  },
  {
    id: 'ice-cream',
    name: 'Kem ốc quế',
    pack: 'Thú cưng & Đồ chơi',
    viewBox: '0 0 64 64',
    svgMarkup: `
      <polygon points="22,31 42,31 32,57" fill="#e09f5a" stroke="#1e1e1e" stroke-width="2.5" stroke-linejoin="round"/>
      <line x1="26" y1="38" x2="36" y2="44" stroke="#1e1e1e" stroke-width="1.8"/>
      <line x1="38" y1="38" x2="28" y2="44" stroke="#1e1e1e" stroke-width="1.8"/>
      <circle cx="24" cy="27" r="7" fill="#ff8fab" stroke="#1e1e1e" stroke-width="2.4"/>
      <circle cx="40" cy="27" r="7" fill="#ff8fab" stroke="#1e1e1e" stroke-width="2.4"/>
      <circle cx="32" cy="19" r="9.5" fill="#ffafcc" stroke="#1e1e1e" stroke-width="2.5"/>
    `,
  },
  {
    id: 'red-apple',
    name: 'Quả táo đỏ',
    pack: 'Thú cưng & Đồ chơi',
    viewBox: '0 0 64 64',
    svgMarkup: `
      <path d="M32 20 Q32 12 36 10" fill="none" stroke="#1e1e1e" stroke-width="2.8" stroke-linecap="round"/>
      <path d="M33 15 C39 10 46 12 47 17 C41 20 35 19 33 15 Z" fill="#8ac926" stroke="#1e1e1e" stroke-width="2.2"/>
      <path d="M32 22 C24 18 14 23 14 35 C14 47 22 54 29 53 C31 53 33 53 35 53 C42 54 50 47 50 35 C50 23 40 18 32 22 Z" fill="#ef476f" stroke="#1e1e1e" stroke-width="2.5"/>
      <path d="M21 29 Q19 34 21 39" fill="none" stroke="#ffffff" stroke-width="2.4" stroke-linecap="round"/>
    `,
  },
  {
    id: 'sail-boat',
    name: 'Thuyền buồm',
    pack: 'Thú cưng & Đồ chơi',
    viewBox: '0 0 64 64',
    svgMarkup: `
      <line x1="31" y1="10" x2="31" y2="44" stroke="#1e1e1e" stroke-width="2.8" stroke-linecap="round"/>
      <polygon points="31,12 14,39 31,39" fill="#fb8500" stroke="#1e1e1e" stroke-width="2.4" stroke-linejoin="round"/>
      <polygon points="34,15 50,39 34,39" fill="#ffb703" stroke="#1e1e1e" stroke-width="2.4" stroke-linejoin="round"/>
      <path d="M11 43 H53 L47 53 H17 Z" fill="#219ebc" stroke="#1e1e1e" stroke-width="2.5" stroke-linejoin="round"/>
    `,
  },
  {
    id: 'royal-crown',
    name: 'Vương miện vàng',
    pack: 'Thú cưng & Đồ chơi',
    viewBox: '0 0 64 64',
    svgMarkup: `
      <polygon points="12,48 10,22 22,32 32,16 42,32 54,22 52,48" fill="#ffd166" stroke="#1e1e1e" stroke-width="2.5" stroke-linejoin="round"/>
      <circle cx="10" cy="20" r="3" fill="#ffd166" stroke="#1e1e1e" stroke-width="2"/>
      <circle cx="32" cy="14" r="3.2" fill="#ffd166" stroke="#1e1e1e" stroke-width="2"/>
      <circle cx="54" cy="20" r="3" fill="#ffd166" stroke="#1e1e1e" stroke-width="2"/>
    `,
  },
  {
    id: 'red-mushroom',
    name: 'Nấm đỏ',
    pack: 'Thú cưng & Đồ chơi',
    viewBox: '0 0 64 64',
    svgMarkup: `
      <path d="M24 34 H40 L42 52 C42 54 38 55 32 55 C26 55 22 54 22 52 Z" fill="#ede0d4" stroke="#1e1e1e" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M11 35 C11 20 20 12 32 12 C44 12 53 20 53 35 Z" fill="#e63946" stroke="#1e1e1e" stroke-width="2.5" stroke-linejoin="round"/>
      <circle cx="23" cy="25" r="4" fill="#ffffff"/>
      <circle cx="39" cy="22" r="3.5" fill="#ffffff"/>
      <circle cx="43" cy="30" r="2.5" fill="#ffffff"/>
    `,
  },
  {
    id: 'green-tree',
    name: 'Cây xanh',
    pack: 'Thú cưng & Đồ chơi',
    viewBox: '0 0 64 64',
    svgMarkup: `
      <rect x="28" y="38" width="8" height="17" rx="2" fill="#7f5539" stroke="#1e1e1e" stroke-width="2.5"/>
      <path d="M20 40 C12 40 10 30 16 26 C15 17 22 10 32 10 C42 10 49 17 48 26 C54 30 52 40 44 40 Z" fill="#80ed99" stroke="#1e1e1e" stroke-width="2.5" stroke-linejoin="round"/>
    `,
  },
  {
    id: 'toy-drum',
    name: 'Trống đồ chơi',
    pack: 'Thú cưng & Đồ chơi',
    viewBox: '0 0 64 64',
    svgMarkup: `
      <line x1="12" y1="14" x2="26" y2="26" stroke="#7f5539" stroke-width="3.5" stroke-linecap="round"/>
      <line x1="52" y1="14" x2="38" y2="26" stroke="#7f5539" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M14 27 H50 V48 C50 53 42 55 32 55 C22 55 14 53 14 48 Z" fill="#ffd166" stroke="#1e1e1e" stroke-width="2.5"/>
      <ellipse cx="32" cy="27" rx="18" ry="6" fill="#fff3b0" stroke="#1e1e1e" stroke-width="2.5"/>
      <polyline points="14,34 23,51 32,33 41,51 50,34" fill="none" stroke="#e63946" stroke-width="2.5" stroke-linejoin="round"/>
    `,
  },

  // === Nét màu Marker (Theo bộ ảnh 3) ===
  {
    id: 'marker-watermelon',
    name: 'Miếng dưa hấu',
    pack: 'Nét màu Marker',
    viewBox: '0 0 64 64',
    svgMarkup: `
      <path d="M12 46 L32 12 L52 46 Q32 53 12 46 Z" fill="none" stroke="#f25c54" stroke-width="3.8" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M11 49 Q32 57 53 49" fill="none" stroke="#43aa8b" stroke-width="4.2" stroke-linecap="round"/>
      <circle cx="29" cy="31" r="1.8" fill="#495057"/>
      <circle cx="36" cy="35" r="1.8" fill="#495057"/>
      <circle cx="27" cy="40" r="1.8" fill="#495057"/>
    `,
  },
  {
    id: 'marker-pineapple',
    name: 'Quả dứa vàng',
    pack: 'Nét màu Marker',
    viewBox: '0 0 64 64',
    svgMarkup: `
      <path d="M24 22 L21 10 L30 18 L34 8 L38 18 L45 11 L40 22" fill="none" stroke="#43aa8b" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
      <ellipse cx="32" cy="38" rx="14" ry="17" fill="none" stroke="#f9c74f" stroke-width="3.8"/>
      <path d="M21 31 L41 47 M21 45 L41 29" fill="none" stroke="#f9c74f" stroke-width="2.6" stroke-linecap="round"/>
    `,
  },
  {
    id: 'marker-strawberry',
    name: 'Dâu tây hồng',
    pack: 'Nét màu Marker',
    viewBox: '0 0 64 64',
    svgMarkup: `
      <path d="M22 20 Q27 11 32 18 Q37 11 42 20" fill="none" stroke="#43aa8b" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M16 24 C16 19 48 19 48 24 C48 40 38 53 32 53 C26 53 16 40 16 24 Z" fill="none" stroke="#f25c54" stroke-width="3.8" stroke-linejoin="round"/>
      <circle cx="26" cy="31" r="1.6" fill="#f25c54"/>
      <circle cx="38" cy="31" r="1.6" fill="#f25c54"/>
      <circle cx="32" cy="39" r="1.6" fill="#f25c54"/>
    `,
  },
  {
    id: 'marker-bow',
    name: 'Nơ hồng dễ thương',
    pack: 'Nét màu Marker',
    viewBox: '0 0 64 64',
    svgMarkup: `
      <path d="M32 30 C20 18 10 20 10 30 C10 40 20 42 32 30 Z" fill="none" stroke="#f472b6" stroke-width="3.5" stroke-linejoin="round"/>
      <path d="M32 30 C44 18 54 20 54 30 C54 40 44 42 32 30 Z" fill="none" stroke="#f472b6" stroke-width="3.5" stroke-linejoin="round"/>
      <circle cx="32" cy="30" r="4" fill="none" stroke="#f472b6" stroke-width="3.2"/>
      <path d="M29 34 L22 49 M35 34 L42 49" fill="none" stroke="#f472b6" stroke-width="3.2" stroke-linecap="round"/>
    `,
  },
  {
    id: 'marker-rain-cloud',
    name: 'Mây mưa xanh',
    pack: 'Nét màu Marker',
    viewBox: '0 0 64 64',
    svgMarkup: `
      <path d="M16 36 H48 C53 36 56 32 56 28 C56 24 52.5 21 48.5 20.5 C47 13 40 9 32 9 C25 9 20 13 18.5 19 C12 19.5 8 23.5 8 28.5 C8 32.8 11.5 36 16 36 Z" fill="none" stroke="#4d7ea8" stroke-width="3.5" stroke-linejoin="round"/>
      <path d="M20 44 L18 51 M32 45 L30 53 M44 44 L42 51" fill="none" stroke="#4d7ea8" stroke-width="3.5" stroke-linecap="round"/>
    `,
  },
  {
    id: 'marker-music-note',
    name: 'Nốt nhạc cam',
    pack: 'Nét màu Marker',
    viewBox: '0 0 64 64',
    svgMarkup: `
      <polyline points="23,44 23,16 47,12 47,40" fill="none" stroke="#f8961e" stroke-width="3.8" stroke-linecap="round" stroke-linejoin="round"/>
      <line x1="23" y1="24" x2="47" y2="20" stroke="#f8961e" stroke-width="3.2" stroke-linecap="round"/>
      <circle cx="18" cy="46" r="6" fill="none" stroke="#f8961e" stroke-width="3.8"/>
      <circle cx="42" cy="42" r="6" fill="none" stroke="#f8961e" stroke-width="3.8"/>
    `,
  },
  {
    id: 'marker-shell',
    name: 'Vỏ sò tím',
    pack: 'Nét màu Marker',
    viewBox: '0 0 64 64',
    svgMarkup: `
      <path d="M12 36 C12 20 20 14 32 14 C44 14 52 20 52 36 C45 46 39 50 32 50 C25 50 19 46 12 36 Z" fill="none" stroke="#577590" stroke-width="3.5" stroke-linejoin="round"/>
      <path d="M32 50 V15 M32 50 L21 18 M32 50 L43 18" fill="none" stroke="#577590" stroke-width="2.8" stroke-linecap="round"/>
    `,
  },
  {
    id: 'marker-popsicle',
    name: 'Kem que tím',
    pack: 'Nét màu Marker',
    viewBox: '0 0 64 64',
    svgMarkup: `
      <path d="M22 20 C22 12 42 12 42 20 V40 H22 Z" fill="none" stroke="#b565a7" stroke-width="3.8" stroke-linejoin="round"/>
      <line x1="32" y1="40" x2="32" y2="55" stroke="#f4a261" stroke-width="4.5" stroke-linecap="round"/>
      <circle cx="29" cy="24" r="1.6" fill="#b565a7"/>
      <circle cx="36" cy="29" r="1.6" fill="#b565a7"/>
      <circle cx="28" cy="34" r="1.6" fill="#b565a7"/>
    `,
  },

  // === Highlight Kawaii (inspired by highlight hand drawn icons) ===
  {
    id: 'hw-bunting',
    name: 'Cờ trang trí',
    pack: 'Highlight Kawaii',
    viewBox: '0 0 64 64',
    svgMarkup: `
      <line x1="8" y1="18" x2="56" y2="14" stroke="#2b2d42" stroke-width="2.5" stroke-linecap="round"/>
      <polygon points="14,18 22,18 18,32" fill="#f94144" stroke="#2b2d42" stroke-width="2"/>
      <polygon points="24,17 32,17 28,31" fill="#f9c74f" stroke="#2b2d42" stroke-width="2"/>
      <polygon points="34,16 42,16 38,30" fill="#43aa8b" stroke="#2b2d42" stroke-width="2"/>
      <polygon points="44,15 52,15 48,29" fill="#577590" stroke="#2b2d42" stroke-width="2"/>
    `,
  },
  {
    id: 'hw-tomato',
    name: 'Cà chua đỏ',
    pack: 'Highlight Kawaii',
    viewBox: '0 0 64 64',
    svgMarkup: `
      <path d="M28 15 Q32 10 36 15" fill="none" stroke="#43aa8b" stroke-width="3" stroke-linecap="round"/>
      <ellipse cx="32" cy="36" rx="17" ry="16" fill="#e63946" stroke="#2b2d42" stroke-width="2.5"/>
      <path d="M20 30 Q32 24 44 30" fill="none" stroke="#f25c54" stroke-width="2" stroke-linecap="round"/>
      <circle cx="24" cy="32" r="2" fill="#ffffff" opacity="0.5"/>
    `,
  },
  {
    id: 'hw-storm-cloud',
    name: 'Mây sấm sét',
    pack: 'Highlight Kawaii',
    viewBox: '0 0 64 64',
    svgMarkup: `
      <path d="M15 34 H49 C54 34 57 30 57 26 C57 22 53.5 19 49.5 18.5 C48 11 41 7 33 7 C26 7 21 11 19.5 17 C13 17.5 9 21.5 9 26.5 C9 30.8 12.5 34 15 34 Z" fill="#90cdf4" stroke="#2b2d42" stroke-width="2.5" stroke-linejoin="round"/>
      <polygon points="27,38 20,50 29,46 24,56" fill="#ffd166" stroke="#2b2d42" stroke-width="2" stroke-linejoin="round"/>
    `,
  },
  {
    id: 'hw-rainbow-full',
    name: 'Cầu vồng lớn',
    pack: 'Highlight Kawaii',
    viewBox: '0 0 64 64',
    svgMarkup: `
      <path d="M8 48 A24 24 0 0 1 56 48" fill="none" stroke="#e63946" stroke-width="4" stroke-linecap="round"/>
      <path d="M13 48 A19 19 0 0 1 51 48" fill="none" stroke="#f8961e" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M17.5 48 A14.5 14.5 0 0 1 46.5 48" fill="none" stroke="#f9c74f" stroke-width="3" stroke-linecap="round"/>
      <path d="M22 48 A10 10 0 0 1 42 48" fill="none" stroke="#43aa8b" stroke-width="2.8" stroke-linecap="round"/>
      <path d="M26 48 A6 6 0 0 1 38 48" fill="none" stroke="#277da1" stroke-width="2.5" stroke-linecap="round"/>
    `,
  },
  {
    id: 'hw-rainbow-cloud',
    name: 'Cầu vồng mini',
    pack: 'Highlight Kawaii',
    viewBox: '0 0 64 64',
    svgMarkup: `
      <path d="M16 42 A16 16 0 0 1 48 42" fill="none" stroke="#e63946" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M20 42 A12 12 0 0 1 44 42" fill="none" stroke="#ffd166" stroke-width="3" stroke-linecap="round"/>
      <path d="M24 42 A8 8 0 0 1 40 42" fill="none" stroke="#43aa8b" stroke-width="2.8" stroke-linecap="round"/>
      <path d="M6 46 C6 42 10 40 13 41 C15 38 20 39 20 43 C22 43 23 46 21 48 H8 C6 48 6 47 6 46 Z" fill="#bde0fe" stroke="#2b2d42" stroke-width="2"/>
      <path d="M42 46 C42 42 46 40 49 41 C51 38 56 39 56 43 C58 43 59 46 57 48 H44 C42 48 42 47 42 46 Z" fill="#bde0fe" stroke="#2b2d42" stroke-width="2"/>
    `,
  },
  {
    id: 'hw-castle',
    name: 'Lâu đài cổ tích',
    pack: 'Highlight Kawaii',
    viewBox: '0 0 64 64',
    svgMarkup: `
      <rect x="20" y="28" width="24" height="26" fill="#48cae4" stroke="#2b2d42" stroke-width="2.5"/>
      <rect x="14" y="22" width="8" height="32" fill="#90e0ef" stroke="#2b2d42" stroke-width="2.3"/>
      <rect x="42" y="22" width="8" height="32" fill="#90e0ef" stroke="#2b2d42" stroke-width="2.3"/>
      <polygon points="14,22 18,12 22,22" fill="#f9c74f" stroke="#2b2d42" stroke-width="2"/>
      <polygon points="42,22 46,12 50,22" fill="#f9c74f" stroke="#2b2d42" stroke-width="2"/>
      <polygon points="20,28 32,16 44,28" fill="#f9c74f" stroke="#2b2d42" stroke-width="2.3"/>
      <rect x="28" y="40" width="8" height="14" rx="4" fill="#ffd166" stroke="#2b2d42" stroke-width="2"/>
    `,
  },
  {
    id: 'hw-book',
    name: 'Cuốn sách',
    pack: 'Highlight Kawaii',
    viewBox: '0 0 64 64',
    svgMarkup: `
      <rect x="14" y="12" width="36" height="40" rx="3" fill="#43aa8b" stroke="#2b2d42" stroke-width="2.5"/>
      <rect x="18" y="12" width="32" height="40" rx="2" fill="#f0efeb" stroke="#2b2d42" stroke-width="2.5"/>
      <line x1="18" y1="12" x2="18" y2="52" stroke="#2b2d42" stroke-width="2.5"/>
      <rect x="24" y="20" width="20" height="4" rx="1" fill="#ffd166" stroke="none"/>
      <rect x="24" y="28" width="14" height="3" rx="1" fill="#bde0fe" stroke="none"/>
    `,
  },
  {
    id: 'hw-retro-phone',
    name: 'Điện thoại cổ',
    pack: 'Highlight Kawaii',
    viewBox: '0 0 64 64',
    svgMarkup: `
      <rect x="16" y="22" width="32" height="28" rx="8" fill="#48cae4" stroke="#2b2d42" stroke-width="2.5"/>
      <circle cx="32" cy="38" r="10" fill="#f0efeb" stroke="#2b2d42" stroke-width="2.3"/>
      <circle cx="32" cy="38" r="4" fill="#48cae4" stroke="#2b2d42" stroke-width="2"/>
      <path d="M20 24 C16 20 14 14 18 10 Q28 6 32 14" fill="none" stroke="#2b2d42" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M44 24 C48 20 50 14 46 10 Q36 6 32 14" fill="none" stroke="#2b2d42" stroke-width="3.5" stroke-linecap="round"/>
      <circle cx="24" cy="34" r="2" fill="#2b2d42"/>
      <circle cx="40" cy="34" r="2" fill="#2b2d42"/>
      <circle cx="38" cy="43" r="2" fill="#2b2d42"/>
      <circle cx="26" cy="43" r="2" fill="#2b2d42"/>
    `,
  },
  {
    id: 'hw-pin-heart',
    name: 'Ghim trái tim',
    pack: 'Highlight Kawaii',
    viewBox: '0 0 64 64',
    svgMarkup: `
      <path d="M32 56 L32 28" stroke="#2b2d42" stroke-width="3" stroke-linecap="round"/>
      <path d="M32 28 C20 22 14 16 14 11 C14 6 18 3 23 3 C27 3 30 5 32 8 C34 5 37 3 41 3 C46 3 50 6 50 11 C50 16 44 22 32 28 Z" fill="#ef476f" stroke="#2b2d42" stroke-width="2.5"/>
    `,
  },
  {
    id: 'hw-leaf-branch',
    name: 'Cành lá xanh',
    pack: 'Highlight Kawaii',
    viewBox: '0 0 64 64',
    svgMarkup: `
      <path d="M32 56 Q32 30 32 10" fill="none" stroke="#43aa8b" stroke-width="3" stroke-linecap="round"/>
      <path d="M32 44 C22 42 18 36 20 30 C24 32 30 38 32 44 Z" fill="#80ed99" stroke="#2b2d42" stroke-width="2"/>
      <path d="M32 34 C42 32 46 26 44 20 C40 22 34 28 32 34 Z" fill="#80ed99" stroke="#2b2d42" stroke-width="2"/>
      <path d="M32 24 C22 22 18 16 20 10 C24 12 30 18 32 24 Z" fill="#80ed99" stroke="#2b2d42" stroke-width="2"/>
    `,
  },

  // === Kids Doodle (inspired by kid doodle style icons) ===
  {
    id: 'kd-smiley-boy',
    name: 'Bé trai cười',
    pack: 'Kids Doodle',
    viewBox: '0 0 64 64',
    svgMarkup: `
      <circle cx="32" cy="32" r="18" fill="#f9c74f" stroke="#2b2d42" stroke-width="2.5"/>
      <path d="M20 20 C20 14 28 10 32 16" fill="#7f5539" stroke="#2b2d42" stroke-width="2.5"/>
      <path d="M32 16 C36 10 44 14 44 20" fill="#7f5539" stroke="#2b2d42" stroke-width="2.5"/>
      <circle cx="26" cy="30" r="2.2" fill="#2b2d42"/>
      <circle cx="38" cy="30" r="2.2" fill="#2b2d42"/>
      <path d="M26 37 Q32 42 38 37" fill="none" stroke="#2b2d42" stroke-width="2.2" stroke-linecap="round"/>
      <circle cx="22" cy="34" r="3" fill="#ffafcc" opacity="0.5"/>
      <circle cx="42" cy="34" r="3" fill="#ffafcc" opacity="0.5"/>
    `,
  },
  {
    id: 'kd-happy-sun',
    name: 'Mặt trời vui vẻ',
    pack: 'Kids Doodle',
    viewBox: '0 0 64 64',
    svgMarkup: `
      <circle cx="32" cy="32" r="12" fill="#ffd166" stroke="#2b2d42" stroke-width="2.5"/>
      <path d="M32 10 V16 M32 48 V54 M10 32 H16 M48 32 H54 M16 16 L20 20 M44 44 L48 48 M48 16 L44 20 M20 44 L16 48" stroke="#ffd166" stroke-width="4" stroke-linecap="round"/>
      <circle cx="28" cy="30" r="1.5" fill="#2b2d42"/>
      <circle cx="36" cy="30" r="1.5" fill="#2b2d42"/>
      <path d="M28 36 Q32 39 36 36" fill="none" stroke="#2b2d42" stroke-width="2" stroke-linecap="round"/>
    `,
  },
  {
    id: 'kd-cloud-cute',
    name: 'Mây dễ thương',
    pack: 'Kids Doodle',
    viewBox: '0 0 64 64',
    svgMarkup: `
      <path d="M15 42 H49 C54 42 57 38 57 34 C57 30 53.5 27 49.5 26.5 C48 19 41 15 33 15 C26 15 21 19 19.5 25 C13 25.5 9 29.5 9 34.5 C9 38.8 12.5 42 15 42 Z" fill="#bde0fe" stroke="#2b2d42" stroke-width="2.5"/>
    `,
  },
  {
    id: 'kd-daisy',
    name: 'Hoa cúc',
    pack: 'Kids Doodle',
    viewBox: '0 0 64 64',
    svgMarkup: `
      <path d="M32 36 V56" stroke="#43aa8b" stroke-width="3" stroke-linecap="round"/>
      <path d="M32 48 C26 44 22 46 21 50" fill="none" stroke="#43aa8b" stroke-width="2.5" stroke-linecap="round"/>
      <ellipse cx="32" cy="20" rx="4" ry="8" fill="#e9ecef" stroke="#2b2d42" stroke-width="2"/>
      <ellipse cx="32" cy="20" rx="4" ry="8" fill="#e9ecef" stroke="#2b2d42" stroke-width="2" transform="rotate(60 32 24)"/>
      <ellipse cx="32" cy="20" rx="4" ry="8" fill="#e9ecef" stroke="#2b2d42" stroke-width="2" transform="rotate(120 32 24)"/>
      <ellipse cx="32" cy="28" rx="4" ry="8" fill="#e9ecef" stroke="#2b2d42" stroke-width="2" transform="rotate(60 32 24)"/>
      <ellipse cx="32" cy="28" rx="4" ry="8" fill="#e9ecef" stroke="#2b2d42" stroke-width="2" transform="rotate(120 32 24)"/>
      <circle cx="32" cy="24" r="5" fill="#f9c74f" stroke="#2b2d42" stroke-width="2"/>
    `,
  },
  {
    id: 'kd-watermelon',
    name: 'Dưa hấu tươi',
    pack: 'Kids Doodle',
    viewBox: '0 0 64 64',
    svgMarkup: `
      <path d="M12 40 A22 22 0 0 1 52 40 Z" fill="#e63946" stroke="#2b2d42" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M12 40 A22 22 0 0 1 52 40" fill="none" stroke="#43aa8b" stroke-width="5" stroke-linecap="round"/>
      <circle cx="24" cy="34" r="1.8" fill="#2b2d42"/>
      <circle cx="32" cy="30" r="1.8" fill="#2b2d42"/>
      <circle cx="38" cy="36" r="1.8" fill="#2b2d42"/>
      <circle cx="28" cy="38" r="1.5" fill="#2b2d42"/>
    `,
  },
  {
    id: 'kd-balloon',
    name: 'Bóng bay đỏ',
    pack: 'Kids Doodle',
    viewBox: '0 0 64 64',
    svgMarkup: `
      <ellipse cx="32" cy="24" rx="13" ry="17" fill="#e63946" stroke="#2b2d42" stroke-width="2.5"/>
      <polygon points="28,40 36,40 32,44" fill="#e63946" stroke="#2b2d42" stroke-width="2"/>
      <path d="M32 44 Q28 50 34 54 Q30 56 32 58" fill="none" stroke="#2b2d42" stroke-width="2" stroke-linecap="round"/>
      <ellipse cx="26" cy="20" rx="3" ry="4" fill="#ffffff" opacity="0.35"/>
    `,
  },
  {
    id: 'kd-crayon',
    name: 'Bút sáp màu',
    pack: 'Kids Doodle',
    viewBox: '0 0 64 64',
    svgMarkup: `
      <rect x="24" y="8" width="16" height="6" rx="2" fill="#f4a261" stroke="#2b2d42" stroke-width="2.3"/>
      <rect x="24" y="14" width="16" height="30" fill="#e63946" stroke="#2b2d42" stroke-width="2.3"/>
      <polygon points="24,44 40,44 32,56" fill="#e63946" stroke="#2b2d42" stroke-width="2.3" stroke-linejoin="round"/>
      <line x1="30" y1="18" x2="30" y2="40" stroke="#f25c54" stroke-width="2" opacity="0.4"/>
    `,
  },
  {
    id: 'kd-football',
    name: 'Trái bóng',
    pack: 'Kids Doodle',
    viewBox: '0 0 64 64',
    svgMarkup: `
      <circle cx="32" cy="32" r="16" fill="#80ed99" stroke="#2b2d42" stroke-width="2.5"/>
      <path d="M24 18 L32 24 L40 18 M24 46 L32 40 L40 46 M16 32 H24 L28 24 M48 32 H40 L36 24 M28 40 L24 32 M36 40 L40 32" fill="none" stroke="#2b2d42" stroke-width="2" stroke-linejoin="round"/>
    `,
  },
  {
    id: 'kd-star-smiling',
    name: 'Ngôi sao cười',
    pack: 'Kids Doodle',
    viewBox: '0 0 64 64',
    svgMarkup: `
      <path d="M32 8 L38 22 L54 24 L42 34 L46 50 L32 42 L18 50 L22 34 L10 24 L26 22 Z" fill="#ffd166" stroke="#2b2d42" stroke-width="2.5" stroke-linejoin="round"/>
      <circle cx="28" cy="28" r="1.5" fill="#2b2d42"/>
      <circle cx="36" cy="28" r="1.5" fill="#2b2d42"/>
      <path d="M29 33 Q32 36 35 33" fill="none" stroke="#2b2d42" stroke-width="2" stroke-linecap="round"/>
    `,
  },
  {
    id: 'kd-bird-blue',
    name: 'Chim xanh',
    pack: 'Kids Doodle',
    viewBox: '0 0 64 64',
    svgMarkup: `
      <ellipse cx="30" cy="34" rx="14" ry="11" fill="#4cc9f0" stroke="#2b2d42" stroke-width="2.5"/>
      <circle cx="30" cy="28" r="9" fill="#4cc9f0" stroke="#2b2d42" stroke-width="2.5"/>
      <polygon points="22,28 14,26 20,30" fill="#f9c74f" stroke="#2b2d42" stroke-width="2"/>
      <circle cx="28" cy="26" r="1.8" fill="#2b2d42"/>
      <path d="M42 30 Q52 22 54 28" fill="none" stroke="#4cc9f0" stroke-width="4" stroke-linecap="round"/>
      <path d="M42 30 Q52 22 54 28" fill="none" stroke="#2b2d42" stroke-width="2" stroke-linecap="round"/>
      <path d="M24 42 L22 48 M30 44 L30 50 M36 42 L38 48" stroke="#f9c74f" stroke-width="2.5" stroke-linecap="round"/>
    `,
  },
  {
    id: 'kd-kite',
    name: 'Diều giấy',
    pack: 'Kids Doodle',
    viewBox: '0 0 64 64',
    svgMarkup: `
      <polygon points="32,8 48,28 32,48 16,28" fill="#43aa8b" stroke="#2b2d42" stroke-width="2.5" stroke-linejoin="round"/>
      <line x1="32" y1="8" x2="32" y2="48" stroke="#2b2d42" stroke-width="2"/>
      <line x1="16" y1="28" x2="48" y2="28" stroke="#2b2d42" stroke-width="2"/>
      <polygon points="32,8 48,28 32,28" fill="#80ed99"/>
      <polygon points="32,28 32,48 16,28" fill="#80ed99"/>
      <path d="M32 48 Q28 52 30 55 Q34 53 32 56 Q36 54 34 58" fill="none" stroke="#2b2d42" stroke-width="2" stroke-linecap="round"/>
    `,
  },
  {
    id: 'kd-goldfish',
    name: 'Cá vàng',
    pack: 'Kids Doodle',
    viewBox: '0 0 64 64',
    svgMarkup: `
      <polygon points="44,32 56,22 56,42" fill="#f8961e" stroke="#2b2d42" stroke-width="2.5" stroke-linejoin="round"/>
      <ellipse cx="30" cy="32" rx="18" ry="12" fill="#f8961e" stroke="#2b2d42" stroke-width="2.5"/>
      <circle cx="20" cy="28" r="2.5" fill="#ffffff" stroke="#2b2d42" stroke-width="2"/>
      <circle cx="20" cy="28" r="1.2" fill="#2b2d42"/>
      <path d="M14 34 Q18 38 24 34" fill="none" stroke="#2b2d42" stroke-width="2" stroke-linecap="round"/>
      <path d="M28 26 Q32 20 36 26" fill="none" stroke="#f9c74f" stroke-width="2"/>
      <circle cx="8" cy="28" r="1.5" fill="#4cc9f0"/>
      <circle cx="6" cy="34" r="1" fill="#4cc9f0"/>
      <circle cx="10" cy="38" r="1.3" fill="#4cc9f0"/>
    `,
  },

  // === Summer Vibes ===
  {
    id: 'sv-smiley',
    name: 'Mặt cười vàng',
    pack: 'Summer Vibes',
    viewBox: '0 0 64 64',
    svgMarkup: `
      <circle cx="32" cy="32" r="20" fill="#ffd166" stroke="#2b2d42" stroke-width="2.5"/>
      <circle cx="24" cy="28" r="2.5" fill="#2b2d42"/>
      <circle cx="40" cy="28" r="2.5" fill="#2b2d42"/>
      <path d="M22 38 Q32 46 42 38" fill="none" stroke="#2b2d42" stroke-width="2.5" stroke-linecap="round"/>
    `,
  },
  {
    id: 'sv-beach-ball',
    name: 'Bóng biển',
    pack: 'Summer Vibes',
    viewBox: '0 0 64 64',
    svgMarkup: `
      <circle cx="32" cy="32" r="18" fill="#f9c74f" stroke="#2b2d42" stroke-width="2.5"/>
      <path d="M32 14 Q22 24 32 32 Q42 40 32 50" fill="#e63946" stroke="none"/>
      <path d="M14 32 Q24 22 32 32 Q40 42 50 32" fill="#4cc9f0" stroke="none"/>
      <circle cx="32" cy="32" r="18" fill="none" stroke="#2b2d42" stroke-width="2.5"/>
    `,
  },
  {
    id: 'sv-ice-cream-cone',
    name: 'Kem ốc quế hồng',
    pack: 'Summer Vibes',
    viewBox: '0 0 64 64',
    svgMarkup: `
      <polygon points="22,30 42,30 32,56" fill="#e09f5a" stroke="#2b2d42" stroke-width="2.5" stroke-linejoin="round"/>
      <line x1="26" y1="37" x2="38" y2="43" stroke="#c68642" stroke-width="1.5"/>
      <line x1="38" y1="37" x2="26" y2="43" stroke="#c68642" stroke-width="1.5"/>
      <circle cx="25" cy="24" r="8" fill="#ffafcc" stroke="#2b2d42" stroke-width="2.4"/>
      <circle cx="39" cy="24" r="8" fill="#90e0ef" stroke="#2b2d42" stroke-width="2.4"/>
      <circle cx="32" cy="16" r="8.5" fill="#ffd166" stroke="#2b2d42" stroke-width="2.5"/>
    `,
  },
  {
    id: 'sv-palm-tree',
    name: 'Cây dừa',
    pack: 'Summer Vibes',
    viewBox: '0 0 64 64',
    svgMarkup: `
      <path d="M32 56 Q34 36 36 24" stroke="#7f5539" stroke-width="4" stroke-linecap="round" fill="none"/>
      <path d="M36 24 Q22 16 12 20" fill="none" stroke="#43aa8b" stroke-width="4" stroke-linecap="round"/>
      <path d="M36 24 Q48 14 54 18" fill="none" stroke="#43aa8b" stroke-width="4" stroke-linecap="round"/>
      <path d="M36 24 Q32 10 28 8" fill="none" stroke="#43aa8b" stroke-width="4" stroke-linecap="round"/>
      <path d="M36 24 Q42 12 48 10" fill="none" stroke="#80ed99" stroke-width="3" stroke-linecap="round"/>
      <path d="M36 24 Q22 18 14 24" fill="none" stroke="#80ed99" stroke-width="3" stroke-linecap="round"/>
    `,
  },
  {
    id: 'sv-sunglasses',
    name: 'Kính mát',
    pack: 'Summer Vibes',
    viewBox: '0 0 64 64',
    svgMarkup: `
      <path d="M6 28 H58" stroke="#2b2d42" stroke-width="3" stroke-linecap="round"/>
      <rect x="8" y="26" width="18" height="14" rx="4" fill="#2b2d42" stroke="#2b2d42" stroke-width="2.5"/>
      <rect x="38" y="26" width="18" height="14" rx="4" fill="#2b2d42" stroke="#2b2d42" stroke-width="2.5"/>
      <path d="M26 32 Q32 38 38 32" fill="none" stroke="#2b2d42" stroke-width="2.5"/>
      <rect x="10" y="28" width="6" height="4" rx="1" fill="#4cc9f0" opacity="0.3"/>
      <rect x="40" y="28" width="6" height="4" rx="1" fill="#4cc9f0" opacity="0.3"/>
    `,
  },
  {
    id: 'sv-flip-flop',
    name: 'Dép tông',
    pack: 'Summer Vibes',
    viewBox: '0 0 64 64',
    svgMarkup: `
      <ellipse cx="32" cy="36" rx="14" ry="20" fill="#ef476f" stroke="#2b2d42" stroke-width="2.5"/>
      <path d="M32 22 L24 36" stroke="#2b2d42" stroke-width="3" stroke-linecap="round"/>
      <path d="M32 22 L40 36" stroke="#2b2d42" stroke-width="3" stroke-linecap="round"/>
      <circle cx="32" cy="22" r="2.5" fill="#ffd166" stroke="#2b2d42" stroke-width="2"/>
    `,
  },
  {
    id: 'sv-starfish',
    name: 'Sao biển',
    pack: 'Summer Vibes',
    viewBox: '0 0 64 64',
    svgMarkup: `
      <path d="M32 8 L36 24 L52 20 L40 32 L52 44 L36 40 L32 56 L28 40 L12 44 L24 32 L12 20 L28 24 Z" fill="#f8961e" stroke="#2b2d42" stroke-width="2.5" stroke-linejoin="round"/>
      <circle cx="30" cy="28" r="1.5" fill="#2b2d42"/>
      <circle cx="36" cy="28" r="1.5" fill="#2b2d42"/>
      <path d="M31 32 Q33 34 35 32" fill="none" stroke="#2b2d42" stroke-width="1.5" stroke-linecap="round"/>
    `,
  },
  {
    id: 'sv-wave',
    name: 'Sóng biển',
    pack: 'Summer Vibes',
    viewBox: '0 0 64 64',
    svgMarkup: `
      <path d="M4 28 Q12 18 20 28 Q28 38 36 28 Q44 18 52 28 Q56 32 60 28" fill="none" stroke="#4cc9f0" stroke-width="4" stroke-linecap="round"/>
      <path d="M4 38 Q12 28 20 38 Q28 48 36 38 Q44 28 52 38 Q56 42 60 38" fill="none" stroke="#90e0ef" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M4 46 Q12 38 20 46 Q28 54 36 46 Q44 38 52 46 Q56 50 60 46" fill="none" stroke="#bde0fe" stroke-width="3" stroke-linecap="round"/>
    `,
  },
  {
    id: 'sv-anchor',
    name: 'Mỏ neo',
    pack: 'Summer Vibes',
    viewBox: '0 0 64 64',
    svgMarkup: `
      <circle cx="32" cy="14" r="5" fill="none" stroke="#457b9d" stroke-width="3"/>
      <line x1="32" y1="19" x2="32" y2="52" stroke="#457b9d" stroke-width="3" stroke-linecap="round"/>
      <line x1="20" y1="30" x2="44" y2="30" stroke="#457b9d" stroke-width="3" stroke-linecap="round"/>
      <path d="M14 44 Q16 52 32 52 Q48 52 50 44" fill="none" stroke="#457b9d" stroke-width="3" stroke-linecap="round"/>
      <circle cx="14" cy="44" r="2.5" fill="#457b9d"/>
      <circle cx="50" cy="44" r="2.5" fill="#457b9d"/>
    `,
  },
  {
    id: 'sv-coconut',
    name: 'Dừa uống nước',
    pack: 'Summer Vibes',
    viewBox: '0 0 64 64',
    svgMarkup: `
      <path d="M16 30 C16 20 48 20 48 30 C48 44 42 52 32 52 C22 52 16 44 16 30 Z" fill="#7f5539" stroke="#2b2d42" stroke-width="2.5"/>
      <path d="M16 30 C16 24 48 24 48 30" fill="#f4d58d" stroke="none"/>
      <line x1="40" y1="22" x2="46" y2="8" stroke="#2b2d42" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="46" cy="8" r="3" fill="#43aa8b" stroke="#2b2d42" stroke-width="2"/>
      <path d="M42 24 L44 14" stroke="#f9c74f" stroke-width="4" stroke-linecap="round"/>
    `,
  },
  {
    id: 'sv-umbrella',
    name: 'Dù che nắng',
    pack: 'Summer Vibes',
    viewBox: '0 0 64 64',
    svgMarkup: `
      <line x1="32" y1="14" x2="32" y2="54" stroke="#2b2d42" stroke-width="3" stroke-linecap="round"/>
      <path d="M8 28 C8 16 56 16 56 28" fill="#e63946" stroke="#2b2d42" stroke-width="2.5"/>
      <path d="M20 28 C20 22 32 22 32 28" fill="#ffd166" stroke="none"/>
      <path d="M32 28 C32 22 44 22 44 28" fill="#ffd166" stroke="none"/>
      <path d="M32 54 Q36 56 36 52" fill="none" stroke="#2b2d42" stroke-width="2.5" stroke-linecap="round"/>
    `,
  },
  {
    id: 'sv-crab',
    name: 'Cua đỏ',
    pack: 'Summer Vibes',
    viewBox: '0 0 64 64',
    svgMarkup: `
      <ellipse cx="32" cy="34" rx="14" ry="10" fill="#e63946" stroke="#2b2d42" stroke-width="2.5"/>
      <circle cx="24" cy="24" r="4" fill="#e63946" stroke="#2b2d42" stroke-width="2.3"/>
      <circle cx="40" cy="24" r="4" fill="#e63946" stroke="#2b2d42" stroke-width="2.3"/>
      <circle cx="24" cy="23" r="1.8" fill="#2b2d42"/>
      <circle cx="40" cy="23" r="1.8" fill="#2b2d42"/>
      <path d="M28 38 Q32 41 36 38" fill="none" stroke="#2b2d42" stroke-width="2" stroke-linecap="round"/>
      <path d="M18 30 L8 24 L10 20" fill="none" stroke="#e63946" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M46 30 L56 24 L54 20" fill="none" stroke="#e63946" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M22 42 L18 48 M28 44 L26 50 M36 44 L38 50 M42 42 L46 48" stroke="#e63946" stroke-width="2.5" stroke-linecap="round"/>
    `,
  },
];
