import { BaseAnimation } from './BaseAnimation.js'
import { AttributeParser } from './AttributeParser.js'
import type { AnimationConfig } from './types.js'

/**
 * Animation module constructor type
 */
export type AnimationModuleConstructor = new () => BaseAnimation

/**
 * AnimationManager
 * Manages all animation modules and initializes them based on data attributes
 */
export class AnimationManager {
  private modules: Map<string, BaseAnimation> = new Map()
  private initialized: boolean = false
  private loadTimeout: number | null = null
  private mutationObserver: MutationObserver | null = null
  private attributeParser: AttributeParser
  private config: AnimationConfig

  constructor(config?: Partial<AnimationConfig>) {
    // Initialize attribute parser
    this.attributeParser = new AttributeParser(config)
    this.config = { ...this.attributeParser['config'] } // Access through property, not ideal but works
  }

  /**
   * Register a new animation module by class
   * @param ModuleClass The animation module class to instantiate
   * @param moduleConfig Optional module-specific configuration
   * @returns this instance for chaining
   *
   * Note: If you need to register a module with a custom name, use registerModule() directly
   * after creating an instance of the module.
   */
  public use<T extends BaseAnimation>(
    ModuleClass: new () => T,
    moduleConfig?: Record<string, any>,
  ): this {
    // Create new instance of the module
    const module = new ModuleClass()

    // Apply module-specific configuration if provided and the module supports it
    if (moduleConfig && typeof (module as any).configure === 'function') {
      ;(module as any).configure(moduleConfig)
    }

    // Get the default name from the module
    const moduleName = module.getDefaultName()

    // Register the module
    this.registerModule(moduleName, module)

    return this
  }

  /**
   * Update configuration
   */
  public updateConfig(config: Partial<AnimationConfig>): void {
    this.attributeParser.setConfig(config)
    this.config = { ...this.attributeParser['config'] }

    // Update configuration for all modules
    this.modules.forEach((module) => {
      module.updateConfig(config)
    })
  }

  /**
   * Register a new animation module
   * Use this method directly if you need to register a module with a custom name
   * or want to customize the module instance before registration.
   *
   * @example
   * //Register with a custom name
   * const fadeModule = new FadeInAnimation();
   * animationManager.registerModule('fade-fast', fadeModule);
   */
  public registerModule(name: string, module: BaseAnimation): void {
    this.modules.set(name, module)
  }

  /**
   * Get a registered module by name
   */
  public getModule<T extends BaseAnimation = BaseAnimation>(
    name: string,
  ): T | undefined {
    return this.modules.get(name) as T | undefined
  }

  /**
   * Initialize animations for newly added elements
   */
  private initDynamicElements(): void {
    if (!this.initialized) return

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    if (prefersReducedMotion) return

    // Get all elements with animation attributes
    const elements = this.findAllAnimationElements()

    // Process each element based on its animation type
    elements.forEach((element) => {
      const parsedOptions = this.attributeParser.parseElementOptions(element)

      if (!parsedOptions) return

      const moduleName = parsedOptions.module
      const module = this.modules.get(moduleName)

      if (module) {
        // Check if the element is already initialized to avoid duplicates
        const isElementInitialized = this.isElementInitialized(
          element,
          moduleName,
        )

        if (!isElementInitialized) {
          module.register(element)
        }
      }
    })
  }

  /**
   * Find all elements with animation attributes in the document
   */
  private findAllAnimationElements(): HTMLElement[] {
    const elements: HTMLElement[] = []
    const attributeName = this.config.attributeName

    // Query for elements with the main attribute
    const primarySelector = `[${attributeName}]`
    document.querySelectorAll<HTMLElement>(primarySelector).forEach((el) => {
      elements.push(el)
    })

    return elements
  }

  /**
   * Check if an element is already initialized with an animation
   */
  private isElementInitialized(
    element: HTMLElement,
    moduleName: string,
  ): boolean {
    // Get the module
    const module = this.modules.get(moduleName)

    // If we have the module, let it determine if the element is initialized
    if (module) {
      return module.isInitialized(element)
    }

    // If module isn't found, element can't be initialized
    return false
  }

  /**
   * Set up the mutation observer to watch for dynamically added elements
   */
  private setupMutationObserver(): void {
    if (this.mutationObserver) return

    this.mutationObserver = new MutationObserver((mutations) => {
      let needsUpdate = false

      // Check if any mutations added elements with animation attributes
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          for (const node of mutation.addedNodes) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as HTMLElement

              // Check if the element has animation attributes
              if (this.attributeParser.hasAnimationAttributes(element)) {
                needsUpdate = true
                break
              }

              // Check if any child elements have animation attributes
              if (this.config.attributeName) {
                const primarySelector = `[${this.config.attributeName}]`
                if (element.querySelector(primarySelector)) {
                  needsUpdate = true
                  break
                }
              }
            }
          }

          if (needsUpdate) break
        }
      }

      if (needsUpdate) {
        // Debounce the update to avoid excessive processing
        if (this.loadTimeout !== null) {
          window.clearTimeout(this.loadTimeout)
        }

        this.loadTimeout = window.setTimeout(() => {
          this.initDynamicElements()
          this.loadTimeout = null
        }, 100)
      }
    })

    // Observe the entire document body for changes
    this.mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    })
  }

  /**
   * Initialize all animations based on data attributes
   */
  public init(): void {
    if (this.initialized) {
      return
    }

    // Check if reduced motion is preferred
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    if (prefersReducedMotion) {
      // If reduced motion is preferred, we'll still initialize but with no animations
      console.log('User prefers reduced motion, animations disabled')
    }

    if (!prefersReducedMotion) {
      // Get all elements with animation attributes
      const elements = this.findAllAnimationElements()

      // Process each element based on its animation type
      elements.forEach((element) => {
        const parsedOptions = this.attributeParser.parseElementOptions(element)

        if (!parsedOptions) return

        const moduleName = parsedOptions.module
        const module = this.modules.get(moduleName)

        if (module) {
          module.register(element)
        }
      })
    }

    // Setup observer for dynamic elements
    this.setupMutationObserver()

    this.initialized = true

    // Check for elements that might have been added after initial load
    window.setTimeout(() => this.initDynamicElements(), 1000)
  }

  /**
   * Clean up all animation modules
   */
  public destroy(): void {
    // Clean up timeout
    if (this.loadTimeout !== null) {
      window.clearTimeout(this.loadTimeout)
      this.loadTimeout = null
    }

    // Clean up mutation observer
    if (this.mutationObserver) {
      this.mutationObserver.disconnect()
      this.mutationObserver = null
    }

    // Clean up animation modules
    this.modules.forEach((module) => {
      module.destroy()
    })
    this.modules.clear()
    this.initialized = false

    // Clean up static resources
    BaseAnimation.cleanup()
  }
}
