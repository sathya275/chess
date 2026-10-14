import React from 'react';
import { X, BookOpen, ShieldCheck } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl my-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <h2 className="font-display text-lg font-bold text-amber-200">
              Chess Rules & Special Moves
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 py-4 text-xs text-slate-300 leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <h3 className="font-semibold text-amber-300 mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Castling (O-O and O-O-O)
            </h3>
            <p className="text-slate-400">
              The King moves two squares toward a Rook, and that Rook jumps over the King. Permitted only if neither piece has moved yet, there are no pieces between them, and the King is neither in check nor passing through check.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <h3 className="font-semibold text-amber-300 mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              En Passant
            </h3>
            <p className="text-slate-400">
              If an opponent moves a pawn two squares forward landing directly alongside your pawn, you may capture that pawn diagonally as if it had only advanced one square. Must be executed immediately on the very next move.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <h3 className="font-semibold text-amber-300 mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Pawn Promotion
            </h3>
            <p className="text-slate-400">
              When a pawn reaches the opposite end of the board (rank 8 for White, rank 1 for Black), it immediately promotes to a Queen, Rook, Bishop, or Knight of the same color.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <h3 className="font-semibold text-amber-300 mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Draw Conditions
            </h3>
            <p className="text-slate-400">
              <strong>Stalemate:</strong> Player whose turn it is has no legal moves and their King is not in check.<br />
              <strong>Threefold Repetition:</strong> The exact same board position occurs three times.<br />
              <strong>50-Move Rule:</strong> 50 consecutive moves made without any pawn move or piece capture.<br />
              <strong>Insufficient Material:</strong> Neither side can deliver checkmate (e.g., King vs King, King & Bishop vs King, King & Knight vs King).
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
