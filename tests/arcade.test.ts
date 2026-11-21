import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BIRD, createBird, flapBird, tickBird, createSnake, turnSnake, tickSnake, freeSnakeCell,
  createPacman, moveGhost, tickPacman, turnPacman, mazeWalkable, mazeNext,
  PACMAN_MAZE, MAZE_COLS, MAZE_ROWS, DIRECTIONS, UP, DOWN, LEFT, RIGHT, directionForKey,
} from '../arcadeEngine';

test('Bird scores each pipe once, uses a forgiving hitbox and stops after a collision', () => {
  const original = { ...createBird(), y: 240, velocity: 0, pipes: [{ x: 35, top: 150, passed: false }] };
  const passed = tickBird(original);
  assert.equal(passed.status, 'playing');
  assert.equal(passed.score, 1);
  assert.equal(tickBird(passed).score, 1);
  assert.equal(original.pipes[0].passed, false, 'steps do not mutate previous state');
  const collision = tickBird({ ...createBird(), y: 158, velocity: 0, pipes: [{ x: BIRD.x - 10, top: 150, passed: false }] });
  assert.equal(collision.status, 'over');
  assert.equal(tickBird(collision), collision);
  assert.equal(flapBird(collision), collision);
  assert.equal(tickBird({ ...createBird(), y: BIRD.ground - 1, velocity: 50 }).status, 'over');
});

test('Bird advances by elapsed simulation time and flaps immediately', () => {
  const state = createBird();
  const advanced = tickBird(state, 1 / 60);
  assert.ok(advanced.y < state.y);
  assert.ok(advanced.velocity > state.velocity);
  assert.ok(Math.abs(advanced.pipes[0].x - (600 - 190 / 60)) < .0001);
  assert.equal(flapBird({ ...state, velocity: 200 }).velocity, -310);
});

test('Snake limits queued turns, ignores repeated directions and prevents reversals', () => {
  assert.equal(directionForKey('constructor'), undefined);
  const state = createSnake();
  assert.equal(turnSnake(state, LEFT), state);
  assert.equal(turnSnake(state, RIGHT), state);
  const first = turnSnake(state, UP);
  assert.equal(turnSnake(first, UP), first);
  const second = turnSnake(first, LEFT);
  assert.equal(second.turns.length, 2);
  assert.equal(turnSnake(second, DOWN), second);
  const advanced = tickSnake(second);
  assert.deepEqual(advanced.direction, UP);
  assert.deepEqual(advanced.turns, [LEFT]);
});

test('Snake may move into its vacating tail, wraps edges and still detects collisions', () => {
  const state = { ...createSnake(), obstacles: [], apple: { x: 23, y: 23 }, body: [{ x: 1, y: 1 }, { x: 1, y: 2 }, { x: 2, y: 2 }, { x: 2, y: 1 }], direction: RIGHT };
  assert.equal(tickSnake(state).status, 'playing');
  assert.deepEqual(tickSnake(state).body[0], { x: 2, y: 1 });
  const edge = { ...state, body: [{ x: 23, y: 12 }, { x: 22, y: 12 }] };
  assert.deepEqual(tickSnake(edge).body[0], { x: 0, y: 12 });
  assert.equal(tickSnake({ ...edge, obstacles: [{ x: 0, y: 12 }] }).status, 'over');
  assert.equal(tickSnake({ ...state, body: [{ x: 2, y: 2 }, { x: 2, y: 3 }, { x: 3, y: 3 }, { x: 3, y: 2 }, { x: 3, y: 1 }] }).status, 'over');
});

