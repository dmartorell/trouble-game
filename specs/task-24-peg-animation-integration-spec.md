# Task 24: Peg Animation Integration Specification

**Status**: PARTIALLY COMPLETED ⚠️  
**Priority**: High  
**Estimated Time**: 2-3 hours  
**Dependencies**: All Phase 2 tasks completed  

## Problem Statement

Task 24 requires creating an "integrated playable demo with 2-4 players" where pegs are visible on the board with interactive die rolling and complete turn-based gameplay. ~~Currently, when a player rolls 6 and selects a peg from HOME, the game logic works correctly but the peg doesn't visually move on the board.~~

**CURRENT STATUS**: Peg movement logic works correctly (pegs appear at START position after selection), but there is no smooth animation effect - pegs jump instantly from HOME to START position.

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

**⚠️ Issues Remaining:**
- ❌ **No smooth animation effect**: Pegs jump instantly instead of animating smoothly
- ❌ Animation system not visually executing despite correct state management

## Root Cause

~~**`PegOverlay` renders static `Peg` components that ignore animation properties, while `AnimatedPeg` component exists with full animation capabilities but is unused.**~~

**PARTIALLY RESOLVED**: `PegOverlay` now uses `AnimatedPeg` components and animation state is properly managed, but the visual animation effect is not occurring.

**CURRENT ISSUE**: The `useEffect` in `AnimatedPeg` that handles animation may be interfering with itself, or the animation timing/reset logic is preventing the smooth transition from being visible.

## Implementation Plan - PARTIALLY COMPLETED ⚠️

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

### Phase 3: Testing & Validation ⚠️ PARTIALLY COMPLETED

**Test Scenarios:** ⚠️ SOME PASSED, ANIMATION ISSUE REMAINS

1. **HOME to START Movement** ⚠️ PARTIALLY WORKING
   - Player rolls 6 ✅
   - Selects peg in HOME ✅
   - Presses selected peg again ✅
   - ❌ Peg jumps instantly from HOME to START (no smooth animation)

2. **Track Movement** ⚠️ NEEDS TESTING
   - Player with peg on track rolls any number ✅
   - Selects peg and executes move ✅
   - ❌ Animation effect needs verification

3. **Multiple Players** ✅ WORKING
   - Test with 2, 3, and 4 players ✅
   - ✅ Each player's pegs move correctly to their respective START positions
   - ❌ No smooth animation effect

4. **Animation Completion** ✅ WORKING
   - After movement completes ✅
   - ✅ Turn logic continues correctly (extra turns on rolling 6)
   - ✅ Game state updates properly

## Expected Outcome - PARTIALLY ACHIEVED ⚠️

The gameplay flow **mostly works** but lacks smooth animation:

1. ✅ **WORKING** Player rolls 6 → can select peg from HOME
2. ⚠️ **PARTIALLY WORKING** Player presses selected peg → movement occurs but no animation effect
3. ❌ **NOT WORKING** Peg jumps instantly from HOME to START position (no smooth animation)
4. ✅ **WORKING** Movement completes → game state updates
5. ✅ **WORKING** Turn continues with proper logic (extra turn on 6)
6. ⚠️ **PARTIALLY WORKING** Functional integrated playable demo (missing visual polish)

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

## Success Criteria - PARTIALLY COMPLETED ⚠️

- [ ] ❌ **Pegs animate visually when moved from HOME to START** (pegs jump instead of animating)
- [x] ✅ All existing game logic continues to work
- [x] ✅ Turn system operates correctly with movement
- [x] ✅ Game is fully playable with 2-4 players
- [x] ✅ No regressions in existing functionality

## Key Issues Resolved During Implementation

1. **Double Animation Issue**: Fixed race condition in store updates that caused pegs to animate twice
2. **Position Reset Problem**: Resolved visual "straight line jump" by properly managing animated position resets
3. **useEffect Dependencies**: Optimized animation triggers to prevent unnecessary re-renders
4. **Animation State Management**: Combined position updates and animation state clearing into atomic operations

## Implementation Summary

**Files Modified:**
1. ✅ `src/components/PegOverlay/PegOverlay.tsx` - Switched to AnimatedPeg with animation props
2. ✅ `src/utils/boardCoordinates.ts` - Updated interface to include animation properties  
3. ✅ `src/components/Peg/AnimatedPeg.tsx` - Fixed HOME position calculation and animation logic
4. ✅ `src/store/gameStore.ts` - Fixed animation callback to prevent double animations

## Next Steps - Animation Debugging Required

**REMAINING WORK**:
1. **Debug Animation Execution**: Investigate why `withTiming` animations in `AnimatedPeg` are not visually executing
2. **Review Animation Timing**: Check if position resets are interfering with animation visibility  
3. **Test Animation Duration**: Verify animation duration is sufficient to be visible
4. **Validate Animation Path**: Ensure `getCurrentPosition()` calculations are correct for smooth transitions

---

**TASK 24 STATUS**: Functional game with correct logic but missing smooth animation effects. Core gameplay works, visual polish needed.