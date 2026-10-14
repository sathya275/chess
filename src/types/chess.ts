import type { Square, PieceSymbol, Color } from 'chess.js';
export type { Square, PieceSymbol, Color };

export type BoardThemeId = 'wood' | 'green' | 'ocean' | 'charcoal';

export interface BoardTheme {
  id: BoardThemeId;
  name: string;
  lightSquare: string;
  darkSquare: string;
  selectedSquare: string;
  lastMoveSquare: string;
  legalMoveDot: string;
  checkSquare: string;
  boardBorder: string;
  accent: string;
}

export type PlayMode = 'pass-and-play' | 'face-to-face' | 'analysis';

export interface TimeControl {
  id: string;
  label: string;
  category: 'Bullet' | 'Blitz' | 'Rapid' | 'Classical' | 'Untimed' | 'Custom';
  initialSeconds: number;
  incrementSeconds: number;
}

export interface PlayerStats {
  name: string;
  color: Color;
  timeRemaining: number;
  capturedPieces: PieceSymbol[];
}

export interface MoveRecord {
  san: string;
  from: Square;
  to: Square;
  color: Color;
  piece: PieceSymbol;
  captured?: PieceSymbol;
  fen: string;
  timeSpent?: number;
}

export type GameOutcome =
  | { type: 'in_progress' }
  | { type: 'checkmate'; winner: Color }
  | { type: 'stalemate'; reason: 'stalemate' }
  | { type: 'draw_repetition'; reason: 'threefold repetition' }
  | { type: 'draw_50_moves'; reason: 'fifty-move rule' }
  | { type: 'draw_insufficient'; reason: 'insufficient material' }
  | { type: 'draw_agreement'; reason: 'mutual draw agreement' }
  | { type: 'time_out'; winner: Color }
  | { type: 'resigned'; winner: Color };
