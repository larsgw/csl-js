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
    if (!Object.prototype.hasOwnProperty.call(index, element.name)) {
      index[element.name] = []
    }

    index[element.name].push(element)

    return index
  }, {})
}
