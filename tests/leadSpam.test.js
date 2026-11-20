import { test } from 'node:test'
import assert from 'node:assert/strict'
import { classifyLead, SPAM_PHRASES, isSpamRecord } from '../netlify/lib/leadSpam.js'
import { buildLeadRow } from '../netlify/lib/leadRow.js'

const normal = {
  name: 'Pat Rivera',
  phone: '(813) 555-0142',
  email: 'pat@example.com',
  job_type: 'Tree removal',
  urgency: 'This week',
  notes: 'Big oak leaning toward the garage after the storm. Can you take a look Thursday?',
  contact_pref: '',
  elapsedMs: 48000,
}

test('honeypot filled is spam', () => {
  const r = classifyLead({ ...normal, contact_pref: 'email me' })
  assert.equal(r.spam, true)
  assert.deepEqual(r.reasons, ['honeypot'])
})

test('under 3 seconds is spam; exactly 3000 ms is not', () => {
  assert.deepEqual(classifyLead({ ...normal, elapsedMs: 1200 }).reasons, ['too_fast'])
  assert.equal(classifyLead({ ...normal, elapsedMs: 2999 }).spam, true)
  assert.equal(classifyLead({ ...normal, elapsedMs: 3000 }).spam, false)
})

test('missing elapsedMs is not flagged on timing alone', () => {
  for (const elapsedMs of [undefined, null, '', 'abc']) {
    assert.equal(classifyLead({ ...normal, elapsedMs }).spam, false, String(elapsedMs))
  }
})

test('URLs in notes or job type are spam', () => {
  for (const notes of ['see http://x.io', 'HTTPS://example.com now', 'visit www.example.com']) {
    assert.ok(classifyLead({ ...normal, notes }).reasons.includes('notes:url'), notes)
  }
  assert.ok(classifyLead({ ...normal, job_type: 'https://spam.io' }).reasons.includes('job_type:url'))
})

test('every listed phrase is caught, whole-word and case-insensitive', () => {
  for (const phrase of SPAM_PHRASES) {
    const r = classifyLead({ ...normal, notes: `We offer ${phrase.toUpperCase()} services.` })
    assert.ok(r.reasons.includes(`notes:phrase:${phrase}`), phrase)
  }
  assert.ok(classifyLead({ ...normal, notes: 'first  page\nof google' }).spam)
  assert.ok(classifyLead({ ...normal, job_type: 'SEO' }).spam)
})

test('bare "marketing" is not listed, but marketing phrases still are', () => {
  assert.equal(SPAM_PHRASES.includes('marketing'), false)
  assert.equal(classifyLead({ ...normal, notes: 'marketing the house next month' }).spam, false)
  assert.ok(
    classifyLead({ ...normal, notes: 'We offer digital marketing services' }).reasons.includes(
      'notes:phrase:digital marketing',
    ),
  )
  assert.ok(classifyLead({ ...normal, notes: 'Social Media Marketing packages' }).spam)
})

test('substrings of listed words do not trigger (whole-word only)', () => {
  for (const notes of ['Tree near the Seoul Ave mailbox', 'cryptomeria hedge needs trimming', 'supermarket plaza lot']) {
    assert.equal(classifyLead({ ...normal, notes }).spam, false, notes)
  }
})

test('a normal customer message passes', () => {
  assert.deepEqual(classifyLead(normal), { spam: false, reasons: [] })
  assert.deepEqual(
    classifyLead({ ...normal, notes: 'We are marketing the house next month, need the oak down first.' }),
    { spam: false, reasons: [] },
  )
  assert.equal(classifyLead({ ...normal, notes: null }).spam, false)
})

test('spam row is saved as status spam and never as emergency', () => {
  const { row, spam } = buildLeadRow({ ...normal, contact_pref: 'x', is_emergency: true })
  assert.equal(spam, true)
  assert.equal(row.status, 'spam')
  assert.equal(row.is_emergency, false)
})

test('normal row keeps default status and the client emergency flag', () => {
  const { row, spam } = buildLeadRow({ ...normal, is_emergency: true })
  assert.equal(spam, false)
  assert.equal('status' in row, false)
  assert.equal(row.is_emergency, true)
  assert.equal('contact_pref' in row, false)
  assert.equal('elapsedMs' in row, false)
})

test('invalid payloads are rejected before any insert', () => {
  assert.ok(buildLeadRow(null).error)
  assert.ok(buildLeadRow({ ...normal, phone: '12' }).error)
  assert.ok(buildLeadRow({ ...normal, name: '' }).error)
})

test('isSpamRecord', () => {
  assert.equal(isSpamRecord({ status: 'spam' }), true)
  assert.equal(isSpamRecord({ status: 'new' }), false)
  assert.equal(isSpamRecord(null), false)
})
