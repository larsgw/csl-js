import xml from 'xml-parser'

import locale from './nodes/locale'
import style from './nodes/style'

// TODO implement
// TODO docs
const checkNs = xml => xml

const parseXml = function (input) {
  input = input.replace(
    /&#(x[0-9A-Z]+|[0-9]+);/ig,
    (_, number) => String.fromCharCode(
      number.startsWith('x')
        ? parseInt(number.slice(1), 16)
        : parseInt(number, 10)
    )
  )

  const { root } = checkNs(xml(input))

  switch (root.name) {
    case 'locale':
      return locale(root)
    case 'style':
      return style(root)
  }
}

export default parseXml
