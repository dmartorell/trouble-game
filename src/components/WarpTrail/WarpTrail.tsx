import React, { FC, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { getSpacePosition } from '@/constants/board';

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface WarpTrailProps {
  fromSpace: number;
  toSpace: number;
  isActive: boolean;
  duration?: number;
  onComplete?: () => void;
  scaleFactor?: number;
}

export const WarpTrail: FC<WarpTrailProps> = ({
  fromSpace,
  toSpace,
  isActive,
  duration = 800,
  onComplete,
  scaleFactor = 1,
}) => {
  const trailOpacity = useSharedValue(0);
  const pathProgress = useSharedValue(0);
  const glowIntensity = useSharedValue(0);

  useEffect(() => {
    if (isActive) {
      // Start the trail animation
      trailOpacity.value = withSequence(
        withTiming(1, { duration: 200, easing: Easing.out(Easing.cubic) }),
        withDelay(duration - 400, withTiming(0, { duration: 200, easing: Easing.in(Easing.cubic) })),
      );

      pathProgress.value = withTiming(1, {
        duration: duration - 200,
        easing: Easing.inOut(Easing.cubic),
      });

      glowIntensity.value = withSequence(
        withTiming(1, { duration: 200 }),
        withTiming(0.3, { duration: duration - 400 }),
        withTiming(0, { duration: 200 }),
      );

      // Call onComplete after animation
      if (onComplete) {
        setTimeout(onComplete, duration);
      }
    } else {
      // Reset animation values
      trailOpacity.value = 0;
      pathProgress.value = 0;
      glowIntensity.value = 0;
    }
  }, [isActive]);

  // Get positions for the warp spaces
  const fromPos = getSpacePosition(fromSpace);
  const toPos = getSpacePosition(toSpace);

  if (!fromPos || !toPos) return null;

  // Apply scale factor and calculate path
  const scaledFromX = fromPos.x * scaleFactor;
  const scaledFromY = fromPos.y * scaleFactor;
  const scaledToX = toPos.x * scaleFactor;
  const scaledToY = toPos.y * scaleFactor;

  // Create a curved path between the two points
  const midX = (scaledFromX + scaledToX) / 2;
  const midY = (scaledFromY + scaledToY) / 2;

  // Add curve control points for a nice arc
  const controlPoint1X = midX - (scaledToY - scaledFromY) * 0.3;
  const controlPoint1Y = midY + (scaledToX - scaledFromX) * 0.3;
  const controlPoint2X = midX + (scaledToY - scaledFromY) * 0.3;
  const controlPoint2Y = midY - (scaledToX - scaledFromX) * 0.3;

  const pathData = `
    M ${scaledFromX} ${scaledFromY}
    C ${controlPoint1X} ${controlPoint1Y}
      ${controlPoint2X} ${controlPoint2Y}
      ${scaledToX} ${scaledToY}
  `;

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: trailOpacity.value,
    };
  });

  // Create animated props for the path
  const pathAnimatedProps = useAnimatedProps(() => {
    return {
      strokeDasharray: 200,
      strokeDashoffset: 200 * (1 - pathProgress.value),
      strokeOpacity: trailOpacity.value,
      strokeWidth: 3 + glowIntensity.value * 2,
    };
  });

  return (
    <Animated.View style={[styles.container, animatedStyle]} pointerEvents="none">
      <Svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${400 * scaleFactor} ${400 * scaleFactor}`}
        style={StyleSheet.absoluteFillObject}
      >
        <Defs>
          <LinearGradient id="warpGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#6C5CE7" stopOpacity="0.2" />
            <Stop offset="50%" stopColor="#A29BFE" stopOpacity="0.8" />
            <Stop offset="100%" stopColor="#6C5CE7" stopOpacity="0.2" />
          </LinearGradient>
        </Defs>

        {/* Glow effect */}
        <AnimatedPath
          d={pathData}
          stroke="#A29BFE"
          strokeWidth={8}
          strokeOpacity={0.3}
          fill="none"
          strokeLinecap="round"
          animatedProps={pathAnimatedProps}
        />

        {/* Main trail */}
        <AnimatedPath
          d={pathData}
          stroke="url(#warpGradient)"
          fill="none"
          strokeLinecap="round"
          animatedProps={pathAnimatedProps}
        />

        {/* Bright core */}
        <AnimatedPath
          d={pathData}
          stroke="#6C5CE7"
          strokeWidth={1}
          fill="none"
          strokeLinecap="round"
          animatedProps={pathAnimatedProps}
        />
      </Svg>

      {/* Particle effects at endpoints */}
      <View style={[styles.particle, { left: scaledFromX - 10, top: scaledFromY - 10 }]}>
        <Animated.View style={[styles.particleGlow, { opacity: glowIntensity.value }]} />
      </View>
      <View style={[styles.particle, { left: scaledToX - 10, top: scaledToY - 10 }]}>
        <Animated.View style={[styles.particleGlow, { opacity: glowIntensity.value }]} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  particle: {
    position: 'absolute',
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  particleGlow: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#A29BFE',
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
});
