# MVP Task Manager - Trouble Game

## Overview
This document tracks all development tasks for the Trouble Game MVP. Each task is designed to be completed in 1-3 hours of focused work.

**Total Tasks:** 52
**Estimated Duration:** 8 weeks
**Target:** 2-player fully functional game

---

## Phase 1: Foundation (Week 1-2)
### Navigation & Routing
- ✅ **#1** Setup Expo Router v5 file structure
  - Create app directory structure
  - Configure _layout files
  - Setup TypeScript paths

- ✅ **#2** Create root layout with navigation
  - Implement stack navigator
  - Add tab navigation structure
  - Configure screen transitions

- ✅ **#3** Implement home/menu screen
  - Design menu UI
  - Add navigation buttons
  - Create animated logo

- ✅ **#4** Create game setup screen
  - Player selection UI
  - Color picker
  - Start game button

- ✅ **#5** Add settings screen
  - Sound toggle
  - Haptics toggle
  - Theme selection UI

### State Management
- ✅ **#6** Install and configure Zustand
  - Add zustand dependency
  - Create store directory
  - Setup TypeScript types

- ✅ **#7** Create gameStore with initial types
  - Define GameState interface
  - Implement core actions
  - Add player management

- ✅ **#8** Implement settingsStore for preferences
  - Sound preferences
  - Haptic preferences
  - Theme settings

- ✅ **#9** Add state persistence with MMKV
  - Install react-native-mmkv
  - Create persistence middleware
  - Implement auto-save

### Board Foundation
- ✅ **#10** Create BoardSVG component structure
  - Setup SVG viewport
  - Create component hierarchy
  - Add responsive scaling

- ✅ **#11** Redesign board with authentic TROUBLE layout
  - **Track Layout Redesign**
    - Replace rectangular track with rounded square layout
    - Implement proper corner curves instead of sharp angles
    - Calculate authentic space positions following curved path
    - Adjust space distribution to match real board proportions
  - **Special Spaces Implementation**
    - Position 4 Double Trouble (XX) spaces with oval markers
    - Create 4 WARP spaces with diagonal crossing pairs
    - Add proper visual styling for special spaces
  - **Central Die Area**
    - Replace simple circle with square black Pop-O-Matic housing
    - Add proper dimensions and 3D effect styling
    - Position centrally with authentic proportions

- ✅ **#12** Implement player areas and zones
  - **Corner Sections (4 Players)**
    - Create triangular colored backgrounds (Red, Blue, Green, Yellow)
    - Position corners with proper 90-degree sections
    - Add player branding/labels in each corner
  - **HOME Areas**
    - Create 4 circular HOME spaces per player corner
    - Implement proper spacing within triangular sections
    - Add visual depth effects for peg holes
  - **START Positions**
    - Position one START space per player at track entry
    - Add directional arrows and player color coding
    - Mark with distinctive border styling
  - **FINISH Areas**
    - Create linear tracks from main path toward center
    - Implement 4 spaces per player FINISH track
    - Add proper alignment and entry indicators

---

## Phase 2: Core Mechanics (Week 3-4)
### Die System
- ✅ **#13** Create PopOMatic die component
  - Design die container
  - Add pop button
  - Create die face display

- ✅ **#14** Implement 3D die roll animation
  - Add rotation animation
  - Create bounce effect
  - Implement settling animation

- ✅ **#15** Add die roll state management
  - Roll action in gameStore
  - Lock during animation
  - Result callback system

- ✅ **#16** Create die haptic feedback
  - Pop sensation on press
  - Tumble feedback during roll
  - Landing impact

### Peg System
- ✅ **#17** Create Peg component with player colors
  - Design peg shape
  - Implement color variants
  - Add selection highlighting

- ✅ **#18** Implement peg selection logic
  - Touch/click detection
  - Valid peg highlighting
  - Selection state management

- ✅ **#19** Add peg movement validation
  - Check legal moves
  - Validate destinations
  - Handle blocked paths

- ✅ **#20** Create smooth peg animation system
  - Path following animation
  - Easing functions
  - Multi-space movement

### Turn Management
- ✅ **#21** Implement basic turn switching
  - Current player tracking
  - Turn end triggers
  - Player notification

- ✅ **#22** Add roll of 6 extra turn logic
  - Detect 6 rolls
  - Grant additional turn
  - Update UI indicators

- ✅ **#23** Create turn timeout handling
  - Inactivity timer
  - Auto-pass functionality
  - Warning notifications

---

