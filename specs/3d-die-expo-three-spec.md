# 3D Die Implementation Specification - expo-three + Three.js Approach

## Overview
This specification outlines the implementation of a realistic 3D die using expo-three and Three.js WebGL for the Trouble Game PopOMatic component. This approach provides true 3D geometry, realistic physics, and professional visual quality with moderate implementation complexity.

## Technical Architecture

### Core Technologies
- **expo-three**: WebGL bridge for React Native
- **three.js**: 3D graphics library
- **expo-gl**: OpenGL ES context provider
- **expo-gl-cpp**: C++ bindings for performance
- **React Native Reanimated**: Animation coordination

### System Requirements
- **Platform**: iOS 14+ (primary target)
- **Performance**: Physical device required (simulators not supported)
- **Memory**: ~15MB additional for WebGL context
- **Bundle Size**: +500KB for three.js + expo-three

## Component Architecture

### 1. Enhanced PopOMatic Component Structure
```
PopOMatic3D/
├── index.tsx              # Main component export
├── PopOMaticContainer.tsx  # Housing and interaction layer
├── Die3D/
│   ├── Die3DRenderer.tsx  # Three.js scene setup
│   ├── DieGeometry.tsx    # Cube geometry and materials
│   ├── DiePhysics.tsx     # Roll animation logic
│   └── DieTextures.tsx    # Face textures (1-6 dots)
└── utils/
    ├── sceneSetup.ts      # Camera, lighting, renderer
    ├── rollPhysics.ts     # Animation calculations
    └── textureGenerator.ts # Dot pattern generation
```

### 2. WebGL Integration Layer
```typescript
// Die3DRenderer.tsx core structure
interface Die3DRendererProps {
  size: number;
  dieValue: number;
  isRolling: boolean;
  onRollComplete: (value: number) => void;
}

export const Die3DRenderer: FC<Die3DRendererProps> = ({
  size,
  dieValue,
  isRolling,
  onRollComplete
}) => {
  // GLView for WebGL context
  // Three.js scene setup
  // Animation loop management
  // Roll physics simulation
}
```

## Implementation Phases

### Phase 1: Setup and Basic 3D Scene (2-3 hours)

#### 1.1 Dependencies Installation
```bash
npm install expo-three three@0.155.0 expo-gl expo-gl-cpp
```

#### 1.2 WebGL Context Setup
- Create GLView component wrapper
- Initialize Three.js renderer with expo-gl context
- Setup basic scene, camera, and lighting
- Implement render loop with RequestAnimationFrame

#### 1.3 Basic Cube Geometry
- Create BoxGeometry for die shape
- Apply basic materials with face colors
- Position camera for optimal viewing angle
- Test basic 3D rendering

**Deliverable**: Static 3D cube rendering in PopOMatic housing

### Phase 2: Die Face Textures and Materials (1-2 hours)

#### 2.1 Dot Pattern Generation
```typescript
// textureGenerator.ts
export function generateDotTexture(faceValue: 1 | 2 | 3 | 4 | 5 | 6): THREE.Texture {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  // Generate dot patterns for each face value
  // Return THREE.CanvasTexture
}
```

#### 2.2 Material Application
- Create MeshPhongMaterial for realistic lighting
- Apply dot textures to each cube face
- Implement proper UV mapping
- Add subtle edge beveling for realism

#### 2.3 Visual Enhancement
- Add ambient and directional lighting
- Implement shadows and depth
- Apply subtle wear/aging effects
- Optimize material properties for mobile

**Deliverable**: Realistic 3D die with proper face textures

### Phase 3: Roll Animation Physics (2-3 hours)

#### 3.1 Physics Simulation
```typescript
// rollPhysics.ts
interface RollState {
  rotation: { x: number; y: number; z: number };
  angularVelocity: { x: number; y: number; z: number };
  position: { x: number; y: number; z: number };
  isSettling: boolean;
}

export class DieRollPhysics {
  // Tumble calculation with realistic deceleration
  // Final face determination based on rotation
  // Settling animation with bounce effect
}
```

