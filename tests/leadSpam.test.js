import { test } from 'node:test'
import assert from 'node:assert/strict'
import { classifyLead, SPAM_PHRASES, SPAM_SENDERS, isSpamRecord } from '../netlify/lib/leadSpam.js'
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

const pitch1 = {
  ...normal,
  email: 'matthew@automaxrevenue.com',
  phone: '(813) 555-0199',
  urgency: 'Emergency',
  is_emergency: true,
  notes: "Hi, it's Matthew again. Our 24/7 receptionist answers every call. Reply to matthew@automaxrevenue.com",
}

test('pitch with receptionist, email in notes and Emergency urgency is spam, never emergency', () => {
  const r = classifyLead(pitch1)
  assert.equal(r.spam, true)
  for (const reason of ['sender', 'notes:email', 'notes:phrase:receptionist']) {
    assert.ok(r.reasons.includes(reason), reason)
  }
  const { row } = buildLeadRow(pitch1)
  assert.equal(row.status, 'spam')
  assert.equal(row.is_emergency, false)
})

test('"checking in one more time ... video" pitch with an email in notes is spam', () => {
  const r = classifyLead({
    ...normal,
    urgency: 'Emergency',
    notes: 'Just checking in one more time. Want a 5-minute video? Write me at sales@some-agency.io',
  })
  assert.equal(r.spam, true)
  assert.ok(r.reasons.includes('notes:email'))
})

test('magazine advertising pitch with a link is spam', () => {
  const r = classifyLead({ ...normal, notes: 'Advertise in our local magazine, see https://mag.example/rates' })
  assert.ok(r.reasons.includes('notes:url'))
})

test('blocklisted sender is spam even with an empty note', () => {
  const r = classifyLead({ ...normal, email: 'vkdesignsandprints@gmail.com', notes: '' })
  assert.deepEqual(r.reasons, ['sender'])
  assert.ok(classifyLead({ ...normal, email: 'MATTHEW@AutomaxRevenue.com', notes: '' }).spam)
  assert.ok(classifyLead({ ...normal, email: 'anyone@automaxrevenue.com', notes: '' }).spam)
  assert.ok(classifyLead({ ...normal, phone: '(478) 606-2782', notes: '' }).spam)
  assert.ok(classifyLead({ ...normal, phone: '863.346.3121', notes: '' }).spam)
  assert.deepEqual(SPAM_SENDERS.phones, ['4786062782', '8633463121'])
})

test('new phrases are whole-word and "retainer" does not match "retaining"', () => {
  assert.ok(classifyLead({ ...normal, notes: 'No Results, No Charge guarantee' }).spam)
  assert.equal(classifyLead({ ...normal, notes: 'Need a retaining wall cleared of a stump' }).spam, false)
})

test('real customer messages pass', () => {
  for (const notes of [
    'Big oak leaning toward the garage, call me at 813-555-0142 after 5',
    'Tree fell on the fence, need someone today',
    'Looking at removing 3 pines next month',
  ]) {
    assert.deepEqual(classifyLead({ ...normal, notes }), { spam: false, reasons: [] }, notes)
  }
})
