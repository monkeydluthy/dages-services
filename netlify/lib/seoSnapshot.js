import { googleAccessToken, googleJson } from './googleServiceAccount.js'
import { SEARCH_CONSOLE_TARGET_QUERIES } from './seoTargetQueries.js'

const SITE_URL = (process.env.SITE_URL || 'https://dagesservices.com').replace(/\/$/, '')
const PAGESPEED_URL = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed'
const WEBMASTERS_SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly'
const GBP_SCOPE = 'https://www.googleapis.com/auth/business.manage'
const IMPRESSION_METRICS = [
  'BUSINESS_IMPRESSIONS_DESKTOP_MAPS',
  'BUSINESS_IMPRESSIONS_DESKTOP_SEARCH',
  'BUSINESS_IMPRESSIONS_MOBILE_MAPS',
  'BUSINESS_IMPRESSIONS_MOBILE_SEARCH',
]

function ymdUtc(date) {
  return date.toISOString().slice(0, 10)
}

function datePartsUtc(date) {
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  }
}

function daysAgo(days) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000)
}

function supabaseConfig() {
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').replace(/\/$/, '')
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')
  return { url, key }
}

async function runNamed(name, fn, failures) {
  try {
    return await fn()
  } catch (error) {
    failures.push(name)
    console.error(`seo-snapshot ${name} failed:`, error.message)
    return null
  }
}

async function fetchLeadsLast7d() {
  const { url, key } = supabaseConfig()
  const since = daysAgo(7).toISOString()
  const response = await fetch(
    `${url}/rest/v1/leads?select=id&created_at=gte.${encodeURIComponent(since)}`,
    {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        Prefer: 'count=exact',
        Range: '0-0',
      },
      signal: AbortSignal.timeout(8000),
    },
  )
  if (!response.ok) throw new Error(`leads count HTTP ${response.status}`)
  const range = response.headers.get('content-range')
  const total = range?.split('/')[1]
  if (total == null || total === '*') throw new Error('leads count missing content-range')
  return Number(total)
}

function extractPageSpeed(data) {
  const score = data?.lighthouseResult?.categories?.performance?.score
  const lcp = data?.lighthouseResult?.audits?.['largest-contentful-paint']?.numericValue
  return {
    performance: typeof score === 'number' ? Math.round(score * 100) : null,
    lcpMs: typeof lcp === 'number' ? Math.round(lcp) : null,
  }
}

