import { createClient } from '@supabase/supabase-js'
import { json, sendResendEmail, webhookAuthorized } from '../lib/notify.js'

const WRITE_REVIEW_URL =
  process.env.GOOGLE_WRITE_REVIEW_URL ||
  (process.env.GOOGLE_PLACE_ID
    ? `https://search.google.com/local/writereview?placeid=${process.env.GOOGLE_PLACE_ID}`
    : 'https://search.google.com/local/writereview?placeid=ChIJRw7C8K0z3YgRnjTrItZ1M2g')

function serviceClient() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false } })
}

function firstName(name) {
  const part = String(name || '')
    .trim()
    .split(/\s+/)
    .find(Boolean)
  return part || 'there'
}

function jobPhrase(jobType) {
  const raw = String(jobType || '').trim()
  if (!raw) return 'the work'
  return raw.charAt(0).toLowerCase() + raw.slice(1)
}

function isClosed(status) {
  return String(status || '').trim().toLowerCase() === 'closed'
}

function becameClosed(record, oldRecord) {
  if (!isClosed(record?.status)) return false
  if (!oldRecord || typeof oldRecord !== 'object') return true
  return !isClosed(oldRecord.status)
}

async function parseLead(request) {
  const payload = await request.json()
  const lead = payload?.record
  if (!lead || typeof lead !== 'object') {
    throw new Error('missing record')
  }
  return { lead, oldRecord: payload?.old_record }
}

function reviewCopy(lead) {
  const name = firstName(lead.name)
  const job = jobPhrase(lead.job_type)
  const subject = `${name}, could you review the ${job} on Google?`
  const text = `Hi ${name},

Thanks for having Dages Services out for the ${job}. If you have a minute, a Google review helps other neighbors find us:

${WRITE_REVIEW_URL}

— Joseph
Dages Services, LLC`
  const html = `<p>Hi ${escapeHtml(name)},</p>
<p>Thanks for having Dages Services out for the ${escapeHtml(job)}. If you have a minute, a Google review helps other neighbors find us:</p>
<p><a href="${WRITE_REVIEW_URL}">Leave a Google review</a></p>
<p>— Joseph<br>Dages Services, LLC</p>`
  return { subject, text, html }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

async function claimReviewRequest(leadId) {
  const supabase = serviceClient()
  if (!supabase) {
    throw new Error('Supabase service client is not configured')
  }

  const { data, error } = await supabase
    .from('leads')
    .update({ review_requested_at: new Date().toISOString() })
    .eq('id', leadId)
    .eq('status', 'closed')
    .is('review_requested_at', null)
    .select('id')
    .maybeSingle()

  if (error) throw error
  return Boolean(data?.id)
}

export default async (request) => {
  if (request.method !== 'POST') {
    return json(405, { error: 'Method not allowed' })
  }

  if (!webhookAuthorized(request)) {
    return json(401, { error: 'Unauthorized' })
  }

  let lead
  let oldRecord
  try {
    ;({ lead, oldRecord } = await parseLead(request))
  } catch {
    return json(400, { error: 'Bad payload' })
  }

  if (!becameClosed(lead, oldRecord)) {
    console.log('review-request skip: not a close', lead.id, lead.status)
    return json(200, { ok: true, skipped: 'not_closed' })
  }

  const to = String(lead.email || '').trim()
  if (!to) {
    console.error('review-request skip: missing email', lead.id)
    return json(200, { ok: true, skipped: 'missing_email' })
  }

  let claimed = false
  try {
    claimed = await claimReviewRequest(lead.id)
  } catch (error) {
    console.error('review-request claim failed', lead.id, error.message)
    return json(200, { ok: true, skipped: 'claim_failed' })
  }

  if (!claimed) {
    console.log('review-request skip: already sent', lead.id)
    return json(200, { ok: true, skipped: 'already_sent' })
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL
  const from = fromEmail?.includes('<')
    ? fromEmail
    : `Dages Services <${fromEmail}>`

  try {
    const { subject, text, html } = reviewCopy(lead)
    await sendResendEmail({ to, from, subject, text, html })
    console.log('review-request sent', lead.id)
    return json(200, { ok: true, sent: true })
  } catch (error) {
    console.error('review-request send failed', lead.id, error.message)
    return json(200, { ok: true, sent: false })
  }
}
