# Vektor

![npm (scoped)](https://img.shields.io/npm/v/@kraftwerkdesign/vektor)
![npm bundle size (scoped)](https://img.shields.io/bundlephobia/minzip/@kraftwerkdesign/vektor)

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

## Installation

```bash
# npm
npm install @kraftwerkdesign/vektor

# yarn
yarn add @kraftwerkdesign/vektor

# pnpm
pnpm add @kraftwerkdesign/vektor
```

## Usage

### Basic Usage

```typescript
import Vektor from '@kraftwerkdesign/vektor'

// Create a new animation manager
const animationManager = Vektor.createAnimationManager({
  attributeName: 'data-anim', // Optional: customize attribute name (default is 'kw')
})

// Initialize animations when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Register the built-in fade-in animation
  animationManager.use(Vektor.Animation.FadeIn)

  // Register the built-in parallax animation with custom configuration
  animationManager.use(Vektor.Animation.Parallax, {
    positionStart: -0.5,
    positionEnd: 1,
  })

  // Initialize the animation manager
  animationManager.init()
})

// Clean up when the app is shutting down
window.addEventListener('beforeunload', () => {
  animationManager.destroy()
})
```

### HTML Markup

```html
<!-- Basic fade-in animation -->
<div data-anim="fade-in">This content will fade in when scrolled into view</div>

<!-- Fade-in with custom options -->
<div
  data-anim="fade-in"
  data-anim-duration="1000"
  data-anim-delay="200"
  data-anim-easing="ease-out"
>
  This content will fade in with custom timing
</div>

<!-- Parallax effect -->
<div data-anim="parallax" data-anim-speed="0.5" data-anim-direction="up">
  This element will move with a parallax effect
</div>
```

## API Reference

### Creating an Animation Manager

```typescript
import Vektor from '@kraftwerkdesign/vektor'

// Create with default configuration
const animationManager = Vektor.createAnimationManager()

// Or with custom configuration
const animationManager = Vektor.createAnimationManager({
  attributeName: 'data-animation',
  defaultAnimation: 'fade-in',
})
```

### Animation Manager Methods

The animation manager is the central controller for all animation modules:

```typescript
// Register an animation module with optional configuration
animationManager.use(Vektor.Animation.FadeIn)
animationManager.use(Vektor.Animation.Parallax, { positionStart: -0.5 })

// Initialize animation detection
animationManager.init()

// Manually trigger animation updates (e.g., after dynamic content changes)
animationManager.update()

// Clean up all observers and listeners
animationManager.destroy()
```

### Configuration Options

#### Global Configuration

```typescript
import type { AnimationConfig } from '@kraftwerkdesign/vektor'

const config: AnimationConfig = {
  // Base attribute name (default: "kw")
  attributeName: 'data-anim',

  // Default animation type if none specified
  defaultAnimation: 'fade-in',

  // Whether to use data attributes as fallbacks (deprecated)
  useDataAttributeFallback: false,
}
```

#### Fade-In Animation Options

```typescript
import type { FadeInOptions } from '@kraftwerkdesign/vektor'

// Available options for fade-in animations
const fadeInOptions: FadeInOptions = {
  // Animation duration in ms
  duration: 500,

  // Animation delay in ms
  delay: 200,

  // Animation easing function
  easing: 'ease-in-out',

  // Starting opacity
  from: 0,

  // Ending opacity
  to: 1,

  // Whether to repeat the animation when element leaves viewport
  repeat: false,

  // Custom CSS classes to add
  class: 'animated',

  // Offset from top margin for intersection observer
  offsetTop: '-25%',

  // Offset from bottom margin for intersection observer
  offsetBottom: '0px',

  // Percentage of element that needs to be in view to trigger animation
  inview: '100%',
}
```

#### Parallax Animation Options

```typescript
import type { ParallaxOptions } from '@kraftwerkdesign/vektor'

// Available options for parallax animations
const parallaxOptions: ParallaxOptions = {
  // Parallax speed factor
  speed: 0.2,

  // Parallax movement direction
  direction: 'up', // 'up', 'down', 'left', 'right'

  // Position start factor
  start: -0.5,

  // Position end factor
  end: 1,

  // Whether to repeat the animation when element leaves viewport
  repeat: false,

  // Custom CSS classes to add
  class: 'parallax-active',

  // Offset from top margin for intersection observer
  offsetTop: '0px',

  // Offset from bottom margin for intersection observer
  offsetBottom: '0px',

  // Percentage of element that needs to be in view to trigger animation
  inview: '100%',
}
```

## Creating Custom Animations

You can create custom animation modules by extending the `BaseAnimation` class:

```typescript
import Vektor from '@kraftwerkdesign/vektor'
import type { BaseAnimationOptions } from '@kraftwerkdesign/vektor'

// Define custom animation options
interface ScaleOptions extends BaseAnimationOptions {
  scale?: number
}

// Create a custom animation module
class ScaleAnimation extends Vektor.Animation.Base {
  protected override activeClass = 'scale-animated'

  // Provide a default name for the animation
  public override getDefaultName(): string {
    return 'scale'
  }

  // Implement the animate method to handle animation
  protected override animate(
    element: HTMLElement,
    entry: IntersectionObserverEntry,
  ): void {
    const options = this.getElementOptions(element) as ScaleOptions
    const scale = options.scale || 1.2

    element.style.transform = `scale(${scale})`
    element.classList.add(this.activeClass)
  }

  // Implement reset method if needed
  protected override reset(element: HTMLElement): void {
    element.style.transform = ''
    element.classList.remove(this.activeClass)
  }
}

// Register with the animation manager
animationManager.use(ScaleAnimation)
```

## Browser Support

Vektor is designed to work in all modern browsers that support the Intersection Observer API. For older browsers, consider using a polyfill for IntersectionObserver.

## License

ISC © Kraftwerk Design
