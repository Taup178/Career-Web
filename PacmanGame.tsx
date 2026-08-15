import React, { useState, useEffect, useRef, useCallback } from 'react';
import { playEatSound, playDeathSound } from './audio';

interface PacmanGameProps {
  stopGame: () => void;
  onMatrixNotification: () => void;
  isNotificationVisible: boolean;
}

// 0: Pellet, 1: Wall, 2: Empty, 3: Power Pellet, 4: Ghost Gate
const MAZE_GRID = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,3,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,3,1],
  [1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
  [1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,0,1],
  [1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,1],
  [1,1,1,1,0,1,1,1,2,2,2,1,1,1,0,1,1,1,1],
  [2,2,2,1,0,1,1,1,1,4,1,1,1,1,0,1,2,2,2],
  [1,1,1,1,0,1,2,2,2,2,2,2,2,1,0,1,1,1,1],
  [2,2,2,2,0,1,1,1,1,1,1,1,1,1,0,2,2,2,2],
  [1,1,1,1,0,1,0,0,0,0,0,0,0,1,0,1,1,1,1],
  [2,2,2,1,0,1,0,1,1,1,1,1,0,1,0,1,2,2,2],
  [1,1,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
  [1,3,0,1,0,0,0,0,0,2,0,0,0,0,0,1,0,3,1],
  [1,1,0,1,0,1,0,1,1,1,1,1,0,1,0,1,0,1,1],
  [1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,1],
  [1,0,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

const GRID_ROWS = MAZE_GRID.length;
const GRID_COLS = MAZE_GRID[0].length;

type Direction = { x: number; y: number };

const DIR_UP: Direction = { x: 0, y: -1 };
const DIR_DOWN: Direction = { x: 0, y: 1 };
const DIR_LEFT: Direction = { x: -1, y: 0 };
const DIR_RIGHT: Direction = { x: 1, y: 0 };
const DIR_NONE: Direction = { x: 0, y: 0 };

interface Ghost {
  x: number;
  y: number;
  dir: Direction;
  color: string;
  name: string;
  isFrightened: boolean;
}

const initGhosts = (): Ghost[] => [
  { x: 9, y: 7, dir: DIR_LEFT, color: '#ef4444', name: 'Blinky', isFrightened: false },
  { x: 8, y: 9, dir: DIR_UP, color: '#f472b6', name: 'Pinky', isFrightened: false },
  { x: 9, y: 9, dir: DIR_UP, color: '#22d3ee', name: 'Inky', isFrightened: false },
  { x: 10, y: 9, dir: DIR_UP, color: '#fb923c', name: 'Clyde', isFrightened: false }
];

const PacmanGame: React.FC<PacmanGameProps> = ({ stopGame, onMatrixNotification, isNotificationVisible }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  const [isStarted, setIsStarted] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('pacman_highscore') || '0', 10);
  });

  const [grid, setGrid] = useState<number[][]>(() => MAZE_GRID.map(row => [...row]));
  const [pacman, setPacman] = useState({ x: 9, y: 16, dir: DIR_RIGHT, nextDir: DIR_RIGHT });
  const [ghosts, setGhosts] = useState<Ghost[]>(initGhosts);
  const [frightenedTime, setFrightenedTime] = useState(0);
  const [canvasSize, setCanvasSize] = useState({ width: 400, height: 400 });
  const [matrixNotificationShown, setMatrixNotificationShown] = useState(false);

  // Refs for synchronous game loop calculations
  const gridRef = useRef(grid);
  const pacmanRef = useRef(pacman);
  const ghostsRef = useRef(ghosts);
  const scoreRef = useRef(score);
  const frightenedTimeRef = useRef(frightenedTime);
  const frameCountRef = useRef(0);
  const inputQueue = useRef<Direction[]>([]);

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('pacman_highscore', score.toString());
    }
  }, [score, highScore]);

  const canMoveTo = (x: number, y: number, currentGrid: number[][]) => {
    const wrappedX = (x + GRID_COLS) % GRID_COLS;
    const wrappedY = (y + GRID_ROWS) % GRID_ROWS;
    const cell = currentGrid[wrappedY][wrappedX];
    return cell !== 1 && cell !== 4; // Not a wall or ghost gate for Pac-Man
  };

  const resetGame = useCallback(() => {
    const initialGrid = MAZE_GRID.map(row => [...row]);
    const initialPacman = { x: 9, y: 16, dir: DIR_RIGHT, nextDir: DIR_RIGHT };
    const initialGhosts = initGhosts();

    gridRef.current = initialGrid;
    pacmanRef.current = initialPacman;
    ghostsRef.current = initialGhosts;
    scoreRef.current = 0;
    frightenedTimeRef.current = 0;
    frameCountRef.current = 0;
    inputQueue.current = [];

    setGrid(initialGrid);
    setPacman(initialPacman);
    setGhosts(initialGhosts);
    setScore(0);
    setFrightenedTime(0);
    setIsGameOver(false);
    setIsVictory(false);
    setMatrixNotificationShown(false);
  }, []);

  const startGame = useCallback(() => {
    resetGame();
    setIsStarted(true);
    setTimeout(() => wrapperRef.current?.focus(), 50);
  }, [resetGame]);

  const handleDirectionChange = useCallback((dir: Direction) => {
    if (!isStarted || isGameOver || isVictory) return;
    inputQueue.current.push(dir);
  }, [isStarted, isGameOver, isVictory]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isStarted || isGameOver || isVictory) return;
    let newDir: Direction | null = null;
    switch (e.key) {
      case 'ArrowUp': case 'w': case 'W': newDir = DIR_UP; break;
      case 'ArrowDown': case 's': case 'S': newDir = DIR_DOWN; break;
      case 'ArrowLeft': case 'a': case 'A': newDir = DIR_LEFT; break;
      case 'ArrowRight': case 'd': case 'D': newDir = DIR_RIGHT; break;
    }
    if (newDir) {
      e.preventDefault();
      handleDirectionChange(newDir);
    }
  }, [isStarted, isGameOver, isVictory, handleDirectionChange]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // AI Ghost Movement Logic
  const moveGhostAI = useCallback((ghost: Ghost, pacmanPos: { x: number; y: number; dir: Direction }, currentGrid: number[][]): Ghost => {
    // 1. Ghosts inside Ghost House (y >= 9 or y === 8 && x === 9) heading out
    if (ghost.y >= 9 || (ghost.y === 8 && ghost.x === 9)) {
      let newX = ghost.x;
      let newY = ghost.y;
      let newDir = ghost.dir;
      if (ghost.x < 9) { newX = ghost.x + 1; newDir = DIR_RIGHT; }
      else if (ghost.x > 9) { newX = ghost.x - 1; newDir = DIR_LEFT; }
      else { newY = ghost.y - 1; newDir = DIR_UP; }
      return { ...ghost, x: newX, y: newY, dir: newDir };
    }

    // 2. Outside Ghosts
    const allDirs = [DIR_UP, DIR_DOWN, DIR_LEFT, DIR_RIGHT];
    const validDirs = allDirs.filter(d => {
      const nx = (ghost.x + d.x + GRID_COLS) % GRID_COLS;
      const ny = (ghost.y + d.y + GRID_ROWS) % GRID_ROWS;
      const cell = currentGrid[ny][nx];
      return cell !== 1 && cell !== 4; // cannot enter walls or ghost gate from outside
    });

    if (validDirs.length === 0) return ghost;

    // Filter out 180° reverse direction unless trapped
    const nonReverseDirs = validDirs.filter(d => !(d.x === -ghost.dir.x && d.y === -ghost.dir.y));
    const candidateDirs = nonReverseDirs.length > 0 ? nonReverseDirs : validDirs;

    let chosenDir = candidateDirs[0];

    if (ghost.isFrightened) {
      chosenDir = candidateDirs[Math.floor(Math.random() * candidateDirs.length)];
    } else {
      // Targeting personality AI
      let target = { x: pacmanPos.x, y: pacmanPos.y };
      if (ghost.name === 'Pinky') {
        target = {
          x: (pacmanPos.x + pacmanPos.dir.x * 4 + GRID_COLS) % GRID_COLS,
          y: (pacmanPos.y + pacmanPos.dir.y * 4 + GRID_ROWS) % GRID_ROWS
        };
      } else if (ghost.name === 'Inky') {
        target = {
          x: (pacmanPos.x + pacmanPos.dir.x * 2 + GRID_COLS) % GRID_COLS,
          y: (pacmanPos.y + pacmanPos.dir.y * 2 + GRID_ROWS) % GRID_ROWS
        };
      } else if (ghost.name === 'Clyde') {
        const dist = Math.hypot(ghost.x - pacmanPos.x, ghost.y - pacmanPos.y);
        if (dist < 5) {
          target = { x: 0, y: GRID_ROWS - 1 };
        }
      }

      let minDistance = Infinity;
      candidateDirs.forEach(d => {
        const nx = (ghost.x + d.x + GRID_COLS) % GRID_COLS;
        const ny = (ghost.y + d.y + GRID_ROWS) % GRID_ROWS;
        const dist = Math.hypot(nx - target.x, ny - target.y);
        if (dist < minDistance) {
          minDistance = dist;
          chosenDir = d;
        }
      });
    }

    const nextGx = (ghost.x + chosenDir.x + GRID_COLS) % GRID_COLS;
    const nextGy = (ghost.y + chosenDir.y + GRID_ROWS) % GRID_ROWS;

    return { ...ghost, x: nextGx, y: nextGy, dir: chosenDir };
  }, []);

  // Main game tick loop
  useEffect(() => {
    if (!isStarted || isGameOver || isVictory || isNotificationVisible) return;

    const gameTick = setInterval(() => {
      frameCountRef.current += 1;
      const currentGrid = gridRef.current;
      const prevPac = pacmanRef.current;

      // Handle queued direction input
      let nextDir = prevPac.nextDir;
      if (inputQueue.current.length > 0) {
        nextDir = inputQueue.current.shift()!;
      }

      let currentDir = prevPac.dir;
      const tryNextX = (prevPac.x + nextDir.x + GRID_COLS) % GRID_COLS;
      const tryNextY = (prevPac.y + nextDir.y + GRID_ROWS) % GRID_ROWS;
      if (canMoveTo(tryNextX, tryNextY, currentGrid)) {
        currentDir = nextDir;
      }

      const targetX = (prevPac.x + currentDir.x + GRID_COLS) % GRID_COLS;
      const targetY = (prevPac.y + currentDir.y + GRID_ROWS) % GRID_ROWS;

      let newPacX = prevPac.x;
      let newPacY = prevPac.y;
      if (canMoveTo(targetX, targetY, currentGrid)) {
        newPacX = targetX;
        newPacY = targetY;
      }

      const newPacman = { x: newPacX, y: newPacY, dir: currentDir, nextDir };
      pacmanRef.current = newPacman;

      // Check item collection
      const cell = currentGrid[newPacY][newPacX];
      if (cell === 0 || cell === 3) {
        playEatSound();
        const points = cell === 3 ? 50 : 10;
        scoreRef.current += points;
        currentGrid[newPacY][newPacX] = 2; // Empty space

        if (cell === 3) {
          frightenedTimeRef.current = 35; // ~5 seconds
          ghostsRef.current = ghostsRef.current.map(g => ({ ...g, isFrightened: true }));
        }

        // Check victory
        const remainingDots = currentGrid.some(row => row.some(c => c === 0 || c === 3));
        if (!remainingDots) {
          setIsVictory(true);
        }
      }

      // Frightened timer decrement
      if (frightenedTimeRef.current > 0) {
        frightenedTimeRef.current -= 1;
        if (frightenedTimeRef.current === 0) {
          ghostsRef.current = ghostsRef.current.map(g => ({ ...g, isFrightened: false }));
        }
      }

      // Move Ghosts
      const prevGhosts = ghostsRef.current;
      const movedGhosts = prevGhosts.map(ghost => moveGhostAI(ghost, newPacman, currentGrid));

      // Collision Detection (Direct & Swap)
      let gameOverTriggered = false;
      const updatedGhosts = movedGhosts.map((ghost, i) => {
        const prevG = prevGhosts[i];
        const isDirectCollision = ghost.x === newPacX && ghost.y === newPacY;
        const isSwapCollision = ghost.x === prevPac.x && ghost.y === prevPac.y && prevG.x === newPacX && prevG.y === newPacY;

        if (isDirectCollision || isSwapCollision) {
          if (ghost.isFrightened) {
            playEatSound();
            scoreRef.current += 200;
            return { ...ghost, x: 9, y: 9, isFrightened: false, dir: DIR_UP };
          } else {
            gameOverTriggered = true;
            return ghost;
          }
        }
        return ghost;
      });

      ghostsRef.current = updatedGhosts;

      if (gameOverTriggered) {
        playDeathSound();
        setIsGameOver(true);
      }

      // Synchronize React state for rendering
      setGrid([...currentGrid]);
      setPacman(newPacman);
      setGhosts([...updatedGhosts]);
      setScore(scoreRef.current);
      setFrightenedTime(frightenedTimeRef.current);

    }, 145);

    return () => clearInterval(gameTick);
  }, [isStarted, isGameOver, isVictory, isNotificationVisible, matrixNotificationShown, onMatrixNotification, moveGhostAI]);

  // Handle Resize
  useEffect(() => {
    const wrapper = canvasContainerRef.current;
    if (!wrapper) return;

    const resizeObserver = new ResizeObserver(entries => {
      if (entries[0]) {
        const { width, height } = entries[0].contentRect;
        const aspectRatio = GRID_COLS / GRID_ROWS;
        let newWidth = width;
        let newHeight = width / aspectRatio;

        if (newHeight > height) {
          newHeight = height;
          newWidth = height * aspectRatio;
        }
        setCanvasSize({ width: newWidth, height: newHeight });
      }
    });
    resizeObserver.observe(wrapper);
    return () => resizeObserver.disconnect();
  }, []);

  // Canvas Renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    const cellWidth = canvas.width / GRID_COLS;
    const cellHeight = canvas.height / GRID_ROWS;

    // Draw Background & Maze
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        const cell = grid[r][c];
        const x = c * cellWidth;
        const y = r * cellHeight;

        if (cell === 1) { // Wall
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(x + 1, y + 1, cellWidth - 2, cellHeight - 2);
          ctx.strokeStyle = '#3b82f6';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(x + 1, y + 1, cellWidth - 2, cellHeight - 2);
        } else if (cell === 4) { // Ghost Gate
          ctx.fillStyle = '#f43f5e';
          ctx.fillRect(x + 1, y + cellHeight / 2 - 2, cellWidth - 2, 4);
        } else if (cell === 0) { // Pellet
          ctx.fillStyle = '#fde047';
          ctx.beginPath();
          ctx.arc(x + cellWidth / 2, y + cellHeight / 2, Math.max(2.5, cellWidth / 7), 0, 2 * Math.PI);
          ctx.fill();
        } else if (cell === 3) { // Power Pellet
          ctx.fillStyle = '#fbbf24';
          ctx.shadowColor = '#fbbf24';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(x + cellWidth / 2, y + cellHeight / 2, Math.max(5, cellWidth / 3.2), 0, 2 * Math.PI);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
    }

    // Draw Pac-Man with Chomping Animation
    const pacX = pacman.x * cellWidth + cellWidth / 2;
    const pacY = pacman.y * cellHeight + cellHeight / 2;
    const pacRadius = Math.min(cellWidth, cellHeight) / 2 - 1;

    const chompPhase = frameCountRef.current % 4;
    const mouthAngle = chompPhase === 0 ? 0.05 : chompPhase === 1 ? 0.25 : chompPhase === 2 ? 0.4 : 0.25;

    let baseAngle = 0;
    if (pacman.dir === DIR_LEFT) baseAngle = Math.PI;
    else if (pacman.dir === DIR_UP) baseAngle = 1.5 * Math.PI;
    else if (pacman.dir === DIR_DOWN) baseAngle = 0.5 * Math.PI;

    const startAngle = baseAngle + mouthAngle;
    const endAngle = baseAngle + (2 * Math.PI - mouthAngle);

    ctx.fillStyle = '#facc15';
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.moveTo(pacX, pacY);
    ctx.arc(pacX, pacY, pacRadius, startAngle, endAngle);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw Ghosts
    ghosts.forEach(g => {
      const gx = g.x * cellWidth + cellWidth / 2;
      const gy = g.y * cellHeight + cellHeight / 2;
      const gRadius = Math.min(cellWidth, cellHeight) / 2 - 1;

      const isFlashing = g.isFrightened && frightenedTime < 10 && frightenedTime % 2 === 1;
      ctx.fillStyle = g.isFrightened ? (isFlashing ? '#f8fafc' : '#3b82f6') : g.color;

      ctx.beginPath();
      ctx.arc(gx, gy - gRadius / 4, gRadius, Math.PI, 0, false);
      // Wavy bottom skirt
      ctx.lineTo(gx + gRadius, gy + gRadius);
      ctx.lineTo(gx + gRadius * 0.5, gy + gRadius * 0.7);
      ctx.lineTo(gx, gy + gRadius);
      ctx.lineTo(gx - gRadius * 0.5, gy + gRadius * 0.7);
      ctx.lineTo(gx - gRadius, gy + gRadius);
      ctx.closePath();
      ctx.fill();

      // Eyes facing direction
      const eyeOffsetX = g.dir.x * (gRadius / 4);
      const eyeOffsetY = g.dir.y * (gRadius / 4);

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(gx - gRadius / 3 + eyeOffsetX, gy - gRadius / 3 + eyeOffsetY, gRadius / 3, 0, 2 * Math.PI);
      ctx.arc(gx + gRadius / 3 + eyeOffsetX, gy - gRadius / 3 + eyeOffsetY, gRadius / 3, 0, 2 * Math.PI);
      ctx.fill();

      ctx.fillStyle = g.isFrightened ? '#ef4444' : '#1e1b4b';
      ctx.beginPath();
      ctx.arc(gx - gRadius / 3 + eyeOffsetX * 1.5, gy - gRadius / 3 + eyeOffsetY * 1.5, gRadius / 6, 0, 2 * Math.PI);
      ctx.arc(gx + gRadius / 3 + eyeOffsetX * 1.5, gy - gRadius / 3 + eyeOffsetY * 1.5, gRadius / 6, 0, 2 * Math.PI);
      ctx.fill();
    });

  }, [grid, pacman, ghosts, frightenedTime, canvasSize]);

  return (
    <div ref={wrapperRef} tabIndex={-1} className="absolute inset-0 bg-[#070a0e]/95 rounded-3xl shadow-2xl border border-[#d4a657]/30 flex flex-col items-center justify-between focus:outline-none overflow-hidden">
      
      {/* Canvas Area */}
      <div ref={canvasContainerRef} className="relative w-full flex-grow flex items-center justify-center p-1 md:p-2 overflow-hidden">
        <div className="relative" style={{ width: canvasSize.width, height: canvasSize.height }}>
          
          {/* Top Score HUD */}
          <div className="absolute top-3 inset-x-0 flex items-center justify-between px-4 z-10 pointer-events-none">
            <div className="bg-[#0f172a]/80 backdrop-blur-md px-3 py-1 rounded-full border border-yellow-500/30 text-yellow-400 font-mono text-xs font-bold shadow-md">
              SCORE: {score}
            </div>
            <div className="bg-[#0f172a]/80 backdrop-blur-md px-3 py-1 rounded-full border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold shadow-md">
              BEST: {highScore}
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); stopGame(); }} 
              className="pointer-events-auto px-3 py-1 text-xs font-semibold rounded-full bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/40 transition"
            >
              ✕ Exit
            </button>
          </div>

          <canvas ref={canvasRef} width={canvasSize.width} height={canvasSize.height} className="bg-[#090d16] rounded-3xl border border-[#1e293b] shadow-inner" />

          {/* Start Screen Overlay */}
          {!isStarted && !isGameOver && !isVictory && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-[#0a0c0e]/85 backdrop-blur-md rounded-3xl p-6 text-center animate-fade-in">
              <div className="text-5xl mb-2">🟡</div>
              <h2 className="text-[#f8fafc] text-3xl font-extrabold mb-2 tracking-wide [text-shadow:0_2px_10px_rgba(250,204,21,0.3)]">CYBER PAC-MAN</h2>
              <p className="text-[#94a3b8] text-sm mb-6 max-w-xs">Eat pellets and avoid ghosts! Score 200 points to unlock the secret terminal command!</p>
              <button 
                onClick={startGame} 
                className="px-8 py-3 text-lg rounded-2xl btn-accent font-bold cursor-pointer transform hover:scale-105 transition shadow-xl"
              >
                ▶ Start Game
              </button>
              <p className="text-[#cbd5e1] text-xs mt-5">Use <span className="px-2 py-1 bg-[#1e293b] rounded border border-slate-600 font-mono text-yellow-400">ARROW KEYS</span> or <span className="px-2 py-1 bg-[#1e293b] rounded border border-slate-600 font-mono text-yellow-400">WASD</span></p>
            </div>
          )}

          {/* Game Over Overlay */}
          {isGameOver && (
            <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/80 backdrop-blur-md animate-fade-in rounded-3xl p-4">
              <div className="glass-panel-strong p-6 rounded-3xl shadow-2xl text-center max-w-sm w-full border border-red-500/30">
                <div className="text-4xl mb-2">👻</div>
                <h2 className="text-red-400 text-3xl font-extrabold font-mono tracking-wide mb-1">GAME OVER</h2>
                <div className="text-[#cbd5e1] text-sm mb-4">A ghost caught you!</div>

                <div className="bg-[#1e293b]/80 p-4 rounded-2xl border border-slate-700/80 mb-6 flex justify-around">
                  <div>
                    <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Score</div>
                    <div className="text-2xl font-bold text-yellow-400">{score}</div>
                  </div>
                  <div className="w-[1px] bg-slate-700"></div>
                  <div>
                    <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Best</div>
                    <div className="text-2xl font-bold text-emerald-400">{highScore}</div>
                  </div>
                </div>

                <div className="flex gap-3 justify-center">
                  <button onClick={startGame} className="flex-1 py-2.5 text-base rounded-2xl btn-accent font-bold cursor-pointer transition">Try Again</button>
                  <button onClick={stopGame} className="px-5 py-2.5 text-base rounded-2xl btn-soft text-slate-200 cursor-pointer transition">Exit</button>
                </div>
              </div>
            </div>
          )}

          {/* Victory Overlay */}
          {isVictory && (
            <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/80 backdrop-blur-md animate-fade-in rounded-3xl p-4">
              <div className="glass-panel-strong p-6 rounded-3xl shadow-2xl text-center max-w-sm w-full border border-yellow-500/30">
                <div className="text-4xl mb-2">🏆</div>
                <h2 className="text-yellow-400 text-3xl font-extrabold font-mono tracking-wide mb-1">VICTORY!</h2>
                <div className="text-[#cbd5e1] text-sm mb-4">You cleared the entire maze!</div>

                <div className="flex gap-3 justify-center">
                  <button onClick={startGame} className="flex-1 py-2.5 text-base rounded-2xl btn-accent font-bold cursor-pointer transition">Play Again</button>
                  <button onClick={stopGame} className="px-5 py-2.5 text-base rounded-2xl btn-soft text-slate-200 cursor-pointer transition">Exit</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Mobile Neon D-Pad Controls */}
      <div className="flex-shrink-0 md:hidden flex flex-col items-center gap-1 pb-2 pt-0.5 z-10">
        <div className="grid grid-cols-3 gap-1.5 w-[150px]">
          <div />
          <button onClick={() => handleDirectionChange(DIR_UP)} className="w-11 h-9 rounded-xl bg-[#1e293b] hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 text-base font-bold active:scale-95 transition flex items-center justify-center">▲</button>
          <div />
          <button onClick={() => handleDirectionChange(DIR_LEFT)} className="w-11 h-9 rounded-xl bg-[#1e293b] hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 text-base font-bold active:scale-95 transition flex items-center justify-center">◄</button>
          <button onClick={() => handleDirectionChange(DIR_DOWN)} className="w-11 h-9 rounded-xl bg-[#1e293b] hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 text-base font-bold active:scale-95 transition flex items-center justify-center">▼</button>
          <button onClick={() => handleDirectionChange(DIR_RIGHT)} className="w-11 h-9 rounded-xl bg-[#1e293b] hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 text-base font-bold active:scale-95 transition flex items-center justify-center">►</button>
        </div>
      </div>
    </div>
  );
};

export default PacmanGame;
