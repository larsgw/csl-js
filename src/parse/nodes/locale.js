import { attributes, ATTR } from '../attributes'
import {arrayToObject, xmlToObject} from '../toObject'
import cMetadata from './info'

// TODO docs

const c = {
  @attributes(ATTR.formatting, ATTR.textCase, ATTR.affix, ATTR.stripPeriods)
  datePart ({attributes}) {
    const {name, form, 'range-delimiter': rangeDelimiter} = attributes
    const output = {content: name}

    if (form) { output.form = form }
    if (rangeDelimiter) { output.rangeDelimiter = rangeDelimiter }

    // force strip-periods to default value when it's not a month
    if (name !== 'month') { output['strip-periods'] = ATTR.stripPeriods['strip-periods'][0] }

    return output
  },

  @attributes(ATTR.formatting, ATTR.textCase, ATTR.delimiter)
  date ({attributes, children}) {
    const {form: name, delimiter} = attributes
    const output = {name, datePartConfig: children.map(c.datePart)}

    return output
  }
}

const cTerm = term => {
  const {name, form = 'long', match, gender, 'gender-form': genderForm} = term.attributes
  let value = {}

  if (term.children && term.children.length) {
    const {single, multiple} = xmlToObject(term.children)
    value.single = single[0].content
    value.multiple = multiple[0].content
  } else if (term.content) {
    value.content = term.content
  }

  if (match) {
    value.match = match
  }
  if (gender) {
    value.gender = gender
  }

  return {name, form, value, genderForm}
}

const mergeTerms = terms => {
  const target = {}
  for (let {name, form, value, genderForm} of terms) {
    if (!target.hasOwnProperty(name)) {
      target[name] = {}
    }

    if (genderForm) {
      value.form = form
      target[name][genderForm] = value
    } else {
      target[name][form] = value
    }
  }
  return target
}

// TODO root-level config
// TODO csl version
const parse = function (locale) {
  const elements = xmlToObject(locale.children)
  const output = {lang: locale.attributes['xml:lang']}

  if (elements.info) {
    output.info = cMetadata(elements.info[0])
  }
  if (elements.terms) {
    output.term = mergeTerms(elements.terms[0].children.map(cTerm))
  }
  if (elements.date) {
    output.date = arrayToObject(elements.date.map(c.date), ({name, ...options}) => ({key: name, val: options}))
  }
  if (elements['style-options']) {
    output.styleOptions = elements['style-options'][0].attributes
  }

  return output
}

export default parse
