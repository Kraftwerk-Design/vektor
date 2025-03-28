/**
 * Animation framework configuration interfaces
 */

/**
 * Global framework configuration
 */
export interface AnimationConfig {
  /** Base attribute name (default: "kw") */
  attributeName: string
  /** Default animation type if none specified */
  defaultAnimation?: string
  /** Whether to use data attributes as fallbacks - DEPRECATED */
  useDataAttributeFallback: boolean
}

/**
 * Default configuration
 */
export const DEFAULT_CONFIG: AnimationConfig = {
  attributeName: 'kw',
  defaultAnimation: 'fade-in',
  useDataAttributeFallback: false,
}

/**
 * Custom IntersectionObserver initialization options
 */
export interface IntersectionObserverInit {
  root?: Element | Document | null
  rootMargin?: string
  threshold?: number | number[]
}

/**
 * Base animation module options
 */
export interface BaseAnimationOptions {
  /** Whether to repeat the animation when element leaves viewport */
  repeat?: boolean
  /** Custom CSS classes to add */
  class?: string
  /** Offset from top margin for intersection observer */
  offsetTop?: string
  /** Offset from right margin for intersection observer */
  offsetRight?: string
  /** Offset from bottom margin for intersection observer */
  offsetBottom?: string
  /** Offset from left margin for intersection observer */
  offsetLeft?: string
  /** Percentage of element that needs to be in view to trigger animation */
  inview?: string
}

/**
 * Fade-in animation options
 */
export interface FadeInOptions extends BaseAnimationOptions {
  /** Animation duration in ms */
  duration?: number | string
  /** Animation delay in ms */
  delay?: number | string
  /** Animation easing function */
  easing?: string
  /** Starting opacity */
  from?: number
  /** Ending opacity */
  to?: number
}

/**
 * Parallax animation options
 */
export interface ParallaxOptions extends BaseAnimationOptions {
  /** Parallax speed factor */
  speed?: number
  /** Parallax movement direction */
  direction?: 'up' | 'down' | 'left' | 'right'
  /** Position start factor */
  start?: number
  /** Position end factor */
  end?: number
}

/**
 * Parsed element options
 */
export interface ParsedElementOptions {
  /** Animation module name */
  module: string
  /** Module-specific options */
  options: Record<string, any>
}
