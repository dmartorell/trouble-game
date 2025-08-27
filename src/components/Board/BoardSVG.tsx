import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, {
  Rect,
  Circle,
  Path,
  Text,
  G,
  Ellipse,
  Polygon,
  Defs,
  LinearGradient,
  Stop,
  RadialGradient,
} from 'react-native-svg';

import { BOARD_CONFIG, calculateTrackSpacePositions, getFinishTrackPositions } from '@/constants/board';

interface BoardSVGProps {
  width?: number;
  height?: number;
  showSpaceNumbers?: boolean; // For debugging
}

export const BoardSVG: React.FC<BoardSVGProps> = ({
  width: customWidth,
  height: customHeight,
  showSpaceNumbers = false,
}) => {
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  // Calculate responsive dimensions
  const availableWidth = Math.min(screenWidth * 0.95, 400);
  const availableHeight = Math.min(screenHeight * 0.7, 400);
  const boardSize = Math.min(availableWidth, availableHeight);

  const width = customWidth || boardSize;
  const height = customHeight || boardSize;
  const viewBox = `0 0 ${BOARD_CONFIG.VIEWPORT_SIZE} ${BOARD_CONFIG.VIEWPORT_SIZE}`;

  return (
    <View style={[styles.container, { width, height }]}>
      <Svg
        width={width}
        height={height}
        viewBox={viewBox}
        style={styles.svg}
      >
        {/* Define gradients for 3D effects */}
        <Defs>
          {renderGradients()}
        </Defs>

        {/* Board Background */}
        <Rect
          x={0}
          y={0}
          width={BOARD_CONFIG.VIEWPORT_SIZE}
          height={BOARD_CONFIG.VIEWPORT_SIZE}
          fill="#2c2c2c"
        />

        {/* Colored Corner Triangles for Players */}
        {renderPlayerCorners()}

        {/* Main Track Path with white background */}
        {renderMainTrack()}

        {/* Track Spaces */}
        {renderTrackSpaces(showSpaceNumbers)}

        {/* HOME Areas in corners */}
        {renderHomeAreas()}

        {/* FINISH Tracks extending toward center */}
        {renderFinishTracks()}

        {/* Pop-O-Matic Die Housing (Center) */}
        {renderPopOMaticDie()}
      </Svg>
    </View>
  );
};

// Render gradient definitions for 3D effects
function renderGradients() {
  return (
    <>
      <RadialGradient id="popOMaticGradient" cx="50%" cy="30%" r="60%">
        <Stop offset="0%" stopColor="#4a4a4a" />
        <Stop offset="100%" stopColor="#1a1a1a" />
      </RadialGradient>
      <LinearGradient id="redGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#ff6b6b" />
        <Stop offset="100%" stopColor="#cc2e2e" />
      </LinearGradient>
      <LinearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#6b9bff" />
        <Stop offset="100%" stopColor="#2e5ecc" />
      </LinearGradient>
      <LinearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#6bff6b" />
        <Stop offset="100%" stopColor="#2ecc2e" />
      </LinearGradient>
      <LinearGradient id="yellowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#ffeb6b" />
        <Stop offset="100%" stopColor="#ccb82e" />
      </LinearGradient>
    </>
  );
}

// Render colored corner triangles for each player
function renderPlayerCorners() {
  const size = BOARD_CONFIG.VIEWPORT_SIZE;
  const cornerSize = size * 0.35; // Corner triangles take up 35% of board

  return (
    <G>
      {/* Red Player - Top Left */}
      <Polygon
        points={`0,0 ${cornerSize},0 0,${cornerSize}`}
        fill="url(#redGradient)"
        opacity={0.9}
      />

      {/* Blue Player - Top Right */}
      <Polygon
        points={`${size},0 ${size},${cornerSize} ${size - cornerSize},0`}
        fill="url(#blueGradient)"
        opacity={0.9}
      />

      {/* Green Player - Bottom Right */}
      <Polygon
        points={`${size},${size} ${size - cornerSize},${size} ${size},${size - cornerSize}`}
        fill="url(#greenGradient)"
        opacity={0.9}
      />

      {/* Yellow Player - Bottom Left */}
      <Polygon
        points={`0,${size} 0,${size - cornerSize} ${cornerSize},${size}`}
        fill="url(#yellowGradient)"
        opacity={0.9}
      />
    </G>
  );
}

