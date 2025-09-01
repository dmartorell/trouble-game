# 3D Die Implementation Specification - React Native Reanimated Approach

## Overview
This specification outlines the implementation of a realistic 3D die using pure React Native Reanimated transforms and perspective. This approach creates true 3D geometry without external dependencies, utilizing CSS 3D transforms and mathematical calculations for realistic physics simulation.

## Technical Architecture

### Core Technologies
- **React Native Reanimated 3**: Advanced animations and transforms
- **React Native Core**: View components and styling
- **TypeScript**: Type safety and mathematical utilities
- **CSS 3D Transforms**: Perspective, rotateX/Y/Z, translateZ

### System Requirements
- **Platform**: iOS 14+ (primary), Android 8+ (secondary)
- **Performance**: 60fps native animations via Reanimated worklets
- **Memory**: Minimal overhead (~1MB additional)
- **Bundle Size**: Zero additional dependencies

## Component Architecture

### 1. 3D Cube Component Structure
```
Die3D/
├── index.tsx                # Main component export
├── Die3DCube.tsx           # 3D cube geometry container
├── DieFace.tsx             # Individual cube face component
├── Die3DPhysics.tsx        # Roll animation and physics
└── utils/
    ├── cubeTransforms.ts   # 3D transform calculations
    ├── rollPhysics.ts      # Physics simulation
    └── facePositions.ts    # Face positioning utilities
```

### 2. 3D Geometry Architecture
```typescript
// Die3DCube.tsx core structure
interface Die3DCubeProps {
  size: number;
  dieValue: number;
  isRolling: boolean;
  onRollComplete: (value: number) => void;
}

export const Die3DCube: FC<Die3DCubeProps> = ({
  size,
  dieValue,
  isRolling,
  onRollComplete
}) => {
  // 6 DieFace components positioned in 3D space
  // Reanimated shared values for rotation
  // Physics-based roll animation
  // Face value calculation from final rotation
}
```

## Implementation Phases

### Phase 1: 3D Cube Geometry Setup (3-4 hours)

#### 1.1 Core 3D Transform System
```typescript
// cubeTransforms.ts
export interface Transform3D {
  translateX: number;
  translateY: number;
  translateZ: number;
  rotateX: string;
  rotateY: string;
  rotateZ: string;
  perspective: number;
}

export const FACE_TRANSFORMS: Record<DieFace, Transform3D> = {
  front: {   // Face 1
    translateX: 0, translateY: 0, translateZ: 50,
    rotateX: '0deg', rotateY: '0deg', rotateZ: '0deg',
    perspective: 1000
  },
  back: {    // Face 6
    translateX: 0, translateY: 0, translateZ: -50,
    rotateX: '0deg', rotateY: '180deg', rotateZ: '0deg',
    perspective: 1000
  },
  right: {   // Face 2
    translateX: 50, translateY: 0, translateZ: 0,
    rotateX: '0deg', rotateY: '90deg', rotateZ: '0deg',
    perspective: 1000
  },
  left: {    // Face 5
    translateX: -50, translateY: 0, translateZ: 0,
    rotateX: '0deg', rotateY: '-90deg', rotateZ: '0deg',
    perspective: 1000
  },
  top: {     // Face 4
    translateX: 0, translateY: -50, translateZ: 0,
    rotateX: '-90deg', rotateY: '0deg', rotateZ: '0deg',
    perspective: 1000
  },
  bottom: {  // Face 3
    translateX: 0, translateY: 50, translateZ: 0,
    rotateX: '90deg', rotateY: '0deg', rotateZ: '0deg',
    perspective: 1000
  }
};
```

