import { createClient } from '@supabase/supabase-js'
import { json, webhookAuthorized } from '../lib/notify.js'

const TEST_LEAD_ID = 'f8b1dd76-2f98-4cdc-9f25-6ee403085ca1'
const TEST_EMAIL = 'luthdigitalconsult@gmail.com'

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

  if (!webhookAuthorized(request)) {
    return json(401, { error: 'Unauthorized' })
  }

  const supabase = serviceClient()
  if (!supabase) {
    return json(500, { error: 'Supabase service client is not configured' })
  }

  const { data, error } = await supabase
    .from('leads')
    .delete()
    .eq('id', TEST_LEAD_ID)
    .eq('email', TEST_EMAIL)
    .select('id')
    .maybeSingle()

  if (error) {
    console.error('purge-review-test-lead failed', error.message)
    return json(500, { error: 'Delete failed' })
  }

  return json(200, { ok: true, deleted: Boolean(data?.id) })
}
