import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions, StyleSheet } from 'react-native';

interface ConfettiParticle {
  id: number;
  x: Animated.Value;
  y: Animated.Value;
  rotation: Animated.Value;
  scale: Animated.Value;
  opacity: Animated.Value;
  color: string;
  initialX: number;
  velocityX: number;
  velocityY: number;
  rotationSpeed: number;
}

interface ConfettiSystemProps {
  visible: boolean;
  winnerColor: string;
  intensity?: number;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const CONFETTI_COLORS = [
  '#FF4757', // Red
  '#3742FA', // Blue
  '#FFA502', // Yellow
  '#2ED573', // Green
  '#FF6B9D', // Pink
  '#A55EEA', // Purple
  '#26C6DA', // Cyan
  '#FFA726', // Orange
];

export const ConfettiSystem: React.FC<ConfettiSystemProps> = ({
  visible,
  winnerColor,
  intensity = 60,
}) => {
  const particles = useRef<ConfettiParticle[]>([]);
  const animationRef = useRef<{ stop: () => void } | null>(null);

  // Create particle with random properties
  const createParticle = (id: number): ConfettiParticle => {
    const isWinnerColor = Math.random() < 0.6; // 60% winner color, 40% rainbow
    const color = isWinnerColor ? winnerColor : CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];

    // Start from bottom of screen
    const initialX = Math.random() * screenWidth;
    const startY = screenHeight + 20; // Start below screen

    // Launch upward with random velocity and spread
    const velocityX = (Math.random() - 0.5) * 8; // Horizontal spread
    const velocityY = -15 - Math.random() * 10; // Strong upward velocity
    const rotationSpeed = (Math.random() - 0.5) * 20;

    return {
      id,
      x: new Animated.Value(initialX),
      y: new Animated.Value(startY),
      rotation: new Animated.Value(0),
      scale: new Animated.Value(0.8 + Math.random() * 0.4),
      opacity: new Animated.Value(1),
      color,
      initialX,
      velocityX,
      velocityY,
      rotationSpeed,
    };
  };

  // Initialize particles
  useEffect(() => {
    if (visible) {
      // Create particles
      particles.current = Array.from({ length: intensity }, (_, i) => createParticle(i));

      // Start animation loop
      startConfettiAnimation();
    } else {
      // Stop animation and clear particles
      if (animationRef.current) {
        animationRef.current.stop();
      }
      particles.current = [];
    }

    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
      }
    };
  }, [visible, intensity]);

  const startConfettiAnimation = () => {
    const animateParticles = () => {
      particles.current.forEach(particle => {
        // Launch particles from bottom to top, then let gravity take over
        const launchDuration = 800; // Time to reach peak
        const fallDuration = 2000; // Time to fall down
        const totalDuration = launchDuration + fallDuration;

        // Stagger particle launches for more natural effect
        const delay = Math.random() * 500;

        setTimeout(() => {
          // Phase 1: Launch upward (bottom to top)
          const peakY = screenHeight * 0.2 + Math.random() * screenHeight * 0.3; // Peak height
          const peakX = particle.initialX + particle.velocityX * 20; // Horizontal drift during launch

          // Launch animation
          Animated.parallel([
            // Y movement: bottom -> peak -> fall
            Animated.sequence([
              Animated.timing(particle.y, {
                toValue: peakY,
                duration: launchDuration,
                useNativeDriver: false,
              }),
              Animated.timing(particle.y, {
                toValue: screenHeight + 50,
                duration: fallDuration,
                useNativeDriver: false,
              }),
            ]),

            // X movement: slight horizontal drift
            Animated.timing(particle.x, {
              toValue: peakX,
              duration: totalDuration,
              useNativeDriver: false,
            }),

            // Rotation: continuous spinning
            Animated.loop(
              Animated.timing(particle.rotation, {
                toValue: 360,
                duration: 1000 + Math.random() * 500,
                useNativeDriver: false,
              }),
            ),

            // Opacity: fade out near the end
            Animated.sequence([
              Animated.delay(totalDuration * 0.7),
              Animated.timing(particle.opacity, {
                toValue: 0,
                duration: totalDuration * 0.3,
                useNativeDriver: false,
              }),
            ]),
          ]).start();
        }, delay);
      });
    };

    // Start initial burst
    animateParticles();

    // Continue with periodic bursts
    const intervalId = setInterval(() => {
      if (visible) {
        // Refresh some particles for continuous effect
        const refreshCount = Math.floor(intensity * 0.3);

        for (let i = 0; i < refreshCount; i++) {
          const randomIndex = Math.floor(Math.random() * particles.current.length);
          const newParticle = createParticle(particles.current[randomIndex].id);

          particles.current[randomIndex] = newParticle;
        }
        animateParticles();
      }
    }, 2000); // New burst every 2 seconds

    animationRef.current = {
      stop: () => clearInterval(intervalId),
    };
  };

  if (!visible) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.current.map(particle => (
        <Animated.View
          key={particle.id}
          style={[
            styles.particle,
            {
              left: particle.x,
              top: particle.y,
              backgroundColor: particle.color,
              transform: [
                {
                  rotate: particle.rotation.interpolate({
                    inputRange: [0, 360],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
                { scale: particle.scale },
              ],
              opacity: particle.opacity,
            },
          ]}
        />
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
    zIndex: 1,
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 2,
  },
});
