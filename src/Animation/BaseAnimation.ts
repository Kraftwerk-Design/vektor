import { AttributeParser } from './AttributeParser'
import type {
  AnimationConfig,
  BaseAnimationOptions,
  IntersectionObserverInit,
} from './types'

/**
 * BaseAnimation
 * Base class for all animation modules
 */
export class BaseAnimation {
  protected elements: HTMLElement[] = []
  protected observer: IntersectionObserver | null = null
  protected rootMargin: string = '0px'
  protected threshold: number[] = [0, 0.25, 0.5, 0.75, 1]
  protected attributeParser: AttributeParser
  protected activeClass: string = 'is-animated'
  protected observerOptions: IntersectionObserverInit = {
    rootMargin: this.rootMargin,
    threshold: this.threshold,
  }

  // Centralized window dimensions
  protected static windowWidth: number = window.innerWidth
  protected static windowHeight: number = window.innerHeight
  protected static resizeListenerAttached: boolean = false

  protected parsedOptions: Map<HTMLElement, Record<string, any>> = new Map()

  constructor(config?: Partial<AnimationConfig>) {
    this.attributeParser = new AttributeParser(config)
    this.ensureResizeListener()
  }

  /**
   * Get the default name for this animation module
   * Should be overridden by subclasses
   */
  public getDefaultName(): string {
    return 'animation'
  }

  /**
   * Check if an element has already been initialized with this animation
   * This can be overridden by subclasses if they need more specific checks
   */
  public isInitialized(element: HTMLElement): boolean {
    // By default, check if the element has the active class for this animation
    return element.classList.contains(this.activeClass)
  }

  /**
   * Update the animation configuration
   */
  public updateConfig(config: Partial<AnimationConfig>): void {
    this.attributeParser.setConfig(config)
  }

  /**
   * Ensure the resize listener is attached to track window dimensions
   */
  private ensureResizeListener(): void {
    if (!BaseAnimation.resizeListenerAttached) {
      // Initialize dimensions
      BaseAnimation.updateWindowDimensions()

      // Add resize listener
      window.addEventListener('resize', BaseAnimation.handleResize, {
        passive: true,
      })
      BaseAnimation.resizeListenerAttached = true
    }
  }

  /**
   * Handle window resize events
   */
  private static handleResize(): void {
    BaseAnimation.updateWindowDimensions()
  }

  /**
   * Update window dimensions
   */
  private static updateWindowDimensions(): void {
    BaseAnimation.windowWidth = window.innerWidth
    BaseAnimation.windowHeight = window.innerHeight
  }

  /**
   * Get current window width
   */
  protected getWindowWidth(): number {
    return BaseAnimation.windowWidth
  }

  /**
   * Get current window height
   */
  protected getWindowHeight(): number {
    return BaseAnimation.windowHeight
  }

  /**
   * Initialize the intersection observer
   */
  protected initObserver(): void {
    if (this.elements.length === 0 || !this.elements[0]) {
      console.warn('No elements registered for the observer.')
      return // Exit if there are no elements
    }

    const options = this.getElementOptions(this.elements[0])

    // Process offset values for more intuitive behavior
    const offsetTop = String(options.offsetTop || '0px')
    const offsetRight = String(options.offsetRight || '0px')
    const offsetBottom = String(options.offsetBottom || '0px')
    const offsetLeft = String(options.offsetLeft || '0px')

    // Set rootMargin with processed values
    this.observerOptions.rootMargin = `${offsetTop} ${offsetRight} ${offsetBottom} ${offsetLeft}`

    // Set threshold from inview percentage if specified
    if (options.inview) {
      const inviewPercentage = this.parseInviewPercentage(
        String(options.inview),
      )
      if (inviewPercentage !== null) {
        this.observerOptions.threshold = inviewPercentage
      }
    }

    this.observer = new IntersectionObserver(
      this.handleIntersection.bind(this),
      this.observerOptions,
    )
  }

