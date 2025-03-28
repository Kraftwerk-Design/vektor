import {
  AnimationManager,
  BaseAnimation,
  FadeInAnimation,
  ParallaxAnimation,
  Debug,
} from '@animations/index.js'

import { AttributeParser } from '@animations/AttributeParser.js'

import type {
  AnimationConfig,
  BaseAnimationOptions,
  FadeInOptions,
  ParallaxOptions,
} from '@animations/types.js'

/**
 * Vektor - A lightweight, flexible animation framework for creating scroll-based animations and effects.
 */
export const Vektor = {
  /** Core animation components */
  Animation: {
    /** Animation manager for registering and controlling animation modules */
    Manager: AnimationManager,
    /** Base animation class for extending custom animations */
    Base: BaseAnimation,
    /** Built-in fade-in animation */
    FadeIn: FadeInAnimation,
    /** Built-in parallax animation */
    Parallax: ParallaxAnimation,
    /** Attribute parser for handling HTML attributes */
    AttributeParser,
    /** Debug utilities */
    Debug,
  },

  /**
   * Create and initialize a new animation manager with optional configuration
   * @param config Optional animation configuration
   * @returns Configured animation manager instance
   */
  createAnimationManager(config?: Partial<AnimationConfig>): AnimationManager {
    const manager = new AnimationManager(config)
    return manager
  },
}

// Export types
export type {
  AnimationConfig,
  BaseAnimationOptions,
  FadeInOptions,
  ParallaxOptions,
}
