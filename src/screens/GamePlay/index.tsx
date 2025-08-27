import { View, Text, StyleSheet, Pressable } from 'react-native';

import { useGamePlay } from './resources/useGamePlay';
import { BoardSVG, PopOMatic } from '@/components';

export const GamePlayScreen = () => {
  const {
    currentTurn,
    exitGame,
  } = useGamePlay();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={exitGame}
        >
          <Text style={styles.backButtonText}>Exit</Text>
        </Pressable>
        <Text style={styles.turnIndicator}>{currentTurn}&apos;s Turn</Text>
      </View>

      <View style={styles.gameBoard}>
        <BoardSVG showSpaceNumbers={false} />
      </View>

      <View style={styles.dieContainer}>
        <PopOMatic
          size={120}
          onRoll={(value) => console.log('Die rolled:', value)}
        />
      </View>

      <View style={styles.playerInfo}>
        <View style={styles.playerCard}>
          <View style={[styles.playerIndicator, { backgroundColor: '#FF4757' }]} />
          <Text style={styles.playerText}>Player 1</Text>
        </View>
        <View style={styles.playerCard}>
          <View style={[styles.playerIndicator, { backgroundColor: '#3742FA' }]} />
          <Text style={styles.playerText}>Player 2</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#16213e',
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#1a1a2e',
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#FF4757',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  turnIndicator: {
    color: '#FFA502',
    fontSize: 18,
    fontWeight: '700',
  },
  gameBoard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 20,
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#333',
  },
  dieContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  playerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
  },
  playerIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  playerText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
