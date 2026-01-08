import { BlockShape, ColorGrid, Grid, Position } from "@/types/game";

export const GRID_SIZE = 8;

// Define all possible block shapes with vibrant colors
export const BLOCK_SHAPES: BlockShape[] = [

  // 3x1 horizontal
  { id: "h3", pattern: [[1, 1, 1]], color: "#FF6B35", highlight: "#FFE680", shadow: "#FFB703" },

  // 1x3 vertical
  { id: "v3", pattern: [[1], [1], [1]], color: "#00C9A7", highlight: "#FFE680", shadow: "#FFB703" },

  // 2x2 square
  {
    id: "square2",
    pattern: [
      [1, 1],
      [1, 1],
    ],
    color: "#FFD93D",
    highlight: "#7CC8FF",
    shadow: "#2F80ED",
  },

  // 3x3 square
  {
    id: "square3",
    pattern: [
      [1, 1, 1],
      [1, 1, 1],
      [1, 1, 1],
    ],
    color: "#C77DFF",
    highlight: "#FF7A85",
    shadow: "#D7263D",
  },

  // L-shape
  {
    id: "L1",
    pattern: [
      [1, 0],
      [1, 0],
      [1, 1],
    ],
    color: "#06FFA5",
    highlight: "#7ED957",
    shadow: "#2E7D32",
  },
  {
    id: "L2",
    pattern: [
      [1, 1],
      [1, 0],
      [1, 0],
    ],
    color: "#FF90E8",
     highlight: "#7ED957",
    shadow: "#2E7D32",
  },
  {
    id: "L3",
    pattern: [
      [1, 1, 1],
      [1, 0, 0],
    ],
    color: "#FF4D6D",
     highlight: "#7ED957",
    shadow: "#2E7D32",
  },
  {
    id: "L4",
    pattern: [
      [1, 0, 0],
      [1, 1, 1],
    ],
    color: "#4ECDC4",
     highlight: "#7ED957",
    shadow: "#2E7D32",
  },
  {
    id: "L5",
    pattern: [
      [0, 1],
      [0, 1],
      [1, 1],
    ],
    color: "#06FFA5",
     highlight: "#7ED957",
    shadow: "#2E7D32",
  },
  {
    id: "L6",
    pattern: [
      [1, 1],
      [0, 1],
      [0, 1],
    ],
    color: "#FF90E8",
     highlight: "#7ED957",
    shadow: "#2E7D32",
  },
  {
    id: "L7",
    pattern: [
      [1, 1, 1],
      [0, 0, 1],
    ],
    color: "#FF4D6D",
     highlight: "#7ED957",
    shadow: "#2E7D32",
  },
  {
    id: "L8",
    pattern: [
      [0, 0, 1],
      [1, 1, 1],
    ],
    color: "#4ECDC4",
     highlight: "#7ED957",
    shadow: "#2E7D32",
  },

  // T-shape
  {
    id: "T1",
    pattern: [
      [1, 1, 1],
      [0, 1, 0],
    ],
    color: "#FEC89A",
    highlight: "#9B5DE5",
    shadow: "#4d247fff",
  },
  {
    id: "T2",
    pattern: [
      [0, 1, 0],
      [1, 1, 1],
    ],
    color: "#FEC89A",
    highlight: "#9B5DE5",
    shadow: "#4d247fff",
  },
  {
    id: "T3",
    pattern: [
      [0, 1],
      [1, 1],
      [0, 1],
    ],
    color: "#FEC89A",
    highlight: "#9B5DE5",
    shadow: "#4d247fff",
  },
  {
    id: "T4",
    pattern: [
      [1, 0],
      [1, 1],
      [1, 0],
    ],
    color: "#FEC89A",
    highlight: "#9B5DE5",
    shadow: "#4d247fff",
  },

  // Z-shape
  {
    id: "Z1",
    pattern: [
      [1, 1, 0],
      [0, 1, 1],
    ],
    color: "#F72585",
    highlight: "#e68a3eff",
    shadow: "#a55717ff",
  },
  {
    id: "Z2",
    pattern: [
      [0, 1, 1],
      [1, 1, 0],
    ],
    color: "#4CC9F0",
    highlight: "#e68a3eff",
    shadow: "#a55717ff",
  },
  {
    id: "Z3",
    pattern: [
      [1, 0],
      [1, 1],
      [0, 1],
    ],
    color: "#F72585",
    highlight: "#e68a3eff",
    shadow: "#a55717ff",
  },
  {
    id: "Z4",
    pattern: [
      [0, 1],
      [1, 1],
      [1, 0],
    ],
    color: "#4CC9F0",
    highlight: "#e68a3eff",
    shadow: "#a55717ff",
  },
];

// Create an empty grid
export const createEmptyGrid = (): Grid => {
  return Array(GRID_SIZE)
    .fill(null)
    .map(() => Array(GRID_SIZE).fill(0));
};

// Create an empty color grid
export const createEmptyColorGrid = (): ColorGrid => {
  return Array(GRID_SIZE)
    .fill(null)
    .map(() => Array(GRID_SIZE).fill(null));
};