async function fetchPageSpeed(strategy) {
  const key = process.env.PAGESPEED_API_KEY
  if (!key) throw new Error('PAGESPEED_API_KEY is not set')
  const params = new URLSearchParams({
    url: SITE_URL,
    strategy,
    category: 'performance',
    key,
  })
  const response = await fetch(`${PAGESPEED_URL}?${params}`, {
    signal: AbortSignal.timeout(28000),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(`PageSpeed ${strategy} HTTP ${response.status}`)
  }
  if (!data.lighthouseResult) {
    throw new Error(`PageSpeed ${strategy}: no lighthouseResult`)
  }
  return extractPageSpeed(data)
}

function encodeSiteUrl(siteUrl) {
  return encodeURIComponent(siteUrl)
}

async function resolveSearchConsoleSite(token) {
  const data = await googleJson('https://www.googleapis.com/webmasters/v3/sites', token, {
    timeoutMs: 8000,
  })
  const sites = data.siteEntry || []
  const host = 'dagesservices.com'
  const match =
    sites.find((site) => site.siteUrl === `sc-domain:${host}`) ||
    sites.find((site) => site.siteUrl === `${SITE_URL}/`) ||
    sites.find((site) => site.siteUrl === SITE_URL) ||
    sites.find((site) => String(site.siteUrl).includes(host))
  if (!match?.siteUrl) {
    throw new Error('Search Console: dagesservices.com is not in the site list')
  }
  return match.siteUrl
}

async function fetchIndexedPages(token, siteUrl) {
  const data = await googleJson(
    `https://www.googleapis.com/webmasters/v3/sites/${encodeSiteUrl(siteUrl)}/sitemaps`,
    token,
    { timeoutMs: 8000 },
  )
  const sitemaps = data.sitemap || []
  let indexed = 0
  let sawCount = false
  for (const sitemap of sitemaps) {
    for (const content of sitemap.contents || []) {
      if (content.indexed != null) {
        indexed += Number(content.indexed) || 0
        sawCount = true
      }
    }
  }
  if (!sawCount) throw new Error('Search Console: sitemap list had no indexed counts')
  return indexed
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

async function fetchSearchConsoleQueries(token, siteUrl) {
  const end = daysAgo(1)
  const start = daysAgo(28)
  const data = await googleJson(
    `https://www.googleapis.com/webmasters/v3/sites/${encodeSiteUrl(siteUrl)}/searchAnalytics/query`,
    token,
    {
      method: 'POST',
      timeoutMs: 12000,
      body: {
        startDate: ymdUtc(start),
        endDate: ymdUtc(end),
        dimensions: ['query'],
        dimensionFilterGroups: [
          {
            filters: [
              {
                dimension: 'query',
                operator: 'includingRegex',
                expression: `^(${SEARCH_CONSOLE_TARGET_QUERIES.map(escapeRegex).join('|')})$`,
              },
            ],
          },
        ],
        rowLimit: SEARCH_CONSOLE_TARGET_QUERIES.length,
      },
    },
  )
  const byQuery = new Map((data.rows || []).map((row) => [row.keys?.[0], row]))
  return SEARCH_CONSOLE_TARGET_QUERIES.map((query) => {
    const row = byQuery.get(query)
    return {
      query,
      clicks: row?.clicks ?? 0,
      impressions: row?.impressions ?? 0,
      position: typeof row?.position === 'number' ? Number(row.position.toFixed(1)) : null,
    }
  })
}

async function fetchSearchConsole(failures) {
  const token = await googleAccessToken(WEBMASTERS_SCOPE)
  const siteUrl = await resolveSearchConsoleSite(token)
  const [indexedPages, queries] = await Promise.all([
    runNamed('search_console_sitemaps', () => fetchIndexedPages(token, siteUrl), failures),
    runNamed('search_console_queries', () => fetchSearchConsoleQueries(token, siteUrl), failures),
  ])
  return { indexedPages, queries }
}

function sumDatedValues(series) {
  return (series?.datedValues || []).reduce((sum, point) => sum + (Number(point.value) || 0), 0)
}

function metricsFromPerformance(payload) {
  const series = []
  for (const group of payload.multiDailyMetricTimeSeries || []) {
    series.push(...(group.dailyMetricTimeSeries || []))
  }
  const byMetric = new Map(series.map((item) => [item.dailyMetric, item.timeSeries]))
  const views = IMPRESSION_METRICS.reduce(
    (sum, metric) => sum + sumDatedValues(byMetric.get(metric)),
    0,
  )
  return {
    gbp_views: views,
    gbp_calls: sumDatedValues(byMetric.get('CALL_CLICKS')),
    gbp_direction_requests: sumDatedValues(byMetric.get('BUSINESS_DIRECTION_REQUESTS')),
    gbp_website_clicks: sumDatedValues(byMetric.get('WEBSITE_CLICKS')),
  }
}

function performanceLocationName(locationName) {
  const id = String(locationName).split('/').pop()
  return `locations/${id}`
}

async function findGbpLocation(token, placeId) {
  const wildcard = await googleJson(
    'https://mybusinessbusinessinformation.googleapis.com/v1/accounts/-/locations?readMask=name,title,metadata&pageSize=100',
    token,
    { timeoutMs: 8000 },
  ).catch(() => null)

  const wildcardMatch = (wildcard?.locations || []).find((loc) => loc.metadata?.placeId === placeId)
  if (wildcardMatch?.name) return wildcardMatch.name

  const accounts = await googleJson(
    'https://mybusinessaccountmanagement.googleapis.com/v1/accounts',
    token,
    { timeoutMs: 8000 },
  )
  const list = accounts.accounts || []
  if (!list.length) throw new Error('GBP: service account has no accounts')

  let sawLocation = false
  for (const account of list) {
    const locRes = await googleJson(
      `https://mybusinessbusinessinformation.googleapis.com/v1/${account.name}/locations?readMask=name,title,metadata&pageSize=100`,
      token,
      { timeoutMs: 8000 },
    )
    const locations = locRes.locations || []
    if (locations.length) sawLocation = true
    const match = locations.find((loc) => loc.metadata?.placeId === placeId)
    if (match?.name) return match.name
  }
  if (!sawLocation) {
    throw new Error('GBP: no locations (service account is not a manager on the listing yet)')
  }
  throw new Error('GBP: no location matched GOOGLE_PLACE_ID')
}

async function fetchGbpMetrics() {
  const placeId = process.env.GOOGLE_PLACE_ID
  if (!placeId) throw new Error('GOOGLE_PLACE_ID is not set')
  const token = await googleAccessToken(GBP_SCOPE, 8000)
  const locationName = await findGbpLocation(token, placeId)
  const end = daysAgo(1)
  const start = daysAgo(30)
  const payload = await googleJson(
    `https://businessprofileperformance.googleapis.com/v1/${performanceLocationName(locationName)}:fetchMultiDailyMetricsTimeSeries`,
    token,
    {
      method: 'POST',
      timeoutMs: 8000,
      body: {
        dailyMetrics: [
          'WEBSITE_CLICKS',
          'CALL_CLICKS',
          'BUSINESS_DIRECTION_REQUESTS',
          ...IMPRESSION_METRICS,
        ],
        dailyRange: {
          startDate: datePartsUtc(start),
          endDate: datePartsUtc(end),
        },
      },
    },
  )
  return metricsFromPerformance(payload)
}

async function insertSnapshot(row) {
  const { url, key } = supabaseConfig()
  const response = await fetch(`${url}/rest/v1/seo_snapshots`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify(row),
    signal: AbortSignal.timeout(8000),
  })
  const payload = await response.json().catch(() => [])
  if (!response.ok) {
    const message = payload?.message || payload?.error || response.status
    throw new Error(`seo_snapshots insert failed: ${message}`)
  }
  const inserted = Array.isArray(payload) ? payload[0] : payload
  return inserted?.id || null
}

export async function gatherSeoSnapshot() {
  const failures = []

  const [leadsLast7d, mobile, desktop, gsc, gbp] = await Promise.all([
    runNamed('leads', fetchLeadsLast7d, failures),
    runNamed('pagespeed_mobile', () => fetchPageSpeed('mobile'), failures),
    runNamed('pagespeed_desktop', () => fetchPageSpeed('desktop'), failures),
    runNamed('search_console', () => fetchSearchConsole(failures), failures),
    runNamed('gbp', fetchGbpMetrics, failures),
  ])

  return {
    failures,
    row: {
      leads_last_7d: leadsLast7d,
      indexed_pages: gsc?.indexedPages ?? null,
      mobile_performance: mobile?.performance ?? null,
      mobile_lcp_ms: mobile?.lcpMs ?? null,
      desktop_performance: desktop?.performance ?? null,
      desktop_lcp_ms: desktop?.lcpMs ?? null,
      gbp_views: gbp?.gbp_views ?? null,
      gbp_calls: gbp?.gbp_calls ?? null,
      gbp_direction_requests: gbp?.gbp_direction_requests ?? null,
      gbp_website_clicks: gbp?.gbp_website_clicks ?? null,
      search_console_queries: gsc?.queries ?? null,
    },
  }
}

export async function captureSeoSnapshot() {
  const { failures, row } = await gatherSeoSnapshot()

  let id = null
  try {
    id = await insertSnapshot(row)
  } catch (error) {
    console.error('seo-snapshot insert failed:', error.message)
    return { ok: false, id: null, failures, error: error.message, snapshot: row }
  }

  if (failures.length) {
    console.warn('seo-snapshot partial capture:', failures.join(', '))
  } else {
    console.log('seo-snapshot captured', id)
  }

  return { ok: true, id, failures, snapshot: row }
}
