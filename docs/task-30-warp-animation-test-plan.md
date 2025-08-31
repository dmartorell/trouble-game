# Task #30: Warp Teleportation Animation - Test Plan

## Overview
This document outlines the testing procedure for the newly implemented Warp space teleportation animations in the TROUBLE game.

## Implementation Summary
The Warp teleportation animation consists of three phases:
1. **Dissolve Effect**: Peg fades out with a purple glow at the origin Warp space
2. **Transport Trail**: Animated trail connects the two Warp spaces  
3. **Materialize Effect**: Peg appears at destination with a scale bounce and glow

## Warp Space Locations
The game has 4 Warp spaces forming 2 diagonal pairs:
- **Pair 1**: Space 3 ↔ Space 17 (diagonal)
- **Pair 2**: Space 10 ↔ Space 24 (diagonal)

## Testing Instructions

### Setup
1. Start the app: `npm start`
2. Navigate to Game Setup and select 2-4 players
3. Start the game

### Test Scenarios

#### Test 1: Basic Warp Animation
1. Roll the die to move a peg
2. Land exactly on space 3, 10, 17, or 24 (Warp spaces)
3. **Expected Result**:
   - Peg moves normally to the Warp space
   - Peg dissolves with purple glow (400ms)
   - Purple trail appears between Warp spaces
   - Peg materializes at destination with bounce effect
   - Total animation duration: ~800ms

#### Test 2: All Warp Pairs
Test each Warp space pair:
1. **Space 3 → Space 17**: Move peg to space 3
   - Should teleport diagonally to space 17
2. **Space 17 → Space 3**: Move peg to space 17
   - Should teleport diagonally to space 3
3. **Space 10 → Space 24**: Move peg to space 10
   - Should teleport diagonally to space 24
4. **Space 24 → Space 10**: Move peg to space 24
   - Should teleport diagonally to space 10

#### Test 3: Visual Effects Verification
For each Warp teleportation, verify:
- [ ] Peg fades out smoothly at origin
- [ ] Purple glow appears during dissolve
- [ ] Transport trail is visible and animated
- [ ] Trail follows a curved path between spaces
- [ ] Peg materializes with scale bounce (1.0 → 1.3 → 1.0)
- [ ] Destination glow effect is visible

#### Test 4: Game Flow Integration
1. Land on a Warp space
2. Verify the animation completes before:
   - Turn can continue (if extra turn)
   - Turn ends (if no extra turn)
3. Confirm peg is at correct destination position
4. Verify peg can be moved from new position on next turn

#### Test 5: Edge Cases
1. **Multiple pegs on Warp space**: 
   - Only the moving peg should animate
2. **Warp then Double Trouble**:
   - If destination is space 21 (Double Trouble), player should get extra turn after Warp
3. **Turn timeout during Warp**:
   - Animation should complete even if turn times out

## Visual Reference
- **Warp Space Color**: Purple (#6C5CE7)
- **Glow Color**: Light purple (#A29BFE)
- **Trail Duration**: 800ms
- **Dissolve/Materialize**: 400ms each

## Known Limitations
- Trail animation may be less visible on smaller screens
- Performance on older devices should be monitored

## Success Criteria
- [ ] All 4 Warp spaces trigger teleportation animation
- [ ] Animation is smooth and visually appealing
- [ ] No game flow interruptions
- [ ] Performance remains at 60 FPS
- [ ] Animation enhances gameplay experience

## Troubleshooting
If animations don't appear:
1. Check console for error messages
2. Verify peg landed exactly on Warp space (3, 10, 17, or 24)
3. Ensure game state is 'playing'
4. Check that Warp spaces are properly marked on board

## Notes
- Warp animation is separate from normal move animation
- Each phase has specific timing for best visual effect
- Trail uses SVG path animation for smooth curves