## Phase 2.5: Game Integration (Week 4.5)
### Playable Demo
- ✅ **#24** Create integrated playable demo with 2-4 players (GitHub Issue #42 - COMPLETED 2025-08-30)
  - **Create PegOverlay component** to render pegs positioned over the board
  - **Add coordinate mapping utilities** to convert peg positions to board SVG coordinates
  - **Integrate PegOverlay into GamePlayScreen** with interactive board pegs
  - **Clean up UX** by removing debug containers and improving visual feedback
  - **Fix peg positioning in HOME spaces** - Resolve coordinate system mismatch between BoardSVG responsive scaling and PegOverlay fixed coordinates
  - **Make PegOverlay responsive** - Apply same dimension calculation as BoardSVG to ensure consistent scaling
  - **Update GamePlay screen integration** - Share calculated board dimensions between BoardSVG and PegOverlay components
  - **Enhance coordinate utilities** - Add scaling transformation helpers to boardCoordinates.ts for proper coordinate mapping
  - **Result**: Fully functional game with pegs visible on board, interactive die rolling, and complete turn-based gameplay

- ✅ **#25** Polish basic gameplay UX and visual feedback (GitHub Issue #44 - COMPLETED 2025-08-31)
  - Improve visual feedback for valid peg moves
  - Add clear current player indicators and turn display
  - Enhance peg selection highlighting and hover states
  - Add move confirmation/cancellation options
  - **Task #37 Integration**: Replace golden rim with glowing peg animation for movable pegs
    - Remove current golden border (`#FFD700`) highlighting system
    - Implement subtle pulsing scale animation (1.0 → 1.05 → 1.0) for movable pegs
    - Add soft glow effect using opacity and shadow properties
    - Ensure animation is smooth and non-intrusive (2-3 second cycle)
    - Maintain performance by using React Native Reanimated shared values
    - **Result**: More elegant and eye-catching visual feedback for interactive pegs

- ✅ **#26** Test and refine basic game flow integration (GitHub Issue #46 - COMPLETED 2025-08-31)
  - Validate turn switching works correctly with all mechanics
  - Ensure die roll → peg selection → movement cycle functions properly
  - Fix any integration issues between completed components
  - Test 2, 3, and 4 player scenarios

---

## Phase 3: Special Features (Week 5)
### Special Spaces
- ✅ **#27** Implement Double Trouble (XX) spaces (GitHub Issue #48 - COMPLETED 2025-08-31)
  - Mark special spaces on board
  - Add visual indicators
  - Create landing detection

- ✅ **#28** Add extra turn logic for Double Trouble (COMPLETED as part of Task #27 - 2025-08-31)
  - Grant bonus roll
  - ✅ Unlimited extra turns (corrected rule implementation)
  - Update turn counter

- ✅ **#29** Create Warp space pairs (GitHub Issue #50 - COMPLETED 2025-08-31)
  - Position warp spaces
  - Add visual connection
  - Create pair mapping

- ✅ **#30** Implement Warp teleportation animation (GitHub Issue #52 - COMPLETED 2025-08-31)
  - Dissolve effect
  - Transport trail
  - Materialize animation

### Special Rules
- ✅ **#31** Implement roll of 1 special rule
  - Detect roll of 1
  - Allow opponents to move to START
  - Handle blocked START spaces

- ✅ **#32** Add opponent capture mechanics (GitHub Issue #54 - COMPLETED 2025-08-31)
  - ✅ Detect landing on opponent
  - ✅ Send opponent home
  - ✅ Trigger capture animation

- ✅ **#32.5** Implement lap completion tracking for FINISH entry validation (GitHub Issue #56 - COMPLETED 2025-09-01)
  - ✅ Remove hasCompletedLap requirement from FINISH entry validation
  - ✅ Implement pass-through vs exact-landing detection for FINISH/WARP spaces
  - ✅ Fix WARP vs FINISH priority: WARP on exact landing, FINISH on pass-through
  - ✅ Add space availability checking for blocked FINISH spaces
  - ✅ Remove lap completion tracking from gameStore and Peg model
  - ✅ Add comprehensive test coverage for all FINISH entry scenarios
  - **Result**: Fixed core game mechanic bug where pegs couldn't move to WARP spaces that coincide with FINISH entries

- ✅ **#33** Create FINISH zone entry validation
  - Check if peg can enter
  - Validate exact count
  - Handle overflow

- ✅ **#34** Implement exact count for FINISH
  - Calculate remaining spaces
  - Block invalid moves
  - Suggest alternatives

