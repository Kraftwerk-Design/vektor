# Animation Debug Tools

This directory contains debugging tools for the Animation framework. These tools are designed to be lightweight, self-contained, and easily configurable.

## Available Tools

### FPS Counter

Displays the current frames per second in a box on the screen.

#### Usage

```typescript
import { Debug } from '@js/components/Animation'

// Create and start with default settings (bottom-right corner)
const fpsCounter = new Debug.FPSCounter()
fpsCounter.start()

// Create with custom options
const customFpsCounter = new Debug.FPSCounter({
  position: 'top-right',
  margin: 20,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  color: '#ffcc00',
  showMS: true,
  fontSize: 16,
  decimals: 0,
})
customFpsCounter.start()

// Update configuration after creation
fpsCounter.configure({
  position: 'bottom-left',
  backgroundColor: 'rgba(20, 20, 20, 0.8)',
})

// Stop when no longer needed
fpsCounter.stop()
```

#### Configuration Options

| Option          | Type                                                         | Default              | Description                    |
| --------------- | ------------------------------------------------------------ | -------------------- | ------------------------------ |
| position        | 'top-left' \| 'top-right' \| 'bottom-left' \| 'bottom-right' | 'bottom-right'       | Position on the screen         |
| margin          | number                                                       | 10                   | Margin from the edge in pixels |
| backgroundColor | string                                                       | 'rgba(0, 0, 0, 0.7)' | Background color               |
| color           | string                                                       | 'white'              | Text color                     |
| zIndex          | number                                                       | 9999                 | Z-index value                  |
| showMS          | boolean                                                      | true                 | Show milliseconds per frame    |
| fontSize        | number                                                       | 14                   | Font size in pixels            |
| decimals        | number                                                       | 1                    | Number of decimal places       |

### Scroll Tracker

Displays the current scroll position in pixels from the top of the page.

#### Usage

```typescript
import { Debug } from '@js/components/Animation'

// Create and start with default settings (bottom-left corner)
const scrollTracker = new Debug.ScrollTracker()
scrollTracker.start()

// Create with custom options
const customScrollTracker = new Debug.ScrollTracker({
  position: 'top-left',
  margin: 20,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  color: '#ffcc00',
  showPercentage: true,
  showHorizontalScroll: true,
  fontSize: 16,
})
customScrollTracker.start()

// Update configuration after creation
scrollTracker.configure({
  position: 'bottom-right',
  backgroundColor: 'rgba(20, 20, 20, 0.8)',
})

// Stop when no longer needed
scrollTracker.stop()
```

#### Configuration Options

| Option               | Type                                                         | Default              | Description                     |
| -------------------- | ------------------------------------------------------------ | -------------------- | ------------------------------- |
| position             | 'top-left' \| 'top-right' \| 'bottom-left' \| 'bottom-right' | 'bottom-left'        | Position on the screen          |
| margin               | number                                                       | 10                   | Margin from the edge in pixels  |
| backgroundColor      | string                                                       | 'rgba(0, 0, 0, 0.7)' | Background color                |
| color                | string                                                       | 'white'              | Text color                      |
| zIndex               | number                                                       | 9999                 | Z-index value                   |
| showPercentage       | boolean                                                      | true                 | Show scroll percentage          |
| fontSize             | number                                                       | 14                   | Font size in pixels             |
| showHorizontalScroll | boolean                                                      | false                | Show horizontal scroll position |

## Example: Using Both Tools Together

```typescript
import { Debug } from '@js/components/Animation'

// Setup debugging tools for development
if (process.env.NODE_ENV === 'development') {
  // Initialize FPS counter in bottom right
  const fps = new Debug.FPSCounter()
  fps.start()

  // Initialize scroll tracker in bottom left
  const scrollTracker = new Debug.ScrollTracker()
  scrollTracker.start()

  // Clean up on page unload
  window.addEventListener('beforeunload', () => {
    fps.stop()
    scrollTracker.stop()
  })
}
```
