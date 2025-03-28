import { BaseAnimation } from './BaseAnimation.js'
import type { ParallaxOptions } from './types.js'

/**
 * Configuration options for parallax animation
 */
export interface ParallaxConfig {
  /** Position start factor (default: -0.5) */
  positionStart?: number
  /** Position end factor (default: 1) */
  positionEnd?: number
}

/**
 * ParallaxAnimation
 * Creates a parallax effect on elements based on scroll position
 */
export class ParallaxAnimation extends BaseAnimation {
  protected override activeClass = 'is-parallaxed'
  private scrollListenerAttached = false
  private rafId: number | null = null
  private parallaxPositionStart = -0.5
  private parallaxPositionEnd = 1

  constructor() {
    super()
    // We still use the observer to determine when elements enter/exit the viewport
    this.threshold = [0, 0.1]
    // Start observing earlier for smoother transitions
    this.rootMargin = '100px 0px -100px 0px'
  }

  /**
   * Get the default name for this animation module
   */
  public override getDefaultName(): string {
    return 'parallax'
  }

  /**
   * Configure the parallax animation module
   * @param config Configuration options
   */
  public configure(config: ParallaxConfig): void {
    if (config.positionStart !== undefined) {
      this.parallaxPositionStart = config.positionStart
    }

    if (config.positionEnd !== undefined) {
      this.parallaxPositionEnd = config.positionEnd
    }

    // Update all elements with new settings if already initialized
    if (this.elements.length > 0) {
      this.updateParallaxElements()
    }
  }

  /**
   * Override the register method to set up scroll listener
   */
  public override register(elements: HTMLElement | HTMLElement[]): void {
    super.register(elements)

    // Only attach scroll listener once
    if (!this.scrollListenerAttached) {
      window.addEventListener('scroll', this.handleScroll.bind(this), {
        passive: true,
      })
      this.scrollListenerAttached = true
      // Initial update
      this.updateParallaxElements()
    }
  }

  /**
   * Handle scroll events with requestAnimationFrame for performance
   */
  private handleScroll(): void {
    // Cancel any pending animation frame
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId)
    }

    // Schedule the update on the next animation frame
    this.rafId = requestAnimationFrame(() => {
      this.updateParallaxElements()
      this.rafId = null
    })
  }

  /**
   * Update all parallax elements based on their scroll position
   */
  private updateParallaxElements(): void {
    const viewportHeight = this.getWindowHeight()

    this.elements.forEach((element) => {
      const rect = element.getBoundingClientRect()

      // Only process elements that are near or in the viewport
      if (rect.bottom >= -100 && rect.top <= viewportHeight + 100) {
        // Calculate progress through the viewport
        // 0 = element just entered bottom of viewport
        // 0.5 = element is centered in viewport
        // 1 = element is just leaving the top of viewport
        const elementHeight = rect.height
        const totalDistance = viewportHeight + elementHeight
        const distanceTraveled = viewportHeight - rect.top

        let progress = Math.min(
          Math.max(distanceTraveled / totalDistance, 0),
          1,
        )

        // Apply the progress as a CSS variable using base method
        this.setProgress(element, progress)

        // Apply parallax effect
        this.applyParallaxEffect(element, progress)
      }
    })
  }

  /**
   * Apply parallax transformation
   */
  private applyParallaxEffect(element: HTMLElement, progress: number): void {
    // Get options from the base class method
    const options = this.getOptions<ParallaxOptions>(element)

    // Get parallax parameters
    const speed = options.speed !== undefined ? options.speed : 0.2
    const direction = options.direction || 'down'
    const startPosition =
      options.start !== undefined ? options.start : this.parallaxPositionStart
    const endPosition =
      options.end !== undefined ? options.end : this.parallaxPositionEnd

    // Use centralized window height
    const windowHeight = this.getWindowHeight()

    // Calculate transform based on progress, speed, and configured start/end positions
    let transform = ''

    if (direction === 'up' || direction === 'down') {
      const yPos =
        speed * windowHeight * startPosition +
        progress * speed * windowHeight * endPosition
      const multiplier = direction === 'up' ? -1 : 1
      transform = `translate3d(0, ${yPos * multiplier}px, 0)`
    } else {
      const xPos =
        speed * windowHeight * startPosition +
        progress * speed * windowHeight * endPosition
      const multiplier = direction === 'left' ? -1 : 1
      transform = `translate3d(${xPos * multiplier}px, 0, 0)`
    }

    element.style.transform = transform

    // Add custom class if specified
    if (options.class) {
      element.classList.add(options.class)
    }

    // Add active class
    element.classList.add(this.activeClass)
  }

  /**
   * Override to use intersection observer only for initial detection
   */
  protected override animate(
    element: HTMLElement,
    entry: IntersectionObserverEntry,
    options: ParallaxOptions,
  ): void {
    // The actual animation is handled by scroll events
    // We just mark the element as active
    element.classList.add(this.activeClass)

    // Apply custom class if specified
    if (options.class) {
      element.classList.add(options.class)
    }
  }

  /**
   * Reset parallax effect
   */
  protected override reset(
    element: HTMLElement,
    options: ParallaxOptions,
  ): void {
    // Only reset if repeat is enabled
    if (this.shouldRepeatAnimation(element)) {
      element.style.transform = 'translate3d(0, 0, 0)'
      element.classList.remove(this.activeClass)

      // Remove custom class if specified
      if (options.class) {
        element.classList.remove(options.class)
      }
    }
  }

  /**
   * Clean up resources
   */
  public override destroy(): void {
    super.destroy()

    // Remove scroll listener
    if (this.scrollListenerAttached) {
      window.removeEventListener('scroll', this.handleScroll.bind(this))
      this.scrollListenerAttached = false
    }

    // Cancel any pending animation frame
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
  }
}
