/** Game rules use logical coordinates, independent of canvas size and display refresh rate. */
export type Point = { x: number; y: number };
export type Direction = Point;
export type RoundStatus = 'playing' | 'over' | 'won';
export const UP = { x: 0, y: -1 };
export const DOWN = { x: 0, y: 1 };
export const LEFT = { x: -1, y: 0 };
export const RIGHT = { x: 1, y: 0 };
export const DIRECTIONS = [UP, LEFT, DOWN, RIGHT];
export const samePoint = (a: Point, b: Point) => a.x === b.x && a.y === b.y;
export function directionForKey(key: string): Direction | undefined {
  switch (key.toLowerCase()) {
    case 'arrowup': case 'w': return UP;
    case 'arrowdown': case 's': return DOWN;
    case 'arrowleft': case 'a': return LEFT;
    case 'arrowright': case 'd': return RIGHT;
    default: return undefined;
  }
}

function random(seed: number): [number, number] {
  let next = seed || 1;
  next ^= next << 13; next ^= next >>> 17; next ^= next << 5;
  return [(next >>> 0) / 4294967296, next >>> 0];
}

export type BirdPipe = { x: number; top: number; passed: boolean };
export type BirdState = { y: number; velocity: number; pipes: BirdPipe[]; elapsed: number; spawnIn: number; score: number; seed: number; status: RoundStatus };
export const BIRD = { width: 600, height: 600, x: 116, size: 34, ground: 556, gap: 188, pipeWidth: 68 };
export const createBird = (seed = 1): BirdState => ({ y: 255, velocity: -310, pipes: [{ x: 600, top: 190, passed: false }], elapsed: 0, spawnIn: 1.6, score: 0, seed, status: 'playing' });
export const flapBird = (state: BirdState): BirdState => state.status === 'playing' ? { ...state, velocity: -310 } : state;
export function tickBird(state: BirdState, seconds = 1 / 60): BirdState {
  if (state.status !== 'playing') return state;
  const velocity = state.velocity + 840 * seconds;
  const y = state.y + velocity * seconds;
  let seed = state.seed;
  let spawnIn = state.spawnIn - seconds;
  let score = state.score;
  const pipes = state.pipes.map(pipe => {
    const x = pipe.x - 190 * seconds;
    const passed = pipe.passed || x + BIRD.pipeWidth < BIRD.x - 12;
    if (passed && !pipe.passed) score++;
    return { ...pipe, x, passed };
  }).filter(pipe => pipe.x > -80);
  if (spawnIn <= 0) {
    const [value, next] = random(seed); seed = next;
    pipes.push({ x: 600, top: 65 + value * 235, passed: false });
    spawnIn += 1.6;
  }
  const radius = 13;
  const collision = y - radius < 0 || y + radius >= BIRD.ground || pipes.some(pipe => {
    const nearestX = Math.max(pipe.x - 4, Math.min(BIRD.x, pipe.x + BIRD.pipeWidth + 4));
    const dx = BIRD.x - nearestX;
    const dyTop = y - Math.min(y, pipe.top);
    const dyBottom = Math.max(y, pipe.top + BIRD.gap) - y;
    return dx * dx + Math.min(dyTop * dyTop, dyBottom * dyBottom) < radius * radius;
  });
  return { y, velocity, pipes, score, seed, spawnIn, elapsed: state.elapsed + seconds, status: collision ? 'over' : 'playing' };
}

