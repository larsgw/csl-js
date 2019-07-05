import styles from '../styles'
import formats from './formats'

class Formatter {
  style
  lang
  format
  locales

  constructor ({ style, lang, format }) {
    // TODO check
    this.style = style
    this.lang = lang
    this.format = format
    // TODO rename
    this._style = styles.get(style)
    this._formatData = formats[format]

    this.locales = this.buildLocaleFallbackRoute()
  }

  formatBibliography (data) {
    // TODO
    return this._format(data, this._style.bibliography.layout)
  }

  sort (data, mode) {
    // TODO
  }
}

export default Formatter
