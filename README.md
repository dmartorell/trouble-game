# Trouble Game 🎲

A modern mobile implementation of the classic TROUBLE board game, built with React Native and Expo.

## 🎮 Game Overview

TROUBLE is a classic board game where 2-4 players race their pegs around the board while strategically sending opponents back to their starting positions. The first player to get all 4 pegs to the FINISH area wins!

### Key Features
- **POP-O-MATIC Die**: Animated 3D die roller
- **Strategic Gameplay**: Send opponents back to HOME by landing on them
- **Special Spaces**: 
  - Double Trouble (XX) for extra turns
  - Warp spaces for instant teleportation
- **Special Rules**: Roll of 1 lets all other players move a peg to START
- **Smooth Animations**: Professional-grade movement and capture effects
- **Haptic Feedback**: Feel every move and capture
- **Sound Effects**: Immersive audio experience

## 📱 Platform & Requirements

- **Platform**: iOS (iPhone 12 and newer)
- **Orientation**: Portrait only
- **iOS Version**: 14.0+
- **Development**: Expo SDK 53, React Native 0.79.6

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Expo CLI
- iOS Simulator (for Mac) or Expo Go app on iPhone
- Xcode (for iOS builds)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/trouble-game.git
cd trouble-game
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Run on iOS:
```bash
npm run ios
```

Or scan the QR code with Expo Go app on your iPhone.

## 🛠️ Development

### Available Scripts

- `npm start` - Start Expo development server
- `npm run ios` - Build and run on iOS simulator
- `npm run android` - Build and run on Android (future support)
- `npm run web` - Run on web (development only)
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run prebuild` - Generate native projects

### Project Structure

```
trouble-game/
├── src/                    # Source code (to be created)
│   ├── app/               # Expo Router screens
│   ├── components/        # React components
│   ├── store/            # State management (Zustand)
│   ├── utils/            # Game logic and helpers
│   ├── constants/        # Configuration and constants
│   └── hooks/            # Custom React hooks
├── assets/                # Images, sounds, animations
├── ios/                   # iOS native code
├── android/              # Android native code
├── specs/                # Development specifications
└── ia_docs/              # Game rules documentation
```

### Technology Stack

- **Framework**: React Native 0.79.6
- **Runtime**: Expo SDK 53
- **Language**: TypeScript (strict mode)
- **Navigation**: Expo Router v5
- **State Management**: Zustand (planned)
- **Animations**: React Native Reanimated 3 (planned)
- **Audio**: Expo AV
- **Haptics**: Expo Haptics

## 🎯 Game Rules

### Basic Gameplay
1. Roll a **6** to move a peg from HOME to START
2. Move pegs clockwise around the board
3. Land on opponents to send them back to HOME
4. First to get all 4 pegs to FINISH wins!

### Special Features
- **Double Trouble (XX)**: Get an extra turn (max 2 per turn)
- **Warp Spaces**: Instantly teleport to the opposite side
- **Roll of 1**: All other players move a peg to START
- **Exact Count**: Must roll exact number to enter FINISH

For complete rules, see [ia_docs/troubleRules.md](ia_docs/troubleRules.md)

## 📊 Development Status

### Current Phase: Initial Setup ✅
- [x] Project initialization
- [x] Expo and React Native setup
- [x] TypeScript configuration
- [x] Development specifications

### Phase 1: Foundation (In Progress)
- [ ] Navigation structure with Expo Router
- [ ] Zustand store implementation
- [ ] Board SVG creation
- [ ] Basic component structure

### Phase 2: Core Mechanics (Planned)
- [ ] Die component with animations
- [ ] Peg movement system
- [ ] Turn management
- [ ] Basic game rules implementation

### Phase 3: Special Features (Planned)
- [ ] Special spaces (Double Trouble, Warp)
- [ ] Roll of 1 special rule
- [ ] FINISH zone exact count
- [ ] Capture animations

### Phase 4: Polish (Planned)
- [ ]. Advanced animations
- [ ] Sound effects integration
- [ ] Haptic feedback
- [ ] UI/UX refinements

## 🎨 Design Guidelines

### Color Palette
- **Player Colors**: Red (#FF4757), Blue (#3742FA), Yellow (#FFA502), Green (#2ED573)
- **Board**: Light background with white track
- **Special Spaces**: Golden yellow for Double Trouble, Purple for Warp
- **UI**: Dark theme with purple accents

### Performance Targets
- 60 FPS during all animations
- < 16ms frame time for gestures
- < 200MB memory footprint
- < 2 second cold start time

## 📝 Documentation

- [Development Specification](specs/trouble-game-development-spec.md) - Complete technical spec
- [Game Rules](ia_docs/troubleRules.md) - Official game rules
- [Claude Instructions](CLAUDE.md) - AI assistant guidelines

## 🤝 Contributing

This project is currently in active development. Contribution guidelines will be added soon.

## 📄 License

This project is private and proprietary. All rights reserved.

## 👤 Author

Daniel Martorell

## 🙏 Acknowledgments

- Classic TROUBLE board game by Hasbro
- Expo team for the excellent development platform
- React Native community for the amazing framework

---

**Note**: This is an educational project recreating the classic TROUBLE game for mobile platforms. TROUBLE is a trademark of Hasbro, Inc.