export const SNAKE_TILES = 24;
export type SnakeState = { body: Point[]; direction: Direction; turns: Direction[]; apple: Point | null; obstacles: Point[]; score: number; seed: number; status: RoundStatus };
export function freeSnakeCell(occupied: Point[], seed: number): { cell: Point | null; seed: number } {
  const used = new Set(occupied.map(point => point.y * SNAKE_TILES + point.x));
  const cells: Point[] = [];
  for (let y = 0; y < SNAKE_TILES; y++) for (let x = 0; x < SNAKE_TILES; x++) if (!used.has(y * SNAKE_TILES + x)) cells.push({ x, y });
  const [value, next] = random(seed);
  return { cell: cells.length ? cells[Math.floor(value * cells.length)] : null, seed: next };
}
export function createSnake(seed = 1): SnakeState {
  const body = [10, 9, 8, 7].map(x => ({ x, y: 12 }));
  const obstacles: Point[] = [];
  const runway = Array.from({ length: 15 }, (_, i) => ({ x: i + 5, y: 12 }));
  for (let i = 0; i < 8; i++) {
    const free = freeSnakeCell([...body, ...obstacles, ...runway], seed); seed = free.seed;
    if (free.cell) obstacles.push(free.cell);
  }
  const free = freeSnakeCell([...body, ...obstacles], seed);
  return { body, direction: RIGHT, turns: [], apple: free.cell, obstacles, score: 0, seed: free.seed, status: 'playing' };
}
export function turnSnake(state: SnakeState, direction: Direction): SnakeState {
  const previous = state.turns.at(-1) || state.direction;
  if (state.status !== 'playing' || state.turns.length >= 2 || samePoint(previous, direction) || (previous.x === -direction.x && previous.y === -direction.y)) return state;
  return { ...state, turns: [...state.turns, direction] };
}
export function tickSnake(state: SnakeState): SnakeState {
  if (state.status !== 'playing') return state;
  const direction = state.turns[0] || state.direction;
  const head = { x: (state.body[0].x + direction.x + SNAKE_TILES) % SNAKE_TILES, y: (state.body[0].y + direction.y + SNAKE_TILES) % SNAKE_TILES };
  const eating = !!state.apple && samePoint(head, state.apple);
  const remaining = eating ? state.body : state.body.slice(0, -1);
  if ([...remaining, ...state.obstacles].some(point => samePoint(point, head))) return { ...state, direction, turns: [], status: 'over' };
  const body = [head, ...remaining];
  const free = eating ? freeSnakeCell([...body, ...state.obstacles], state.seed) : { cell: state.apple, seed: state.seed };
  return { ...state, body, direction, turns: state.turns.slice(1), apple: free.cell, seed: free.seed, score: state.score + (eating ? 10 : 0), status: free.cell ? 'playing' : 'won' };
}