#### 1.2 DieFace Component
```typescript
// DieFace.tsx
interface DieFaceProps {
  faceValue: 1 | 2 | 3 | 4 | 5 | 6;
  size: number;
  transform: Transform3D;
  globalRotation: SharedValue<{x: number, y: number, z: number}>;
}

export const DieFace: FC<DieFaceProps> = ({
  faceValue,
  size,
  transform,
  globalRotation
}) => {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      position: 'absolute',
      width: size,
      height: size,
      transform: [
        { perspective: transform.perspective },
        { translateX: transform.translateX },
        { translateY: transform.translateY },
        { translateZ: transform.translateZ },
        { rotateX: transform.rotateX },
        { rotateY: transform.rotateY },
        { rotateZ: transform.rotateZ },
        // Apply global die rotation
        { rotateX: `${globalRotation.value.x}deg` },
        { rotateY: `${globalRotation.value.y}deg` },
        { rotateZ: `${globalRotation.value.z}deg` },
      ],
      backgroundColor: '#ffffff',
      borderWidth: 1,
      borderColor: '#000000',
      borderRadius: 4,
      // Realistic shadows and depth
      shadowColor: '#000000',
      shadowOffset: { width: 2, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 8,
    };
  });

  return (
    <Animated.View style={animatedStyle}>
      <DieDots value={faceValue} size={size} />
    </Animated.View>
  );
};
```

#### 1.3 Dot Pattern Rendering
```typescript
// DieDots component within DieFace.tsx
const DieDots: FC<{value: number, size: number}> = ({ value, size }) => {
  const dotSize = size * 0.08;
  const spacing = size * 0.25;
  
  const dotPositions = useMemo(() => {
    const center = size / 2;
    return {
      topLeft: { x: center - spacing, y: center - spacing },
      topRight: { x: center + spacing, y: center - spacing },
      middleLeft: { x: center - spacing, y: center },
      center: { x: center, y: center },
      middleRight: { x: center + spacing, y: center },
      bottomLeft: { x: center - spacing, y: center + spacing },
      bottomRight: { x: center + spacing, y: center + spacing },
    };
  }, [size, spacing]);

  const dotConfigs = useMemo(() => ({
    1: ['center'],
    2: ['topLeft', 'bottomRight'],
    3: ['topLeft', 'center', 'bottomRight'],
    4: ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'],
    5: ['topLeft', 'topRight', 'center', 'bottomLeft', 'bottomRight'],
    6: ['topLeft', 'topRight', 'middleLeft', 'middleRight', 'bottomLeft', 'bottomRight'],
  }), []);

  const config = dotConfigs[value as keyof typeof dotConfigs] || dotConfigs[1];

  return (
    <View style={StyleSheet.absoluteFill}>
      {config.map((position, index) => {
        const pos = dotPositions[position as keyof typeof dotPositions];
        return (
          <View
            key={`dot-${index}`}
            style={{
              position: 'absolute',
              width: dotSize * 2,
              height: dotSize * 2,
              borderRadius: dotSize,
              backgroundColor: '#000000',
              left: pos.x - dotSize,
              top: pos.y - dotSize,
            }}
          />
        );
      })}
    </View>
  );
};
```

**Deliverable**: Static 3D cube with proper face positioning and dot patterns

### Phase 2: Advanced 3D Transforms and Perspective (2-3 hours)

#### 2.1 Enhanced Transform Calculations
```typescript
// cubeTransforms.ts - Advanced transform utilities
export function transformWithOrigin(
  transform: Transform3D,
  origin: { x: number; y: number; z: number }
): Transform3D {
  // Apply transforms relative to custom origin point
  // Useful for precise cube rotation anchor points
  return {
    ...transform,
    translateX: transform.translateX + origin.x,
    translateY: transform.translateY + origin.y,
    translateZ: transform.translateZ + origin.z,
  };
}

export function applyPerspectiveCorrection(
  baseTransform: Transform3D,
  viewAngle: number,
  distance: number
): Transform3D {
  // Adjust perspective based on viewing angle and distance
  const perspectiveValue = distance / Math.tan((viewAngle * Math.PI) / 360);
  return {
    ...baseTransform,
    perspective: perspectiveValue,
  };
}

export function calculateVisibleFaces(rotation: {x: number, y: number, z: number}): DieFace[] {
  // Determine which faces are visible based on current rotation
  // Used for optimization - only render visible faces
  const faces: DieFace[] = [];
  
  // Complex trigonometry to determine face visibility
  // This helps optimize rendering and determine final face value
  
  return faces;
}
```

