// NOTICE CONST
const NUMBER_PART_SEPARATION_REGEX = /\s*[-&,]\s*/g
const NUMBER_PART_REGEX = /[a-z_]*\d+[a-z_]*/
const matchToArrayMethod = { all: 'every', any: 'some', none: 'some' }

// TODO disambiguate, locator, position
export const conditionChecker = {
  type (condition, data, match) {
    return condition.split(' ')[match](type => type === data.type)
  },

  'is-numeric' (condition, data, match) {
    return condition.split(' ')[match](variable => {
      const value = data[variable]
      if (typeof value === 'string') {
        const parts = value.split(NUMBER_PART_SEPARATION_REGEX)
        return parts.every(part => NUMBER_PART_REGEX.test(part))
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
  },

  position (condition, data, match) {
    // TODO
    return false
  }
}

export function conditionIsTrue (statement, data) {
  const { conditions, match = 'all' } = statement

  // if no conditionals, it's the 'else' case
  if (!conditions) {
    return true
  }

  const results = Object.keys(conditions).map(condition => {
    if (typeof conditionChecker[condition] === 'function') {
      return conditionChecker[condition](conditions[condition], data, matchToArrayMethod[match])
    }
    return undefined
  }).filter(result => result !== undefined)

  switch (match) {
    case 'any':
      return results.some(Boolean)

    case 'none':
      return !results.some(Boolean)

    case 'all':
    default:
      return results.every(Boolean)
  }
}
