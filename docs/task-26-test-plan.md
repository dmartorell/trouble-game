# Task #26: Manual Test Plan

## Test Environment Setup
1. Start the app: `npm start`
2. Open in iOS simulator or device

## Test Scenarios

### Test 1: 2-Player Game Flow
1. **Setup**
   - Start app and navigate to Game Setup
   - Ensure only Player 1 (Red) and Player 2 (Blue) are active
   - Click "Start Game"

2. **Verify**
   - ✅ Game starts with only 2 players (not 4)
   - ✅ Red player goes first
   - ✅ Only red and blue pegs are visible on board

3. **Turn Switching**
   - Roll die as Red player
   - Move a peg if possible
   - ✅ Turn switches to Blue player
   - Roll die as Blue player
   - Move a peg if possible
   - ✅ Turn switches back to Red player

### Test 2: 3-Player Game Flow
1. **Setup**
   - Return to Game Setup
   - Enable Player 3 (Yellow)
   - Start game with 3 players

2. **Verify**
   - ✅ Game shows 3 sets of pegs (Red, Blue, Yellow)
   - ✅ Turn order: Red → Blue → Yellow → Red

3. **Test Turn Cycle**
   - Complete one full round of turns
   - ✅ Each player gets exactly one turn
   - ✅ Turn order is maintained

### Test 3: 4-Player Game Flow
1. **Setup**
   - Return to Game Setup
   - Enable Player 4 (Green)
   - Start game with 4 players

2. **Verify**
   - ✅ All 4 colors of pegs visible
   - ✅ Turn order: Red → Blue → Yellow → Green → Red

### Test 4: Roll of 6 Extra Turn
1. **Setup**
   - Start any game (2+ players)
   
2. **Test**
   - Keep rolling until you get a 6
   - ✅ "Extra Turn!" message appears
   - ✅ Move counter shows "+1"
   - Move a peg from HOME to START
   - ✅ Same player can roll again
   - Roll again (any number)
   - ✅ After second move, turn switches to next player

### Test 5: Maximum 2 Rolls Rule
1. **Setup**
   - Start any game
   
2. **Test**
   - Roll a 6 (get extra turn)
   - Move a peg
   - Roll another 6
   - ✅ No additional extra turn granted
   - ✅ After move, turn switches to next player

### Test 6: Roll of 1 Special Rule
1. **Setup**
   - Start a 3+ player game
   
2. **Test**
   - Keep rolling until you get a 1
   - ✅ Turn immediately switches to next player
   - ✅ No peg selection available for current player

### Test 7: Turn Timer
1. **Setup**
   - Start any game
   
2. **Test**
   - Roll die and wait 10 seconds
   - ✅ Yellow warning appears at 10 seconds
   - Wait until 15 seconds
   - ✅ Turn automatically switches to next player
   - ✅ New player has fresh timer (no warning)

### Test 8: Direct Navigation Protection
1. **Setup**
   - Close and restart app
   
2. **Test**
   - Try to navigate directly to /game/play (modify URL or use deep link)
   - ✅ App redirects to Game Setup screen
   - ✅ No crash or undefined behavior

### Test 9: Die Roll → Peg Selection → Movement Flow
1. **Setup**
   - Start any game
   
2. **Test Sequence**
   - ✅ Before rolling: No pegs have golden highlight
   - Roll die
   - ✅ After rolling: Valid pegs show glowing animation
   - ✅ Invalid pegs (blocked/can't move) have no highlight
   - Tap a glowing peg
   - ✅ Peg animates to new position
   - ✅ After movement: Turn switches or allows extra roll

### Test 10: Peg Animation
1. **Setup**
   - Start any game
   
2. **Test**
   - Roll die and select a peg to move
   - ✅ Peg smoothly animates along path
   - ✅ No jumping or teleporting
   - ✅ During animation, other pegs cannot be selected
   - ✅ After animation completes, game flow continues

## Expected Results Summary

All tests should pass with the following key behaviors:
- Game respects player selection from setup (2, 3, or 4 players)
- Turn switching works correctly for all player counts
- Extra turn from rolling 6 works but limited to 2 rolls max
- Roll of 1 immediately ends turn
- Timer warnings clear between turns
- Direct navigation to play screen is protected
- Die roll → peg selection → movement flow is smooth
- Animations complete before next action

## Issues to Watch For
- [ ] Pegs appearing for inactive players
- [ ] Turn getting stuck on one player
- [ ] Timer warnings persisting between turns
- [ ] Crashes when navigating directly to play
- [ ] Pegs jumping instead of animating
- [ ] Wrong turn order for different player counts
- [ ] Extra turns beyond 2 rolls
- [ ] Roll of 1 allowing peg movement

## Regression Testing
After fixes are verified, test these scenarios that previously worked:
- [ ] PopOMatic die animation and haptics
- [ ] Board rendering and scaling
- [ ] Settings (sound, haptics) persistence
- [ ] Home screen navigation
- [ ] Rules and Stats screens