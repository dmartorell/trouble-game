import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useGamePlay } from './resources/useGamePlay';
import { BoardSVG, PopOMatic, PegOverlay, TurnTimer, VictoryModal } from '@/components';
import { WarpTrail } from '@/components/WarpTrail';
import { PLAYER_COLORS } from '@/constants/game';

export const GamePlayScreen = () => {
  const insets = useSafeAreaInsets();
  const {
    exitGame,
    handleDieRoll,
    handlePegPress,
    handlePlayAgain,
    isLocked,
    currentPlayer,
    players,
    pegs,
    winner,
    selectablePegIds,
    extraTurnsRemaining,
    rollsThisTurn,
    hasMovedSinceRoll,
    startTime,
    boardDimensions,
  } = useGamePlay();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
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
        </View>
      </View>

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

      {/* Victory Modal */}
      <VictoryModal
        visible={!!winner}
        winner={winner || null}
        players={players}
        pegs={pegs}
        gameDuration={startTime > 0 ? Math.floor((Date.now() - startTime) / 1000) : 0}
        onPlayAgain={handlePlayAgain}
      />
    </View>
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
  gameBoard: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 20,
    minHeight: 400,
  },
  dieContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 15,
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
