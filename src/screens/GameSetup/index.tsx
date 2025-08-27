import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useGameSetup } from './resources/useGameSetup';
import { PLAYER_COLORS } from '@/constants/game';

export const GameSetupScreen = () => {
  const {
    players,
    activePlayerCount,
    togglePlayer,
    startGame,
  } = useGameSetup();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Select Players</Text>
        <Text style={styles.subtitle}>Choose 2-4 players</Text>

        <View style={styles.playerList}>
          {players.map((player, index) => (
            <Pressable
              key={index}
              style={[
                styles.playerCard,
                { borderColor: PLAYER_COLORS[player.color] },
                player.isActive && styles.playerCardActive,
              ]}
              onPress={() => togglePlayer(index)}
              disabled={index < 2}
            >
              <View style={styles.playerInfo}>
                <View
                  style={[
                    styles.colorIndicator,
                    { backgroundColor: PLAYER_COLORS[player.color] },
                  ]}
                />
                <Text style={[
                  styles.playerName,
                  !player.isActive && styles.inactiveText,
                ]}>
                  {player.name}
                </Text>
              </View>
              <View style={[
                styles.checkbox,
                player.isActive && styles.checkboxActive,
                { borderColor: player.isActive ? PLAYER_COLORS[player.color] : '#666' },
              ]}>
                {player.isActive && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </View>
            </Pressable>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.playerCount}>
            {activePlayerCount} {activePlayerCount === 1 ? 'Player' : 'Players'} Selected
          </Text>

          <Pressable
            style={[
              styles.startButton,
              activePlayerCount < 2 && styles.startButtonDisabled,
            ]}
            onPress={startGame}
            disabled={activePlayerCount < 2}
          >
            <Text style={styles.startButtonText}>Start Game</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#16213e',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#999',
    textAlign: 'center',
    marginBottom: 32,
  },
  playerList: {
    gap: 12,
    marginBottom: 40,
  },
  playerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
  },
  playerCardActive: {
    backgroundColor: '#1a1a2e',
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  colorIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  playerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  inactiveText: {
    color: '#666',
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    gap: 20,
  },
  playerCount: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
  },
  startButton: {
    backgroundColor: '#FF4757',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  startButtonDisabled: {
    backgroundColor: '#666',
    shadowOpacity: 0,
    elevation: 0,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
});
