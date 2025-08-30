# Task 24: Peg Animation Integration Specification

**Status**: NEARLY COMPLETED ⚠️  
**Priority**: High  
**Estimated Time**: 2-3 hours  
**Dependencies**: All Phase 2 tasks completed  

## Problem Statement

Task 24 requires creating an "integrated playable demo with 2-4 players" where pegs are visible on the board with interactive die rolling and complete turn-based gameplay. ~~Currently, when a player rolls 6 and selects a peg from HOME, the game logic works correctly but the peg doesn't visually move on the board.~~

**CURRENT STATUS**: ⚠️ NEARLY COMPLETED - Peg movement with smooth animation effects working correctly. Pegs animate smoothly from HOME to START position and all game mechanics are functional. **Issue discovered**: Minor positioning discrepancy between animation end position and static peg position needs debugging.

### Current State Analysis

**✅ Working Components:**
- ✅ Game flow logic (roll 6 → select peg → execute move)
- ✅ `AnimatedPeg` component with complete animation system  
- ✅ `gameStore.animatePegMove()` sets correct animation state
- ✅ `PegOverlay` component renders pegs on board using `AnimatedPeg`
- ✅ Turn management and die rolling fully functional
- ✅ Animation properties properly passed from game state to visual components
- ✅ HOME position calculation working correctly in `AnimatedPeg`
- ✅ Single animation system (no double movements)
- ✅ Proper turn continuation after peg movement (extra turns on rolling 6)
- ✅ Peg position updates correctly from HOME (-1) to START position
- ✅ Turn timer system with proper visibility and reset behavior
- ✅ Timer starts only when die result is revealed and player has valid moves
- ✅ Timer disappears when player moves or has no valid moves
- ✅ Timer warning state properly cleared between turns and extra turns
- ✅ 30-second turn duration with 5-second warning threshold
- ✅ Smooth peg animation effects working correctly
- ✅ Visual peg transitions from HOME to START and track positions
- ✅ Animation system properly executing with React Native Reanimated

**⚠️ Minor Issue Discovered - Animation Positioning:**
- ❌ **Animation End Position Discrepancy**: Small divergence between where peg animation ends and where peg appears when next die roll is available

## Root Cause

~~**`PegOverlay` renders static `Peg` components that ignore animation properties, while `AnimatedPeg` component exists with full animation capabilities but is unused.**~~

~~**PARTIALLY RESOLVED**: `PegOverlay` now uses `AnimatedPeg` components and animation state is properly managed, but the visual animation effect is not occurring.**~~

~~**CURRENT ISSUE**: The `useEffect` in `AnimatedPeg` that handles animation may be interfering with itself, or the animation timing/reset logic is preventing the smooth transition from being visible.**~~

**⚠️ MOSTLY RESOLVED**: Most animation issues have been resolved. The AnimatedPeg component properly animates peg movements with smooth transitions using React Native Reanimated's `withTiming` animations. **New Issue**: Minor positioning discrepancy between animation end position and static peg rendering position.

## Implementation Plan - MOSTLY COMPLETED ⚠️

### Phase 1: Replace Static with Animated Pegs ✅ COMPLETED

**File**: `src/components/PegOverlay/PegOverlay.tsx`

**Changes Required:** ✅ IMPLEMENTED

1. **Update Import Statement**
   ```typescript
   // Replace this:
   import { Peg as PegComponent } from '@/components/Peg/Peg';
   
   // With this:
   import { AnimatedPeg } from '@/components/Peg/AnimatedPeg';
   ```

2. **Update renderPeg Function**
   ```typescript
   const renderPeg = (pegData: PegOverlayData) => {
     // ... existing logic ...
     
     return (
       <View key={pegData.id} style={pegStyle}>
         <AnimatedPeg
           id={pegData.id}
           playerId={pegData.playerId}
           color={pegData.playerColor}
           position={pegData.position} // Add position prop
           size={pegSize}
           isSelected={isSelected}
           isHighlighted={isSelectable && !isSelected}
           isMovable={isMovable}
           onPress={onPegPress}
           testID={`overlay-peg-${pegData.id}`}
           // Add animation props:
           isAnimating={pegData.isAnimating || false}
           targetPosition={pegData.targetPosition}
           onMoveComplete={pegData.animationCallback}
         />
       </View>
     );
   };
   ```

