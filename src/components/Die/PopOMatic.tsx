import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import Svg, { Circle, Rect, G, Defs, RadialGradient, Stop } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { useGameStore } from '@/store/gameStore';
import { useSettingsStore } from '@/store/settingsStore';
import { ANIMATION_DURATION } from '@/constants/game';

interface PopOMaticProps {
  size?: number;
  disabled?: boolean;
  onRoll?: (value: number) => void;
}

export const PopOMatic: React.FC<PopOMaticProps> = ({
  size = 80,
  disabled = false,
  onRoll,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [animatedDieValue, setAnimatedDieValue] = useState(6);
  const { rollDie, dieState } = useGameStore();
  const { settings } = useSettingsStore();
  const isRolling = dieState.isRolling;

  // Timer refs for cleanup
  const tumbleTimerRef = useRef<number | null>(null);
  const hapticTimerRef = useRef<number | null>(null);
  const animationTimerRef = useRef<number | null>(null);

  // Animation values
  const rotationX = useSharedValue(0);
  const rotationY = useSharedValue(0);
  const rotationZ = useSharedValue(0);
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);

  // Cleanup function
  const clearAllTimers = useCallback(() => {
    if (tumbleTimerRef.current !== null) {
      clearInterval(tumbleTimerRef.current);
      tumbleTimerRef.current = null;
    }
    if (hapticTimerRef.current !== null) {
      clearInterval(hapticTimerRef.current);
      hapticTimerRef.current = null;
    }
    if (animationTimerRef.current !== null) {
      clearTimeout(animationTimerRef.current);
      animationTimerRef.current = null;
    }
  }, []);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, [clearAllTimers]);

  // Animation functions
  const animateDieRoll = useCallback((finalValue: number) => {
    // Clear any existing timers
    clearAllTimers();
    // Random sequence of intermediate values for tumbling effect
    const tumbleValues = [1, 3, 5, 2, 4, 6, 1, 4, 2, 6, 3, 5];

    // Start 3D rotation animation
    rotationX.value = withSequence(
      withTiming(360 + Math.random() * 720, {
        duration: 800,
        easing: Easing.out(Easing.quad),
      }),
      withSpring(0, { damping: 12, stiffness: 100 }),
    );

    rotationY.value = withSequence(
      withTiming(360 + Math.random() * 720, {
        duration: 850,
        easing: Easing.out(Easing.quad),
      }),
      withSpring(0, { damping: 12, stiffness: 100 }),
    );

    rotationZ.value = withSequence(
      withTiming(180 + Math.random() * 360, {
        duration: 750,
        easing: Easing.out(Easing.quad),
      }),
      withSpring(0, { damping: 12, stiffness: 100 }),
    );

    // Scale animation for bounce effect
    scale.value = withSequence(
      withTiming(0.8, { duration: 100 }),
      withSpring(1.2, { damping: 8, stiffness: 150 }),
      withSpring(1, { damping: 12, stiffness: 100 }),
    );

    // Vertical bounce
    translateY.value = withSequence(
      withTiming(-8, { duration: 200, easing: Easing.out(Easing.quad) }),
      withSpring(0, { damping: 10, stiffness: 120 }),
    );

    // Animate die face values during tumble
    let currentIndex = 0;

    tumbleTimerRef.current = setInterval(() => {
      if (currentIndex < tumbleValues.length) {
        setAnimatedDieValue(tumbleValues[currentIndex]);
        currentIndex++;
      } else {
        if (tumbleTimerRef.current !== null) {
          clearInterval(tumbleTimerRef.current);
          tumbleTimerRef.current = null;
        }
        // Set final value
        setTimeout(() => {
          setAnimatedDieValue(finalValue);
        }, 100);
      }
    }, 60);

    // Haptic feedback during tumble
    if (settings.hapticsEnabled) {
      hapticTimerRef.current = setInterval(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }, 100);

      setTimeout(() => {
        if (hapticTimerRef.current !== null) {
          clearInterval(hapticTimerRef.current);
          hapticTimerRef.current = null;
        }
        // Final impact
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
      }, 800);
    }
  }, [clearAllTimers, settings.hapticsEnabled]);

  const handlePressAsync = async () => {
    if (disabled || isRolling) return;

    setIsPressed(true);

    // Haptic feedback for pop sensation
    if (settings.hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {
        // Haptic feedback failed, but that's okay - just continue
      });
    }

    try {
      // Start the roll - this will set isRolling to true in the store
      const result = await rollDie();

      // Start animation
      animateDieRoll(result);

      // Wait for animation to complete (match store timeout)
      animationTimerRef.current = setTimeout(() => {
        setIsPressed(false);
      }, ANIMATION_DURATION.dieRoll);

      // Call the onRoll callback if provided
      if (onRoll) {
        onRoll(result);
      }
    } catch {
      setIsPressed(false);
      // Die roll failed - likely because die is already rolling
    }
  };

  const handlePress = () => {
    handlePressAsync().catch(() => {
      // Error handled in handlePressAsync
    });
  };

  const handlePressIn = () => {
    if (!disabled && !isRolling) {
      setIsPressed(true);
      if (settings.hapticsEnabled) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {
          // Haptic feedback failed, but that's okay - just continue
        });
      }
    }
  };

  const handlePressOut = () => {
    if (!dieState.isRolling) {
      setIsPressed(false);
    }
  };

  // Animated style for 3D transforms
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: translateY.value },
        { perspective: 1000 },
        { rotateX: `${rotationX.value}deg` },
        { rotateY: `${rotationY.value}deg` },
        { rotateZ: `${rotationZ.value}deg` },
        { scale: scale.value },
      ],
    };
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Pressable
        style={[
          styles.pressableArea,
          { width: size, height: size },
          isPressed && styles.pressed,
          disabled && styles.disabled,
        ]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || isRolling}
      >
        <Animated.View style={animatedStyle}>
          <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <Defs>
              <RadialGradient id="popOMaticGradient" cx="50%" cy="30%" r="60%">
                <Stop offset="0%" stopColor="#4a4a4a" />
                <Stop offset="100%" stopColor="#1a1a1a" />
              </RadialGradient>
              <RadialGradient id="domeGradient" cx="30%" cy="20%" r="70%">
                <Stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
                <Stop offset="70%" stopColor="#ffffff" stopOpacity="0.1" />
                <Stop offset="100%" stopColor="#000000" stopOpacity="0.05" />
              </RadialGradient>
            </Defs>

            {/* Black housing base - rotated 45 degrees */}
            <Rect
              x={size * 0.125}
              y={size * 0.125}
              width={size * 0.75}
              height={size * 0.75}
              fill="url(#popOMaticGradient)"
              stroke="#000000"
              strokeWidth={2}
              rx={size * 0.15}
              transform={`rotate(45 ${size / 2} ${size / 2})`}
            />

            {/* Clear dome effect - pressable overlay */}
            <Circle
              cx={size / 2}
              cy={size / 2 - 2}
              r={size * 0.35}
              fill="url(#domeGradient)"
              stroke="#ffffff"
              strokeWidth={1}
              strokeOpacity={0.3}
            />

            {/* Die face */}
            <Rect
              x={size / 2 - size * 0.12}
              y={size / 2 - size * 0.12}
              width={size * 0.24}
              height={size * 0.24}
              fill="#ffffff"
              stroke="#000000"
              strokeWidth={1}
              rx={size * 0.02}
            />

            {/* Die dots based on animated value */}
            <G>{renderDieDots(size / 2, size / 2, animatedDieValue, size * 0.015)}</G>
          </Svg>
        </Animated.View>

        {/* Overlay for press state */}
        {isPressed && (
          <View style={[styles.pressOverlay, { borderRadius: size / 2 }]} />
        )}
      </Pressable>
    </View>
  );
};

