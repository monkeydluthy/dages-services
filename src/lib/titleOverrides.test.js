import assert from 'node:assert/strict'
import { test } from 'node:test'
import { normalizePath, pathOfCanonical, titleOverride } from './titleOverrides.js'

const table = { '/stump-grinding': { title: 'T', description: 'D' }, '/': { title: 'H', description: 'HD' } }

test('paths normalise the way the pod writes them', () => {
  assert.equal(normalizePath('/stump-grinding/'), '/stump-grinding')
  assert.equal(normalizePath('/stump-grinding?x=1#y'), '/stump-grinding')
  assert.equal(normalizePath(''), '/')
})

test('an entry applies, a missing one does not, a half entry never does', () => {
  assert.deepEqual(titleOverride('/stump-grinding/', table), { title: 'T', description: 'D' })
  assert.equal(titleOverride('/other', table), null)
  assert.equal(titleOverride('/x', { '/x': { title: 'only' } }), null)
})

test('canonical URLs map to their path', () => {
  assert.equal(pathOfCanonical('https://dagesservices.com/'), '/')
  assert.equal(pathOfCanonical('https://dagesservices.com/stump-grinding/'), '/stump-grinding')
  assert.equal(pathOfCanonical('not a url'), null)
})
