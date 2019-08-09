import Formatter from './formatter'
import locales from '../locales'
import styles from '../styles'

// NOTICE CONST
const FORM_FALLBACK = {
  short: 'long',
  symbol: 'short',
  verb: 'long',
  'verb-short': 'verb'
}

// NOTICE CONST
// From https://github.com/citation-style-language/locales/blob/b5f4b87d7693f69a5697fc21e1b2b31dc6dc39b6/locales.json#L2-L47
// Accessed 2017-11-11
const primaryDialects = {
  'af': 'af-ZA',
  'ar': 'ar',
  'bg': 'bg-BG',
  'ca': 'ca-AD',
  'cs': 'cs-CZ',
  'cy': 'cy-GB',
  'da': 'da-DK',
  'de': 'de-DE',
  'el': 'el-GR',
  'en': 'en-US',
  'es': 'es-ES',
  'et': 'et-EE',
  'eu': 'eu',
  'fa': 'fa-IR',
  'fi': 'fi-FI',
  'fr': 'fr-FR',
  'he': 'he-IL',
  'hr': 'hr-HR',
  'hu': 'hu-HU',
  'id': 'id-ID',
  'is': 'is-IS',
  'it': 'it-IT',
  'ja': 'ja-JP',
  'km': 'km-KH',
  'ko': 'ko-KR',
  'lt': 'lt-LT',
  'lv': 'lv-LV',
  'mn': 'mn-MN',
  'nb': 'nb-NO',
  'nl': 'nl-NL',
  'nn': 'nn-NO',
  'pl': 'pl-PL',
  'pt': 'pt-PT',
  'ro': 'ro-RO',
  'ru': 'ru-RU',
  'sk': 'sk-SK',
  'sl': 'sl-SI',
  'sr': 'sr-RS',
  'sv': 'sv-SE',
  'th': 'th-TH',
  'tr': 'tr-TR',
  'uk': 'uk-UA',
  'vi': 'vi-VN',
  'zh': 'zh-CN'
}

Formatter.prototype.buildLocaleFallbackRoute = function () {
  const localeFallbackRoute = []

  const dialect = this.lang
  const language = dialect.split('-')[0]
  const primaryDialect = primaryDialects[language]

  const styleLocales = styles.get(this.style)?.locale || {}

  // Below code should work as described in:
  // http://docs.citationstyles.org/en/stable/specification.html#locale-fallback
  // Accessed 2017-11-11, CSL spec 1.0.1

  // Locales for the style
  // =====================

  // Use the style-specific locale for the dialect (e.g. 'en-GB'), or, if
  // if the main locale is a language (e.g. 'en'), use the primary
  // dialect ('en-US').
  if (dialect === language) {
    if (styleLocales.hasOwnProperty(primaryDialect)) {
      localeFallbackRoute.push(styleLocales[primaryDialect])
    }
  } else {
    if (styleLocales.hasOwnProperty(dialect)) {
      localeFallbackRoute.push(styleLocales[dialect])
    }
  }

  // Always use the default & langauge-style locales for the style
  if (styleLocales.hasOwnProperty(language)) {
    localeFallbackRoute.push(styleLocales[language])
  }
  if (styleLocales.hasOwnProperty('undefined')) {
    localeFallbackRoute.push(styleLocales.undefined)
  }

  // General locales
  // ===============

  // Use the dialect locale
  if (locales.has(dialect)) {
    localeFallbackRoute.push(locales.get(dialect))
  }

  // Use the primary dialect if the chosen dialect is a secondary dialect
  if (primaryDialect !== dialect && locales.has(primaryDialect)) {
    localeFallbackRoute.push(locales.get(primaryDialect))
  }

  // Always fall back to the 'en-US' locale (if it wasn't chosen already)
  if (dialect !== 'en-US' && primaryDialect !== 'en-US' && locales.has('en-US')) {
    localeFallbackRoute.push(locales.get('en-US'))
  }

  return localeFallbackRoute
}

Formatter.prototype.getDate = function (form) {
  for (const locale of this.locales) {
    const date = locale.date[form]

    if (date) {
      return date
    }
  }
}

// TODO form, gender, plural
Formatter.prototype.hasTerm = function (name) {
  for (const locale of this.locales) {
    if (locale.term[name]) { return true }
  }
}

Formatter.prototype.getTerm = function (name, { form = 'long', gender, plural } = {}) {
  for (const locale of this.locales) {
    if (!(locale.term && name in locale.term)) {
      continue
    }

    const term = locale.term[name]

    // TODO matching

    // TODO gender + form
    // boolean short-circuiting: return gender term if possible, else regular term
    const value = (gender && term[gender]) || term[form]

    if (value) {
      return (plural ? value.multiple : value.single) || value.content || ''
    }
  }

  if (form in FORM_FALLBACK) {
    return this.getTerm(name, {
      form: FORM_FALLBACK[form],
      gender,
      plural
    })
  } else {
    return ''
  }
}

Formatter.prototype.getOrdinalSuffix = function (num, { form = 'numeric' } = {}) {
  if (form !== 'ordinal' && form !== 'long-ordinal') {
    return ''
  }

  const paddedNum = num.toString().padStart(2, 0)

  if (form === 'long-ordinal' && num <= 10) {
    // TODO gender
    const longOrdinal = this.getTerm(`long-ordinal-${paddedNum}`)
    if (longOrdinal) {
      return longOrdinal
    }
    // else proceed
  }

  const defaultSuffix = this.getTerm('ordinal')

  // TODO full ordinal check
  if (!defaultSuffix && this.hasTerm('ordinal-01')) {
    // CSL 1.0 mode
    for (let i = 1; i <= 3; i++) {
      if (num % 10 === i && num !== 10 + i) {
        return this.getTerm(`ordinal-${paddedNum}`)
      }
    }
    return this.getTerm('ordinal-04')
  } else {
    // CSL 1.0.1 mode
    // TODO
    return this.getTerm(`ordinal-${paddedNum}`) || defaultSuffix
  }
}

Formatter.prototype.getDateConfig = function (form) {
  for (const locale of this.locales) {
    if (locale.date && locale.date[form]) {
      return locale.date[form]
    }
  }
}