#### 2.2 Realistic Lighting and Shadows
```typescript
// Enhanced DieFace with dynamic shadows
export const DieFace: FC<DieFaceProps> = (props) => {
  const shadowStyle = useAnimatedStyle(() => {
    const rotation = props.globalRotation.value;
    
    // Calculate shadow intensity based on face angle to light source
    const lightAngle = { x: 45, y: 45, z: 0 }; // Light source position
    const faceNormal = calculateFaceNormal(props.transform, rotation);
    const shadowIntensity = calculateShadowIntensity(faceNormal, lightAngle);
    
    return {
      shadowOpacity: shadowIntensity * 0.4,
      shadowOffset: {
        width: shadowIntensity * 3,
        height: shadowIntensity * 3,
      },
      shadowRadius: shadowIntensity * 6,
    };
  });
  
  // Apply dynamic shadow to face styling
};

function calculateFaceNormal(
  faceTransform: Transform3D, 
  globalRotation: {x: number, y: number, z: number}
): {x: number, y: number, z: number} {
  // Calculate face normal vector after transforms
  // Used for realistic lighting calculations
}

function calculateShadowIntensity(
  normal: {x: number, y: number, z: number},
  lightDirection: {x: number, y: number, z: number}
): number {
  // Calculate shadow intensity using dot product
  // Returns value between 0 and 1
}
```

#### 2.3 Performance Optimizations
```typescript
// Die3DCube.tsx - Optimized rendering
export const Die3DCube: FC<Die3DCubeProps> = (props) => {
  const visibleFaces = useDerivedValue(() => {
    return calculateVisibleFaces(globalRotation.value);
  });

  const shouldRenderFace = useCallback((face: DieFace) => {
    return visibleFaces.value.includes(face);
  }, [visibleFaces]);

  // Only render visible faces for better performance
  return (
    <View style={[styles.cubeContainer, { width: props.size, height: props.size }]}>
      {FACE_ORDER.map((face) => 
        shouldRenderFace(face) ? (
          <DieFace
            key={face}
            faceValue={FACE_VALUES[face]}
            size={props.size}
            transform={FACE_TRANSFORMS[face]}
            globalRotation={globalRotation}
          />
        ) : null
      )}
    </View>
  );
};
```

**Deliverable**: Realistic 3D cube with proper perspective, lighting, and optimized rendering

### Phase 3: Physics-Based Roll Animation (3-4 hours)

#### 3.1 Advanced Physics Simulation
```typescript
// rollPhysics.ts - Comprehensive physics engine
export class Die3DPhysics {
  private rotation = { x: 0, y: 0, z: 0 };
  private angularVelocity = { x: 0, y: 0, z: 0 };
  private targetValue: number;
  private startTime: number;
  private isSettling: boolean = false;

  public startRoll(targetValue: number, initialForce: number = 1.0): void {
    this.targetValue = targetValue;
    this.startTime = Date.now();
    this.isSettling = false;
    
    // Generate realistic initial angular velocity
    this.angularVelocity = {
      x: (Math.random() - 0.5) * 720 * initialForce,
      y: (Math.random() - 0.5) * 720 * initialForce,
      z: (Math.random() - 0.5) * 540 * initialForce,
    };
    
    this.simulatePhysics();
  }

  private simulatePhysics(): void {
    const elapsed = Date.now() - this.startTime;
    const totalDuration = 1200; // 1.2 seconds total
    const settleStart = 900;    // Start settling at 0.9 seconds
    
    if (elapsed < settleStart) {
      this.updateTumblingPhase(elapsed / settleStart);
    } else if (!this.isSettling) {
      this.startSettlingPhase();
    } else {
      this.updateSettlingPhase((elapsed - settleStart) / (totalDuration - settleStart));
    }
    
    if (elapsed < totalDuration) {
      requestAnimationFrame(() => this.simulatePhysics());
    } else {
      this.finishRoll();
    }
  }

  private updateTumblingPhase(progress: number): void {
    const deceleration = this.calculateDeceleration(progress);
    
    // Apply angular velocity with deceleration
    this.rotation.x += (this.angularVelocity.x * deceleration) / 60;
    this.rotation.y += (this.angularVelocity.y * deceleration) / 60;
    this.rotation.z += (this.angularVelocity.z * deceleration) / 60;
    
    // Apply realistic drag
    this.angularVelocity.x *= 0.98;
    this.angularVelocity.y *= 0.98;
    this.angularVelocity.z *= 0.97;
    
    this.updateSharedValues();
  }

  private startSettlingPhase(): void {
    this.isSettling = true;
    const targetRotation = this.calculateTargetRotation(this.targetValue);
    
    // Smooth transition to target rotation
    this.animateToTarget(targetRotation);
  }

  private calculateTargetRotation(value: number): {x: number, y: number, z: number} {
    // Map die value to final rotation that shows correct face on top
    const rotationMap = {
      1: { x: 0, y: 0, z: 0 },       // Front face up
      2: { x: 0, y: 90, z: 0 },      // Right face up  
      3: { x: 90, y: 0, z: 0 },      // Bottom face up
      4: { x: -90, y: 0, z: 0 },     // Top face up
      5: { x: 0, y: -90, z: 0 },     // Left face up
      6: { x: 0, y: 180, z: 0 },     // Back face up
    };
    
    return rotationMap[value as keyof typeof rotationMap];
  }

  private animateToTarget(target: {x: number, y: number, z: number}): void {
    // Use Reanimated springs for smooth settling
    this.rotationX.value = withSpring(target.x, {
      damping: 15,
      stiffness: 200,
      mass: 1,
    });
    
    this.rotationY.value = withSpring(target.y, {
      damping: 15,
      stiffness: 200,
      mass: 1,
    });
    
    this.rotationZ.value = withSpring(target.z, {
      damping: 15,
      stiffness: 200,
      mass: 1,
    });
  }

  private calculateDeceleration(progress: number): number {
    // Realistic deceleration curve - fast start, gradual slowdown
    return Math.pow(1 - progress, 2);
  }
}
```

