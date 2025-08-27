import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useGamePlay } from './resources/useGamePlay';
import { BoardSVG } from '@/components';

export const GamePlayScreen = () => {
  const {
    currentTurn,
    exitGame,
    popDie,
  } = useGamePlay();

  return (
    <SafeAreaView style={styles.container}>
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
        <BoardSVG />
      </View>

      <View style={styles.dieContainer}>
        <Pressable style={styles.dieButton} onPress={popDie}>
          <Text style={styles.dieButtonText}>POP!</Text>
        </Pressable>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#16213e',
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
  dieButton: {
    width: 120,
    height: 120,
    backgroundColor: '#FFA502',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
  },
  dieButtonText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1a1a2e',
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
