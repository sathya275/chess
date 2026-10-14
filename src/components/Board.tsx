import React, { useState } from 'react';
import type { Square, PieceSymbol, Color } from 'chess.js';
import { ChessPiece } from './ChessPiece';
import type { BoardTheme, PlayMode } from '../types/chess';

interface BoardProps {
  board: ({ square: Square; type: PieceSymbol; color: Color } | null)[][];
  orientation: Color; // 'w' or 'b' at bottom
  playMode: PlayMode;
  theme: BoardTheme;
  selectedSquare: Square | null;
  legalMoves: { to: Square; captured?: PieceSymbol }[];
  lastMove: { from: Square; to: Square } | null;
  kingInCheckSquare: Square | null;
  onSquareClick: (square: Square) => void;
  disabled?: boolean;
}

export const Board: React.FC<BoardProps> = ({
  board,
  orientation,
  playMode,
  theme,
  selectedSquare,
  legalMoves,
  lastMove,
  kingInCheckSquare,
  onSquareClick,
  disabled = false,
}) => {
  const [draggedSquare, setDraggedSquare] = useState<Square | null>(null);

  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

  // Adjust display ranks/files based on board orientation
  const displayRanks = orientation === 'w' ? ranks : [...ranks].reverse();
  const displayFiles = orientation === 'w' ? files : [...files].reverse();

  // Create quick lookup for legal moves
  const legalMoveMap = new Map<Square, { isCapture: boolean }>();
  legalMoves.forEach((move) => {
    legalMoveMap.set(move.to, { isCapture: Boolean(move.captured) });
  });

  // Convert row & col into square (e.g. 0,0 for white orientation is a8)
  const getSquareName = (rIndex: number, cIndex: number): Square => {
    const file = displayFiles[cIndex];
    const rank = displayRanks[rIndex];
    return `${file}${rank}` as Square;
  };

  // Find piece data at given square
  const getPieceAt = (square: Square) => {
    const fileIdx = files.indexOf(square[0]);
    const rankIdx = 8 - parseInt(square[1], 10);
    return board[rankIdx]?.[fileIdx] || null;
  };

  const handleDragStart = (e: React.DragEvent, square: Square) => {
    if (disabled) return;
    const piece = getPieceAt(square);
    if (!piece) return;
    setDraggedSquare(square);
    e.dataTransfer.setData('text/plain', square);
    onSquareClick(square);
  };

  const handleDrop = (e: React.DragEvent, targetSquare: Square) => {
    e.preventDefault();
    if (disabled) return;
    if (draggedSquare && draggedSquare !== targetSquare) {
      onSquareClick(targetSquare);
    }
    setDraggedSquare(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div
      className={`relative w-full aspect-square max-w-[560px] mx-auto rounded-xl p-2.5 sm:p-3.5 ${theme.boardBorder} transition-all duration-300`}
    >
      <div className="relative w-full h-full grid grid-cols-8 grid-rows-8 rounded-lg overflow-hidden shadow-inner">
        {displayRanks.map((rank, rIdx) =>
          displayFiles.map((file, cIdx) => {
            const square = `${file}${rank}` as Square;
            const piece = getPieceAt(square);
            const isLight = (files.indexOf(file) + parseInt(rank, 10)) % 2 !== 0;

            const isSelected = selectedSquare === square;
            const legalMove = legalMoveMap.get(square);
            const isLastMoveFrom = lastMove?.from === square;
            const isLastMoveTo = lastMove?.to === square;
            const isKingInCheck = kingInCheckSquare === square;

            // In Face-to-Face mode, Black's pieces rotate 180° towards Player 2
            const pieceRotation =
              playMode === 'face-to-face' && piece?.color === 'b' ? 'rotate-180' : '';

            return (
              <div
                key={square}
                onClick={() => !disabled && onSquareClick(square)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, square)}
                className={`relative flex items-center justify-center cursor-pointer select-none transition-colors duration-150 ${
                  isLight ? theme.lightSquare : theme.darkSquare
                } ${isSelected ? theme.selectedSquare : ''} ${
                  isLastMoveFrom || isLastMoveTo ? theme.lastMoveSquare : ''
                } ${isKingInCheck ? theme.checkSquare : ''}`}
              >
                {/* Board edge coordinates */}
                {cIdx === 0 && (
                  <span className="absolute top-0.5 left-1 text-[9px] sm:text-[10px] font-bold opacity-60 pointer-events-none select-none">
                    {rank}
                  </span>
                )}
                {rIdx === 7 && (
                  <span className="absolute bottom-0.5 right-1 text-[9px] sm:text-[10px] font-bold opacity-60 pointer-events-none select-none">
                    {file}
                  </span>
                )}

                {/* Legal Move Indicators */}
                {legalMove && (
                  <>
                    {!piece ? (
                      // Empty square: centered soft dot
                      <div
                        className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full ${theme.legalMoveDot} transition-transform hover:scale-125 pointer-events-none`}
                      />
                    ) : (
                      // Capture target: outer target ring
                      <div className="absolute inset-0 m-1 rounded-full border-4 border-amber-600/60 ring-2 ring-red-500/40 pointer-events-none animate-pulse" />
                    )}
                  </>
                )}

                {/* Chess Piece */}
                {piece && (
                  <div
                    draggable={!disabled}
                    onDragStart={(e) => handleDragStart(e, square)}
                    className={`relative w-[84%] h-[84%] flex items-center justify-center transition-transform duration-150 active:scale-95 ${pieceRotation}`}
                  >
                    <ChessPiece type={piece.type} color={piece.color} />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
