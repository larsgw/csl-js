import Formatter from './formatter'
import { conditionIsTrue, conditionChecker } from './condition'

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

function modifiers (...mods) {
  return (target, key, descriptor) => {
    const formatter = descriptor.value
    descriptor.value = (context, data, element) => {
      let output = formatter(context, data, element)

      for (const mod of mods) {
        if (!output || output.length === 0) { return '' }
        output = mod(context, data, element, output)
      }

      // TODO cue mods on elements that are evaluated later (better do all mods to be safe)

      // Cleaning stuff up
      if (Array.isArray(output)) {
        output = [].concat(...output).filter(Boolean)
        output = output.length ? reduceStrings(output) : ''
      }

      // return `<span data-node="${key}">${output}</span>`
      return output + ''
    }
  }
}

function alias (...aliases) {
  return (target, key, descriptor) => {
    for (const alias of aliases) {
      Object.defineProperty(target, alias, descriptor)
    }
    return descriptor
  }
}

// GENERAL ATTRIBUTES
// ==================

const joinAsArray = function (array, delimiter) {
  if (array.length === 0) {
    return array
  }

  const joined = [array[0]]
  for (let i = 1; i < array.length; i++) {
    joined.push(delimiter, array[i])
  }
  return joined
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
  if (stripPeriods !== 'true') { return input }

  // TODO
  // impossible with current middleware behaviour; can't strip periods off of
  // an element that doesn't return a string.

  // BEGIN TESTING
  if (typeof input === 'string') {
    return input.replace(/\./g, '')
  }
  // END TESTING

  return input
}

const quotes = (self, data, {quotes}, input) => {
  // TODO
  // see stripPeriods; also because it requires lazy/contextual evaluation
  // itself

  // BEGIN TESTING
  if (!quotes) { return input }
  return self.getTerm('open-quote') + input + self.getTerm('close-quote')
  // END TESTING

  return input
}

const textCase = (self, data, {'text-case': textCase}, input) => {
  // TODO
  // see stripPeriods; this one should however be contained

  // TODO non-English
  // TODO last word is no stopword

  // BEGIN TESTING
  if (!textCase) { return input }

  if (input === input.toUpperCase() && (textCase === 'sentence' || textCase === 'title')) {
    input = input.toLowerCase()
  }

  // NOTICE const
  const WORD_SPLIT = /(<span class="nocase">)|(<\/span>)|(\p{Letter}+)|(.)/gu
  const STOPWORDS = ['a', 'an', 'and', 'as', 'at', 'but', 'by', 'down', 'for', 'from', 'in', 'into', 'nor', 'of', 'on', 'onto', 'or', 'over', 'so', 'the', 'till', 'to', 'up', 'via', 'with', 'yet']
  function capitalize (word) { return word[0].toUpperCase() + word.slice(1) }

  let nocase = 0
  let wordIndex = 0
  return Array.from(input.matchAll(WORD_SPLIT)).map(([token, open, close, word, rest]) => {
    if (open) {
      nocase++
    } else if (close) {
      nocase--
    } else if (rest) {
      // NOTICE const
      if (rest === ':') { wordIndex = 0 }
      return rest
    } else if (word) {
      const lowercase = word !== word.toUpperCase()
      const firstWord = wordIndex === 0
      wordIndex++
      // console.log(+nocase, +lowercase, +firstWord, +STOPWORDS.includes(word), word)

      if (nocase) { return word }
      switch (textCase) {
        case 'lowercase':
          return word.toLowerCase()
        case 'uppercase':
          return word.toUpperCase()
        case 'sentence':
        case 'capitalize-first':
          return lowercase && firstWord ? capitalize(word) : word
        case 'capitalize-all':
          return lowercase ? capitalize(word) : word
        case 'title':
          return lowercase && (firstWord || !STOPWORDS.includes(word)) ? capitalize(word) : word
        default:
          return word
      }
    }

    return ''
  }).join('') ?? input
  // END TESTING

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
  logger.log(element.type, input)
  return input
}
const DEBUG_text = (self, data, element, input) => {
  logger.log(element.type, element.contentType, element.content, input)
  return input
}

// ELEMENTS
// ========

const simpleGroup = (context, data, element) => context._formatChildren(data, element.content)

