import {arrayToObject, xmlToObject} from '../toObject'

// TODO docs

const cAuthor = ({children}) => arrayToObject(children, ({name, content}) => ({key: name, val: content}))

const simpleFields = ['title', 'title-short', 'id', 'summary', 'updated', 'published', 'eissn', 'issnl', 'rights']

const cMetadata = info => {
  const elements = xmlToObject(info.children)
  const target = {}

  for (const field of simpleFields) {
    if (elements[field] && elements[field].length) {
      target[field] = elements[field][0].content
    }
  }

  if (elements.rights) {
    target.license = elements.rights[0].attributes.license
  }
  if (elements.issn) {
    target.issn = elements.issn.map(({content}) => content)
  }
  if (elements.link) {
    target.link = arrayToObject(elements.link, ({attributes: {rel, href}}) => ({key: rel, val: href}))
  }
  if (elements.author) {
    target.author = elements.author.map(cAuthor)
  }
  if (elements.contributor) {
    target.contributor = elements.contributor.map(cAuthor)
  }
  if (elements.translator) {
    target.translator = elements.translator.map(cAuthor)
  }
  if (elements.category) {
    target.category = arrayToObject(elements.category, ({attributes}) => {
      const [key, val] = Object.entries(attributes)[0]
      return {key, val}
    })
  }

  return target
}

export default cMetadata