#### 3.2 Advanced Animation Curves
```typescript
// rollPhysics.ts - Enhanced easing functions
export const DieEasing = {
  tumble: (progress: number): number => {
    // Custom easing for realistic tumbling motion
    if (progress < 0.1) {
      return progress * 10; // Quick start
    } else if (progress < 0.7) {
      return 1 - Math.pow(2, -10 * ((progress - 0.1) / 0.6)); // Exponential decay
    } else {
      return 0.95 + 0.05 * Math.sin((progress - 0.7) * 10 * Math.PI); // Subtle oscillation
    }
  },

  bounce: (progress: number): number => {
    // Realistic bounce effect when die settles
    const n1 = 7.5625;
    const d1 = 2.75;

    if (progress < 1 / d1) {
      return n1 * progress * progress;
    } else if (progress < 2 / d1) {
      return n1 * (progress -= 1.5 / d1) * progress + 0.75;
    } else if (progress < 2.5 / d1) {
      return n1 * (progress -= 2.25 / d1) * progress + 0.9375;
    } else {
      return n1 * (progress -= 2.625 / d1) * progress + 0.984375;
    }
  },

  settle: (progress: number): number => {
    // Final settling with slight overshoot
    return 1 + Math.exp(-6 * progress) * Math.cos(8 * progress) * 0.1;
  }
};
```

#### 3.3 Worklet Integration
```typescript
// Die3DCube.tsx - Worklet-based animation
export const Die3DCube: FC<Die3DCubeProps> = (props) => {
  const rotationX = useSharedValue(0);
  const rotationY = useSharedValue(0);
  const rotationZ = useSharedValue(0);
  
  const globalRotation = useDerivedValue(() => ({
    x: rotationX.value,
    y: rotationY.value,
    z: rotationZ.value,
  }));

  const startRoll = useWorklet((targetValue: number) => {
    'worklet';
    
    const physics = new Die3DPhysics(rotationX, rotationY, rotationZ);
    physics.startRoll(targetValue);
  });

  useEffect(() => {
    if (props.isRolling) {
      runOnUI(startRoll)(props.dieValue);
    }
  }, [props.isRolling, props.dieValue]);

  // Rest of component implementation
};
```

**Deliverable**: Realistic physics-based rolling animation with proper settling

### Phase 4: Integration and Polish (2-3 hours)

