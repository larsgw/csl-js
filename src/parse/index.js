import xml from 'xml-parser'

import locale from './nodes/locale'
import style from './nodes/style'

// TODO implement
// TODO docs
const checkNs = xml => xml

const parseXml = function (input) {
  const {root} = input |> xml |> checkNs

  switch (root.name) {
    case 'locale':
      return locale(root)
    case 'style':
      return style(root)
  }
}

export default parseXml
