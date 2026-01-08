export type CellState = 0 | 1;

export interface Position {
  row: number;
  col: number;
}

export interface BlockShape {
  id: string;
  pattern: number[][];
  color: string;
  highlight: string;
  shadow: string;
}

export interface Block {
  id: string;
  shape: BlockShape;
  position: Position | null;
}

export type ColorGridObj = {
  shadow: string;
  highlight: string;
} | null;

export type Grid = CellState[][];

export type ColorGrid = ColorGridObj[][];

export interface GameState {
  grid: Grid;
  colorGrid: ColorGrid;
  score: number;
  currentBlocks: Block[];
  gameOver: boolean;
  highScore: number;
}