#### 3.2 Animation Timeline
1. **Initial Spin** (0-200ms): Rapid multi-axis rotation
2. **Tumble Phase** (200-800ms): Decelerated spinning with physics
3. **Settling** (800-1000ms): Bounce and stabilize to final face
4. **Final State** (1000ms+): Static with subtle idle animation

#### 3.3 Face Value Calculation
- Map final rotation to determine top face
- Ensure deterministic results based on target value
- Implement smooth transition to final orientation

**Deliverable**: Realistic rolling animation with physics

### Phase 4: Integration and Polish (1-2 hours)

#### 4.1 PopOMatic Integration
```typescript
// PopOMaticContainer.tsx
export const PopOMaticContainer: FC<PopOMaticProps> = (props) => {
  return (
    <View style={styles.container}>
      {/* Existing housing SVG */}
      <View style={styles.dieContainer}>
        <Die3DRenderer
          size={props.size * 0.6}
          dieValue={dieState.value}
          isRolling={dieState.isRolling}
          onRollComplete={handleRollComplete}
        />
      </View>
      {/* Existing dome overlay */}
    </View>
  );
};
```

#### 4.2 State Management Bridge
- Connect Three.js animation to game store
- Maintain existing rollDie() API
- Preserve haptic feedback system
- Ensure proper cleanup on unmount

#### 4.3 Performance Optimization
- Implement object pooling for textures
- Optimize render loop for 60fps
- Add performance monitoring
- Implement graceful degradation

**Deliverable**: Fully integrated 3D die system

## Technical Implementation Details

### 1. Scene Setup
```typescript
// sceneSetup.ts
export function createDieScene(gl: ExpoWebGLRenderingContext, size: number) {
  const renderer = new THREE.WebGLRenderer({
    canvas: gl.canvas,
    context: gl,
    antialias: true,
    alpha: true
  });
  
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
  
  // Lighting setup for realism
  const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(1, 1, 1);
  directionalLight.castShadow = true;
  
  scene.add(ambientLight);
  scene.add(directionalLight);
  
  // Camera positioning for optimal die viewing
  camera.position.set(0, 0, 3);
  camera.lookAt(0, 0, 0);
  
  return { renderer, scene, camera };
}
```

### 2. Die Geometry Creation
```typescript
// DieGeometry.tsx
export function createDieGeometry(): THREE.BoxGeometry {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  
  // Add subtle rounding to edges for realism
  const edges = new THREE.EdgesGeometry(geometry);
  const lineMaterial = new THREE.LineBasicMaterial({ 
    color: 0x000000, 
    opacity: 0.1, 
    transparent: true 
  });
  
  return geometry;
}
```

### 3. Roll Animation Implementation
```typescript
// DiePhysics.tsx
export class DieRollAnimation {
  private targetValue: number;
  private startTime: number;
  private duration: number = 1000;
  
  public startRoll(targetValue: number): void {
    this.targetValue = targetValue;
    this.startTime = Date.now();
    this.animate();
  }
  
  private animate(): void {
    const elapsed = Date.now() - this.startTime;
    const progress = Math.min(elapsed / this.duration, 1);
    
    if (progress < 0.8) {
      // Tumbling phase
      this.updateTumbleRotation(progress);
    } else {
      // Settling phase
      this.updateSettlingRotation(progress);
    }
    
    if (progress < 1) {
      requestAnimationFrame(() => this.animate());
    } else {
      this.onRollComplete(this.targetValue);
    }
  }
  
  private updateTumbleRotation(progress: number): void {
    const intensity = 1 - progress;
    this.mesh.rotation.x = Math.sin(progress * 20) * intensity * 2;
    this.mesh.rotation.y = Math.cos(progress * 15) * intensity * 2;
    this.mesh.rotation.z = Math.sin(progress * 18) * intensity * 1.5;
  }
  
  private updateSettlingRotation(progress: number): void {
    const settleProgress = (progress - 0.8) / 0.2;
    const targetRotation = this.getTargetRotationForValue(this.targetValue);
    
    // Smooth transition to final orientation
    this.mesh.rotation.x = this.lerp(this.mesh.rotation.x, targetRotation.x, settleProgress);
    this.mesh.rotation.y = this.lerp(this.mesh.rotation.y, targetRotation.y, settleProgress);
    this.mesh.rotation.z = this.lerp(this.mesh.rotation.z, targetRotation.z, settleProgress);
  }
}
```

