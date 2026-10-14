import { useState, useEffect, useRef, useCallback } from 'react';
import { Chess } from 'chess.js';
import type { Square, PieceSymbol, Color } from 'chess.js';
import { Board } from './components/Board';
import { ChessClock } from './components/ChessClock';
import { CapturedPieces } from './components/CapturedPieces';
import { MoveLog } from './components/MoveLog';
import { PromotionModal } from './components/PromotionModal';
import { GameOutcomeModal } from './components/GameOutcomeModal';
import { NewGameModal } from './components/NewGameModal';
import { RulesModal } from './components/RulesModal';
import { soundFx } from './utils/audio';
import { BOARD_THEMES, TIME_CONTROLS, PIECE_VALUES } from './utils/constants';
import type {
  BoardThemeId,
  PlayMode,
  TimeControl,
  GameOutcome,
  MoveRecord,
} from './types/chess';
import {
  Volume2,
  VolumeX,
  RotateCw,
  Plus,
  BookOpen,
  Undo2,
  HelpCircle,
} from 'lucide-react';

const STORAGE_KEY = 'grandmaster_offline_chess_v1';

export default function App() {
  // Initialize Chess.js
  const chessRef = useRef(new Chess());
  const chess = chessRef.current;

  // Game configuration
  const [playMode, setPlayMode] = useState<PlayMode>('pass-and-play');
  const [timeControl, setTimeControl] = useState<TimeControl>(TIME_CONTROLS[3]); // Blitz 5 min
  const [whiteName, setWhiteName] = useState<string>('White');
  const [blackName, setBlackName] = useState<string>('Black');
  const [themeId, setThemeId] = useState<BoardThemeId>('wood');
  const [autoFlipOnTurn, setAutoFlipOnTurn] = useState<boolean>(false);
  const [orientation, setOrientation] = useState<Color>('w');
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(true);

  // Board state
  const [board, setBoard] = useState(chess.board());
  const [turn, setTurn] = useState<Color>('w');
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<{ to: Square; captured?: PieceSymbol }[]>([]);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);
  const [kingInCheckSquare, setKingInCheckSquare] = useState<Square | null>(null);

  // Move tracking & Replay
  const [moves, setMoves] = useState<MoveRecord[]>([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState<number>(-1);

  // Clocks (seconds remaining)
  const [whiteTime, setWhiteTime] = useState<number>(timeControl.initialSeconds);
  const [blackTime, setBlackTime] = useState<number>(timeControl.initialSeconds);
  const [isClockRunning, setIsClockRunning] = useState<boolean>(false);

  // Game Outcome
  const [gameOutcome, setGameOutcome] = useState<GameOutcome>({ type: 'in_progress' });
  const [isOutcomeModalOpen, setIsOutcomeModalOpen] = useState<boolean>(false);

  // Modals
  const [isNewGameOpen, setIsNewGameOpen] = useState<boolean>(false);
  const [isRulesOpen, setIsRulesOpen] = useState<boolean>(false);
  const [pendingPromotion, setPendingPromotion] = useState<{ from: Square; to: Square } | null>(
    null
  );
  const [drawOfferPending, setDrawOfferPending] = useState<boolean>(false);
  const [resignConfirmPending, setResignConfirmPending] = useState<boolean>(false);

  // Sync soundFx enabled state
  useEffect(() => {
    soundFx.enabled = isSoundEnabled;
  }, [isSoundEnabled]);

  // Evaluate Check and Checkmate / Stalemate
  const checkGameOver = useCallback(() => {
    if (chess.isGameOver()) {
      setIsClockRunning(false);

      if (chess.isCheckmate()) {
        const winner = chess.turn() === 'w' ? 'b' : 'w';
        setGameOutcome({ type: 'checkmate', winner });
        soundFx.playVictory();
        setIsOutcomeModalOpen(true);
      } else if (chess.isStalemate()) {
        setGameOutcome({ type: 'stalemate', reason: 'stalemate' });
        setIsOutcomeModalOpen(true);
      } else if (chess.isThreefoldRepetition()) {
        setGameOutcome({ type: 'draw_repetition', reason: 'threefold repetition' });
        setIsOutcomeModalOpen(true);
      } else if (chess.isInsufficientMaterial()) {
        setGameOutcome({ type: 'draw_insufficient', reason: 'insufficient material' });
        setIsOutcomeModalOpen(true);
      } else {
        setGameOutcome({ type: 'draw_50_moves', reason: 'fifty-move rule' });
        setIsOutcomeModalOpen(true);
      }
      return true;
    }

    // Check indicator
    if (chess.inCheck()) {
      soundFx.playCheck();
      const currentTurn = chess.turn();
      const currentBoard = chess.board();
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const piece = currentBoard[r][c];
          if (piece && piece.type === 'k' && piece.color === currentTurn) {
            setKingInCheckSquare(piece.square);
            return false;
          }
        }
      }
    } else {
      setKingInCheckSquare(null);
    }

    return false;
  }, [chess]);

  // Clock countdown loop (100ms interval for responsive display)
  useEffect(() => {
    if (!isClockRunning || timeControl.initialSeconds === 0 || gameOutcome.type !== 'in_progress') {
      return;
    }

    const interval = setInterval(() => {
      if (turn === 'w') {
        setWhiteTime((prev) => {
          if (prev <= 0.1) {
            setIsClockRunning(false);
            setGameOutcome({ type: 'time_out', winner: 'b' });
            setIsOutcomeModalOpen(true);
            return 0;
          }
          return Math.max(0, prev - 0.1);
        });
      } else {
        setBlackTime((prev) => {
          if (prev <= 0.1) {
            setIsClockRunning(false);
            setGameOutcome({ type: 'time_out', winner: 'w' });
            setIsOutcomeModalOpen(true);
            return 0;
          }
          return Math.max(0, prev - 0.1);
        });
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isClockRunning, turn, timeControl.initialSeconds, gameOutcome.type]);

  // Calculate material differences and captured pieces
  const calculateMaterial = () => {
    const counts = {
      w: { p: 0, n: 0, b: 0, r: 0, q: 0 },
      b: { p: 0, n: 0, b: 0, r: 0, q: 0 },
    };

    type CapturablePiece = 'p' | 'n' | 'b' | 'r' | 'q';
    const totalStarting: Record<CapturablePiece, number> = { p: 8, n: 2, b: 2, r: 2, q: 1 };
    const currentBoard = chess.board();

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = currentBoard[r][c];
        if (piece && piece.type !== 'k') {
          counts[piece.color][piece.type as CapturablePiece]++;
        }
      }
    }

    const capturedByWhite: PieceSymbol[] = [];
    const capturedByBlack: PieceSymbol[] = [];

    (Object.keys(totalStarting) as CapturablePiece[]).forEach((p) => {
      const missingBlack = totalStarting[p] - counts.b[p];
      for (let i = 0; i < missingBlack; i++) {
        capturedByWhite.push(p);
      }
      const missingWhite = totalStarting[p] - counts.w[p];
      for (let i = 0; i < missingWhite; i++) {
        capturedByBlack.push(p);
      }
    });

    let whiteScore = 0;
    let blackScore = 0;
    capturedByWhite.forEach((p) => (whiteScore += PIECE_VALUES[p]));
    capturedByBlack.forEach((p) => (blackScore += PIECE_VALUES[p]));

    return {
      capturedByWhite,
      capturedByBlack,
      whiteAdvantage: Math.max(0, whiteScore - blackScore),
      blackAdvantage: Math.max(0, blackScore - whiteScore),
    };
  };

  const { capturedByWhite, capturedByBlack, whiteAdvantage, blackAdvantage } = calculateMaterial();

  // Execute a valid move
  const executeMove = (from: Square, to: Square, promotion?: PieceSymbol) => {
    try {
      const move = chess.move({
        from,
        to,
        promotion: promotion || 'q',
      });

      if (!move) return false;

      // Audio feedback
      if (move.captured) {
        soundFx.playCapture();
      } else if (move.flags.includes('k') || move.flags.includes('q')) {
        soundFx.playCastle();
      } else {
        soundFx.playMove();
      }

      // Add time increment to current player
      if (timeControl.incrementSeconds > 0) {
        if (move.color === 'w') {
          setWhiteTime((prev) => prev + timeControl.incrementSeconds);
        } else {
          setBlackTime((prev) => prev + timeControl.incrementSeconds);
        }
      }

      // Start clock on first move
      if (!isClockRunning && timeControl.initialSeconds > 0) {
        setIsClockRunning(true);
      }

      const newBoard = chess.board();
      const newTurn = chess.turn();

      setBoard(newBoard);
      setTurn(newTurn);
      setLastMove({ from, to });
      setSelectedSquare(null);
      setLegalMoves([]);

      // Auto flip orientation in pass-and-play if enabled
      if (autoFlipOnTurn && playMode === 'pass-and-play') {
        setOrientation(newTurn);
      }

      // Record move
      const newRecord: MoveRecord = {
        san: move.san,
        from,
        to,
        color: move.color,
        piece: move.piece,
        captured: move.captured,
        fen: chess.fen(),
      };

      const updatedMoves = [...moves, newRecord];
      setMoves(updatedMoves);
      setCurrentMoveIndex(updatedMoves.length - 1);

      // Check game end or check status
      setTimeout(() => {
        checkGameOver();
      }, 50);

      return true;
    } catch {
      return false;
    }
  };

  // Handle Square clicks
  const handleSquareClick = (square: Square) => {
    if (gameOutcome.type !== 'in_progress') return;

    // If viewing history, snap back to live position on interaction
    if (currentMoveIndex < moves.length - 1) {
      handleNavigateMove(moves.length - 1);
    }

    // 1. If clicking on the already selected square, deselect
    if (selectedSquare === square) {
      setSelectedSquare(null);
      setLegalMoves([]);
      return;
    }

    // 2. If a square is selected, check if target square is a legal move
    if (selectedSquare) {
      const isLegal = legalMoves.some((m) => m.to === square);
      if (isLegal) {
        // Check for pawn promotion (White pawn to 8th rank or Black pawn to 1st rank)
        const piece = chess.get(selectedSquare);
        const isPromotion =
          piece?.type === 'p' &&
          ((piece.color === 'w' && square[1] === '8') ||
            (piece.color === 'b' && square[1] === '1'));

        if (isPromotion) {
          setPendingPromotion({ from: selectedSquare, to: square });
          return;
        }

        executeMove(selectedSquare, square);
        return;
      }
    }

    // 3. Select friendly piece with legal moves
    const piece = chess.get(square);
    if (piece && piece.color === chess.turn()) {
      setSelectedSquare(square);
      const movesFromSquare = chess.moves({ square, verbose: true });
      setLegalMoves(
        movesFromSquare.map((m) => ({
          to: m.to as Square,
          captured: m.captured as PieceSymbol | undefined,
        }))
      );
    } else {
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  };

  // Confirm Promotion selection
  const handlePromotionSelect = (promotionPiece: PieceSymbol) => {
    if (pendingPromotion) {
      executeMove(pendingPromotion.from, pendingPromotion.to, promotionPiece);
      setPendingPromotion(null);
    }
  };

  // Step through move history
  const handleNavigateMove = (targetIndex: number) => {
    setCurrentMoveIndex(targetIndex);

    if (targetIndex === -1) {
      // Starting position
      const tempChess = new Chess();
      setBoard(tempChess.board());
      setLastMove(null);
      setKingInCheckSquare(null);
      setSelectedSquare(null);
      setLegalMoves([]);
    } else if (targetIndex >= 0 && targetIndex < moves.length) {
      const targetFen = moves[targetIndex].fen;
      const tempChess = new Chess(targetFen);
      setBoard(tempChess.board());
      setLastMove({ from: moves[targetIndex].from, to: moves[targetIndex].to });
      setKingInCheckSquare(tempChess.inCheck() ? findKingSquare(tempChess) : null);
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  };

  const findKingSquare = (chessInstance: InstanceType<typeof Chess>): Square | null => {
    const curBoard = chessInstance.board();
    const curTurn = chessInstance.turn();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = curBoard[r][c];
        if (piece && piece.type === 'k' && piece.color === curTurn) {
          return piece.square;
        }
      }
    }
    return null;
  };

  // Undo last move
  const handleUndo = () => {
    if (moves.length === 0 || gameOutcome.type !== 'in_progress') return;
    chess.undo();
    const newBoard = chess.board();
    const newMoves = moves.slice(0, -1);
    setBoard(newBoard);
    setMoves(newMoves);
    setCurrentMoveIndex(newMoves.length - 1);
    setTurn(chess.turn());
    setSelectedSquare(null);
    setLegalMoves([]);
    setLastMove(newMoves.length > 0 ? { from: newMoves[newMoves.length - 1].from, to: newMoves[newMoves.length - 1].to } : null);
    setKingInCheckSquare(chess.inCheck() ? findKingSquare(chess) : null);
  };

  // Resign match
  const handleResign = () => {
    if (gameOutcome.type !== 'in_progress') return;
    setResignConfirmPending(true);
  };

  const confirmResign = () => {
    setIsClockRunning(false);
    const winner: Color = turn === 'w' ? 'b' : 'w';
    setGameOutcome({ type: 'resigned', winner });
    setResignConfirmPending(false);
    setIsOutcomeModalOpen(true);
  };

  // Offer Draw
  const handleOfferDraw = () => {
    if (gameOutcome.type !== 'in_progress') return;
    setDrawOfferPending(true);
  };

  const acceptDraw = () => {
    setIsClockRunning(false);
    setGameOutcome({ type: 'draw_agreement', reason: 'mutual draw agreement' });
    setDrawOfferPending(false);
    setIsOutcomeModalOpen(true);
  };

  // Reset / New Match
  const startNewGame = (config: {
    playMode: PlayMode;
    timeControl: TimeControl;
    whiteName: string;
    blackName: string;
    themeId: BoardThemeId;
    autoFlipOnTurn: boolean;
  }) => {
    chess.reset();
    setBoard(chess.board());
    setTurn('w');
    setSelectedSquare(null);
    setLegalMoves([]);
    setLastMove(null);
    setKingInCheckSquare(null);
    setMoves([]);
    setCurrentMoveIndex(-1);

    setPlayMode(config.playMode);
    setTimeControl(config.timeControl);
    setWhiteName(config.whiteName);
    setBlackName(config.blackName);
    setThemeId(config.themeId);
    setAutoFlipOnTurn(config.autoFlipOnTurn);
    setOrientation('w');

    setWhiteTime(config.timeControl.initialSeconds);
    setBlackTime(config.timeControl.initialSeconds);
    setIsClockRunning(false);
    setGameOutcome({ type: 'in_progress' });
    setIsOutcomeModalOpen(false);
    setIsNewGameOpen(false);
    setDrawOfferPending(false);
    setResignConfirmPending(false);
  };

  // Rematch with reversed colors
  const handleRematch = () => {
    startNewGame({
      playMode,
      timeControl,
      whiteName: blackName,
      blackName: whiteName,
      themeId,
      autoFlipOnTurn,
    });
  };

  // Flip board manually
  const toggleOrientation = () => {
    setOrientation((prev) => (prev === 'w' ? 'b' : 'w'));
  };

  // LocalStorage autosave
  useEffect(() => {
    try {
      if (moves.length > 0) {
        const payload = {
          fen: chess.fen(),
          moves,
          whiteTime,
          blackTime,
          whiteName,
          blackName,
          timeControl,
          playMode,
          themeId,
          autoFlipOnTurn,
          orientation,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      }
    } catch {
      // storage quota or private browsing
    }
  }, [moves, whiteTime, blackTime, whiteName, blackName, timeControl, playMode, themeId, autoFlipOnTurn, orientation, chess]);

  const activeTheme = BOARD_THEMES[themeId] || BOARD_THEMES.wood;
  const isUntimed = timeControl.initialSeconds === 0;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* Top Bar Contract: Exactly 3 zones separated by gap-8 */}
      <header className="flex items-center justify-between gap-8 px-4 sm:px-8 py-3.5 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur sticky top-0 z-40">
        {/* Zone 1: Single-element brand wordmark */}
        <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
          <span className="font-display text-lg sm:text-xl font-bold tracking-tight text-amber-100 whitespace-nowrap shrink-0">
            Grandmaster Chess
          </span>
          <span className="text-[11px] font-sans text-slate-400 hidden sm:inline">
            Offline 2-Player
          </span>
        </div>

        {/* Zone 2: Concise single-line navigation & tools */}
        <nav className="flex items-center gap-3 sm:gap-5 text-xs font-medium text-slate-400">
          <button
            onClick={() => setIsRulesOpen(true)}
            className="flex items-center gap-1.5 hover:text-amber-200 transition-colors whitespace-nowrap shrink-0 py-1"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Rules</span>
          </button>

          <button
            onClick={toggleOrientation}
            className="flex items-center gap-1.5 hover:text-amber-200 transition-colors whitespace-nowrap shrink-0 py-1"
            title="Flip board orientation"
          >
            <RotateCw className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Flip Board</span>
          </button>

          <button
            onClick={() => setIsSoundEnabled(!isSoundEnabled)}
            className="flex items-center gap-1.5 hover:text-amber-200 transition-colors whitespace-nowrap shrink-0 py-1"
            title={isSoundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
          >
            {isSoundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-slate-500" />
            )}
            <span className="hidden sm:inline">{isSoundEnabled ? 'Sound On' : 'Muted'}</span>
          </button>

          {moves.length > 0 && gameOutcome.type === 'in_progress' && (
            <button
              onClick={handleUndo}
              className="flex items-center gap-1 hover:text-amber-200 transition-colors whitespace-nowrap shrink-0 py-1"
              title="Takeback move"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Undo</span>
            </button>
          )}
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsNewGameOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg shadow-sm transition-all whitespace-nowrap shrink-0 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Match</span>
          </button>
        </div>
      </header>

      {/* Main Chess Arena */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 flex flex-col lg:flex-row gap-6 items-center lg:items-start justify-center">
        {/* Left Column: Board & Clocks */}
        <div className="w-full max-w-[560px] flex flex-col gap-3">
          {/* Top Player (Black if White orientation; White if Black orientation) */}
          <div className="flex flex-col gap-1">
            <ChessClock
              color={orientation === 'w' ? 'b' : 'w'}
              name={orientation === 'w' ? blackName : whiteName}
              timeRemaining={orientation === 'w' ? blackTime : whiteTime}
              isActive={turn === (orientation === 'w' ? 'b' : 'w') && gameOutcome.type === 'in_progress'}
              isFaceToFace={playMode === 'face-to-face'}
              isUntimed={isUntimed}
              onPressClock={() => {}}
              disabled={gameOutcome.type !== 'in_progress'}
            />
            <CapturedPieces
              capturedPieces={orientation === 'w' ? capturedByBlack : capturedByWhite}
              opponentColor={orientation === 'w' ? 'w' : 'b'}
              materialAdvantage={orientation === 'w' ? blackAdvantage : whiteAdvantage}
              isFaceToFace={playMode === 'face-to-face'}
            />
          </div>

          {/* Chess Board */}
          <div className="relative">
            <Board
              board={board}
              orientation={orientation}
              playMode={playMode}
              theme={activeTheme}
              selectedSquare={selectedSquare}
              legalMoves={legalMoves}
              lastMove={lastMove}
              kingInCheckSquare={kingInCheckSquare}
              onSquareClick={handleSquareClick}
              disabled={currentMoveIndex < moves.length - 1 || gameOutcome.type !== 'in_progress'}
            />

            {/* In-check toast notification */}
            {kingInCheckSquare && gameOutcome.type === 'in_progress' && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-600/90 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg border border-red-400 animate-pulse pointer-events-none">
                {turn === 'w' ? whiteName : blackName} is in Check!
              </div>
            )}
          </div>

          {/* Bottom Player (White if White orientation; Black if Black orientation) */}
          <div className="flex flex-col gap-1">
            <CapturedPieces
              capturedPieces={orientation === 'w' ? capturedByWhite : capturedByBlack}
              opponentColor={orientation === 'w' ? 'b' : 'w'}
              materialAdvantage={orientation === 'w' ? whiteAdvantage : blackAdvantage}
            />
            <ChessClock
              color={orientation === 'w' ? 'w' : 'b'}
              name={orientation === 'w' ? whiteName : blackName}
              timeRemaining={orientation === 'w' ? whiteTime : blackTime}
              isActive={turn === (orientation === 'w' ? 'w' : 'b') && gameOutcome.type === 'in_progress'}
              isUntimed={isUntimed}
              onPressClock={() => {}}
              disabled={gameOutcome.type !== 'in_progress'}
            />
          </div>
        </div>

        {/* Right Column: Move Notation & Offline Match Controls */}
        <div className="w-full max-w-[560px] lg:max-w-md flex flex-col gap-4 min-h-[460px] lg:h-[620px]">
          {/* Quick status bar */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/70 border border-slate-800 rounded-xl text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Match Mode:</span>
              <span className="font-semibold text-amber-300 capitalize">
                {playMode === 'face-to-face' ? 'Face-to-Face Table' : 'Pass & Play'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Clock:</span>
              <span className="font-semibold text-slate-200 font-tabular">
                {timeControl.label}
              </span>
            </div>
          </div>

          {/* Notation & History Replayer */}
          <div className="flex-1">
            <MoveLog
              moves={moves}
              currentMoveIndex={currentMoveIndex}
              onNavigateMove={handleNavigateMove}
              onResign={handleResign}
              onOfferDraw={handleOfferDraw}
              pgn={chess.pgn()}
              fen={chess.fen()}
              isGameOver={gameOutcome.type !== 'in_progress'}
            />
          </div>

          {/* Offline quick tips */}
          <div className="px-4 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Tap piece to see legal moves or drag directly.</span>
            </span>
            <span className="text-slate-500 font-tabular">100% Offline</span>
          </div>
        </div>
      </main>

      {/* Promotion Modal */}
      <PromotionModal
        color={pendingPromotion ? chess.get(pendingPromotion.from)?.color || 'w' : 'w'}
        isOpen={Boolean(pendingPromotion)}
        onSelect={handlePromotionSelect}
        isFaceToFace={playMode === 'face-to-face'}
      />

      {/* Draw Offer Confirmation Modal */}
      {drawOfferPending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl">
            <h3 className="font-display text-lg font-bold text-amber-200 mb-1">
              Draw Offer
            </h3>
            <p className="text-xs text-slate-300 mb-5">
              {turn === 'w' ? whiteName : blackName} offers a mutual draw. Does{' '}
              {turn === 'w' ? blackName : whiteName} agree?
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setDrawOfferPending(false)}
                className="py-2.5 px-3 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              >
                Decline
              </button>
              <button
                onClick={acceptDraw}
                className="py-2.5 px-3 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors"
              >
                Accept Draw
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resign Confirmation Modal */}
      {resignConfirmPending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl">
            <h3 className="font-display text-lg font-bold text-rose-300 mb-1">
              Confirm Resignation
            </h3>
            <p className="text-xs text-slate-300 mb-5">
              Are you sure you want to resign this match? Victory will be conceded to{' '}
              {turn === 'w' ? blackName : whiteName}.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setResignConfirmPending(false)}
                className="py-2.5 px-3 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              >
                Continue Match
              </button>
              <button
                onClick={confirmResign}
                className="py-2.5 px-3 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition-colors"
              >
                Yes, Resign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Outcome Modal */}
      <GameOutcomeModal
        outcome={gameOutcome}
        isOpen={isOutcomeModalOpen}
        onRematch={handleRematch}
        onNewGame={() => {
          setIsOutcomeModalOpen(false);
          setIsNewGameOpen(true);
        }}
        onReview={() => setIsOutcomeModalOpen(false)}
        whiteName={whiteName}
        blackName={blackName}
      />

      {/* New Game Setup Modal */}
      <NewGameModal
        isOpen={isNewGameOpen}
        onClose={() => setIsNewGameOpen(false)}
        onStartGame={startNewGame}
        currentConfig={{
          playMode,
          timeControl,
          whiteName,
          blackName,
          themeId,
          autoFlipOnTurn,
        }}
      />

      {/* Rules Reference Modal */}
      <RulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />
    </div>
  );
}
