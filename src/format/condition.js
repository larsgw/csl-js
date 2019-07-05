// NOTICE CONST
const numberRegex = /^([a-z_]*\d+\w*)((\s*[-&,]\s*)([a-z_]*\d+\w*))*$/i
const matchToArrayMethod = { all: 'every', any: 'some', none: 'some' }

// TODO disambiguate, locator, position
const conditionChecker = {
  type (condition, data, match) {
    return match === 'some' ? condition.split(' ').includes(data.type) : false
  },

  'is-numeric' (condition, data, match) {
    return condition.split(' ')[match](variable => {
      const value = data[variable]
      if (typeof value === 'string') {
        return numberRegex.test(value)
      } else {
        return typeof value === 'number'
      }
    })
  },

  'is-uncertain-date' (condition, data, match) {
    return condition.split(' ')[match](variable => data[variable] && data[variable].circa)
  },

  variable (condition, data, match) {
    return condition.split(' ')[match](variable => data[variable])
  }
}

const resultIsTrue = result => result

export default function conditionIsTrue (statement, data) {
  const { conditions, match = 'all' } = statement

  // if no conditionals, it's the 'else' case
  if (!conditions) {
    return true
  }

  const results = Object.keys(conditions).map(condition => {
    if (typeof conditionChecker[condition] === 'function') {
      return conditionChecker[condition](conditions[condition], data, matchToArrayMethod[match])
    }
  }).filter(result => result !== undefined)

  switch (match) {
    case 'any':
      return results.some(resultIsTrue)

    case 'none':
      return !results.some(resultIsTrue)

    case 'all':
    default:
      return results.every(resultIsTrue)
  }
}
