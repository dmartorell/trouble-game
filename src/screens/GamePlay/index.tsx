import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';

import { useGamePlay } from './resources/useGamePlay';
import { BoardSVG, PopOMatic, PegOverlay, TurnTimer } from '@/components';
import { WarpTrail } from '@/components/WarpTrail';
import { PLAYER_COLORS } from '@/constants/game';

export const GamePlayScreen = () => {
  const {
    exitGame,
    handleDieRoll,
    handlePegPress,
    isLocked,
    currentPlayer,
    players,
    pegs,
    selectablePegIds,
    extraTurnsRemaining,
    rollsThisTurn,
    hasMovedSinceRoll,
    startTime,
    boardDimensions,
  } = useGamePlay();

  return (
    <View style={styles.container}>
      {/* Turn Timer */}
      <TurnTimer visible={!!currentPlayer && startTime > 0} />

      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={exitGame}
        >
          <Text style={styles.backButtonText}>Exit</Text>
        </Pressable>
        <View style={styles.turnInfo}>
          <View style={[
            styles.currentPlayerContainer,
            currentPlayer && { borderColor: PLAYER_COLORS[currentPlayer.color] },
          ]}>
            {currentPlayer && (
              <View
                style={[
                  styles.currentPlayerColorDot,
                  { backgroundColor: PLAYER_COLORS[currentPlayer.color] },
                ]}
              />
            )}
            <Text style={[
              styles.turnIndicator,
              currentPlayer && { color: PLAYER_COLORS[currentPlayer.color] },
            ]}>
              {currentPlayer ? `${currentPlayer.name}'s Turn` : 'Loading...'}
            </Text>
          </View>
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
            onPegPress={handlePegPress}
            pegSize={24}
            disabled={isLocked}
            boardDimensions={boardDimensions}
          />
          {/* Render WarpTrail for any peg that's warping */}
          {pegs.filter(p => p.warpFrom !== undefined && p.warpTo !== undefined).map(peg => (
            <WarpTrail
              key={`warp-${peg.id}`}
              fromSpace={peg.warpFrom!}
              toSpace={peg.warpTo!}
              isActive={true}
              duration={800}
              scaleFactor={boardDimensions.scaleFactor}
            />
          ))}
        </View>

        <View style={styles.dieContainer}>
          <PopOMatic
            size={120}
            onRoll={handleDieRoll}
            disabled={
              (rollsThisTurn >= 2 && extraTurnsRemaining === 0) ||
              (rollsThisTurn > 0 && (!hasMovedSinceRoll || extraTurnsRemaining === 0))
            }
          />

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
  currentPlayerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFA502',
    backgroundColor: 'rgba(255, 165, 2, 0.1)',
    gap: 8,
  },
  currentPlayerColorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  turnIndicator: {
    color: '#FFA502',
    fontSize: 16,
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
  controlsContainer: {
    marginTop: 15,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  disabledButton: {
    backgroundColor: '#666666',
    borderColor: '#666666',
  },
});