3. **Update PegOverlayData Interface** (in `src/utils/boardCoordinates.ts`)
   ```typescript
   export interface PegOverlayData {
     id: string;
     playerId: string;
     playerColor: PlayerColor;
     coordinate: BoardCoordinate;
     position: number; // Add this
     isAnimating?: boolean; // Add this
     targetPosition?: number; // Add this  
     animationCallback?: () => void; // Add this
   }
   ```

4. **Update preparePegOverlayData Function**
   ```typescript
   export const preparePegOverlayData = (
     pegs: Peg[],
     players: Array<{ id: string; color: PlayerColor }>,
     scaleFactor: number = 1
   ): PegOverlayData[] => {
     return pegs
       .map((peg): PegOverlayData | null => {
         // ... existing coordinate logic ...
         
         return {
           id: peg.id,
           playerId: peg.playerId,
           playerColor,
           coordinate: scaledCoordinate,
           position: peg.position, // Add this
           isAnimating: peg.isAnimating, // Add this
           targetPosition: peg.targetPosition, // Add this
           animationCallback: peg.animationCallback, // Add this
         };
       })
       .filter((peg): peg is PegOverlayData => peg !== null);
   };
   ```

### Phase 2: Fix HOME Position Calculation ✅ COMPLETED

**File**: `src/components/Peg/AnimatedPeg.tsx`

**Changes Required:** ✅ IMPLEMENTED

1. **Add Import for HOME Position Utility**
   ```typescript
   import { getHomePosition } from '@/utils/boardCoordinates';
   ```

2. **Update getCurrentPosition Function**
   ```typescript
   const getCurrentPosition = (pos: number) => {
     if (pos === -1) {
       // HOME position - calculate actual HOME coordinates
       const player = players.find(p => p.id === playerId);
       if (!player) return { x: 200, y: 200 }; // fallback
       
       // Extract peg index from ID format: player-id-peg-index
       const pegIndex = parseInt(id.split('-')[3]) || 0;
       return getHomePosition(player.color, pegIndex);
     }
     
     if (pos >= 28) {
       // FINISH position - return center for now
       // TODO: Calculate actual FINISH positions based on player color
       return { x: 200, y: 200 };
     }
     
     // Track position
     const spacePos = getSpacePosition(pos);
     return spacePos || { x: 200, y: 200 };
   };
   ```

3. **Add Position Prop to Interface**
   ```typescript
   interface AnimatedPegProps {
     id: string;
     playerId: string;
     color: PlayerColor;
     position: number; // Make this required, not optional
     size?: number;
     isSelected?: boolean;
     isHighlighted?: boolean;
     isMovable?: boolean;
     onPress?: (pegId: string) => void;
     onMoveComplete?: (pegId: string) => void;
     testID?: string;
     // Animation props
     isAnimating?: boolean;
     targetPosition?: number;
     animationConfig?: Partial<MoveAnimationConfig>;
   }
   ```

4. **Update Component to Access Players Data**
   ```typescript
   // Add useGameStore to get players data
   import { useGameStore } from '@/store/gameStore';
   
   export const AnimatedPeg: FC<AnimatedPegProps> = ({
     // ... existing props ...
   }) => {
     const { players } = useGameStore(); // Add this line
     // ... rest of component logic ...
   };
   ```

### Phase 3: Testing & Validation ✅ FULLY COMPLETED

**Test Scenarios:** ✅ ALL PASSED

1. **HOME to START Movement** ✅ FULLY WORKING
   - Player rolls 6 ✅
   - Selects peg in HOME ✅
   - Presses selected peg again ✅
   - ✅ Peg animates smoothly from HOME to START with visual transition

2. **Track Movement** ✅ FULLY WORKING
   - Player with peg on track rolls any number ✅
   - Selects peg and executes move ✅
   - ✅ Animation effect working with smooth peg movement

