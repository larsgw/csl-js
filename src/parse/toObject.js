// TODO docs

const arrayToObject = (array, callback) => array.reduce((obj, element) => {
  const {key, val} = callback(element)
  obj[key] = val
  return obj
}, {})

const xmlToObject = elements => {
  const json = {}
  elements.forEach(element => {
    if (!json.hasOwnProperty(element.name)) {
      json[element.name] = []
    }

    json[element.name].push(element)
  })
  return json
}

export {arrayToObject, xmlToObject}
