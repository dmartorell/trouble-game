# TROUBLE Game Development Specification

## Project Information
- **Game Name**: TROUBLE (iOS Mobile Game)
- **Platform**: iOS (via Expo)
- **Technology Stack**: React Native, Expo SDK 53, TypeScript, Zustand
- **Target Devices**: iPhone 12 and newer
- **Orientation**: Portrait only

## Game Overview
TROUBLE is a classic board game where 2-4 players race their pegs around the board while strategically sending opponents back to their starting positions. The first player to get all 4 pegs to the FINISH area wins.

## MVP Scope (2 Players)

### Core Features
1. **Game Board**
   - 56-space track with special spaces
   - HOME areas for 2 players (opposite sides)
   - START positions for each player
   - FINISH zones with 4 spaces each
   - Double Trouble (XX) spaces for extra turns
   - Warp space pairs for instant transportation

2. **Game Mechanics**
   - POP-O-MATIC die with animated 3D effect
   - Roll of 6 to enter pegs from HOME
   - Exact count required to enter FINISH
   - Capture opponent pegs by landing on them
   - Special roll of 1: all other players move peg to START
   - Maximum 2 extra turns per turn

3. **Visual Features**
   - Smooth peg movement animations
   - 3D die roll animation
   - Capture/sent-home animations
   - Warp teleportation effects
   - Victory celebration animation

4. **User Experience**
   - Haptic feedback for all interactions
   - Sound effects for moves and captures
   - Visual hints for valid moves
   - Turn indicators
   - Game state persistence

## Extended Features (Post-MVP)

### Multiplayer Enhancements
- 3-4 player support
- Online multiplayer via Firebase
- AI opponents with 3 difficulty levels
- Tournament mode
- Spectator mode

### Customization Options
- Multiple board themes (Classic, Modern, Fantasy, Space)
- Custom peg designs and colors
- Unlockable content through achievements
- Seasonal/holiday themes
- Custom rule variations

### Social Features
- Player profiles and avatars
- Friends list and invites
- Leaderboards and statistics
- Replay sharing
- In-game chat (with moderation)

## Technical Architecture

### Project Structure
```
trouble-game/
├── src/
│   ├── app/                    # Expo Router screens
│   │   ├── (tabs)/             # Tab navigation
│   │   │   ├── _layout.tsx
│   │   │   ├── index.tsx       # Home/Menu screen
│   │   │   └── settings.tsx    # Settings screen
│   │   ├── game/               # Game screens
│   │   │   ├── _layout.tsx
│   │   │   ├── [id].tsx        # Dynamic game screen
│   │   │   └── setup.tsx       # Game setup screen
│   │   └── _layout.tsx         # Root layout
│   ├── components/
│   │   ├── Board/
│   │   │   ├── BoardSVG.tsx
│   │   │   ├── Space.tsx
│   │   │   ├── HomeArea.tsx
│   │   │   └── FinishZone.tsx
│   │   ├── Die/
│   │   │   ├── PopOMatic.tsx
│   │   │   ├── DieAnimation.tsx
│   │   │   └── DieValue.tsx
│   │   ├── Peg/
│   │   │   ├── Peg.tsx
│   │   │   ├── PegAnimation.tsx
│   │   │   └── PegGroup.tsx
│   │   └── UI/
│   │       ├── Button.tsx
│   │       ├── Modal.tsx
│   │       └── PlayerIndicator.tsx
│   ├── store/
│   │   ├── gameStore.ts         # Main game state
│   │   ├── settingsStore.ts     # User preferences
│   │   └── types.ts             # TypeScript types
│   ├── utils/
│   │   ├── gameLogic.ts         # Core game rules
│   │   ├── moveValidation.ts    # Move validation
│   │   ├── animations.ts        # Animation helpers
│   │   └── sounds.ts            # Sound management
│   ├── constants/
│   │   ├── board.ts             # Board configuration
│   │   ├── colors.ts            # Theme colors
│   │   └── animations.ts        # Animation configs
│   └── hooks/
│       ├── useGameState.ts
│       ├── useAnimation.ts
│       └── useSound.ts
├── assets/
│   ├── sounds/
│   ├── animations/              # Lottie files
│   └── images/
└── specs/                       # Documentation
```

### State Management (Zustand)

```typescript
interface GameState {
  // Game Status
  gameId: string;
  phase: 'setup' | 'playing' | 'paused' | 'finished';
  currentPlayerIndex: number;
  turnNumber: number;
  
  // Players
  players: Player[];
  
  // Board State
  pegs: Peg[];
  spaces: Space[];
  
  // Dice
  lastDiceRoll: number;
  isRolling: boolean;
  extraTurns: number;
  
  // History
  moveHistory: Move[];
  
  // Actions
  rollDice: () => void;
  movePeg: (pegId: string, targetSpace: number) => void;
  endTurn: () => void;
  resetGame: () => void;
}
```

### Animation System

#### Core Animations
1. **Peg Movement**: Curved path animations using Reanimated 3
2. **Die Roll**: 3D rotation with physics-based settling
3. **Capture Effect**: Peg shrink + particle explosion
4. **Warp Effect**: Dissolve and materialize with trail
5. **Victory**: Confetti + peg celebration dance

