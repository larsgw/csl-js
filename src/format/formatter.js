import styles from '../styles'
import formats from './formats'

class Formatter {
  constructor ({ style, lang, format }) {
    // TODO check
    this.style = style
    this.lang = lang
    this.format = format
    // TODO rename
    this._style = styles.get(style)
    this._formatData = formats[format]

    if (!this.lang) {
      this.lang = this._style['default-locale'] || 'en-US'
    }

    this.locales = this.buildLocaleFallbackRoute()
  }

  _formatLayout (data, layout) {
    this._state = {
      stack: [{}],
      suppressed: new Set()
    }
    const output = this._format(data, layout)
    delete this._state
    return output
  }

  formatBibliography (data) {
    // TODO
    return this._formatLayout(data, this._style.bibliography.layout)
  }

  formatCitation (data) {
    return this._formatLayout(data, this._style.citation.layout)
  }

  sort (data, mode) {
    // TODO
  }
}

export default Formatter
