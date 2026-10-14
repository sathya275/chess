import React from 'react';
import type { PieceSymbol, Color } from 'chess.js';

interface ChessPieceProps {
  type: PieceSymbol;
  color: Color;
  className?: string;
}

export const ChessPiece: React.FC<ChessPieceProps> = ({ type, color, className = 'w-full h-full' }) => {
  const isWhite = color === 'w';

  // Crisp standard Staunton Vector SVGs with subtle drop shadow & gradient
  const pieceColorClass = isWhite
    ? 'fill-amber-50 stroke-amber-950/80 drop-shadow-[0_2px_3px_rgba(0,0,0,0.35)]'
    : 'fill-slate-900 stroke-amber-200/50 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]';

  switch (type) {
    case 'p': // Pawn
      return (
        <svg viewBox="0 0 45 45" className={`${className} ${pieceColorClass}`}>
          <path
            d="m 22.5,9 c -2.21,0 -4,1.79 -4,4 0,0.89 0.29,1.71 0.78,2.38 C 17.33,16.5 16,18.59 16,21 c 0,2.03 0.94,3.84 2.41,5.03 C 15.41,27.09 11,31.58 11,39.5 l 23,0 c 0,-7.92 -4.41,-12.41 -7.41,-13.47 C 28.06,24.84 29,23.03 29,21 29,18.59 27.67,16.5 25.72,15.38 26.21,14.71 26.5,13.89 26.5,13 c 0,-2.21 -1.79,-4 -4,-4 z"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case 'r': // Rook
      return (
        <svg viewBox="0 0 45 45" className={`${className} ${pieceColorClass}`}>
          <g strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M 9,39 L 36,39 L 36,36 L 9,36 L 9,39 z" />
            <path d="M 12,36 L 12,32 L 33,32 L 33,36 L 12,36 z" />
            <path d="M 11,14 L 11,9 L 15,9 L 15,11 L 20,11 L 20,9 L 25,9 L 25,11 L 30,11 L 30,9 L 34,9 L 34,14" />
            <path d="M 34,14 L 31,17 L 14,17 L 11,14" />
            <path d="M 31,17 L 31,29.5 L 14,29.5 L 14,17" />
            <path d="M 31,29.5 L 32.5,32 L 12.5,32 L 14,29.5" />
            <path d="M 11,14 L 34,14" />
          </g>
        </svg>
      );

    case 'n': // Knight
      return (
        <svg viewBox="0 0 45 45" className={`${className} ${pieceColorClass}`}>
          <path
            d="m 22,10 c 10.5,1 16.5,8 16,29 L 15,39 C 15,25 21,18 20,16 C 19,14 18,14 16,14 C 14.5,14 13.5,14.7 13.5,16.5 C 13.5,18 12.5,18 11.5,17 C 9,14 10.5,11 12,9.5 C 13.5,8 16.5,8 17.5,9 C 18.5,10 19,10 22,10 z"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 24,18 C 24.38,20.91 18.45,25.37 16,27 C 13,29 13.18,31.34 11,31 C 9.95,30.83 10.5,27.5 13,26 C 15.5,24.5 18,22 18,20 C 18,18 21.5,16.5 24,18 z"
            fill={isWhite ? '#d1d5db' : '#334155'}
            strokeWidth="1.2"
          />
          <circle cx="27" cy="16.5" r="1.5" fill={isWhite ? '#1e293b' : '#f8fafc'} />
        </svg>
      );

    case 'b': // Bishop
      return (
        <svg viewBox="0 0 45 45" className={`${className} ${pieceColorClass}`}>
          <g strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M 9,36 C 12.39,35.03 19.11,36.43 22.5,34 C 25.89,36.43 32.61,35.03 36,36 C 36,36 37.65,36.54 39,38 C 38.32,38.97 37.35,38.99 36,38.5 C 32.61,37.53 25.89,38.96 22.5,37.5 C 19.11,38.96 12.39,37.53 9,38.5 C 7.64,38.99 6.67,38.97 6,38 C 7.35,36.54 9,36 9,36 z" />
            <path d="M 12,36 C 11.27,33.5 13,26.5 18.5,21.5 C 14.5,19 14.5,14 17.5,10.5 C 20.5,7 24.5,7 27.5,10.5 C 30.5,14 30.5,19 26.5,21.5 C 32,26.5 33.73,33.5 33,36" />
            <path d="M 17.5,26 L 27.5,26" />
            <path d="M 22.5,10 L 22.5,13" />
            <path d="M 21,11.5 L 24,11.5" />
          </g>
        </svg>
      );

    case 'q': // Queen
      return (
        <svg viewBox="0 0 45 45" className={`${className} ${pieceColorClass}`}>
          <g strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M 9,26 C 17.5,24.5 30,24.5 36,26 L 38.5,13.5 L 31,25 L 30.7,10.5 L 25.5,24.5 L 22.5,10 L 19.5,24.5 L 14.3,10.5 L 14,25 L 6.5,13.5 L 9,26 z" />
            <path d="M 9,26 C 9,28 10.5,28 11.5,30 C 12.5,31.5 12.5,31 12,33.5 C 10.5,34.5 11,36 11,36 C 11,36 9,36 6,36 C 9,39 12,39 13.5,39 C 15,39 30,39 31.5,39 C 33,39 36,39 39,36 C 36,36 34,36 34,36 C 34,36 34.5,34.5 33,33.5 C 32.5,31 32.5,31.5 33.5,30 C 34.5,28 36,28 36,26" />
            <circle cx="6" cy="12" r="2" />
            <circle cx="14" cy="9" r="2" />
            <circle cx="22.5" cy="8" r="2" />
            <circle cx="31" cy="9" r="2" />
            <circle cx="39" cy="12" r="2" />
          </g>
        </svg>
      );

    case 'k': // King
      return (
        <svg viewBox="0 0 45 45" className={`${className} ${pieceColorClass}`}>
          <g strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M 22.5,11.63 L 22.5,6" />
            <path d="M 20,8 L 25,8" />
            <path d="M 22.5,25 C 22.5,25 27,17.5 25.5,14.5 C 24,11.5 21,11.5 19.5,14.5 C 18,17.5 22.5,25 22.5,25" />
            <path d="M 12.5,37 C 15,40.5 30,40.5 32.5,37 L 32.5,30 C 32.5,30 41.5,25.5 38.5,19.5 C 35.5,13.5 29,16.5 29,16.5 C 29,16.5 28,12 22.5,12 C 17,12 16,16.5 16,16.5 C 16,16.5 9.5,13.5 6.5,19.5 C 3.5,25.5 12.5,30 12.5,30 L 12.5,37 z" />
            <path d="M 12.5,30 L 32.5,30" />
            <path d="M 12.5,33.5 L 32.5,33.5" />
            <path d="M 12.5,37 L 32.5,37" />
          </g>
        </svg>
      );

    default:
      return null;
  }
};
