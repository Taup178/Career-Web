import React, { useEffect, useRef, useState } from 'react';
import { prepareArcadeAudio, setArcadeSound, playDeathSound, playEatSound } from './audio';
import { readPreference, savePreference } from './portfolio';
import { directionForKey, UP, DOWN, LEFT, RIGHT } from './arcadeEngine';
import type { Direction, RoundStatus } from './arcadeEngine';

export interface ArcadeGameProps {
  stopGame: () => void;
  onMatrixNotification: () => void;
  isNotificationVisible: boolean;
}
export type ArcadePhase = 'ready' | 'playing' | 'paused' | 'over' | 'won';
export const roundSeed = () => Math.floor(Math.random() * 4294967295) || 1;

export function useArcadeSession(key: string, score: number, status: RoundStatus, threshold: number, props: ArcadeGameProps) {
  const [phase, setPhase] = useState<ArcadePhase>('ready');
  const [best, setBest] = useState(() => {
    const saved = Number(readPreference(key));
    return Number.isSafeInteger(saved) && saved > 0 ? saved : 0;
  });
  const [roundBest, setRoundBest] = useState(best);
  const [sound, setSound] = useState(() => readPreference('zm-arcade-sound') !== 'off');
  const unlocked = useRef(false);
  const previousScore = useRef(0);

  useEffect(() => { setArcadeSound(sound); savePreference('zm-arcade-sound', sound ? 'on' : 'off'); }, [sound]);
  useEffect(() => {
    if (score > best) { setBest(score); savePreference(key, String(score)); }
    if (score > previousScore.current && phase === 'playing') playEatSound();
    previousScore.current = score;
  }, [score, best, key, phase]);
  useEffect(() => {
    if (status !== 'playing' && phase !== 'ready' && phase !== status) {
      if (status === 'over') playDeathSound();
      setPhase(status);
    }
  }, [status, phase]);
  useEffect(() => {
    if (score >= threshold && status === 'playing' && phase === 'playing' && !unlocked.current) {
      unlocked.current = true;
      setPhase('paused');
      props.onMatrixNotification();
    }
  }, [score, threshold, status, phase, props.onMatrixNotification]);
  useEffect(() => {
    if (props.isNotificationVisible) setPhase(current => current === 'playing' ? 'paused' : current);
  }, [props.isNotificationVisible]);
  useEffect(() => {
    const pause = () => setPhase(current => current === 'playing' ? 'paused' : current);
    const visibility = () => { if (document.hidden) pause(); };
    window.addEventListener('blur', pause);
    document.addEventListener('visibilitychange', visibility);
    return () => { window.removeEventListener('blur', pause); document.removeEventListener('visibilitychange', visibility); };
  }, []);

  const begin = () => { previousScore.current = 0; setRoundBest(best); prepareArcadeAudio(); setPhase('playing'); };
  const togglePause = () => {
    if (props.isNotificationVisible || document.hidden) return;
    prepareArcadeAudio();
    setPhase(current => current === 'playing' ? 'paused' : current === 'paused' ? 'playing' : current);
  };
  const toggleSound = () => {
    setArcadeSound(!sound);
    if (!sound) prepareArcadeAudio();
    setSound(!sound);
  };
  return { phase, best, sound, begin, togglePause, toggleSound, newBest: score > roundBest, running: phase === 'playing' && !props.isNotificationVisible };
}

