// Export all the Animation components
export * from './Animation/index.js'

// Export the Vektor namespace as default
export { Vektor as default } from './Vektor.js'

// Re-export types for better developer experience
export type {
  AnimationConfig,
  BaseAnimationOptions,
  FadeInOptions,
  ParallaxOptions,
} from '@animations/types.js'
