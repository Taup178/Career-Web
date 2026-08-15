
export enum GameState {
  None,
  Bird,
  Snake,
  Pacman,
}

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface Particle {
  acceleration: Vector3;
  position: Vector3;
  velocity: Vector3;
  mass: number;
  fixed: boolean;
  updatePosition: (x: number, y: number, z?: number) => void;
  updateVelocity: (x: number, y: number, z?: number) => void;
  applyForce: (force: Vector3) => void;
  update: () => void;
}

export interface Pipe {
  x: number;
  topHeight: number;
  passed: boolean;
}

export interface SnakeSegment {
  x: number;
  y: number;
}

export interface EnemySnake {
  body: SnakeSegment[];
  direction: number; // 0: up, 1: right, 2: down, 3: left
  moveCounter: number;
  changeDirectionCounter: number;
}
