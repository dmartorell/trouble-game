import React, { FC } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import Svg, { Circle, Defs, RadialGradient, Stop, DropShadow, Filter } from 'react-native-svg';
import { PlayerColor } from '@/models';
import { PLAYER_COLORS } from '@/constants/game';
import { useSettingsStore } from '@/store/settingsStore';

export interface PegProps {
  id: string;
  playerId: string;
  color: PlayerColor;
  size?: number;
  isSelected?: boolean;
  isHighlighted?: boolean;
  isMovable?: boolean;
  onPress?: (pegId: string) => void;
  testID?: string;
}

export const Peg: FC<PegProps> = ({
  id,
  color,
  size = 24,
  isSelected = false,
  isHighlighted = false,
  isMovable = false,
  onPress,
  testID,
}) => {
  const { settings } = useSettingsStore();
  const pegColor = PLAYER_COLORS[color];

  const handlePress = () => {
    if (!isMovable || !onPress) return;

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

  // Selection and highlight styling
  const strokeColor = isSelected ? '#FFFFFF' : isHighlighted ? '#FFD700' : 'transparent';
  const strokeWidth = isSelected ? 3 : isHighlighted ? 2 : 0;
  const shadowOpacity = isSelected ? 0.8 : isHighlighted ? 0.6 : 0.4;

  return (
    <Pressable
      style={[
        styles.container,
        { width: size + 8, height: size + 8 },
        !isMovable && styles.disabled,
      ]}
      onPress={handlePress}
      disabled={!isMovable}
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

          {/* Drop shadow filter */}
          <Filter id={`dropShadow-${id}`}>
            <DropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.3" />
          </Filter>
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
          filter={`url(#dropShadow-${id})`}
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
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
  },
  disabled: {
    opacity: 0.7,
  },
});
