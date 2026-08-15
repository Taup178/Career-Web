
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { playFlapSound, playDeathSound } from './audio';

interface Pipe {
  x: number;
  topHeight: number;
  passed: boolean;
}

interface Cloud {
  x: number;
  y: number;
  speed: number;
  scale: number;
  opacity: number;
}

interface BirdGameProps {
  stopGame: () => void;
  onMatrixNotification: () => void;
  isNotificationVisible: boolean;
}

const BirdGame: React.FC<BirdGameProps> = ({ stopGame, onMatrixNotification, isNotificationVisible }) => {
  const [birdY, setBirdY] = useState(300);
  const [birdVelocity, setBirdVelocity] = useState(0);
  const [pipes, setPipes] = useState<Pipe[]>([]);
  const [clouds, setClouds] = useState<Cloud[]>([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('bird_highscore') || '0', 10);
  });
  const [isGameOver, setIsGameOver] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [matrixNotificationShown, setMatrixNotificationShown] = useState(false);
  const [wasPausedForNotification, setWasPausedForNotification] = useState(false);
  
  const gameWrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameDimensions, setGameDimensions] = useState({ width: 600, height: 600 });
  const gameLoopRef = useRef<number | undefined>(undefined);
  const lastPipeTimeRef = useRef(0);

  // Responsive scaling
  const baseWidth = 600;
  const baseHeight = 600;
  const scale = gameDimensions.width / baseWidth;

  const groundHeight = 44 * scale;
  const birdHeight = 32 * scale;
  const birdWidth = 42 * scale;
  const birdX = 100 * scale;
  const pipeWidth = 72 * scale;
  const pipeGap = 185 * scale;
  const gravity = 0.22 * scale;
  const flapStrength = -5.8 * scale;

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('bird_highscore', score.toString());
    }
  }, [score, highScore]);

  useEffect(() => {
    if (score >= 30 && !matrixNotificationShown) {
      onMatrixNotification();
      setWasPausedForNotification(true);
      setIsRunning(false); // Pause game
      setMatrixNotificationShown(true);
    }
  }, [score, matrixNotificationShown, onMatrixNotification]);

  useEffect(() => {
    if (wasPausedForNotification && !isNotificationVisible) {
      setIsRunning(true);
      setWasPausedForNotification(false);
    }
  }, [isNotificationVisible, wasPausedForNotification]);

  useEffect(() => {
    if (isGameOver) {
      playDeathSound();
    }
  }, [isGameOver]);

  useEffect(() => {
    const wrapper = gameWrapperRef.current;
    if (!wrapper) return;

    const resizeObserver = new ResizeObserver(entries => {
        if (entries[0]) {
            const { width, height } = entries[0].contentRect;
            const aspectRatio = baseWidth / baseHeight;
            let newWidth = width;
            let newHeight = width / aspectRatio;

            if (newHeight > height) {
                newHeight = height;
                newWidth = height * aspectRatio;
            }
            setGameDimensions({ width: newWidth, height: newHeight });
        }
    });
    resizeObserver.observe(wrapper);
    return () => resizeObserver.disconnect();
  }, []);

  const startGame = useCallback(() => {
    setBirdY(gameDimensions.height / 2);
    setBirdVelocity(0);
    setPipes([]);
    setScore(0);
    setIsGameOver(false);
    setMatrixNotificationShown(false);
    lastPipeTimeRef.current = performance.now();
    
    const initialClouds: Cloud[] = [];
    for(let i=0; i<10; i++){
        initialClouds.push({
            x: Math.random() * gameDimensions.width,
            y: Math.random() * gameDimensions.height * 0.4,
            speed: (0.25 + Math.random() * 0.55),
            scale: 0.6 + Math.random() * 0.8,
            opacity: 0.35 + Math.random() * 0.45
        });
    }
    setClouds(initialClouds);
    setIsRunning(true);
  }, [gameDimensions.height, gameDimensions.width]);

  const flap = useCallback(() => {
    if (!isRunning && !isGameOver && !wasPausedForNotification) {
      startGame();
    } else if (isRunning && !isGameOver) {
      playFlapSound();
      setBirdVelocity(flapStrength);
    }
  }, [isGameOver, isRunning, startGame, flapStrength, wasPausedForNotification]);

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (e.code === 'Space') {
      e.preventDefault();
      flap();
    }
  }, [flap]);
  
  const handleGameClick = useCallback(() => {
      flap();
  }, [flap]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  useEffect(() => {
    if (!isRunning) return;

    const gameLoop = (currentTime: number) => {
      if (!isGameOver) {
        setBirdVelocity(v => v + gravity);
        setBirdY(y => {
          const newY = y + birdVelocity;
          if (newY > gameDimensions.height - groundHeight - birdHeight || newY < 0) {
            setIsGameOver(true);
            setIsRunning(false);
            return y;
          }
          return newY;
        });

        if (currentTime - lastPipeTimeRef.current > 1550) {
          const topHeight = Math.random() * (gameDimensions.height - pipeGap - groundHeight - (120 * scale)) + (60 * scale);
          setPipes(p => [...p, { x: gameDimensions.width, topHeight, passed: false }]);
          lastPipeTimeRef.current = currentTime;
        }

        setPipes(currentPipes => {
          let newScore = score;
          let collision = false;
          const updatedPipes = currentPipes
            .map(pipe => ({ ...pipe, x: pipe.x - (3.2 * scale) }))
            .filter(pipe => pipe.x > -pipeWidth);

          for (const pipe of updatedPipes) {
            if (birdX < pipe.x + pipeWidth && birdX + birdWidth > pipe.x &&
                (birdY < pipe.topHeight || birdY + birdHeight > pipe.topHeight + pipeGap)) {
              collision = true;
            }

            if (pipe.x + pipeWidth < birdX && !pipe.passed) {
              pipe.passed = true;
              newScore++;
            }
          }

          if (collision) {
            setIsGameOver(true);
            setIsRunning(false);
          } else if (newScore !== score) {
            setScore(newScore);
          }
          return updatedPipes;
        });
      }
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [isRunning, isGameOver, birdVelocity, gameDimensions, score, gravity, birdY, groundHeight, birdHeight, pipeGap, pipeWidth, scale, birdX]);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if(!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Cyberpunk Dusk Sky Gradient
    const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGradient.addColorStop(0, '#0f172a');
    skyGradient.addColorStop(0.5, '#1e293b');
    skyGradient.addColorStop(1, '#334155');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Clouds Parallax
    setClouds(cls => cls.map(c => {
        let newX = c.x - c.speed * scale * 0.4;
        if (newX < -150 * scale) newX = gameDimensions.width + 150 * scale;
        return {...c, x: newX};
    }));
    clouds.forEach(cloud => {
        ctx.fillStyle = `rgba(255, 255, 255, ${cloud.opacity * 0.4})`;
        ctx.beginPath();
        const cloudWidth = 65 * cloud.scale * scale;
        const cloudHeight = 28 * cloud.scale * scale;
        ctx.ellipse(cloud.x + cloudWidth / 2, cloud.y, cloudWidth, cloudHeight, 0, 0, Math.PI * 2);
        ctx.fill();
    });

    // Pipes
    pipes.forEach(pipe => {
        const pipeGradient = ctx.createLinearGradient(pipe.x, 0, pipe.x + pipeWidth, 0);
        pipeGradient.addColorStop(0, '#10b981');
        pipeGradient.addColorStop(0.5, '#34d399');
        pipeGradient.addColorStop(1, '#059669');
        ctx.fillStyle = pipeGradient;
        ctx.strokeStyle = '#064e3b';
        ctx.lineWidth = 3 * scale;

        const topPipeY = 0;
        const bottomPipeY = pipe.topHeight + pipeGap;

        // Top Pipe
        ctx.fillRect(pipe.x, topPipeY, pipeWidth, pipe.topHeight);
        ctx.strokeRect(pipe.x, topPipeY, pipeWidth, pipe.topHeight);
        ctx.fillRect(pipe.x - 4 * scale, pipe.topHeight - 22 * scale, pipeWidth + 8 * scale, 22 * scale);
        ctx.strokeRect(pipe.x - 4 * scale, pipe.topHeight - 22 * scale, pipeWidth + 8 * scale, 22 * scale);

        // Bottom Pipe
        ctx.fillRect(pipe.x, bottomPipeY, pipeWidth, canvas.height - bottomPipeY - groundHeight);
        ctx.strokeRect(pipe.x, bottomPipeY, pipeWidth, canvas.height - bottomPipeY - groundHeight);
        ctx.fillRect(pipe.x - 4 * scale, bottomPipeY, pipeWidth + 8 * scale, 22 * scale);
        ctx.strokeRect(pipe.x - 4 * scale, bottomPipeY, pipeWidth + 8 * scale, 22 * scale);
    });

    // Ground
    const groundGrad = ctx.createLinearGradient(0, canvas.height - groundHeight, 0, canvas.height);
    groundGrad.addColorStop(0, '#d4a657');
    groundGrad.addColorStop(0.2, '#8b5a2b');
    groundGrad.addColorStop(1, '#3d2310');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, canvas.height - groundHeight, canvas.width, groundHeight);
    
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(0, canvas.height - groundHeight, canvas.width, 6 * scale);

    // Bird
    const birdRotation = Math.min(Math.max(birdVelocity * 4, -30), 80);
    ctx.save();
    ctx.translate(birdX + birdWidth / 2, birdY + birdHeight / 2);
    ctx.rotate(birdRotation * Math.PI / 180);

    // Body
    ctx.fillStyle = '#fbbf24';
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.ellipse(0, 0, birdWidth / 2, birdHeight / 2, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    // Wing
    const wingAngle = Math.sin(Date.now() / 100) * 0.4 - 0.2 + (birdVelocity < 0 ? -0.5 : 0.2);
    ctx.save();
    ctx.rotate(wingAngle);
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.ellipse(-birdWidth / 8, 0, birdWidth / 3, birdHeight / 4, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Beak
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.moveTo(birdWidth / 2 - 4 * scale, 0);
    ctx.lineTo(birdWidth / 2 + 10 * scale, -4 * scale);
    ctx.lineTo(birdWidth / 2 + 10 * scale, 4 * scale);
    ctx.closePath();
    ctx.fill();

    // Eye
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(birdWidth / 4, -birdHeight / 6, 4.5 * scale, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(birdWidth / 4 + 1.5 * scale, -birdHeight / 6, 2.2 * scale, 0, 2 * Math.PI);
    ctx.fill();

    ctx.restore();

  }, [birdY, birdVelocity, pipes, clouds, gameDimensions, isRunning, isGameOver, groundHeight, birdHeight, birdWidth, birdX, pipeGap, pipeWidth, scale]);

  const restartGame = () => {
    setIsGameOver(false);
    setIsRunning(false);
    startGame();
  };

  return (
    <div ref={gameWrapperRef} className="absolute inset-0 bg-[#0f1215]/95 rounded-3xl shadow-2xl border border-[#d4a657]/30 flex items-center justify-center overflow-hidden">
        <div className="relative" style={{width: gameDimensions.width, height: gameDimensions.height}} onClick={handleGameClick}>
            <canvas 
                ref={canvasRef} 
                width={gameDimensions.width} 
                height={gameDimensions.height} 
                className="cursor-pointer rounded-3xl border border-[#334155] shadow-inner"
            />
            
            {/* Top Score HUD */}
            <div className="absolute top-4 inset-x-0 flex items-center justify-between px-6 z-10 pointer-events-none">
              <div className="bg-[#0f172a]/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-emerald-500/30 text-emerald-400 font-mono text-sm font-bold shadow-md">
                HIGH: {highScore}
              </div>
              <div className="text-[#f8fafc] text-4xl font-extrabold font-mono [text-shadow:0_4px_12px_rgba(0,0,0,0.6)]">
                {score}
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); stopGame(); }} 
                className="pointer-events-auto px-3 py-1 text-xs font-semibold rounded-full bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/40 transition"
              >
                ✕ Exit
              </button>
            </div>
            
            {/* Start Game Overlay */}
            {(!isRunning && !isGameOver && !wasPausedForNotification) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-[#0a0c0e]/85 backdrop-blur-md rounded-3xl p-6 text-center animate-fade-in">
                    <div className="text-5xl mb-2">🐤</div>
                    <h2 className="text-[#f8fafc] text-4xl font-extrabold mb-2 tracking-wide [text-shadow:0_2px_10px_rgba(212,166,87,0.3)]">FLAPPY BIRD</h2>
                    <p className="text-[#94a3b8] text-sm mb-6 max-w-xs">Nonavigate the matrix pipes. Score 30 points to unlock the secret terminal command!</p>
                    <button 
                      onClick={(e) => { e.stopPropagation(); startGame(); }} 
                      className="px-8 py-3 text-lg rounded-2xl btn-accent font-bold cursor-pointer transform hover:scale-105 transition shadow-xl pointer-events-auto"
                    >
                      ▶ Start Game
                    </button>
                    <p className="text-[#cbd5e1] text-xs mt-5">Press <span className="px-2 py-1 bg-[#1e293b] rounded border border-slate-600 font-mono text-amber-400">SPACE</span> or <span className="px-2 py-1 bg-[#1e293b] rounded border border-slate-600 font-mono text-amber-400">CLICK</span> to flap</p>
                </div>
            )}
            
            {/* Game Over Overlay */}
            {isGameOver && (
                <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/80 backdrop-blur-md animate-fade-in rounded-3xl p-4">
                    <div className="glass-panel-strong p-8 rounded-3xl shadow-2xl text-center max-w-sm w-full border border-red-500/30">
                        <div className="text-4xl mb-2">💥</div>
                        <h2 className="text-red-400 text-3xl font-extrabold tracking-wide mb-1">GAME OVER</h2>
                        <div className="text-[#cbd5e1] text-sm mb-4">You hit an obstacle!</div>
                        
                        <div className="bg-[#1e293b]/80 p-4 rounded-2xl border border-slate-700/80 mb-6 flex justify-around">
                          <div>
                            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Score</div>
                            <div className="text-2xl font-bold text-amber-400">{score}</div>
                          </div>
                          <div className="w-[1px] bg-slate-700"></div>
                          <div>
                            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Best</div>
                            <div className="text-2xl font-bold text-emerald-400">{highScore}</div>
                          </div>
                        </div>

                        <div className="flex gap-3 justify-center">
                            <button onClick={(e) => { e.stopPropagation(); restartGame(); }} className="flex-1 py-2.5 text-base rounded-2xl btn-accent font-bold cursor-pointer transition">Try Again</button>
                            <button onClick={(e) => { e.stopPropagation(); stopGame(); }} className="px-5 py-2.5 text-base rounded-2xl btn-soft text-slate-200 cursor-pointer transition">Exit</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};
export default BirdGame;