3. **Multiple Players** ✅ FULLY WORKING
   - Test with 2, 3, and 4 players ✅
   - ✅ Each player's pegs move correctly to their respective START positions
   - ✅ Smooth animation effects for all players

4. **Animation Completion** ✅ FULLY WORKING
   - After movement completes ✅
   - ✅ Turn logic continues correctly (extra turns on rolling 6)
   - ✅ Game state updates properly
   - ✅ Animation callbacks execute correctly

### Phase 4: Fix Animation Positioning Discrepancy ❌ NEEDS IMPLEMENTATION

**Issue Description:**
After peg animation completes and the peg is reset to its static position, there's a small visual discrepancy between where the animation ends and where the peg appears when the next die roll becomes available.

**Root Cause Analysis Needed:**
1. **Animation Reset Logic**: The `animatedX.value = 0; animatedY.value = 0;` reset in AnimatedPeg may not align perfectly with PegOverlay positioning
2. **Coordinate System Mismatch**: Potential difference between animated coordinate calculations and static coordinate calculations
3. **Timing Issue**: Animation completion callback timing might be interfering with position updates
4. **PegOverlay Repositioning**: The PegOverlay might be recalculating positions differently after animation vs during static rendering

**Files to Investigate:**
1. `src/components/Peg/AnimatedPeg.tsx` - Animation reset logic and coordinate calculations
2. `src/components/PegOverlay/PegOverlay.tsx` - Static positioning logic
3. `src/utils/boardCoordinates.ts` - Coordinate calculation utilities
4. `src/store/gameStore.ts` - Animation state management and callbacks

**Debug Steps Required:**
1. Log animation end coordinates vs static positioning coordinates
2. Compare `getCurrentPosition()` calculations in AnimatedPeg with PegOverlay positioning
3. Verify animation callback timing and state updates
4. Check if coordinate scaling or offset calculations differ between animation and static modes

**Expected Fix:**
Ensure perfect alignment between animation end position and static peg position by synchronizing coordinate calculation methods and animation reset logic.

## Expected Outcome - MOSTLY ACHIEVED ⚠️

The gameplay flow **works completely** with smooth animations:

1. ✅ **FULLY WORKING** Player rolls 6 → can select peg from HOME
2. ✅ **FULLY WORKING** Player presses selected peg → movement occurs with smooth animation effect
3. ✅ **MOSTLY WORKING** Peg animates smoothly from HOME to START position (minor positioning discrepancy)
4. ✅ **FULLY WORKING** Movement completes → game state updates
5. ✅ **FULLY WORKING** Turn continues with proper logic (extra turn on 6)
6. ⚠️ **NEARLY COMPLETE** Integrated playable demo with visual polish (minor positioning fix needed)

## Technical Notes

- **No new components needed** - just connecting existing systems
- **Minimal code changes** - focused surgical fixes
- **Maintains all existing functionality** - purely additive changes
- **Uses existing coordinate system** - no position calculation rewrites needed

## Files to Modify

1. `src/components/PegOverlay/PegOverlay.tsx` - Switch to AnimatedPeg
2. `src/utils/boardCoordinates.ts` - Update interface and data preparation
3. `src/components/Peg/AnimatedPeg.tsx` - Fix HOME position calculation

## Risk Assessment

**Low Risk**: Changes are isolated and use existing, tested systems. Animation logic already exists and works - just needs to be connected to the visual layer.

## Success Criteria - MOSTLY COMPLETED ⚠️

- [x] ✅ **Pegs animate visually when moved from HOME to START** (smooth animation working)
- [x] ✅ All existing game logic continues to work
- [x] ✅ Turn system operates correctly with movement
- [x] ✅ Game is fully playable with 2-4 players
- [x] ✅ No regressions in existing functionality
- [x] ✅ Turn timer system working with proper behavior
- [x] ✅ Animation system executing smoothly with React Native Reanimated
- [ ] ❌ **Perfect position alignment between animation end and static peg position** (minor discrepancy discovered)

## Key Issues Resolved During Implementation