// Generate random blocks
export const generateRandomBlocks = (count: number = 3): BlockShape[] => {
  const blocks: BlockShape[] = [];
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * BLOCK_SHAPES.length);
    blocks.push({ ...BLOCK_SHAPES[randomIndex] });
  }
  return blocks;
};

// Check if a block can be placed at a position
export const canPlaceBlock = (
  grid: Grid,
  blockPattern: number[][],
  position: Position
): boolean => {
  const { row, col } = position;

  for (let i = 0; i < blockPattern.length; i++) {
    for (let j = 0; j < blockPattern[i].length; j++) {
      if (blockPattern[i][j] === 1) {
        const targetRow = row + i;
        const targetCol = col + j;

        // Check if out of bounds
        if (
          targetRow < 0 ||
          targetRow >= GRID_SIZE ||
          targetCol < 0 ||
          targetCol >= GRID_SIZE
        ) {
          return false;
        }

        // Check if cell is already occupied
        if (grid[targetRow][targetCol] === 1) {
          return false;
        }
      }
    }
  }

  return true;
};

// Place a block on the grid with colors
export const placeBlock = (
  grid: Grid,
  blockPattern: number[][],
  position: Position
): Grid => {
  const newGrid = grid.map((row) => [...row]);
  const { row, col } = position;

  for (let i = 0; i < blockPattern.length; i++) {
    for (let j = 0; j < blockPattern[i].length; j++) {
      if (blockPattern[i][j] === 1) {
        newGrid[row + i][col + j] = 1;
      }
    }
  }

  return newGrid;
};

// Place a block color on the color grid
export const placeBlockColor = (
  colorGrid: ColorGrid,
  blockPattern: number[][],
  position: Position,
  colorShadow: string,
  colorHighlight: string
): ColorGrid => {
  const newColorGrid = colorGrid.map((row) => [...row]);
  const { row, col } = position;

  for (let i = 0; i < blockPattern.length; i++) {
    for (let j = 0; j < blockPattern[i].length; j++) {
      if (blockPattern[i][j] === 1) {
        newColorGrid[row + i][col + j] = {  shadow: colorShadow, highlight: colorHighlight};
      }
    }
  }

  return newColorGrid;
};

// Check and clear completed lines
export const clearCompletedLines = (
  grid: Grid,
  colorGrid: ColorGrid
): {
  newGrid: Grid;
  newColorGrid: ColorGrid;
  linesCleared: number;
  clearedRows: number[];
  clearedCols: number[];
} => {
  let newGrid = grid.map((row) => [...row]);
  let newColorGrid = colorGrid.map((row) => [...row]);
  let linesCleared = 0;

  // Check rows
  const rowsToClear: number[] = [];
  for (let i = 0; i < GRID_SIZE; i++) {
    if (newGrid[i].every((cell) => cell === 1)) {
      rowsToClear.push(i);
    }
  }

  // Check columns
  const colsToClear: number[] = [];
  for (let j = 0; j < GRID_SIZE; j++) {
    if (newGrid.every((row) => row[j] === 1)) {
      colsToClear.push(j);
    }
  }

  // Clear rows
  rowsToClear.forEach((rowIndex) => {
    for (let j = 0; j < GRID_SIZE; j++) {
      newGrid[rowIndex][j] = 0;
      newColorGrid[rowIndex][j] = null;
    }
    linesCleared++;
  });

  // Clear columns
  colsToClear.forEach((colIndex) => {
    for (let i = 0; i < GRID_SIZE; i++) {
      newGrid[i][colIndex] = 0;
      newColorGrid[i][colIndex] = null;
    }
    linesCleared++;
  });

  return {
    newGrid,
    newColorGrid,
    linesCleared,
    clearedRows: rowsToClear,
    clearedCols: colsToClear,
  };
};

// Calculate score based on block size and lines cleared
export const calculateScore = (
  blockSize: number,
  linesCleared: number
): number => {
  const blockScore = blockSize;
  const lineScore = linesCleared * 10;
  const bonusScore = linesCleared > 1 ? linesCleared * 5 : 0;
  return lineScore + bonusScore;
};

// Check if any of the given blocks can be placed on the grid
export const canPlaceAnyBlock = (grid: Grid, blocks: BlockShape[]): boolean => {
  for (const block of blocks) {
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (canPlaceBlock(grid, block.pattern, { row, col })) {
          return true;
        }
      }
    }
  }
  return false;
};

// Get the number of cells in a block pattern
export const getBlockSize = (pattern: number[][]): number => {
  return pattern.flat().filter((cell) => cell === 1).length;
};

// Convert screen coordinates to grid position
export const screenToGridPosition = (
  x: number,
  y: number,
  gridX: number,
  gridY: number,
  cellSize: number
): Position | null => {
  const relativeX = x - gridX;
  const relativeY = y - gridY;

  if (relativeX < 0 || relativeY < 0) {
    return null;
  }

  const col = Math.floor(relativeX / cellSize);
  const row = Math.floor(relativeY / cellSize);

  if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE) {
    return { row: row, col: col };
  }

  return null;
};
