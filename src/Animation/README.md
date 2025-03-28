# Vektor

A lightweight, flexible animation framework for creating scroll-based animations and effects.

## Features

- Modular architecture for easy extensibility
- Attribute-based configuration directly in HTML
- Built-in animation modules:
  - `fade-in`: Fade in elements as they enter the viewport
  - `parallax`: Create smooth parallax scrolling effects
- Respects user's "prefers-reduced-motion" settings
- Observer-based animations for optimal performance
- Easily extensible with custom animation modules

## Basic Usage

### 1. Initialize the animation framework

```javascript
import {
  AnimationManager,
  FadeInAnimation,
  ParallaxAnimation,
} from '@js/components/Animation';

// Create a new instance of the AnimationManager
const animationManager = new AnimationManager();

// Register animation modules
animationManager.use(FadeInAnimation);

// Register parallax with module-specific configuration
animationManager.use(ParallaxAnimation, {
  positionStart: -0.5,
  positionEnd: 1,
});

// Initialize animations (typically on DOMContentLoaded)
document.addEventListener('DOMContentLoaded', () => {
  animationManager.init();
});

// Clean up when the app is shutting down
window.addEventListener('beforeunload', () => {
  animationManager.destroy();
});
```

### 2. Add animation attributes to your HTML

```html
<!-- Basic fade-in animation -->
<div kw="fade-in">This content will fade in when scrolled into view</div>

<!-- Fade-in with custom options -->
<div kw="fade-in" kw-duration="1000" kw-delay="200" kw-easing="ease-out">
  This content will fade in with custom timing
</div>

<!-- Parallax effect -->
<div kw="parallax" kw-speed="0.5" kw-direction="up">
  This element will move with a parallax effect
</div>
```

## Configuration Options

### Global Configuration

You can configure the animation framework when initializing:

```javascript
const animationManager = new AnimationManager({
  attributeName: 'kw', // Base attribute name (default: "kw")
  defaultAnimation: 'fade-in', // Default animation type when none specified
});
```

### Animation-Specific Options

#### Fade-In Animation

| Attribute          | Description                                                             | Default |
| ------------------ | ----------------------------------------------------------------------- | ------- |
| `kw-duration`      | Animation duration in ms                                                | 500     |
| `kw-delay`         | Animation delay in ms                                                   | 0       |
| `kw-easing`        | CSS easing function                                                     | 'ease'  |
| `kw-from`          | Starting opacity                                                        | 0       |
| `kw-to`            | Ending opacity                                                          | 1       |
| `kw-repeat`        | Whether to repeat animation when out of viewport                        | false   |
| `kw-class`         | CSS class to add when animated                                          |         |
| `kw-offset-top`    | Offset from the top of the viewport for triggering the animation        | '0px'   |
| `kw-offset-bottom` | Offset from the bottom of the viewport for triggering the animation     | '0px'   |
| `kw-inview`        | Percentage of the element that must be in view to trigger the animation | '100%'  |

Example:

```html
<div
  kw="fade-in"
  kw-duration="800"
  kw-delay="200"
  kw-repeat="true"
  kw-offset-top="-25%"
>
  This will fade in over 800ms with a 200ms delay, and reset when scrolled out
</div>
```

#### Parallax Animation

| Attribute          | Description                                                             | Default |
| ------------------ | ----------------------------------------------------------------------- | ------- |
| `kw-speed`         | Parallax speed factor                                                   | 0.2     |
| `kw-direction`     | Movement direction (up, down, left, right)                              | 'down'  |
| `kw-start`         | Position start factor                                                   | -0.5    |
| `kw-end`           | Position end factor                                                     | 1       |
| `kw-repeat`        | Whether to reset when out of viewport                                   | false   |
| `kw-class`         | CSS class to add when animated                                          |         |
| `kw-offset-top`    | Offset from the top of the viewport for triggering the animation        | '0px'   |
| `kw-offset-bottom` | Offset from the bottom of the viewport for triggering the animation     | '0px'   |
| `kw-inview`        | Percentage of the element that must be in view to trigger the animation | '100%'  |

