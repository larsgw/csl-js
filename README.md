# CSL-JS

Lightweight CSL Engine. WIP.

[![NPM version](https://img.shields.io/npm/v/csl-js.svg)](https://www.npmjs.org/csl-js)
[![license](https://img.shields.io/github/license/larsgw/csl-js.svg)](https://github.com/larsgw/csl-js/blob/master/LICENSE.md)

[![JavaScript Style Guide](https://cdn.rawgit.com/standard/standard/master/badge.svg)](https://github.com/standard/standard)

---

##### Table of Contents

* [Get Started](#get-started)
* [API](#api)
    * [Registering/parsing locales & styles](#registering--parsing-locales---styles)
    * [Formatter](#formatter)
* [Features](#features)
* [TODOs](#todos)

## Get Started

NPM install:

     npm i csl-js

> Browser not supported yet

Use: (API usage below)

```js
const parseXml = require('csl-js/lib/parse/')

const locales = require('csl-js/lib/locales')
const styles = require('csl-js/lib/styles')

const Formatter = require('csl-js/lib/format/')
```

## API

### Registering/parsing locales & styles

Parse:

```js
const parsed = parseXml(xml)
```

Register:

```js
locales.set(lang, parsed)
styles.set(style, parsed)
```

### `Formatter`

Create:

```js
const formatter = new Formatter({style: '...', lang: '...', format: '...'})
```

Format: (data in CSL-JSON format)

```js
formatter.formatBibliography(data)
// TODO format citations
```

## Features

* `cs:text`, `cs:number`, `cs:label`, `cs:choose`, `cs:group`, `cs:date`, `cs:layout`, `cs:macros`
* locales
* formatting, affixes, delimiter, strip-periods (mostly, anyway)
* bibliography

## Missing spec features

* names
* disambiguation
* date ranges, BC
* better number handling
* `cs:citation`
* sorting
* reference manager
* term genders
* jsdoc and documentation & examples
* test suite
