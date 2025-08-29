import { Player, Turn } from '@/models';

describe('Turn Management Logic Tests', () => {

  // Helper functions that replicate the core turn switching logic
  const findNextPlayer = (players: Player[], currentPlayerId: string): Player => {
    const currentIndex = players.findIndex(p => p.id === currentPlayerId);
    const nextIndex = (currentIndex + 1) % players.length;
    return players[nextIndex];
  };

  const shouldEndTurn = (turn: Turn, hasValidMoves: boolean): boolean => {
    if (!turn.dieRoll) return false;

    // If no moves available after using the die roll, check for special cases
    if (turn.movesAvailable <= 0) {
      // Check if player rolled a 6 (should get extra turn)
      const rolledSix = turn.dieRoll.value === 6;

      if (rolledSix && turn.extraTurnsRemaining === 0) {
        return false; // Don't end turn, grant extra turn
      }

      return true; // End the turn
    }

    // Check if player has any valid moves remaining
    if (!hasValidMoves) {
      return true;
    }

    return false;
  };

  const advanceTurn = (players: Player[], currentTurn: Turn): Turn => {
    // Check if player has extra turns remaining
    if (currentTurn.extraTurnsRemaining > 0) {
      return {
        ...currentTurn,
        extraTurnsRemaining: currentTurn.extraTurnsRemaining - 1,
        dieRoll: null,
        movesAvailable: 0,
        selectedPegId: null,
      };
    }

    // Advance to next player
    const nextPlayer = findNextPlayer(players, currentTurn.playerId);

    return {
      playerId: nextPlayer.id,
      dieRoll: null,
      movesAvailable: 0,
      extraTurnsRemaining: 0,
      selectedPegId: null,
      rollsThisTurn: 0,
      hasMovedSinceRoll: true,
    };
  };

  const grantExtraTurnForSix = (turn: Turn): Turn => {
    if (turn.dieRoll?.value === 6 && turn.movesAvailable <= 0 && turn.extraTurnsRemaining === 0) {
      return {
        ...turn,
        extraTurnsRemaining: 1,
        dieRoll: null,
        movesAvailable: 0,
        selectedPegId: null,
      };
    }
    return turn;
  };

  // Helper to create test players
  const createPlayers = (count: number = 4): Player[] => {
    const colors = ['red', 'blue', 'yellow', 'green'] as const;
    return Array.from({ length: count }, (_, i) => ({
      id: `player${i + 1}`,
      name: `${colors[i]} Player`,
      color: colors[i],
      isActive: true,
    }));
  };

  describe('Player Advancement Logic', () => {
    it('should find next player in clockwise order with 4 players', () => {
      const players = createPlayers(4);

      expect(findNextPlayer(players, 'player1').id).toBe('player2');
      expect(findNextPlayer(players, 'player2').id).toBe('player3');
      expect(findNextPlayer(players, 'player3').id).toBe('player4');
      expect(findNextPlayer(players, 'player4').id).toBe('player1'); // Wrap around
    });

    it('should work with 2 players', () => {
      const players = createPlayers(2);

      expect(findNextPlayer(players, 'player1').id).toBe('player2');
      expect(findNextPlayer(players, 'player2').id).toBe('player1');
    });

    it('should work with 3 players', () => {
      const players = createPlayers(3);

      expect(findNextPlayer(players, 'player1').id).toBe('player2');
      expect(findNextPlayer(players, 'player2').id).toBe('player3');
      expect(findNextPlayer(players, 'player3').id).toBe('player1');
    });
  });

  describe('Turn End Detection', () => {
    it('should not end turn when no die roll', () => {
      const turn: Turn = {
        playerId: 'player1',
        dieRoll: null,
        movesAvailable: 0,
        extraTurnsRemaining: 0,
        selectedPegId: null,
        rollsThisTurn: 0,
        hasMovedSinceRoll: true,
      };

      expect(shouldEndTurn(turn, false)).toBe(false);
    });

    it('should end turn when no moves available and not rolling 6', () => {
      const turn: Turn = {
        playerId: 'player1',
        dieRoll: { value: 4, timestamp: Date.now() },
        movesAvailable: 0,
        extraTurnsRemaining: 0,
        selectedPegId: null,
        rollsThisTurn: 1,
        hasMovedSinceRoll: true,
      };

      expect(shouldEndTurn(turn, false)).toBe(true);
    });

    it('should not end turn when rolling 6 and no extra turns yet', () => {
      const turn: Turn = {
        playerId: 'player1',
        dieRoll: { value: 6, timestamp: Date.now() },
        movesAvailable: 0,
        extraTurnsRemaining: 0,
        selectedPegId: null,
        rollsThisTurn: 1,
        hasMovedSinceRoll: true,
      };

      expect(shouldEndTurn(turn, false)).toBe(false); // Should grant extra turn
    });

    it('should end turn when rolling 6 but already has extra turns', () => {
      const turn: Turn = {
        playerId: 'player1',
        dieRoll: { value: 6, timestamp: Date.now() },
        movesAvailable: 0,
        extraTurnsRemaining: 1,
        selectedPegId: null,
        rollsThisTurn: 2,
        hasMovedSinceRoll: true,
      };

      expect(shouldEndTurn(turn, false)).toBe(true); // Should end normally
    });

    it('should end turn when no valid moves remain', () => {
      const turn: Turn = {
        playerId: 'player1',
        dieRoll: { value: 3, timestamp: Date.now() },
        movesAvailable: 3,
        extraTurnsRemaining: 0,
        selectedPegId: null,
        rollsThisTurn: 1,
        hasMovedSinceRoll: true,
      };

      expect(shouldEndTurn(turn, false)).toBe(true); // No valid moves
    });

    it('should continue turn when valid moves remain', () => {
      const turn: Turn = {
        playerId: 'player1',
        dieRoll: { value: 3, timestamp: Date.now() },
        movesAvailable: 3,
        extraTurnsRemaining: 0,
        selectedPegId: null,
        rollsThisTurn: 1,
        hasMovedSinceRoll: true,
      };

      expect(shouldEndTurn(turn, true)).toBe(false); // Has valid moves
    });
  });

  describe('Turn Advancement', () => {
    it('should advance to next player when no extra turns', () => {
      const players = createPlayers(4);
      const currentTurn: Turn = {
        playerId: 'player1',
        dieRoll: { value: 4, timestamp: Date.now() },
        movesAvailable: 4,
        extraTurnsRemaining: 0,
        selectedPegId: 'some-peg',
        rollsThisTurn: 1,
        hasMovedSinceRoll: true,
      };

      const newTurn = advanceTurn(players, currentTurn);

      expect(newTurn.playerId).toBe('player2');
      expect(newTurn.dieRoll).toBeNull();
      expect(newTurn.movesAvailable).toBe(0);
      expect(newTurn.extraTurnsRemaining).toBe(0);
      expect(newTurn.selectedPegId).toBeNull();
    });

    it('should use extra turn and stay with same player', () => {
      const players = createPlayers(4);
      const currentTurn: Turn = {
        playerId: 'player1',
        dieRoll: { value: 6, timestamp: Date.now() },
        movesAvailable: 6,
        extraTurnsRemaining: 2,
        selectedPegId: 'some-peg',
        rollsThisTurn: 1,
        hasMovedSinceRoll: true,
      };

      const newTurn = advanceTurn(players, currentTurn);

      expect(newTurn.playerId).toBe('player1'); // Same player
      expect(newTurn.dieRoll).toBeNull();
      expect(newTurn.movesAvailable).toBe(0);
      expect(newTurn.extraTurnsRemaining).toBe(1); // Decremented
      expect(newTurn.selectedPegId).toBeNull();
    });

    it('should advance after using last extra turn', () => {
      const players = createPlayers(4);
      const currentTurn: Turn = {
        playerId: 'player1',
        dieRoll: { value: 4, timestamp: Date.now() },
        movesAvailable: 4,
        extraTurnsRemaining: 1,
        selectedPegId: 'some-peg',
        rollsThisTurn: 1,
        hasMovedSinceRoll: true,
      };

      const newTurn = advanceTurn(players, currentTurn);

      expect(newTurn.playerId).toBe('player1'); // Same player (using last extra turn)
      expect(newTurn.extraTurnsRemaining).toBe(0);

      // Now advance again - should go to next player
      const finalTurn = advanceTurn(players, newTurn);
      expect(finalTurn.playerId).toBe('player2');
    });
  });

  describe('Roll of 6 Extra Turn Logic', () => {
    it('should grant extra turn for rolling 6 with no moves left', () => {
      const turn: Turn = {
        playerId: 'player1',
        dieRoll: { value: 6, timestamp: Date.now() },
        movesAvailable: 0,
        extraTurnsRemaining: 0,
        selectedPegId: 'some-peg',
        rollsThisTurn: 1,
        hasMovedSinceRoll: true,
      };

      const updatedTurn = grantExtraTurnForSix(turn);

      expect(updatedTurn.playerId).toBe('player1');
      expect(updatedTurn.extraTurnsRemaining).toBe(1);
      expect(updatedTurn.dieRoll).toBeNull(); // Reset for new roll
      expect(updatedTurn.movesAvailable).toBe(0);
      expect(updatedTurn.selectedPegId).toBeNull();
    });

    it('should not grant extra turn if already has extra turns', () => {
      const turn: Turn = {
        playerId: 'player1',
        dieRoll: { value: 6, timestamp: Date.now() },
        movesAvailable: 0,
        extraTurnsRemaining: 1,
        selectedPegId: null,
        rollsThisTurn: 1,
        hasMovedSinceRoll: true,
      };

      const updatedTurn = grantExtraTurnForSix(turn);

      expect(updatedTurn).toEqual(turn); // Should not change
    });

    it('should not grant extra turn if moves remaining', () => {
      const turn: Turn = {
        playerId: 'player1',
        dieRoll: { value: 6, timestamp: Date.now() },
        movesAvailable: 3,
        extraTurnsRemaining: 0,
        selectedPegId: null,
        rollsThisTurn: 1,
        hasMovedSinceRoll: true,
      };

      const updatedTurn = grantExtraTurnForSix(turn);

      expect(updatedTurn).toEqual(turn); // Should not change
    });

    it('should not grant extra turn for non-6 rolls', () => {
      const turn: Turn = {
        playerId: 'player1',
        dieRoll: { value: 4, timestamp: Date.now() },
        movesAvailable: 0,
        extraTurnsRemaining: 0,
        selectedPegId: null,
        rollsThisTurn: 1,
        hasMovedSinceRoll: true,
      };

      const updatedTurn = grantExtraTurnForSix(turn);

      expect(updatedTurn).toEqual(turn); // Should not change
    });
  });

  describe('Complete Turn Flow Scenarios', () => {
    it('should handle normal turn progression with 4 players', () => {
      const players = createPlayers(4);
      let currentTurn: Turn = {
        playerId: 'player1',
        dieRoll: null,
        movesAvailable: 0,
        extraTurnsRemaining: 0,
        selectedPegId: null,
        rollsThisTurn: 0,
        hasMovedSinceRoll: true,
      };

      // Simulate 8 turn advances (2 full cycles)
      const expectedOrder = [
        'player2', 'player3', 'player4', 'player1', // First cycle
        'player2', 'player3', 'player4', 'player1', // Second cycle
      ];

      for (const expectedPlayer of expectedOrder) {
        currentTurn = advanceTurn(players, currentTurn);
        expect(currentTurn.playerId).toBe(expectedPlayer);
      }
    });

    it('should handle roll-of-6 scenario correctly', () => {
      const players = createPlayers(2);

      // Player1 rolls 6, uses all moves
      let currentTurn: Turn = {
        playerId: 'player1',
        dieRoll: { value: 6, timestamp: Date.now() },
        movesAvailable: 0,
        extraTurnsRemaining: 0,
        selectedPegId: null,
        rollsThisTurn: 1,
        hasMovedSinceRoll: true,
      };

      // Check if should end turn (should not, due to roll of 6)
      expect(shouldEndTurn(currentTurn, false)).toBe(false);

      // Grant extra turn for rolling 6
      currentTurn = grantExtraTurnForSix(currentTurn);
      expect(currentTurn.extraTurnsRemaining).toBe(1);
      expect(currentTurn.playerId).toBe('player1');

      // Advance turn - should use extra turn, stay with player1
      currentTurn = advanceTurn(players, currentTurn);
      expect(currentTurn.playerId).toBe('player1');
      expect(currentTurn.extraTurnsRemaining).toBe(0);

      // Next advance should go to player2
      currentTurn = advanceTurn(players, currentTurn);
      expect(currentTurn.playerId).toBe('player2');
    });

    it('should handle multiple extra turns correctly', () => {
      const players = createPlayers(3);

      let currentTurn: Turn = {
        playerId: 'player1',
        dieRoll: null,
        movesAvailable: 0,
        extraTurnsRemaining: 3,
        selectedPegId: null,
        rollsThisTurn: 0,
        hasMovedSinceRoll: true,
      };

      const initialPlayer = currentTurn.playerId;

      // Use first extra turn
      currentTurn = advanceTurn(players, currentTurn);
      expect(currentTurn.playerId).toBe(initialPlayer);
      expect(currentTurn.extraTurnsRemaining).toBe(2);

      // Use second extra turn
      currentTurn = advanceTurn(players, currentTurn);
      expect(currentTurn.playerId).toBe(initialPlayer);
      expect(currentTurn.extraTurnsRemaining).toBe(1);

      // Use third extra turn
      currentTurn = advanceTurn(players, currentTurn);
      expect(currentTurn.playerId).toBe(initialPlayer);
      expect(currentTurn.extraTurnsRemaining).toBe(0);

      // Now should advance to next player
      currentTurn = advanceTurn(players, currentTurn);
      expect(currentTurn.playerId).toBe('player2');
    });
  });
});
