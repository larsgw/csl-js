import Formatter from './formatter'

// NOTICE const
const LATIN_CYRILLIC_REGEX = /^(\P{Letter}|\p{Script_Extensions=Latin}|\p{Script_Extensions=Cyrillic})+$/u
const INITIALIZABLE_NAME_PART_REGEX = /((\p{Letter})\p{Letter}*)(\P{Letter}*)/gu

const namePartOrders = [
  // Latin/Cyrillic
  [['given', 'dropping-particle', 'non-dropping-particle', 'family', 'suffix']],
  [['non-dropping-particle', 'family'], ['given', 'dropping-particle'], ['suffix']],
  [['family'], ['given', 'dropping-particle', 'non-dropping-particle'], ['suffix']],
  [['non-dropping-particle', 'family']],

  // Other
  [['family', 'given']],
  [['family']]
]

function getNamePartOrder (latin, form, nameAsSortOrder, demoteNonDroppingParticle) {
  if (latin) {
    if (form === 'short') {
      return namePartOrders[3]
    } else if (!nameAsSortOrder) {
      return namePartOrders[0]
    } else if (demoteNonDroppingParticle === 'sort-only' ||
               demoteNonDroppingParticle === 'never') {
      return namePartOrders[1]
    } else if (demoteNonDroppingParticle === 'display-and-sort') {
      return namePartOrders[2]
    }
  } else {
    if (form === 'short') {
      return namePartOrders[5]
    } else {
      return namePartOrders[4]
    }
  }
}

Formatter.prototype.formatNameList = function (variable, names, opts) {
  // TODO subsequent-author-substitute

  let out = names.map((name, index) => this.formatName(name, index))
  let delimiterOpt

  const etAl = this.getEtAlOptions()
  if (etAl.min >= out.length) {
    delimiterOpt = 'delimiter-precedes-et-al'
    out = out.slice(0, etAl.useFirst)

    if (etAl.useLast === 'true' && (etAl.min - etAl.useFirst) > 2) { // NOTICE const
      out.push('… ' + out.slice(-1)) // NOTICE const
    } else {
      // TODO et-al formatting
      out.push(this.getTerm(opts['et-al']?.term))
    }
  } else if (out.length > 1) {
    const last = out.pop()
    // NOTICE const
    const and = this._state.resolveGlobalOption('and') === 'text' ? this.getTerm('and') : '&'
    out.push(and + ' ' + last)
  }

  let delimiterAtEnd
  switch (this._state.resolveGlobalOption(delimiterOpt)) {
    case 'never':
      delimiterAtEnd = false
      break
    case 'always':
      delimiterAtEnd = true
      break
    case 'after-inverted-name':
      delimiterAtEnd = this._state.resolveGlobalOption('name-as-sort-order') === 'all' ||
        (this._state.resolveGlobalOption('name-as-sort-order') === 'first' && out.length === 2)
      break
    case 'contextual':
    default:
      delimiterAtEnd = out.length > 2
      break
  }

  // NOTICE const
  const delimiter = this._state.resolveGlobalOption('name-delimiter') ?? ', '
  if (delimiterAtEnd) {
    out = out.join(delimiter)
  } else if (out.length > 1) {
    out = out.slice(0, -1).join(delimiter) + ' ' + out.slice(-1)
  }

  if (opts.label) {
    const label = this._format({
      [variable]: names
    }, {
      content: variable,
      ...opts.label
    })

    if (opts.labelBeforeName) {
      out = label + out
    } else {
      out += label
    }
  }

  return out
}

Formatter.prototype.formatName = function (name, index) {
  if (name.literal) {
    return name.literal
  }

  const latin = LATIN_CYRILLIC_REGEX.test(name)
  const asSortOrder = this._state.resolveGlobalOption('name-as-sort-order')
  const namePartOrder = getNamePartOrder(
    latin,
    this._state.resolveGlobalOption('name-form'),
    asSortOrder === 'all' || (asSortOrder === 'first' && index === 0),
    'never'
  )

  // NOTICE const
  const sortSeparator = this._state.resolveGlobalOption('sort-separator') ?? ', '

  // TODO name part formatting
  return namePartOrder
    .map(nameParts => nameParts
      .map(namePart => this.formatNamePart(namePart, name[namePart]))
      .filter(Boolean)
      .join(' ')
    )
    .filter(Boolean)
    .join(sortSeparator)
}

Formatter.prototype.formatNamePart = function (namePart, name) {
  if (!name) {
    return
  }

  const initializeWith = this._state.resolveGlobalOption('initialize-with')
  const shouldInitialize = initializeWith && this._state.resolveGlobalOption('initialize') !== 'false'

  if (namePart === 'given') {
    name = this.initializeName(name, shouldInitialize, initializeWith ?? (shouldInitialize ? '' : ' '))
  }

  return name
}

// NOTICE const
Formatter.prototype.initializeName = function (name, initialize, initializeWith) {
  // TODO initialize-with-hyphen
  return name.replace(INITIALIZABLE_NAME_PART_REGEX, (_, full, initial, rest) => {
    if (initialize || full === initial) {
      return initial + initializeWith + rest.replace(/[\s.]/g, '')
    } else {
      return full + rest
    }
  }).trimEnd()
}

Formatter.prototype.getEtAlOptions = function () {
  return {
    min: +this._state.resolveGlobalOption('et-al-min'),
    useFirst: +this._state.resolveGlobalOption('et-al-use-first'),
    useLast: this._state.resolveGlobalOption('et-al-use-last') === 'true'
  }
}
