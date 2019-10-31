import { attributes, ATTR } from '../attributes'
import { renderingElements, compileRenderingElements, compileElement } from './layout'
import { xmlToObject, arrayToObject } from '../toObject'

const nameLabelFormValues = ['long', 'short', 'symbol', 'verb', 'verb-short']
const labelPluralValues = ['contextual', 'always', 'never']

const nameAttributes = {
  and: ['text', 'symbol'],
  delimiter: true,
  'delimiter-precedes-et-al': ['contextual', 'after-inverted-name', 'always', 'never'],
  'delimiter-precedes-last': ['contextual', 'after-inverted-name', 'always', 'never'],
  'et-al-min': true,
  'et-al-use-first': true,
  'et-al-subsequent-min': true,
  'et-al-subsequent-use-first': true,
  'et-al-use-last': ['false', 'true'],

  // Only for personal names (not 'literal')
  form: ['long', 'short'],
  initialize: ['true', 'false'],
  'initialize-with': true,
  'name-as-sort-order': ['all', 'first'],
  'sort-separator': true
}

// NAMES
// =====

const nameElements = {
  __context: 'nameElements',

  /**
   * name
   * special: see nameAttributes
   */
  @attributes(ATTR.delimiter, ATTR.affix, ATTR.formatting, nameAttributes)
  name ({children}) {
    return {
      ...arrayToObject(children, child => {
        const value = compileNameElement(child)
        return { key: value.content, val: value }
      })
    }
  },

  /**
   * name-part
   * special: name (given | family)
   * NOTE: 1 or 2
   * NOTE: formatting, textcase: given = given, dropping-particle; family = family, non-dropping-particle
   * NOTE: affixes: given = given (+ dropping-particle for inverted names); family = family, non-dropping-particle (+ suffix for non-inverted names)
   */
  @attributes(ATTR.formatting, ATTR.textCase, ATTR.affix)
  'name-part' ({attributes}) {
    return { content: attributes.name }
  },

  /**
   * et-al
   * special: term
   * options: formatting
   */
  @attributes(ATTR.formatting)
  'et-al' ({attributes}) {
    return { content: attributes.term ?? 'et-al' }
  },

  /**
   * label
   * content: variable (inherit)
   * special: form (+verb[-short]), plural
   * options: affix, formatting, text-case, strip-periods
   * NOTE: empty if variable is
   * NOTE: between (name & et-al) and substitute
   */
  @attributes(ATTR.affix, ATTR.formatting, ATTR.stripPeriods, ATTR.textCase)
  label ({attributes}) {
    const output = {}
    if (nameLabelFormValues.includes(attributes.form)) {
      output.form = attributes.form
    }
    if (labelPluralValues.includes(attributes.plural)) {
      output.plural = attributes.plural
    }
    return output
  },

  /**
   * substitute
   * content: children
   * NOTE: shorthand cs:names would inherit from cs:name & cs:et-al
   * NOTE: uses only or first non-empty rendering element
   * NOTE: suppresses substituted variables
   */
  substitute ({children}) {
    return { content: children.map(compileRenderingElements) }
  }
}

const compileNameElement = compileElement(nameElements)

Object.assign(renderingElements, {
  /**
   * names
   * content: variable, children
   * options: delimiter, affix, display, formatting
   * NOTE: render independently
   * NOTE: if editor & translator, and equal content, merge
   * NOTE: use 'editortranslator' term if editor & translator & cs:label
   */
  // TODO display
  @attributes(ATTR.delimiter, ATTR.affix, ATTR.formatting)
  names ({ attributes, children }) {
    let labelBeforeName
    const options = arrayToObject(children, child => {
      if (child.name === 'label' && labelBeforeName === undefined) { labelBeforeName = true }
      if (child.name === 'name' && labelBeforeName === undefined) { labelBeforeName = false }
      const value = compileNameElement(child)
      return { key: value.type, val: value }
    })
    options.labelBeforeName = labelBeforeName

    return {
      content: attributes.variable.split(' '),
      options
    }
  }
})
