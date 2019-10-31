/* eslint-env mocha */

require('isomorphic-fetch')

const assert = require('assert')
const { Formatter, styles, locales } = require('../src/')

const fs = require('fs')
const path = require('path')

function parse (text) {
  const fixture = {}
  const regex = />>=====? ([A-Z-]+) =====?>>([\s\S]*?)<<=====? \1 =====?<</g


  let section
  while (section = regex.exec(text)) {
    const [, name, value] = section
    fixture[name.toLowerCase()] = value.trim()
  }

  return fixture
}

function format (formatter, mode, data) {
  return formatter.formatNew(data, mode)
}

const ROOT_PATH = path.join(__dirname, '../fixtures/processor-tests/humans')

describe('fixtures', function () {
  before('loading locale', async function() {
    locales.add('en-US', await (await fetch('https://cdn.jsdelivr.net/gh/citation-style-language/locales@master/locales-en-US.xml')).text())
  })

  for (let fixturePath of fs.readdirSync(ROOT_PATH)) {
    const fixtureName = path.basename(fixturePath, path.extname(fixturePath))
    const fixture = parse(fs.readFileSync(path.join(ROOT_PATH, fixturePath), 'utf8'))

    if ([
      'bibentries',
      'bibsection',
      'citation-items',
      'citations'
    ].some(section => section in fixture)) continue
    else if (!['bibliography', 'citation'].includes(fixture.mode)) continue

    it(fixtureName, function () {
      styles.add(fixtureName, fixture.csl)
      const engine = new Formatter({ style: fixtureName, format: 'html' })
      const result = format(engine, fixture.mode, JSON.parse(fixture.input))
      assert.strictEqual(result, fixture.result)
    })
  }
})
