import { attributes, ATTR } from '../attributes'
import { renderingElements, compileRenderingElements, compileElement } from './layout'

// CHOOSE
// ======

const conditionalElements = {
  __context: 'conditionalElements',

  if ({ attributes: {match, ...conditions}, children }) {
    return { content: children.map(compileRenderingElements), match, conditions }
  },

  // parse as 'if' node
  'else-if' (element) {
    return conditionalElements.if(element)
  },

  else ({ children }) {
    return { content: children.map(compileRenderingElements) }
  }
}

const compileConditionalElement = compileElement(conditionalElements)

Object.assign(renderingElements, {
  /**
   * choose
   * content: if | else-if | else
   * conditions: disambiguate, is-numeric, is-uncertain-date, locator, position, type, variable
   * match: all | any | none
   */
  choose ({children}) {
    return { content: children.map(compileConditionalElement) }
  }
})