#### Performance Targets
- Maintain 60 FPS during all animations
- < 16ms frame time for gesture responses
- Smooth transitions between game states
- No jank during multiple simultaneous animations

### Dependencies

#### Core
- `expo`: ~53.0.22
- `react-native`: 0.79.6
- `typescript`: ~5.8.3
- `zustand`: ^4.5.0

#### Animation & Graphics
- `react-native-reanimated`: ~3.16.0
- `react-native-gesture-handler`: ~2.20.0
- `react-native-svg`: ~15.9.0
- `lottie-react-native`: ~7.0.0
- `react-native-skia`: ~1.5.0 (for advanced effects)

#### Utilities
- `expo-haptics`: ~14.1.4
- `expo-av`: ~15.1.7
- `expo-router`: ~5.1.5
- `react-native-mmkv`: ^3.1.0 (for state persistence)

## UI/UX Design

### Color Palette
```typescript
const colors = {
  primary: {
    red: '#FF4757',
    blue: '#3742FA',
    yellow: '#FFA502',
    green: '#2ED573'
  },
  board: {
    background: '#F1F2F6',
    track: '#FFFFFF',
    specialSpace: '#FFD93D',
    warpSpace: '#6C5CE7'
  },
  ui: {
    background: '#2F3542',
    text: '#FFFFFF',
    accent: '#5F27CD'
  }
};
```

### Typography
- Headers: SF Pro Display Bold
- Body: SF Pro Text Regular
- Numbers: SF Pro Rounded Medium

### Screen Layouts

#### Home Screen
- Animated logo
- Play button (prominent CTA)
- Settings gear icon
- Statistics badge
- Version info

#### Game Board Screen
- Board occupies 70% of screen
- Player info cards at top/bottom
- Die in center overlay
- Turn indicator with timer
- Menu button (pause/quit)

#### Victory Screen
- Winner announcement
- Final positions
- Statistics (moves, captures, etc.)
- Play again / Share buttons

## Sound Design

### Sound Effects
- Die roll: Plastic tumbling sound
- Peg move: Soft tick for each space
- Capture: Comedic "boing" + whoosh
- Warp: Sci-fi teleport sound
- Victory: Triumphant fanfare
- Button tap: Soft click

### Background Music
- Menu: Upbeat, playful tune
- Game: Subtle, tension-building loop
- Victory: Celebration theme

## Performance Requirements

### Load Times
- App launch to menu: < 2 seconds
- Menu to game: < 1 second
- Move execution: < 100ms

### Memory Usage
- Initial load: < 150MB
- During gameplay: < 200MB
- Background state: < 50MB

### Battery Optimization
- Reduce animation complexity on low battery
- Disable haptics below 20% battery
- Lower sound quality on battery saver mode

## Testing Strategy

### Unit Tests
- Game logic functions
- Move validation rules
- State management actions
- Animation timing functions

### Integration Tests
- Full game flow
- Special space interactions
- Win conditions
- State persistence

### E2E Tests
- Complete 2-player game
- All special rules
- Settings changes
- Navigation flow

### Performance Tests
- Animation frame rates
- Memory leaks
- Battery drain
- Network latency (for online features)

## Development Phases

### Phase 1: Foundation (Week 1-2)
- Project setup and configuration
- Basic navigation structure
- Zustand store implementation
- Board SVG creation

### Phase 2: Core Mechanics (Week 3-4)
- Die component with animations
- Peg movement system
- Turn management
- Basic game rules

### Phase 3: Special Features (Week 5)
- Double Trouble spaces
- Warp spaces
- Roll of 1 rule
- Exact count for FINISH

### Phase 4: Polish (Week 6-7)
- Advanced animations
- Sound effects
- Haptic feedback
- UI refinements

### Phase 5: Testing & Optimization (Week 8)
- Bug fixes
- Performance optimization
- Beta testing
- App Store preparation

## Success Metrics

### Technical KPIs
- 60 FPS maintained 95% of the time
- < 1% crash rate
- < 3 second cold start time
- < 200MB memory footprint

### User Experience KPIs
- 4.5+ App Store rating
- < 2% rage quit rate
- 80% game completion rate
- 40% daily return rate

### Business KPIs
- 10,000+ downloads in first month
- 30% conversion to premium features
- 4.2 average sessions per user per week
- 15 minute average session duration

## Risk Mitigation

### Technical Risks
- **Performance on older devices**: Implement quality settings
- **Animation complexity**: Use Reanimated worklets
- **State synchronization**: Implement robust error recovery
- **Memory leaks**: Regular profiling and cleanup

### UX Risks
- **Complex rules**: Interactive tutorial
- **Long game duration**: Quick play mode
- **Rage quits**: Rejoin capability
- **Accessibility**: High contrast mode, larger touch targets

## Future Enhancements

### Version 2.0
- Online multiplayer
- AI opponents
- Tournament mode
- Social features

### Version 3.0
- Custom board editor
- Streaming integration
- AR mode (board overlay)
- Cross-platform play

## Conclusion

This specification outlines the development of a premium TROUBLE game for iOS using modern React Native technologies. The focus on smooth animations, intuitive UX, and robust game mechanics will create an engaging experience that honors the classic board game while adding modern mobile gaming polish.