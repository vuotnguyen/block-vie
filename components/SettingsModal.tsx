import { useGameSound } from '@/contexts/SoundContext';
import { useRouter } from 'expo-router';
import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ visible, onClose }) => {
  const router = useRouter();
  const { toggleBackgroundSound, backgroundSoundEnabled, togglePlaySound, playSoundEnabled } = useGameSound();

  const handleSound = () => {
    togglePlaySound();
  };

  const handleMusic = () => {
    toggleBackgroundSound();
  };

  const handleHelp = () => {
    // TODO: Implement help functionality
    console.log('Help pressed');
  };

  const handleHome = () => {
    onClose();
    router.push('/home');
  };

  const handleThemes = () => {
    // TODO: Implement themes functionality
    console.log('Themes pressed');
  };

  const handleAskFriends = () => {
    // TODO: Implement ask friends functionality
    console.log('Ask Friends pressed');
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.titleText}>SETTINGS</Text>
          </View>

          {/* Top Row - 4 Circular Buttons */}
          <View style={styles.topRow}>
            <Pressable style={styles.iconButton} onPress={handleSound}>
              <View style={[styles.iconCircle, playSoundEnabled ? styles.iconCircleActive : styles.iconCircleInactive]}>
                <Text style={styles.iconText}>🔊</Text>
              </View>
              <Text style={styles.iconLabel}>Sound</Text>
            </Pressable>

            <Pressable style={styles.iconButton} onPress={handleMusic}>
              <View style={[styles.iconCircle, backgroundSoundEnabled ? styles.iconCircleActive : styles.iconCircleInactive]}>
                <Text style={styles.iconText}>♪</Text>
              </View>
              <Text style={styles.iconLabel}>Music</Text>
            </Pressable>

            <Pressable style={styles.iconButton} onPress={handleHelp}>
              <View style={styles.iconCircleHelp}>
                <Text style={styles.iconTextHelp}>?</Text>
              </View>
              <Text style={styles.iconLabel}>Help</Text>
            </Pressable>

            <Pressable style={styles.iconButton} onPress={handleHome}>
              <View style={styles.iconCircleHome}>
                <Text style={styles.iconText}>⌂</Text>
              </View>
              <Text style={styles.iconLabel}>Home</Text>
            </Pressable>
          </View>

          {/* Middle Row - 2 Long Buttons */}
          <View style={styles.middleRow}>
            <Pressable style={styles.actionButton} onPress={handleThemes}>
              <Text style={styles.actionButtonIcon}>🎨</Text>
              <Text style={styles.actionButtonText}>Themes</Text>
            </Pressable>

            <Pressable style={styles.actionButton} onPress={handleAskFriends}>
              <Text style={styles.actionButtonIcon}>👥</Text>
              <Text style={styles.actionButtonText}>ASK FRIENDS</Text>
            </Pressable>
          </View>

          {/* Bottom - Back Button */}
          <Pressable style={styles.backButton} onPress={onClose}>
            <Text style={styles.backButtonIcon}>←</Text>
            <Text style={styles.backButtonText}>BACK</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#F5E6D3', // Light beige background
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  titleContainer: {
    backgroundColor: '#8B4513', // Brown
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 30,
    marginBottom: 24,
    width: '100%',
    alignItems: 'center',
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700', // Yellow
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  iconButton: {
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconCircleActive: {
    backgroundColor: '#4CAF50', // Vibrant green
  },
  iconCircleInactive: {
    backgroundColor: '#CCCCCC', // Gray when disabled
  },
  iconCircleHelp: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4CAF50', // Vibrant green
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconCircleHome: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2196F3', // Blue
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconText: {
    fontSize: 28,
    color: '#FFFFFF',
  },
  iconTextHelp: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  iconLabel: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  middleRow: {
    width: '100%',
    marginBottom: 20,
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#4CAF50', // Vibrant green
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  actionButtonIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  actionButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  backButton: {
    backgroundColor: '#F44336', // Red
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  backButtonIcon: {
    fontSize: 20,
    color: '#FFFFFF',
    marginRight: 12,
  },
  backButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