- [ ] **#35** Add peg sent-home animation
  - Shrink and lift effect
  - Trail to HOME
  - Landing animation

- [ ] **#36** Create victory condition checking
  - Check all pegs in FINISH
  - Trigger victory sequence
  - Update game state

---

## Phase 4: Polish & UX (Week 6-7)
### Visual Polish
- ✅ **#37** Replace golden rim with glowing peg animation for movable pegs *(INTEGRATED INTO TASK #25)*
  - Remove current golden border (`#FFD700`) highlighting system
  - Implement subtle pulsing scale animation (1.0 → 1.05 → 1.0) for movable pegs
  - Add soft glow effect using opacity and shadow properties
  - Ensure animation is smooth and non-intrusive (2-3 second cycle)
  - Maintain performance by using React Native Reanimated shared values
  - **Result**: More elegant and eye-catching visual feedback for interactive pegs
  - **NOTE**: This task has been integrated into Task #25 for better UX coherence

- [ ] **#35** Add peg movement trail effects
  - Motion blur trail
  - Glowing path
  - Fade animation

- [ ] **#36** Create capture particle effects
  - Explosion particles
  - Color burst
  - Dispersion animation

- [ ] **#38** Implement victory celebration animation
  - Confetti system
  - Peg dance animation
  - Screen effects

- [ ] **#39** Add board lighting/shadow effects
  - Dynamic shadows
  - Space highlighting
  - Ambient lighting

### Audio & Feedback
- [ ] **#40** Integrate sound effects system
  - Load audio assets
  - Create sound manager
  - Implement playback system

- [ ] **#41** Add background music tracks
  - Menu music
  - Game music
  - Victory fanfare

- [ ] **#42** Implement comprehensive haptic patterns
  - Movement feedback
  - Capture vibration
  - Victory celebration

- [ ] **#43** Create visual move hints system
  - Highlight valid moves
  - Show path preview
  - Indicate special effects

---

## Phase 5: Testing & Optimization (Week 8)
- [ ] **#48** Add unit tests for game logic
  - Test move validation
  - Test special rules
  - Test win conditions

- [ ] **#49** Create integration tests for game flow
  - Full game simulation
  - Edge case handling
  - State persistence

- [ ] **#50** Optimize animation performance
  - Profile frame rates
  - Reduce re-renders
  - Optimize SVG updates

- [ ] **#51** Fix critical bugs from testing
  - Address crash issues
  - Fix game logic bugs
  - Polish UI glitches

---

## Progress Tracking

### Phase Completion
- ✅ Phase 1: Foundation (12/12 tasks) - 100% Complete
- ✅ Phase 2: Core Mechanics (11/11 tasks) - 100% Complete
- ✅ Phase 2.5: Game Integration (3/3 tasks) - 100% Complete
- [ ] Phase 3: Special Features (9/11 tasks) - 82% Complete
- [ ] Phase 4: Polish & UX (0/9 tasks)
- [ ] Phase 5: Testing & Optimization (0/4 tasks)

### Overall Progress
**Completed:** 34/52 tasks (65%)
**In Progress:** 0/52 tasks (0%)

### Milestones
- ✅ **Milestone 1:** MVP Foundation - Basic navigation and state (100% complete)
- ✅ **Milestone 2:** Core mechanics working (100% complete)
- ✅ **Milestone 2.5:** Integrated Playable Demo - Basic game fully functional (100% complete)
- [ ] **Milestone 3:** Feature Complete - All special rules implemented
- [ ] **Milestone 4:** Polished MVP - Ready for beta testing

---

## Notes
- Update checkboxes as tasks are completed
- Add comments for blockers or dependencies
- Track actual vs estimated time for future planning
- Create GitHub issues for each task when starting development
- **Board Design Reference**: See ai_docs/images/ for authentic TROUBLE board layout examples

## Task Labels
- **High Priority:** Core functionality that blocks other work
- **Medium Priority:** Important features but not blocking
- **Low Priority:** Nice-to-have polish items

## Dependencies
- Phase 2 depends on Phase 1 completion
- Phase 3 can partially run parallel with Phase 2
- Phase 4 requires Phase 2-3 core features
- Phase 5 requires all previous phases

---

*Last Updated: August 2025*
*Total Estimated Hours: ~90-135 hours*
*Development Team: 1 developer*