// Render the main white track path
function renderMainTrack() {
  const trackMargin = 60;
  const size = BOARD_CONFIG.VIEWPORT_SIZE - (trackMargin * 2);
  const cornerRadius = 50;
  const trackWidth = 65;

  // Outer track border
  const outerPath = `
    M ${trackMargin + cornerRadius} ${trackMargin}
    L ${trackMargin + size - cornerRadius} ${trackMargin}
    Q ${trackMargin + size} ${trackMargin} ${trackMargin + size} ${trackMargin + cornerRadius}
    L ${trackMargin + size} ${trackMargin + size - cornerRadius}
    Q ${trackMargin + size} ${trackMargin + size} ${trackMargin + size - cornerRadius} ${trackMargin + size}
    L ${trackMargin + cornerRadius} ${trackMargin + size}
    Q ${trackMargin} ${trackMargin + size} ${trackMargin} ${trackMargin + size - cornerRadius}
    L ${trackMargin} ${trackMargin + cornerRadius}
    Q ${trackMargin} ${trackMargin} ${trackMargin + cornerRadius} ${trackMargin}
    Z
  `;

  // Inner track border (for creating the track ring)
  const innerMargin = trackMargin + trackWidth;
  const innerSize = size - (trackWidth * 2);
  const innerPath = `
    M ${innerMargin + cornerRadius} ${innerMargin}
    L ${innerMargin + innerSize - cornerRadius} ${innerMargin}
    Q ${innerMargin + innerSize} ${innerMargin} ${innerMargin + innerSize} ${innerMargin + cornerRadius}
    L ${innerMargin + innerSize} ${innerMargin + innerSize - cornerRadius}
    Q ${innerMargin + innerSize} ${innerMargin + innerSize} ${innerMargin + innerSize - cornerRadius} ${innerMargin + innerSize}
    L ${innerMargin + cornerRadius} ${innerMargin + innerSize}
    Q ${innerMargin} ${innerMargin + innerSize} ${innerMargin} ${innerMargin + innerSize - cornerRadius}
    L ${innerMargin} ${innerMargin + cornerRadius}
    Q ${innerMargin} ${innerMargin} ${innerMargin + cornerRadius} ${innerMargin}
    Z
  `;

  return (
    <G>
      {/* Track background */}
      <Path
        d={`${outerPath} ${innerPath}`}
        fillRule="evenodd"
        fill="#f8f8f8"
        stroke="#333"
        strokeWidth={2}
      />
    </G>
  );
}

// Render track spaces with authentic TROUBLE board styling (28 spaces)
function renderTrackSpaces(showNumbers: boolean = false) {
  const spaces: React.ReactElement[] = [];
  const positions = calculateTrackSpacePositions(); // Now returns 28 positions

  positions.forEach(({ x, y, index }) => {
    // Determine space type based on authentic TROUBLE layout
    const isDoubleTrouble = BOARD_CONFIG.DOUBLE_TROUBLE_POSITIONS.includes(index as 0 | 7 | 14 | 21); // [6, 13, 20, 27]
    const isStart = BOARD_CONFIG.START_POSITIONS.includes(index as 4 | 11 | 18 | 25); // [0, 7, 14, 21]
    const isWarp = BOARD_CONFIG.WARP_POSITIONS.some(warp => warp.from === index || warp.to === index);

    if (isDoubleTrouble) {
      // Double Trouble (XX) spaces - white ovals every 7 spaces
      spaces.push(
        <G key={`space-${index}`}>
          <Ellipse
            cx={x}
            cy={y}
            rx={16}
            ry={12}
            fill="#ffffff"
            stroke="#000000"
            strokeWidth={2}
          />
          <Text
            x={x}
            y={y + 4}
            fontSize="12"
            fill="#000000"
            textAnchor="middle"
            fontWeight="bold"
          >
            XX
          </Text>
        </G>,
      );
    } else if (isStart) {
      // START positions - colored and highlighted, part of main track (no text label)
      // Map specific positions to specific colors: 25=RED, 4=BLUE, 11=GREEN, 18=YELLOW
      const colorMap: { [key: number]: string } = {
        25: '#cc2e2e', // RED
        4: '#2e5ecc',  // BLUE
        11: '#2ecc2e', // GREEN
        18: '#ccb82e',  // YELLOW
      };
      const color = colorMap[index];

      spaces.push(
        <G key={`space-${index}`}>
          <Circle
            cx={x}
            cy={y}
            r={12}
            fill={color}
            stroke="#ffffff"
            strokeWidth={3}
          />
          <Circle
            cx={x}
            cy={y}
            r={8}
            fill="#1a1a1a"
          />
        </G>,
      );
    } else if (isWarp) {
      // Warp spaces - positioned right before START spaces, diagonal pairs
      spaces.push(
        <G key={`space-${index}`}>
          <Ellipse
            cx={x}
            cy={y}
            rx={14}
            ry={10}
            fill="#6C5CE7"
            stroke="#ffffff"
            strokeWidth={2}
          />
          <Circle
            cx={x}
            cy={y}
            r={6}
            fill="#1a1a1a"
          />
          {/* Warp indicator */}
          <Text
            x={x}
            y={y + 3}
            fontSize="8"
            fill="#ffffff"
            textAnchor="middle"
            fontWeight="bold"
          >
            ⚡
          </Text>
        </G>,
      );
    } else {
      // Regular track spaces - dark circular holes
      spaces.push(
        <G key={`space-${index}`}>
          <Circle
            cx={x}
            cy={y}
            r={10}
            fill="#0a0a0a"
            stroke="#333333"
            strokeWidth={1}
          />
          <Circle
            cx={x}
            cy={y}
            r={8}
            fill="#1a1a1a"
          />
        </G>,
      );
    }

    // Debug numbers - show space indices
    if (showNumbers) {
      spaces.push(
        <Text
          key={`label-${index}`}
          x={x}
          y={y + 3}
          fontSize="8"
          fill="#fff"
          textAnchor="middle"
          fontWeight="bold"
          stroke="#000"
          strokeWidth={0.5}
        >
          {index}
        </Text>,
      );
    }
  });

  return <G>{spaces}</G>;
}