#### 4.1 PopOMatic Integration
```typescript
// PopOMatic.tsx - Updated to use 3D die
export const PopOMatic: FC<PopOMaticProps> = ({
  size = 80,
  disabled = false,
  onRoll,
}) => {
  const { rollDie, dieState } = useGameStore();
  const { settings } = useSettingsStore();
  
  const handleRoll = useCallback(async () => {
    if (disabled || dieState.isRolling) return;
    
    // Haptic feedback for pop sensation
    if (settings.hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    const result = await rollDie();
    if (onRoll) onRoll(result);
  }, [disabled, dieState.isRolling, settings.hapticsEnabled, rollDie, onRoll]);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Pressable
        style={[styles.pressableArea, { width: size, height: size }]}
        onPress={handleRoll}
        disabled={disabled || dieState.isRolling}
      >
        {/* Keep existing housing SVG */}
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Housing background and dome - unchanged */}
        </Svg>
        
        {/* Replace SVG die with 3D die */}
        <View style={[styles.dieContainer, { width: size * 0.6, height: size * 0.6 }]}>
          <Die3DCube
            size={size * 0.4}
            dieValue={dieState.value}
            isRolling={dieState.isRolling}
            onRollComplete={() => {
              // Animation complete - handled by game store
            }}
          />
        </View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressableArea: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
  },
  dieContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    // Ensure 3D transforms work properly
    overflow: 'visible',
  },
});
```

#### 4.2 Performance Monitoring
```typescript
// utils/performanceMonitor.ts
export class PerformanceMonitor {
  private frameCount = 0;
  private lastTime = 0;
  private fps = 60;

  public startMonitoring(): void {
    this.measureFrame();
  }

  private measureFrame(): void {
    this.frameCount++;
    const currentTime = Date.now();
    
    if (currentTime - this.lastTime >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.lastTime = currentTime;
      
      if (__DEV__ && this.fps < 45) {
        console.warn(`Die animation performance warning: ${this.fps} FPS`);
      }
    }
    
    requestAnimationFrame(() => this.measureFrame());
  }

  public getCurrentFPS(): number {
    return this.fps;
  }
}

// Integration in Die3DCube
export const Die3DCube: FC<Die3DCubeProps> = (props) => {
  const performanceMonitor = useRef(new PerformanceMonitor()).current;
  
  useEffect(() => {
    if (__DEV__) {
      performanceMonitor.startMonitoring();
    }
  }, []);
  
  // Rest of component
};
```

#### 4.3 Error Handling and Fallbacks
```typescript
// Die3DCube.tsx - Comprehensive error handling
export const Die3DCube: FC<Die3DCubeProps> = (props) => {
  const [hasError, setHasError] = useState(false);
  const [supports3D, setSupports3D] = useState(true);

  useEffect(() => {
    // Test 3D transform support
    const testSupport = () => {
      try {
        const testElement = document.createElement('div');
        testElement.style.transform = 'rotateX(90deg) rotateY(90deg) translateZ(100px)';
        testElement.style.perspective = '1000px';
        return testElement.style.transform !== '';
      } catch {
        return false;
      }
    };

    if (!testSupport()) {
      console.warn('3D transforms not fully supported, falling back to 2D');
      setSupports3D(false);
    }
  }, []);

  if (hasError || !supports3D) {
    // Fallback to existing 2D die implementation
    return <Die2DFallback {...props} />;
  }

  const handleError = useCallback((error: Error) => {
    console.error('Die3D rendering error:', error);
    setHasError(true);
  }, []);

  return (
    <ErrorBoundary onError={handleError}>
      {/* 3D Die implementation */}
    </ErrorBoundary>
  );
};
```

**Deliverable**: Fully integrated 3D die system with error handling and performance monitoring

## Technical Implementation Details