## Completed Tasks Log
- ✅ **#1** Setup Expo Router v5 file structure (Completed 2025-08-27)
- ✅ **#2** Create root layout with navigation (Completed 2025-08-27)
- ✅ **#3** Implement home/menu screen (Completed 2025-08-27)
- ✅ **#4** Create game setup screen (Completed 2025-08-27)
- ✅ **#5** Add settings screen (Completed 2025-08-27)
- ✅ **#6** Install and configure Zustand (Completed 2025-08-27)
- ✅ **#7** Create gameStore with initial types (Completed 2025-08-27)
- ✅ **#8** Implement settingsStore for preferences (Completed 2025-08-27)
- ✅ **#9** Add state persistence with MMKV (Completed 2025-08-27)
- ✅ **#10** Create BoardSVG component structure (Completed 2025-08-27)
- ✅ **#11** Redesign board with authentic TROUBLE layout (Completed 2025-08-27)
- ✅ **#12** Implement player areas and zones (Completed 2025-08-27)
- ✅ **#13** Create PopOMatic die component (Completed 2025-08-27)
- ✅ **#14** Implement 3D die roll animation (Completed 2025-08-27)
- ✅ **#15** Add die roll state management (Completed 2025-08-28)
- ✅ **#16** Create die haptic feedback (Completed 2025-08-28)
- ✅ **#17** Create Peg component with player colors (Completed 2025-08-28)
- ✅ **#18** Implement peg selection logic (Completed 2025-08-28)
- ✅ **#19** Add peg movement validation (Completed 2025-08-29)
- ✅ **#20** Create smooth peg animation system (Completed 2025-08-29)
- ✅ **#21** Implement basic turn switching (Completed 2025-08-29)
- ✅ **#22** Add roll of 6 extra turn logic (Completed 2025-08-29)
- ✅ **#23** Create turn timeout handling (Completed 2025-08-29)
- ✅ **#31** Implement roll of 1 special rule (Completed 2025-08-30)
- ✅ **#24** Create integrated playable demo with 2-4 players (Completed 2025-08-30)
- ✅ **#25** Polish basic gameplay UX and visual feedback (Completed 2025-08-31)
- ✅ **#26** Test and refine basic game flow integration (Completed 2025-08-31)
- ✅ **#27** Implement Double Trouble (XX) spaces (Completed 2025-08-31)
- ✅ **#28** Add extra turn logic for Double Trouble (Completed 2025-08-31)
- ✅ **#29** Create Warp space pairs (Completed 2025-08-31)
- ✅ **#30** Implement Warp teleportation animation (Completed 2025-08-31)
- ✅ **#32** Add opponent capture mechanics (Completed 2025-08-31)
- ✅ **#32.5** Implement lap completion tracking for FINISH entry validation (Completed 2025-09-01)

**Navigation & Routing Section: 100% Complete**
**State Management Section: 100% Complete (4/4 tasks)** ✅
**Board Foundation Section: 100% Complete (3/3 tasks)** ✅
**Die System Section: 100% Complete (4/4 tasks)** ✅
**Peg System Section: 100% Complete (4/4 tasks)** ✅
**Phase 1 Foundation: COMPLETE** ✅
**Phase 2 Core Mechanics: COMPLETE** ✅ (11/11 tasks - 100% Complete)
**Phase 2.5 Game Integration: COMPLETE** ✅ (3/3 tasks - 100% Complete)
Next: Continue Phase 3 with Task #33 - Create FINISH zone entry validation

---

## Other Minor Tasks

This section contains additional tasks that arise during development and don't fit into the main phases.

- [ ] **User Avatar and Name Selection**
  - Allow users to pick avatar/profile image
  - Enable custom name input for players
  - Store preferences in settings
  - Display in game UI

- [ ] **Forced Roll Logic for Consecutive Non-Special Rolls**
  - Track consecutive rolls without 6 or 1
  - Force a roll of 1 after 6 consecutive non-special rolls
  - Reset counter when 6 or 1 is rolled naturally
  - Update die roll logic in gameStore

- [ ] **Refactor: Extract Functions from Constants Files**
  - Move utility functions out of constants files (e.g., board.ts)
  - Constants files should only contain static data/configurations
  - Create separate utility files for functions like:
    - Board position calculations
    - Space type checking
    - Warp space utilities
  - Update imports throughout the codebase
  - Improves code organization and separation of concerns

- [ ] **Code Cleanup: Check for Duplicate Interfaces and Types**
  - Audit codebase for duplicate interface definitions
  - Identify types defined in multiple locations (e.g., MoveValidationResult)
  - Consolidate duplicate interfaces into single source of truth
  - Update all imports to reference the canonical location
  - Remove redundant type definitions
  - Ensures type consistency and prevents future type mismatches