/** Fixed simulation steps keep gameplay consistent on 60 Hz and 144 Hz screens. */
export function useArcadeLoop(running: boolean, stepMs: number, step: () => void) {
  const action = useRef(step); action.current = step;
  useEffect(() => {
    if (!running) return;
    let frame = 0, previous: number | null = null, accumulator = 0;
    const tick = (time: number) => {
      if (document.hidden) { previous = null; accumulator = 0; }
      else {
        if (previous !== null) accumulator += Math.min(time - previous, 100);
        previous = time;
        while (accumulator + .0001 >= stepMs) { action.current(); accumulator -= stepMs; }
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [running, stepMs]);
}

/** Keep world coordinates fixed while fitting a sharp canvas into the available area. */
export function useArcadeCanvas(width: number, height: number, draw: (context: CanvasRenderingContext2D) => void, animate = false) {
  const viewport = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState({ width, height, ratio: 1 });
  const canvasWidth = Math.max(1, Math.round(size.width * size.ratio));
  const canvasHeight = Math.max(1, Math.round(size.height * size.ratio));
  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      const box = entry.contentRect;
      if (box.width <= 0 || box.height <= 0) return;
      const scale = Math.min(box.width / width, box.height / height, 1);
      const next = { width: Math.floor(width * scale), height: Math.floor(height * scale), ratio: Math.min(window.devicePixelRatio || 1, 2) };
      setSize(current => current.width === next.width && current.height === next.height && current.ratio === next.ratio ? current : next);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [width, height]);
  useEffect(() => {
    const element = canvas.current;
    const context = element?.getContext('2d');
    if (!context || !element) return;
    let frame = 0;
    const paint = () => {
      context.setTransform(canvasWidth / width, 0, 0, canvasHeight / height, 0, 0);
      context.clearRect(0, 0, width, height);
      draw(context);
      if (animate) frame = requestAnimationFrame(paint);
    };
    paint();
    return () => cancelAnimationFrame(frame);
  }, [draw, width, height, canvasWidth, canvasHeight, animate]);
  return { viewport, canvas, size, canvasWidth, canvasHeight };
}

export function useArcadeMotion<T>(state: T, marker: unknown) {
  const previous = useRef(state);
  const motion = useRef({ from: state, at: 0 });
  useEffect(() => {
    motion.current = { from: previous.current, at: performance.now() };
    previous.current = state;
  }, [marker]);
  return motion;
}

function ControlIcon({ name }: { name: 'pause' | 'play' | 'sound' | 'muted' | 'close' }) {
  const paths = { pause: 'M8 5v14M16 5v14', play: 'm8 5 11 7-11 7V5Z', sound: 'M4 9h4l5-4v14l-5-4H4V9Zm13-2a7 7 0 0 1 0 10m0-7a3 3 0 0 1 0 4', muted: 'M4 9h4l5-4v14l-5-4H4V9Zm13 1 5 5m0-5-5 5', close: 'm6 6 12 12M6 18 18 6' };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>;
}

type Session = ReturnType<typeof useArcadeSession>;
export function ArcadeFrame({ kind, title, index, instruction, headline, score, session, surface, onStart, onAction, onDirection, onClose, blocked, children }: {
  kind: 'bird' | 'snake' | 'pacman'; title: string; index: string; instruction: string; headline: string; score: number; session: Session;
  surface: ReturnType<typeof useArcadeCanvas>; onStart: () => void; onAction?: () => void; onDirection?: (direction: Direction) => void;
  onClose: () => void; blocked: boolean; children?: React.ReactNode;
}) {
  const root = useRef<HTMLElement>(null);
  const gesture = useRef<{ x: number; y: number } | null>(null);
  const focus = () => root.current?.focus({ preventScroll: true });
  const start = () => { onStart(); focus(); };
  const pause = () => { gesture.current = null; session.togglePause(); focus(); };
  const steer = (direction: Direction) => { if (session.running) onDirection?.(direction); };
  const overlay = session.phase !== 'playing';

  return <section ref={root} className={`arcade-console arcade-${kind}`} tabIndex={0} aria-label={`${title} game`} onKeyDown={event => {
    if (blocked || event.altKey || event.ctrlKey || event.metaKey) return;
    const button = (event.target as HTMLElement).closest('button');
    if (event.key.toLowerCase() === 'p') { event.preventDefault(); pause(); return; }
    if (button && (event.key === ' ' || event.key === 'Enter')) return;
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      if (event.repeat) return;
      if (session.phase === 'ready' || session.phase === 'over' || session.phase === 'won') start();
      else if (session.phase === 'paused') pause();
      else onAction?.();
      return;
    }
    const direction = directionForKey(event.key);
    if (direction && onDirection) { event.preventDefault(); steer(direction); }
  }}>
    <header className="arcade-toolbar">
      <div className="arcade-identity"><span className="arcade-id">{index}</span><div><small>THE ARCADE</small><h2>{title}</h2></div></div>
      <div className="arcade-toolbar-actions"><button type="button" onClick={session.toggleSound} aria-label={session.sound ? 'Mute game sound' : 'Enable game sound'} aria-pressed={session.sound}><ControlIcon name={session.sound ? 'sound' : 'muted'} /></button><button type="button" onClick={pause} disabled={!['playing', 'paused'].includes(session.phase) || blocked} aria-label={session.phase === 'paused' ? 'Resume game' : 'Pause game'}><ControlIcon name={session.phase === 'paused' ? 'play' : 'pause'} /></button><button type="button" onClick={onClose} className="game-close" aria-label="Close arcade"><ControlIcon name="close" /></button></div>
    </header>
    <div className="arcade-scorebar"><div><span>SCORE</span><output aria-label="Score">{String(score).padStart(2, '0')}</output></div><div className={`arcade-round-state${children ? ' has-feedback' : ''}`} role="status">{children || (session.phase === 'playing' ? 'IN PLAY' : session.phase === 'ready' ? 'READY TO PLAY' : session.phase === 'paused' ? 'PAUSED' : session.phase === 'won' ? 'COMPLETE' : 'RUN COMPLETE')}</div><div><span>PERSONAL BEST</span><output aria-label="Personal best">{String(session.best).padStart(2, '0')}</output></div></div>
    <div className="arcade-viewport" ref={surface.viewport}>
      <div className="arcade-board" style={{ width: surface.size.width, height: surface.size.height }} onPointerDown={event => {
        if (!session.running || blocked || event.button !== 0) return;
        event.preventDefault(); focus();
        if (onAction) onAction();
        else {
          gesture.current = { x: event.clientX, y: event.clientY };
          event.currentTarget.setPointerCapture?.(event.pointerId);
        }
      }} onPointerMove={event => {
        if (!gesture.current || !session.running) return;
        const dx = event.clientX - gesture.current.x, dy = event.clientY - gesture.current.y;
        if (Math.max(Math.abs(dx), Math.abs(dy)) < 18) return;
        steer(Math.abs(dx) > Math.abs(dy) ? dx > 0 ? RIGHT : LEFT : dy > 0 ? DOWN : UP);
        gesture.current = null;
      }} onPointerUp={() => { gesture.current = null; }} onPointerCancel={() => { gesture.current = null; }} onLostPointerCapture={() => { gesture.current = null; }}>
        <canvas ref={surface.canvas} width={surface.canvasWidth} height={surface.canvasHeight} role="img" aria-label={`${title} playfield`}>{instruction}</canvas>
        {overlay && <div className="arcade-overlay" data-phase={session.phase}>
          <div className="arcade-overlay-panel">
            {session.phase === 'ready' ? <><img className="arcade-intro-art" src={`/arcade/${kind}.svg`} alt="" width="480" height="360" /><h3>{headline}</h3><p>{instruction}</p><button type="button" className="arcade-primary" onClick={start}><ControlIcon name="play" />Start game</button></> : session.phase === 'paused' ? <><span className="arcade-pause-mark" aria-hidden="true"><ControlIcon name="pause" /></span><small className="arcade-overline">TAKE A BREATHER</small><h3>On your time.</h3><button type="button" className="arcade-primary" onClick={pause} disabled={blocked}><ControlIcon name="play" />Resume game</button></> : <><small className="arcade-overline">{session.newBest ? 'A NEW PERSONAL BEST' : session.phase === 'won' ? 'ALL CLEAR' : 'UNTIL THE NEXT RUN'}</small><h3>{session.phase === 'won' ? 'Beautifully played.' : 'One more round?'}</h3><div className="arcade-final-score"><span>YOUR SCORE</span><strong>{String(score).padStart(2, '0')}</strong></div><button type="button" className="arcade-primary" onClick={start}><ControlIcon name="play" />Play again</button><button type="button" className="arcade-back" onClick={onClose}>Back to portfolio <span aria-hidden="true">↗</span></button></>}
          </div>
        </div>}
      </div>
    </div>
    <div className="arcade-controls"><div className="arcade-control-note">{onAction ? <><span><kbd>SPACE</kbd> or tap to flap</span><small>Keep a little room between the pipes.</small></> : <><span><kbd>↑ ↓ ← →</kbd> / <kbd>W A S D</kbd></span><small>{kind === 'snake' ? 'Collect apples. Edges wrap around.' : 'Power pellets turn the chase around.'}</small></>}<span className="arcade-pause-hint"><kbd>P</kbd> pause · <kbd>ESC</kbd> leave</span></div>
      {onAction ? <button type="button" className="arcade-flap" disabled={!session.running} onPointerDown={event => { if (event.button === 0) { event.preventDefault(); onAction(); } }} onClick={event => { if (event.detail === 0) onAction(); }}><span aria-hidden="true">↑</span>Flap</button> : <div className="arcade-dpad" role="group" aria-label="Direction controls">{[{ label: 'Up', direction: UP, glyph: '↑' }, { label: 'Left', direction: LEFT, glyph: '←' }, { label: 'Down', direction: DOWN, glyph: '↓' }, { label: 'Right', direction: RIGHT, glyph: '→' }].map(item => <button type="button" key={item.label} aria-label={`Move ${item.label.toLowerCase()}`} disabled={!session.running} onPointerDown={event => { if (event.button === 0) { event.preventDefault(); steer(item.direction); } }} onClick={event => { if (event.detail === 0) steer(item.direction); }}>{item.glyph}</button>)}</div>}
    </div>
  </section>;
}
