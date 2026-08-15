
import React, { useState, useCallback, useEffect, useRef } from 'react';
import Terminal from './Terminal';
import Simulation from './Simulation';
import BirdGame from './BirdGame';
import SnakeGame from './SnakeGame';
import PacmanGame from './PacmanGame';
import HireMeModal from './HireMeModal';
import MatrixOverlay from './MatrixOverlay';
import { GameState } from './types';
import { birdFacts, snakeFacts, pacmanFacts } from './constants';
import MatrixNotificationModal from './MatrixNotificationModal';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.None);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [showHireMe, setShowHireMe] = useState<boolean>(false);
  const [showMatrix, setShowMatrix] = useState<boolean>(false);
  const [showMatrixNotification, setShowMatrixNotification] = useState<boolean>(false);
  const [isMatrixCommandUnlocked, setIsMatrixCommandUnlocked] = useState<boolean>(false);
  
  const [currentBirdFact, setCurrentBirdFact] = useState<string>(birdFacts[0]);
  const [currentSnakeFact, setCurrentSnakeFact] = useState<string>(snakeFacts[0]);
  const [currentPacmanFact, setCurrentPacmanFact] = useState<string>(pacmanFacts[0]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const matrixAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Animation audio
    const audioUrl = 'https://www.dropbox.com/scl/fi/ailtg061xmt3t352x992i/Akatsuki-MP3_160K.mp3?rlkey=tm40w5vwdi0irbg3bu8e9xpg0&st=jsht14sg&dl=1';
    audioRef.current = new Audio(audioUrl);
    audioRef.current.volume = 0.5;
    const handleSongEnd = () => setIsAnimating(false);
    const animationAudio = audioRef.current;
    animationAudio.addEventListener('ended', handleSongEnd);

    // Matrix audio
    const matrixAudioUrl = 'https://www.dropbox.com/scl/fi/tkh1bl0ic8k3fmweo8df9/Pirates.mp3?rlkey=9q0e3zs2g3ltqq4uocikkear1&st=n9kyon8f&dl=1';
    matrixAudioRef.current = new Audio(matrixAudioUrl);
    matrixAudioRef.current.loop = true;
    matrixAudioRef.current.volume = 0.5;
    const matrixAudio = matrixAudioRef.current;

    return () => {
      animationAudio.removeEventListener('ended', handleSongEnd);
      animationAudio.pause();
      matrixAudio.pause();
    };
  }, []);
  
  useEffect(() => {
    if (showMatrix && matrixAudioRef.current) {
        matrixAudioRef.current.currentTime = 0;
        matrixAudioRef.current.play().catch(e => console.error("Matrix audio play failed:", e));
    } else if (!showMatrix && matrixAudioRef.current) {
        matrixAudioRef.current.pause();
    }
  }, [showMatrix]);

  useEffect(() => {
    const birdFactInterval = setInterval(() => {
      setCurrentBirdFact(prev => {
        const newFact = birdFacts[Math.floor(Math.random() * birdFacts.length)];
        return newFact === prev ? birdFacts[(birdFacts.indexOf(prev) + 1) % birdFacts.length] : newFact;
      });
    }, 15000);

    const snakeFactInterval = setInterval(() => {
      setCurrentSnakeFact(prev => {
        const newFact = snakeFacts[Math.floor(Math.random() * snakeFacts.length)];
        return newFact === prev ? snakeFacts[(snakeFacts.indexOf(prev) + 1) % snakeFacts.length] : newFact;
      });
    }, 15000);

    const pacmanFactInterval = setInterval(() => {
      setCurrentPacmanFact(prev => {
        const newFact = pacmanFacts[Math.floor(Math.random() * pacmanFacts.length)];
        return newFact === prev ? pacmanFacts[(pacmanFacts.indexOf(prev) + 1) % pacmanFacts.length] : newFact;
      });
    }, 15000);
  
    return () => {
      clearInterval(birdFactInterval);
      clearInterval(snakeFactInterval);
      clearInterval(pacmanFactInterval);
    };
  }, []);


  const handleCommand = useCallback((command: string) => {
    switch (command) {
      case 'play bird':
        setGameState(GameState.Bird);
        break;
      case 'stop bird':
        setGameState(GameState.None);
        break;
      case 'play snake':
        setGameState(GameState.Snake);
        break;
      case 'stop snake':
        setGameState(GameState.None);
        break;
      case 'play pacman':
        setGameState(GameState.Pacman);
        break;
      case 'stop pacman':
        setGameState(GameState.None);
        break;
      case 'start animation':
        setIsAnimating(true);
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(e => console.error("Audio play failed:", e));
        }
        break;
      case 'stop animation':
        setIsAnimating(false);
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
        break;
      case 'hire me':
        setShowHireMe(true);
        break;
      case 'matrix':
        if (isMatrixCommandUnlocked) {
          setShowMatrix(true);
        }
        break;
      default:
        break;
    }
  }, [isMatrixCommandUnlocked]);

  const closeHireMe = useCallback(() => setShowHireMe(false), []);
  const closeMatrix = useCallback(() => setShowMatrix(false), []);
  const stopGame = useCallback(() => setGameState(GameState.None), []);

  const triggerMatrixNotification = useCallback(() => {
    setShowMatrixNotification(true);
    setIsMatrixCommandUnlocked(true);
  }, []);
  const closeMatrixNotification = useCallback(() => setShowMatrixNotification(false), []);

  const isGameActive = gameState !== GameState.None;

  const getCurrentFact = () => {
    if (gameState === GameState.Bird) return currentBirdFact;
    if (gameState === GameState.Snake) return currentSnakeFact;
    if (gameState === GameState.Pacman) return currentPacmanFact;
    return '';
  };

  return (
    <div className="font-mono text-slate-100 h-screen w-screen overflow-hidden flex flex-col md:flex-row bg-[#0b0d0e]">
      {showHireMe && <HireMeModal onClose={closeHireMe} />}
      {showMatrix && <MatrixOverlay onClose={closeMatrix} />}
      {showMatrixNotification && <MatrixNotificationModal onClose={closeMatrixNotification} />}

      <div className={`w-full flex flex-col bg-[#14171a]/95 md:w-3/5 md:h-full ${isGameActive ? 'h-full' : 'h-3/5'} glass-panel`}> 
        <div className="flex-1 relative overflow-hidden min-h-0 rounded-b-3xl md:rounded-r-none md:rounded-l-3xl border border-[#333] border-opacity-60">
          <div className={`absolute inset-0 z-[2] ${isGameActive ? 'hidden' : 'block'}`}>
            <Simulation isAnimating={isAnimating} />
          </div>
          
          {gameState === GameState.Bird && <BirdGame stopGame={stopGame} onMatrixNotification={triggerMatrixNotification} isNotificationVisible={showMatrixNotification} />}
          {gameState === GameState.Snake && <SnakeGame stopGame={stopGame} onMatrixNotification={triggerMatrixNotification} isNotificationVisible={showMatrixNotification} />}
          {gameState === GameState.Pacman && <PacmanGame stopGame={stopGame} onMatrixNotification={triggerMatrixNotification} isNotificationVisible={showMatrixNotification} />}
        </div>
        
        <div className={`w-full shrink-0 bg-[#14171a]/95 flex flex-col items-center justify-center py-2 px-3 md:p-4 border-t border-[#333] ${isGameActive ? 'flex' : 'hidden'}`}>
          <div className="font-bold text-xs md:text-base text-accent mb-0.5 md:mb-1">Did you know:</div>
          <div className="text-slate-200 text-xs md:text-sm font-medium text-center max-w-[95%]">{getCurrentFact()}</div>
        </div>
      </div>

      <div className={`w-full md:w-2/5 md:h-full ${isGameActive ? 'hidden md:block' : 'h-2/5'} glass-panel border border-[#333] border-opacity-60 rounded-t-3xl md:rounded-t-none md:rounded-r-3xl`}>
        <Terminal onCommand={handleCommand} isMatrixCommandUnlocked={isMatrixCommandUnlocked} />
      </div>
    </div>
  );
};

export default App;
