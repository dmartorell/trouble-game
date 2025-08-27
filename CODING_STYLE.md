# Coding Style Guide

This document defines the coding standards and conventions for the Trouble Game project. All code must follow these guidelines consistently.

## 📁 Folder Structure

### Screens Organization
- Create a `screens` folder in `src/`
- Each screen should have its own folder named after the screen
- Inside each screen folder:
  - `index.tsx` - The main screen component
  - `resources/` folder containing:
    - Custom hook named `use[ScreenName].ts` (e.g., `useSettings.ts`)

**Example Structure:**
```
src/
├── screens/
│   ├── Settings/
│   │   ├── index.tsx
│   │   └── resources/
│   │       └── useSettings.ts
│   ├── GamePlay/
│   │   ├── index.tsx
│   │   └── resources/
│   │       └── useGamePlay.ts
│   └── Rules/
│       ├── index.tsx
│       └── resources/
│           └── useRules.ts
```

### Custom Hooks Pattern
- All state management and logic must be handled in the custom hook
- The hook should expose state and functions via return object
- The screen component should only handle UI rendering
- Hook naming: `use[ScreenName]` (PascalCase)

**Example Hook:**
```typescript
export const useSettings = () => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);

  const toggleSound = () => setSoundEnabled(!soundEnabled);
  const toggleHaptics = () => setHapticsEnabled(!hapticsEnabled);

  return {
    // State
    soundEnabled,
    hapticsEnabled,

    // Functions
    toggleSound,
    toggleHaptics,
  };
};
```

## 📦 Import Order

**Always follow this import order:**

1. **React imports first** - `from 'react'` always at the top
2. React Native imports
3. Third-party libraries
4. Local/project imports (components, utils, etc.)

**Example:**
```typescript
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { useSettings } from './resources/useSettings';
import { THEME_COLORS } from '@/constants/game';
```

## 🔧 Function Declaration

### Component Functions
- **Always use:** `export const NameOfFunction = () => {}`
- **Never use:** `export default function NameOfFunction() {}`
- Use arrow functions consistently
- Component names should be PascalCase

**Correct:**
```typescript
export const RulesScreen = () => {
  return <View>...</View>;
};
```

**Incorrect:**
```typescript
export default function RulesScreen() {
  return <View>...</View>;
}
```

### Utility Functions
- Use arrow functions with `export const`
- Function names should be camelCase for utilities

**Example:**
```typescript
export const calculateDistance = (x1: number, y1: number, x2: number, y2: number) => {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
};
```

## 📋 Additional Guidelines

### File Naming
- Screen components: PascalCase folders, `index.tsx` files
- Hooks: `use[Name].ts` in camelCase starting with lowercase 'use'
- Utilities: camelCase `.ts` files
- Constants: UPPER_SNAKE_CASE `.ts` files

### TypeScript
- Always use TypeScript for all files
- Define interfaces for complex objects
- Use proper typing for all functions and variables

### DRY Principle (Don't Repeat Yourself)
- **Reuse existing interfaces** - Always check `src/utils/types.ts` before creating new type definitions
- **Reuse existing components** - Check `src/components/` for existing components before creating new ones
- **Avoid code duplication** - If similar logic exists elsewhere, extract it to a shared utility or hook
- **Import shared types** - Never duplicate interface/type definitions across files

**Examples:**
```typescript
// ✅ CORRECT - Use existing types
import { Player, GameState } from '@/utils/types';

// ❌ INCORRECT - Duplicating existing interface
interface Player {
  id: string;
  name: string;
  // ...
}

// ✅ CORRECT - Reuse existing components
import { Button } from '@/components/ui/Button';

// ❌ INCORRECT - Creating duplicate button component
const MyButton = () => { /* duplicate logic */ };
```

### Component Structure
1. Imports (following import order above)
2. Interface/type definitions (if any - only if not available elsewhere)
3. Component function
4. Styles at the bottom

---

## 🚨 Enforcement

These rules are mandatory for all code in this project. AI assistants and developers must follow these conventions without exception to maintain consistency and readability.
