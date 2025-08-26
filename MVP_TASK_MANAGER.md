# MVP Task Manager - Trouble Game

## Overview
This document tracks all development tasks for the Trouble Game MVP. Each task is designed to be completed in 1-3 hours of focused work.

**Total Tasks:** 45  
**Estimated Duration:** 8 weeks  
**Target:** 2-player fully functional game

---

## Phase 1: Foundation (Week 1-2)
### Navigation & Routing
- [ ] **#1** Setup Expo Router v5 file structure
  - Create app directory structure
  - Configure _layout files
  - Setup TypeScript paths
  
- [ ] **#2** Create root layout with navigation
  - Implement stack navigator
  - Add tab navigation structure
  - Configure screen transitions
  
- [ ] **#3** Implement home/menu screen
  - Design menu UI
  - Add navigation buttons
  - Create animated logo
  
- [ ] **#4** Create game setup screen
  - Player selection UI
  - Color picker
  - Start game button
  
- [ ] **#5** Add settings screen
  - Sound toggle
  - Haptics toggle
  - Theme selection UI

### State Management
- [ ] **#6** Install and configure Zustand
  - Add zustand dependency
  - Create store directory
  - Setup TypeScript types
  
- [ ] **#7** Create gameStore with initial types
  - Define GameState interface
  - Implement core actions
  - Add player management
  
- [ ] **#8** Implement settingsStore for preferences
  - Sound preferences
  - Haptic preferences
  - Theme settings
  
- [ ] **#9** Add state persistence with MMKV
  - Install react-native-mmkv
  - Create persistence middleware
  - Implement auto-save

### Board Foundation
- [ ] **#10** Create BoardSVG component structure
  - Setup SVG viewport
  - Create component hierarchy
  - Add responsive scaling
  
- [ ] **#11** Generate 56-space track path
  - Calculate space positions
  - Create path coordinates
  - Add space numbering system
  
- [ ] **#12** Add player HOME and START areas
  - Create HOME zones (4 spots each)
  - Position START spaces
  - Add FINISH zones

---

## Phase 2: Core Mechanics (Week 3-4)
### Die System
- [ ] **#13** Create PopOMatic die component
  - Design die container
  - Add pop button
  - Create die face display
  
- [ ] **#14** Implement 3D die roll animation
  - Add rotation animation
  - Create bounce effect
  - Implement settling animation
  
- [ ] **#15** Add die roll state management
  - Roll action in gameStore
  - Lock during animation
  - Result callback system
  
- [ ] **#16** Create die haptic feedback
  - Pop sensation on press
  - Tumble feedback during roll
  - Landing impact

### Peg System
- [ ] **#17** Create Peg component with player colors
  - Design peg shape
  - Implement color variants
  - Add selection highlighting
  
- [ ] **#18** Implement peg selection logic
  - Touch/click detection
  - Valid peg highlighting
  - Selection state management
  
- [ ] **#19** Add peg movement validation
  - Check legal moves
  - Validate destinations
  - Handle blocked paths
  
- [ ] **#20** Create smooth peg animation system
  - Path following animation
  - Easing functions
  - Multi-space movement

### Turn Management
- [ ] **#21** Implement basic turn switching
  - Current player tracking
  - Turn end triggers
  - Player notification
  
- [ ] **#22** Add roll of 6 extra turn logic
  - Detect 6 rolls
  - Grant additional turn
  - Update UI indicators
  
- [ ] **#23** Create turn timeout handling
  - Inactivity timer
  - Auto-pass functionality
  - Warning notifications

---

## Phase 3: Special Features (Week 5)
### Special Spaces
- [ ] **#24** Implement Double Trouble (XX) spaces
  - Mark special spaces on board
  - Add visual indicators
  - Create landing detection
  
- [ ] **#25** Add extra turn logic for Double Trouble
  - Grant bonus roll
  - Limit to 2 extra turns max
  - Update turn counter
  
- [ ] **#26** Create Warp space pairs
  - Position warp spaces
  - Add visual connection
  - Create pair mapping
  
- [ ] **#27** Implement Warp teleportation animation
  - Dissolve effect
  - Transport trail
  - Materialize animation

### Special Rules
- [ ] **#28** Implement roll of 1 special rule
  - Detect roll of 1
  - Allow opponents to move to START
  - Handle blocked START spaces
  
- [ ] **#29** Add opponent capture mechanics
  - Detect landing on opponent
  - Send opponent home
  - Trigger capture animation
  
- [ ] **#30** Create FINISH zone entry validation
  - Check if peg can enter
  - Validate exact count
  - Handle overflow
  
- [ ] **#31** Implement exact count for FINISH
  - Calculate remaining spaces
  - Block invalid moves
  - Suggest alternatives
  
- [ ] **#32** Add peg sent-home animation
  - Shrink and lift effect
  - Trail to HOME
  - Landing animation
  
- [ ] **#33** Create victory condition checking
  - Check all pegs in FINISH
  - Trigger victory sequence
  - Update game state

---

## Phase 4: Polish & UX (Week 6-7)
### Visual Polish
- [ ] **#34** Add peg movement trail effects
  - Motion blur trail
  - Glowing path
  - Fade animation
  
- [ ] **#35** Create capture particle effects
  - Explosion particles
  - Color burst
  - Dispersion animation
  
- [ ] **#36** Implement victory celebration animation
  - Confetti system
  - Peg dance animation
  - Screen effects
  
- [ ] **#37** Add board lighting/shadow effects
  - Dynamic shadows
  - Space highlighting
  - Ambient lighting

### Audio & Feedback
- [ ] **#38** Integrate sound effects system
  - Load audio assets
  - Create sound manager
  - Implement playback system
  
- [ ] **#39** Add background music tracks
  - Menu music
  - Game music
  - Victory fanfare
  
- [ ] **#40** Implement comprehensive haptic patterns
  - Movement feedback
  - Capture vibration
  - Victory celebration
  
- [ ] **#41** Create visual move hints system
  - Highlight valid moves
  - Show path preview
  - Indicate special effects

---

## Phase 5: Testing & Optimization (Week 8)
- [ ] **#42** Add unit tests for game logic
  - Test move validation
  - Test special rules
  - Test win conditions
  
- [ ] **#43** Create integration tests for game flow
  - Full game simulation
  - Edge case handling
  - State persistence
  
- [ ] **#44** Optimize animation performance
  - Profile frame rates
  - Reduce re-renders
  - Optimize SVG updates
  
- [ ] **#45** Fix critical bugs from testing
  - Address crash issues
  - Fix game logic bugs
  - Polish UI glitches

---

## Progress Tracking

### Phase Completion
- [ ] Phase 1: Foundation (0/12 tasks)
- [ ] Phase 2: Core Mechanics (0/11 tasks)
- [ ] Phase 3: Special Features (0/10 tasks)
- [ ] Phase 4: Polish & UX (0/8 tasks)
- [ ] Phase 5: Testing & Optimization (0/4 tasks)

### Overall Progress
**Completed:** 0/45 tasks (0%)

### Milestones
- [ ] **Milestone 1:** MVP Foundation - Basic navigation and state
- [ ] **Milestone 2:** Playable Game - Core mechanics working
- [ ] **Milestone 3:** Feature Complete - All special rules implemented
- [ ] **Milestone 4:** Polished MVP - Ready for beta testing

---

## Notes
- Update checkboxes as tasks are completed
- Add comments for blockers or dependencies
- Track actual vs estimated time for future planning
- Create GitHub issues for each task when starting development

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

*Last Updated: [Date]*  
*Total Estimated Hours: ~90-135 hours*  
*Development Team: 1 developer*