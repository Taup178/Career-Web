import React, { useState } from 'react';
import { ArcadeFrame, roundSeed, useArcadeCanvas, useArcadeLoop, useArcadeSession } from './Arcade';
import type { ArcadeGameProps } from './Arcade';
import { BIRD, createBird, flapBird, tickBird } from './arcadeEngine';
import type { BirdState } from './arcadeEngine';
import { playFlapSound } from './audio';

function drawBirdWorld(ctx: CanvasRenderingContext2D, state: BirdState) {
  const sky = ctx.createLinearGradient(0, 0, 0, 600);
  sky.addColorStop(0, '#10232e'); sky.addColorStop(.6, '#294442'); sky.addColorStop(1, '#576957');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, 600, 600);
  const halo = ctx.createRadialGradient(420, 135, 10, 420, 135, 190);
  halo.addColorStop(0, '#e8ce8e22'); halo.addColorStop(1, '#e8ce8e00');
  ctx.fillStyle = halo; ctx.fillRect(0, 0, 600, 390);
  ctx.fillStyle = '#d8d1ab'; ctx.beginPath(); ctx.arc(420, 135, 38, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#c1b99544'; ctx.beginPath(); ctx.arc(406, 127, 8, 0, Math.PI * 2); ctx.fill();
  for (let i = 0; i < 7; i++) {
    const x = (i * 111 - state.elapsed * (5 + i % 3) + 900) % 800 - 100;
    const y = 74 + i % 3 * 68;
    ctx.fillStyle = '#d9e6d510'; ctx.beginPath(); ctx.ellipse(x, y, 65, 11, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x - 16, y - 7, 28, 12, 0, 0, Math.PI * 2); ctx.fill();
  }
  for (let layer = 0; layer < 3; layer++) {
    ctx.fillStyle = ['#253f3e', '#203c36', '#17332d'][layer];
    const drift = state.elapsed * (8 + layer * 6);
    ctx.beginPath(); ctx.moveTo(0, 600);
    for (let x = 0; x <= 620; x += 20) ctx.lineTo(x, 385 + layer * 51 + Math.sin((x + drift) / (90 - layer * 15)) * (35 - layer * 6) + Math.sin((x + drift) / 43) * 10);
    ctx.lineTo(620, 600); ctx.closePath(); ctx.fill();
  }
  for (const pipe of state.pipes) {
    const shade = ctx.createLinearGradient(pipe.x, 0, pipe.x + BIRD.pipeWidth, 0);
    shade.addColorStop(0, '#2d5b49'); shade.addColorStop(.22, '#7ca77c'); shade.addColorStop(.75, '#47785a'); shade.addColorStop(1, '#234d3f');
    ctx.fillStyle = shade;
    ctx.fillRect(pipe.x, 0, BIRD.pipeWidth, pipe.top - 9);
    ctx.fillRect(pipe.x, pipe.top + BIRD.gap + 9, BIRD.pipeWidth, BIRD.ground - pipe.top - BIRD.gap);
    ctx.strokeStyle = '#b6d09c55'; ctx.lineWidth = 1.3;
    for (const y of [pipe.top - 21, pipe.top + BIRD.gap]) {
      ctx.beginPath(); ctx.roundRect(pipe.x - 4, y, BIRD.pipeWidth + 8, 21, 4); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#d0dfb22a'; ctx.fillRect(pipe.x + 2, y + 3, BIRD.pipeWidth - 4, 2); ctx.fillStyle = shade;
    }
    ctx.fillStyle = '#d2e0b522'; ctx.fillRect(pipe.x + 7, 0, 3, pipe.top - 24);
    ctx.fillRect(pipe.x + 7, pipe.top + BIRD.gap + 24, 3, BIRD.ground - pipe.top - BIRD.gap - 24);
  }
  ctx.fillStyle = '#1b3029'; ctx.fillRect(0, BIRD.ground, 600, 44);
  ctx.fillStyle = '#7e9461'; ctx.fillRect(0, BIRD.ground, 600, 3);
  ctx.fillStyle = '#465a3e'; ctx.fillRect(0, BIRD.ground + 3, 600, 5);
  ctx.strokeStyle = '#a2b47b1c'; ctx.lineWidth = 2;
  for (let i = 0; i < 23; i++) {
    const x = i * 32 - (state.elapsed * 190) % 32;
    ctx.beginPath(); ctx.moveTo(x, 574); ctx.lineTo(x + 9, 574); ctx.stroke();
  }
  ctx.save(); ctx.translate(BIRD.x, state.y); ctx.rotate(Math.max(-.4, Math.min(1.15, state.velocity / 520)));
  ctx.shadowColor = '#07181255'; ctx.shadowBlur = 12; ctx.shadowOffsetY = 7;
  ctx.fillStyle = '#dda247'; ctx.beginPath(); ctx.moveTo(-18, -3); ctx.lineTo(-36, -13); ctx.lineTo(-30, 0); ctx.lineTo(-35, 8); ctx.lineTo(-18, 7); ctx.fill();
  const body = ctx.createLinearGradient(-10, -18, 8, 20);
  body.addColorStop(0, '#fff0a7'); body.addColorStop(.4, '#f6cf65'); body.addColorStop(1, '#d99538');
  ctx.fillStyle = body; ctx.beginPath(); ctx.ellipse(0, 0, 25, 19, 0, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
  ctx.fillStyle = '#ffe9a3'; ctx.beginPath(); ctx.ellipse(-9, 3 + Math.sin(state.elapsed * 19) * 3, 13, 8, -.2, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#d6a24a'; ctx.lineWidth = 1; ctx.stroke();
  ctx.fillStyle = '#f29a48'; ctx.beginPath(); ctx.moveTo(20, 0); ctx.lineTo(36, 4); ctx.lineTo(21, 10); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#fffbed'; ctx.beginPath(); ctx.ellipse(12, -6, 8, 9, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#182b30'; ctx.beginPath(); ctx.ellipse(15, -6, 3.8, 5.2, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(16, -8, 1.4, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

export default function BirdGame(props: ArcadeGameProps) {
  const [state, setState] = useState(() => createBird());
  const session = useArcadeSession('bird_highscore', state.score, state.status, 30, props);
  useArcadeLoop(session.running, 1000 / 60, () => setState(tickBird));
  const surface = useArcadeCanvas(600, 600, ctx => drawBirdWorld(ctx, state));
  const start = () => { setState(createBird(roundSeed())); session.begin(); };
  const flap = () => { if (session.running) { setState(flapBird); playFlapSound(); } };
  return <ArcadeFrame kind="bird" title="Flappy Bird" index="01" headline="A little airtime." instruction="Find your rhythm. Tap or press Space to fly between the pipes." score={state.score} session={session} surface={surface} onStart={start} onAction={flap} onClose={props.stopGame} blocked={props.isNotificationVisible} />;
}
