import React from 'react';
import type { Color } from 'chess.js';

interface ChessClockProps {
  color: Color;
  name: string;
  timeRemaining: number;
  isActive: boolean;
  isFaceToFace?: boolean;
  isUntimed?: boolean;
  onPressClock?: () => void;
  disabled?: boolean;
}

export const ChessClock: React.FC<ChessClockProps> = ({
  color,
  name,
  timeRemaining,
  isActive,
  isFaceToFace = false,
  isUntimed = false,
  onPressClock,
  disabled = false,
}) => {
  const isWhite = color === 'w';

  // Format time (MM:SS or S.s if under 10 seconds)
  const formatTime = (seconds: number) => {
    if (isUntimed) return '∞';
    if (seconds <= 0) return '00:00';

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    if (seconds < 10) {
      const tenths = Math.floor((seconds % 1) * 10);
      return `${secs}.${tenths}s`;
    }

    const minStr = mins < 10 ? `0${mins}` : `${mins}`;
    const secStr = secs < 10 ? `0${secs}` : `${secs}`;
    return `${minStr}:${secStr}`;
  };

  const isLowTime = !isUntimed && timeRemaining > 0 && timeRemaining <= 30;
  const isCriticalTime = !isUntimed && timeRemaining > 0 && timeRemaining <= 10;
  const isTimeOut = !isUntimed && timeRemaining <= 0;

  // Face to face orientation for black
  const rotateClass = isFaceToFace && !isWhite ? 'rotate-180' : '';

  return (
    <div
      onClick={() => {
        if (!disabled && isActive && onPressClock) {
          onPressClock();
        }
      }}
      className={`relative flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 select-none ${
        rotateClass
      } ${
        isActive
          ? 'bg-amber-950/40 border-2 border-amber-500/80 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
          : 'bg-slate-900/90 border border-slate-800 opacity-85'
      } ${isActive && !disabled ? 'cursor-pointer hover:border-amber-400' : ''}`}
    >
      {/* Player identity */}
      <div className="flex items-center gap-2.5">
        <span
          className={`w-3.5 h-3.5 rounded-full border shadow-sm ${
            isWhite ? 'bg-amber-100 border-amber-300' : 'bg-slate-900 border-slate-600'
          }`}
          aria-hidden="true"
        />
        <div className="flex flex-col">
          <span className="text-xs font-semibold tracking-wide text-slate-200 truncate max-w-[120px]">
            {name}
          </span>
          <span className="text-[10px] text-slate-400">
            {isWhite ? 'White' : 'Black'} {isActive ? '· Turn' : ''}
          </span>
        </div>
      </div>

      {/* Clock display */}
      <div
        className={`font-tabular text-xl md:text-2xl font-bold tracking-tight px-3 py-1 rounded-lg ${
          isTimeOut
            ? 'bg-red-950/80 text-red-400 border border-red-700/60'
            : isCriticalTime
            ? 'bg-red-950/50 text-red-300 animate-pulse border border-red-600/50'
            : isLowTime
            ? 'bg-amber-950/40 text-amber-300 border border-amber-600/40'
            : isActive
            ? 'bg-amber-500/10 text-amber-200'
            : 'text-slate-400'
        }`}
      >
        {formatTime(timeRemaining)}
      </div>

      {/* Physical tactile button bar hint */}
      {isActive && !disabled && (
        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-amber-500 text-slate-950 text-[9px] font-bold tracking-wider uppercase rounded shadow">
          Active
        </div>
      )}
    </div>
  );
};