  /**
   * Parse inview percentage to a threshold value
   * Converts percentage strings like "50%" to 0.5 or array of thresholds
   */
  protected parseInviewPercentage(
    value: string | undefined,
  ): number | number[] | null {
    if (!value) return null

    // Remove '%' character if present
    const cleanValue = value.replace('%', '').trim()

    // Parse to number
    const percentage = parseFloat(cleanValue)

    // Check if valid number
    if (isNaN(percentage)) {
      console.warn(`Invalid inview value: ${value}`)
      return null
    }

    // Convert percentage to decimal (0-1)
    const threshold = percentage / 100

    // Ensure threshold is between 0 and 1
    if (threshold < 0 || threshold > 1) {
      console.warn(`Inview value must be between 0% and 100%: ${value}`)
      return null
    }

    return threshold
  }

  /**
   * Handle intersection events
   */
  protected handleIntersection(entries: IntersectionObserverEntry[]): void {
    entries.forEach((entry) => {
      const element = entry.target as HTMLElement
      const options = this.parsedOptions.get(element) || {} // Provide default empty object if undefined

      if (entry.isIntersecting) {
        this.setProgress(element, entry.intersectionRatio)
        this.animate(element, entry, options) // Use stored options
      } else {
        this.setProgress(element, 0)
        this.reset(element, options) // Use stored options
      }
    })
  }

  /**
   * Set the progress CSS variable on an element
   */
  protected setProgress(element: HTMLElement, value: number): void {
    element.style.setProperty('--progress', value.toString())
  }

  /**
   * Parse animation options from element
   */
  protected getElementOptions(element: HTMLElement): BaseAnimationOptions {
    const parsedOptions = this.attributeParser.parseElementOptions(element)

    // Return empty options if parsing failed
    if (!parsedOptions) {
      return {}
    }

    // Cast to BaseAnimationOptions to avoid TypeScript complaints
    return parsedOptions.options as BaseAnimationOptions
  }

  /**
   * Register elements to be animated
   */
  public register(elements: HTMLElement | HTMLElement[]): void {
    if (!Array.isArray(elements)) {
      elements = [elements]
    }

    this.initObserver()

    elements.forEach((element) => {
      // Only register if the element has valid animation attributes
      if (this.attributeParser.hasAnimationAttributes(element)) {
        this.elements.push(element)
        const options = this.getElementOptions(element) // Parse options once
        this.parsedOptions.set(element, options) // Store options for this element
        this.observer?.observe(element)
      }
    })
  }

  /**
   * Get stored options for an element or parse them if not found
   * Generic method that can be used by all animation subclasses
   */
  protected getOptions<T extends Record<string, any> = Record<string, any>>(
    element: HTMLElement,
  ): T {
    // First try to get options from the parsedOptions Map
    let options = this.parsedOptions.get(element)

    // If not found, fall back to parsing
    if (!options) {
      options = this.getElementOptions(element)
      // Store for future use
      this.parsedOptions.set(element, options)
    }

    return options as T
  }

  /**
   * Check if an element should repeat its animation
   */
  protected shouldRepeatAnimation(element: HTMLElement): boolean {
    // Use the getOptions method rather than direct access
    const options = this.getOptions(element)
    return !!options.repeat
  }

  /**
   * Animate an element
   */
  protected animate(
    element: HTMLElement,
    entry: IntersectionObserverEntry,
    options: Record<string, any> = {},
  ): void {
    // Implemented by subclasses
  }

  /**
   * Reset an element's animation
   */
  protected reset(
    element: HTMLElement,
    options: Record<string, any> = {},
  ): void {
    // Implemented by subclasses
  }

  /**
   * Clean up resources
   */
  public destroy(): void {
    if (this.observer) {
      this.elements.forEach((element) => {
        this.observer?.unobserve(element)
      })
      this.observer.disconnect()
      this.observer = null
    }

    // Clear the element references and parsed options
    this.elements = []
    this.parsedOptions.clear()
  }

  /**
   * Clean up global resources - static method to be called when the application shuts down
   */
  public static cleanup(): void {
    if (BaseAnimation.resizeListenerAttached) {
      window.removeEventListener('resize', BaseAnimation.handleResize)
      BaseAnimation.resizeListenerAttached = false
    }
  }
}
