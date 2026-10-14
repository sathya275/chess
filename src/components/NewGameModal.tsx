import React, { useState } from 'react';
import type { PlayMode, TimeControl, BoardThemeId } from '../types/chess';
import { TIME_CONTROLS, BOARD_THEMES } from '../utils/constants';
import { Clock, Users, Smartphone, Palette, Play } from 'lucide-react';

interface NewGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartGame: (config: {
    playMode: PlayMode;
    timeControl: TimeControl;
    whiteName: string;
    blackName: string;
    themeId: BoardThemeId;
    autoFlipOnTurn: boolean;
  }) => void;
  currentConfig: {
    playMode: PlayMode;
    timeControl: TimeControl;
    whiteName: string;
    blackName: string;
    themeId: BoardThemeId;
    autoFlipOnTurn: boolean;
  };
}

export const NewGameModal: React.FC<NewGameModalProps> = ({
  isOpen,
  onClose,
  onStartGame,
  currentConfig,
}) => {
  const [playMode, setPlayMode] = useState<PlayMode>(currentConfig.playMode);
  const [selectedTimeControlId, setSelectedTimeControlId] = useState<string>(
    currentConfig.timeControl.id
  );
  const [customMinutes, setCustomMinutes] = useState<number>(5);
  const [customIncrement, setCustomIncrement] = useState<number>(3);
  const [whiteName, setWhiteName] = useState<string>(currentConfig.whiteName);
  const [blackName, setBlackName] = useState<string>(currentConfig.blackName);
  const [themeId, setThemeId] = useState<BoardThemeId>(currentConfig.themeId);
  const [autoFlipOnTurn, setAutoFlipOnTurn] = useState<boolean>(currentConfig.autoFlipOnTurn);

  if (!isOpen) return null;

  const handleStart = () => {
    let finalTimeControl: TimeControl;
    if (selectedTimeControlId === 'custom') {
      finalTimeControl = {
        id: 'custom',
        label: `${customMinutes} | ${customIncrement}`,
        category: 'Custom',
        initialSeconds: customMinutes * 60,
        incrementSeconds: customIncrement,
      };
    } else {
      finalTimeControl =
        TIME_CONTROLS.find((tc) => tc.id === selectedTimeControlId) || TIME_CONTROLS[3];
    }

    onStartGame({
      playMode,
      timeControl: finalTimeControl,
      whiteName: whiteName.trim() || 'White',
      blackName: blackName.trim() || 'Black',
      themeId,
      autoFlipOnTurn,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl my-6">
        {/* Title */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="font-display text-xl font-bold text-amber-200">
              New Chess Match
            </h2>
            <p className="text-xs text-slate-400">
              Offline 2-Player local setup
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-xs px-2.5 py-1 rounded-lg border border-slate-800 hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
        </div>

        <div className="space-y-5 py-4">
          {/* Play Mode Selection */}
          <div>
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-2.5">
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span>Offline Play Setup</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setPlayMode('pass-and-play')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  playMode === 'pass-and-play'
                    ? 'border-amber-500 bg-amber-500/10 text-amber-100 shadow-sm'
                    : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold">Pass & Play</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Standard side-by-side or shared screen with optional auto-flip.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setPlayMode('face-to-face')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  playMode === 'face-to-face'
                    ? 'border-amber-500 bg-amber-500/10 text-amber-100 shadow-sm'
                    : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Smartphone className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold">Face-to-Face Table</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">
                  For 2 players sitting across a desk; Black pieces and clock rotate 180°.
                </p>
              </button>
            </div>

            {playMode === 'pass-and-play' && (
              <label className="flex items-center gap-2 mt-2.5 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={autoFlipOnTurn}
                  onChange={(e) => setAutoFlipOnTurn(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-800 text-amber-500 focus:ring-0 focus:ring-offset-0"
                />
                <span>Automatically flip board orientation on each turn</span>
              </label>
            )}
          </div>

          {/* Time Controls */}
          <div>
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-2.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Time Control</span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {TIME_CONTROLS.map((tc) => (
                <button
                  key={tc.id}
                  type="button"
                  onClick={() => setSelectedTimeControlId(tc.id)}
                  className={`py-2 px-2.5 rounded-lg border text-center transition-all ${
                    selectedTimeControlId === tc.id
                      ? 'border-amber-500 bg-amber-500/15 text-amber-200 font-semibold'
                      : 'border-slate-800 bg-slate-800/50 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <span className="block text-xs font-tabular">{tc.label}</span>
                  <span className="block text-[9px] text-slate-400 font-sans">{tc.category}</span>
                </button>
              ))}

              <button
                type="button"
                onClick={() => setSelectedTimeControlId('custom')}
                className={`py-2 px-2.5 rounded-lg border text-center transition-all ${
                  selectedTimeControlId === 'custom'
                    ? 'border-amber-500 bg-amber-500/15 text-amber-200 font-semibold'
                    : 'border-slate-800 bg-slate-800/50 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <span className="block text-xs">Custom</span>
                <span className="block text-[9px] text-slate-400">Timer</span>
              </button>
            </div>

            {selectedTimeControlId === 'custom' && (
              <div className="grid grid-cols-2 gap-3 mt-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Minutes per player
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={customMinutes}
                    onChange={(e) => setCustomMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-tabular focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Increment (seconds)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={customIncrement}
                    onChange={(e) => setCustomIncrement(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-tabular focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Player Names */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                White Player
              </label>
              <input
                type="text"
                maxLength={18}
                value={whiteName}
                onChange={(e) => setWhiteName(e.target.value)}
                placeholder="Player 1"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Black Player
              </label>
              <input
                type="text"
                maxLength={18}
                value={blackName}
                onChange={(e) => setBlackName(e.target.value)}
                placeholder="Player 2"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Board Theme */}
          <div>
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-2.5">
              <Palette className="w-3.5 h-3.5 text-amber-400" />
              <span>Board Visual Theme</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.values(BOARD_THEMES).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setThemeId(t.id as BoardThemeId)}
                  className={`p-2 rounded-xl border text-left transition-all ${
                    themeId === t.id
                      ? 'border-amber-500 bg-amber-500/10'
                      : 'border-slate-800 bg-slate-800/40 hover:border-slate-700'
                  }`}
                >
                  <div className="flex h-5 w-full rounded overflow-hidden mb-1.5 border border-black/20">
                    <div className={`w-1/2 h-full ${t.lightSquare}`} />
                    <div className={`w-1/2 h-full ${t.darkSquare}`} />
                  </div>
                  <span className="block text-[11px] font-medium text-slate-300 truncate">
                    {t.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Start Game Action */}
        <div className="pt-4 border-t border-slate-800">
          <button
            onClick={handleStart}
            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-semibold text-sm bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-lg shadow-amber-500/20 active:scale-[0.99]"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Start Match</span>
          </button>
        </div>
      </div>
    </div>
  );
};
