import { createClient } from '@supabase/supabase-js'
import {
  json,
  leadAlertUrl,
  notifyChannels,
  webhookAuthorized,
} from '../lib/notify.js'

function parseBody(event) {
  const raw = event.isBase64Encoded
    ? Buffer.from(event.body ?? '', 'base64').toString('utf8')
    : event.body

  const payload = typeof raw === 'string' ? JSON.parse(raw || '{}') : raw
  if (!payload?.lead_id) {
    throw new Error('missing lead_id')
  }
  return payload
}

function serviceClient() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false } })
}

async function loadLead(leadId) {
  const supabase = serviceClient()
  if (!supabase) return null

  const { data, error } = await supabase
    .from('leads')
    .select('id, name, job_type, phone, photo_urls')
    .eq('id', leadId)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed' })
  }

  if (!webhookAuthorized(event)) {
    return json(401, { error: 'Unauthorized' })
  }

  let payload
  try {
    payload = parseBody(event)
  } catch {
    return json(400, { error: 'Bad payload' })
  }

  let name = payload.name
  let jobType = payload.job_type
  let phone = payload.phone
  let photoCount = Number(payload.photo_count) || 0
  const addedCount = Number(payload.added_count) || 0

  if (!name || !jobType) {
    try {
      const lead = await loadLead(payload.lead_id)
      if (!lead) {
        return json(404, { error: 'lead not found' })
      }
      name = name || lead.name
      jobType = jobType || lead.job_type
      phone = phone || lead.phone
      if (!photoCount) photoCount = lead.photo_urls?.length || 0
    } catch (error) {
      console.error('notify-photos-added lookup:', error.message)
      return json(502, { error: 'lookup failed' })
    }
  }

  const addedLabel = addedCount > 0 ? addedCount : photoCount
  const subject = `📷 Photos added — ${name}, ${jobType}`

  await notifyChannels({
    email: {
      subject,
      text: `${name} added ${addedLabel} photo(s) after submitting a ${jobType} request.
Phone: ${phone || '(none)'}
Total photos on this lead: ${photoCount || addedLabel}`,
    },
    push: {
      title: '📷 Photos added',
      message: `${name} – ${jobType} (${addedLabel} new)`,
      url: leadAlertUrl(payload.lead_id),
    },
  })

  return json(200, { ok: true })
}
