
import React from 'react';

interface MatrixNotificationModalProps {
  onClose: () => void;
}

const MatrixNotificationModal: React.FC<MatrixNotificationModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div className="glass-panel-strong border-emerald-500/60 rounded-3xl shadow-[0_0_50px_rgba(16,185,129,0.25)] p-8 w-full max-w-md flex flex-col items-center relative text-center">
        <h2 className="text-emerald-400 text-2xl md:text-3xl font-extrabold font-mono tracking-wide mb-3">[SECRET UNLOCKED]</h2>
        <p className="text-[#cbd5e1] text-base leading-relaxed mb-6 bg-[#0f172a]/70 p-4 rounded-2xl border border-emerald-500/20">
          You've discovered an easter egg! Try typing <strong className="text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/40">'matrix'</strong> into the terminal.
        </p>
        <button
          onClick={onClose}
          className="px-8 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-base transition shadow-lg shadow-emerald-500/30 cursor-pointer"
        >
          Got it!
        </button>
      </div>
    </div>
  );
};

export default MatrixNotificationModal;
