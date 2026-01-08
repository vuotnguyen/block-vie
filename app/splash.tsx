import { PATH } from '@/constants/routes';
import { useRouter } from 'expo-router';
import * as ExpoSplashScreen from 'expo-splash-screen';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

export default function SplashScreen() {
  const router = useRouter();
  const progress = useRef(new Animated.Value(0)).current;
  const stripeAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Hide native splash screen when custom splash is mounted
    ExpoSplashScreen.hideAsync();

    // Animate progress bar
    Animated.timing(progress, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: false,
    }).start();

    // Animate stripe pattern (continuous loop)
    Animated.loop(
      Animated.timing(stripeAnimation, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: false,
      })
    ).start();

    // Navigate to home after 2 seconds
    const timer = setTimeout(() => {
      router.replace(PATH.GAME);
    }, 2000);

    return () => clearTimeout(timer);
  }, [progress, stripeAnimation, router]);

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const stripeTranslateX = stripeAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 20],
  });

  return (
    <View
      // source={images.backgroundImageHome}
      // resizeMode="cover"
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>
          Block Classic
        </Text>
      </View>
      {/* Loading section */}
      <View style={styles.loadingSection}>
        <View style={styles.loadingBarContainer}>
          <View style={styles.loadingBarBackground}>
            <Animated.View
              style={[
                styles.loadingBarFill,
                {
                  width: progressWidth,
                },
              ]}
            >
              <View style={styles.stripeWrapper}>
                <Animated.View
                  style={[
                    styles.stripeContainer,
                    {
                      transform: [
                        { rotate: '-45deg' },
                        { translateX: stripeTranslateX },
                      ],
                    },
                  ]}
                >
                  {[...Array(30)].map((_, i) => (
                    <View
                      key={i}
                      style={[
                        styles.stripe,
                        {
                          backgroundColor: i % 2 === 0 ? '#FFD700' : '#FFA500',
                        },
                      ]}
                    />
                  ))}
                </Animated.View>
              </View>
            </Animated.View>
          </View>
        </View>
        <Text style={styles.loadingText}>LOADING...</Text>
      </View>
    </View>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#1D0E3F', // Dark purple-brown background
    backgroundColor: '#000',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 80,
  },
  topLeaves: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  bottomLeaves: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  leafEmoji: {
    fontSize: 40,
    opacity: 0.8,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
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
  },
  loadingSection: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginBottom: 40,
  },
  loadingBarContainer: {
    width: '100%',
    marginBottom: 12,
  },
  loadingBarBackground: {
    width: '100%',
    height: 12,
    backgroundColor: '#3D2A1A', // Dark brown
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#D4AF37', // Gold border
  },
  loadingBarFill: {
    height: '100%',
    backgroundColor: '#FFD700', // Gold/yellow
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  stripeWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  stripeContainer: {
    position: 'absolute',
    top: -20,
    left: -50,
    width: '300%',
    height: '200%',
    flexDirection: 'row',
  },
  stripe: {
    width: 15,
    height: '100%',
    marginRight: 5,
  },
  loadingText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    letterSpacing: 1,
  },
});

