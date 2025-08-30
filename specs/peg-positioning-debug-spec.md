# Peg Positioning Debug Specification

## Problem Statement

The PegOverlay component positions pegs in a diagonal row instead of the correct 2x2 grid formation within each player's HOME area, while the DebugOverlay component correctly displays positions as numbered dots in the proper 2x2 grid.

## Current State Analysis

### Working Component: DebugOverlay
- ✅ Correctly positions debug dots in 2x2 grid formation
- ✅ Uses proper offset calculations (`verticalOffset: -1.5`, `horizontalOffset: -12`)
- ✅ Applies boundary checking to filter valid positions
- ✅ Uses exact BoardSVG coordinate logic

### Broken Component: PegOverlay
- ❌ Positions all pegs in a diagonal line
- ✅ Has same offset calculations as DebugOverlay
- ❌ Missing boundary checking logic
- ❌ Coordinate calculation diverges from DebugOverlay

## Root Cause Theories

1. **Peg Index Extraction Failure**
   - `pegIndex = parseInt(peg.id.split('-')[2]) || 0` might be failing
   - Peg IDs might not follow expected format (`player-color-index`)
   - All pegs might be getting the same index (0)

2. **Data Flow Issues**
   - Peg data structure might not match expectations
   - Player-to-peg mapping might be incorrect
   - Peg objects might be missing required fields

3. **Coordinate Calculation Divergence**
   - Different logic paths between debug and peg coordinate calculation
   - `getHomePosition()` function might have bugs
   - Scaling or offset application differences

4. **Missing Boundary Checks**
   - DebugOverlay filters positions with boundary checks
   - PegOverlay doesn't apply the same filtering
   - Invalid positions might be causing diagonal fallback

5. **Stacking Logic Interference**
   - `getStackedPegPositions()` might be overriding correct positions
   - Pegs at "same position" might be getting incorrectly grouped
   - Stacking offset calculation might be wrong

## Debug Implementation Plan

### Phase 1: Data Verification & Comprehensive Logging

#### 1.1 Enhanced Logging System
Create logging utilities to track the entire coordinate calculation pipeline:

```typescript
// utils/debugLogger.ts
export const logPegPositioning = (pegs: Peg[], players: Player[]) => {
  console.group('🔍 Peg Positioning Debug');
  
  pegs.forEach((peg, index) => {
    console.log(`Peg ${index}:`, {
      id: peg.id,
      playerId: peg.playerId,
      extractedIndex: parseInt(peg.id.split('-')[2]) || 0,
      isInHome: peg.isInHome,
      position: peg.position,
      rawCoordinate: getPegCoordinate(peg, playerColor),
      scaledCoordinate: scaleCoordinate(rawCoordinate, scaleFactor),
      finalCoordinate: applyOffsets(scaledCoordinate)
    });
  });
  
  console.groupEnd();
};
```

#### 1.2 Peg Data Structure Validation
Add validation to ensure peg data matches expectations:

```typescript
// Validate peg ID format and structure
export const validatePegData = (pegs: Peg[]) => {
  const issues: string[] = [];
  
  pegs.forEach(peg => {
    const parts = peg.id.split('-');
    if (parts.length !== 3) {
      issues.push(`Invalid peg ID format: ${peg.id}`);
    }
    
    const pegIndex = parseInt(parts[2]);
    if (isNaN(pegIndex) || pegIndex < 0 || pegIndex > 3) {
      issues.push(`Invalid peg index in ID: ${peg.id}`);
    }
  });
  
  return issues;
};
```

### Phase 2: Enhanced Visual Debug Component

#### 2.1 Side-by-Side Coordinate Comparison
Create a comprehensive debug overlay that shows:

```typescript
// components/EnhancedDebugOverlay.tsx
export const EnhancedDebugOverlay = ({ pegs, players, boardDimensions }) => {
  return (
    <View style={debugStyles.overlay}>
      {/* Original DebugOverlay dots (green) */}
      {renderDebugDots('green')}
      
      {/* Calculated peg coordinates (red) */}
      {renderPegCoordinates('red')}
      
      {/* Coordinate labels */}
      {renderCoordinateLabels()}
      
      {/* Boundary check results */}
      {renderBoundaryStatus()}
    </View>
  );
};
```

#### 2.2 Visual Indicators
- **Green dots**: Original DebugOverlay positions (working)
- **Red dots**: Calculated peg coordinates (broken)
- **Yellow labels**: Coordinate values for comparison
- **Border colors**: Boundary check status (pass/fail)

### Phase 3: Isolated Test Cases

#### 3.1 Minimal Coordinate Test
Create a simple test component that positions elements at exact DebugOverlay coordinates:

```typescript
// components/CoordinateTest.tsx
export const CoordinateTest = () => {
  const testCoordinates = [
    { x: 30, y: 30 },    // Should match debug dot 0
    { x: 60, y: 30 },    // Should match debug dot 1
    { x: 30, y: 60 },    // Should match debug dot 2
    { x: 60, y: 60 },    // Should match debug dot 3
  ];
  
  return (
    <View>
      {testCoordinates.map((coord, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            left: coord.x * scaleFactor + horizontalOffset - 12,
            top: coord.y * scaleFactor + verticalOffset - 12,
            width: 24,
            height: 24,
            backgroundColor: 'blue',
            borderRadius: 12,
          }}
        />
      ))}
    </View>
  );
};
```

#### 3.2 Individual Corner Testing
Test each player corner separately to isolate corner-specific issues:

```typescript
// Test red corner only, then blue, green, yellow individually
const testSingleCorner = (playerColor: PlayerColor) => {
  // Implementation for testing one corner at a time
};
```

### Phase 4: Systematic Fixes

#### 4.1 Apply Missing Boundary Checks
Add the same boundary checking logic from DebugOverlay to PegOverlay:

```typescript
// Apply boundary validation in preparePegOverlayData()
const isWithinBoundary = (pos: BoardCoordinate, playerColor: PlayerColor) => {
  const cornerSize = BOARD_CONFIG.VIEWPORT_SIZE * 0.35;
  const pegRadius = 10;
  
  switch (playerColor) {
    case 'red':
      return pos.x + pos.y <= cornerSize - pegRadius;
    case 'blue':
      return (BOARD_CONFIG.VIEWPORT_SIZE - pos.x) + pos.y <= cornerSize - pegRadius;
    case 'green':
      return (BOARD_CONFIG.VIEWPORT_SIZE - pos.x) + (BOARD_CONFIG.VIEWPORT_SIZE - pos.y) <= cornerSize - pegRadius;
    case 'yellow':
      return pos.x + (BOARD_CONFIG.VIEWPORT_SIZE - pos.y) <= cornerSize - pegRadius;
    default:
      return false;
  }
};
```

#### 4.2 Fix Coordinate Alignment
Based on debug findings, align coordinate calculations:

```typescript
// Ensure identical coordinate calculation between debug and peg systems
export const getHomePositionFixed = (playerColor: PlayerColor, pegIndex: number) => {
  // Use exact same logic as DebugOverlay allPlayerPositions
  const positions = debugPositions[playerColor];
  return positions[pegIndex] || positions[0];
};
```

#### 4.3 Validate Stacking Logic
Review and fix stacking calculations:

```typescript
// Ensure stacking doesn't interfere with positioning
export const getStackedPegPositionsFixed = (pegsAtSameSpot: PegOverlayData[]) => {
  // Only apply stacking if truly at same position
  // Don't stack pegs that should be in different HOME circles
};
```

## Implementation Steps

1. **Create enhanced debug logging system**
2. **Add comprehensive peg data validation**
3. **Build side-by-side visual comparison component**
4. **Create isolated coordinate test cases**
5. **Apply systematic fixes based on findings**
6. **Validate fix with all 4 player corners**
7. **Clean up debug code and finalize solution**

## Success Criteria

- ✅ Pegs positioned in correct 2x2 grid formation in each HOME corner
- ✅ Peg positions exactly match DebugOverlay dot positions
- ✅ All 4 player corners work correctly (red, blue, green, yellow)
- ✅ No diagonal line positioning artifacts
- ✅ Proper boundary checking prevents invalid positions

## Testing Checklist

- [ ] Peg ID format validation passes
- [ ] Coordinate calculation logging shows expected values
- [ ] Visual debug overlay shows aligned coordinates
- [ ] Individual corner tests pass for all 4 colors
- [ ] Boundary checks filter positions correctly
- [ ] Stacking logic doesn't interfere with HOME positions
- [ ] Final PegOverlay matches DebugOverlay exactly

## Files to Modify

- `src/utils/boardCoordinates.ts` - Fix coordinate calculations
- `src/components/PegOverlay/PegOverlay.tsx` - Add boundary checks, fix positioning
- `src/utils/debugLogger.ts` - Create logging utilities (new)
- `src/components/EnhancedDebugOverlay.tsx` - Visual comparison tool (new)
- `src/components/CoordinateTest.tsx` - Isolated testing (new)

## Expected Timeline

- **Phase 1**: 1-2 hours (logging and validation)
- **Phase 2**: 1 hour (visual debug tools)
- **Phase 3**: 30 minutes (isolated tests)
- **Phase 4**: 1-2 hours (systematic fixes)
- **Total**: 3.5-5.5 hours

This systematic approach will definitively identify and fix the root cause of the peg positioning issue.