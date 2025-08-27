import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Rect, Circle, Path } from 'react-native-svg';

import { BOARD_CONFIG, BOARD_COLORS } from '@/constants/board';

interface BoardSVGProps {
  width?: number;
  height?: number;
}

export const BoardSVG: React.FC<BoardSVGProps> = ({
  width: customWidth,
  height: customHeight,
}) => {
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  // Calculate responsive dimensions
  const availableWidth = Math.min(screenWidth * 0.9, 400);
  const availableHeight = Math.min(screenHeight * 0.6, 400);
  const boardSize = Math.min(availableWidth, availableHeight);

  const width = customWidth || boardSize;
  const height = customHeight || boardSize;
  const viewBox = `0 0 ${BOARD_CONFIG.VIEWPORT_SIZE} ${BOARD_CONFIG.VIEWPORT_SIZE}`;

  // Calculate track path coordinates
  const trackPath = generateTrackPath();

  return (
    <View style={[styles.container, { width, height }]}>
      <Svg
        width={width}
        height={height}
        viewBox={viewBox}
        style={styles.svg}
      >
        {/* Board Background */}
        <Rect
          x={0}
          y={0}
          width={BOARD_CONFIG.VIEWPORT_SIZE}
          height={BOARD_CONFIG.VIEWPORT_SIZE}
          fill={BOARD_COLORS.background}
          rx={20}
        />

        {/* Outer Track */}
        <Path
          d={trackPath}
          fill="none"
          stroke={BOARD_COLORS.trackBorder}
          strokeWidth={BOARD_CONFIG.TRACK_WIDTH + 4}
        />
        <Path
          d={trackPath}
          fill="none"
          stroke={BOARD_COLORS.track}
          strokeWidth={BOARD_CONFIG.TRACK_WIDTH}
        />

        {/* Track Spaces */}
        {renderTrackSpaces()}

        {/* Center Area */}
        <Circle
          cx={BOARD_CONFIG.VIEWPORT_SIZE / 2}
          cy={BOARD_CONFIG.VIEWPORT_SIZE / 2}
          r={BOARD_CONFIG.CENTER_SIZE / 2}
          fill={BOARD_COLORS.background}
          stroke={BOARD_COLORS.trackBorder}
          strokeWidth={2}
        />

        {/* HOME Areas Placeholder */}
        {renderHomeAreas()}

        {/* FINISH Areas Placeholder */}
        {renderFinishAreas()}
      </Svg>
    </View>
  );
};

// Generate the main track path as an SVG path string
function generateTrackPath(): string {

  // Create a rounded rectangle path for the track
  const margin = (BOARD_CONFIG.VIEWPORT_SIZE - BOARD_CONFIG.BOARD_SIZE) / 2;
  const boardSize = BOARD_CONFIG.BOARD_SIZE;
  const cornerRadius = 40;

  return `
    M ${margin + cornerRadius} ${margin}
    L ${margin + boardSize - cornerRadius} ${margin}
    Q ${margin + boardSize} ${margin} ${margin + boardSize} ${margin + cornerRadius}
    L ${margin + boardSize} ${margin + boardSize - cornerRadius}
    Q ${margin + boardSize} ${margin + boardSize} ${margin + boardSize - cornerRadius} ${margin + boardSize}
    L ${margin + cornerRadius} ${margin + boardSize}
    Q ${margin} ${margin + boardSize} ${margin} ${margin + boardSize - cornerRadius}
    L ${margin} ${margin + cornerRadius}
    Q ${margin} ${margin} ${margin + cornerRadius} ${margin}
    Z
  `;
}

// Render track spaces (circles representing each of the 56 spaces)
function renderTrackSpaces() {
  const spaces = [];
  const centerX = BOARD_CONFIG.VIEWPORT_SIZE / 2;
  const centerY = BOARD_CONFIG.VIEWPORT_SIZE / 2;
  const trackRadius = (BOARD_CONFIG.BOARD_SIZE - BOARD_CONFIG.TRACK_WIDTH) / 2;

  for (let i = 0; i < BOARD_CONFIG.TOTAL_SPACES; i++) {
    // Calculate position along the track (clockwise from top)
    const angle = (i / BOARD_CONFIG.TOTAL_SPACES) * 2 * Math.PI - Math.PI / 2;
    const x = centerX + Math.cos(angle) * trackRadius;
    const y = centerY + Math.sin(angle) * trackRadius;

    // Determine space type
    let fill: string = BOARD_COLORS.track;

    if ((BOARD_CONFIG.DOUBLE_TROUBLE_POSITIONS as readonly number[]).includes(i)) {
      fill = BOARD_COLORS.specialSpace;
    } else if ((BOARD_CONFIG.WARP_POSITIONS as readonly { from: number; to: number; }[]).some(warp => warp.from === i || warp.to === i)) {
      fill = BOARD_COLORS.warpSpace;
    }

    spaces.push(
      <Circle
        key={`space-${i}`}
        cx={x}
        cy={y}
        r={BOARD_CONFIG.SPACE_SIZE / 2}
        fill={fill}
        stroke={BOARD_COLORS.trackBorder}
        strokeWidth={1}
      />,
    );
  }

  return spaces;
}

// Render HOME areas (placeholder rectangles)
function renderHomeAreas() {
  const areas = [];
  const margin = 30;
  const areaSize = 80;

  // Player 1 HOME (top-left)
  areas.push(
    <Rect
      key="home-player1"
      x={margin}
      y={margin}
      width={areaSize}
      height={areaSize}
      fill={BOARD_COLORS.homeArea}
      stroke={BOARD_COLORS.trackBorder}
      strokeWidth={2}
      rx={8}
    />,
  );

  // Player 2 HOME (bottom-right)
  areas.push(
    <Rect
      key="home-player2"
      x={BOARD_CONFIG.VIEWPORT_SIZE - margin - areaSize}
      y={BOARD_CONFIG.VIEWPORT_SIZE - margin - areaSize}
      width={areaSize}
      height={areaSize}
      fill={BOARD_COLORS.homeArea}
      stroke={BOARD_COLORS.trackBorder}
      strokeWidth={2}
      rx={8}
    />,
  );

  return areas;
}

// Render FINISH areas (placeholder rectangles)
function renderFinishAreas() {
  const areas = [];
  const centerX = BOARD_CONFIG.VIEWPORT_SIZE / 2;
  const centerY = BOARD_CONFIG.VIEWPORT_SIZE / 2;
  const areaSize = 60;
  const offset = 40;

  // Player 1 FINISH (center-left area)
  areas.push(
    <Rect
      key="finish-player1"
      x={centerX - offset - areaSize}
      y={centerY - areaSize / 2}
      width={areaSize}
      height={areaSize}
      fill={BOARD_COLORS.finishArea}
      stroke={BOARD_COLORS.trackBorder}
      strokeWidth={2}
      rx={8}
    />,
  );

  // Player 2 FINISH (center-right area)
  areas.push(
    <Rect
      key="finish-player2"
      x={centerX + offset}
      y={centerY - areaSize / 2}
      width={areaSize}
      height={areaSize}
      fill={BOARD_COLORS.finishArea}
      stroke={BOARD_COLORS.trackBorder}
      strokeWidth={2}
      rx={8}
    />,
  );

  return areas;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    backgroundColor: 'transparent',
  },
});
