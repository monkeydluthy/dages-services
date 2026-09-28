import { createSign } from 'node:crypto'

const TOKEN_URL = 'https://oauth2.googleapis.com/token'

function base64UrlJson(value) {
  return Buffer.from(JSON.stringify(value)).toString('base64url')
}

function parseServiceAccount() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
  if (!raw) throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON is not set')
  const credentials = JSON.parse(raw)
  if (!credentials?.client_email || !credentials?.private_key) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON is missing client_email or private_key')
  }
  return credentials
}

function signJwt(credentials, scope) {
  const now = Math.floor(Date.now() / 1000)
  const unsigned = `${base64UrlJson({ alg: 'RS256', typ: 'JWT' })}.${base64UrlJson({
    iss: credentials.client_email,
    scope,
    aud: credentials.token_uri || TOKEN_URL,
    iat: now,
    exp: now + 3600,
  })}`
  const signer = createSign('RSA-SHA256')
  signer.update(unsigned)
  return `${unsigned}.${signer.sign(credentials.private_key, 'base64url')}`
}

export async function googleAccessToken(scope, timeoutMs = 8000) {
  const credentials = parseServiceAccount()
  const assertion = signJwt(credentials, scope)
  const response = await fetch(credentials.token_uri || TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
    signal: AbortSignal.timeout(timeoutMs),
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok || !payload.access_token) {
    throw new Error(`Google token ${response.status}: ${payload.error || 'no access_token'}`)
  }
  return payload.access_token
}

export async function googleJson(url, accessToken, { method = 'GET', body, timeoutMs = 12000 } = {}) {
  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(timeoutMs),
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    const message = payload.error?.message || payload.error || response.status
    throw new Error(`${method} ${url} → ${message}`)
  }
  return payload
}
