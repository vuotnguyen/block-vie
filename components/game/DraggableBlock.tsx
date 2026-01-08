import { useAppContext } from '@/app/AppProvider';
import { Colors } from '@/constants/colors';
import { BlockShape } from '@/types/game';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from 'react-native-reanimated';


interface DraggableBlockProps {
  block: BlockShape;
  blockId: string;
  onDragStart?: (blockId: string) => void;
  onDragUpdate?: (blockId: string, x: number, y: number) => void;
  onDragEnd?: (blockId: string, x: number, y: number) => void;
  disabled?: boolean;
  gridPosition: { x: number; y: number };
  gridCellSize: number;
}

const { width } = Dimensions.get('window');
export const CELL_SIZE = Math.min((width - 200) / 12, 30);

export const DraggableBlock: React.FC<DraggableBlockProps> = ({
  block,
  blockId,
  onDragStart,
  onDragUpdate,
  onDragEnd,
  disabled = false,
  gridPosition,
  gridCellSize,
}) => {
  const { theme } = useAppContext();
  const themeColors = Colors[theme];
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const scale = useSharedValue(1);
  const zIndex = useSharedValue(0);

  const row = block.pattern.length;
  const col = block.pattern[0].length;

  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const gesture = Gesture.Pan()
    .enabled(!disabled)
    .onStart((event) => {

      startX.value = event.x;
      startY.value = event.y;

      // runOnJS(triggerHaptic)();
      scale.value = withSpring(1.2);
      zIndex.value = 1000;
      if (onDragStart) {
        runOnJS(onDragStart)(blockId);
      }
    })
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY - 100;

      scale.value = withSpring(2.5);
      if (onDragUpdate) {

        if (col == 3 && row == 2) {
          runOnJS(onDragUpdate)(blockId,
            event.absoluteX - startX.value + ((CELL_SIZE * 4 - (col * CELL_SIZE)) / 2) - 25,
            event.absoluteY - startY.value + ((CELL_SIZE * 4 - (row * CELL_SIZE)) / 2) - 25 - 100);
        }
        if (col == 2 && row == 3) {
          runOnJS(onDragUpdate)(blockId,
            event.absoluteX - startX.value + ((CELL_SIZE * 4 - (col * CELL_SIZE)) / 2) - 30,
            event.absoluteY - startY.value + ((CELL_SIZE * 4 - (row * CELL_SIZE)) / 2) - 50 - 100);
        }
        if (col == 1 && row == 3) {
          runOnJS(onDragUpdate)(blockId,
            event.absoluteX - startX.value + ((CELL_SIZE * 4 - (col * CELL_SIZE)) / 2),
            event.absoluteY - startY.value + ((CELL_SIZE * 4 - (row * CELL_SIZE)) / 2) - 50 - 100);
        }
        if (col == 3 && row == 1) {
          runOnJS(onDragUpdate)(blockId,
            event.absoluteX - startX.value + ((CELL_SIZE * 4 - (col * CELL_SIZE)) / 2) - 30,
            event.absoluteY - startY.value + ((CELL_SIZE * 4 - (row * CELL_SIZE)) / 2) - 30 - 100);
        }
        if (col == row) {
          runOnJS(onDragUpdate)(blockId,
            event.absoluteX - startX.value + ((CELL_SIZE * 4 - (col * CELL_SIZE)) / 2) - 30,
            event.absoluteY - startY.value + ((CELL_SIZE * 4 - (row * CELL_SIZE)) / 2) - 30 - 100);
        }
      }
    })
    .onEnd((event) => {
      if (onDragEnd) {

        if (col == 3 && row == 2) {
          runOnJS(onDragEnd)(blockId,
            event.absoluteX - startX.value + ((CELL_SIZE * 4 - (col * CELL_SIZE)) / 2) - 25,
            event.absoluteY - startY.value + ((CELL_SIZE * 4 - (row * CELL_SIZE)) / 2) - 25 - 100);
        }
        if (col == 2 && row == 3) {
          runOnJS(onDragEnd)(blockId,
            event.absoluteX - startX.value + ((CELL_SIZE * 4 - (col * CELL_SIZE)) / 2) - 30,
            event.absoluteY - startY.value + ((CELL_SIZE * 4 - (row * CELL_SIZE)) / 2) - 50 - 100);
        }
        if (col == 1 && row == 3) {
          runOnJS(onDragEnd)(blockId,
            event.absoluteX - startX.value + ((CELL_SIZE * 4 - (col * CELL_SIZE)) / 2),
            event.absoluteY - startY.value + ((CELL_SIZE * 4 - (row * CELL_SIZE)) / 2) - 50 - 100);
        }
        if (col == 3 && row == 1) {
          runOnJS(onDragEnd)(blockId,
            event.absoluteX - startX.value + ((CELL_SIZE * 4 - (col * CELL_SIZE)) / 2) - 30,
            event.absoluteY - startY.value + ((CELL_SIZE * 4 - (row * CELL_SIZE)) / 2) - 30 - 100);
        }
        if (col == row) {
          runOnJS(onDragEnd)(blockId,
            event.absoluteX - startX.value + ((CELL_SIZE * 4 - (col * CELL_SIZE)) / 2) - 30,
            event.absoluteY - startY.value + ((CELL_SIZE * 4 - (row * CELL_SIZE)) / 2) - 30 - 100);
        }
      }
      // Reset position with animation
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
      scale.value = withSpring(1);
      zIndex.value = 0;
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    zIndex: zIndex.value,
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.container, animatedStyle]}>
        <View style={styles.blockContainer}>
          {block.pattern.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.row}>
              {row.map((cell, colIndex) => (

                <View key={colIndex} style={{
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                  position: "relative",
                }}>


                  <View style={[cell === 1 && styles.topRight, {
                    borderTopColor: block.highlight, // highlight
                    borderRightColor: block.shadow,
                  }]} />
                </View>
              ))}
            </View>
          ))}
        </View>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CELL_SIZE * 4,
    height: CELL_SIZE * 4,
    justifyContent: 'center',
    alignItems: 'center',
  },


  topRight: {
    position: "absolute",
    right: 0,
    top: 0,
    width: 0,
    height: 0,
    borderStyle: "solid",
    borderTopWidth: CELL_SIZE,
    borderRightWidth: CELL_SIZE,
    // borderTopColor: "#FFE680", // highlight
    // borderRightColor: "#FFB703",
    borderBottomColor: "transparent",
    borderLeftColor: "transparent",
    // shadowColor: themeColors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  blockContainer: {
    borderRadius: 4,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    // margin: 1,
    borderRadius: 4,
  },
  // cellActive: handled inline for theme
});