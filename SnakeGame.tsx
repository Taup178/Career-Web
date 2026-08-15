
import React, { useState, useEffect, useRef, useCallback } from 'react';

import { playEatSound, playDeathSound } from './audio';

interface SnakeSegment {
  x: number;
  y: number;
}

interface SnakeGameProps {
  stopGame: () => void;
  onMatrixNotification: () => void;
  isNotificationVisible: boolean;
}

const TILE_COUNT_X = 24;
const TILE_COUNT_Y = 24;

const SnakeGame: React.FC<SnakeGameProps> = ({ stopGame, onMatrixNotification, isNotificationVisible }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameWrapperRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  const [isStarted, setIsStarted] = useState(false);
  const [snake, setSnake] = useState<SnakeSegment[]>([]);
  const [apple, setApple] = useState<SnakeSegment>({ x: 0, y: 0 });
  const [obstacles, setObstacles] = useState<SnakeSegment[]>([]);
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('snake_highscore') || '0', 10);
  });
  const [isGameOver, setIsGameOver] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 600, height: 500 });
  const [matrixNotificationShown, setMatrixNotificationShown] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const inputQueue = useRef<{ x: number, y: number }[]>([]);

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('snake_highscore', score.toString());
    }
  }, [score, highScore]);

  useEffect(() => {
    if (score >= 150 && !matrixNotificationShown) {
      onMatrixNotification();
      setIsPaused(true); // Pause game
      setMatrixNotificationShown(true);
    }
  }, [score, matrixNotificationShown, onMatrixNotification]);
  
  useEffect(() => {
    if (isPaused && !isNotificationVisible) {
      setIsPaused(false);
      gameWrapperRef.current?.focus();
    }
  }, [isNotificationVisible, isPaused]);

  useEffect(() => {
    if (isGameOver) {
      playDeathSound();
    }
  }, [isGameOver]);

  const generateValidPosition = useCallback((currentSnake: SnakeSegment[], currentObstacles: SnakeSegment[]): SnakeSegment => {
    let pos: SnakeSegment = { x: 0, y: 0 };
    let valid = false;
    while (!valid) {
      pos = { x: Math.floor(Math.random() * TILE_COUNT_X), y: Math.floor(Math.random() * TILE_COUNT_Y) };
      const isSnake = currentSnake.some(s => s.x === pos.x && s.y === pos.y);
      const isObstacle = currentObstacles.some(o => o.x === pos.x && o.y === pos.y);
      if (!isSnake && !isObstacle) {
        valid = true;
      }
    }
    return pos;
  }, []);

  const resetGame = useCallback(() => {
    const initialSnake = [{ x: 10, y: 10 }];
    const initialObstacles: SnakeSegment[] = [];
    for (let i = 0; i < 8; i++) {
        initialObstacles.push(generateValidPosition(initialSnake, initialObstacles));
    }
    
    setSnake(initialSnake);
    setObstacles(initialObstacles);
    setApple(generateValidPosition(initialSnake, initialObstacles));
    setVelocity({ x: 1, y: 0 });
    setScore(0);
    setIsGameOver(false);
    setIsPaused(false);
    setMatrixNotificationShown(false);
    inputQueue.current = [];
  }, [generateValidPosition]);

  const startGame = useCallback(() => {
    resetGame();
    setIsStarted(true);
    setTimeout(() => gameWrapperRef.current?.focus(), 50);
  }, [resetGame]);

  const handleDirectionChange = useCallback((newVel: { x: number; y: number }) => {
    if (!isStarted || isGameOver || isPaused) return;
    const lastVel = inputQueue.current.length > 0 ? inputQueue.current[inputQueue.current.length - 1] : velocity;
    if (newVel.x !== -lastVel.x || newVel.y !== -lastVel.y) {
        inputQueue.current.push(newVel);
    }
  }, [isStarted, isGameOver, isPaused, velocity]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isStarted || isGameOver) return;
    let newVel: {x: number, y: number} | null = null;
    switch (e.key) {
      case 'ArrowUp': case 'w': case 'W': newVel = { x: 0, y: -1 }; break;
      case 'ArrowDown': case 's': case 'S': newVel = { x: 0, y: 1 }; break;
      case 'ArrowLeft': case 'a': case 'A': newVel = { x: -1, y: 0 }; break;
      case 'ArrowRight': case 'd': case 'D': newVel = { x: 1, y: 0 }; break;
    }
    if (newVel) {
      e.preventDefault();
      handleDirectionChange(newVel);
    }
  }, [isStarted, isGameOver, handleDirectionChange]);
  
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
  
  useEffect(() => {
    if (!isStarted || isGameOver || isPaused) return;
    
    const gameTick = setInterval(() => {
      let currentVelocity = velocity;
      if (inputQueue.current.length > 0) {
        const nextVel = inputQueue.current.shift()!;
        if (nextVel.x !== -velocity.x || nextVel.y !== -velocity.y) {
          currentVelocity = nextVel;
          setVelocity(nextVel);
        }
      }

      setSnake(prevSnake => {
        if (prevSnake.length === 0) return [];
        const head = { 
          x: (prevSnake[0].x + currentVelocity.x + TILE_COUNT_X) % TILE_COUNT_X, 
          y: (prevSnake[0].y + currentVelocity.y + TILE_COUNT_Y) % TILE_COUNT_Y 
        };
        
        const selfCollision = prevSnake.slice(1).some(s => s.x === head.x && s.y === head.y);
        const obstacleCollision = obstacles.some(o => o.x === head.x && o.y === head.y);
        if (selfCollision || obstacleCollision) {
          setIsGameOver(true);
          return prevSnake;
        }

        const newSnake = [head, ...prevSnake];
        if (head.x === apple.x && head.y === apple.y) {
          playEatSound();
          setScore(s => s + 10);
          setApple(generateValidPosition(newSnake, obstacles));
        } else {
          newSnake.pop();
        }
        return newSnake;
      });
    }, 140);

    return () => clearInterval(gameTick);
  }, [isStarted, isGameOver, isPaused, velocity, apple, obstacles, generateValidPosition]);

  useEffect(() => {
    const wrapper = canvasContainerRef.current;
    if (!wrapper) return;

    const resizeObserver = new ResizeObserver(entries => {
        if (entries[0]) {
            const { width, height } = entries[0].contentRect;
            const aspectRatio = TILE_COUNT_X / TILE_COUNT_Y;
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

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;
    
    const gridSize = canvas.width / TILE_COUNT_X;

    // Cyberpunk Dark Board pattern
    for (let y = 0; y < TILE_COUNT_Y; y++) {
      for (let x = 0; x < TILE_COUNT_X; x++) {
        ctx.fillStyle = (x + y) % 2 === 0 ? '#111827' : '#1f2937';
        ctx.fillRect(x * gridSize, y * gridSize, gridSize, gridSize);
      }
    }

    // Grid lines accent
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= TILE_COUNT_X; i++) {
      ctx.beginPath();
      ctx.moveTo(i * gridSize, 0);
      ctx.lineTo(i * gridSize, canvas.height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * gridSize);
      ctx.lineTo(canvas.width, i * gridSize);
      ctx.stroke();
    }

    // Obstacles (Cyber Rocks)
    obstacles.forEach(o => {
      ctx.fillStyle = '#475569';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.fillRect(o.x * gridSize + 1, o.y * gridSize + 1, gridSize - 2, gridSize - 2);
      ctx.strokeRect(o.x * gridSize + 1, o.y * gridSize + 1, gridSize - 2, gridSize - 2);
      ctx.fillStyle = '#64748b';
      ctx.fillRect(o.x * gridSize + 4, o.y * gridSize + 4, gridSize - 8, gridSize - 8);
    });
    
    // Apple (Glowing Ruby)
    const appleX = apple.x * gridSize;
    const appleY = apple.y * gridSize;
    const appleGrad = ctx.createRadialGradient(appleX + gridSize/2, appleY + gridSize/2, 1, appleX + gridSize/2, appleY + gridSize/2, gridSize/2);
    appleGrad.addColorStop(0, '#f87171');
    appleGrad.addColorStop(0.7, '#ef4444');
    appleGrad.addColorStop(1, '#991b1b');
    ctx.fillStyle = appleGrad;
    ctx.beginPath();
    ctx.arc(appleX + gridSize/2, appleY + gridSize/2, gridSize/2 - 2, 0, 2 * Math.PI);
    ctx.fill();

    // Apple shine
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.beginPath();
    ctx.arc(appleX + gridSize * 0.65, appleY + gridSize * 0.35, gridSize * 0.14, 0, 2 * Math.PI);
    ctx.fill();

    // Stem
    ctx.strokeStyle = '#15803d';
    ctx.lineWidth = Math.max(2, gridSize / 8);
    ctx.beginPath();
    ctx.moveTo(appleX + gridSize / 2, appleY + gridSize * 0.2);
    ctx.lineTo(appleX + gridSize * 0.6, appleY + 1);
    ctx.stroke();

    // Snake
    snake.forEach((s, i) => {
      const isHead = i === 0;
      const segmentGrad = ctx.createLinearGradient(s.x * gridSize, s.y * gridSize, s.x * gridSize + gridSize, s.y * gridSize + gridSize);
      if (isHead) {
        segmentGrad.addColorStop(0, '#38bdf8');
        segmentGrad.addColorStop(1, '#0284c7');
      } else {
        segmentGrad.addColorStop(0, '#0ea5e9');
        segmentGrad.addColorStop(1, '#0369a1');
      }
      ctx.fillStyle = segmentGrad;
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1.5;
      
      const pad = isHead ? 1 : 1.5;
      ctx.fillRect(s.x * gridSize + pad, s.y * gridSize + pad, gridSize - pad * 2, gridSize - pad * 2);

      if (isHead) {
          const eyeSize = Math.max(3, Math.floor(gridSize / 5));
          const eyeOffset1 = Math.floor(gridSize / 4);
          const eyeOffset2 = gridSize - eyeOffset1 - eyeSize;
          let eye1 = {x:0, y:0}, eye2 = {x:0, y:0};

          if (velocity.x === 1) { // Right
              eye1 = {x: s.x * gridSize + eyeOffset2, y: s.y * gridSize + eyeOffset1};
              eye2 = {x: s.x * gridSize + eyeOffset2, y: s.y * gridSize + eyeOffset2};
          } else if (velocity.x === -1) { // Left
              eye1 = {x: s.x * gridSize + eyeOffset1, y: s.y * gridSize + eyeOffset1};
              eye2 = {x: s.x * gridSize + eyeOffset1, y: s.y * gridSize + eyeOffset2};
          } else if (velocity.y === -1) { // Up
              eye1 = {x: s.x * gridSize + eyeOffset1, y: s.y * gridSize + eyeOffset1};
              eye2 = {x: s.x * gridSize + eyeOffset2, y: s.y * gridSize + eyeOffset1};
          } else { // Down
              eye1 = {x: s.x * gridSize + eyeOffset1, y: s.y * gridSize + eyeOffset2};
              eye2 = {x: s.x * gridSize + eyeOffset2, y: s.y * gridSize + eyeOffset2};
          }
          
          ctx.fillStyle = 'white';
          ctx.beginPath();
          ctx.arc(eye1.x + eyeSize/2, eye1.y + eyeSize/2, eyeSize/2, 0, Math.PI * 2);
          ctx.arc(eye2.x + eyeSize/2, eye2.y + eyeSize/2, eyeSize/2, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.arc(eye1.x + eyeSize/2, eye1.y + eyeSize/2, eyeSize/4, 0, Math.PI * 2);
          ctx.arc(eye2.x + eyeSize/2, eye2.y + eyeSize/2, eyeSize/4, 0, Math.PI * 2);
          ctx.fill();
      }
    });
  }, [snake, apple, obstacles, velocity, canvasSize]);

  return (
    <div ref={gameWrapperRef} tabIndex={-1} className="absolute inset-0 bg-[#0f1215]/95 rounded-3xl shadow-2xl border border-[#d4a657]/30 flex flex-col items-center justify-between focus:outline-none overflow-hidden">
      
      {/* Canvas Area */}
      <div ref={canvasContainerRef} className="relative w-full flex-grow flex items-center justify-center p-1 md:p-2 overflow-hidden">
        <div className="relative" style={{width: canvasSize.width, height: canvasSize.height}}>
          
          {/* Top Score HUD */}
          <div className="absolute top-4 inset-x-0 flex items-center justify-between px-6 z-10 pointer-events-none">
            <div className="bg-[#0f172a]/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-sky-500/30 text-sky-400 font-mono text-sm font-bold shadow-md">
              SCORE: {score}
            </div>
            <div className="bg-[#0f172a]/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-emerald-500/30 text-emerald-400 font-mono text-sm font-bold shadow-md">
              BEST: {highScore}
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); stopGame(); }} 
              className="pointer-events-auto px-3 py-1 text-xs font-semibold rounded-full bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/40 transition"
            >
              ✕ Exit
            </button>
          </div>

          <canvas ref={canvasRef} width={canvasSize.width} height={canvasSize.height} className="bg-[#0b0f14] rounded-3xl border border-[#1e293b] shadow-inner" />

          {/* Start Screen Overlay */}
          {!isStarted && !isGameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-[#0a0c0e]/85 backdrop-blur-md rounded-3xl p-6 text-center animate-fade-in">
              <div className="text-5xl mb-2">🐍</div>
              <h2 className="text-[#f8fafc] text-4xl font-extrabold mb-2 tracking-wide [text-shadow:0_2px_10px_rgba(56,189,248,0.3)]">CYBER SNAKE</h2>
              <p className="text-[#94a3b8] text-sm mb-6 max-w-xs">Eat apples and avoid rocks. Reach 150 points to unlock the secret terminal command!</p>
              <button 
                onClick={startGame} 
                className="px-8 py-3 text-lg rounded-2xl btn-accent font-bold cursor-pointer transform hover:scale-105 transition shadow-xl"
              >
                ▶ Start Game
              </button>
              <p className="text-[#cbd5e1] text-xs mt-5">Use <span className="px-2 py-1 bg-[#1e293b] rounded border border-slate-600 font-mono text-sky-400">ARROW KEYS</span> or <span className="px-2 py-1 bg-[#1e293b] rounded border border-slate-600 font-mono text-sky-400">WASD</span></p>
            </div>
          )}

          {/* Game Over Overlay */}
          {isGameOver && (
            <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/80 backdrop-blur-md animate-fade-in rounded-3xl p-4">
              <div className="glass-panel-strong p-8 rounded-3xl shadow-2xl text-center max-w-sm w-full border border-red-500/30">
                <div className="text-4xl mb-2">💀</div>
                <h2 className="text-red-400 text-3xl font-extrabold font-mono tracking-wide mb-1">GAME OVER</h2>
                <div className="text-[#cbd5e1] text-sm mb-4">You crashed!</div>

                <div className="bg-[#1e293b]/80 p-4 rounded-2xl border border-slate-700/80 mb-6 flex justify-around">
                  <div>
                    <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Score</div>
                    <div className="text-2xl font-bold text-sky-400">{score}</div>
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
        </div>
      </div>
      
      {/* Mobile Neon D-Pad Controls */}
      <div className="flex-shrink-0 md:hidden flex flex-col items-center gap-1 pb-2 pt-0.5 z-10">
        <div className="grid grid-cols-3 gap-1.5 w-[150px]">
          <div />
          <button onClick={() => handleDirectionChange({ x: 0, y: -1 })} className="w-11 h-9 rounded-xl bg-[#1e293b] hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 text-base font-bold active:scale-95 transition flex items-center justify-center">▲</button>
          <div />
          <button onClick={() => handleDirectionChange({ x: -1, y: 0 })} className="w-11 h-9 rounded-xl bg-[#1e293b] hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 text-base font-bold active:scale-95 transition flex items-center justify-center">◄</button>
          <button onClick={() => handleDirectionChange({ x: 0, y: 1 })} className="w-11 h-9 rounded-xl bg-[#1e293b] hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 text-base font-bold active:scale-95 transition flex items-center justify-center">▼</button>
          <button onClick={() => handleDirectionChange({ x: 1, y: 0 })} className="w-11 h-9 rounded-xl bg-[#1e293b] hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 text-base font-bold active:scale-95 transition flex items-center justify-center">►</button>
        </div>
      </div>
    </div>
  );
};

export default SnakeGame;
