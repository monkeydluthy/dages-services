// Handler tests with a stubbed global fetch: nothing reaches Resend,
// OneSignal or Supabase. Each call is recorded instead.
import { test, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'

const SECRET = 'test-secret'
Object.assign(process.env, {
  WEBHOOK_SECRET: SECRET,
  SITE_URL: 'https://example.test',
  RESEND_API_KEY: 'stub',
  RESEND_FROM_EMAIL: 'alerts@example.test',
  LEAD_ALERT_EMAIL_TO: 'owner@example.test',
  ONESIGNAL_API_KEY: 'stub',
  ONESIGNAL_APP_ID: 'stub',
  SUPABASE_URL: 'https://stub.supabase.test',
  SUPABASE_SERVICE_ROLE_KEY: 'stub',
})

const realFetch = globalThis.fetch
let calls
let dbLead

beforeEach(() => {
  calls = []
  dbLead = null
  globalThis.fetch = async (input, init = {}) => {
    const url = typeof input === 'string' ? input : input.url
    const method = init.method || input.method || 'GET'
    const body = init.body ? JSON.parse(init.body) : null
    calls.push({ url, method, body })
    if (url.includes('stub.supabase.test') && method === 'GET') {
      return new Response(JSON.stringify(dbLead), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }
    if (url.includes('stub.supabase.test')) {
      return new Response(null, { status: 201 })
    }
    return new Response(JSON.stringify({ id: 'stub' }), { status: 200 })
  }
})
afterEach(() => {
  globalThis.fetch = realFetch
})

function post(body, headers = {}) {
  return new Request('https://example.test/fn', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  })
}
const external = () => calls.filter((c) => /resend|onesignal/.test(c.url))

const { default: notifyLead } = await import('../netlify/functions/notify-lead.js')
const { default: submitLead } = await import('../netlify/functions/submit-lead.js')
const { default: reviewRequest } = await import('../netlify/functions/send-review-request.js')
const { default: photosAdded } = await import('../netlify/functions/notify-photos-added.js')

const lead = {
  id: '11111111-1111-4111-8111-111111111111',
  name: 'Pat Rivera',
  phone: '(813) 555-0142',
  email: 'pat@example.com',
  job_type: 'Tree removal',
  urgency: 'This week',
  notes: 'Oak leaning on garage',
}

test('notify-lead exits early on a spam row: no email, no push', async () => {
  const res = await notifyLead(post({ record: { ...lead, status: 'spam' } }, { 'x-webhook-secret': SECRET }))
  assert.equal(res.status, 200)
  assert.deepEqual(await res.json(), { ok: true, skipped: 'spam' })
  assert.equal(calls.length, 0)
})

test('notify-lead still notifies on a normal row (stubbed, nothing sent)', async () => {
  const res = await notifyLead(post({ record: { ...lead, status: 'new' } }, { 'x-webhook-secret': SECRET }))
  assert.equal(res.status, 200)
  assert.equal(external().length, 2)
})

test('submit-lead: spam is saved as status spam, returns filtered without lead_id', async () => {
  const res = await submitLead(post({ ...lead, contact_pref: 'bot', is_emergency: true, elapsedMs: 9000 }))
  const json = await res.json()
  assert.equal(res.status, 200)
  assert.deepEqual(json, { ok: true, filtered: true })
  const insert = calls.find((c) => c.method === 'POST' && c.url.includes('/rest/v1/leads'))
  assert.equal(insert.body.status, 'spam')
  assert.equal(insert.body.is_emergency, false)
  assert.equal(external().length, 0)
})

test('submit-lead: normal lead returns filtered false and a lead_id', async () => {
  const res = await submitLead(post({ ...lead, contact_pref: '', elapsedMs: 40000 }))
  const json = await res.json()
  assert.equal(json.filtered, false)
  assert.match(json.lead_id, /^[0-9a-f-]{36}$/)
  const insert = calls.find((c) => c.method === 'POST' && c.url.includes('/rest/v1/leads'))
  assert.equal('status' in insert.body, false)
})

test('submit-lead: invalid payload is rejected with no insert', async () => {
  const res = await submitLead(post({ name: 'x' }))
  assert.equal(res.status, 400)
  assert.equal(calls.length, 0)
})

test('send-review-request skips a spam row moved to closed', async () => {
  const res = await reviewRequest(
    post({ record: { ...lead, status: 'closed' }, old_record: { ...lead, status: 'spam' } }, { 'x-webhook-secret': SECRET }),
  )
  assert.deepEqual(await res.json(), { ok: true, skipped: 'spam' })
  assert.equal(calls.length, 0)
})

test('notify-photos-added skips a spam lead', async () => {
  dbLead = { ...lead, status: 'spam', photo_urls: ['https://x/a.jpg'] }
  const res = await photosAdded(post({ lead_id: lead.id, urls: ['https://x/a.jpg'], added_count: 1 }))
  assert.deepEqual(await res.json(), { ok: true, skipped: 'spam' })
  assert.equal(external().length, 0)
})
