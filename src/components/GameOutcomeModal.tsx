import React, { useEffect } from 'react';
import type { GameOutcome } from '../types/chess';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Eye, ShieldAlert } from 'lucide-react';

interface GameOutcomeModalProps {
  outcome: GameOutcome;
  isOpen: boolean;
  onRematch: () => void;
  onNewGame: () => void;
  onReview: () => void;
  whiteName: string;
  blackName: string;
}

export const GameOutcomeModal: React.FC<GameOutcomeModalProps> = ({
  outcome,
  isOpen,
  onRematch,
  onNewGame,
  onReview,
  whiteName,
  blackName,
}) => {
  useEffect(() => {
    if (isOpen && outcome.type !== 'in_progress') {
      const isWin =
        outcome.type === 'checkmate' ||
        outcome.type === 'time_out' ||
        outcome.type === 'resigned';

      if (isWin) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#fbbf24', '#d97706', '#ffffff'],
        });
      }
    }
  }, [isOpen, outcome]);

  if (!isOpen || outcome.type === 'in_progress') return null;

  let title = '';
  let subtitle = '';
  let winnerName = '';
  let isDraw = false;

  if (outcome.type === 'checkmate') {
    winnerName = outcome.winner === 'w' ? whiteName : blackName;
    title = 'Checkmate!';
    subtitle = `${winnerName} (${outcome.winner === 'w' ? 'White' : 'Black'}) claims decisive victory.`;
  } else if (outcome.type === 'time_out') {
    winnerName = outcome.winner === 'w' ? whiteName : blackName;
    title = 'Time Forfeit!';
    subtitle = `${winnerName} (${outcome.winner === 'w' ? 'White' : 'Black'}) wins on the clock.`;
  } else if (outcome.type === 'resigned') {
    winnerName = outcome.winner === 'w' ? whiteName : blackName;
    title = 'Resignation';
    subtitle = `${winnerName} wins by resignation.`;
  } else if (outcome.type === 'stalemate') {
    isDraw = true;
    title = 'Stalemate';
    subtitle = 'No legal moves remaining and King is not in check. Game drawn.';
  } else if (outcome.type === 'draw_repetition') {
    isDraw = true;
    title = 'Draw by Repetition';
    subtitle = 'The same board position occurred three times.';
  } else if (outcome.type === 'draw_50_moves') {
    isDraw = true;
    title = 'Draw by 50-Move Rule';
    subtitle = '50 consecutive moves completed without any pawn push or piece capture.';
  } else if (outcome.type === 'draw_insufficient') {
    isDraw = true;
    title = 'Draw by Insufficient Material';
    subtitle = 'Neither player has sufficient pieces to deliver checkmate.';
  } else if (outcome.type === 'draw_agreement') {
    isDraw = true;
    title = 'Draw by Agreement';
    subtitle = 'Both players mutually agreed to conclude the match with a draw.';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-amber-500/10 blur-2xl rounded-full pointer-events-none" />

        {/* Icon */}
        <div className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-4 bg-slate-800/90 border border-slate-700 shadow-inner">
          {isDraw ? (
            <ShieldAlert className="w-8 h-8 text-amber-400" />
          ) : (
            <Trophy className="w-8 h-8 text-amber-400 animate-bounce" />
          )}
        </div>

        <h2 className="font-display text-2xl sm:text-3xl font-bold text-amber-100 mb-2">
          {title}
        </h2>
        <p className="text-sm text-slate-300 mb-6 max-w-xs mx-auto leading-relaxed">
          {subtitle}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={onRematch}
            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-semibold text-sm bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-lg shadow-amber-500/20 active:scale-[0.99]"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Rematch (Switch Sides)</span>
          </button>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={onReview}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-medium text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span>Review Moves</span>
            </button>
            <button
              onClick={onNewGame}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-medium text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              <span>Setup New Game</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
