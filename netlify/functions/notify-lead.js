import { timingSafeEqual } from 'node:crypto'

function json(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }
}

function getHeader(event, name) {
  const headers = event.headers ?? {}
  const needle = name.toLowerCase()
  const match = Object.entries(headers).find(([key]) => key.toLowerCase() === needle)
  const value = match?.[1]
  return Array.isArray(value) ? value[0] : value
}

function secretsMatch(provided, expected) {
  if (!provided || !expected) return false
  const a = Buffer.from(provided)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

function parseLead(event) {
  const raw = event.isBase64Encoded
    ? Buffer.from(event.body ?? '', 'base64').toString('utf8')
    : event.body

  const payload = typeof raw === 'string' ? JSON.parse(raw) : raw
  const lead = payload?.record

  if (!lead || typeof lead !== 'object') {
    throw new Error('missing record')
  }

  return lead
}

async function sendResendEmail({ to, from, subject, text }) {
  if (!process.env.RESEND_API_KEY) throw new Error('RESEND_API_KEY is not set')
  if (!from) throw new Error('RESEND_FROM_EMAIL is not set')
  if (!to) throw new Error('LEAD_ALERT_EMAIL_TO is not set')

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to: [to], subject, text }),
  })

  if (!response.ok) {
    const detail = await response.text()
    throw new Error(`Resend ${response.status}: ${detail}`)
  }
}

function oneSignalExternalIds() {
  const fromList = (process.env.ONESIGNAL_EXTERNAL_IDS || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
  if (fromList.length) return fromList

  const fallback = (process.env.LEAD_ALERT_EMAIL_TO || '').trim()
  return fallback ? [fallback] : []
}

function oneSignalAuthHeader(apiKey) {
  const raw = String(apiKey).replace(/^(Key|Bearer)\s+/i, '').trim()
  return `Key ${raw}`
}

function maskAuthHeader(header) {
  const prefix = 'Key '
  if (!header.startsWith(prefix) || header.length <= prefix.length + 8) {
    return 'Key ***'
  }
  return `${prefix}${header.slice(prefix.length, prefix.length + 8)}…`
}

async function sendOneSignalPush({ appId, apiKey, title, message }) {
  if (!apiKey) throw new Error('ONESIGNAL_API_KEY is not set')
  if (!appId) throw new Error('ONESIGNAL_APP_ID is not set')

  const url = 'https://api.onesignal.com/notifications'
  const headers = {
    Authorization: oneSignalAuthHeader(apiKey),
    'Content-Type': 'application/json',
  }
  const payload = {
    app_id: appId,
    target_channel: 'push',
    include_aliases: { external_id: oneSignalExternalIds() },
    headings: { en: title },
    contents: { en: message },
  }

  if (!payload.include_aliases.external_id.length) {
    throw new Error('ONESIGNAL_EXTERNAL_IDS is not set')
  }

  console.log('OneSignal request:', {
    url,
    headers: {
      Authorization: maskAuthHeader(headers.Authorization),
      'Content-Type': headers['Content-Type'],
    },
    body: payload,
  })

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  })

  const raw = await response.text()
  console.log('OneSignal response:', {
    status: response.status,
    ok: response.ok,
    body: raw,
  })

  if (!response.ok) {
    throw new Error(`OneSignal ${response.status}: ${raw}`)
  }

  let parsed
  try {
    parsed = JSON.parse(raw)
  } catch {
    parsed = null
  }

  if (parsed?.errors) {
    throw new Error(`OneSignal ${response.status}: ${raw}`)
  }
}

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed' })
  }

  if (!secretsMatch(getHeader(event, 'x-webhook-secret'), process.env.WEBHOOK_SECRET)) {
    return json(401, { error: 'Unauthorized' })
  }

  let lead
  try {
    lead = parseLead(event)
  } catch {
    return json(400, { error: 'Bad payload' })
  }

  const subjectPrefix = lead.is_emergency ? '🚨 EMERGENCY LEAD' : 'New lead'
  const emailText = `${lead.name} – ${lead.phone} – ${lead.email}
Job: ${lead.job_type}
Urgency: ${lead.urgency}
Notes: ${lead.notes || '(none)'}`

  const results = await Promise.allSettled([
    sendResendEmail({
      to: process.env.LEAD_ALERT_EMAIL_TO,
      from: process.env.RESEND_FROM_EMAIL,
      subject: `${subjectPrefix}: ${lead.name} – ${lead.job_type}`,
      text: emailText,
    }),
    sendOneSignalPush({
      appId: process.env.ONESIGNAL_APP_ID || process.env.VITE_ONESIGNAL_APP_ID,
      apiKey: process.env.ONESIGNAL_API_KEY,
      title: subjectPrefix,
      message: `${lead.name} – ${lead.job_type} (${lead.phone})`,
    }),
  ])

  console.log(
    'Notify settled:',
    results.map((result, index) => ({
      channel: index === 0 ? 'resend' : 'onesignal',
      status: result.status,
      reason: result.status === 'rejected' ? result.reason?.message || String(result.reason) : undefined,
    })),
  )

  const failed = results.filter((result) => result.status === 'rejected')
  if (failed.length) {
    console.error(
      'Notify partial failure:',
      failed.map((result) => result.reason?.message || result.reason),
    )
  }

  // Still 200 — Supabase shouldn't retry-storm on a partial notify failure.
  return json(200, { ok: true })
}
