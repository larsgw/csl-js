export default {
  html: {
    'font-style': {
      normal: ['<span style="font-style:normal">', '</span>'],
      italic: ['<i>', '</i>'],
      oblique: ['<em>', '</em>']
    },
    'font-variant': {
      normal: ['<span style="font-variant:normal">', '</span>'],
      'small-caps': ['<span style="font-variant:small-caps">', '</span>']
    },
    'font-weight': {
      normal: ['<span style="font-weight:normal">', '</span>'],
      bold: ['<b>', '</b>'],
      light: ['<span style="font-weight:300">', '</span>']
    },
    'text-decoration': {
      none: ['<span style="text-decoration:none">', '</span>'],
      underline: ['<u>', '</u>']
    },
    'vertical-align': {
      baseline: ['<span style="vertical-align:baseline">', '</span>'],
      sup: ['<sup>', '</sup>'],
      sub: ['<sub>', '</sub>']
    }
  },

  ansi: {
    'font-style': {
      italic: ['\u001b[3m', '\u001b[23m'],
      oblique: ['\u001b[3m', '\u001b[23m']
    },
    'font-weight': {
      bold: ['\u001b[1m', '\u001b[22m'],
      light: ['\u001b[2m', '\u001b[22m']
    },
    'text-decoration': {
      underline: ['\u001b[4m', '\u001b[24m']
    }
  }
}
