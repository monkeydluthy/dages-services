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
  return (
    String(name || '')
      .trim()
      .split(/\s+/)
      .find(Boolean) || ''
  )
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
  const subject = name ? `Thanks, ${name} — how did we do?` : 'Thanks — how did we do?'
  const reviewUrl = WRITE_REVIEW_URL
  const font =
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
  const preheader =
    'Thanks for letting us take care of your tree work. Honest feedback of any kind is welcome.'
  const text = `Thanks for letting us take care of your tree work. A Google review helps other homeowners around Plant City find us, and honest feedback of any kind is welcome. It takes about a minute.

Leave a Google review:
${reviewUrl}

If something wasn’t right, call us at (813) 716-9436 so we can try to fix it.

Joseph, Dages Services · (813) 716-9436 · dagesservices.com`
  const html = `<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>${escapeHtml(subject)}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    :root { color-scheme: light dark; supported-color-schemes: light dark; }
    @media (prefers-color-scheme: dark) {
      .bg-page { background-color: #111111 !important; }
      .bg-card { background-color: #1c1c1c !important; }
      .text-body { color: #f3f3f3 !important; }
      .text-muted { color: #d0d0d0 !important; }
      .text-link { color: #8fceaa !important; }
    }
  </style>
</head>
<body class="bg-page" style="margin:0;padding:0;background-color:#E8F2EC;font-family:${font};">
  <div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:yes;">
    ${escapeHtml(preheader)}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" class="bg-page" style="background-color:#E8F2EC;">
    <tr>
      <td align="center" style="padding:24px 12px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:100%;max-width:600px;">
          <tr>
            <td bgcolor="#1F5133" style="background-color:#1F5133;padding:22px 28px;font-family:${font};font-size:20px;font-weight:700;line-height:1.3;color:#ffffff;">
              Dages Services
            </td>
          </tr>
          <tr>
            <td class="bg-card text-body" bgcolor="#ffffff" style="background-color:#ffffff;padding:32px 28px 16px;font-family:${font};font-size:16px;line-height:1.6;color:#1A1816;">
              Thanks for letting us take care of your tree work. A Google review helps other homeowners around Plant City find us, and honest feedback of any kind is welcome. It takes about a minute.
            </td>
          </tr>
          <tr>
            <td class="bg-card" bgcolor="#ffffff" align="center" style="background-color:#ffffff;padding:8px 28px 28px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" bgcolor="#1F5133" style="background-color:#1F5133;border-radius:8px;">
                    <!--[if mso]>
                    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${reviewUrl}" style="height:48px;v-text-anchor:middle;width:260px;" arcsize="17%" stroke="f" fillcolor="#1F5133">
                      <w:anchorlock/>
                      <center style="color:#ffffff;font-family:sans-serif;font-size:16px;font-weight:bold;">Leave a Google review</center>
                    </v:roundrect>
                    <![endif]-->
                    <!--[if !mso]><!-->
                    <a href="${reviewUrl}" style="display:inline-block;background-color:#1F5133;border-radius:8px;color:#ffffff;font-family:${font};font-size:16px;font-weight:700;line-height:48px;text-align:center;text-decoration:none;padding:0 28px;mso-hide:all;">Leave a Google review</a>
                    <!--<![endif]-->
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td class="bg-card text-muted" bgcolor="#ffffff" style="background-color:#ffffff;padding:0 28px 28px;font-family:${font};font-size:15px;line-height:1.6;color:#4a4a4a;">
              If something wasn’t right, call us at <a class="text-link" href="tel:+18137169436" style="color:#1F5133;text-decoration:underline;">(813) 716-9436</a> so we can try to fix it.
            </td>
          </tr>
          <tr>
            <td class="bg-card text-muted" bgcolor="#ffffff" style="background-color:#ffffff;padding:0 28px 32px;font-family:${font};font-size:14px;line-height:1.6;color:#4a4a4a;">
              Joseph, Dages Services · <a class="text-link" href="tel:+18137169436" style="color:#1F5133;text-decoration:underline;">(813) 716-9436</a> · <a class="text-link" href="https://dagesservices.com" style="color:#1F5133;text-decoration:underline;">dagesservices.com</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
  return { subject, text, html }
}

export { reviewCopy }

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
