import { arrayToObject, xmlToObject } from '../toObject'
import cMetadata from './info'
import cLocale from './locale'
import cSort from './sort'

import cLayout from './layout'
import './date'
import './choose'
import './name'

// TODO docs
const cMacro = macro => ({ name: macro.attributes.name, make: cLayout(macro) })

// TODO options: Citation-specific Options, Inheritable name options
// TODO casing note styles
const cCitation = citation => {
  const children = xmlToObject(citation.children)
  return {
    sort: children.sort && cSort(children.sort[0]),
    layout: children.layout && cLayout(children.layout[0])
  }
}

// TODO options: Bibliography-specific Options
const cBibliography = bibliography => {
  const children = xmlToObject(bibliography.children)
  return {
    sort: children.sort && cSort(children.sort[0]),
    layout: children.layout && cLayout(children.layout[0])
  }
}

// TODO root-level config
// TODO csl version
const parse = function (style) {
  const elements = xmlToObject(style.children)
  const output = {}

  output.info = elements.info
    ? cMetadata(elements.info[0])
    : {}

  output.locale = elements.locale
    ? arrayToObject(elements.locale.map(cLocale), locale => ({ key: locale.lang, val: locale }))
    : {}

  output.macro = elements.macro
    ? arrayToObject(elements.macro.map(cMacro), ({ name, make }) => ({ key: name, val: make }))
    : {}

  output.citation = elements.citation
    ? cCitation(elements.citation[0])
    : {}

  output.bibliography = elements.bibliography
    ? cBibliography(elements.bibliography[0])
    : {}

  Object.assign(output, style.attributes)

  return output
}

export default parse
