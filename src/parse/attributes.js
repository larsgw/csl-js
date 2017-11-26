export const applyAttributes = (...sets) => {
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

export const affix = {prefix: true, suffix: true}
export const delimiter = {delimiter: true}

export const formatting = {
  'font-style': ['normal', 'italic', 'oblique'],
  'font-variant': ['normal', 'small-caps'],
  'font-weight': ['normal', 'bold', 'light'],
  'text-decoration': ['none', 'underline'],
  'vertical-align': ['baseline', 'sup', 'sub']
}

export const stripPeriods = {'strip-periods': ['false', 'true']}
export const quotes = {quotes: ['false', 'true']}

export const textCase = {
  'text-case': ['lowercase', 'uppercase', 'capitalize-first', 'capitalize-all', 'sentence', 'title']
}
