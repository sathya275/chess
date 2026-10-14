import React from 'react';
import type { PieceSymbol, Color } from 'chess.js';
import { ChessPiece } from './ChessPiece';
import { PIECE_ORDER } from '../utils/constants';

interface CapturedPiecesProps {
  // pieces captured by this player (opponent's color)
  capturedPieces: PieceSymbol[];
  opponentColor: Color;
  materialAdvantage: number; // positive if this player is ahead
  isFaceToFace?: boolean;
}

export const CapturedPieces: React.FC<CapturedPiecesProps> = ({
  capturedPieces,
  opponentColor,
  materialAdvantage,
  isFaceToFace = false,
}) => {
  // Sort pieces by standard hierarchy: p, n, b, r, q
  const sorted = [...capturedPieces].sort(
    (a, b) => PIECE_ORDER.indexOf(a) - PIECE_ORDER.indexOf(b)
  );

  const rotateClass = isFaceToFace && opponentColor === 'w' ? 'rotate-180' : '';

  return (
    <div className={`flex items-center gap-1.5 min-h-[28px] overflow-x-auto py-1 px-1 ${rotateClass}`}>
      <div className="flex items-center -space-x-1.5">
        {sorted.map((piece, idx) => (
          <div
            key={idx}
            className="w-5 h-5 flex-shrink-0 transition-transform hover:scale-125"
            title={`${piece.toUpperCase()}`}
          >
            <ChessPiece type={piece} color={opponentColor} className="w-full h-full drop-shadow-sm" />
          </div>
        ))}
      </div>

      {materialAdvantage > 0 && (
        <span className="text-[11px] font-bold text-amber-400 bg-amber-950/60 border border-amber-600/40 px-1.5 py-0.2 rounded font-tabular">
          +{materialAdvantage}
        </span>
      )}
    </div>
  );
};
