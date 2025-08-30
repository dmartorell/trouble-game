import React, { FC } from 'react';
import { View, StyleSheet } from 'react-native';
import { AnimatedPeg } from '@/components/Peg/AnimatedPeg';
import { Peg, PlayerColor } from '@/models';
import {
  preparePegOverlayData,
  getPegsAtSamePosition,
  getStackedPegPositions,
  PegOverlayData,
  calculateBoardDimensions,
  BoardDimensions,
} from '@/utils/boardCoordinates';

interface PegOverlayProps {
  pegs: Peg[];
  players: Array<{ id: string; color: PlayerColor }>;
  selectablePegIds?: string[];
  onPegPress?: (pegId: string) => void;
  pegSize?: number;
  disabled?: boolean;
  boardDimensions?: BoardDimensions; // Optional: if not provided, will calculate automatically
}

export const PegOverlay: FC<PegOverlayProps> = ({
  pegs,
  players,
  selectablePegIds = [],
  onPegPress,
  pegSize = 24,
  disabled = false,
  boardDimensions,
}) => {
  // Calculate or use provided board dimensions
  const dimensions = boardDimensions || calculateBoardDimensions();

  // Prepare peg data with coordinates (now includes scaling)
  const pegOverlayData = preparePegOverlayData(pegs, players, dimensions.scaleFactor);

  // Group pegs that share the same position for stacking
  const pegGroups = getPegsAtSamePosition(pegOverlayData);

  // Apply stacking offsets to overlapping pegs (now scale-aware)
  const stackedPegData = pegGroups.flatMap(group =>
    getStackedPegPositions(group, pegSize, dimensions.scaleFactor),
  );

  const renderPeg = (pegData: PegOverlayData) => {
    const isSelectable = selectablePegIds.includes(pegData.id);
    const isMovable = isSelectable && !disabled;

    // Apply same offset corrections as DebugOverlay for proper alignment
    const containerMinHeight = 400;
    const boardActualHeight = dimensions.height;
    const verticalOffset = Math.max(0, (containerMinHeight - boardActualHeight) / 2) - 1.5;
    const horizontalOffset = -12;

    // Position the peg absolutely within the overlay
    // Apply offset corrections to match the board positioning
    const pegStyle = {
      position: 'absolute' as const,
      left: pegData.coordinate.x + horizontalOffset - (pegSize + 8) / 2, // Center the peg on coordinate with offset
      top: pegData.coordinate.y + verticalOffset - (pegSize + 8) / 2,
      zIndex: isSelectable ? 5 : 1, // Movable pegs appear on top
    };

    return (
      <View key={pegData.id} style={pegStyle}>
        <AnimatedPeg
          id={pegData.id}
          playerId={pegData.playerId}
          color={pegData.playerColor}
          position={pegData.position}
          size={pegSize}
          isMovable={isMovable}
          onPress={onPegPress}
          onMoveComplete={pegData.animationCallback}
          testID={`overlay-peg-${pegData.id}`}
          isAnimating={pegData.isAnimating || false}
          targetPosition={pegData.targetPosition}
          boardDimensions={dimensions}
          horizontalOffset={horizontalOffset}
          verticalOffset={verticalOffset}
        />
      </View>
    );
  };

  return (
    <View style={[styles.overlay, { width: dimensions.width, height: dimensions.height }]}>
      {stackedPegData.map(renderPeg)}
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    pointerEvents: 'box-none', // Allow touch events to pass through empty areas
  },
});
