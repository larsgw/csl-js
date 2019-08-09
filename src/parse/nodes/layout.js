import { attributes, ATTR } from '../attributes'

// SPECIFIC ATTRIBUTES
// ===================
//
// NOTICE const?

const labelFormValues = ['long', 'short', 'symbol']
const labelPluralValues = ['contextual', 'always', 'never']

const textContentAttributes = ['variable', 'macro', 'term', 'value']
const textVariableFormValues = ['long', 'short']
const textTermFormValues = ['long', 'short', 'verb', 'verb-short', 'symbol']

const numberFormValues = ['numeric', 'ordinal', 'long-ordinal', 'roman']

// ELEMENTS
// ========

export const renderingElements = {
  __context: 'renderingElements',

  // GROUP
  // =====

  /**
   * group
   * content: children
   * options: affix, formatting, display, delimiter
   * NOTE: omit if all cs:text s that call variables are empty
   */
  // TODO display
  @attributes(ATTR.affix, ATTR.delimiter, ATTR.formatting)
  group (group) {
    return {content: group.children.map(compileRenderingElements)}
  },

  // TEXT
  // ====

  /**
   * text
   * content: variable (+ form) | macro | term (+ form, plural) | value
   * options: affix, formatting, display, quotes, strip-periods, text-case
   */
  // TODO display
  @attributes(ATTR.affix, ATTR.formatting, ATTR.stripPeriods, ATTR.quotes, ATTR.textCase)
  text ({attributes}) {
    const output = {}

    // select first content attribute
    const contentType = Object.keys(attributes).find(attribute => textContentAttributes.includes(attribute))
    output.contentType = contentType
    output.content = attributes[contentType]

    if (contentType === 'variable' && textVariableFormValues.includes(attributes.form)) {
      output.form = attributes.form
    }
    if (contentType === 'term' && textTermFormValues.includes(attributes.form)) {
      output.form = attributes.form
    }
    if (contentType === 'term' && attributes.plural !== undefined && attributes.plural !== 'false') {
      output.plural = attributes.plural
    }

    return output
  },

  // LABEL
  // =====

  /**
   * label
   * content: variable
   * special: form, plural
   * options: affix, formatting, text-case, strip-periods
   * NOTE: empty if variable is
   */
  @attributes(ATTR.affix, ATTR.formatting, ATTR.stripPeriods, ATTR.textCase)
  label ({attributes}) {
    const output = {content: attributes.variable}
    if (labelFormValues.includes(attributes.form)) {
      output.form = attributes.form
    }
    if (labelPluralValues.includes(attributes.plural)) {
      output.plural = attributes.plural
    }
    return output
  },

  // NUMBER
  // ======

  /**
   * number
   * content: variable
   * special: form
   * options: affix, display, formatting, text-case
   * NOTE: if non-numeric, display as is, else formatted
   * NOTE: if affixes, don't use 'form'
   */
  // TODO display
  @attributes(ATTR.affix, ATTR.formatting, ATTR.textCase)
  number ({attributes}) {
    const output = {content: attributes.variable}
    if (numberFormValues.includes(attributes.form)) {
      output.form = attributes.form
    }
    return output
  }
}

export const compileRenderingElements = compileElement(renderingElements)

const layoutElements = {
  __context: 'layoutElements',

  // LAYOUT
  // ======

  /**
   * layout
   * content: children
   * options: affix, delimiter, formatting
   */
  @attributes(ATTR.affix, ATTR.delimiter, ATTR.formatting)
  layout ({ children }) {
    return { content: children.map(compileRenderingElements) }
  },

  // MACRO
  // =====
  macro (macro) {
    return layoutElements.layout(macro)
  }
}

export default compileElement(layoutElements)

export function compileElement (elements) {
  return function (element) {
    if (elements[element.name]) {
      return Object.assign(elements[element.name](element), {type: element.name})
    } else {
      throw new Error(`Element <${element.name}> unkown in this context: ${elements.__context} (${Object.keys(elements)})`)
    }
  }
}