## Integration Points

### 1. Existing Game State
- **Input**: `dieState.isRolling`, `dieState.value` from gameStore
- **Output**: `onRollComplete(value)` callback to complete turn
- **Preservation**: All existing haptic feedback and game logic

### 2. PopOMatic Housing
- **Maintains**: Existing SVG housing and dome design
- **Replaces**: Only the inner die rendering area
- **Sizing**: 3D die sized to fit within dome bounds (60% of housing size)

### 3. Performance Integration
- **Lifecycle**: Start/stop WebGL context based on screen focus
- **Memory**: Cleanup textures and geometries on unmount
- **Fallback**: Option to fall back to 2D die if WebGL fails

## Testing Strategy

### 1. Unit Tests
- Texture generation for all die faces (1-6)
- Roll physics calculations and face determination
- WebGL context creation and cleanup

### 2. Integration Tests
- PopOMatic housing integration
- Game state synchronization
- Haptic feedback preservation

### 3. Performance Tests
- Frame rate monitoring during rolls
- Memory usage tracking
- Device compatibility testing (iPhone 12+)

### 4. Visual Tests
- Screenshot comparison for die faces
- Animation smoothness validation
- Lighting and shadow correctness

## Platform Considerations

### iOS Optimization
- **Memory Management**: Proper WebGL context cleanup
- **Performance**: Target 60fps on iPhone 12 and newer
- **Integration**: Seamless with existing Expo/React Native UI

### Android Considerations
- **Note**: Secondary platform, may have WebGL compatibility issues
- **Fallback**: Keep existing 2D die as backup option
- **Testing**: Thorough testing on physical Android devices

## Risk Mitigation

### 1. WebGL Compatibility
- **Risk**: WebGL context creation failure
- **Mitigation**: Fallback to existing 2D die implementation
- **Detection**: Runtime WebGL capability check

### 2. Performance Issues
- **Risk**: Frame drops during animation
- **Mitigation**: Adjustable quality settings, simplified geometry
- **Monitoring**: FPS counter in development builds

### 3. Memory Leaks
- **Risk**: WebGL resources not properly released
- **Mitigation**: Comprehensive cleanup in useEffect return
- **Testing**: Memory profiling during extended gameplay

## Success Metrics

### Technical Metrics
- **Performance**: Consistent 60fps during die rolls
- **Memory**: <20MB additional memory usage
- **Compatibility**: 100% success on target iOS devices

### User Experience Metrics
- **Visual Quality**: Realistic 3D appearance matching reference image
- **Animation**: Smooth, physics-based rolling motion
- **Integration**: Seamless feel with existing game UI

### Development Metrics
- **Implementation Time**: 6-8 hours total
- **Code Quality**: Full TypeScript coverage with proper error handling
- **Maintainability**: Clean separation between 3D engine and game logic

## Future Enhancements

### Short-term (Next Sprint)
- Die material variations (wood, metal, etc.)
- Particle effects for dramatic rolls
- Sound integration with 3D spatial audio

### Long-term (Future Releases)
- Multiple die shapes (D4, D8, D12, D20)
- Customizable die colors and textures
- Advanced physics with die-to-die collisions

## Conclusion

The expo-three approach provides a professional 3D die implementation with realistic physics and visual quality. While more complex than pure React Native solutions, it delivers a premium user experience that matches modern game standards. The modular architecture allows for future enhancements while maintaining clean integration with the existing Trouble Game codebase.

**Total Estimated Implementation Time: 6-8 hours**
**Risk Level: Medium (requires WebGL expertise)**
**Visual Quality: Excellent (true 3D with professional effects)**