import styles from '../styles'
import formats from './formats'
import { sort } from './sort'

class State {
  constructor () {
    this.stack = [{}]
    this.suppressed = new Set()
    this.globalOptions = []
  }

  useVariable (variable, data) {
    if (!(variable in data) || this.suppressed.has(variable)) {
      this.stack[0][variable] = false
      return undefined
    }

    this.stack[0][variable] = true
    return data[variable]
  }

  suppressVariable (variable) {
    this.suppressed.add(variable)
  }

  pushStack () {
    this.stack.unshift({})
  }

  popStack () {
    return this.stack.shift()
  }

  pushGlobalOptions (options) {
    this.globalOptions.unshift(options)
  }

  popGlobalOptions () {
    return this.globalOptions.shift()
  }

  resolveGlobalOption (option) {
    for (const options of this.globalOptions) {
      if (option in options) {
        return options[option]
      }
    }
  }
}

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
      this.lang = this._style['default-locale'] ?? 'en-US'
    }

    this.locales = this.buildLocaleFallbackRoute()
  }

  _formatLayout (data, layout) {
    this._state = new State()
    const output = this._format(data, layout)
    delete this._state
    return output
  }

  formatBibliography (data) {
    // TODO
    // return this._formatLayout(
    //   this.sort(data, 'bibliography'),
    //   this._style.bibliography.layout
    // )
    return this.formatNew(data, 'bibliography')
  }

  formatCitation (data) {
    // return this._formatLayout(
    //   this.sort(data, 'citation'),
    //   this._style.citation.layout
    // )
    return this.formatNew(data, 'citation')
  }

  formatNew (data, mode) {
    this._state = new State()
    this._state.pushGlobalOptions(this._style.options)
    this._state.pushGlobalOptions(this._style[mode].options)
    this._state.mode = mode

    data = this.sort(data, mode)
    const output = this._format(data, this._style[mode].layout)

    delete this._state
    return output
  }

  sort (data, mode) {
    return sort.call(this, data, this._style[mode]?.sort)
  }
}

export default Formatter