// Render HOME areas with 4 circles per player, positioned properly within triangular corners
function renderHomeAreas() {
  const areas: React.ReactElement[] = [];
  const pegRadius = 10;
  const size = BOARD_CONFIG.VIEWPORT_SIZE;
  const cornerSize = size * 0.35; // Same as triangle size

  // Position circles within the triangular boundaries
  // For each triangle, we need to stay within the diagonal constraint
  const spacing = 30; // Increased space between circles for better padding
  const margin = 30; // Increased margin from triangle edges

  // Red Player HOME (top-left triangular corner)
  // Triangle points: (0,0), (cornerSize,0), (0,cornerSize)
  const redPositions = [
    { x: margin, y: margin }, // Top-left
    { x: margin + spacing, y: margin }, // Top-right
    { x: margin, y: margin + spacing }, // Bottom-left
    { x: margin + spacing, y: margin + spacing }, // Bottom-right (ensure within triangle)
  ];

  redPositions.forEach((pos, i) => {
    // Check if position is within triangular boundary: x + y <= cornerSize
    if (pos.x + pos.y <= cornerSize - pegRadius) {
      areas.push(
        <G key={`red-home-${i}`}>
          <Circle
            cx={pos.x}
            cy={pos.y}
            r={pegRadius + 2}
            fill="#cc2e2e"
            stroke="#ffffff"
            strokeWidth={2}
            opacity={0.9}
          />
          <Circle
            cx={pos.x}
            cy={pos.y}
            r={pegRadius - 2}
            fill="#1a1a1a"
          />
        </G>,
      );
    }
  });

  // Blue Player HOME (top-right triangular corner)
  // Triangle points: (size,0), (size-cornerSize,0), (size,cornerSize)
  const bluePositions = [
    { x: size - margin, y: margin }, // Top-right
    { x: size - margin - spacing, y: margin }, // Top-left
    { x: size - margin, y: margin + spacing }, // Bottom-right
    { x: size - margin - spacing, y: margin + spacing }, // Bottom-left
  ];

  bluePositions.forEach((pos, i) => {
    // Check if position is within triangular boundary: (size - x) + y <= cornerSize
    if ((size - pos.x) + pos.y <= cornerSize - pegRadius) {
      areas.push(
        <G key={`blue-home-${i}`}>
          <Circle
            cx={pos.x}
            cy={pos.y}
            r={pegRadius + 2}
            fill="#2e5ecc"
            stroke="#ffffff"
            strokeWidth={2}
            opacity={0.9}
          />
          <Circle
            cx={pos.x}
            cy={pos.y}
            r={pegRadius - 2}
            fill="#1a1a1a"
          />
        </G>,
      );
    }
  });

  // Green Player HOME (bottom-right triangular corner)
  // Triangle points: (size,size), (size-cornerSize,size), (size,size-cornerSize)
  const greenPositions = [
    { x: size - margin, y: size - margin }, // Bottom-right
    { x: size - margin - spacing, y: size - margin }, // Bottom-left
    { x: size - margin, y: size - margin - spacing }, // Top-right
    { x: size - margin - spacing, y: size - margin - spacing }, // Top-left
  ];

  greenPositions.forEach((pos, i) => {
    // Check if position is within triangular boundary: (size - x) + (size - y) <= cornerSize
    if ((size - pos.x) + (size - pos.y) <= cornerSize - pegRadius) {
      areas.push(
        <G key={`green-home-${i}`}>
          <Circle
            cx={pos.x}
            cy={pos.y}
            r={pegRadius + 2}
            fill="#2ecc2e"
            stroke="#ffffff"
            strokeWidth={2}
            opacity={0.9}
          />
          <Circle
            cx={pos.x}
            cy={pos.y}
            r={pegRadius - 2}
            fill="#1a1a1a"
          />
        </G>,
      );
    }
  });

  // Yellow Player HOME (bottom-left triangular corner)
  // Triangle points: (0,size), (cornerSize,size), (0,size-cornerSize)
  const yellowPositions = [
    { x: margin, y: size - margin }, // Bottom-left
    { x: margin + spacing, y: size - margin }, // Bottom-right
    { x: margin, y: size - margin - spacing }, // Top-left
    { x: margin + spacing, y: size - margin - spacing }, // Top-right
  ];

  yellowPositions.forEach((pos, i) => {
    // Check if position is within triangular boundary: x + (size - y) <= cornerSize
    if (pos.x + (size - pos.y) <= cornerSize - pegRadius) {
      areas.push(
        <G key={`yellow-home-${i}`}>
          <Circle
            cx={pos.x}
            cy={pos.y}
            r={pegRadius + 2}
            fill="#ccb82e"
            stroke="#ffffff"
            strokeWidth={2}
            opacity={0.9}
          />
          <Circle
            cx={pos.x}
            cy={pos.y}
            r={pegRadius - 2}
            fill="#1a1a1a"
          />
        </G>,
      );
    }
  });

  return <G>{areas}</G>;
}