Example:

```html
<div kw="parallax" kw-speed="0.4" kw-direction="up" kw-offset-top="-25%">
  This will move upward with parallax effect at 0.4x speed
</div>
```

## Creating Custom Animation Modules

You can create custom animation modules by extending the `BaseAnimation` class:

```typescript
import { BaseAnimation } from '@js/components/Animation';

export class MyCustomAnimation extends BaseAnimation {
  protected override activeClass = 'my-custom-animated'; // CSS class to add when animated

  // Provide a default name for the animation
  public override getDefaultName(): string {
    return 'custom-effect';
  }

  // Implement the animate method to handle animation
  protected override animate(
    element: HTMLElement,
    entry: IntersectionObserverEntry,
  ): void {
    // Your animation logic here
    element.classList.add(this.activeClass);
  }

  // Implement reset method if needed
  protected override reset(element: HTMLElement): void {
    element.classList.remove(this.activeClass);
  }

  // Optional: Override isInitialized if you need custom initialization detection
  // By default, the BaseAnimation checks for the activeClass
  public override isInitialized(element: HTMLElement): boolean {
    return (
      element.classList.contains(this.activeClass) ||
      element.hasAttribute('data-animated')
    );
  }
}
```

Then register your custom animation:

```javascript
import { MyCustomAnimation } from './MyCustomAnimation';

// Register with the animation manager
animationManager.use(MyCustomAnimation);
```

Now you can use it in HTML:

```html
<div kw="custom-effect" kw-custom-option="value">
  This will use your custom animation
</div>
```

## Customizing Attribute Parser

You can add custom attribute mappings for your animations:

```javascript
import { AttributeParser } from '@js/components/Animation/AttributeParser';

// Create parser with custom configuration
const parser = new AttributeParser({ attributeName: 'anim' });

// Add common attribute mapping
parser.addCommonAttribute({
  attributeSuffix: 'custom-option',
  optionName: 'customOption',
});

// Add module-specific value mapping
parser.addModuleValueMapping('custom-effect', 'intensity');
```

## Module-Specific Configuration

You can pass module-specific configuration when registering modules:

```javascript
// Register animation modules with specific configuration
animationManager.use(
  ModuleClass, // The animation module class
  moduleConfig, // Optional: module-specific configuration
);
```

### Advanced Use Cases

For more advanced use cases, like registering a module with a custom name, you can use the `registerModule` method directly:

```javascript
// Create a module instance
const fadeModule = new FadeInAnimation();

// Configure it if needed
fadeModule.updateConfig({
  /* global options */
});

// Register with a custom name
animationManager.registerModule('fade-custom', fadeModule);
```

### ParallaxAnimation Configuration

The ParallaxAnimation module accepts these configuration options:

| Option          | Description                                        | Default |
| --------------- | -------------------------------------------------- | ------- |
| `positionStart` | Starting position factor for parallax calculations | -0.5    |
| `positionEnd`   | Ending position factor for parallax calculations   | 1       |

Example:

```javascript
// Configure parallax with custom ranges
animationManager.use(ParallaxAnimation, {
  positionStart: -0.8, // Start from further back
  positionEnd: 1.5, // Move further forward
});
```

### Creating Configurable Modules

When creating custom animation modules, implement a `configure()` method to accept module-specific options:

```typescript
export interface MyCustomConfig {
  speed?: number;
  intensity?: number;
}

export class MyCustomAnimation extends BaseAnimation {
  private speed = 1;
  private intensity = 0.5;

  public configure(config: MyCustomConfig): void {
    if (config.speed !== undefined) {
      this.speed = config.speed;
    }
    if (config.intensity !== undefined) {
      this.intensity = config.intensity;
    }
  }

  // Rest of the class implementation...
}
```

Then use it like this:

```javascript
animationManager.use(MyCustomAnimation, {
  speed: 2,
  intensity: 0.8,
});
```
