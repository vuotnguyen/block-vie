import { useAppContext } from '@/app/AppProvider';
import { icons } from '@/assets';
import { Colors } from '@/constants/colors';
import { useGameState } from '@/hooks/useGameState';
import React, { useEffect, useState } from 'react';
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { AnimatedGrid, CELL_SIZE_GRID } from './AnimatedGrid';
import { DraggableBlock } from './DraggableBlock';
import ModalHelp from './ModalHelp';
import ModalSetting from './ModalSetting';

export const BlockBlastGame: React.FC = () => {
  const { theme, soundEnabled, setSoundEnabled, difficulty, setDifficulty, bestScore, setBestScore, playerSound } = useAppContext();
  const themeColors = Colors[theme];
  const styles = getStyles(themeColors);
  const [showSettings, setShowSettings] = useState(false);

  const [fontColor, setFontColor] = useState('black');


  const {
    gameState,
    previewPosition,
    previewPattern,
    previewColor,
    clearingRows,
    clearingCols,
    scoreGain,
    showScorePopup,
    handleBlockSelect,
    handleDragUpdate,
    handleDragEnd,
    handleGridLayout,
    resetGame,
    assistChangeBlock,
    assistRemoveOneCell,
    // new remove/hammer API
    removeMode,
    hammerCell,
    handleHammerMove,
    cancelRemoveMode,
    // assist usage flags
    canUseChangeBlock,
    canUseRemoveCell,
    bothAssistsUsed,
  } = useGameState(difficulty);

  const [showHelp, setShowHelp] = useState(false);

  // const [key, setKey] = useState(0);
  // const [isPlaying, setIsPlaying] = useState(false);

  // const start = () => setIsPlaying(true);
  // const pause = () => setIsPlaying(false);
  // const reset = () => {
  //   setIsPlaying(true);
  //   setKey(k => k + 1);
  // };

  useEffect(() => {
    soundEnabled && gameState.gameOver == true && playerSound('gameOver');
  }, [gameState.gameOver, soundEnabled]);

  const scorePopupStyle = useAnimatedStyle(() => {
    if (showScorePopup) {
      return {
        opacity: withSequence(
          withTiming(1, { duration: 200 }),
          withTiming(1, { duration: 400 }),
          withTiming(0, { duration: 400 })
        ),
        transform: [
          {
            translateY: withSequence(
              withTiming(0, { duration: 200 }),
              withTiming(-50, { duration: 800 })
            )
          },
          {
            scale: withSequence(
              withSpring(1.5, { damping: 8 }),
              withSpring(1, { damping: 10 })
            )
          }
        ],
      };
    }
    return {
      opacity: 0,
      transform: [{ translateY: 0 }, { scale: 1 }],
    };
  });

  // Xác định màu nền theo theme
  let backgroundColor = themeColors.background;

  // function handleSetDifficulty(level: string) {
  //   setDifficulty(level);
  // }
  function handleResetGame() {
    // reset()
    resetGame();
  }
  function isPreviewScoring() {
    if (!previewPosition || !previewPattern) return false;
    return false;
  }
  const highlightPreview = isPreviewScoring();

  // Heartbeat animation
  const heartScale = useSharedValue(1);
  const heartBeatStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));
  useEffect(() => {
    if (bothAssistsUsed) {
      // stop animation and reset scale
      heartScale.value = withTiming(1, { duration: 200 });
      return;
    }
    // 1s cycle: 500ms up, 500ms down
    heartScale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 500 }),
        withTiming(1.0, { duration: 500 })
      ),
      -1,
      false
    );
  }, [bothAssistsUsed, heartScale]);

  return (
    <GestureHandlerRootView style={[styles.container, { backgroundColor }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header with Score và Setting */}
        <View style={styles.header}>
          <View style={styles.scoreContainer}>
            <Text style={[styles.scoreLabel, { color: themeColors.fontBlack }]}>Score</Text>
            <Text style={[styles.scoreValue, { color: themeColors.fontBlack }]}>{gameState.score}</Text>
          </View>
          <View style={styles.scoreContainer}>
            <Text style={[styles.scoreLabel, { color: themeColors.fontBlack }]}>Best</Text>
            <Text style={[styles.scoreValue, { color: themeColors.fontBlack }]}>{bestScore}</Text>
          </View>
          <TouchableOpacity style={styles.settingButton} onPress={() => setShowSettings(true)}>
            <Image
              source={icons.setting}
              style={{ width: 44, height: 44,  }}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        {/* Game Grid */}
        <View style={styles.gridWrapper}>
          <AnimatedGrid
            grid={gameState.grid}
            colorGrid={gameState.colorGrid}
            previewPosition={previewPosition}
            previewPattern={previewPattern}
            previewColor={previewColor || undefined}
            clearingRows={clearingRows}
            clearingCols={clearingCols}
            onLayout={handleGridLayout}
          />
          {/* Score Popup Animation */}
          {showScorePopup && (
            <Animated.View style={[styles.scorePopup, scorePopupStyle]}>
              <Text style={styles.scorePopupText}>+{scoreGain}</Text>
            </Animated.View>
          )}

          {/* Hammer remove-mode overlay */}
          {removeMode && (
            <View style={styles.hammerOverlay} pointerEvents="box-none">
              <View
                style={styles.hammerTouchArea}
                // capture touches/moves and forward page coords to handler
                onStartShouldSetResponder={() => true}
                onMoveShouldSetResponder={() => true}
                onResponderMove={(e) => handleHammerMove(e.nativeEvent.pageX, e.nativeEvent.pageY)}
                onResponderGrant={(e) => handleHammerMove(e.nativeEvent.pageX, e.nativeEvent.pageY)}
                onResponderRelease={() => {}}
              >
                {hammerCell && (
                  <View
                    style={[
                      styles.hammerIcon,
                      {
                        left: hammerCell.col * CELL_SIZE_GRID + 4,
                        top: hammerCell.row * CELL_SIZE_GRID + 4,
                      },
                    ]}
                  >
                    <Text style={styles.hammerText}>🔨</Text>
                  </View>
                )}
                <TouchableOpacity style={styles.cancelHammer} onPress={() => cancelRemoveMode()}>
                  <Text style={styles.cancelHammerText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Instructions */}
        {!gameState.gameOver && (
          <Text style={[styles.instructions, { color: themeColors.fontBlack }]}>Drag and drop blocks into the grid</Text>
        )}

        {/* Block Pieces */}
        <View style={styles.blocksContainer}>
          {gameState.currentBlocks.map((block) => (
            <DraggableBlock
              key={block.id}
              blockId={block.id}
              block={block.shape}
              onDragStart={handleBlockSelect}
              onDragUpdate={handleDragUpdate}
              onDragEnd={handleDragEnd}
              disabled={gameState.gameOver}
              gridPosition={{ x: 0, y: 0 }}
              gridCellSize={CELL_SIZE_GRID}
            />
          ))}
        </View>

        {/* Reset Button */}
        <View style={{ alignItems: 'center', 
          flexDirection: 'row', justifyContent: 'center' }}>
          {/* <CountdownCircleTimer
            key = {key}
            isPlaying = {isPlaying}
            duration={20}
            colors={['#f8ec14ff', '#F7B801', '#A30000', '#A30000']}
            colorsTime={[7, 5, 2, 0]}
            size={60}
          >
            {({ remainingTime }) => <Text>{remainingTime}</Text>}
          </CountdownCircleTimer> */}
          <TouchableOpacity
            style={[styles.helpButton, bothAssistsUsed && { opacity: 0.4 }]}
            onPress={() => !bothAssistsUsed && setShowHelp(true)}
            disabled={bothAssistsUsed}
          >
             <Animated.Image
               source={icons.heart}
               style={[styles.heartIcon, heartBeatStyle]}
               resizeMode="contain"
               accessibilityLabel="Help"
             />
           </TouchableOpacity>
          <TouchableOpacity style={styles.resetButton} onPress={handleResetGame}>
            <Text style={styles.resetButtonText}>New Game</Text>
          </TouchableOpacity>
          
        </View>

      </ScrollView>

      <ModalSetting showSetting={showSettings} onClose={() => setShowSettings(false)} />
      <ModalHelp
        showSetting={showHelp}
        onClose={() => setShowHelp(false)}
         changeBlock={
           () => {
             assistChangeBlock();
             setShowHelp(false);
           }
         }
         removeCell={
           () => {
             assistRemoveOneCell();
             setShowHelp(false);
           }
         }
        disableChange={!canUseChangeBlock}
        disableRemove={!canUseRemoveCell}
       />
      {/* Game Over Modal */}
      <Modal
        visible={gameState.gameOver}
        transparent
        animationType="fade"
        onRequestClose={() => { }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.settingModalBox}>
            <Text style={styles.gameOverTitle}>Game Over!</Text>
            <Text style={styles.finalScore}>Final Score: {gameState.score}</Text>
            {gameState.score === gameState.highScore && gameState.score > 0 && (
              <Text style={styles.newRecord}>New Record!</Text>
            )}
            <TouchableOpacity style={styles.playAgainButton} onPress={() => {
              (gameState.score > bestScore) && setBestScore(gameState.score);
              resetGame();
            }}>
              <Text style={styles.playAgainButtonText}>Play Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </GestureHandlerRootView>
  );
};

const getStyles = (themeColors: typeof Colors['light']) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.background,
  },
  scrollContent: {
    padding: 20,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  scoreContainer: {
    alignItems: 'center',
    backgroundColor: themeColors.gridBackground,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 12,
    minWidth: 120,
    borderWidth: 2,
    borderColor: themeColors.gridBorder,
  },
  scoreLabel: {
    fontSize: 14,
    color: themeColors.fontGray,
    marginBottom: 5,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: themeColors.scoreGold,
  },
  gridWrapper: {
    marginBottom: 20,
    position: 'relative',
  },
  scorePopup: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
    backgroundColor: 'rgba(255, 217, 61, 0.95)', // giữ nguyên vì là màu động
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: themeColors.shadowGold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 12,
    borderWidth: 3,
    borderColor: themeColors.white,
  },
  scorePopupText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: themeColors.gridBackground,
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  instructions: {
    color: themeColors.fontGray,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500',
  },
  blocksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
    paddingVertical: 20,
    backgroundColor: themeColors.gridBackground,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: themeColors.gridBorder,
  },
  resetButton: {
    backgroundColor: themeColors.buttonBg,
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 12,
    marginTop: 10,
    shadowColor: themeColors.shadowCyan,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  resetButtonText: {
    color: themeColors.buttonText,
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingModalBox: {
    width: 320,
    backgroundColor: '#F9EEDB',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#A97B50',
    shadowColor: '#A97B50',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 16,
  },

  gameOverTitle: {
    fontSize: 42,
    fontWeight: 'bold',
    color: themeColors.modalTitle,
    marginBottom: 20,
  },
  finalScore: {
    fontSize: 28,
    color: themeColors.modalScore,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  newRecord: {
    fontSize: 20,
    color: themeColors.modalRecord,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  playAgainButton: {
    backgroundColor: themeColors.buttonBg,
    paddingHorizontal: 50,
    paddingVertical: 18,
    borderRadius: 12,
    marginTop: 10,
    shadowColor: themeColors.shadowCyan,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  playAgainButtonText: {
    color: themeColors.buttonText,
    fontSize: 20,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  settingButton: {
    // backgroundColor: themeColors.scoreGold,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 12,
    alignSelf: 'center',
  },
  settingButtonText: {
    color: themeColors.buttonText,
    fontWeight: 'bold',
    fontSize: 16,
  },
  helpButton: {
    // backgroundColor: themeColors.buttonBg,
    position: "absolute",
    bottom: 0,
    left: -70,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },
  heartIcon: {
    width: 28,
    height: 28,
  },
  helpButtonText: {
    color: themeColors.buttonText,
    fontWeight: 'bold',
    fontSize: 20,
  },
  settingLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 18,
    marginBottom: 8,
    color: themeColors.scoreGold,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  colorOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: themeColors.scoreGold,
    marginHorizontal: 6,
    backgroundColor: themeColors.optionBg,
  },
  colorOptionSelected: {
    backgroundColor: themeColors.scoreGold,
  },
  difficultyOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: themeColors.scoreGold,
    marginHorizontal: 6,
    backgroundColor: themeColors.optionBg,
  },
  difficultyOptionSelected: {
    backgroundColor: themeColors.scoreGold,
  },
  closeButton: {
    backgroundColor: themeColors.buttonBg,
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 12,
    marginTop: 20,
    shadowColor: themeColors.shadowCyan,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  hammerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
  },
  hammerTouchArea: {
    flex: 1,
  },
  hammerIcon: {
    position: 'absolute',
    width: CELL_SIZE_GRID - 8,
    height: CELL_SIZE_GRID - 8,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 60,
    elevation: 60,
  },
  hammerText: {
    fontSize: 28,
    textAlign: 'center',
  },
  cancelHammer: {
    position: 'absolute',
    right: 8,
    top: 8,
    backgroundColor: themeColors.buttonBg,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    zIndex: 70,
  },
  cancelHammerText: {
    color: themeColors.buttonText,
    fontWeight: '600',
  },
});

const styles = StyleSheet.create({

});