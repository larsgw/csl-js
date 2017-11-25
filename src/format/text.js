import Formatter from './formatter'
import conditionIsTrue from './condition'

const reduceStrings = list => {
  return list.reduce((array, element) => {
    const lastIndex = array.length - 1
    if (typeof element === 'string' && typeof array[lastIndex] === 'string') {
      array[lastIndex] += element
    } else {
      array.push(element)
    }
    return array
  }, [])
}

const add = function ({mods = [], alias = []} = {}) {
  return (target, key, descriptor) => {
    const formatter = descriptor.value

    descriptor.value = (context, data, element) => {
      let output = formatter(context, data, element)

      for (const mod of mods) {
        if (!output) { return '' }
        output = mod(context, data, element, output)
      }

      // TODO cue mods on elements that are evaluated later (better do all mods to be safe)

      // Cleaning stuff up
      if (Array.isArray(output)) {
        output = [].concat(...output).filter(Boolean)
        output = output.length ? reduceStrings(output) : ''
      }

      return output
    }

    for (const prop of alias) {
      Object.defineProperty(target, prop, descriptor)
    }
    return descriptor
  }
}

// GENERAL ATTRIBUTES
// ==================

const joinAsArray = function (array, delimiter) {
  if (array.length === 0 || array.length === 1) {
    return array
  }

  const length = 2 * array.length - 1
  for (let i = 0; i < length; i++) {
    if (i & 1) { array.splice(i, 0, delimiter) }
  }
  return array
}

const affix = (self, data, {prefix = '', suffix = ''}, input) => [].concat(prefix, input, suffix)
const delimiter = (self, data, {delimiter = ''}, input) => joinAsArray(input, delimiter)

// NOTICE const
const formattingAttributes = ['font-style', 'font-variant', 'font-weight', 'text-decoration', 'vertical-align']
const formatting = (self, data, element, input) => {
  for (const attribute of formattingAttributes) {
    if (!element.hasOwnProperty(attribute) || !self._formatData[attribute]) { continue }

    const value = element[attribute]
    const text = self._formatData[attribute][value]
    return text ? joinAsArray(text, input) : input
  }
  return input
}

const stripPeriods = (self, data, {'strip-periods': stripPeriods}, input) => {
  // TODO
  // impossible with current middleware behaviour; can't strip periods off of
  // an element that doesn't return a string.
  return input
}

const quotes = (self, data, {quotes}, input) => {
  // TODO
  // see stripPeriods; also because it requires lazy/contextual evaluation
  // itself
  return input
}

const textCase = (self, data, {'text-case': textCase}, input) => {
  // TODO
  // see stripPeriods; this one should however be contained
  return input
}

// TODO display

// DEBUG 'ATTRIBUTES'
// ==================
//
// It's all just middleware anyway.
//
// TODO create separate thing for debug middleware? :(
//      new issues require lazy evaluation of middleware, which
//      wouldn't work with the logging purposes of these functions.

const DEBUG_group = (self, data, element, input) => {
  console.log(element.type, input)
  return input
}
const DEBUG_text = (self, data, element, input) => {
  console.log(element.type, element.contentType, element.content, input)
  return input
}

// ELEMENTS
// ========

const simpleGroup = (context, data, element) => context._formatChildren(data, element.content)

