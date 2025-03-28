/**
 * FPSCounter Module
 * Displays the current frames per second in a configurable box
 */

export interface FPSCounterOptions {
  /** Position on the screen (default: 'bottom-right') */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  /** Margin from the edge of the screen in pixels */
  margin?: number
  /** Background color of the box */
  backgroundColor?: string
  /** Text color */
  color?: string
  /** Z-index value */
  zIndex?: number
  /** Whether to include milliseconds per frame */
  showMS?: boolean
  /** Font size in pixels */
  fontSize?: number
  /** Number of decimal places to display */
  decimals?: number
}

export class FPSCounter {
  private element: HTMLElement | null = null
  private running: boolean = false
  private lastFrameTime: number = 0
  private frameCount: number = 0
  private fps: number = 0
  private animationFrameId: number | null = null
  private updateIntervalId: number | null = null

  private options: FPSCounterOptions = {
    position: 'bottom-right',
    margin: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    zIndex: 9999,
    showMS: true,
    fontSize: 14,
    decimals: 1,
  }

  constructor(options: Partial<FPSCounterOptions> = {}) {
    this.options = { ...this.options, ...options }
  }

  /**
   * Start measuring and displaying FPS
   */
  public start(): void {
    if (this.running) return

    this.running = true
    this.createDisplay()
    this.lastFrameTime = performance.now()
    this.frameCount = 0

    // Update counter every second
    this.updateIntervalId = window.setInterval(() => {
      this.updateDisplay()
    }, 500)

    // Start frame counting
    this.animationFrameId = requestAnimationFrame(this.countFrame.bind(this))
  }

  /**
   * Stop measuring and remove display
   */
  public stop(): void {
    if (!this.running) return

    this.running = false

    if (this.updateIntervalId !== null) {
      clearInterval(this.updateIntervalId)
      this.updateIntervalId = null
    }

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }

    this.removeDisplay()
  }

  /**
   * Update options for the counter
   */
  public configure(options: Partial<FPSCounterOptions>): void {
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
   * Count frames for FPS calculation
   */
  private countFrame(timestamp: number): void {
    if (!this.running) return

    // Calculate elapsed time
    const elapsed = timestamp - this.lastFrameTime

    // Count this frame
    this.frameCount++

    // Calculate FPS every second
    if (elapsed >= 1000) {
      this.fps = (this.frameCount * 1000) / elapsed
      this.frameCount = 0
      this.lastFrameTime = timestamp
    }

    // Continue counting
    this.animationFrameId = requestAnimationFrame(this.countFrame.bind(this))
  }

  /**
   * Create the FPS display element
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
        styles.bottom = `${this.options.margin}px`
        styles.left = `${this.options.margin}px`
        break
      case 'bottom-right':
      default:
        styles.bottom = `${this.options.margin}px`
        styles.right = `${this.options.margin}px`
        break
    }

    // Apply all styles
    Object.assign(this.element.style, styles)

    // Add to the DOM
    document.body.appendChild(this.element)

    // Initial display
    this.updateDisplay()
  }

  /**
   * Update the display with current FPS
   */
  private updateDisplay(): void {
    if (!this.element) return

    const roundedFPS = this.fps.toFixed(this.options.decimals)

    let displayText = `FPS: ${roundedFPS}`

    // Optionally show milliseconds per frame
    if (this.options.showMS && this.fps > 0) {
      const ms = (1000 / this.fps).toFixed(this.options.decimals)
      displayText += ` (${ms} ms)`
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
}
