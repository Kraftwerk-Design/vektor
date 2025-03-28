import { DEFAULT_CONFIG } from './types'
import type { AnimationConfig, ParsedElementOptions } from './types'

// Common animation attributes that can be applied to any module
interface CommonAttributeMapping {
  attributeSuffix: string // The suffix after the attributeName (e.g., 'duration' in 'kw-duration')
  optionName: string // The property name in the options object (e.g., 'duration')
}

/**
 * Utility class for parsing animation attributes from elements
 */
export class AttributeParser {
  private config: AnimationConfig
  // Define common attributes that apply to all animation modules
  private commonAttributes: CommonAttributeMapping[] = [
    { attributeSuffix: 'duration', optionName: 'duration' },
    { attributeSuffix: 'delay', optionName: 'delay' },
    { attributeSuffix: 'repeat', optionName: 'repeat' },
    { attributeSuffix: 'speed', optionName: 'speed' },
    { attributeSuffix: 'direction', optionName: 'direction' },
    { attributeSuffix: 'easing', optionName: 'easing' },
    { attributeSuffix: 'class', optionName: 'class' },
    { attributeSuffix: 'from', optionName: 'from' },
    { attributeSuffix: 'to', optionName: 'to' },
    { attributeSuffix: 'start', optionName: 'start' },
    { attributeSuffix: 'end', optionName: 'end' },
    { attributeSuffix: 'inview', optionName: 'inview' },
  ]

  // Module-specific value mappings
  private moduleValueMappings: Record<string, string> = {
    parallax: 'speed', // For kw-parallax="0.3", map value to speed property
    // Add more module-specific value mappings as needed
  }

  constructor(config: Partial<AnimationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  /**
   * Update configuration
   */
  public setConfig(config: Partial<AnimationConfig>): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * Add common attribute mappings
   */
  public addCommonAttribute(mapping: CommonAttributeMapping): void {
    this.commonAttributes.push(mapping)
  }

  /**
   * Add a module-specific value mapping
   */
  public addModuleValueMapping(moduleName: string, optionName: string): void {
    this.moduleValueMappings[moduleName] = optionName
  }

  /**
   * Check if an element has animation attributes
   */
  public hasAnimationAttributes(element: HTMLElement): boolean {
    // Check for primary attribute
    return element.hasAttribute(this.config.attributeName)
  }

  /**
   * Parse all animation options from an element
   */
  public parseElementOptions(
    element: HTMLElement,
  ): ParsedElementOptions | null {
    // Get animation module name
    const moduleName = this.parseModuleName(element)
    if (!moduleName) {
      return null
    }

    // Parse module-specific options
    const options = this.parseModuleOptions(element, moduleName)

    return {
      module: moduleName,
      options,
    }
  }

  /**
   * Parse the animation module name from an element
   */
  private parseModuleName(element: HTMLElement): string | null {
    // Get from primary attribute
    let moduleName = element.getAttribute(this.config.attributeName)

    // Use default if no module specified but attribute exists
    if (moduleName === '' && this.config.defaultAnimation) {
      return this.config.defaultAnimation
    }

    return moduleName
  }

  /**
   * Parse module-specific options from element attributes
   */
  private parseModuleOptions(
    element: HTMLElement,
    moduleName: string,
  ): Record<string, any> {
    const options: Record<string, any> = {}
    const prefix = `${this.config.attributeName}-${moduleName}`

    // Process all element attributes
    const attributes = Array.from(element.attributes)

    for (const attr of attributes) {
      if (!attr) continue

      // Check for module-specific options with module prefix
      if (attr.name.startsWith(prefix)) {
        const optionName = this.camelCase(
          attr.name.substring(prefix.length + 1),
        ) // +1 for the hyphen
        options[optionName] = this.parseAttributeValue(attr.value)
      }
      // Check for offset attributes (kw-offset-top, kw-offset-right, etc.)
      else if (attr.name.startsWith(`${this.config.attributeName}-offset-`)) {
        const offsetName = this.camelCase(
          attr.name.substring(this.config.attributeName.length + 1),
        ) // Remove 'kw-' prefix
        options[offsetName] = this.parseAttributeValue(attr.value)
      }
      // Check for the inview attribute (kw-inview)
      else if (attr.name === `${this.config.attributeName}-inview`) {
        options.inview = this.parseAttributeValue(attr.value)
      }
    }

    // Parse common attributes (kw-duration, kw-delay, etc.)
    this.parseCommonAttributes(element, options)

    // Handle module-specific value mapping
    this.handleModuleValueMapping(moduleName, options)

    return options
  }

  /**
   * Parse common attributes that apply to all animation modules
   */
  private parseCommonAttributes(
    element: HTMLElement,
    options: Record<string, any>,
  ): void {
    for (const mapping of this.commonAttributes) {
      const attrName = `${this.config.attributeName}-${mapping.attributeSuffix}`
      const attrValue = element.getAttribute(attrName)

      if (attrValue !== null && options[mapping.optionName] === undefined) {
        options[mapping.optionName] = this.parseAttributeValue(attrValue)
      }
    }
  }

  /**
   * Handle module-specific value mappings
   */
  private handleModuleValueMapping(
    moduleName: string,
    options: Record<string, any>,
  ): void {
    const targetProperty = this.moduleValueMappings[moduleName]

    // If this module has a value mapping and a value is present
    if (
      targetProperty &&
      options.value !== undefined &&
      options[targetProperty] === undefined
    ) {
      options[targetProperty] = options.value
      delete options.value
    }
  }

  /**
   * Parse attribute value to appropriate type (boolean, number, or string)
   */
  private parseAttributeValue(value: string): any {
    // Boolean values
    if (value === '' || value === 'true') {
      return true
    }
    if (value === 'false') {
      return false
    }

    // Numeric values
    if (/^-?\d+(\.\d+)?$/.test(value)) {
      return parseFloat(value)
    }

    // JSON values
    if (
      (value.startsWith('{') && value.endsWith('}')) ||
      (value.startsWith('[') && value.endsWith(']'))
    ) {
      try {
        return JSON.parse(value)
      } catch (e) {
        // If parsing fails, return as string
        return value
      }
    }

    // Default to string
    return value
  }

  /**
   * Convert kebab-case to camelCase
   */
  private camelCase(str: string): string {
    return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
  }
}