// 0 pellet, 1 wall, 2 corridor, 3 power pellet, 4 ghost gate.
export const PACMAN_MAZE = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,3,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,3,1],
  [1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
  [1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,0,1],
  [1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,1],
  [1,1,1,1,0,1,1,1,2,2,2,1,1,1,0,1,1,1,1],
  [2,2,2,1,0,1,1,1,1,4,1,1,1,1,0,1,2,2,2],
  [1,1,1,1,0,1,2,2,2,2,2,2,2,1,0,1,1,1,1],
  [2,2,2,2,0,1,1,1,1,1,1,1,1,1,0,2,2,2,2],
  [1,1,1,1,0,1,0,0,0,0,0,0,0,1,0,1,1,1,1],
  [2,2,2,1,0,1,0,1,1,1,1,1,0,1,0,1,2,2,2],
  [1,1,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
  [1,3,0,1,0,0,0,0,0,2,0,0,0,0,0,1,0,3,1],
  [1,1,0,1,0,1,0,1,1,1,1,1,0,1,0,1,0,1,1],
  [1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,1],
  [1,0,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];
export const MAZE_ROWS = PACMAN_MAZE.length;
export const MAZE_COLS = PACMAN_MAZE[0].length;
export type Ghost = Point & { direction: Direction; name: string; color: string; frightened: boolean; house: boolean; release: number };
export type PacmanState = { grid: number[][]; player: Point & { direction: Direction; next: Direction }; ghosts: Ghost[]; power: number; score: number; tick: number; seed: number; status: RoundStatus };
export function createPacman(seed = 1): PacmanState {
  return {
    grid: PACMAN_MAZE.map(row => [...row]), player: { x: 9, y: 16, direction: RIGHT, next: RIGHT }, power: 0, score: 0, tick: 0, seed, status: 'playing',
    ghosts: [
      { x: 9, y: 7, direction: LEFT, name: 'Blinky', color: '#ed8c92', frightened: false, house: false, release: 0 },
      { x: 8, y: 9, direction: UP, name: 'Pinky', color: '#d59ed5', frightened: false, house: true, release: 8 },
      { x: 9, y: 9, direction: UP, name: 'Inky', color: '#84cdd5', frightened: false, house: true, release: 16 },
      { x: 10, y: 9, direction: UP, name: 'Clyde', color: '#e7b084', frightened: false, house: true, release: 24 },
    ],
  };
}
export const mazeNext = (point: Point, direction: Direction) => ({ x: (point.x + direction.x + MAZE_COLS) % MAZE_COLS, y: (point.y + direction.y + MAZE_ROWS) % MAZE_ROWS });
export const mazeWalkable = (grid: number[][], point: Point, gate = false) => grid[point.y][point.x] !== 1 && (gate || grid[point.y][point.x] !== 4);
export const turnPacman = (state: PacmanState, direction: Direction): PacmanState => state.status === 'playing' ? { ...state, player: { ...state.player, next: direction } } : state;
export function moveGhost(ghost: Ghost, player: PacmanState['player'], grid: number[][], tick: number, value = .5): Ghost {
  if (tick < ghost.release || tick % 4 === 0) return ghost;
  const valid = DIRECTIONS.filter(direction => mazeWalkable(grid, mazeNext(ghost, direction), ghost.house));
  if (!valid.length) return ghost;
  let target: Point = player;
  let candidates = valid;
  if (ghost.house) target = { x: 9, y: 7 };
  else {
    const forward = valid.filter(direction => !(direction.x === -ghost.direction.x && direction.y === -ghost.direction.y));
    if (forward.length) candidates = forward;
    if (ghost.name === 'Pinky' || ghost.name === 'Inky') {
      const ahead = ghost.name === 'Pinky' ? 4 : 2;
      target = { x: player.x + player.direction.x * ahead, y: player.y + player.direction.y * ahead };
    }
    if (ghost.name === 'Clyde' && Math.hypot(ghost.x - player.x, ghost.y - player.y) < 5) target = { x: 1, y: MAZE_ROWS - 2 };
  }
  const direction = ghost.frightened && !ghost.house ? candidates[Math.floor(value * candidates.length)] : [...candidates].sort((a, b) => {
    const first = mazeNext(ghost, a), second = mazeNext(ghost, b);
    return Math.hypot(first.x - target.x, first.y - target.y) - Math.hypot(second.x - target.x, second.y - target.y);
  })[0];
  const next = mazeNext(ghost, direction);
  return { ...ghost, ...next, direction, house: ghost.house && !(next.y === 7 && next.x === 9) };
}
export function tickPacman(state: PacmanState): PacmanState {
  if (state.status !== 'playing') return state;
  const tick = state.tick + 1;
  const direction = mazeWalkable(state.grid, mazeNext(state.player, state.player.next)) ? state.player.next : state.player.direction;
  const target = mazeNext(state.player, direction);
  const player = { ...state.player, ...(mazeWalkable(state.grid, target) ? target : {}), direction };
  const cell = state.grid[player.y][player.x];
  let score = state.score + (cell === 3 ? 50 : cell === 0 ? 10 : 0);
  const grid = cell === 0 || cell === 3 ? state.grid.map((row, y) => y === player.y ? row.map((value, x) => x === player.x ? 2 : value) : row) : state.grid;
  const power = cell === 3 ? 35 : Math.max(0, state.power - 1);
  let seed = state.seed;
  let caught = false;
  const ghosts = state.ghosts.map(previous => {
    const [value, next] = random(seed); seed = next;
    const ghost = moveGhost({ ...previous, frightened: power > 0 }, player, grid, tick, value);
    const collided = (!previous.house && samePoint(previous, player)) || (!ghost.house && samePoint(ghost, player)) || (!ghost.house && samePoint(ghost, state.player) && samePoint(previous, player));
    if (!collided) return ghost;
    if (ghost.frightened) {
      score += 200;
      return { ...ghost, x: 9, y: 9, direction: UP, house: true, release: tick + 8 };
    }
    caught = true;
    return ghost;
  });
  const won = !grid.some(row => row.some(value => value === 0 || value === 3));
  return { ...state, grid, player, ghosts, power, score, tick, seed, status: won ? 'won' : caught ? 'over' : 'playing' };
}
