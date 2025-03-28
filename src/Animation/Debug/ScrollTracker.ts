/**
 * ScrollTracker Module
 * Displays the current scroll position in pixels from the top of the page
 */

export interface ScrollTrackerOptions {
  /** Position on the screen (default: 'bottom-left') */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  /** Margin from the edge of the screen in pixels */
  margin?: number
  /** Background color of the box */
  backgroundColor?: string
  /** Text color */
  color?: string
  /** Z-index value */
  zIndex?: number
  /** Whether to also show scroll percentage */
  showPercentage?: boolean
  /** Font size in pixels */
  fontSize?: number
  /** Whether to include horizontal scroll position */
  showHorizontalScroll?: boolean
}

export class ScrollTracker {
  private element: HTMLElement | null = null
  private running: boolean = false
  private scrollEventListener: (() => void) | null = null
  private throttleTimeout: number | null = null
  private lastScrollTop: number = 0
  private lastScrollLeft: number = 0

  private options: ScrollTrackerOptions = {
    position: 'bottom-left',
    margin: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    zIndex: 9999,
    showPercentage: true,
    fontSize: 14,
    showHorizontalScroll: false,
  }

  constructor(options: Partial<ScrollTrackerOptions> = {}) {
    this.options = { ...this.options, ...options }
  }

  /**
   * Start tracking and displaying scroll position
   */
  public start(): void {
    if (this.running) return

    this.running = true
    this.createDisplay()

    // Create a throttled scroll handler
    this.scrollEventListener = this.throttle(() => {
      this.updateDisplay()
    }, 100)

    // Attach scroll event listener
    window.addEventListener('scroll', this.scrollEventListener, {
      passive: true,
    })

    // Initial update
    this.updateDisplay()
  }

  /**
   * Stop tracking and remove display
   */
  public stop(): void {
    if (!this.running) return

    this.running = false

    if (this.scrollEventListener) {
      window.removeEventListener('scroll', this.scrollEventListener)
      this.scrollEventListener = null
    }

    if (this.throttleTimeout !== null) {
      window.clearTimeout(this.throttleTimeout)
      this.throttleTimeout = null
    }

    this.removeDisplay()
  }

  /**
   * Update options for the tracker
   */
  public configure(options: Partial<ScrollTrackerOptions>): void {
    const wasRunning = this.running

    // Stop if running
    if (wasRunning) {
      this.stop()
    }

    // Update options
    this.options = { ...this.options, ...options }

    // Restart if was running
    if (wasRunning) {
      this.start()
    }
  }

  /**
   * Create the scroll position display element
   */
  private createDisplay(): void {
    if (this.element) return

    this.element = document.createElement('div')

    // Apply styles based on options
    const styles: Partial<CSSStyleDeclaration> = {
      position: 'fixed',
      padding: '8px 12px',
      fontFamily: 'monospace',
      fontSize: `${this.options.fontSize}px`,
      backgroundColor: this.options.backgroundColor || '',
      color: this.options.color || '',
      borderRadius: '4px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
      zIndex: this.options.zIndex?.toString() || '',
      pointerEvents: 'none', // Allow clicking through the element
    }

    // Set position based on option
    switch (this.options.position) {
      case 'top-left':
        styles.top = `${this.options.margin}px`
        styles.left = `${this.options.margin}px`
        break
      case 'top-right':
        styles.top = `${this.options.margin}px`
        styles.right = `${this.options.margin}px`
        break
      case 'bottom-left':
      default:
        styles.bottom = `${this.options.margin}px`
        styles.left = `${this.options.margin}px`
        break
      case 'bottom-right':
        styles.bottom = `${this.options.margin}px`
        styles.right = `${this.options.margin}px`
        break
    }

    // Apply all styles
    Object.assign(this.element.style, styles)

    // Add to the DOM
    document.body.appendChild(this.element)
  }

  /**
   * Update the display with current scroll position
   */
  private updateDisplay(): void {
    if (!this.element) return

    // Get current scroll position
    const scrollTop = Math.round(
      window.scrollY || document.documentElement.scrollTop,
    )
    const scrollLeft = Math.round(
      window.scrollX || document.documentElement.scrollLeft,
    )

    // Check if position changed
    if (
      scrollTop === this.lastScrollTop &&
      (!this.options.showHorizontalScroll || scrollLeft === this.lastScrollLeft)
    ) {
      return // No change, don't update
    }

    // Update saved positions
    this.lastScrollTop = scrollTop
    this.lastScrollLeft = scrollLeft

    let displayText = `Top: ${scrollTop}px`

    // Add horizontal scroll if enabled
    if (this.options.showHorizontalScroll) {
      displayText += ` | Left: ${scrollLeft}px`
    }

    // Add percentage if enabled
    if (this.options.showPercentage) {
      const docHeight = Math.max(
        document.body.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.clientHeight,
        document.documentElement.scrollHeight,
        document.documentElement.offsetHeight,
      )

      const viewportHeight = window.innerHeight
      const maxScroll = docHeight - viewportHeight
      const scrollPercentage = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0

      displayText += ` (${scrollPercentage.toFixed(1)}%)`
    }

    this.element.textContent = displayText
  }

  /**
   * Remove the display from the DOM
   */
  private removeDisplay(): void {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element)
      this.element = null
    }
  }

  /**
   * Throttle function to limit update frequency
   */
  private throttle(fn: () => void, limit: number): () => void {
    return () => {
      if (this.throttleTimeout === null) {
        this.throttleTimeout = window.setTimeout(() => {
          fn()
          this.throttleTimeout = null
        }, limit)
      }
    }
  }
}
