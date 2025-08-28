import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';

import { useGamePlay } from './resources/useGamePlay';
import { BoardSVG, PopOMatic, Peg } from '@/components';
import { PLAYER_COLORS } from '@/constants/game';

export const GamePlayScreen = () => {
  const {
    exitGame,
    handleDieRoll,
    handlePegPress,
    dieValue,
    rollCount,
    isLocked,
    dieState,
    currentPlayer,
    currentPlayerPegs,
    selectablePegIds,
    selectedPegId,
    currentDieRoll,
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
        <Text style={styles.turnIndicator}>
          {currentPlayer ? (
            <>
              <Text style={[styles.playerColor, { color: PLAYER_COLORS[currentPlayer.color] }]}>
                {currentPlayer.name}
              </Text>
              &apos;s Turn
            </>
          ) : (
            'Loading...'
          )}
        </Text>
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.gameBoard}>
          <BoardSVG showSpaceNumbers={false} />
        </View>

        <View style={styles.dieContainer}>
          <PopOMatic
            size={120}
            onRoll={handleDieRoll}
            disabled={false}
          />

          {/* Current Player's Pegs */}
          <View style={styles.pegTestContainer}>
            <Text style={styles.pegTestTitle}>
              Current Player Pegs ({currentPlayer?.name || 'Unknown'})
            </Text>
            {currentDieRoll && (
              <Text style={styles.dieRollInfo}>Die Roll: {currentDieRoll}</Text>
            )}
            <View style={styles.pegTestRow}>
              {currentPlayerPegs.map((peg) => {
                const isSelectable = selectablePegIds.includes(peg.id);
                const isSelected = selectedPegId === peg.id;

                return (
                  <View key={peg.id} style={styles.pegContainer}>
                    <Peg
                      id={peg.id}
                      playerId={peg.playerId}
                      color={currentPlayer?.color || 'red'}
                      size={32}
                      isMovable={isSelectable}
                      isSelected={isSelected}
                      isHighlighted={isSelectable && !isSelected}
                      onPress={handlePegPress}
                      testID={`peg-${peg.id}`}
                    />
                    <Text style={styles.pegLabel}>
                      {peg.isInHome ? 'HOME' : peg.isInFinish ? 'FINISH' : `${peg.position}`}
                    </Text>
                  </View>
                );
              })}
            </View>
            <Text style={styles.pegTestDescription}>
              {currentDieRoll
                ? `Roll: ${currentDieRoll} | Selectable pegs are highlighted`
                : 'Roll the die to select pegs'}
            </Text>
          </View>

          {/* Debug Information */}
          <View style={styles.debugContainer}>
            <Text style={styles.debugTitle}>Die State Testing</Text>
            <Text style={styles.debugText}>Last Roll: {dieValue || 'None'}</Text>
            <Text style={styles.debugText}>Roll Count: {rollCount}</Text>
            <Text style={styles.debugText}>Is Rolling: {dieState.isRolling ? 'Yes 🎲' : 'No'}</Text>
            <Text style={styles.debugText}>Is Locked: {isLocked ? 'Yes 🔒' : 'No 🔓'}</Text>
            <Text style={styles.debugText}>Consecutive: {dieState.consecutiveRepeats}</Text>
            <Text style={styles.debugText}>Callbacks: {dieState.rollCallbacks.length}</Text>
            <Text style={styles.debugText}>Selected Peg: {selectedPegId || 'None'}</Text>
            <Text style={styles.debugText}>Selectable Pegs: {selectablePegIds.length}</Text>
          </View>
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
      </ScrollView>
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
  scrollContent: {
    flex: 1,
  },
  gameBoard: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 20,
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#333',
    minHeight: 400,
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
  playerColor: {
    fontWeight: '700',
  },
  debugContainer: {
    marginTop: 15,
    padding: 10,
    backgroundColor: 'rgba(255, 165, 2, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFA502',
  },
  debugTitle: {
    color: '#FFA502',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
  },
  debugText: {
    color: '#FFFFFF',
    fontSize: 11,
    marginBottom: 2,
  },
  pegTestContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: 'rgba(46, 213, 115, 0.1)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2ED573',
    alignItems: 'center',
  },
  pegTestTitle: {
    color: '#2ED573',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  pegTestRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    marginBottom: 8,
  },
  pegTestDescription: {
    color: '#FFFFFF',
    fontSize: 11,
    textAlign: 'center',
    opacity: 0.8,
  },
  pegContainer: {
    alignItems: 'center',
    gap: 4,
  },
  pegLabel: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  dieRollInfo: {
    color: '#FFA502',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
});
