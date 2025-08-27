import { View, Text, StyleSheet } from 'react-native';

import { useStats } from './resources/useStats';

export const StatsScreen = () => {
  const {
    gamesPlayed,
    wins,
    winRate,
    bestTime,
  } = useStats();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Game Statistics</Text>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{gamesPlayed}</Text>
            <Text style={styles.statLabel}>Games Played</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>{wins}</Text>
            <Text style={styles.statLabel}>Wins</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>{winRate}%</Text>
            <Text style={styles.statLabel}>Win Rate</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>{bestTime}</Text>
            <Text style={styles.statLabel}>Best Time</Text>
          </View>
        </View>

        <Text style={styles.placeholder}>Statistics will be tracked once games are played</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#16213e',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FF4757',
    marginBottom: 32,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  statCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 20,
    width: '48%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFA502',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#999',
    textTransform: 'uppercase',
  },
  placeholder: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
    fontStyle: 'italic',
  },
});
