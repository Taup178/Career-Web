import React, { useEffect, useRef } from 'react';
import Modal from './Modal';

export default function MatrixOverlay({ onClose, motion = true }: { onClose: () => void; motion?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let last = 0;
    let drops: number[] = [];
    const letters = 'アイウエオカキクケコサシスセソABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const size = 18;
    const resize = () => {
      canvas.width = window.innerWidth; canvas.height = window.innerHeight;
      drops = Array.from({ length: Math.ceil(canvas.width / size) }, () => Math.random() * canvas.height / size);
      paint();
    };
    const paint = () => {
      ctx.fillStyle = 'rgba(0,0,0,0.09)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = size + 'px monospace'; ctx.fillStyle = '#61e0a4';
      drops.forEach((drop, index) => {
        ctx.fillText(letters[Math.floor(Math.random() * letters.length)], index * size, drop * size);
        drops[index] = drop * size > canvas.height && Math.random() > .975 ? 0 : drop + 1;
      });
    };
    const draw = (time: number) => {
      if (time - last > 40) { paint(); last = time; }
      frame = requestAnimationFrame(draw);
    };
    const start = () => {
      cancelAnimationFrame(frame);
      if (!media.matches && motion && !document.hidden) frame = requestAnimationFrame(draw);
    };
    resize(); start();
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', start);
    media.addEventListener('change', start);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('resize', resize); document.removeEventListener('visibilitychange', start); media.removeEventListener('change', start); };
  }, [motion]);
  return <Modal open onClose={onClose} className="matrix-layer" label="Matrix easter egg">
    <canvas ref={canvasRef} aria-hidden="true" />
    <div className="matrix-label"><span className="status-dot" /> MATRIX MODE ACTIVE</div>
    <button onClick={onClose} className="matrix-exit">Exit Matrix ×</button>
    <p className="matrix-message">You followed your curiosity.<br /><span>That’s a good sign.</span></p>
  </Modal>;
}
