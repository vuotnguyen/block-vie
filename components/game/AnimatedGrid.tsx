import { useAppContext } from '@/app/AppProvider';
import { Colors } from '@/constants/colors';
import { ColorGrid, Grid } from '@/types/game';
import { GRID_SIZE } from '@/utils/gameLogic';
import React, { useEffect, useMemo, useRef } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming
} from 'react-native-reanimated';

interface AnimatedGridProps {
  grid: Grid;
  colorGrid: ColorGrid;
  previewPosition?: { row: number; col: number } | null;
  previewPattern?: number[][] | null;
  previewColor?: string;
  highlightedRows?: number[];
  highlightedCols?: number[];
  clearingRows?: number[];
  clearingCols?: number[];
  onLayout?: (x: number, y: number, cellSize: number) => void;
}

const { width } = Dimensions.get('window');
export const CELL_SIZE_GRID = Math.min((width - 40) / GRID_SIZE, 50);

const AnimatedCell: React.FC<{
  isOccupied: boolean;
  isPreview: boolean;
  cellColorHighlight?: string;
  cellColorShadow?: string;
  previewColor?: string;
  isClearing: boolean;
  theme: 'light' | 'dark';
}> = ({ isOccupied, isPreview, cellColorHighlight, cellColorShadow, previewColor, isClearing, theme }) => {
  const themeColors = Colors[theme];

  const baseStyle = useMemo(() => {
  if (isOccupied && cellColorHighlight && cellColorShadow) {
    return {
      borderTopColor: cellColorHighlight,
      borderRightColor: cellColorShadow,
      borderTopWidth: CELL_SIZE_GRID,
      borderRightWidth: CELL_SIZE_GRID,
      borderBottomColor: 'transparent',
      borderLeftColor: 'transparent',
    };
  }

  return {
    backgroundColor: themeColors.cellEmpty,
    opacity: 1,
    transform: [{ scale: 1 }],
  };
}, [isOccupied, cellColorHighlight, cellColorShadow, theme]);

const clearing = useSharedValue(0);

useEffect(() => {
  if (isClearing) {
    clearing.value = 1;
  }
  else{
    clearing.value = 0;
  }
}, [isClearing]);

const animatedStyle = useAnimatedStyle(() => {
  if (clearing.value === 1) {
    return {
      opacity: withSequence(
        withTiming(1, { duration: 100 }),
        withTiming(0.5, { duration: 200 }),
        withTiming(0, { duration: 200 })
      ),
      transform: [
        {
          scale: withSequence(
            withTiming(1.2, { duration: 100 }),
            withTiming(0.8, { duration: 400 })
          ),
        },
      ],
    };
  }
  if (isPreview) { 
    return { 
      backgroundColor: previewColor || themeColors.cellPreview, 
      opacity: withSpring(0.7), transform: [{ scale: withSpring(0.95) }], 
    }; 
  }

  return { 
    backgroundColor: themeColors.cellEmpty, 
    opacity: 1, 
    transform: [{ scale: 1 }], 
  };
});
  return <Animated.View style={[styles.cell, baseStyle, animatedStyle ,{ borderColor: themeColors.gridBorder }]} />;
};

export const AnimatedGrid: React.FC<AnimatedGridProps> = ({
  grid,
  colorGrid,
  previewPosition,
  previewPattern,
  previewColor,
  clearingRows = [],
  clearingCols = [],
  onLayout,
}) => {
  const { theme } = useAppContext();
  const themeColors = Colors[theme];
  const gridRef = useRef<View>(null);

  const handleLayout = () => {
    gridRef.current?.measureInWindow((x, y, width, height) => {
      onLayout?.(x, y + 4, CELL_SIZE_GRID);
    });
  };

  const isPreviewCell = (row: number, col: number): boolean => {
    if (!previewPosition || !previewPattern) return false;
    const relativeRow = row - previewPosition.row;
    const relativeCol = col - previewPosition.col;
    if (
      relativeRow >= 0 &&
      relativeRow < previewPattern.length &&
      relativeCol >= 0 &&
      relativeCol < previewPattern[0].length
    ) {
      return previewPattern[relativeRow][relativeCol] === 1;
    }
    return false;
  };

  return (
    <View
      ref={gridRef}
      style={[
        styles.container,
        {
          borderColor: themeColors.gridBorder,
          backgroundColor: themeColors.gridBackground,
          shadowColor: themeColors.black,
        },
      ]}
      onLayout={handleLayout}
    >
      {grid.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((cell, colIndex) => {
            const isPreview = isPreviewCell(rowIndex, colIndex);
            const isOccupied = cell === 1;
            const cellColor = colorGrid[rowIndex][colIndex];
            const isClearing = clearingRows.includes(rowIndex) || clearingCols.includes(colIndex);
            return (
              <AnimatedCell
                key={colIndex}
                isOccupied={isOccupied}
                isPreview={isPreview}
                cellColorHighlight={cellColor?.highlight}
                cellColorShadow={cellColor?.shadow}
                previewColor={previewColor}
                isClearing={isClearing}
                theme={theme}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 3,
    borderRadius: 12,
    padding: 4,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 16,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: CELL_SIZE_GRID,
    height: CELL_SIZE_GRID,
    borderWidth: 0.5,
    borderRadius: 2,
  },
});
