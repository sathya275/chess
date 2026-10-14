import React, { useRef, useEffect, useState } from 'react';
import type { MoveRecord } from '../types/chess';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Copy, Check, Flag, Handshake } from 'lucide-react';

interface MoveLogProps {
  moves: MoveRecord[];
  currentMoveIndex: number; // -1 represents initial position
  onNavigateMove: (index: number) => void;
  onResign: () => void;
  onOfferDraw: () => void;
  pgn: string;
  fen: string;
  isGameOver: boolean;
}

export const MoveLog: React.FC<MoveLogProps> = ({
  moves,
  currentMoveIndex,
  onNavigateMove,
  onResign,
  onOfferDraw,
  pgn,
  fen,
  isGameOver,
}) => {
  const [copiedType, setCopiedType] = useState<'pgn' | 'fen' | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to active move
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [moves.length]);

  const copyToClipboard = async (text: string, type: 'pgn' | 'fen') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 1800);
    } catch {
      // fallback
    }
  };

  // Group into pairs: [White, Black]
  const pairs: { moveNum: number; white: MoveRecord; black?: MoveRecord; whiteIdx: number; blackIdx?: number }[] = [];
  for (let i = 0; i < moves.length; i += 2) {
    pairs.push({
      moveNum: Math.floor(i / 2) + 1,
      white: moves[i],
      whiteIdx: i,
      black: moves[i + 1],
      blackIdx: i + 1 < moves.length ? i + 1 : undefined,
    });
  }

  return (
    <div className="flex flex-col h-full bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/40">
        <div className="flex items-center gap-2">
          <span className="font-display font-semibold text-sm text-slate-200">
            Notation & Moves
          </span>
          <span className="text-xs text-slate-500 font-tabular">
            {moves.length} {moves.length === 1 ? 'ply' : 'plies'}
          </span>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => copyToClipboard(pgn, 'pgn')}
            title="Copy PGN notation"
            className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition-colors"
          >
            {copiedType === 'pgn' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>PGN</span>
          </button>
          <button
            onClick={() => copyToClipboard(fen, 'fen')}
            title="Copy FEN string"
            className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition-colors"
          >
            {copiedType === 'fen' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>FEN</span>
          </button>
        </div>
      </div>

      {/* Move List */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-1 font-tabular text-xs">
        {pairs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-slate-500 text-center">
            <span className="text-sm mb-1">Game ready</span>
            <span className="text-[11px] text-slate-600">White moves first</span>
          </div>
        ) : (
          pairs.map(({ moveNum, white, black, whiteIdx, blackIdx }) => (
            <div
              key={moveNum}
              className="grid grid-cols-[36px_1fr_1fr] items-center py-1 px-2 rounded hover:bg-slate-800/40 transition-colors"
            >
              <span className="text-slate-500 text-[11px]">{moveNum}.</span>

              {/* White move */}
              <button
                onClick={() => onNavigateMove(whiteIdx)}
                className={`text-left px-2 py-1 rounded transition-colors font-medium ${
                  currentMoveIndex === whiteIdx
                    ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40'
                    : 'text-slate-200 hover:bg-slate-800 hover:text-amber-200'
                }`}
              >
                {white.san}
              </button>

              {/* Black move */}
              {black && blackIdx !== undefined ? (
                <button
                  onClick={() => onNavigateMove(blackIdx)}
                  className={`text-left px-2 py-1 rounded transition-colors font-medium ${
                    currentMoveIndex === blackIdx
                      ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-amber-200'
                  }`}
                >
                  {black.san}
                </button>
              ) : (
                <div />
              )}
            </div>
          ))
        )}
      </div>

      {/* Replay Navigator controls */}
      <div className="flex items-center justify-between px-3 py-2 border-t border-slate-800 bg-slate-950/60">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onNavigateMove(-1)}
            disabled={currentMoveIndex === -1}
            title="Start of game"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => onNavigateMove(Math.max(-1, currentMoveIndex - 1))}
            disabled={currentMoveIndex === -1}
            title="Previous move"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => onNavigateMove(Math.min(moves.length - 1, currentMoveIndex + 1))}
            disabled={currentMoveIndex >= moves.length - 1}
            title="Next move"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onNavigateMove(moves.length - 1)}
            disabled={currentMoveIndex >= moves.length - 1}
            title="Current position"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>

        {/* Resign / Offer Draw buttons */}
        {!isGameOver && (
          <div className="flex items-center gap-2">
            <button
              onClick={onOfferDraw}
              className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-400 hover:text-amber-200 hover:bg-slate-800/80 rounded-lg transition-colors border border-slate-800"
            >
              <Handshake className="w-3.5 h-3.5" />
              <span>Draw</span>
            </button>
            <button
              onClick={onResign}
              className="flex items-center gap-1 px-2.5 py-1 text-xs text-rose-400 hover:text-rose-200 hover:bg-rose-950/40 rounded-lg transition-colors border border-rose-900/30"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>Resign</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
