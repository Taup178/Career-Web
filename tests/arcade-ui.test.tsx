import test from 'node:test';
import assert from 'node:assert/strict';
import React, { act } from 'react';
import { JSDOM } from 'jsdom';

// A manual animation clock exercises actual controls without wall-clock sleeps.
test('arcade rounds support keyboard, touch, pause, records, sound and notification focus', async () => {
  const dom = new JSDOM('<!doctype html><div id="root"></div>', { url: 'http://localhost', pretendToBeVisual: true });
  const { window } = dom;
  for (const [key, value] of Object.entries({ window, document: window.document, navigator: window.navigator, HTMLElement: window.HTMLElement, localStorage: window.localStorage, IS_REACT_ACT_ENVIRONMENT: true })) Object.defineProperty(globalThis, key, { value, writable: true, configurable: true });
  Object.defineProperty(window, 'devicePixelRatio', { configurable: true, value: 2 });
  const frames = new Map<number, FrameRequestCallback>();
  const sizes = new Map<Element, (entries: any[]) => void>();
  let frameId = 0, time = 0;
  Object.defineProperty(globalThis, 'requestAnimationFrame', { configurable: true, value: (callback: FrameRequestCallback) => { frames.set(++frameId, callback); return frameId; } });
  Object.defineProperty(globalThis, 'cancelAnimationFrame', { configurable: true, value: (id: number) => frames.delete(id) });
  Object.defineProperty(globalThis, 'ResizeObserver', { configurable: true, value: class {
    constructor(private callback: (entries: any[]) => void) {}
    observe(element: Element) { sizes.set(element, this.callback); this.callback([{ contentRect: { width: 480, height: 480 } }]); }
    disconnect() {}
  } });
  window.HTMLCanvasElement.prototype.getContext = (() => new Proxy({}, { get(_target, name) { return String(name).startsWith('create') ? () => ({ addColorStop() {} }) : () => {}; }, set() { return true; } })) as any;
  const { createRoot } = await import('react-dom/client');
  const { default: Bird } = await import('../BirdGame');
  const { default: Snake } = await import('../SnakeGame');
  const { default: Pacman } = await import('../PacmanGame');
  const { useArcadeLoop, useArcadeSession } = await import('../Arcade');
  const root = createRoot(document.getElementById('root')!);
  const click = async (selector: string) => {
    const target = document.querySelector(selector); assert.ok(target, selector);
    await act(async () => { target.dispatchEvent(new window.MouseEvent('click', { bubbles: true })); });
  };
  const key = async (value: string) => { await act(async () => { document.querySelector('.arcade-console')!.dispatchEvent(new window.KeyboardEvent('keydown', { key: value, bubbles: true })); }); };
  const frame = async (delta = 1000 / 60) => {
    time += delta;
    await act(async () => { const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach(callback => callback(time)); });
  };
  const phase = () => document.querySelector('.arcade-round-state')!.textContent;
  let closed = 0, unlocked = 0;
  const props = { stopGame: () => { closed++; }, onMatrixNotification: () => { unlocked++; }, isNotificationVisible: false };
  try {
    window.localStorage.setItem('bird_highscore', 'not-a-score');
    await act(async () => { root.render(<Bird {...props} />); });
    assert.equal(phase(), 'READY TO PLAY');
    assert.equal(document.querySelector('[aria-label="Personal best"]')!.textContent, '00');
    assert.equal(document.querySelector<HTMLCanvasElement>('canvas')!.width, 960, 'canvas fits the displayed size at double pixel density');
    await click('.arcade-primary');
    assert.equal(phase(), 'IN PLAY');
    assert.equal(document.activeElement, document.querySelector('.arcade-console'), 'start returns focus to game keyboard controls');
    await frame(0);
    for (let i = 1; i <= 183; i++) {
      if (i % 48 === 0) await key(' ');
      await frame();
    }
    assert.equal(document.querySelector('[aria-label="Score"]')!.textContent, '01');
    assert.equal(window.localStorage.getItem('bird_highscore'), '1', 'records save during a run');
    await click('[aria-label="Pause game"]');
    assert.equal(phase(), 'PAUSED');
    assert.equal(frames.size, 0, 'paused games release their animation loop');
    await frame(5000);
    assert.equal(document.querySelector('[aria-label="Score"]')!.textContent, '01');
    await key(' ');
    assert.equal(phase(), 'IN PLAY');
    await frame(0);
    for (let i = 0; i < 130; i++) await frame();
    assert.equal(phase(), 'RUN COMPLETE');
    assert.match(document.querySelector('.arcade-overlay')!.textContent!, /A NEW PERSONAL BEST/);
    await click('.arcade-primary');
    assert.equal(phase(), 'IN PLAY');
    assert.equal(document.querySelector('[aria-label="Score"]')!.textContent, '00');
    assert.equal(document.querySelector('[aria-label="Personal best"]')!.textContent, '01');
    await click('[aria-label="Mute game sound"]');
    assert.equal(window.localStorage.getItem('zm-arcade-sound'), 'off');

    for (const [index, Game] of [Snake, Pacman].entries()) {
      await act(async () => { root.render(<Game {...props} key={index} />); });
      assert.equal(phase(), 'READY TO PLAY');
      assert.ok(document.querySelector('[aria-label="Enable game sound"]'), 'sound preference persists between games');
      await key('Enter');
      assert.equal(phase(), 'IN PLAY');
      assert.equal(document.querySelector('[aria-label="Move up"]')!.hasAttribute('disabled'), false);
      await click('[aria-label="Move up"]');
      await key('ArrowLeft');
      await act(async () => {
        const board = document.querySelector('.arcade-board')!;
        board.dispatchEvent(new window.MouseEvent('pointerdown', { bubbles: true, button: 0, clientX: 100, clientY: 100 }));
        board.dispatchEvent(new window.MouseEvent('pointermove', { bubbles: true, clientX: 140, clientY: 100 }));
        board.dispatchEvent(new window.MouseEvent('pointerup', { bubbles: true }));
      });
      await act(async () => { window.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'p' })); });
      assert.equal(phase(), 'IN PLAY', 'keyboard handlers only run inside the active game');
      await key('p');
      assert.equal(phase(), 'PAUSED');
      await key('p');
      assert.equal(phase(), 'IN PLAY');
      await act(async () => { window.dispatchEvent(new window.Event('blur')); });
      assert.equal(phase(), 'PAUSED', 'leaving the browser pauses the run');
      await click('.arcade-primary');
      await act(async () => { root.render(<Game {...props} key={index} isNotificationVisible />); });
      assert.equal(phase(), 'PAUSED');
      assert.equal(document.querySelector('.arcade-primary')!.hasAttribute('disabled'), true);
      await act(async () => { root.render(<Game {...props} key={index} />); });
      assert.equal(phase(), 'PAUSED', 'closing another dialog waits for an explicit resume');
      await click('.arcade-primary');
      await act(async () => { Object.defineProperty(document, 'hidden', { configurable: true, value: true }); document.dispatchEvent(new window.Event('visibilitychange')); });
      assert.equal(phase(), 'PAUSED');
      await act(async () => { Object.defineProperty(document, 'hidden', { configurable: true, value: false }); document.dispatchEvent(new window.Event('visibilitychange')); });
      assert.equal(phase(), 'PAUSED');
      const viewport = document.querySelector('.arcade-viewport')!;
      await act(async () => { sizes.get(viewport)!([{ contentRect: { width: 300, height: 240 } }]); });
      assert.ok(parseFloat((document.querySelector('.arcade-board') as HTMLElement).style.height) <= 240);
      assert.equal(document.querySelector<HTMLCanvasElement>('canvas')!.height, 480, 'small screens use a smaller canvas without changing the game world');
      await click('.game-close');
    }
    assert.equal(closed, 2);

    function Milestone({ score, notification = false }: { score: number; notification?: boolean }) {
      const session = useArcadeSession('pacman_highscore', score, 'playing', 200, { ...props, isNotificationVisible: notification });
      return <><output data-phase={session.phase} /><button className="begin" onClick={session.begin}>Begin</button><button className="resume" onClick={session.togglePause}>Resume</button></>;
    }
    await act(async () => { root.render(<Milestone score={0} />); });
    await click('.begin');
    await act(async () => { root.render(<Milestone score={200} />); });
    assert.equal(unlocked, 1, 'the Pac-Man milestone opens the secret notification');
    assert.equal(document.querySelector('output')!.getAttribute('data-phase'), 'paused');
    await click('.resume');
    await act(async () => { root.render(<Milestone score={400} />); });
    assert.equal(unlocked, 1, 'a milestone only interrupts a game once');

    let steps = 0;
    function Clock({ running }: { running: boolean }) { useArcadeLoop(running, 1000 / 60, () => { steps++; }); return null; }
    for (const hz of [60, 144]) {
      steps = 0;
      await act(async () => { root.render(<Clock key={hz} running />); });
      await frame(0);
      for (let i = 0; i < hz; i++) await frame(1000 / hz);
      assert.equal(steps, 60, `${hz} Hz displays run the same 60 physics steps per second`);
    }
  } finally {
    await act(async () => { root.unmount(); });
    assert.equal(frames.size, 0, 'closing the arcade clears every animation loop');
    dom.window.close();
  }
});