// Helper function to render die dots based on value
function renderDieDots(centerX: number, centerY: number, value: number, dotSize: number) {
  const dots: React.ReactElement[] = [];
  const spacing = dotSize * 2.5;

  const dotPositions = {
    topLeft: { x: centerX - spacing, y: centerY - spacing },
    topRight: { x: centerX + spacing, y: centerY - spacing },
    middleLeft: { x: centerX - spacing, y: centerY },
    center: { x: centerX, y: centerY },
    middleRight: { x: centerX + spacing, y: centerY },
    bottomLeft: { x: centerX - spacing, y: centerY + spacing },
    bottomRight: { x: centerX + spacing, y: centerY + spacing },
  };

  const dotConfigs = {
    1: ['center'],
    2: ['topLeft', 'bottomRight'],
    3: ['topLeft', 'center', 'bottomRight'],
    4: ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'],
    5: ['topLeft', 'topRight', 'center', 'bottomLeft', 'bottomRight'],
    6: ['topLeft', 'topRight', 'middleLeft', 'middleRight', 'bottomLeft', 'bottomRight'],
  };

  const config = dotConfigs[value as keyof typeof dotConfigs] || dotConfigs[1];

  config.forEach((position, index) => {
    const pos = dotPositions[position as keyof typeof dotPositions];

    dots.push(
      <Circle
        key={`dot-${index}`}
        cx={pos.x}
        cy={pos.y}
        r={dotSize}
        fill="#000000"
      />,
    );
  });

  return dots;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressableArea: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
  },
  pressed: {
    transform: [{ scale: 0.95 }],
  },
  disabled: {
    opacity: 0.6,
  },
  pressOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});
