import React, { forwardRef, useEffect, useImperativeHandle } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface TimerProps {
  duration?: number; // Duration in seconds
  size?: number; // Size of the circle
  strokeWidth?: number;
  onComplete?: () => void;
  color?: string;
  backgroundColor?: string;
  textColor?: string;
}

export interface TimerRef {
  start: () => void;
  stop: () => void;
  reset: () => void;
  getTimeLeft: () => number;
}

const Timer = forwardRef<TimerRef, TimerProps>(
  (
    {
      duration = 10,
      size = 120,
      strokeWidth = 8,
      onComplete,
      color = '#7ED957',
      backgroundColor = '#E0E0E0',
      textColor = '#333',
    },
    ref
  ) => {
    const [timeLeft, setTimeLeft] = React.useState(duration);
    const [isActive, setIsActive] = React.useState(false);
    const progress = useSharedValue(1);

    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;

    useImperativeHandle(ref, () => ({
      start: () => {
        console.log('start timmeer');
        
        setIsActive(true);
        progress.value = withTiming(0, {
          duration: duration * 1000,
          easing: Easing.linear,
        });
      },
      stop: () => {
        setIsActive(false);
      },
      reset: () => {
        setIsActive(false);
        setTimeLeft(duration);
        progress.value = 1;
      },
      getTimeLeft: () => timeLeft,
    }));

    useEffect(() => {
      let interval: ReturnType<typeof setInterval> | null = null;

      if (isActive && timeLeft > 0) {
        interval = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              setIsActive(false);
              onComplete?.();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else if (timeLeft === 0) {
        setIsActive(false);
      }

      return () => {
        if (interval) clearInterval(interval);
      };
    }, [isActive, timeLeft, onComplete]);

    const animatedProps = useAnimatedProps(() => {
      const strokeDashoffset = circumference * (1 - progress.value);
      return {
        strokeDashoffset,
      };
    });

    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <Svg width={size} height={size}>
          {/* Background Circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={backgroundColor}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Animated Progress Circle */}
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            animatedProps={animatedProps}
            strokeLinecap="round"
            rotation="-90"
            origin={`${size / 2}, ${size / 2}`}
          />
        </Svg>
        {/* Timer Text */}
        <View style={styles.textContainer}>
          <Text style={[styles.timeText, { color: textColor, fontSize: size / 3 }]}>
            {timeLeft}
          </Text>
          
        </View>
      </View>
    );
  }
);

Timer.displayName = 'Timer';

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  textContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeText: {
    fontWeight: 'bold',
  },
  labelText: {
    fontWeight: '500',
    marginTop: 4,
  },
});

export default Timer;
