# FINISH Entry Rules - TROUBLE Game Specification

## Problem Analysis

**Current Bug:** The system incorrectly requires lap completion and doesn't properly handle WARP vs FINISH priority.

**Correct TROUBLE Rules:**
1. FINISH entry only when **passing through** entry point (not landing exactly on it)
2. WARP spaces take priority when landing **exactly** on them
3. Must have exact count to land in available FINISH space
4. If FINISH space is blocked, peg cannot move

## Implementation Plan

### 1. Remove Lap Completion System (15 min)
- Remove `hasCompletedLap` field from Peg model
- Remove all lap tracking logic from `gameStore.ts`
- Remove `hasCompletedLap` parameter from `shouldEnterFinish`

### 2. Fix FINISH Entry Logic (20 min)
**New Logic in `calculateDestinationPosition`:**
```typescript
// Check if peg passes THROUGH finish entry (not lands exactly on it)
if (passesThrough(currentPos, newPos, finishEntry)) {
  // Calculate which FINISH space to enter
  const finishSpaceIndex = calculateFinishSpace(currentPos, newPos, finishEntry, dieRoll);

  // Check if FINISH space is available
  if (isFinishSpaceAvailable(playerId, finishSpaceIndex, allPegs)) {
    return GAME_CONFIG.BOARD_SPACES + finishSpaceIndex;
  } else {
    return -2; // Blocked, can't move
  }
}

// Check if lands exactly on WARP space (takes priority)
if (newPos === warpSpace) {
  return warpDestination;
}
```

### 3. Implement Space Availability Check (10 min)
```typescript
function isFinishSpaceAvailable(playerId: string, spaceIndex: number, allPegs: Peg[]): boolean {
  // Check if the specific FINISH space is occupied by own peg
  const blockingPeg = allPegs.find(peg =>
    peg.playerId === playerId &&
    peg.isInFinish &&
    peg.finishPosition === spaceIndex
  );
  return !blockingPeg;
}
```

### 4. Handle WARP vs FINISH Priority (10 min)
- Landing exactly on WARP space → Always WARP
- Passing through FINISH entry → Enter FINISH (if space available)
- Example: Space 24 (red FINISH entry + WARP)
  - Land exactly on 24 → WARP to 10
  - Pass through 24 → Enter red FINISH

### 5. Update Tests (10 min)
- Remove `hasCompletedLap` from test mocks
- Add tests for blocked FINISH spaces
- Test WARP vs FINISH priority scenarios

## Test Scenarios

### ✅ Correct Behavior:
1. **Red peg at 22, roll 3**: 22→23→24(pass)→FINISH[0] ✓
2. **Red peg at 23, roll 1**: 23→24(land)→WARP to 10 ✓
3. **Red peg at 21, roll 6**: 21→22→23→24(pass)→FINISH[2] ✓
4. **Red peg at 23, roll 6**: Can't move (would need FINISH[5] but only 4 spaces) ✗
5. **FINISH space blocked**: Can't enter, peg not movable ✗

### 🔧 Key Functions to Implement:
- `passesThrough(current, new, entry)` - Detect pass-through vs land-on
- `calculateFinishSpace(current, new, entry, roll)` - Which FINISH space to enter
- `isFinishSpaceAvailable(player, space, pegs)` - Check space availability

## Detailed FINISH Entry Rules

### FINISH Entry Points by Color:
- **Red**: Space 24 (also WARP space)
- **Blue**: Space 3 (also WARP space)
- **Green**: Space 10 (also WARP space)
- **Yellow**: Space 17 (also WARP space)

### Priority Logic:
1. **Land exactly on space** → Use WARP (regardless of peg color)
2. **Pass through space** → Enter FINISH (if correct color and space available)

### Examples:

#### Red Peg Scenarios:
- **Position 22, Roll 3**: 22→23→24(pass through)→RED FINISH[0]
- **Position 23, Roll 1**: 23→24(land exactly)→WARP to space 10
- **Position 21, Roll 3**: 21→22→23→24(pass through)→RED FINISH[0]
- **Position 20, Roll 4**: 20→21→22→23→24(pass through)→RED FINISH[0]

#### Non-Red Peg on Red Entry:
- **Blue peg at 23, Roll 1**: 23→24(land)→WARP to space 10 (can't enter red FINISH)

#### Blocked FINISH Scenarios:
- **Red peg at 22, Roll 3**: If RED FINISH[0] occupied by own peg → **peg cannot move**
- **Red peg at 21, Roll 6**: Needs RED FINISH[2], if occupied → **peg cannot move**

## Implementation Notes

### Pass-Through Detection:
```typescript
function passesThrough(currentPos: number, newPos: number, entryPoint: number): boolean {
  // Check if path crosses entry point without landing exactly on it
  return currentPos < entryPoint && newPos > entryPoint;
}
```

### FINISH Space Calculation:
```typescript
function calculateFinishSpace(currentPos: number, newPos: number, entryPoint: number, dieRoll: number): number {
  // How many spaces past the entry point
  return newPos - entryPoint - 1;
}
```

### Space Availability:
- Each player has 4 FINISH spaces (indices 0-3)
- Must check if target FINISH space is occupied by own peg
- If occupied, the move is invalid

**Files to Modify:**
- `src/models/index.ts` - Remove hasCompletedLap
- `src/store/gameStore.ts` - Remove lap tracking
- `src/utils/moveValidation.ts` - Fix FINISH entry logic
- `src/utils/__tests__/*.test.ts` - Update tests

**Estimated Time:** ~70 minutes
**Priority:** High - Fixes core game mechanic bug
