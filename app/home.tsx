import { images } from '@/assets';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PATH } from '@/constants/routes';
import { useGameSound } from '@/contexts/SoundContext';
import { useRouter } from "expo-router";
import React from 'react';
import { ImageBackground, Pressable, StyleSheet } from 'react-native';


export default function Home() {
  const router = useRouter();
  const { toggleBackgroundSound, backgroundSoundEnabled, togglePlaySound, playSoundEnabled, playSound } = useGameSound();
  const onPlay = () => {
    router.replace(PATH.GAME);
  };

  const stopBackgroundSound = () => {
    toggleBackgroundSound();
  };

  const onTogglePlaySound = () => {
    togglePlaySound();
  };

  const onPlaySound = () => {
    playSound();
  };

  return (
    <ImageBackground
      source={images.backgroundImageHome}
      resizeMode="cover"
      style={styles.container}
    >
      <ThemedView style={[styles.overlay]}>
        <ThemedText type="title" style={styles.title}>
          Block Modern
        </ThemedText>
        <Pressable onPress={onPlaySound} style={styles.button}>
          <ThemedText type="defaultSemiBold">
            {'phat am thanh play game'}
          </ThemedText>
        </Pressable>
        <Pressable onPress={onTogglePlaySound} style={styles.button}>
          <ThemedText type="defaultSemiBold">
            {playSoundEnabled ? 'Tắt âm thanh hiệu ứng' : 'Bật âm thanh hiệu ứng'}
          </ThemedText>
        </Pressable>

        <Pressable onPress={stopBackgroundSound} style={styles.button}>
          <ThemedText type="defaultSemiBold">
            {backgroundSoundEnabled ? 'Tắt nhạc nền' : 'Bật nhạc nền'}
          </ThemedText>
        </Pressable>
        <Pressable onPress={onPlay} style={styles.button}>
          <ThemedText type="defaultSemiBold">Play Game</ThemedText>
        </Pressable>
      </ThemedView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFD700', // Gold color
    textAlign: 'center',
    textShadowColor: '#FF8C00', // Orange shadow
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 0,
    letterSpacing: 2,
    lineHeight: 60,
    // 3D effect with multiple shadows
    shadowColor: '#FF8C00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 10,
    marginBottom: 24,
  },
  button: {
    marginBottom: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#E6E6E6',
  },
});
