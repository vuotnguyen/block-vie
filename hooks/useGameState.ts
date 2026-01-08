import { useAppContext } from "@/app/AppProvider";
import { GameState, Position } from "@/types/game";
import {
  calculateScore,
  canPlaceAnyBlock,
  canPlaceBlock,
  clearCompletedLines,
  createEmptyColorGrid,
  createEmptyGrid,
  generateRandomBlocks,
  getBlockSize,
  GRID_SIZE,
  placeBlock,
  placeBlockColor,
  screenToGridPosition
} from "@/utils/gameLogic";
import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useRef, useState } from "react";

const RANDOM_COLORS = [
  '#FFD93D', '#FF3B77', '#00D9FF', '#7B68EE', '#FF6B35', '#00C9A7', '#C77DFF', '#06FFA5', '#FF90E8', '#FF4D6D', '#4ECDC4', '#FEC89A', '#F72585', '#4CC9F0', '#34C759', '#007AFF'
];

function createRandomGridAndColorGrid(coverage = 0.2) {
  const totalCells = 8 * 8;
  const filledCells = Math.floor(totalCells * coverage);
  const arr = Array(filledCells).fill(1).concat(Array(totalCells - filledCells).fill(0));
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  const grid = [];
  const colorGrid = [];
  for (let i = 0; i < 8; i++) {
    const row = arr.slice(i * 8, (i + 1) * 8);
    grid.push(row);
    colorGrid.push(row.map(cell => cell === 1 ? RANDOM_COLORS[Math.floor(Math.random() * RANDOM_COLORS.length)] : ''));
  }
  return { grid, colorGrid };
}

