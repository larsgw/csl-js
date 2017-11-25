const applyAttributes = (...sets) => {
  const set = Object.assign({}, ...sets)
  return (target, key, descriptor) => {
    const parser = descriptor.value
    descriptor.value = element => {
      const output = {}
      for (const prop in set) {
        if (element.attributes.hasOwnProperty(prop)) {
          // TODO check values
          // TODO default values
          output[prop] = element.attributes[prop]
        }
      }
      return Object.assign(output, parser(element))
    }

    return descriptor
  }
}

// GENERAL ATTRIBUTES
// ==================
//
// NOTE: watch out for attributes 'content', 'contentType',
// 'form', 'plural', 'match' & 'conditionals' as they are
// already in use by the element parsers.
//
// NOTICE const?

const affix = {prefix: true, suffix: true}
const delimiter = {delimiter: true}

const formatting = {
  'font-style': ['normal', 'italic', 'oblique'],
  'font-variant': ['normal', 'small-caps'],
  'font-weight': ['normal', 'bold', 'light'],
  'text-decoration': ['none', 'underline'],
  'vertical-align': ['baseline', 'sup', 'sub']
}

const stripPeriods = {'strip-periods': ['true', 'false']}
const quotes = {quotes: ['true', 'false']}

const textCase = {
  'text-case': ['lowercase', 'uppercase', 'capitalize-first', 'capitalize-all', 'sentence', 'title']
}

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

const dateFormValues = ['numeric', 'text']
const datePartsValues = ['year-month-day', 'year-month', 'year']
const datePartFormValues = {
  day: ['numeric', 'numeric-leading-zeros', 'ordinal'],
  month: ['long', 'short', 'numeric', 'numeric-leading-zeros'],
  year: ['long', 'short']
}

// ELEMENTS
// ========

const elements = {
  // LAYOUT
  // ======

  /**
   * layout
   * content: children
   * options: affix, delimiter, formatting
   */
  @applyAttributes(affix, delimiter, formatting)
  layout (layout) {
    return {content: layout.children.map(cElement)}
  },

  // GROUP
  // =====

  /**
   * group
   * content: children
   * options: affix, formatting, display, delimiter
   * NOTE: omit if all cs:text s that call variables are empty
   */
  // TODO display
  @applyAttributes(affix, delimiter, formatting)
  group (group) {
    return {content: group.children.map(cElement)}
  },

  // TEXT
  // ====

  /**
   * text
   * content: variable (+ form) | macro | term (+ form, plural) | value
   * options: affix, formatting, display, quotes, strip-periods, text-case
   */
  // TODO display
  @applyAttributes(affix, formatting, stripPeriods, quotes, textCase)
  text ({attributes}) {
    const output = {}

    // select first content attribute
    const contentType = Object.keys(attributes).filter(attribute => textContentAttributes.includes(attribute))[0]
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
  @applyAttributes(affix, formatting, stripPeriods, textCase)
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
  @applyAttributes(affix, formatting, textCase)
  number ({attributes}) {
    const output = {content: attributes.variable}
    if (numberFormValues.includes(attributes.form)) {
      output.form = attributes.form
    }
    return output
  },

  // DATE
  // ====

  /**
   * date
   * content: variable
   * special: form, children, date-parts
   * options: affix, display, formatting, text-case
   * NOTE: if no form, then non-localised
   * NOTE: if non-localised, use delimiter
   */
  // TODO display
  @applyAttributes(affix, delimiter, formatting, textCase)
  date ({attributes, children}) {
    const localised = attributes.form && dateFormValues.includes(attributes.form)
    const output = {localised, content: attributes.variable}

    if (localised) {
      output.form = attributes.form
      // If non-localised, don't use delimiter
      output.delimiter = ''

      if (datePartsValues.includes(attributes['date-parts'])) {
        output.dateParts = attributes['date-parts']
      } else {
        output.dateParts = datePartsValues[0]
      }
    }

    output.datePartConfig = children.map(cElement)
    return output
  },

  /**
   * date-part
   * content: name
   * special: form, range-delimiter
   * options: affix, formatting, text-case
   * NOTE: no affixes when localised
   * NOTE: strip-periods on month
   */
  @applyAttributes(affix, formatting, textCase, stripPeriods)
  'date-part' ({attributes}) {
    const content = attributes.name
    const output = {
      content,
      rangeDelimiter: attributes['range-delimiter'] || /* NOTICE const */ '–'
    }

    if (datePartFormValues[content].includes(attributes.form)) {
      output.form = attributes.form
    }

    if (content !== 'month') {
      output['strip-periods'] = 'false'
    }

    return output
  },

  /**
   * names
   * content: variable, children
   * options: delimiter
   * NOTE: render independently
   * NOTE: if editor & translator, and equal content, merge
   * NOTE: use 'editortranslator' term if editor & translator & cs:label
   *
   *   name
   *   TODO
   *
   *   name-part
   *   special: name (given | family)
   *   NOTE: 1 or 2
   *   NOTE: formatting, textcase: given = given, dropping-particle; family = family, non-dropping-particle
   *   NOTE: affixes: given = given (+ dropping-particle for inverted names); family = family, non-dropping-particle (+ suffix for non-inverted names)
   *
   *   et-al
   *   special: term
   *   options: formatting
   *
   *   label
   *   content: variable (inherit)
   *   special: form, plural
   *   options: affix, formatting, text-case, strip-periods
   *   NOTE: empty if variable is
   *   NOTE: between (name & et-al) and substitute
   *
   *   substitute
   *   content: children
   *   NOTE: shorthand cs:names would inherit from cs:name & cs:et-al
   *   NOTE: uses only or first non-empty rendering element
   *   NOTE: suppresses substituted variables
   */

  // CHOOSE
  // ======

  /**
   * choose
   * content: if | else-if | else
   * conditions: disambiguate, is-numeric, is-uncertain-date, locator, position, type, variable
   * match: all | any | none
   */
  choose ({children}) {
    return {content: children.map(cElement)}
  },

  if ({attributes: {match, ...conditions}, children}) {
    return {content: children.map(cElement), match, conditions}
  },

  // parse as 'if' node
  'else-if' (element) {
    return elements.if(element)
  },

  else ({children}) {
    return {content: children.map(cElement)}
  },

  // MACRO
  // =====
  macro (macro) {
    return elements.layout(macro)
  }
}

export default function cElement (element) {
  // TODO catch invalid node names
  // BEGIN TEST //
  if (elements[element.name]) {
  // END TEST //
    return Object.assign(elements[element.name](element), {type: element.name})
  // BEGIN TEST //
  }
  // END TEST //
}
