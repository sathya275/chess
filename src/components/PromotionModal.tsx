import React from 'react';
import type { PieceSymbol, Color } from 'chess.js';
import { ChessPiece } from './ChessPiece';

interface PromotionModalProps {
  color: Color;
  isOpen: boolean;
  onSelect: (piece: PieceSymbol) => void;
  isFaceToFace?: boolean;
}

export const PromotionModal: React.FC<PromotionModalProps> = ({
  color,
  isOpen,
  onSelect,
  isFaceToFace = false,
}) => {
  if (!isOpen) return null;

  const pieces: { type: PieceSymbol; label: string }[] = [
    { type: 'q', label: 'Queen' },
    { type: 'n', label: 'Knight' },
    { type: 'r', label: 'Rook' },
    { type: 'b', label: 'Bishop' },
  ];

  const rotateClass = isFaceToFace && color === 'b' ? 'rotate-180' : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div
        className={`bg-slate-900 border border-amber-500/40 rounded-2xl p-6 shadow-2xl max-w-sm w-full text-center ${rotateClass}`}
      >
        <h3 className="font-display text-lg font-bold text-amber-200 mb-1">
          Pawn Promotion
        </h3>
        <p className="text-xs text-slate-400 mb-5">
          Select a piece to promote your pawn
        </p>

        <div className="grid grid-cols-4 gap-3">
          {pieces.map(({ type, label }) => (
            <button
              key={type}
              onClick={() => onSelect(type)}
              className="group flex flex-col items-center justify-center p-3 rounded-xl bg-slate-800/80 hover:bg-amber-500/20 border border-slate-700 hover:border-amber-400/80 transition-all duration-150 active:scale-95"
            >
              <div className="w-12 h-12 mb-1 group-hover:scale-110 transition-transform">
                <ChessPiece type={type} color={color} />
              </div>
              <span className="text-[11px] font-medium text-slate-300 group-hover:text-amber-200">
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
