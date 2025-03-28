import { BaseAnimation } from './BaseAnimation'
import type { FadeInOptions } from './types'

/**
 * FadeInAnimation
 * Default animation module that fades in elements
 */
export class FadeInAnimation extends BaseAnimation {
  protected override activeClass = 'is-animated'
  private pendingAnimations: Map<HTMLElement, number> = new Map()

  constructor() {
    super()
    this.rootMargin = '0px 0px -10% 0px' // Trigger slightly before element enters viewport
    this.threshold = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1] // More granular thresholds
  }

  /**
   * Get the default name for this animation module
   */
  public override getDefaultName(): string {
    return 'fade-in'
  }

  /**
   * Initialize an element by setting its initial state
   */
  private initElement(element: HTMLElement): void {
    // Set initial opacity if not already set
    if (
      element.style.opacity !== '0' &&
      !element.classList.contains(this.activeClass)
    ) {
      // Get options from the base class method
      const options = this.getOptions<FadeInOptions>(element)
      const fromOpacity = options.from !== undefined ? options.from : 0

      // Apply initial opacity
      element.style.opacity = fromOpacity.toString()
      element.style.visibility = 'visible' // Ensure the element is visible (but transparent)
    }
  }

  /**
   * Parse CSS time value to milliseconds
   */
  private parseTimeValue(value: string | number | undefined): number {
    if (value === undefined) {
      return 500 // Default to 500ms
    }

    if (typeof value === 'number') {
      return value
    }

    // If string with 's' suffix (e.g., '0.5s'), convert to ms
    if (value.endsWith('s')) {
      return parseFloat(value) * 1000
    }

    // If string with 'ms' suffix or just a number string
    return parseFloat(value)
  }

  /**
   * Override register to set initial opacity for all elements
   */
  public override register(elements: HTMLElement | HTMLElement[]): void {
    const elemArray = Array.isArray(elements) ? elements : [elements]

    // Initialize elements with opacity: 0 before registering with observer
    elemArray.forEach((element) => {
      this.initElement(element)
    })

    // Register with base class
    super.register(elements)
  }

  /**
   * Animate element with fade in effect
   */
  protected override animate(
    element: HTMLElement,
    entry: IntersectionObserverEntry,
    options: FadeInOptions,
  ): void {
    // Progress is already set in the base class handleIntersection method

    // Only apply fade-in animation once
    if (
      !element.classList.contains(this.activeClass) &&
      !this.pendingAnimations.has(element)
    ) {
      // Parse animation parameters
      const duration = this.parseTimeValue(options.duration || '0.5s')
      const delay = this.parseTimeValue(options.delay || '0s')
      const easing = options.easing || 'ease'
      const toOpacity = options.to !== undefined ? options.to : 1

      // Ensure initial opacity is set
      this.initElement(element)

      // Use requestAnimationFrame to ensure opacity:0 is applied before transitioning
      const rafId = requestAnimationFrame(() => {
        // Set transition after initial state is guaranteed to be applied
        element.style.transition = `opacity ${duration / 1000}s ${easing} ${delay / 1000}s`

        // Use a second frame to apply the final state
        requestAnimationFrame(() => {
          // Apply animation
          element.style.opacity = toOpacity.toString()

          // Add custom class if specified
          if (options.class) {
            element.classList.add(options.class)
          }

          element.classList.add(this.activeClass)

          // Clean up from pending animations
          this.pendingAnimations.delete(element)
        })
      })

      // Store the animation frame ID
      this.pendingAnimations.set(element, rafId)
    }
  }

  /**
   * Reset animation if needed
   */
  protected override reset(element: HTMLElement, options: FadeInOptions): void {
    // Cancel any pending animation
    if (this.pendingAnimations.has(element)) {
      cancelAnimationFrame(this.pendingAnimations.get(element)!)
      this.pendingAnimations.delete(element)
    }

    // If animation should repeat when out of view
    if (this.shouldRepeatAnimation(element)) {
      const fromOpacity = options.from !== undefined ? options.from : 0
      const duration = this.parseTimeValue(options.duration || '0.5s')
      const easing = options.easing || 'ease'

      // Keep the transition for a smooth fade out
      element.style.transition = `opacity ${duration / 1000}s ${easing}`

      // Fade out
      element.style.opacity = fromOpacity.toString()

      // Remove classes after the transition completes
      const onTransitionEnd = () => {
        element.classList.remove(this.activeClass)
        if (options.class) {
          element.classList.remove(options.class)
        }
        element.removeEventListener('transitionend', onTransitionEnd)
      }
      element.addEventListener('transitionend', onTransitionEnd)
    }
  }

  /**
   * Clean up resources
   */
  public override destroy(): void {
    // Cancel any pending animations
    this.pendingAnimations.forEach((rafId, _) => {
      cancelAnimationFrame(rafId)
    })
    this.pendingAnimations.clear()

    // Clean up base class resources
    super.destroy()
  }
}
