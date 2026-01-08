
import { sounds } from '@/assets';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAudioPlayer } from 'expo-audio';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

type ThemeType = 'light' | 'dark';
type DifficultyType = 'easy' | 'medium' | 'hard';
type StateSound = 'addScore' | 'gameOver' | 'startDrag' | 'endDrag';

interface AppState {
	sound: boolean;
	theme: ThemeType;
	difficulty: DifficultyType;
	bestScore: number;
}

interface AppContextProps {
	soundEnabled: boolean;
	setSoundEnabled: (val: boolean) => void;
	theme: ThemeType;
	setTheme: (val: ThemeType) => void;
	difficulty: DifficultyType;
	setDifficulty: (val: DifficultyType) => void;
	bestScore: number;
	setBestScore: (val: number) => void;
	playerSound: (stateSound: StateSound) => void;
}

const initialState: AppState = {
	sound: true,
	theme: 'light',
	difficulty: 'easy',
	bestScore: 0,
};

const STORAGE_KEY = 'APP_SETTINGS';

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
	const [soundEnabled, setSoundEnabled] = useState(initialState.sound);
	const [theme, setTheme] = useState<ThemeType>(initialState.theme);
	const [difficulty, setDifficulty] = useState<DifficultyType>(initialState.difficulty);
	const [bestScore, setBestScore] = useState(initialState.bestScore);
	const [isLoaded, setIsLoaded] = useState(false);
	const playSoundStartPlayer = useAudioPlayer(sounds.startDrag);
	const playSoundEndPlayer = useAudioPlayer(sounds.endDrag);
	const playSoundAddScorePlayer = useAudioPlayer(sounds.addScore);
	const playSoundGameOverPlayer = useAudioPlayer(sounds.gameOver);

	// Load settings from storage on mount
	useEffect(() => {
		(async () => {
			try {
				const data = await AsyncStorage.getItem(STORAGE_KEY);
				if (data) {
					const parsed: AppState = JSON.parse(data);
					setSoundEnabled(parsed.sound);
					setTheme(parsed.theme);
					setDifficulty(parsed.difficulty);
					setBestScore(parsed.bestScore);
				}
			} catch (e) {
				// ignore error, use default
			} finally {
				setIsLoaded(true);
			}
		})();
	}, []);

	// Save settings to storage when any changes
	useEffect(() => {
		if (!isLoaded) return;
		const state: AppState = {
			sound: soundEnabled,
			theme,
			difficulty,
			bestScore,
		};
		AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
		console.log('set lai enable ', soundEnabled);
		
	}, [soundEnabled, theme, difficulty, bestScore, isLoaded]);

	const playerSound = async (stateSound: StateSound) => {
		switch (stateSound) {
			case 'startDrag':
				playSoundStartPlayer.seekTo(0);
				playSoundStartPlayer.play();
				break;
			case 'endDrag':
				console.log('end drag from provider');
				playSoundEndPlayer.seekTo(0);
				playSoundEndPlayer.play();
				break;
			case 'addScore':
				playSoundAddScorePlayer.seekTo(0);
				playSoundAddScorePlayer.play();
				break;
			case 'gameOver':
				playSoundGameOverPlayer.seekTo(0);	
				playSoundGameOverPlayer.play();
				break;
			default:
				break;
		}
	}

	return (
		<AppContext.Provider
			value={{
				soundEnabled,
				setSoundEnabled,
				theme,
				setTheme,
				difficulty,
				setDifficulty,
				bestScore,
				setBestScore,
				playerSound,
			}}
		>
			{children}
		</AppContext.Provider>
	);
};

export const useAppContext = () => {
	const ctx = useContext(AppContext);
	if (!ctx) throw new Error('useAppContext must be used within AppProvider');
	return ctx;
};
