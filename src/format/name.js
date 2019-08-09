import Formatter from './formatter'

// NOTICE const
const LATIN_CYRILLIC_REGEX = /^(\P{Letter}|\p{Script_Extensions=Latin}|\p{Script_Extensions=Cyrillic})+$/u
const INITIALIZABLE_NAME_PART_REGEX = /(\p{Letter})\p{Letter}*/gu

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
  // TODO et al
  // TODO delimiter
  let out = names
    .map((name, index) => this.formatName(name, index, opts))
    .join(opts.name?.delimiter || ', ') // NOTICE const

  if (opts.label) {
    let isPlural
    switch (opts.label.plural) {
      case 'never':
        isPlural = false
        break
      case 'all':
        isPlural = true
        break
      case 'contextual':
      default:
        isPlural = names.length > 1
        break
    }
    out += this.getTerm(variable, {
      form: opts.label.form,
      plural: isPlural
    })
  }

  return out
}

Formatter.prototype.formatName = function (name, index, opts) {
  if (name.literal) {
    return name.literal
  }

  const latin = LATIN_CYRILLIC_REGEX.test(name)
  const asSortOrder = opts.name?.['name-as-sort-order'] === 'all' || (opts.name?.['name-as-sort-order'] === 'first' && index === 0)
  const namePartOrder = getNamePartOrder(latin, opts.name?.form, asSortOrder, 'never')

  // TODO name part formatting

  return namePartOrder
    .map(nameParts => nameParts
      .map(namePart => this.formatNamePart(namePart, name[namePart], opts))
      .filter(Boolean)
      .join(' ')
    )
    .join(opts.name?.['sort-separator'] || ', ') // NOTICE const
}

Formatter.prototype.formatNamePart = function (name, namePart, opts) {
  if (namePart === 'given') {
    return this.initializeName(name, opts.name?.initialize !== 'false', opts.name?.initializeWith)
  } else {
    return name
  }
}

Formatter.prototype.initializeName = function (name, initialize, initializeWith) {
  return name.replace(INITIALIZABLE_NAME_PART_REGEX, (full, initial) => {
    if (!initialize && full !== initial) {
      return full
    } else {
      return initial + initializeWith
    }
  })
}
