import type { BoardTheme, TimeControl, PieceSymbol } from '../types/chess';

export const BOARD_THEMES: Record<string, BoardTheme> = {
  wood: {
    id: 'wood',
    name: 'Classic Walnut',
    lightSquare: 'bg-[#f0d9b5] text-[#b58863]',
    darkSquare: 'bg-[#b58863] text-[#f0d9b5]',
    selectedSquare: 'ring-4 ring-amber-400 bg-amber-300/60',
    lastMoveSquare: 'bg-amber-400/35',
    legalMoveDot: 'bg-amber-900/35 hover:bg-amber-800/60',
    checkSquare: 'bg-red-600/70 ring-4 ring-red-500 animate-pulse',
    boardBorder: 'border-[#53301a] bg-[#3a2012] shadow-2xl',
    accent: 'text-amber-500',
  },
  green: {
    id: 'green',
    name: 'Tournament Forest',
    lightSquare: 'bg-[#eeeed2] text-[#769656]',
    darkSquare: 'bg-[#769656] text-[#eeeed2]',
    selectedSquare: 'ring-4 ring-emerald-400 bg-emerald-300/60',
    lastMoveSquare: 'bg-emerald-400/35',
    legalMoveDot: 'bg-emerald-950/35 hover:bg-emerald-900/60',
    checkSquare: 'bg-red-600/70 ring-4 ring-red-500 animate-pulse',
    boardBorder: 'border-[#2d4a22] bg-[#1a2e14] shadow-2xl',
    accent: 'text-emerald-500',
  },
  ocean: {
    id: 'ocean',
    name: 'Maritime Slate',
    lightSquare: 'bg-[#dee3e6] text-[#607d8b]',
    darkSquare: 'bg-[#607d8b] text-[#dee3e6]',
    selectedSquare: 'ring-4 ring-sky-400 bg-sky-300/60',
    lastMoveSquare: 'bg-sky-400/35',
    legalMoveDot: 'bg-sky-950/35 hover:bg-sky-900/60',
    checkSquare: 'bg-red-600/70 ring-4 ring-red-500 animate-pulse',
    boardBorder: 'border-[#1e293b] bg-[#0f172a] shadow-2xl',
    accent: 'text-sky-500',
  },
  charcoal: {
    id: 'charcoal',
    name: 'Obsidian & Platinum',
    lightSquare: 'bg-[#cbd5e1] text-[#475569]',
    darkSquare: 'bg-[#475569] text-[#cbd5e1]',
    selectedSquare: 'ring-4 ring-indigo-400 bg-indigo-300/60',
    lastMoveSquare: 'bg-indigo-400/35',
    legalMoveDot: 'bg-slate-950/40 hover:bg-slate-900/60',
    checkSquare: 'bg-red-600/70 ring-4 ring-red-500 animate-pulse',
    boardBorder: 'border-[#18181b] bg-[#09090b] shadow-2xl',
    accent: 'text-indigo-400',
  },
};

export const TIME_CONTROLS: TimeControl[] = [
  { id: 'bullet_1', label: '1 min', category: 'Bullet', initialSeconds: 60, incrementSeconds: 0 },
  { id: 'bullet_2_1', label: '2 | 1', category: 'Bullet', initialSeconds: 120, incrementSeconds: 1 },
  { id: 'blitz_3_2', label: '3 | 2', category: 'Blitz', initialSeconds: 180, incrementSeconds: 2 },
  { id: 'blitz_5_0', label: '5 min', category: 'Blitz', initialSeconds: 300, incrementSeconds: 0 },
  { id: 'blitz_5_3', label: '5 | 3', category: 'Blitz', initialSeconds: 300, incrementSeconds: 3 },
  { id: 'rapid_10_0', label: '10 min', category: 'Rapid', initialSeconds: 600, incrementSeconds: 0 },
  { id: 'rapid_15_10', label: '15 | 10', category: 'Rapid', initialSeconds: 900, incrementSeconds: 10 },
  { id: 'classical_30', label: '30 min', category: 'Classical', initialSeconds: 1800, incrementSeconds: 0 },
  { id: 'untimed', label: 'Unlimited', category: 'Untimed', initialSeconds: 0, incrementSeconds: 0 },
];

export const PIECE_VALUES: Record<PieceSymbol, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0,
};

export const PIECE_ORDER: PieceSymbol[] = ['p', 'n', 'b', 'r', 'q'];
