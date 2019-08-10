import { attributes, ATTR } from '../attributes'
import { renderingElements, compileElement } from './layout'

const dateFormValues = ['numeric', 'text']
const datePartsValues = ['year-month-day', 'year-month', 'year']
const datePartFormValues = {
  day: ['numeric', 'numeric-leading-zeros', 'ordinal'],
  month: ['long', 'short', 'numeric', 'numeric-leading-zeros'],
  year: ['long', 'short']
}

// DATE
// ====

const dateElements = {
  __context: 'dateElements',

  /**
   * date
   * content: variable
   * special: form, children, date-parts
   * options: affix, display, formatting, text-case
   * NOTE: if no form, then non-localised
   * NOTE: if non-localised, use delimiter
   * NOTE: the first date element rendering a year should also render the year-suffix
   */
  // TODO display
  @attributes(ATTR.affix, ATTR.delimiter, ATTR.formatting, ATTR.textCase)
  date ({attributes, children}) {
    const localised = attributes.form && dateFormValues.includes(attributes.form)
    const output = { localised, content: attributes.variable }

    if (localised) {
      output.form = attributes.form
      // If localised, don't use delimiter
      output.delimiter = ''

      if (datePartsValues.includes(attributes['date-parts'])) {
        output.dateParts = attributes['date-parts']
      } else {
        output.dateParts = datePartsValues[0]
      }
    }

    output.datePartConfig = children.map(compileDateElement)
    return output
  },

  /**
   * date-part
   * content: name
   * special: form, range-delimiter
   * options: affix, formatting, text-case
   * NOTE: no affixes when localised
   * NOTE: strip-periods on month
   */
  @attributes(ATTR.affix, ATTR.formatting, ATTR.textCase, ATTR.stripPeriods)
  'date-part' ({attributes}) {
    const content = attributes.name
    const output = {
      content,
      rangeDelimiter: attributes['range-delimiter'] ?? /* NOTICE const */ '–'
    }

    if (datePartFormValues[content].includes(attributes.form)) {
      output.form = attributes.form
    }

    if (content !== 'month') {
      output['strip-periods'] = 'false'
    }

    return output
  }
}

const compileDateElement = compileElement(dateElements)

renderingElements.date = dateElements.date
