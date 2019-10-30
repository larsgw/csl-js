import { attributes } from '../attributes'
import { compileElement } from './layout'

const elements = {
  __context: 'cs:sort',

  @attributes({
    'names-min': true,
    'names-use-first': true,
    'names-use-last': true,
    sort: ['ascending', 'descending']
  })
  key ({ attributes }) {
    const contentType = Object.keys(attributes)[0]
    return {
      contentType,
      content: attributes[contentType]
    }
  }
}

const compileKey = compileElement(elements)

export default function cSort (element) {
  return {
    type: 'sort',
    content: element.children.map(compileKey)
  }
}
