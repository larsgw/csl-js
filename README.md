# CSL-JS

Lightweight CSL Engine. WIP.

[![NPM version](https://img.shields.io/npm/v/csl-js.svg)](https://www.npmjs.org/csl-js)
[![license](https://img.shields.io/github/license/larsgw/csl-js.svg)](https://github.com/larsgw/csl-js/blob/master/LICENSE.md)

[![JavaScript Style Guide](https://cdn.jsdelivr.net/gh/standard/standard@master/badge.svg)](https://github.com/standard/standard)

---

##### Table of Contents

  - [Get Started](#get-started)
  - [API](#api)
    - [Registering/parsing locales & styles](#registering--parsing-locales---styles)
    - [Formatter](#formatter)
  - [Features](#features)
  - [TODOs](#todos)

## Get Started

NPM install:

     npm i csl-js

> Browser not supported yet

Use: (API usage below)

```js
const { Formatter, locales, styles } = require('csl-js')
```

## API

### Registering/parsing locales & styles

```js
const style = await (await fetch('https://cdn.jsdelivr.net/gh/citation-style-language/styles@master/apa.csl')).text()
styles.set('apa', style)

const style = await (await fetch('https://cdn.jsdelivr.net/gh/citation-style-language/locales@master/locales-en-US.xml')).text()
locales.set('en-US', parsed)
```

### `Formatter`

Create:

```js
const formatter = new Formatter({
  style: '...',
  lang: '...',
  format: '...'
})
```

Format: (data in CSL-JSON format)

```js
formatter.formatBibliography(data)
// (1957). Correlation of the Base Strengths of Amines 1 () []. Journal of the American Chemical Society, 79(20), 5441-5444. https://doi.org/10.1021/ja01577a030

formatter.formatCitation(data)
// (1957)
```

## Features

  - `cs:text`, `cs:number`, `cs:label`, `cs:group`, `cs:layout`, `cs:macros`
  - `cs:choose` (with most conditions)
  - basic `cs:names`
  - basic et-al support
  - basic `cs:date`
  - sorting
  - global and semi-local options (but not necessarily implementations)
  - locales
  - formatting, affixes, delimiter, strip-periods (mostly, anyway)
  - `cs:bibliography`, `cs:citation`
  - test suite (the official one)

## Missing spec features

  - disambiguation
  - date ranges, BC
  - better number handling
  - reference manager
  - term genders
  - jsdoc and documentation & examples
