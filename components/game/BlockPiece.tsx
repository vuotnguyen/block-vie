import { useAppContext } from '@/app/AppProvider';
import { Colors } from '@/constants/colors';
import { BlockShape } from '@/types/game';
import React from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';

interface BlockPieceProps {
  block: BlockShape;
  onPress?: () => void;
  disabled?: boolean;
  isSelected?: boolean;
}

const { width } = Dimensions.get('window');
const CELL_SIZE = Math.min((width - 200) / 12, 30);

export const BlockPiece: React.FC<BlockPieceProps> = ({
  block,
  onPress,
  disabled = false,
  isSelected = false,
}) => {
  const { theme } = useAppContext();
  const themeColors = Colors[theme];
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      style={[styles.container, disabled && styles.disabled]}
    >
      <View style={[styles.blockContainer, isSelected && {
        transform: [{ scale: 1.15 }],
        borderWidth: 3,
        borderColor: themeColors.cellPreview,
        borderRadius: 8,
        padding: 2,
      }]}
      >
        {block.pattern.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((cell, colIndex) => (
              <View
                key={colIndex}
                style={[
                  styles.cell,
                  cell === 1 && {
                    backgroundColor: block.color,
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    shadowColor: themeColors.black,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 2,
                    elevation: 3,
                  },
                ]}
              />
            ))}
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blockContainer: {
    borderRadius: 4,
  },
  // blockSelected: handled inline for theme
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    margin: 1,
    borderRadius: 2,
  },
  // cellActive: handled inline for theme
  disabled: {
    opacity: 0.3,
  },
});
