import {
  json,
  leadAlertUrl,
  notifyChannels,
  webhookAuthorized,
} from '../lib/notify.js'

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

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed' })
  }

  if (!webhookAuthorized(event)) {
    return json(401, { error: 'Unauthorized' })
  }

  let lead
  try {
    lead = parseLead(event)
  } catch {
    return json(400, { error: 'Bad payload' })
  }

  const subjectPrefix = lead.is_emergency ? '🚨 EMERGENCY LEAD' : 'New lead'

  await notifyChannels({
    email: {
      subject: `${subjectPrefix}: ${lead.name} – ${lead.job_type}`,
      text: `${lead.name} – ${lead.phone} – ${lead.email}
Job: ${lead.job_type}
Urgency: ${lead.urgency}
Notes: ${lead.notes || '(none)'}`,
    },
    push: {
      title: subjectPrefix,
      message: `${lead.name} – ${lead.job_type} (${lead.phone})`,
      url: leadAlertUrl(lead.id),
    },
  })

  return json(200, { ok: true })
}