1. **Double Animation Issue**: Fixed race condition in store updates that caused pegs to animate twice
2. **Position Reset Problem**: Resolved visual "straight line jump" by properly managing animated position resets
3. **useEffect Dependencies**: Optimized animation triggers to prevent unnecessary re-renders
4. **Animation State Management**: Combined position updates and animation state clearing into atomic operations
5. **Turn Timer Implementation**: Added comprehensive timer system with proper visibility and reset behavior
6. **Timer Warning State Persistence**: Fixed warning state carrying over between turns and extra turns
7. **Timer Start Timing**: Timer now starts only after die result is revealed and when player has valid moves
8. **Warning Timer Memory Leaks**: Fixed lingering setTimeout callbacks from previous timers causing premature warnings
9. **Animation Positioning Conflict**: Fixed positioning conflict between PegOverlay absolute positioning and AnimatedPeg relative animation
10. **Animation Execution**: Resolved React Native Reanimated `withTiming` animations not executing visually

## Issues Still Being Investigated

11. **⚠️ Animation End Position Alignment**: Minor positioning discrepancy between animation completion and static peg rendering - requires coordinate system synchronization

## Implementation Summary

**Files Modified:**
1. ✅ `src/components/PegOverlay/PegOverlay.tsx` - Switched to AnimatedPeg with animation props
2. ✅ `src/utils/boardCoordinates.ts` - Updated interface to include animation properties  
3. ✅ `src/components/Peg/AnimatedPeg.tsx` - Fixed HOME position calculation and animation logic
4. ✅ `src/store/gameStore.ts` - Fixed animation callback to prevent double animations
5. ✅ `src/constants/game.ts` - Updated turn timeout from 20 to 30 seconds
6. ✅ `src/models/index.ts` - Added warningTimer to GameStore interface
7. ✅ `src/store/gameStore.ts` - Enhanced timer system with dual timer tracking and proper cleanup

## Timer System Implementation - COMPLETED ✅

### Timer Features Implemented:
1. **Intelligent Timer Start**: Timer only starts after die animation completes and result is revealed
2. **Conditional Visibility**: Timer only appears when player has valid moves available
3. **Instant Reset on Move**: Timer disappears immediately when player executes a move
4. **Clean State Management**: Warning state properly cleared between turns and extra turns  
5. **Memory Leak Prevention**: Both main timer and warning timer properly cleared to prevent interference
6. **30-Second Duration**: Extended from 20 seconds for better user experience
7. **5-Second Warning**: Red animated warning appears when ≤5 seconds remain
8. **Extra Turn Support**: Timer works correctly with extra turns after rolling 6

### Timer Behavior Flow:
```
Player Turn Start → Roll Die → Die Animation (1.5s) → Result Revealed
  ↓
Check Valid Moves:
  - No valid moves: Turn ends automatically, no timer shown
  - Has valid moves: Start 30-second timer
  ↓  
Player Makes Move → Timer disappears → Turn continues or ends
  ↓
Extra Turn (if rolled 6) → Repeat process with fresh timer
```

## Task 24: NEARLY COMPLETED ⚠️

**WORK COMPLETED**:
1. ✅ **Animation Execution Fixed**: React Native Reanimated `withTiming` animations now execute visually
2. ✅ **Animation Timing Resolved**: Position resets no longer interfere with animation visibility  
3. ✅ **Animation Duration Verified**: Animation duration is sufficient and visible
4. ✅ **Animation Path Validated**: `getCurrentPosition()` calculations working correctly for smooth transitions
5. ✅ **Timer System Implemented**: Complete timer system with proper behavior
6. ✅ **Integration Complete**: Fully playable demo with 2-4 players

**REMAINING WORK**:
7. ❌ **Animation Position Alignment**: Fix minor positioning discrepancy between animation end position and static peg position

---

**TASK 24 STATUS**: ⚠️ **NEARLY COMPLETED** - Fully functional integrated playable demo with smooth peg animations, complete turn-based gameplay, and timer system. Minor positioning alignment issue discovered that needs debugging and fixing.