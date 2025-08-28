# Die Roll Callback System Documentation

## Overview
The die roll callback system in `gameStore` provides a flexible way for multiple components to react to die roll events without tight coupling.

## Current Implementation

### Store Structure
```typescript
export interface DieState {
  lastRoll: number | null;
  consecutiveRepeats: number;
  isRolling: boolean;
  rollCallbacks: DieRollCallback[];  // Array of registered callbacks
}
```

### Available Methods
- `rollDie(): Promise<number>` - Rolls the die and executes all registered callbacks
- `registerDieCallback(callback: DieRollCallback): () => void` - Registers a callback and returns an unregister function
- `setDieRolling(isRolling: boolean)` - Manually control die lock state

## Usage Patterns

### Pattern 1: Direct State Observation (Current Approach)
Used in `useGamePlay.ts` - Simple and avoids complexity:

```typescript
// Track die value changes from the store
useEffect(() => {
  if (dieState.lastRoll !== null) {
    setDieValue(dieState.lastRoll);
  }
}, [dieState.lastRoll]);
```

### Pattern 2: Callback Registration (For Future Features)
For components that need to react to die rolls without tracking state:

```typescript
import { useEffect, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';

const useMyFeature = () => {
  const { registerDieCallback } = useGameStore();
  
  // Use ref to maintain stable callback reference
  const callbackRef = useRef<((value: number) => void) | null>(null);
  
  // Create the callback only once
  if (!callbackRef.current) {
    callbackRef.current = (value: number) => {
      // Your logic here
      console.log('Die rolled:', value);
    };
  }
  
  // Register the callback
  useEffect(() => {
    const callback = callbackRef.current;
    if (callback) {
      const unregister = registerDieCallback(callback);
      return unregister; // Clean up on unmount
    }
  }, [registerDieCallback]);
};
```

## When to Use Each Pattern

### Use Direct State Observation When:
- You need to track the die value in component state
- You're already subscribing to the store
- You need simple, straightforward logic
- Example: Game UI displaying current die value

### Use Callback Registration When:
- You need side effects without state tracking
- Multiple independent features need to react to die rolls
- You want decoupled, modular code
- Examples: Sound effects, analytics, animations, achievements

## Example Implementations

### Sound Effects (see `src/hooks/useDieSoundEffects.ts`)
```typescript
// Registers a callback for playing different sounds based on die value
useDieSoundEffects();
```

### Future Features Could Include:
- Achievement tracking
- Game statistics
- Network synchronization
- Visual effects triggers
- AI opponent reactions

## Important Notes

1. **Avoid Infinite Loops**: Always use `useRef` or stable references when registering callbacks
2. **Clean Up**: Always return the unregister function in useEffect cleanup
3. **Performance**: Callbacks are executed synchronously after die animation completes
4. **Order**: Callbacks are executed in registration order

## Current Status
- ✅ Callback system implemented in store
- ✅ Direct state observation used in GamePlay
- ✅ Example hook created for sound effects
- 🔄 Ready for future feature additions