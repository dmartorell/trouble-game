import React, { useState, useEffect, FC } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useGameStore } from '@/store';
import { TurnTimerProps } from '@/models';
import { THEME_COLORS, TIMEOUT_CONFIG } from '@/constants/game';

export const TurnTimer: FC<TurnTimerProps> = ({ visible }) => {
  const { currentTurn, getRemainingTurnTime, shouldShowTimeoutWarning } = useGameStore();
  const [remainingTime, setRemainingTime] = useState(0);
  const [isWarning, setIsWarning] = useState(false);

  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (visible && currentTurn) {
      // Update timer every second
      interval = setInterval(() => {
        const remaining = getRemainingTurnTime();

        setRemainingTime(remaining);
        setIsWarning(shouldShowTimeoutWarning());

        // Stop when time runs out
        if (remaining <= 0) {
          if (interval) {
            clearInterval(interval);
          }
        }
      }, 1000);

      // Initial update
      setRemainingTime(getRemainingTurnTime());
      setIsWarning(shouldShowTimeoutWarning());
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [visible, currentTurn, getRemainingTurnTime, shouldShowTimeoutWarning]);

  // Fade in/out animation
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: visible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [visible, fadeAnim]);

  // Warning pulse animation
  useEffect(() => {
    if (isWarning) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: TIMEOUT_CONFIG.WARNING_FLASH_INTERVAL,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: TIMEOUT_CONFIG.WARNING_FLASH_INTERVAL,
            useNativeDriver: true,
          }),
        ]),
      );

      pulseAnimation.start();

      return () => {
        pulseAnimation.stop();
        pulseAnim.setValue(1);
      };
    } else {
      pulseAnim.setValue(1);
    }
  }, [isWarning, pulseAnim]);

  if (!visible || !currentTurn || currentTurn.startTime === 0) return null;

  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime % 60;
  const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: pulseAnim }],
        },
      ]}
    >
      <View style={[
        styles.timerBox,
        isWarning && styles.warningBox,
      ]}>
        <Text style={[
          styles.timeText,
          isWarning && styles.warningText,
        ]}>
          {timeString}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 1000,
  },
  timerBox: {
    backgroundColor: THEME_COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 2,
    borderColor: THEME_COLORS.border,
    minWidth: 80,
    alignItems: 'center',
  },
  warningBox: {
    backgroundColor: '#FF4757',
    borderColor: '#FF6B7D',
    shadowColor: '#FF4757',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  timeText: {
    fontFamily: 'System',
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME_COLORS.text,
    textAlign: 'center',
  },
  warningText: {
    color: '#FFFFFF',
  },
});
