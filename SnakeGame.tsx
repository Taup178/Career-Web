import React, { useState } from 'react';
import { ArcadeFrame, roundSeed, useArcadeCanvas, useArcadeLoop, useArcadeMotion, useArcadeSession } from './Arcade';
import type { ArcadeGameProps } from './Arcade';
import { createSnake, tickSnake, turnSnake } from './arcadeEngine';
import type { SnakeState } from './arcadeEngine';

const STEP = 140;
function drawSnake(ctx: CanvasRenderingContext2D, state: SnakeState, previous: SnakeState, alpha: number) {
  const background = ctx.createLinearGradient(0, 0, 600, 600);
  background.addColorStop(0, '#112b26'); background.addColorStop(1, '#0b1c1c');
  ctx.fillStyle = background; ctx.fillRect(0, 0, 600, 600);
  for (let y = 0; y < 24; y++) for (let x = 0; x < 24; x++) {
    if ((x + y) % 2 === 0) { ctx.fillStyle = '#c8e3c503'; ctx.fillRect(x * 25, y * 25, 25, 25); }
    ctx.fillStyle = '#a7c6b31c'; ctx.fillRect(x * 25, y * 25, 1, 1);
  }
  ctx.strokeStyle = '#8aad9520'; ctx.lineWidth = 1;
  for (const obstacle of state.obstacles) {
    const x = obstacle.x * 25 + 3, y = obstacle.y * 25 + 3;
    ctx.fillStyle = '#30443e'; ctx.beginPath(); ctx.roundRect(x, y, 19, 19, 4); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#9bb3a042'; ctx.beginPath(); ctx.moveTo(x + 5, y + 5); ctx.lineTo(x + 14, y + 5); ctx.stroke(); ctx.strokeStyle = '#8aad9520';
  }
  if (state.apple) {
    const x = state.apple.x * 25 + 12.5, y = state.apple.y * 25 + 12.5;
    const glow = ctx.createRadialGradient(x, y, 2, x, y, 28);
    glow.addColorStop(0, '#f0947d22'); glow.addColorStop(1, '#f0947d00'); ctx.fillStyle = glow; ctx.fillRect(x - 28, y - 28, 56, 56);
    const apple = ctx.createLinearGradient(x - 7, y - 7, x + 7, y + 8);
    apple.addColorStop(0, '#ffb29a'); apple.addColorStop(.5, '#e98477'); apple.addColorStop(1, '#aa4e56');
    ctx.fillStyle = apple; ctx.beginPath(); ctx.ellipse(x - 3, y + 1, 6, 8, -.2, 0, Math.PI * 2); ctx.ellipse(x + 3, y + 1, 6, 8, .2, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#d2b68b'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(x, y - 5); ctx.lineTo(x + 2, y - 11); ctx.stroke();
    ctx.fillStyle = '#a8c88d'; ctx.beginPath(); ctx.ellipse(x + 5, y - 8, 4, 2, -.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffdec4aa'; ctx.beginPath(); ctx.ellipse(x - 5, y - 2, 1.2, 3, .2, 0, Math.PI * 2); ctx.fill();
  }
  const positions = state.body.map((point, i) => {
    const old = previous.body[i] || previous.body.at(-1) || point;
    return { x: Math.abs(point.x - old.x) > 1 ? point.x : old.x + (point.x - old.x) * alpha, y: Math.abs(point.y - old.y) > 1 ? point.y : old.y + (point.y - old.y) * alpha };
  });
  const gradient = ctx.createLinearGradient(0, 600, 600, 0);
  gradient.addColorStop(0, '#3c8f75'); gradient.addColorStop(.55, '#82c28c'); gradient.addColorStop(1, '#c7e5a1');
  ctx.strokeStyle = gradient; ctx.lineWidth = 18; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  ctx.shadowColor = '#030d0c66'; ctx.shadowBlur = 9; ctx.shadowOffsetY = 4;
  ctx.beginPath();
  for (let i = positions.length - 1; i >= 0; i--) {
    const point = positions[i], last = positions[i + 1];
    if (!last || Math.hypot(point.x - last.x, point.y - last.y) > 1.8) ctx.moveTo(point.x * 25 + 12.5, point.y * 25 + 12.5);
    else ctx.lineTo(point.x * 25 + 12.5, point.y * 25 + 12.5);
  }
  ctx.stroke(); ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
  positions.slice(1).forEach((point, index) => {
    if (index % 2) return;
    ctx.fillStyle = '#daf1b523'; ctx.beginPath(); ctx.ellipse(point.x * 25 + 12.5, point.y * 25 + 9, 3, 1.5, 0, 0, Math.PI * 2); ctx.fill();
  });
  const head = positions[0];
  ctx.save(); ctx.translate(head.x * 25 + 12.5, head.y * 25 + 12.5); ctx.rotate(Math.atan2(state.direction.y, state.direction.x));
  ctx.fillStyle = '#b6dda0'; ctx.beginPath(); ctx.ellipse(0, 0, 11, 10, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#f3f6dd'; ctx.beginPath(); ctx.ellipse(3.8, -5, 3.3, 3.7, 0, 0, Math.PI * 2); ctx.ellipse(3.8, 5, 3.3, 3.7, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#18392d'; ctx.beginPath(); ctx.arc(5.4, -5, 1.8, 0, Math.PI * 2); ctx.arc(5.4, 5, 1.8, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  ctx.strokeStyle = '#9fc8ac66'; ctx.lineWidth = 2;
  for (const [x, y, dx, dy] of [[0, 300, 8, 0], [600, 300, -8, 0], [300, 0, 0, 8], [300, 600, 0, -8]]) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + dx, y + dy); ctx.stroke(); }
}

export default function SnakeGame(props: ArcadeGameProps) {
  const [state, setState] = useState(() => createSnake());
  const session = useArcadeSession('snake_highscore', state.score, state.status, 150, props);
  const motion = useArcadeMotion(state, state.body);
  useArcadeLoop(session.running, STEP, () => setState(tickSnake));
  const surface = useArcadeCanvas(600, 600, ctx => {
    const alpha = session.running ? Math.min(1, (performance.now() - motion.current.at) / STEP) : 1;
    drawSnake(ctx, state, motion.current.from, alpha);
  }, session.running);
  const start = () => { setState(createSnake(roundSeed())); session.begin(); };
  return <ArcadeFrame kind="snake" title="Cyber Snake" index="02" headline="Follow your instinct." instruction="Collect apples, dodge the blocks and leave yourself a way out." score={state.score} session={session} surface={surface} onStart={start} onDirection={direction => setState(current => turnSnake(current, direction))} onClose={props.stopGame} blocked={props.isNotificationVisible} />;
}
