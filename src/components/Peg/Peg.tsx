import React, { FC, useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  Easing,
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

  // Handle animation when target position changes
  useEffect(() => {
    if (!isAnimating || targetPosition === undefined) return;

    console.log(`Starting animation for peg ${id}: ${position} -> ${targetPosition}`);

    const config: MoveAnimationConfig = {
      startPosition: position,
      endPosition: targetPosition,
      duration: calculateMoveDuration(Math.abs(targetPosition - position)),
      easing: 'easeOut',
      ...animationConfig,
    };

    // Get current and target positions in absolute coordinates
    const currentPos = getCurrentPosition(position);
    const targetPos = getCurrentPosition(targetPosition);

    console.log(`Animation coordinates - from: (${currentPos.x}, ${currentPos.y}) to: (${targetPos.x}, ${targetPos.y})`);

    // Calculate the offset needed to animate from current to target position
    // Since PegOverlay positions the container at currentPos, we need to animate to the relative offset
    const offsetX = targetPos.x - currentPos.x;
    const offsetY = targetPos.y - currentPos.y;

    console.log(`Animation offset: (${offsetX}, ${offsetY})`);

    // Simple direct animation (no complex path for now)
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
        // Animation complete - call callback
        if (onMoveComplete) {
          runOnJS(onMoveComplete)(id);
        }
      }
    });

    // Add slight scale animation for movement feedback
    animatedScale.value = withTiming(1.1, { duration: 100 }, () => {
      animatedScale.value = withTiming(1, { duration: 200 });
    });

  }, [isAnimating, targetPosition]);

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
        { scale: animatedScale.value },
      ],
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
