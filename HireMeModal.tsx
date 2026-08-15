import React, { useState, useEffect, useRef, useCallback } from 'react';
import { hireMeSlides } from './constants';

// Make lottie available on the window object for TypeScript
declare global {
  interface Window {
    lottie: any;
  }
}

interface HireMeModalProps {
  onClose: () => void;
}

const LottiePlayer: React.FC<{ path: string }> = ({ path }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current && window.lottie) {
      const animation = window.lottie.loadAnimation({
        container: ref.current,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path,
      });
      return () => animation.destroy();
    }
  }, [path]);
  return <div ref={ref} className="w-[220px] h-[220px] md:w-[280px] md:h-[280px]"></div>;
};

const HireMeModal: React.FC<HireMeModalProps> = ({ onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % hireMeSlides.length);
  }, []);
  
  const prevSlide = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + hireMeSlides.length) % hireMeSlides.length);
  }, []);
  
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 12000);

    return () => clearInterval(timer);
  }, [currentIndex, nextSlide]);

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [nextSlide, prevSlide, onClose]);

  const currentSlide = hireMeSlides[currentIndex];

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-lg z-[100] flex items-center justify-center p-4">
      <div className="glass-panel-strong rounded-3xl p-6 md:p-8 w-full max-w-2xl flex flex-col items-center relative animate-fade-in border border-[#d4a657]/30 shadow-2xl">
        
        {/* Header Badge */}
        <div className="flex items-center justify-between w-full mb-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#d4a657] animate-ping"></span>
            <span className="text-xs font-bold uppercase tracking-widest text-[#d4a657]">Why Hire Me</span>
          </div>
        </div>

        <LottiePlayer path={currentSlide.url} />

        <p className="text-[#ece8dc] text-base md:text-lg text-center min-h-[85px] flex items-center justify-center font-medium bg-[#0b0e11]/90 p-5 rounded-2xl w-full border border-[#2c323b] shadow-inner leading-relaxed">
          {currentSlide.text}
        </p>

        {/* Navigation Dots */}
        <div className="flex items-center gap-1.5 my-4">
          {hireMeSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all ${idx === currentIndex ? 'w-6 bg-[#d4a657]' : 'w-2 bg-slate-700 hover:bg-slate-500'}`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button onClick={prevSlide} className="px-5 py-2.5 rounded-xl btn-soft text-sm font-bold transition flex items-center gap-1">
            ◄ Prev
          </button>
          <button onClick={nextSlide} className="px-5 py-2.5 rounded-xl btn-accent text-sm font-bold transition flex items-center gap-1">
            Next ►
          </button>
        </div>

        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 w-9 h-9 rounded-full btn-soft text-sm flex items-center justify-center font-bold"
          aria-label="Close modal"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default HireMeModal;