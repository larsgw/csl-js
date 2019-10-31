import variables from '../variables'

function renderNameVariable (variable, data) {
  return data[variable] && this.formatNameList(variable, data[variable], {
    name: {
      form: 'long',
      'name-as-sort-order': 'all'
    }
  })
}

function renderDateVariable (variable, data) {
  return data[variable]?.['date-parts']?.map(parts =>
    // creates an integer of the form [-]YYYYMMDD which works perfect for sorting
    parts.reduce((sum, part, i) => sum + part * 10 ** (3 - i), 0)
  )
}

function renderNumberVariable (variable, data) {
  const number = parseInt(data[variable])
  return isNaN(number) ? data[variable] : number
}

function renderVariable (variable, data) {
  const type = variables[variable].type
  switch (type) {
    case 'name':
      return renderNameVariable.call(this, variable, data)
    case 'date':
      return renderDateVariable.call(this, variable, data)
    case 'number':
      return renderNumberVariable.call(this, variable, data)
    default:
      return data[variable]
  }
}

function comparisonMethod (key) {
  const type = key.contentType === 'variable' ? variables[key.content].type : undefined
  switch (type) {
    case 'date':
      // sort as:
      // 2000, 2000-2001, 2000-2004, 2001-2003
      return (a, b) => (a[0] < b[0] || (a[0] === b[0] && (a[1] < b[1] || (!a[1] && b[1]))))
    default:
      return (a, b) => a < b
  }
}

function renderKey (data, key) {
  if (key.contentType === 'macro') {
    return this._format(data, this._style.macro[key.content])
  } else if (key.contentType === 'variable') {
    return renderVariable.call(this, key.content, data)
  }
}

function compare (a, b, key) {
  this._state.pushGlobalOptions({
    'et-al-min': key['names-min'],
    'et-al-subsequent-min': key['names-min'],
    'et-al-use-first': key['names-use-first'],
    'et-al-subsequent-use-first': key['names-use-first'],
    'et-al-use-last': key['names-use-last'],
    'et-al-subsequent-use-last': key['names-use-last']
  })
  const aRender = renderKey.call(this, a, key)
  const bRender = renderKey.call(this, b, key)
  this._state.popGlobalOptions()

  if (aRender == null) { return 1 }
  if (bRender == null) { return -1 }

  const compareFunction = comparisonMethod(key)
  const comparison = compareFunction(aRender, bRender) ? 1 : compareFunction(bRender, aRender) ? -1 : 0
  const ascending = key.sort !== 'descending' ? 1 : -1
  return ascending * comparison
}

export function sort (data, layout) {
  if (!layout) {
    return data.slice()
  }

  const keys = layout.content
  return data.slice().sort((a, b) => keys.reduce(
    (result, key) => result || compare.call(this, a, b, key),
    0
  ))
}