const elements = {
  // LAYOUT
  @modifiers(formatting, delimiter, affix)
  layout (context, data, element) {
    if (context._state.mode === 'bibliography') {
      return `<div class="csl-bib-body">
  ${data.map(entry => `<div class="csl-entry">${context._formatChildren(entry, element.content)}</div>`).join('\n')}
</div>`
    }

    return data.map(entry => context._formatChildren(entry, element.content))
  },

  // GROUP / MACRO
  @modifiers(formatting, delimiter, affix)
  @alias('macro')
  group (context, data, element) {
    context._state.pushStack()
    const contents = context._formatChildren(data, element.content)
    const variables = Object.values(context._state.popStack())
    const render = variables.length === 0 || variables.some(Boolean)
    return render ? contents : ''
  },

  // IF / ELSE-IF / ELSE
  @alias('else-if', 'else')
  if (...args) { return simpleGroup(...args) },

  // CHOOSE
  @modifiers()
  choose (context, data, element) {
    const option = element.content.find(condition => conditionIsTrue(condition, data))
    return option ? context._format(data, option) : ''
  },

  // TEXT
  @modifiers(textCase, stripPeriods, quotes, formatting, affix)
  text (context, data, element) {
    const {content, contentType} = element

    switch (contentType) {
      case 'variable':
        const variable = element.form === 'short' && data[content + '-short'] ? content + '-short' : content
        return context._state.useVariable(variable, data) ?? ''
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
  @modifiers(textCase, stripPeriods, formatting, affix)
  label (context, data, element) {
    const { content, form, plural } = element

    if (!data.hasOwnProperty(content)) { return }

    let isPlural

    if (plural === 'always') {
      isPlural = true
    } else if (plural === 'never') {
      isPlural = false
    } else {
      const value = data[content]
      if (content.startsWith('number-of-')) {
        // TODO not sure if those are parseInt-able
        isPlural = parseInt(value) > 1
      } else if (Array.isArray(value)) {
        isPlural = value.length > 1
      } else {
        isPlural = /[-&,]/.test(value)
      }
    }

    return context.getTerm(content, { form, plural: isPlural })
  },

  // NUMBER
  @modifiers(textCase, formatting, affix)
  number (context, data, element) {
    const { content, form } = element
    const variable = context._state.useVariable(content, data)

    if (conditionChecker['is-numeric'](content, data, 'every')) {
      return variable
        .toString()
        .replace(/\s*-\s*/g, '-')
        .replace(/\s*,\s*/g, ', ')
        .replace(/\s*&\s*/g, ' & ')
        .replace(/(?<![a-z])\d+(?![a-z])/gi, num => context.formatNumber(+num, form))
    } else {
      return variable
    }
  },

  // DATE
  @modifiers(affix, delimiter, formatting, textCase)
  date (context, data, element) {
    const value = context._state.useVariable(element.content, data)
    return value ? context.formatDate(value, element) : ''
  },

  // TODO split up
  // NAME
  @modifiers(formatting, delimiter, affix)
  names (context, data, element) {
    context._state.pushGlobalOptions({
      and: element.options.name.and,
      'delimiter-precedes-et-al': element.options.name['delimiter-precedes-et-al'],
      'delimiter-precedes-last': element.options.name['delimiter-precedes-last'],
      'et-al-min': element.options.name['et-al-min'],
      'et-al-use-first': element.options.name['et-al-use-first'],
      'et-al-use-last': element.options.name['et-al-use-last'],
      'et-al-subsequent-min': element.options.name['et-al-subsequent-min'],
      'et-al-subsequent-use-first': element.options.name['et-al-subsequent-use-first'],
      initialize: element.options.name.initialize,
      'initialize-with': element.options.name['initialize-with'],
      'name-as-sort-order': element.options.name['name-as-sort-order'],
      'sort-separator': element.options.name['sort-separator'],
      'name-form': element.options.name.form,
      'name-delimiter': element.options.name.delimiter,
      'names-delimiter': element.options.delimiter
    })
    let output

    const variables = element.content.filter(variable => context._state.useVariable(variable, data))
    if (variables.length) {
      output = variables.map(variable => context.formatNameList(variable, data[variable], element.options))
    } else if (element.options.substitute) {
      const candidates = element.options.substitute.content.slice()
      let candidateOutput
      let stack
      while (!candidateOutput && candidates.length) {
        context._state.pushStack()
        let candidate = candidates.shift()
        if (candidate.type === 'names' && !candidate.options) {
          candidate = {
            ...candidate,
            options: {
              name: element.options.name,
              'et-al': element.options['et-al']
            }
          }
        }
        candidateOutput = context._format(data, candidate)
        stack = context._state.popStack()
      }
      if (candidateOutput) {
        Object.assign(context._state.stack[0], stack)
        Object.keys(stack).map(variable => context._state.suppressVariable(variable))
        output = candidateOutput
      } else {
        output = ''
      }
    }

    context._state.popGlobalOptions()
    return output
  }
}

const dateParts = {
  @modifiers(textCase, formatting, affix)
  @alias('day')
  year (context, data) {
    return data
  },

  @modifiers(textCase, stripPeriods, formatting, affix)
  month (context, data) {
    return data
  }
}

// FORMATTING
// ==========

Formatter.prototype.formatDate = function (date, mods) {
  // TODO date ranges
  // TODO AD/BC
  // TODO seasons

  let config

  if (mods.localised) {
    const {form, dateParts} = mods
    const localeConfig = this.getDateConfig(form)
    config = {...localeConfig}

    config.datePartConfig = config.datePartConfig.slice().filter(datePart => dateParts.includes(datePart.content))
    // TODO copy local datepart config
  } else {
    config = mods
  }

  // NOTICE const
  const datePartOrder = ['year', 'month', 'day']

  return config.datePartConfig.map(datePart => {
    const {content, form} = datePart
    const value = date['date-parts'][0][datePartOrder.indexOf(content)]
    return dateParts[content](this, this.formatDatePart(content, value, form), datePart)
  }).join(config.delimiter ?? '')
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
      // TODO limit-day-ordinals-to-day-1
      return this.formatNumber(num, 'ordinal')
  }

  if (name === 'month') {
    return this.getTerm(`month-${paddedString}`, {form})
  } else if (form === 'year') {
    return form === 'short' ? string.slice(-2) : string
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
  return elements[element.type](this, data, element)
}