const elements = {
  // LAYOUT
  // TODO cs:citation layout
  @add({mods: [formatting, delimiter, affix]})
  layout (...args) { return simpleGroup(...args) },

  // GROUP
  // TODO empty if all cs:text s empty
  @add({mods: [formatting, delimiter, affix]})
  group (...args) { return simpleGroup(...args) },

  // MACRO / IF / ELSE-IF / ELSE
  @add({alias: ['if', 'else-if', 'else']})
  macro (...args) { return simpleGroup(...args) },

  // CHOOSE
  @add()
  choose (context, data, element) {
    return context._format(data, element.content.find(condition => conditionIsTrue(condition, data)))
  },

  // TEXT
  @add({mods: [textCase, stripPeriods, quotes, formatting, affix]})

  text (context, data, element) {
    const {content, contentType} = element

    switch (contentType) {
      case 'variable':
        return element.form === 'short' ? data[content + '-short'] || data[content] : data[content]
      case 'term':
        return context.getTerm(content, element)
      case 'value':
        return content
      case 'macro':
        const macro = context._style.macro[content]
        return macro ? context._format(data, macro) : ''
    }
  },

  // LABEL
  @add({mods: [textCase, stripPeriods, formatting, affix]})

  label (context, data, element) {
    const {content, form, plural} = element

    if (!data.hasOwnProperty(content)) { return }

    const isPlural = do {
      if (plural === 'always') {
        true
      } else if (plural === 'never') {
        false
      } else {
        const value = data[content]
        // TODO not sure if those are parseInt-able
        value.startsWith('number-of-')
          ? parseInt(value) > 1
          : /[-&,]/.test(value)
      }
    }

    return context.getTerm(content, {form, plural: isPlural})
  },

  // NUMBER
  @add({mods: [textCase, formatting, affix]})

  number (context, data, element) {
    const {content, form} = element
    const num = parseInt(data[content])

    // TODO is-numeric
    if (isNaN(num)) { return data[content] }

    // TODO affixes
    // TODO multiple numbers in a single field

    return context.formatNumber(num, form)
  },

  // DATE
  // TODO attrs
  @add()

  date (context, data, element) {
    const value = data[element.content]
    return value ? context.formatDate(value, element) : ''
  }
}

Formatter.prototype.formatDate = function (date, mods) {
  // TODO date ranges
  // TODO AD/BC
  // TODO seasons

  let config

  if (mods.localised) {
    const {form, dateParts} = mods
    config = {}

    const localeConfig = this.getDateConfig(form)
    
    Object.assign(config, localeConfig)
    config.datePartConfig = config.datePartConfig.slice().filter(datePart => dateParts.includes(datePart.content))
    // TODO copy local datepart config
  } else {
    config = mods
  }

  const datePartOrder = ['year', 'month', 'day']

  return config.datePartConfig.map(datePart => {
    const {content, form} = datePart
    const value = date['date-parts'][0][datePartOrder.indexOf(content)]

    // TODO

    return this.formatDatePart(content, value, form)
  }).join(config.delimiter)
}

Formatter.prototype.formatDatePart = function (name, value, form) {
  const num = parseInt(value)
  const string = num.toString()
  const paddedString = string.padStart(2, 0)

  // same behaviour on each datepart it can be used on
  switch (form) {
    case 'numeric':
      return string
    case 'numeric-leading-zeros':
      return paddedString
    case 'ordinal':
      return this.formatNumber(num, 'ordinal')
  }

  if (name === 'month') {
    return this.getTerm(`month-${paddedString}`, {form})
  } else if (form === 'year') {
    if (form === 'long') {
      return string
    } else if (form === 'short') {
      return string.slice(-2)
    }
  }

  return string
}

Formatter.prototype.formatNumber = function (num, form) {
  if (typeof num !== 'number') {
    throw new TypeError(`Expected number, got ${typeof num}`)
  }

  switch (form) {
    case 'long-ordinal':
    case 'ordinal':
      return num + this.getOrdinalSuffix(num, {form})

    case 'roman':
      // NOTICE CONST
      const numerals = [['m', 1000], ['cm', 900], ['d', 500], ['c', 100], ['xc', 90], ['l', 50], ['xl', 40], ['x', 10], ['ix', 9], ['v', 5], ['iv', 4], ['i', 1]]

      let output = ''
      let counter = num
      for (const [numeral, value] of numerals) {
        while (counter >= value) {
          output += numeral
          counter -= value
        }
      }
      return output

    case 'numeric':
    default:
      return num.toString()
  }
}

Formatter.prototype._formatChildren = function (data, children) {
  return children.map(child => this._format(data, child)).filter(Boolean)
}

Formatter.prototype._format = function (data, element) {
  // TODO clean up (this is for TESTING purposes)
  const output = do {
    if (element && typeof elements[element.type] === 'function') {
      elements[element.type](this, data, element)
    } else {
      ''
    }
  }

  return output
}
