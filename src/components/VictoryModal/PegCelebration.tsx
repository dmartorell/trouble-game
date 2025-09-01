import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { Peg } from '@/models';
import { getPegCoordinate } from '@/utils/boardCoordinates';

interface PegCelebrationProps {
  visible: boolean;
  pegs: Peg[];
  winnerColor: string;
}

interface CelebrationPeg {
  id: string;
  x: number;
  y: number;
  bounceAnim: Animated.Value;
  scaleAnim: Animated.Value;
  rotationAnim: Animated.Value;
  glowAnim: Animated.Value;
}

export const PegCelebration: React.FC<PegCelebrationProps> = ({
  visible,
  pegs,
  winnerColor,
}) => {
  const celebrationPegs = useRef<CelebrationPeg[]>([]);
  const animationRefs = useRef<Animated.CompositeAnimation[]>([]);

  useEffect(() => {
    if (visible && pegs.length > 0) {
      // Initialize celebration pegs with their positions
      celebrationPegs.current = pegs.map(peg => {
        // For victory celebration, pegs are in FINISH area, so we need to get the player color
        // We'll use a simple color mapping based on the peg's playerId
        const playerColorMap: { [key: string]: 'red' | 'blue' | 'green' | 'yellow' } = {
          'player-1': 'red',
          'player-2': 'blue',
          'player-3': 'green',
          'player-4': 'yellow',
        };
        const playerColor = playerColorMap[peg.playerId] || 'red';

        const coordinates = getPegCoordinate(peg, playerColor);

        return {
          id: peg.id,
          x: coordinates.x,
          y: coordinates.y,
          bounceAnim: new Animated.Value(0),
          scaleAnim: new Animated.Value(1),
          rotationAnim: new Animated.Value(0),
          glowAnim: new Animated.Value(0),
        };
      });

      // Start celebration animations
      startCelebrationAnimation();
    } else {
      // Stop all animations
      animationRefs.current.forEach(anim => anim.stop());
      animationRefs.current = [];
      celebrationPegs.current = [];
    }

    return () => {
      animationRefs.current.forEach(anim => anim.stop());
    };
  }, [visible, pegs]);

  const startCelebrationAnimation = () => {
    celebrationPegs.current.forEach((celebrationPeg, index) => {
      // Stagger the start of each peg's celebration
      const delay = index * 100;

      // Bouncing animation
      const bounceAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(celebrationPeg.bounceAnim, {
            toValue: -15,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(celebrationPeg.bounceAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      );

      // Scale pulsing animation
      const scaleAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(celebrationPeg.scaleAnim, {
            toValue: 1.3,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(celebrationPeg.scaleAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      );

      // Gentle rotation animation
      const rotationAnimation = Animated.loop(
        Animated.timing(celebrationPeg.rotationAnim, {
          toValue: 360,
          duration: 3000,
          useNativeDriver: true,
        }),
      );

      // Glow pulsing animation
      const glowAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(celebrationPeg.glowAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: false,
          }),
          Animated.timing(celebrationPeg.glowAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: false,
          }),
        ]),
      );

      // Start all animations with delay
      setTimeout(() => {
        bounceAnimation.start();
        scaleAnimation.start();
        rotationAnimation.start();
        glowAnimation.start();
      }, delay);

      // Store animation references for cleanup
      animationRefs.current.push(bounceAnimation, scaleAnimation, rotationAnimation, glowAnimation);
    });

    // Create sparkle effects around pegs
    createSparkleEffects();
  };

  const createSparkleEffects = () => {
    celebrationPegs.current.forEach((celebrationPeg, index) => {
      // Create multiple sparkles around each peg
      for (let i = 0; i < 8; i++) {
        const sparkleDelay = index * 100 + i * 200;

        setTimeout(() => {
          createSparkle();
        }, sparkleDelay);
      }
    });
  };

  const createSparkle = () => {
    const sparkleScale = new Animated.Value(0);
    const sparkleOpacity = new Animated.Value(1);

    // Sparkle animation
    Animated.parallel([
      Animated.sequence([
        Animated.timing(sparkleScale, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(sparkleScale, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(sparkleOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Note: In a real implementation, you'd want to manage sparkle components
    // For this demo, we'll focus on the peg animations
  };

  if (!visible || celebrationPegs.current.length === 0) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {celebrationPegs.current.map(celebrationPeg => (
        <Animated.View
          key={celebrationPeg.id}
          style={[
            styles.celebrationPeg,
            {
              left: celebrationPeg.x - 12, // Center the peg (24px diameter / 2)
              top: celebrationPeg.y - 12,
              backgroundColor: winnerColor,
              transform: [
                { translateY: celebrationPeg.bounceAnim },
                { scale: celebrationPeg.scaleAnim },
                {
                  rotate: celebrationPeg.rotationAnim.interpolate({
                    inputRange: [0, 360],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
              shadowColor: winnerColor,
              shadowOpacity: celebrationPeg.glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 0.8],
              }),
              shadowRadius: celebrationPeg.glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [5, 15],
              }),
            },
          ]}
        >
          {/* Inner highlight for 3D effect */}
          <View style={[styles.pegHighlight, { backgroundColor: winnerColor }]} />
        </Animated.View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
  },
  celebrationPeg: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 5,
  },
  pegHighlight: {
    position: 'absolute',
    top: 2,
    left: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    opacity: 0.6,
  },
});
