import { timingSafeEqual } from 'node:crypto'

export function json(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }
}

export function getHeader(event, name) {
  const headers = event.headers ?? {}
  const needle = name.toLowerCase()
  const match = Object.entries(headers).find(([key]) => key.toLowerCase() === needle)
  const value = match?.[1]
  return Array.isArray(value) ? value[0] : value
}

export function secretsMatch(provided, expected) {
  if (!provided || !expected) return false
  const a = Buffer.from(provided)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

export function webhookAuthorized(event) {
  return secretsMatch(getHeader(event, 'x-webhook-secret'), process.env.WEBHOOK_SECRET)
}

export function leadAlertUrl(leadId) {
  const base = (process.env.SITE_URL || '').replace(/\/$/, '')
  if (!base) throw new Error('SITE_URL is not set')
  const url = `${base}/admin?view=leads`
  return leadId ? `${url}&lead_id=${leadId}` : url
}

export async function sendResendEmail({ to, from, subject, text }) {
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

export async function sendOneSignalPush({ title, message, url }) {
  const apiKey = process.env.ONESIGNAL_API_KEY
  const appId = process.env.ONESIGNAL_APP_ID || process.env.VITE_ONESIGNAL_APP_ID
  if (!apiKey) throw new Error('ONESIGNAL_API_KEY is not set')
  if (!appId) throw new Error('ONESIGNAL_APP_ID is not set')

  const onesignalUrl = 'https://api.onesignal.com/notifications'
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
    url: url || leadAlertUrl(),
  }

  if (!payload.include_aliases.external_id.length) {
    throw new Error('ONESIGNAL_EXTERNAL_IDS is not set')
  }

  console.log('OneSignal request:', {
    url: onesignalUrl,
    headers: {
      Authorization: maskAuthHeader(headers.Authorization),
      'Content-Type': headers['Content-Type'],
    },
    body: payload,
  })

  const response = await fetch(onesignalUrl, {
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

export async function notifyChannels({ email, push }) {
  const results = await Promise.allSettled([
    sendResendEmail({
      to: process.env.LEAD_ALERT_EMAIL_TO,
      from: process.env.RESEND_FROM_EMAIL,
      ...email,
    }),
    sendOneSignalPush(push),
  ])

  console.log(
    'Notify settled:',
    results.map((result, index) => ({
      channel: index === 0 ? 'resend' : 'onesignal',
      status: result.status,
      reason:
        result.status === 'rejected'
          ? result.reason?.message || String(result.reason)
          : undefined,
    })),
  )

  const failed = results.filter((result) => result.status === 'rejected')
  if (failed.length) {
    console.error(
      'Notify partial failure:',
      failed.map((result) => result.reason?.message || result.reason),
    )
  }

  return { ok: true }
}
