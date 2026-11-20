import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { buildLeadJobTypes, isValidJobType } from './jobTypes.js'

const siteConfig = JSON.parse(
  readFileSync(new URL('../config/siteConfig.json', import.meta.url), 'utf8'),
)
const allowed = buildLeadJobTypes(siteConfig.services)

const EXISTING = [
  'Tree removal',
  'Tree trimming',
  'Stump grinding',
  'Deadwooding',
  'Storm cleanup',
  'Hazardous removal',
  'Crane removal',
  'Lot clearing',
]

test('existing values still pass, in their original order', () => {
  for (const value of EXISTING) assert.ok(isValidJobType(value, allowed), value)
  assert.deepEqual(allowed.slice(0, EXISTING.length), EXISTING)
})

test('each new value passes', () => {
  for (const value of ['Cabling & bracing', 'Planting / transplanting', 'Other']) {
    assert.ok(isValidJobType(value, allowed), value)
  }
})

test('new values come after existing ones, with Other last', () => {
  assert.deepEqual(allowed.slice(EXISTING.length), [
    'Cabling & bracing',
    'Planting / transplanting',
    'Other',
  ])
})

test('unknown and malformed values fail', () => {
  for (const value of ['Pressure washing', 'other', 'Cabling and bracing', '', ' Other', null, undefined, 42]) {
    assert.equal(isValidJobType(value, allowed), false, String(value))
  }
})