export const useGameState = (difficulty: string) => {

  const [gameState, setGameState] = useState<GameState>(() => {
    if (difficulty === 'hard') {
      // const { grid, colorGrid } = createRandomGridAndColorGrid(0.2);
      // return {
      //   grid,
      //   colorGrid,
      //   score: 0,
      //   currentBlocks: [],
      //   gameOver: false,
      //   highScore: 0,
      // };
    }
    return {
      grid: createEmptyGrid(),
      colorGrid: createEmptyColorGrid(),
      score: 0,
      currentBlocks: [],
      gameOver: false,
      highScore: 0,
    };
  });
  const {playerSound, soundEnabled} = useAppContext();
  const [previewPosition, setPreviewPosition] = useState<Position | null>(null);
  const [previewPattern, setPreviewPattern] = useState<number[][] | null>(null);
  const [previewColor, setPreviewColor] = useState<string | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [clearingRows, setClearingRows] = useState<number[]>([]);
  const [clearingCols, setClearingCols] = useState<number[]>([]);
  const [scoreGain, setScoreGain] = useState<number>(0);
  const [showScorePopup, setShowScorePopup] = useState<boolean>(false);
  const [assistsUsed, setAssistsUsed] = useState<{ changeBlock: boolean; removeCell: boolean }>({
    changeBlock: false,
    removeCell: false,
  });
  const timerRef = useRef<any>(null);
  const [gridLayout, setGridLayout] = useState<{
    x: number;
    y: number;
    cellSize: number;
  }>({
    x: 0,
    y: 0,
    cellSize: 50,
  });

  // Remove-mode / hammer state
  const [removeMode, setRemoveMode] = useState<boolean>(false);
  const [hammerCell, setHammerCell] = useState<Position | null>(null);
  const hammerTimerRef = useRef<any>(null);

  const startRemoveMode = useCallback(() => {
    setRemoveMode(true);
    setHammerCell(null);
    playerSound && soundEnabled && playerSound('startDrag');
  }, [playerSound, soundEnabled]);

  const cancelRemoveMode = useCallback(() => {
    setRemoveMode(false);
    setHammerCell(null);
    if (hammerTimerRef.current) {
      clearTimeout(hammerTimerRef.current);
      hammerTimerRef.current = null;
    }
  }, []);

  const handleHammerMove = useCallback(
    (pageX: number, pageY: number) => {
      if (!removeMode) return;

      const gridPos = screenToGridPosition(
        pageX,
        pageY,
        gridLayout.x,
        gridLayout.y,
        gridLayout.cellSize
      );

      // Not over grid or invalid -> clear hammer/cancel timer
      if (!gridPos) {
        setHammerCell(null);
        if (hammerTimerRef.current) {
          clearTimeout(hammerTimerRef.current);
          hammerTimerRef.current = null;
        }
        return;
      }

      // Only allow targeting cells equal to 1
      const inBounds =
        gridPos.row >= 0 &&
        gridPos.row < GRID_SIZE &&
        gridPos.col >= 0 &&
        gridPos.col < GRID_SIZE;
      const cellVal = inBounds ? gameState.grid[gridPos.row][gridPos.col] : 0;
      if (cellVal !== 1) {
        setHammerCell(null);
        if (hammerTimerRef.current) {
          clearTimeout(hammerTimerRef.current);
          hammerTimerRef.current = null;
        }
        return;
      }

      // If moved to a new valid cell, reset timer and start counting
      const sameCell =
        hammerCell &&
        hammerCell.row === gridPos.row &&
        hammerCell.col === gridPos.col;

      setHammerCell(gridPos);

      if (hammerTimerRef.current) {
        clearTimeout(hammerTimerRef.current);
        hammerTimerRef.current = null;
      }

      // Start 2s timer to confirm removal
      hammerTimerRef.current = setTimeout(() => {
        // perform removal
        setGameState((prev) => {
          const newGrid = prev.grid.map((r) => [...r]);
          const newColorGrid = prev.colorGrid.map((r) => [...r]);
          // guard
          if (
            gridPos.row >= 0 &&
            gridPos.row < GRID_SIZE &&
            gridPos.col >= 0 &&
            gridPos.col < GRID_SIZE
          ) {
            newGrid[gridPos.row][gridPos.col] = 0;
            newColorGrid[gridPos.row][gridPos.col] = null;
          }
          // optional feedback
          playerSound && soundEnabled && playerSound('endDrag');
          return { ...prev, grid: newGrid, colorGrid: newColorGrid };
        });

        Haptics.selectionAsync();
        hammerTimerRef.current = null;
        setRemoveMode(false);
        setHammerCell(null);
      }, 2000);
    },
    [removeMode, gridLayout, gameState.grid, hammerCell, playerSound, soundEnabled]
  );

  // Initialize game with first set of blocks
  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = useCallback(() => {
    // timerRef.current.start()
    const blocks = generateRandomBlocks(3);
    if (difficulty === 'hard') {
      // const { grid, colorGrid } = createRandomGridAndColorGrid(0.2);
      // setGameState({
      //   grid,
      //   colorGrid,
      //   score: 0,
      //   currentBlocks: blocks.map((shape, index) => ({
      //     id: `block-${Date.now()}-${index}`,
      //     shape,
      //     position: null,
      //   })),
      //   gameOver: false,
      //   highScore: gameState.highScore,
      // });
    } else {
      setGameState({
        grid: createEmptyGrid(),
        colorGrid: createEmptyColorGrid(),
        score: 0,
        currentBlocks: blocks.map((shape, index) => ({
          id: `block-${Date.now()}-${index}`,
          shape,
          position: null,
        })),
        gameOver: false,
        highScore: gameState.highScore,
      });
    }
    setPreviewPosition(null);
    setPreviewPattern(null);
    setPreviewColor(null);
    setSelectedBlockId(null);
    // reset assists per game
    setAssistsUsed({ changeBlock: false, removeCell: false });
    // if you have remove-mode timers/state, clear them here as well
    // e.g. cancelRemoveMode?.();
  }, [gameState.highScore, difficulty]);

  const resetGame = useCallback(() => {
    // timerRef.current?.start();

    initializeGame();
  }, [initializeGame]);

  const handleBlockSelect = useCallback(
    (blockId: string) => {
      setSelectedBlockId(blockId);
      const block = gameState.currentBlocks.find((b) => b.id === blockId);
      if (block) {
        setPreviewPattern(block.shape.pattern);
        setPreviewColor(block.shape.highlight);
      }
    },
    [gameState.currentBlocks]
  );

  const handleDragUpdate = useCallback(
    (blockId: string, x: number, y: number) => {
      setGameState((prevState) => {
        const block = prevState.currentBlocks.find((b) => b.id === blockId);
        if (!block) return prevState;

        const gridPos = screenToGridPosition(
          x ,
          y ,
          gridLayout.x,
          gridLayout.y,
          gridLayout.cellSize
        );

        if (
          gridPos &&
          canPlaceBlock(prevState.grid, block.shape.pattern, gridPos)
        ) {
          setPreviewPosition(gridPos);
          setPreviewPattern(block.shape.pattern);
          setPreviewColor(block.shape.highlight);
        } else {
          setPreviewPosition(null);
        }

        return prevState;
      });
    },
    [gridLayout]
  );

  const handleDragEnd = useCallback(
    (blockId: string, x: number, y: number) => {
      // timerRef.current?.reset();
      setGameState((prevState) => {
        const block = prevState.currentBlocks.find((b) => b.id === blockId);
        if (!block) {
          setPreviewPosition(null);
          setPreviewPattern(null);
          setPreviewColor(null);
          setSelectedBlockId(null);
          return prevState;
        }

        const gridPos = screenToGridPosition(
          x ,
          y ,
          gridLayout.x,
          gridLayout.y,
          gridLayout.cellSize
        );

        if (
          !gridPos ||
          !canPlaceBlock(prevState.grid, block.shape.pattern, gridPos)
        ) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          setPreviewPosition(null);
          setPreviewPattern(null);
          setPreviewColor(null);
          setSelectedBlockId(null);
          return prevState;
        }

        // Place the block
        let newGrid = placeBlock(prevState.grid, block.shape.pattern, gridPos);
        let newColorGrid = placeBlockColor(
          prevState.colorGrid,
          block.shape.pattern,
          gridPos,
          block.shape.shadow,
          block.shape.highlight
        );


        // Clear completed lines
        const {
          newGrid: clearedGrid,
          newColorGrid: clearedColorGrid,
          linesCleared,
          clearedRows,
          clearedCols,
        } = clearCompletedLines(newGrid, newColorGrid);
        // Calculate score
        const blockSize = getBlockSize(block.shape.pattern);
        const scoreGained = calculateScore(blockSize, linesCleared);

        // Show score popup animation
        if (scoreGained > 0) {
          setScoreGain(scoreGained);
          setShowScorePopup(true);


          soundEnabled && playerSound('addScore');
          // Hide popup after animation
          setTimeout(() => {
            setShowScorePopup(false);
          }, 1000);
        }else{
          soundEnabled && playerSound('endDrag');
        }

        // If lines were cleared, show clearing animation
        if (linesCleared > 0) {
          setClearingRows(clearedRows);
          setClearingCols(clearedCols);

          // Clear the animation after a short delay
          setTimeout(() => {
            setClearingRows([]);
            setClearingCols([]);
          }, 500);
        }

        // Remove the used block
        const remainingBlocks = prevState.currentBlocks.filter(
          (b) => b.id !== blockId
        );

        // Generate new blocks if all current blocks are used
        let nextBlocks = remainingBlocks;
        if (remainingBlocks.length === 0) {
          const newBlockShapes = generateRandomBlocks(3);
          nextBlocks = newBlockShapes.map((shape, index) => ({
            id: `block-${Date.now()}-${index}`,
            shape,
            position: null,
          }));
        }

        // Check if game is over
        const isGameOver = !canPlaceAnyBlock(
          clearedGrid,
          nextBlocks.map((b) => b.shape)
        );

        const newScore = prevState.score + scoreGained;

        // Trigger success haptic
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Clear preview and selection
        setPreviewPosition(null);
        setPreviewPattern(null);
        setPreviewColor(null);
        setSelectedBlockId(null);

        // Return updated state
        return {
          grid: clearedGrid,
          colorGrid: clearedColorGrid,
          score: newScore,
          currentBlocks: nextBlocks,
          gameOver: isGameOver,
          highScore: Math.max(prevState.highScore, newScore),
        };
      });
    },
    [gridLayout, soundEnabled]
  );

  const handleGridLayout = useCallback(
    (x: number, y: number, cellSize: number) => {
      setGridLayout({ x, y, cellSize });
    },
    []
  );

  const updatePreview = useCallback(
    (position: Position) => {
      if (!selectedBlockId) return;

      setGameState((prevState) => {
        const block = prevState.currentBlocks.find(
          (b) => b.id === selectedBlockId
        );
        if (
          block &&
          canPlaceBlock(prevState.grid, block.shape.pattern, position)
        ) {
          setPreviewPosition(position);
        } else {
          setPreviewPosition(null);
        }
        return prevState;
      });
    },
    [selectedBlockId]
  );

  const handleGridPress = useCallback(
    (row: number, col: number) => {
      if (!selectedBlockId) return;

      setGameState((prevState) => {
        if (prevState.gameOver) return prevState;

        const position: Position = { row, col };
        const block = prevState.currentBlocks.find(
          (b) => b.id === selectedBlockId
        );

        if (
          !block ||
          !canPlaceBlock(prevState.grid, block.shape.pattern, position)
        ) {
          return prevState;
        }

        // Place the block
        let newGrid = placeBlock(prevState.grid, block.shape.pattern, position);
        let newColorGrid = placeBlockColor(
          prevState.colorGrid,
          block.shape.pattern,
          position,
          block.shape.shadow,
          block.shape.highlight
        );

        // Clear completed lines
        const {
          newGrid: clearedGrid,
          newColorGrid: clearedColorGrid,
          linesCleared,
          clearedRows,
          clearedCols,
        } = clearCompletedLines(newGrid, newColorGrid);

        // Calculate score
        const blockSize = getBlockSize(block.shape.pattern);
        const scoreGained = calculateScore(blockSize, linesCleared);

        // Show score popup animation
        if (scoreGained > 0) {
          setScoreGain(scoreGained);
          setShowScorePopup(true);

          // Hide popup after animation
          setTimeout(() => {
            setShowScorePopup(false);
          }, 1000);
        }

        // If lines were cleared, show clearing animation
        if (linesCleared > 0) {
          setClearingRows(clearedRows);
          setClearingCols(clearedCols);

          // Clear the animation after a short delay
          setTimeout(() => {
            setClearingRows([]);
            setClearingCols([]);
          }, 500);
        }

        // Remove the used block
        const remainingBlocks = prevState.currentBlocks.filter(
          (b) => b.id !== selectedBlockId
        );

        // Generate new blocks if all current blocks are used
        let nextBlocks = remainingBlocks;
        if (remainingBlocks.length === 0) {
          const newBlockShapes = generateRandomBlocks(3);
          nextBlocks = newBlockShapes.map((shape, index) => ({
            id: `block-${Date.now()}-${index}`,
            shape,
            position: null,
          }));
        }

        // Check if game is over
        const isGameOver = !canPlaceAnyBlock(
          clearedGrid,
          nextBlocks.map((b) => b.shape)
        );

        const newScore = prevState.score + scoreGained;

        // Clear preview and selection
        setPreviewPosition(null);
        setPreviewPattern(null);
        setPreviewColor(null);
        setSelectedBlockId(null);

        // Return updated state
        return {
          grid: clearedGrid,
          colorGrid: clearedColorGrid,
          score: newScore,
          currentBlocks: nextBlocks,
          gameOver: isGameOver,
          highScore: Math.max(prevState.highScore, newScore),
        };
      });
    },
    [selectedBlockId]
  );

  // Assist: change all current blocks to new random shapes (single-use)
  const assistChangeBlock = useCallback(() => {
    if (assistsUsed.changeBlock) return;
    setGameState((prev) => {
      const count = prev.currentBlocks.length > 0 ? prev.currentBlocks.length : 3;
      const newShapes = generateRandomBlocks(count);
      const nextBlocks = newShapes.map((shape, i) => ({
        id: `block-${Date.now()}-${i}`,
        shape,
        position: null,
      }));
      playerSound && soundEnabled && playerSound('startDrag');
      return { ...prev, currentBlocks: nextBlocks };
    });
    setAssistsUsed((prev) => ({ ...prev, changeBlock: true }));
  }, [assistsUsed.changeBlock, playerSound, soundEnabled]);

  // Assist: enter remove-mode so the user can pick a cell with the hammer (single-use)
  const assistRemoveOneCell = useCallback(() => {
    if (assistsUsed.removeCell) return;
    // start remove-mode (must be implemented elsewhere in this hook)
    startRemoveMode();
    setAssistsUsed((prev) => ({ ...prev, removeCell: true }));
  }, [assistsUsed.removeCell]);

  // derived flags for UI
  const canUseChangeBlock = !assistsUsed.changeBlock;
  const canUseRemoveCell = !assistsUsed.removeCell;
  const bothAssistsUsed = assistsUsed.changeBlock && assistsUsed.removeCell;

  return {
    gameState,
    previewPosition,
    previewPattern,
    previewColor,
    selectedBlockId,
    clearingRows,
    clearingCols,
    scoreGain,
    showScorePopup,
    handleBlockSelect,
    handleDragUpdate,
    handleDragEnd,
    handleGridLayout,
    updatePreview,
    handleGridPress,
    resetGame,
    assistChangeBlock,
    assistRemoveOneCell,
    // remove / hammer API
    removeMode,
    hammerCell,
    handleHammerMove,
    cancelRemoveMode,
    // expose assist flags
    canUseChangeBlock,
    canUseRemoveCell,
    bothAssistsUsed,
  };
 };
