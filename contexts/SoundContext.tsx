import { sounds } from '@/assets';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AudioPlayer, createAudioPlayer } from 'expo-audio';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

const BACKGROUND_SOUND_STORAGE_KEY = 'background_sound';
const PLAY_SOUND_STORAGE_KEY = 'play_sound';
const STORAGE_DEBOUNCE_MS = 300; // Debounce AsyncStorage writes

interface SoundContextType {
  backgroundSoundEnabled: boolean;
  playSoundEnabled: boolean;
  toggleBackgroundSound: () => void;
  togglePlaySound: () => void;
  playSound: () => Promise<void>;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [backgroundSoundEnabled, setBackgroundSoundEnabled] = useState<boolean>(true);
  const [playSoundEnabled, setPlaySoundEnabled] = useState<boolean>(true);
  const backgroundSoundPlayerRef = useRef<AudioPlayer | null>(null);
  const playSoundPlayerRef = useRef<AudioPlayer | null>(null);
  const isInitializedRef = useRef<boolean>(false);
  const saveSettingsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load settings from AsyncStorage on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [backgroundSoundValue, playSoundValue] = await Promise.all([
          AsyncStorage.getItem(BACKGROUND_SOUND_STORAGE_KEY),
          AsyncStorage.getItem(PLAY_SOUND_STORAGE_KEY),
        ]);

        const backgroundSound = backgroundSoundValue !== null ? JSON.parse(backgroundSoundValue) : true;
        const playSound = playSoundValue !== null ? JSON.parse(playSoundValue) : true;

        setBackgroundSoundEnabled(backgroundSound);
        setPlaySoundEnabled(playSound);

        // Create audio players
        const backgroundSoundPlayer = createAudioPlayer(sounds.lacTroi);
        backgroundSoundPlayer.loop = true;
        backgroundSoundPlayerRef.current = backgroundSoundPlayer;

        const playSoundPlayer = createAudioPlayer(sounds.playSound);
        playSoundPlayerRef.current = playSoundPlayer;

        isInitializedRef.current = true;

        // Auto-play background sound if enabled
        if (backgroundSound && backgroundSoundPlayerRef.current) {
          backgroundSoundPlayerRef.current.play();
        }
      } catch (error) {
        // Silent error handling
      }
    };

    loadSettings();
  }, []);

  // Save settings to AsyncStorage when they change (debounced)
  useEffect(() => {
    if (!isInitializedRef.current) return;

    // Clear previous timeout
    if (saveSettingsTimeoutRef.current) {
      clearTimeout(saveSettingsTimeoutRef.current);
    }

    // Debounce AsyncStorage writes to avoid excessive I/O
    saveSettingsTimeoutRef.current = setTimeout(async () => {
      try {
        await Promise.all([
          AsyncStorage.setItem(BACKGROUND_SOUND_STORAGE_KEY, JSON.stringify(backgroundSoundEnabled)),
          AsyncStorage.setItem(PLAY_SOUND_STORAGE_KEY, JSON.stringify(playSoundEnabled)),
        ]);
      } catch (error) {
        // Silent error handling
      }
    }, STORAGE_DEBOUNCE_MS);

    // Cleanup timeout on unmount or dependency change
    return () => {
      if (saveSettingsTimeoutRef.current) {
        clearTimeout(saveSettingsTimeoutRef.current);
        saveSettingsTimeoutRef.current = null;
      }
    };
  }, [backgroundSoundEnabled, playSoundEnabled]);

  // Handle background sound state changes
  useEffect(() => {
    if (!isInitializedRef.current || !backgroundSoundPlayerRef.current) return;

    const player = backgroundSoundPlayerRef.current;

    if (backgroundSoundEnabled) {
      try {
        player.play();
      } catch (error) {
        // Silent error handling
      }
    } else {
      // Reset to beginning when turning off (like a user setting)
      player.pause();
      player.seekTo(0).catch(() => {
        // Silent error handling
      });
    }
  }, [backgroundSoundEnabled]);

  // Cleanup on unmount (only when app closes)
  useEffect(() => {
    return () => {
      // Clear debounce timeout
      if (saveSettingsTimeoutRef.current) {
        clearTimeout(saveSettingsTimeoutRef.current);
        saveSettingsTimeoutRef.current = null;
      }

      // Cleanup audio players
      if (backgroundSoundPlayerRef.current) {
        try {
          backgroundSoundPlayerRef.current.pause();
          backgroundSoundPlayerRef.current.remove();
        } catch (error) {
          // Silent error handling
        }
        backgroundSoundPlayerRef.current = null;
      }
      if (playSoundPlayerRef.current) {
        try {
          playSoundPlayerRef.current.pause();
          playSoundPlayerRef.current.remove();
        } catch (error) {
          // Silent error handling
        }
        playSoundPlayerRef.current = null;
      }
    };
  }, []);

  const toggleBackgroundSound = useCallback(() => {
    setBackgroundSoundEnabled((prev) => !prev);
  }, []);

  const togglePlaySound = useCallback(() => {
    setPlaySoundEnabled((prev) => !prev);
  }, []);

  const playSound = useCallback(async () => {
    if (!playSoundEnabled || !playSoundPlayerRef.current || !isInitializedRef.current) {
      return;
    }

    try {
      const player = playSoundPlayerRef.current;
      // Always seek to beginning to allow rapid successive plays
      await player.seekTo(0);
      player.play();
    } catch (error) {
      // Silent error handling
    }
  }, [playSoundEnabled]);

  // Memoize context value to prevent unnecessary re-renders
  const value: SoundContextType = useMemo(
    () => ({
      backgroundSoundEnabled,
      playSoundEnabled,
      toggleBackgroundSound,
      togglePlaySound,
      playSound,
    }),
    [backgroundSoundEnabled, playSoundEnabled, toggleBackgroundSound, togglePlaySound, playSound]
  );

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
};

export const useGameSound = (): SoundContextType => {
  const context = useContext(SoundContext);
  if (context === undefined) {
    throw new Error('useGameSound must be used within a SoundProvider');
  }
  return context;
};