### 1. Mathematical Foundation
```typescript
// cubeTransforms.ts - Core mathematics
export class Vector3D {
  constructor(public x: number, public y: number, public z: number) {}
  
  public static fromEuler(rotation: {x: number, y: number, z: number}): Vector3D[] {
    // Convert Euler angles to rotation matrix
    // Return array of basis vectors
  }
  
  public dot(other: Vector3D): number {
    return this.x * other.x + this.y * other.y + this.z * other.z;
  }
  
  public cross(other: Vector3D): Vector3D {
    return new Vector3D(
      this.y * other.z - this.z * other.y,
      this.z * other.x - this.x * other.z,
      this.x * other.y - this.y * other.x
    );
  }
  
  public normalize(): Vector3D {
    const length = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    return new Vector3D(this.x / length, this.y / length, this.z / length);
  }
}

export function eulerToMatrix(rotation: {x: number, y: number, z: number}): number[][] {
  // Convert Euler angles to 4x4 transformation matrix
  // Used for precise 3D calculations
}

export function matrixToEuler(matrix: number[][]): {x: number, y: number, z: number} {
  // Convert transformation matrix back to Euler angles
  // Used for final face determination
}
```

### 2. Advanced Face Detection
```typescript
// rollPhysics.ts - Precise face calculation
export function determineFinalFace(rotation: {x: number, y: number, z: number}): number {
  // Create normalized rotation matrix
  const matrix = eulerToMatrix(rotation);
  
  // Define face normal vectors
  const faceNormals = {
    1: new Vector3D(0, 0, 1),    // Front
    2: new Vector3D(1, 0, 0),    // Right
    3: new Vector3D(0, 1, 0),    // Bottom
    4: new Vector3D(0, -1, 0),   // Top
    5: new Vector3D(-1, 0, 0),   // Left
    6: new Vector3D(0, 0, -1),   // Back
  };
  
  // Up vector in world space
  const up = new Vector3D(0, -1, 0);
  
  // Find face with normal closest to up vector
  let closestFace = 1;
  let maxDot = -1;
  
  for (const [face, normal] of Object.entries(faceNormals)) {
    const transformedNormal = transformVector(normal, matrix);
    const dot = transformedNormal.dot(up);
    
    if (dot > maxDot) {
      maxDot = dot;
      closestFace = parseInt(face);
    }
  }
  
  return closestFace;
}
```

### 3. Platform-Specific Optimizations
```typescript
// platformOptimizations.ts
import { Platform } from 'react-native';

export const PLATFORM_CONFIG = {
  ios: {
    perspective: 1000,
    shadows: true,
    antialiasing: true,
    maxFPS: 60,
  },
  android: {
    perspective: 800,  // Android has perspective limitations
    shadows: false,    // Disable shadows for better performance
    antialiasing: false,
    maxFPS: 45,        // More conservative FPS target
  },
  web: {
    perspective: 1200,
    shadows: true,
    antialiasing: true,
    maxFPS: 60,
  },
};

export function getPlatformConfig() {
  return PLATFORM_CONFIG[Platform.OS] || PLATFORM_CONFIG.ios;
}

// Apply platform-specific settings
export const Die3DCube: FC<Die3DCubeProps> = (props) => {
  const config = getPlatformConfig();
  
  const basePerspective = config.perspective;
  const shouldRenderShadows = config.shadows;
  const targetFPS = config.maxFPS;
  
  // Use configuration throughout component
};
```

## Testing Strategy

### 1. Unit Tests
```typescript
// __tests__/cubeTransforms.test.ts
describe('3D Cube Transforms', () => {
  test('face positioning calculations', () => {
    const frontFace = FACE_TRANSFORMS.front;
    expect(frontFace.translateZ).toBe(50);
    expect(frontFace.rotateY).toBe('0deg');
  });
  
  test('final face determination', () => {
    const rotation = { x: 0, y: 0, z: 0 };
    const face = determineFinalFace(rotation);
    expect(face).toBe(1); // Front face should be showing
  });
  
  test('vector mathematics', () => {
    const v1 = new Vector3D(1, 0, 0);
    const v2 = new Vector3D(0, 1, 0);
    const cross = v1.cross(v2);
    expect(cross).toEqual(new Vector3D(0, 0, 1));
  });
});
```

