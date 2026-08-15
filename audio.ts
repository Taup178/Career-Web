// Create a single AudioContext to be reused
let audioCtx: AudioContext | null = null;
const getAudioContext = () => {
  if (!audioCtx) {
    try {
        audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch(e) {
        console.error("Web Audio API is not supported in this browser");
    }
  }
  return audioCtx;
};

// Function to play the "eat" sound
export const playEatSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(880, ctx.currentTime); // A6 note
  gainNode.gain.setValueAtTime(0.3, ctx.currentTime);

  gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.1);
  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.1);
};

// Function to play the "flap" sound (white noise)
export const playFlapSound = () => {
    const ctx = getAudioContext();
    if (!ctx) return;

    const bufferSize = ctx.sampleRate * 0.1; // 0.1 seconds
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
    }

    const whiteNoiseSource = ctx.createBufferSource();
    whiteNoiseSource.buffer = buffer;

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

    whiteNoiseSource.connect(gainNode);
    gainNode.connect(ctx.destination);
    whiteNoiseSource.start();
    whiteNoiseSource.stop(ctx.currentTime + 0.1);
};


// Function to play the "death" sound
export const playDeathSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.type = 'square';
  oscillator.frequency.setValueAtTime(440, ctx.currentTime); // A4
  gainNode.gain.setValueAtTime(0.2, ctx.currentTime);

  oscillator.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.3);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3);
  
  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.3);
};