// Render FINISH tracks extending from main track toward center
function renderFinishTracks() {
  const tracks: React.ReactElement[] = [];
  const colors = {
    red: '#cc2e2e',
    blue: '#2e5ecc',
    green: '#2ecc2e',
    yellow: '#ccb82e',
  };

  // Render FINISH tracks for each player
  Object.keys(colors).forEach(playerColor => {
    const positions = getFinishTrackPositions(playerColor as 'red' | 'blue' | 'green' | 'yellow');
    const color = colors[playerColor as keyof typeof colors];

    positions.forEach(({ x, y, index }) => {
      tracks.push(
        <G key={`${playerColor}-finish-${index}`}>
          <Circle
            cx={x}
            cy={y}
            r={9}
            fill={color}
            stroke="#ffffff"
            strokeWidth={2}
          />
          <Circle
            cx={x}
            cy={y}
            r={6}
            fill="#1a1a1a"
          />
        </G>,
      );
    });
  });

  return <G>{tracks}</G>;
}

// Render the Pop-O-Matic die housing (rotated 45 degrees like in reference image)
function renderPopOMaticDie() {
  const centerX = BOARD_CONFIG.VIEWPORT_SIZE / 2;
  const centerY = BOARD_CONFIG.VIEWPORT_SIZE / 2;
  const housingSize = 70;
  const cornerRadius = 15;

  return (
    <G>
      {/* Black housing base - rotated 45 degrees */}
      <Rect
        x={centerX - housingSize / 2}
        y={centerY - housingSize / 2}
        width={housingSize}
        height={housingSize}
        fill="url(#popOMaticGradient)"
        stroke="#000000"
        strokeWidth={3}
        rx={cornerRadius}
        transform={`rotate(45 ${centerX} ${centerY})`}
      />

      {/* Clear dome effect - circular to match rotated housing */}
      <Circle
        cx={centerX}
        cy={centerY - 3}
        r={housingSize / 2 - 8}
        fill="#ffffff"
        opacity={0.15}
      />

      {/* Die placeholder - kept square, not rotated */}
      <Rect
        x={centerX - 12}
        y={centerY - 12}
        width={24}
        height={24}
        fill="#ffffff"
        stroke="#000000"
        strokeWidth={1}
        rx={3}
      />

      {/* Die dots (showing 6) - positions unchanged */}
      <G>
        <Circle cx={centerX - 6} cy={centerY - 6} r={2} fill="#000" />
        <Circle cx={centerX - 6} cy={centerY} r={2} fill="#000" />
        <Circle cx={centerX - 6} cy={centerY + 6} r={2} fill="#000" />
        <Circle cx={centerX + 6} cy={centerY - 6} r={2} fill="#000" />
        <Circle cx={centerX + 6} cy={centerY} r={2} fill="#000" />
        <Circle cx={centerX + 6} cy={centerY + 6} r={2} fill="#000" />
      </G>
    </G>
  );
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
