import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import Svg, { Circle, Rect, G, Defs, RadialGradient, Stop } from 'react-native-svg';
import { useGameStore } from '@/store/gameStore';
import { useSettingsStore } from '@/store/settingsStore';

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
  const [isRolling, setIsRolling] = useState(false);
  const { rollDie, currentTurn } = useGameStore();
  const { settings } = useSettingsStore();

  const dieValue = currentTurn?.dieRoll?.value || 6;

  const handlePressAsync = async () => {
    if (disabled || isRolling) return;

    setIsPressed(true);
    setIsRolling(true);

    // Haptic feedback for pop sensation
    if (settings.hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {
        // Haptic feedback failed, but that's okay - just continue
      });
    }

    try {
      const result = await rollDie();

      onRoll?.(result);
    } finally {
      setIsRolling(false);
      setIsPressed(false);
    }
  };

  const handlePress = () => {
    handlePressAsync().catch((error) => {
      console.warn('Die roll failed:', error);
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
    if (!isRolling) {
      setIsPressed(false);
    }
  };

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

          {/* Die dots based on current value */}
          <G>{renderDieDots(size / 2, size / 2, dieValue, size * 0.015)}</G>
        </Svg>

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
