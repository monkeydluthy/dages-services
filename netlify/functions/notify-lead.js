import {
  json,
  leadAlertUrl,
  notifyChannels,
  webhookAuthorized,
} from '../lib/notify.js'

async function parseLead(request) {
  const payload = await request.json()
  const lead = payload?.record

  if (!lead || typeof lead !== 'object') {
    throw new Error('missing record')
  }

  return lead
}

export default async (request) => {
  if (request.method !== 'POST') {
    return json(405, { error: 'Method not allowed' })
  }

  if (!webhookAuthorized(request)) {
    return json(401, { error: 'Unauthorized' })
  }

  let lead
  try {
    lead = await parseLead(request)
  } catch {
    return json(400, { error: 'Bad payload' })
  }

  const subjectPrefix = lead.is_emergency ? '🚨 EMERGENCY LEAD' : 'New lead'
  const display = (value) =>
    value && String(value).trim() ? String(value).trim() : '(none)'

  await notifyChannels({
    email: {
      subject: `${subjectPrefix}: ${lead.name} – ${lead.job_type}`,
      text: `${lead.name} – ${lead.phone} – ${lead.email}
Job: ${lead.job_type}
Urgency: ${lead.urgency}
Address: ${display(lead.address)}
Notes: ${lead.notes || '(none)'}
Source: ${display(lead.utm_source)} / ${display(lead.utm_medium)} / ${display(lead.utm_campaign)}
Referrer: ${display(lead.referrer)}
Landing page: ${display(lead.landing_path)}`,
    },
    push: {
      title: subjectPrefix,
      message: `${lead.name} – ${lead.job_type} (${lead.phone})`,
      url: leadAlertUrl(lead.id),
    },
  })

  return json(200, { ok: true })
}
