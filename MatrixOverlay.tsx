import React, { useEffect, useRef } from 'react';

interface MatrixOverlayProps {
  onClose: () => void;
}

const MatrixOverlay: React.FC<MatrixOverlayProps> = ({ onClose }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        
        let animationFrameId: number;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        const letters = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズヅブプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッンABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const fontSize = 18;
        const columns = Math.floor(canvas.width / fontSize);
        const drops = Array(columns).fill(1);

        const draw = () => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.font = `${fontSize}px monospace`;
            ctx.fillStyle = "#10b981";
            
            for (let i = 0; i < drops.length; i++) {
                const text = letters[Math.floor(Math.random() * letters.length)];
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);
                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
            animationFrameId = requestAnimationFrame(draw);
        };
        
        draw();
        
        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', resizeCanvas);
        };
    }, []);

    return (
        <div className="fixed inset-0 bg-black z-[99999] overflow-hidden">
            <canvas ref={canvasRef} className="block w-full h-full"></canvas>
            
            <div className="absolute top-6 left-6 z-10 flex items-center gap-3 bg-black/80 backdrop-blur-md px-4 py-2 rounded-full border border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.3)] pointer-events-none">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-emerald-400 font-mono font-bold text-xs tracking-widest">MATRIX MODE ACTIVE</span>
            </div>

            <button 
                onClick={onClose} 
                className="absolute top-6 right-6 z-10 px-5 py-2.5 rounded-2xl bg-black/80 backdrop-blur-md text-emerald-400 border border-emerald-500/50 shadow-[0_0_25px_rgba(16,185,129,0.3)] hover:bg-emerald-500/20 font-mono font-bold text-sm transition cursor-pointer"
            >
                ✕ Exit Matrix
            </button>
        </div>
    );
};

export default MatrixOverlay;