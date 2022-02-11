// GENERAL ATTRIBUTES
// ==================
//
// NOTE: watch out for attributes 'content', 'contentType',
// 'form', 'plural', 'match' & 'conditionals' as they are
// already in use by the element parsers.
//
// NOTICE const?

export const ATTR = {
  affix: { prefix: true, suffix: true },
  delimiter: { delimiter: true },

  formatting: {
    'font-style': ['normal', 'italic', 'oblique'],
    'font-variant': ['normal', 'small-caps'],
    'font-weight': ['normal', 'bold', 'light'],
    'text-decoration': ['none', 'underline'],
    'vertical-align': ['baseline', 'sup', 'sub']
  },

  stripPeriods: { 'strip-periods': ['false', 'true'] },
  quotes: { quotes: ['false', 'true'] },

  textCase: {
    'text-case': ['lowercase', 'uppercase', 'capitalize-first', 'capitalize-all', 'sentence', 'title']
  }
}

export function attributes (...sets) {
  const set = Object.assign({}, ...sets)
  return (target, key, descriptor) => {
    const parser = descriptor.value
    descriptor.value = element => {
      const output = {}

      for (const prop in set) {
        if (Object.prototype.hasOwnProperty.call(element.attributes, prop)) {
          const value = element.attributes[prop]
          if (set[prop] === true || set[prop].includes(value)) {
            output[prop] = value
            continue
          }
        }
      }

      return Object.assign(output, parser(element))
    }

    return descriptor
  }
}
