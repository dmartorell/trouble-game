# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React Native mobile game called "trouble-game" built with Expo and TypeScript. The project uses the new Expo Router v5 for navigation and targets both iOS and Android platforms.

## Technology Stack

- **React Native 0.79.6** with **React 19.0.0**
- **Expo SDK 53** with new architecture enabled (`newArchEnabled: true`)
- **TypeScript** with strict mode enabled
- **Expo Router v5** for file-based routing
- **Expo AV** for audio/video functionality
- **Expo Haptics** for device vibration/haptic feedback

## Development Commands

### Core Development
- `npm start` - Start Expo development server
- `npm run android` - Build and run on Android device/emulator
- `npm run ios` - Build and run on iOS device/simulator
- `npm run web` - Run on web platform

### Building
- iOS builds require Xcode and are handled through the ios/ directory
- Android builds use Gradle through the android/ directory

## Project Structure

- **App.tsx** - Main application entry point (currently showing default Expo template)
- **index.ts** - Root component registration using `registerRootComponent`
- **app.json** - Expo configuration with bundle identifiers and platform settings
- **assets/** - App icons, splash screens, and static assets
- **android/** - Native Android project files and configuration
- **ios/** - Native iOS project files and Xcode workspace
- **ai_docs/** - Documentation directory (currently contains empty troubleRules.md)

## Configuration Details

- **Bundle ID (iOS)**: `com.dmartorell.troublegame`
- **Package Name (Android)**: `com.dmartorell.troublegame`
- **Orientation**: Portrait only
- **New Architecture**: Enabled (React Native's new architecture/Fabric)
- **Edge-to-edge**: Enabled on Android

## Coding Standards

**IMPORTANT:** All code must strictly follow the guidelines defined in [CODING_STYLE.md](./CODING_STYLE.md). This includes:


## Development Notes

- The project uses Expo Router v5 for file-based navigation
- TypeScript is configured with strict mode for better type safety
- The project includes both native iOS and Android directories for custom native code
- All screens must follow the custom hook pattern for state management
- NEVER automatically commit changes
- NEVER automatically push to remote repositories
- NEVER automatically start the app. Tell the user when changes are ready to be tested in the app.
- NEVER commit or push without user's permission