import React, { useState } from 'react';
import { ArcadeFrame, roundSeed, useArcadeCanvas, useArcadeLoop, useArcadeMotion, useArcadeSession } from './Arcade';
import type { ArcadeGameProps } from './Arcade';
import { createPacman, tickPacman, turnPacman, MAZE_COLS, MAZE_ROWS } from './arcadeEngine';
import type { PacmanState, Point } from './arcadeEngine';

const TILE = 28;
const STEP = 145;
function interpolate(from: Point, to: Point, alpha: number) {
  return { x: Math.abs(to.x - from.x) > 1 ? to.x : from.x + (to.x - from.x) * alpha, y: Math.abs(to.y - from.y) > 1 ? to.y : from.y + (to.y - from.y) * alpha };
}
function drawMaze(ctx: CanvasRenderingContext2D, state: PacmanState, previous: PacmanState, alpha: number, time: number) {
  const width = MAZE_COLS * TILE, height = MAZE_ROWS * TILE;
  ctx.fillStyle = '#0c1522'; ctx.fillRect(0, 0, width, height);
  const ambient = ctx.createRadialGradient(width / 2, height / 2, 20, width / 2, height / 2, width / 1.4);
  ambient.addColorStop(0, '#777bd00c'); ambient.addColorStop(1, '#777bd000'); ctx.fillStyle = ambient; ctx.fillRect(0, 0, width, height);
  state.grid.forEach((row, y) => row.forEach((cell, x) => {
    const px = x * TILE, py = y * TILE;
    if (cell === 1) {
      ctx.fillStyle = '#172737'; ctx.fillRect(px, py, TILE, TILE);
      ctx.strokeStyle = '#6480a8'; ctx.lineWidth = 1.3; ctx.beginPath();
      if (state.grid[y - 1]?.[x] !== 1 && y > 0) { ctx.moveTo(px, py + .8); ctx.lineTo(px + TILE, py + .8); }
      if (state.grid[y + 1]?.[x] !== 1 && y < MAZE_ROWS - 1) { ctx.moveTo(px, py + TILE - .8); ctx.lineTo(px + TILE, py + TILE - .8); }
      if (row[x - 1] !== 1 && x > 0) { ctx.moveTo(px + .8, py); ctx.lineTo(px + .8, py + TILE); }
      if (row[x + 1] !== 1 && x < MAZE_COLS - 1) { ctx.moveTo(px + TILE - .8, py); ctx.lineTo(px + TILE - .8, py + TILE); }
      ctx.stroke();
    } else if (cell === 4) {
      ctx.strokeStyle = '#d09fae'; ctx.lineWidth = 2; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(px + 2, py + TILE / 2); ctx.lineTo(px + TILE - 2, py + TILE / 2); ctx.stroke(); ctx.setLineDash([]);
    } else if (cell === 0 || cell === 3) {
      ctx.fillStyle = cell === 3 ? '#f4dd9a' : '#d5cfaa';
      if (cell === 3) { ctx.shadowColor = '#f4dd9a66'; ctx.shadowBlur = 12; }
      ctx.beginPath(); ctx.arc(px + TILE / 2, py + TILE / 2, cell === 3 ? 5 + Math.sin(time / 210) * .5 : 2.1, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
    }
  }));
  const player = interpolate(previous.player, state.player, alpha);
  const x = player.x * TILE + TILE / 2, y = player.y * TILE + TILE / 2;
  const angle = Math.atan2(state.player.direction.y, state.player.direction.x);
  const mouth = .13 + (Math.sin(time / 75) + 1) * .21;
  ctx.save(); ctx.translate(x, y); ctx.rotate(angle);
  const gold = ctx.createRadialGradient(-3, -5, 0, 0, 0, 13);
  gold.addColorStop(0, '#fff8bc'); gold.addColorStop(.5, '#f3d371'); gold.addColorStop(1, '#c79443');
  ctx.fillStyle = gold; ctx.shadowColor = '#efc96144'; ctx.shadowBlur = 9;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 11.5, mouth, Math.PI * 2 - mouth); ctx.closePath(); ctx.fill(); ctx.shadowBlur = 0;
  ctx.fillStyle = '#463b2a'; ctx.beginPath(); ctx.arc(1, -6.5, 1.5, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  state.ghosts.forEach((ghost, index) => {
    const last = previous.ghosts[index];
    const point = last && Math.hypot(last.x - ghost.x, last.y - ghost.y) <= 1.5 ? interpolate(last, ghost, alpha) : ghost;
    const gx = point.x * TILE + TILE / 2, gy = point.y * TILE + TILE / 2;
    const flashing = state.power < 9 && state.power % 2 === 0;
    const shade = ctx.createLinearGradient(gx, gy - 12, gx, gy + 12);
    shade.addColorStop(0, ghost.frightened ? flashing ? '#e9e3d2' : '#95b6df' : ghost.color);
    shade.addColorStop(1, ghost.frightened ? '#456b9e' : ghost.color + 'aa');
    ctx.fillStyle = shade; ctx.beginPath(); ctx.arc(gx, gy - 1, 11, Math.PI, 0); ctx.lineTo(gx + 11, gy + 11);
    for (let i = 0; i < 4; i++) { ctx.lineTo(gx + 11 - i * 5.5 - 2.75, gy + 8); ctx.lineTo(gx + 11 - (i + 1) * 5.5, gy + 11); }
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#f6f2e6'; ctx.beginPath(); ctx.ellipse(gx - 4.5, gy - 2, 3.5, 4.5, 0, 0, Math.PI * 2); ctx.ellipse(gx + 4.5, gy - 2, 3.5, 4.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#2a3e57'; ctx.beginPath(); ctx.arc(gx - 4.5 + ghost.direction.x * 1.3, gy - 2 + ghost.direction.y * 1.3, 1.8, 0, Math.PI * 2); ctx.arc(gx + 4.5 + ghost.direction.x * 1.3, gy - 2 + ghost.direction.y * 1.3, 1.8, 0, Math.PI * 2); ctx.fill();
  });
}

export default function PacmanGame(props: ArcadeGameProps) {
  const [state, setState] = useState(() => createPacman());
  const session = useArcadeSession('pacman_highscore', state.score, state.status, 200, props);
  const motion = useArcadeMotion(state, state.tick);
  useArcadeLoop(session.running, STEP, () => setState(tickPacman));
  const surface = useArcadeCanvas(MAZE_COLS * TILE, MAZE_ROWS * TILE, ctx => {
    const alpha = session.running ? Math.min(1, (performance.now() - motion.current.at) / STEP) : 1;
    drawMaze(ctx, state, motion.current.from, alpha, session.running ? performance.now() : state.tick * STEP);
  }, session.running);
  const start = () => { setState(createPacman(roundSeed())); session.begin(); };
  return <ArcadeFrame kind="pacman" title="Cyber Pac-Man" index="03" headline="Own the night." instruction="Clear the maze. Keep moving, and make the power pellets count." score={state.score} session={session} surface={surface} onStart={start} onDirection={direction => setState(current => turnPacman(current, direction))} onClose={props.stopGame} blocked={props.isNotificationVisible}>
    {state.power > 0 && session.phase === 'playing' && <div className="arcade-power" aria-label="Power pellet active"><span>THE CHASE IS YOURS</span><i><b style={{ transform: `scaleX(${state.power / 35})` }} /></i></div>}
  </ArcadeFrame>;
}
