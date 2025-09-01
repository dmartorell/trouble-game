import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { Player, Peg } from '@/models';
import { PLAYER_COLORS } from '@/constants/game';
import { ConfettiSystem } from './ConfettiSystem';
import { PegCelebration } from './PegCelebration';

interface VictoryModalProps {
  visible: boolean;
  winner: Player | null;
  players: Player[];
  pegs: Peg[];
  gameDuration?: number;
  onPlayAgain: () => void;
  onBackToMenu: () => void;
}

const { width: screenWidth } = Dimensions.get('window');

export const VictoryModal: React.FC<VictoryModalProps> = ({
  visible,
  winner,
  players,
  pegs,
  gameDuration,
  onPlayAgain,
  onBackToMenu,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const backgroundPulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Stagger the entrance animations
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // Start background pulse animation
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(backgroundPulseAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: false,
          }),
          Animated.timing(backgroundPulseAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: false,
          }),
        ]),
      );

      pulseAnimation.start();

      return () => {
        pulseAnimation.stop();
      };
    } else {
      // Reset animations when modal closes
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
      scaleAnim.setValue(0.8);
      backgroundPulseAnim.setValue(0);
    }
  }, [visible]);

  if (!winner) return null;

  const winnerColor = PLAYER_COLORS[winner.color];
  const winnerPegs = pegs.filter(peg => peg.playerId === winner.id && peg.isInFinish);

  // Calculate final standings (winner first, then by number of pegs in finish)
  const standings = [...players]
    .map(player => ({
      ...player,
      finishedPegs: pegs.filter(peg => peg.playerId === player.id && peg.isInFinish).length,
    }))
    .sort((a, b) => {
      if (a.id === winner.id) return -1;
      if (b.id === winner.id) return 1;

      return b.finishedPegs - a.finishedPegs;
    });

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const backgroundColorInterpolation = backgroundPulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(22, 33, 62, 0.95)', `${winnerColor}15`],
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <Animated.View
        style={[
          styles.overlay,
          {
            backgroundColor: backgroundColorInterpolation,
            opacity: fadeAnim,
          },
        ]}
      >
        {/* Confetti System */}
        <ConfettiSystem
          visible={visible}
          winnerColor={winnerColor}
          intensity={80}
        />

        {/* Peg Celebration for winner's pegs */}
        <PegCelebration
          visible={visible}
          pegs={winnerPegs}
          winnerColor={winnerColor}
        />

        {/* Victory Modal Content */}
        <Animated.View
          style={[
            styles.modal,
            {
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim },
              ],
            },
          ]}
        >
          {/* Trophy Icon */}
          <View style={styles.trophyContainer}>
            <Text style={styles.trophyIcon}>🏆</Text>
          </View>

          {/* Victory Banner */}
          <View style={[styles.banner, { backgroundColor: winnerColor }]}>
            <Text style={styles.bannerText}>VICTORY!</Text>
          </View>

          {/* Winner Announcement */}
          <Text style={styles.winnerText}>
            <Text style={[styles.winnerName, { color: winnerColor }]}>
              {winner.name}
            </Text>
            {' '}WINS!
          </Text>

          {/* Game Stats */}
          {gameDuration && (
            <Text style={styles.durationText}>
              Game Duration: {formatDuration(gameDuration)}
            </Text>
          )}

          {/* Final Standings */}
          <View style={styles.standingsContainer}>
            <Text style={styles.standingsTitle}>Final Standings</Text>
            {standings.map((player, index) => (
              <View key={player.id} style={styles.standingRow}>
                <Text style={styles.standingPosition}>#{index + 1}</Text>
                <View
                  style={[
                    styles.standingColorDot,
                    { backgroundColor: PLAYER_COLORS[player.color] },
                  ]}
                />
                <Text
                  style={[
                    styles.standingName,
                    player.id === winner.id && { color: winnerColor },
                  ]}
                >
                  {player.name}
                </Text>
                <Text style={styles.standingPegs}>
                  {player.finishedPegs}/4 pegs
                </Text>
              </View>
            ))}
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <Pressable
              style={[styles.button, styles.secondaryButton]}
              onPress={onBackToMenu}
            >
              <Text style={styles.secondaryButtonText}>Back to Menu</Text>
            </Pressable>

            <Pressable
              style={[styles.button, styles.primaryButton]}
              onPress={onPlayAgain}
            >
              <Text style={styles.primaryButtonText}>Play Again</Text>
            </Pressable>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modal: {
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    maxWidth: screenWidth - 40,
    width: '100%',
    borderWidth: 2,
    borderColor: '#333',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  trophyContainer: {
    marginBottom: 20,
  },
  trophyIcon: {
    fontSize: 60,
    textAlign: 'center',
  },
  banner: {
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 25,
    marginBottom: 20,
    transform: [{ rotate: '-2deg' }],
  },
  bannerText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 2,
  },
  winnerText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 15,
  },
  winnerName: {
    textTransform: 'uppercase',
  },
  durationText: {
    fontSize: 16,
    color: '#CCCCCC',
    marginBottom: 25,
    textAlign: 'center',
  },
  standingsContainer: {
    width: '100%',
    marginBottom: 30,
  },
  standingsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 15,
  },
  standingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: '#16213e',
    borderRadius: 8,
    marginBottom: 5,
  },
  standingPosition: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFA502',
    minWidth: 30,
  },
  standingColorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginHorizontal: 10,
  },
  standingName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  standingPegs: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 15,
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#2ED573',
    borderWidth: 2,
    borderColor: '#2ED573',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#666',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButtonText: {
    color: '#CCCCCC',
    fontSize: 16,
    fontWeight: '600',
  },
});
