import React, { FC, useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  Easing,
  withRepeat,
  cancelAnimation,
  withSequence,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { PlayerColor } from '@/models';
import { PLAYER_COLORS } from '@/constants/game';
import { useSettingsStore } from '@/store/settingsStore';
import { useGameStore } from '@/store/gameStore';
import { getSpacePosition } from '@/constants/board';
import { getHomePosition, BoardDimensions } from '@/utils/boardCoordinates';
import {
  calculateMoveDuration,
  MoveAnimationConfig,
} from '@/utils/animationPaths';

interface PegProps {
  id: string;
  playerId: string;
  color: PlayerColor;
  position: number; // -1 for HOME, 0-27 for track, 28+ for FINISH
  size?: number;
  isMovable?: boolean;
  onPress?: (pegId: string) => void;
  onMoveComplete?: (pegId: string) => void;
  testID?: string;
  // Animation props
  isAnimating?: boolean;
  targetPosition?: number;
  animationType?: 'normal' | 'warp' | 'capture';
  animationConfig?: Partial<MoveAnimationConfig>;
  // Positioning props for alignment with PegOverlay
  boardDimensions?: BoardDimensions;
  horizontalOffset?: number;
  verticalOffset?: number;
}

export const Peg: FC<PegProps> = ({
  id,
  playerId,
  color,
  position,
  size = 24,
  isMovable = false,
  onPress,
  onMoveComplete,
  testID,
  isAnimating = false,
  targetPosition,
  animationType = 'normal',
  animationConfig = {},
  boardDimensions,
  horizontalOffset = 0,
  verticalOffset = 0,
}) => {
  const { settings } = useSettingsStore();
  const { players } = useGameStore();
  const pegColor = PLAYER_COLORS[color];

  // Animated values for position
  const animatedX = useSharedValue(0);
  const animatedY = useSharedValue(0);
  const animatedScale = useSharedValue(1);

  // Animated values for pulse effect
  const pulseScale = useSharedValue(1);

  // Animated values for warp effects
  const animatedOpacity = useSharedValue(1);
  const warpGlowOpacity = useSharedValue(0);

  // Calculate current position coordinates with scale factor and offset corrections
  const getCurrentPosition = (pos: number) => {
    let baseCoordinate = { x: 200, y: 200 }; // fallback

    if (pos === -1) {
      // HOME position - calculate actual HOME coordinates
      const player = players.find(p => p.id === playerId);

      if (player) {
        // Extract peg index from ID format: player-id-peg-index
        const pegIndex = parseInt(id.split('-')[3]) || 0;

        baseCoordinate = getHomePosition(player.color, pegIndex);
      }
    } else if (pos >= 28) {
      // FINISH position - return center for now
      // TODO: Calculate actual FINISH positions based on player color
      baseCoordinate = { x: 200, y: 200 };
    } else {
      // Track position
      const spacePos = getSpacePosition(pos);

      baseCoordinate = spacePos || { x: 200, y: 200 };
    }

    // Apply the same scaling and offset corrections as PegOverlay
    const scaleFactor = boardDimensions?.scaleFactor || 1;
    const scaledX = baseCoordinate.x * scaleFactor;
    const scaledY = baseCoordinate.y * scaleFactor;

    return {
      x: scaledX + horizontalOffset,
      y: scaledY + verticalOffset,
    };
  };

  // Initialize position - start at 0,0 since PegOverlay handles positioning
  useEffect(() => {
    animatedX.value = 0;
    animatedY.value = 0;
  }, []);

  // Reset position when not animating (after animation completes)
  // Now that we use the same coordinate system, reset to 0,0 should align perfectly
  useEffect(() => {
    if (!isAnimating) {
      // Reset to 0,0 relative to the PegOverlay container position
      // Since getCurrentPosition now uses the same scale and offsets as PegOverlay,
      // this should align perfectly with the static position
      animatedX.value = 0;
      animatedY.value = 0;
    }
  }, [isAnimating]);

  // Reset animation values when peg position changes (e.g., sent back to HOME after capture)
  useEffect(() => {
    if (!isAnimating) {
      // Reset all animated values to normal state
      animatedOpacity.value = 1;
      animatedScale.value = 1;
      warpGlowOpacity.value = 0;
      animatedX.value = 0;
      animatedY.value = 0;
    }
  }, [position, isAnimating]);

  // Handle animation when target position changes
  useEffect(() => {
    if (!isAnimating) return;

    // For capture animation, targetPosition is not needed
    if (animationType !== 'capture' && targetPosition === undefined) return;

    console.log(`Starting ${animationType} animation for peg ${id}: ${position} -> ${targetPosition}`);

    if (animationType === 'capture') {
      // Capture animation: shrink, bounce, and fade before removing
      console.log(`Starting capture animation for peg ${id}`);

      // Phase 1: Quick impact scale up
      animatedScale.value = withTiming(1.2, { duration: 100, easing: Easing.out(Easing.cubic) });

      // Phase 2: Dramatic shrink with spin effect
      setTimeout(() => {
        animatedScale.value = withTiming(0, {
          duration: 500,
          easing: Easing.in(Easing.cubic),
        });
        animatedOpacity.value = withTiming(0, {
          duration: 500,
          easing: Easing.in(Easing.cubic),
        });

        // Add a slight upward movement as peg "gets sent home"
        animatedY.value = withTiming(animatedY.value - 20, {
          duration: 300,
          easing: Easing.out(Easing.quad),
        });
      }, 100);

      // Phase 3: Complete animation and trigger callback
      setTimeout(() => {
        console.log(`Capture animation finished for peg ${id}`);
        if (onMoveComplete) {
          runOnJS(onMoveComplete)(id);
        }
      }, 600);

      return; // Exit early for capture animation
    }

    if (animationType === 'warp') {
      // Warp teleportation animation
      const currentPos = getCurrentPosition(position);
      const targetPos = getCurrentPosition(targetPosition);
      const offsetX = targetPos.x - currentPos.x;
      const offsetY = targetPos.y - currentPos.y;

      // Phase 1: Dissolve effect with glow
      animatedOpacity.value = withTiming(0, { duration: 400, easing: Easing.in(Easing.cubic) });
      warpGlowOpacity.value = withSequence(
        withTiming(0.8, { duration: 200 }),
        withTiming(0, { duration: 200 }),
      );
      animatedScale.value = withTiming(0.5, { duration: 400, easing: Easing.in(Easing.cubic) });

      // Phase 2: Instant teleport (happens while dissolved)
      setTimeout(() => {
        animatedX.value = offsetX;
        animatedY.value = offsetY;

        // Phase 3: Materialize at destination
        animatedOpacity.value = withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) });
        animatedScale.value = withSequence(
          withTiming(1.3, { duration: 200, easing: Easing.out(Easing.cubic) }),
          withTiming(1, { duration: 200, easing: Easing.inOut(Easing.cubic) }),
        );
        warpGlowOpacity.value = withSequence(
          withTiming(0.6, { duration: 200 }),
          withTiming(0, { duration: 400 }),
        );
      }, 400);

      // Complete animation after materialize
      setTimeout(() => {
        console.log(`Warp animation finished for peg ${id}`);
        if (onMoveComplete) {
          runOnJS(onMoveComplete)(id);
        }
      }, 800);

    } else {
      // Normal movement animation
      const config: MoveAnimationConfig = {
        startPosition: position,
        endPosition: targetPosition,
        duration: calculateMoveDuration(Math.abs(targetPosition - position)),
        easing: 'easeOut',
        ...animationConfig,
      };

      const currentPos = getCurrentPosition(position);
      const targetPos = getCurrentPosition(targetPosition);
      const offsetX = targetPos.x - currentPos.x;
      const offsetY = targetPos.y - currentPos.y;

      console.log(`Animation coordinates - from: (${currentPos.x}, ${currentPos.y}) to: (${targetPos.x}, ${targetPos.y})`);
      console.log(`Animation offset: (${offsetX}, ${offsetY})`);

      // Simple direct animation
      animatedX.value = withTiming(offsetX, {
        duration: config.duration,
        easing: Easing.out(Easing.cubic),
      });

      animatedY.value = withTiming(offsetY, {
        duration: config.duration,
        easing: Easing.out(Easing.cubic),
      }, (finished) => {
        if (finished) {
          console.log(`Animation finished for peg ${id}`);
          if (onMoveComplete) {
            runOnJS(onMoveComplete)(id);
          }
        }
      });

      // Add slight scale animation for movement feedback
      animatedScale.value = withTiming(1.1, { duration: 100 }, () => {
        animatedScale.value = withTiming(1, { duration: 200 });
      });
    }

  }, [isAnimating, targetPosition, animationType]);

  // Pulse effect for movable pegs
  useEffect(() => {
    console.log(`Peg ${id} - isMovable: ${isMovable}, isAnimating: ${isAnimating}`);

    if (isMovable && !isAnimating) {
      console.log(`Starting pulse animation for peg ${id}`);
      // Start pulse animation
      pulseScale.value = withRepeat(
        withTiming(1.2, {
          duration: 800,
          easing: Easing.inOut(Easing.ease),
        }),
        -1, // Infinite repeats
        true, // Reverse animation
      );
    } else {
      console.log(`Stopping pulse animation for peg ${id}`);
      // Stop pulse animation
      cancelAnimation(pulseScale);
      pulseScale.value = withTiming(1, { duration: 200 });
    }
  }, [isMovable, isAnimating]);

  const handlePress = () => {
    if (!isMovable || !onPress || isAnimating) return;

    // Haptic feedback for selection
    if (settings.hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {
        // Haptic feedback failed, but that's okay - just continue
      });
    }

    onPress(id);
  };

  // Calculate colors for gradients
  const baseColor = pegColor;
  const lightColor = adjustColorBrightness(pegColor, 40);
  const darkColor = adjustColorBrightness(pegColor, -30);
  const shadowColor = adjustColorBrightness(pegColor, -60);

  // Highlight styling for movable pegs
  const strokeColor = isMovable ? '#FFD700' : 'transparent';
  const strokeWidth = isMovable ? 2 : 0;
  const shadowOpacity = isMovable ? 0.6 : 0.4;

  // Animated style
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: animatedX.value },
        { translateY: animatedY.value },
        { scale: animatedScale.value * pulseScale.value },
      ],
      opacity: animatedOpacity.value,
    };
  });

  // Warp glow style
  const warpGlowStyle = useAnimatedStyle(() => {
    return {
      position: 'absolute' as const,
      width: size + 20,
      height: size + 20,
      borderRadius: (size + 20) / 2,
      backgroundColor: '#6C5CE7',
      opacity: warpGlowOpacity.value,
      transform: [{ scale: 1.5 }],
      left: -6,
      top: -6,
    };
  });

  return (
    <Animated.View
      style={[
        styles.container,
        { width: size + 8, height: size + 8 },
        animatedStyle,
      ]}
    >
      <Animated.View style={warpGlowStyle} pointerEvents="none" />
      <Pressable
        style={[
          styles.pressable,
          !isMovable && styles.disabled,
        ]}
        onPress={handlePress}
        disabled={!isMovable || isAnimating}
        testID={testID}
      >
        <Svg
          width={size + 8}
          height={size + 8}
          viewBox={`0 0 ${size + 8} ${size + 8}`}
        >
          <Defs>
            {/* Main peg gradient - gives 3D sphere effect */}
            <RadialGradient
              id={`pegGradient-${id}`}
              cx="35%"
              cy="25%"
              r="80%"
            >
              <Stop offset="0%" stopColor={lightColor} />
              <Stop offset="60%" stopColor={baseColor} />
              <Stop offset="100%" stopColor={darkColor} />
            </RadialGradient>

            {/* Shadow gradient for depth */}
            <RadialGradient
              id={`pegShadow-${id}`}
              cx="50%"
              cy="50%"
              r="50%"
            >
              <Stop offset="0%" stopColor={shadowColor} stopOpacity="0" />
              <Stop offset="100%" stopColor={shadowColor} stopOpacity={shadowOpacity} />
            </RadialGradient>

          </Defs>

          {/* Shadow circle */}
          <Circle
            cx={(size + 8) / 2}
            cy={(size + 8) / 2 + 2}
            r={size / 2}
            fill={`url(#pegShadow-${id})`}
          />

          {/* Main peg body */}
          <Circle
            cx={(size + 8) / 2}
            cy={(size + 8) / 2}
            r={size / 2}
            fill={`url(#pegGradient-${id})`}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />

          {/* Highlight shine for 3D effect */}
          <Circle
            cx={(size + 8) / 2 - size * 0.15}
            cy={(size + 8) / 2 - size * 0.15}
            r={size * 0.15}
            fill="#ffffff"
            opacity={0.6}
          />
        </Svg>
      </Pressable>
    </Animated.View>
  );
};

// Helper function to adjust color brightness
function adjustColorBrightness(hexColor: string, amount: number): string {
  // Remove # if present
  const color = hexColor.replace('#', '');

  // Parse RGB values
  const r = parseInt(color.substr(0, 2), 16);
  const g = parseInt(color.substr(2, 2), 16);
  const b = parseInt(color.substr(4, 2), 16);

  // Adjust brightness
  const newR = Math.max(0, Math.min(255, r + amount));
  const newG = Math.max(0, Math.min(255, g + amount));
  const newB = Math.max(0, Math.min(255, b + amount));

  // Convert back to hex
  const toHex = (n: number) => n.toString(16).padStart(2, '0');

  return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressable: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
  },
  disabled: {
    // Removed opacity to keep pegs fully visible
  },
});
