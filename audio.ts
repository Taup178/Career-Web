let context: AudioContext | null = null;
let enabled = true;

export function setArcadeSound(value: boolean) { enabled = value; }
export function prepareArcadeAudio() {
  if (!enabled) return;
  try {
    const Audio = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Audio) return;
    if (!context || context.state === 'closed') context = new Audio();
    if (context.state === 'suspended') void context.resume().catch(() => {});
  } catch { /* Audio is optional; gameplay must continue without it. */ }
}

function tone(from: number, to: number, duration: number, volume: number, type: OscillatorType = 'sine') {
  if (!enabled) return;
  prepareArcadeAudio();
  if (!context || context.state !== 'running') return;
  try {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const time = context.currentTime;
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(from, time);
    oscillator.frequency.exponentialRampToValueAtTime(to, time + duration);
    gain.gain.setValueAtTime(volume, time);
    gain.gain.exponentialRampToValueAtTime(.0001, time + duration);
    oscillator.connect(gain); gain.connect(context.destination);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
    oscillator.start(time); oscillator.stop(time + duration);
  } catch { /* A suspended or unavailable audio device should stay silent. */ }
}

export const playEatSound = () => tone(660, 990, .09, .055);
export const playFlapSound = () => tone(320, 510, .075, .035, 'triangle');
export const playDeathSound = () => tone(220, 70, .3, .07, 'triangle');
