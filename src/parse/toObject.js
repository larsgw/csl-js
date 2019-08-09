// TODO docs

export function arrayToObject (array, callback) {
  return array.reduce((obj, element) => {
    const { key, val } = callback(element)
    obj[key] = val
    return obj
  }, {})
}

export function xmlToObject (elements) {
  return elements.reduce((index, element) => {
    if (!index.hasOwnProperty(element.name)) {
      index[element.name] = []
    }

    index[element.name].push(element)

    return index
  }, {})
}
