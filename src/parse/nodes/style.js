import {arrayToObject, xmlToObject} from '../toObject'
import cMetadata from './info'
import cLocale from './locale'
// import cSort from './sort'
import cLayout from './layout'

// TODO docs
const cMacro = macro => ({name: macro.attributes.name, make: cLayout(macro)})

// TODO options: Citation-specific Options, Inheritable name options
// TODO casing note styles
const cCitation = citation => {
  const {/*sort: [sort], */layout: [layout]} = xmlToObject(citation.children)
  return {/*sort: cSort(sort), */layout: cLayout(layout)}
}

// TODO options: Bibliography-specific Options
const cBibliography = bibliography => {
  const {/*sort: [sort], */layout: [layout]} = xmlToObject(bibliography.children)
  return {/*sort: cSort(sort), */layout: cLayout(layout)}
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
    ? arrayToObject(elements.locale.map(cLocale), locale => ({key: locale.lang, val: locale}))
    : {}

  output.macro = elements.macro
    ? arrayToObject(elements.macro.map(cMacro), ({name, make}) => ({key: name, val: make}))
    : {}

  output.citation = elements.citation
    ? cCitation(elements.citation[0])
    : {}

  output.bibliography = elements.bibliography
    ? cBibliography(elements.bibliography[0])
    : {}

  return output
}

export default parse
