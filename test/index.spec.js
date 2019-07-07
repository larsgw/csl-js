/* eslint-env mocha */

const assert = require('assert')
const { Formatter, styles } = require('../src/')

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

const ROOT_PATH = path.join(__dirname, '../fixtures/processor-tests/humans')

describe('fixtures', function () {
  for (let fixturePath of fs.readdirSync(ROOT_PATH)) {
    const fixtureName = path.basename(fixturePath, path.extname(fixturePath))
    const fixture = parse(fs.readFileSync(path.join(ROOT_PATH, fixturePath), 'utf8'))
    if ([
      'bibentries',
      'bibsection',
      'citation-items',
      'citations'
    ].some(section => section in fixture)) continue

    it(fixtureName, function () {
      styles.add(fixtureName, fixture.csl)
      const engine = new Formatter({ style: fixtureName, lang: 'en-US', format: 'html' })
      const data = JSON.parse(fixture.input)
      const result = data.map(entry => fixture.mode === 'bibliography'
        ? engine.formatBibliography(entry)
        : engine.formatCitation(entry)).join('')
      assert.strictEqual(result, fixture.result)
    })
  }
})