test('Snake grows and finishes a full board without an endless food-placement loop', () => {
  const original = { ...createSnake(), obstacles: [], apple: { x: 11, y: 12 } };
  const eaten = tickSnake(original);
  assert.equal(eaten.score, 10);
  assert.equal(eaten.body.length, original.body.length + 1);
  assert.ok(eaten.apple && !eaten.body.some(point => point.x === eaten.apple!.x && point.y === eaten.apple!.y));
  const cells = Array.from({ length: 24 * 24 }, (_, i) => ({ x: i % 24, y: Math.floor(i / 24) }));
  assert.equal(freeSnakeCell(cells, 1).cell, null);
  const almostFull = { ...createSnake(), obstacles: [], body: [{ x: 0, y: 0 }, ...cells.filter(point => !(point.y === 0 && point.x < 2))], apple: { x: 1, y: 0 } };
  const complete = tickSnake(almostFull);
  assert.equal(complete.status, 'won');
  assert.equal(complete.body.length, 576);
  assert.equal(complete.apple, null);
});

test('every Pac-Man pellet is reachable from the starting position', () => {
  const queue = [{ x: 9, y: 16 }];
  const visited = new Set(['9,16']);
  for (const point of queue) for (const direction of DIRECTIONS) {
    const next = mazeNext(point, direction), key = `${next.x},${next.y}`;
    if (!visited.has(key) && mazeWalkable(PACMAN_MAZE, next)) { visited.add(key); queue.push(next); }
  }
  PACMAN_MAZE.forEach((row, y) => row.forEach((cell, x) => { if (cell === 0 || cell === 3) assert.ok(visited.has(`${x},${y}`), `pellet ${x},${y} is reachable`); }));
});

test('ghost movement respects walls throughout the lower maze and exits the house through its gate', () => {
  const state = createPacman();
  for (let y = 0; y < MAZE_ROWS; y++) for (let x = 0; x < MAZE_COLS; x++) {
    if (!mazeWalkable(state.grid, { x, y })) continue;
    for (const direction of DIRECTIONS) {
      const moved = moveGhost({ ...state.ghosts[0], x, y, direction }, state.player, state.grid, 1);
      assert.ok(mazeWalkable(state.grid, moved), `ghost at ${x},${y} does not enter a wall`);
    }
  }
  let ghost = { ...state.ghosts[1], release: 0 };
  for (let tick = 1; tick <= 8; tick++) {
    ghost = moveGhost(ghost, state.player, state.grid, tick);
    assert.notEqual(state.grid[ghost.y][ghost.x], 1);
  }
  assert.equal(ghost.house, false);
});

test('Pac-Man buffers an early turn until the next valid intersection', () => {
  const initial = createPacman();
  let state = turnPacman({ ...initial, ghosts: [], player: { x: 6, y: 16, direction: RIGHT, next: RIGHT } }, UP);
  state = tickPacman(state);
  assert.deepEqual({ x: state.player.x, y: state.player.y }, { x: 7, y: 16 });
  state = tickPacman(state);
  state = tickPacman(state);
  assert.deepEqual({ x: state.player.x, y: state.player.y }, { x: 8, y: 15 });
});

test('power pellets protect Pac-Man immediately and defeated ghosts return to the house', () => {
  const initial = createPacman();
  const state = { ...initial, player: { x: 2, y: 1, direction: LEFT, next: LEFT }, ghosts: [{ ...initial.ghosts[0], x: 1, y: 1 }] };
  const next = tickPacman(state);
  assert.equal(next.status, 'playing');
  assert.equal(next.score, 250);
  assert.equal(next.power, 35);
  assert.equal(next.ghosts[0].house, true);
  assert.equal(next.grid[1][1], 2);
  assert.equal(state.grid[1][1], 3, 'collecting a pellet does not mutate the previous grid');
});

test('Pac-Man detects crossing ghosts and completes the last pellet', () => {
  const initial = createPacman();
  const crossing = { ...initial, player: { x: 5, y: 4, direction: RIGHT, next: RIGHT }, ghosts: [{ ...initial.ghosts[0], x: 6, y: 4, direction: LEFT }] };
  assert.equal(tickPacman(crossing).status, 'over');
  const grid = initial.grid.map(row => row.map(cell => cell === 0 || cell === 3 ? 2 : cell));
  grid[4][6] = 0;
  const last = tickPacman({ ...crossing, grid, ghosts: [] });
  assert.equal(last.status, 'won');
  assert.equal(last.score, 10);
});
