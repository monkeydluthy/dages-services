import { randomUUID } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'
import { buildLeadRow } from '../lib/leadRow.js'
import { json } from '../lib/notify.js'

function serviceClient() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false } })
}

export default async (request) => {
  if (request.method !== 'POST') {
    return json(405, { error: 'Method not allowed' })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return json(400, { error: 'Bad payload' })
  }

  const result = buildLeadRow(body)
  if (result.error) return json(400, { error: result.error })

  const supabase = serviceClient()
  if (!supabase) {
    console.error('submit-lead: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set')
    return json(500, { error: 'Server not configured' })
  }

  const id = randomUUID()
  const { error } = await supabase.from('leads').insert({ id, ...result.row })

  if (error) {
    console.error('submit-lead insert:', error.message)
    return json(500, { error: 'Could not save lead' })
  }

  if (result.spam) {
    console.log('submit-lead filtered:', { id, reasons: result.reasons })
    // No lead_id: the thank-you page then has no photo upload, so no
    // photo_upload event or photo alert can follow a filtered lead.
    return json(200, { ok: true, filtered: true })
  }

  return json(200, { ok: true, filtered: false, lead_id: id })
}