### 2. Integration Tests
```typescript
// __tests__/Die3DCube.integration.test.ts
describe('3D Die Integration', () => {
  test('roll animation completes successfully', async () => {
    const onRollComplete = jest.fn();
    const { getByTestId } = render(
      <Die3DCube
        size={100}
        dieValue={3}
        isRolling={true}
        onRollComplete={onRollComplete}
      />
    );
    
    // Wait for animation to complete
    await waitFor(() => {
      expect(onRollComplete).toHaveBeenCalledWith(3);
    }, { timeout: 2000 });
  });
  
  test('performance meets requirements', async () => {
    const monitor = new PerformanceMonitor();
    monitor.startMonitoring();
    
    // Run animation
    render(<Die3DCube size={100} dieValue={1} isRolling={true} />);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    expect(monitor.getCurrentFPS()).toBeGreaterThan(45);
  });
});
```

### 3. Visual Regression Tests
```typescript
// __tests__/Die3D.visual.test.ts
describe('3D Die Visual Tests', () => {
  test('face dot patterns render correctly', () => {
    [1, 2, 3, 4, 5, 6].forEach(value => {
      const { container } = render(
        <DieFace faceValue={value} size={100} transform={FACE_TRANSFORMS.front} />
      );
      
      // Take screenshot and compare with baseline
      expect(container).toMatchSnapshot(`die-face-${value}.png`);
    });
  });
  
  test('3D cube assembly', () => {
    const { container } = render(
      <Die3DCube size={100} dieValue={1} isRolling={false} />
    );
    
    expect(container).toMatchSnapshot('3d-cube-static.png');
  });
});
```

## Platform Considerations

### iOS Optimization
- **3D Transforms**: Excellent native support for CSS 3D transforms
- **Performance**: Metal rendering provides smooth 60fps animations
- **Perspective**: Full perspective transform support
- **Shadows**: Native shadow rendering with good performance

### Android Considerations  
- **3D Limitations**: Some Android versions have perspective transform limitations
- **Performance**: More conservative settings to maintain frame rate
- **Rendering**: Use `renderToHardwareTextureAndroid` for better performance
- **Fallback**: More aggressive fallback to 2D for older devices

## Risk Mitigation

### 1. Performance Risks
- **Risk**: Animation frame drops on older devices
- **Mitigation**: Adaptive quality settings, performance monitoring
- **Fallback**: Automatic degradation to simpler animation

### 2. Platform Compatibility
- **Risk**: 3D transforms not fully supported on some Android devices
- **Mitigation**: Runtime capability detection, 2D fallback
- **Testing**: Comprehensive device testing matrix

### 3. Mathematical Precision
- **Risk**: Floating-point errors in face detection
- **Mitigation**: Epsilon-based comparisons, validation tests
- **Monitoring**: Automated tests for edge cases

## Success Metrics

### Technical Performance
- **Frame Rate**: Consistent 60fps on iOS, 45fps+ on Android
- **Memory**: <5MB additional memory usage
- **CPU**: <15% CPU usage during animation
- **Battery**: Minimal impact on battery life

### Visual Quality
- **3D Effect**: Convincing depth and perspective
- **Animation**: Smooth, realistic rolling motion
- **Face Clarity**: Clear, readable dot patterns
- **Integration**: Seamless with existing UI

### Development Metrics
- **Implementation Time**: 10-12 hours total
- **Code Coverage**: 90%+ test coverage
- **TypeScript**: 100% type safety
- **Performance Tests**: Automated performance regression testing

## Future Enhancements

### Phase 5 (Future)
- **Multiple Die Shapes**: D4, D8, D12, D20 geometries
- **Material Variations**: Wood, metal, crystal textures
- **Physics Interactions**: Multiple dice collision simulation
- **Advanced Effects**: Particle systems, dynamic lighting

### Performance Optimizations
- **LOD System**: Level-of-detail based on die size
- **Culling**: Frustum culling for off-screen dice
- **Batching**: Batch multiple dice animations
- **Caching**: Transform calculation caching

## Conclusion

The React Native Reanimated approach provides excellent 3D visual effects without external dependencies. While more mathematically complex than library-based solutions, it offers complete control over the animation system and ensures compatibility with the existing codebase. The implementation leverages native performance through Reanimated worklets while maintaining clean separation of concerns.

**Total Estimated Implementation Time: 10-12 hours**
**Risk Level: Medium-Low (requires 3D mathematics expertise)**
**Visual Quality: Excellent (true 3D geometry with realistic physics)**
**Dependencies: Zero (uses existing Reanimated installation)**