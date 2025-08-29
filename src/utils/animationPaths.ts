import { getSpacePosition } from '@/constants/board';

export interface AnimationPath {
  x: number;
  y: number;
  progress: number; // 0 to 1
}

export interface MoveAnimationConfig {
  startPosition: number;
  endPosition: number;
  duration: number;
  easing: 'easeOut' | 'easeInOut' | 'linear';
}

export const calculateAnimationPath = (
  startPosition: number,
  endPosition: number,
  segments: number = 20,
): AnimationPath[] => {
  const path: AnimationPath[] = [];

  // Handle HOME to START moves (position -1 to track)
  if (startPosition === -1) {
    // For now, return simple start position
    const endPos = getSpacePosition(endPosition);

    if (endPos) {
      return [
        { x: endPos.x, y: endPos.y, progress: 1 },
      ];
    }

    return [];
  }

  // Handle track to FINISH moves (track to position >= 28)
  if (endPosition >= 28) {
    // For now, return simple end position calculation
    // TODO: Implement FINISH track path calculation
    return [];
  }

  // Calculate path along main track
  const pathPositions = [];
  const totalMoves = endPosition - startPosition;

  // Handle wraparound (e.g., position 26 to position 2)
  if (totalMoves < 0) {
    // First part: from start to end of track (27)
    for (let pos = startPosition; pos <= 27; pos++) {
      pathPositions.push(pos);
    }
    // Second part: from beginning of track (0) to end
    for (let pos = 0; pos <= endPosition; pos++) {
      pathPositions.push(pos);
    }
  } else {
    // Direct path: from start to end
    for (let pos = startPosition; pos <= endPosition; pos++) {
      pathPositions.push(pos);
    }
  }

  // Convert positions to interpolated path points
  for (let i = 0; i <= segments; i++) {
    const progress = i / segments;
    const positionIndex = Math.floor(progress * (pathPositions.length - 1));
    const nextPositionIndex = Math.min(positionIndex + 1, pathPositions.length - 1);

    const currentPos = getSpacePosition(pathPositions[positionIndex]);
    const nextPos = getSpacePosition(pathPositions[nextPositionIndex]);

    if (currentPos && nextPos) {
      // Interpolate between current and next position
      const localProgress = (progress * (pathPositions.length - 1)) - positionIndex;
      const x = currentPos.x + (nextPos.x - currentPos.x) * localProgress;
      const y = currentPos.y + (nextPos.y - currentPos.y) * localProgress;

      path.push({ x, y, progress });
    } else if (currentPos) {
      // Fallback to current position
      path.push({ x: currentPos.x, y: currentPos.y, progress });
    }
  }

  return path;
};

export const getEasingFunction = (type: 'easeOut' | 'easeInOut' | 'linear') => {
  switch (type) {
  case 'easeOut':
    return (t: number) => 1 - Math.pow(1 - t, 3); // Cubic ease-out
  case 'easeInOut':
    return (t: number) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; // Cubic ease-in-out
  case 'linear':
  default:
    return (t: number) => t;
  }
};

export const calculateMoveDuration = (spaces: number, baseSpeed: number = 300): number => {
  // Base duration + scaling factor for longer moves
  return Math.max(300, baseSpeed + (spaces * 50));
};
