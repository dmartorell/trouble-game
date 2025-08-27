import { ScrollView, Text, View, StyleSheet } from 'react-native';

export const RulesScreen = () => {

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>How to Play Trouble</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Objective</Text>
          <Text style={styles.sectionText}>
            Be the first player to move all 4 of your colored pegs around the board and into your FINISH line!
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Starting the Game</Text>
          <Text style={styles.sectionText}>
            • Roll a 6 to move a peg from HOME to START{'\n'}
            • Rolling a 6 gives you an extra turn{'\n'}
            • Move pegs clockwise around the board
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Special Rules</Text>
          <Text style={styles.sectionText}>
            • Landing on an opponent sends them HOME{'\n'}
            • Double Trouble (XX) spaces give extra turns{'\n'}
            • Warp spaces teleport you across the board{'\n'}
            • Rolling a 1 lets all opponents move to START{'\n'}
            • Must roll exact number to enter FINISH
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Winning</Text>
          <Text style={styles.sectionText}>
            First player to get all 4 pegs into their FINISH zone wins!
          </Text>
        </View>
      </ScrollView>
    </View>
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
    fontSize: 28,
    fontWeight: '800',
    color: '#FF4757',
    marginBottom: 24,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFA502',
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
  },
});
