import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';

import { useGamePlay } from './resources/useGamePlay';
import { BoardSVG, PopOMatic, PegOverlay, TurnTimer } from '@/components';
import { PLAYER_COLORS } from '@/constants/game';

export const GamePlayScreen = () => {
  const {
    exitGame,
    handleDieRoll,
    handlePegPress,
    handleEndTurn,
    handleSimulateMove,
    isLocked,
    currentPlayer,
    players,
    pegs,
    selectablePegIds,
    selectedPegId,
    currentDieRoll,
    extraTurnsRemaining,
    rollsThisTurn,
    hasMovedSinceRoll,
    boardDimensions,
  } = useGamePlay();

  return (
    <View style={styles.container}>
      {/* Turn Timer */}
      <TurnTimer visible={!!currentPlayer} />

      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={exitGame}
        >
          <Text style={styles.backButtonText}>Exit</Text>
        </Pressable>
        <View style={styles.turnInfo}>
          <Text style={[
            styles.turnIndicator,
            currentPlayer && { color: PLAYER_COLORS[currentPlayer.color] },
          ]}>
            {currentPlayer ? `${currentPlayer.name}'s Turn` : 'Loading...'}
          </Text>
          {extraTurnsRemaining > 0 && (
            <Text style={styles.extraTurnsIndicator}>
              Extra Turns: {extraTurnsRemaining} | Roll {rollsThisTurn}/2
            </Text>
          )}
        </View>
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.gameBoard}>
          <BoardSVG
            width={boardDimensions.width}
            height={boardDimensions.height}
            showSpaceNumbers={false}
          />
          <PegOverlay
            pegs={pegs}
            players={players}
            selectablePegIds={selectablePegIds}
            selectedPegId={selectedPegId || undefined}
            onPegPress={handlePegPress}
            pegSize={24}
            disabled={isLocked}
            boardDimensions={boardDimensions}
          />
        </View>

        <View style={styles.dieContainer}>
          <PopOMatic
            size={120}
            onRoll={handleDieRoll}
            disabled={rollsThisTurn >= 2 || (rollsThisTurn > 0 && (!hasMovedSinceRoll || extraTurnsRemaining === 0))}
          />

          {/* Current Die Roll Display */}
          {currentDieRoll && (
            <View style={styles.gameStatusContainer}>
              <Text style={styles.gameStatusText}>Die Roll: {currentDieRoll}</Text>
              <Text style={styles.gameStatusHint}>
                {selectablePegIds.length > 0
                  ? 'Tap a highlighted peg on the board to move it'
                  : 'No valid moves available'}
              </Text>
            </View>
          )}

          {/* Turn Controls */}
          <View style={styles.controlsContainer}>
            <Pressable
              style={[styles.simulateButton, isLocked && styles.disabledButton]}
              onPress={handleSimulateMove}
              disabled={isLocked || !currentDieRoll || hasMovedSinceRoll}
            >
              <Text style={styles.simulateButtonText}>Simulate Move</Text>
            </Pressable>
            <Pressable
              style={[styles.endTurnButton, isLocked && styles.disabledButton]}
              onPress={handleEndTurn}
              disabled={isLocked}
            >
              <Text style={styles.endTurnButtonText}>End Turn</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.playerInfo}>
          {players.map((player) => {
            const isCurrentPlayer = currentPlayer?.id === player.id;

            return (
              <View
                key={player.id}
                style={[
                  styles.playerCard,
                  isCurrentPlayer && styles.activePlayerCard,
                ]}
              >
                <View
                  style={[
                    styles.playerIndicator,
                    { backgroundColor: PLAYER_COLORS[player.color] },
                    isCurrentPlayer && styles.activePlayerIndicator,
                  ]}
                />
                <Text style={[
                  styles.playerText,
                  isCurrentPlayer && styles.activePlayerText,
                ]}>
                  {player.name}
                </Text>
                {isCurrentPlayer && (
                  <Text style={styles.currentPlayerBadge}>●</Text>
                )}
              </View>
            );
          })}
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
  turnInfo: {
    alignItems: 'center',
  },
  turnIndicator: {
    color: '#FFA502',
    fontSize: 18,
    fontWeight: '700',
  },
  extraTurnsIndicator: {
    color: '#2ED573',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
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
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingBottom: 20,
    gap: 8,
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 130,
  },
  activePlayerCard: {
    backgroundColor: '#2a2a4e',
    borderColor: '#FFA502',
  },
  playerIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  activePlayerIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  playerText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  activePlayerText: {
    color: '#FFA502',
    fontWeight: '700',
  },
  currentPlayerBadge: {
    color: '#2ED573',
    fontSize: 16,
    fontWeight: '700',
  },
  gameStatusContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: 'rgba(255, 165, 2, 0.1)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFA502',
    alignItems: 'center',
  },
  gameStatusText: {
    color: '#FFA502',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  gameStatusHint: {
    color: '#FFFFFF',
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.8,
  },
  controlsContainer: {
    marginTop: 15,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  endTurnButton: {
    backgroundColor: '#FF4757',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FF4757',
  },
  disabledButton: {
    backgroundColor: '#666666',
    borderColor: '#666666',
  },
  simulateButton: {
    backgroundColor: '#2ED573',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#2ED573',
  },
  simulateButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  endTurnButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
});
