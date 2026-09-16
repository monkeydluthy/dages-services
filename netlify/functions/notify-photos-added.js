import { createClient } from '@supabase/supabase-js'
import {
  json,
  leadAlertUrl,
  notifyChannels,
  photoNotifyAuthorized,
  webhookAuthorized,
} from '../lib/notify.js'

function photosBelongToLead(lead, urls) {
  if (!lead || !Array.isArray(urls) || urls.length === 0) return false
  const have = new Set(lead.photo_urls || [])
  return urls.every((url) => typeof url === 'string' && url.length > 0 && have.has(url))
}

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

  let payload
  try {
    payload = parseBody(event)
  } catch {
    return json(400, { error: 'Bad payload' })
  }

  let lead = null
  try {
    lead = await loadLead(payload.lead_id)
  } catch (error) {
    console.error('notify-photos-added lookup:', error.message)
  }

  const allowed =
    webhookAuthorized(event) ||
    photoNotifyAuthorized(payload) ||
    photosBelongToLead(lead, payload.urls)

  if (!allowed) {
    return json(401, { error: 'Unauthorized' })
  }

  const name = payload.name || lead?.name
  const jobType = payload.job_type || lead?.job_type
  const phone = payload.phone || lead?.phone
  const photoCount = Number(payload.photo_count) || lead?.photo_urls?.length || 0
  const addedCount = Number(payload.added_count) || payload.urls?.length || 0

  if (!name || !jobType) {
    return json(404, { error: 'lead not found' })
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
