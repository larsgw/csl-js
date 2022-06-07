/* eslint-env mocha */
/* global fetch */

require('isomorphic-fetch')

const assert = require('assert')
const { Formatter, styles, locales } = require('../src/')

const fs = require('fs')
const path = require('path')

function parse (text) {
  const fixture = {}
  const regex = />>=====? ([A-Z-]+) =====?>>([\s\S]*?)<<=====? \1 =====?<</g

  let section
  /* eslint-disable */
  while (section = regex.exec(text)) {
    const [, name, value] = section
    fixture[name.toLowerCase()] = value.trim()
  }
  /* eslint-enable */

  return fixture
}

function format (formatter, mode, data) {
  return formatter.formatNew(data, mode)
}

const ROOT_PATH = path.join(__dirname, '../fixtures/processor-tests/humans')

const FORBIDDEN_SECTIONS = ['bibentries', 'bibsection', 'citation-items', 'citations']
const ALLOWED_MODES = ['bibliography', 'citation']

describe('fixtures', function () {
  before('loading locale', async function () {
    locales.set('en-US', await (await fetch('https://cdn.jsdelivr.net/gh/citation-style-language/locales@master/locales-en-US.xml')).text())
  })

  for (const fixturePath of fs.readdirSync(ROOT_PATH)) {
    const fixtureName = path.basename(fixturePath, path.extname(fixturePath))

    it(fixtureName, function () {
      const fixture = parse(fs.readFileSync(path.join(ROOT_PATH, fixturePath), 'utf8'))

      if (FORBIDDEN_SECTIONS.some(section => section in fixture)) {
        this.skip()
      } else if (!ALLOWED_MODES.includes(fixture.mode)) {
        this.skip()
      }

      styles.set(fixtureName, fixture.csl)
      const engine = new Formatter({ style: fixtureName, format: 'html' })
      const result = format(engine, fixture.mode, JSON.parse(fixture.input))
      assert.strictEqual(result, fixture.result)
    })
  }
})
