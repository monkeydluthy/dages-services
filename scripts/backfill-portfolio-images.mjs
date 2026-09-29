import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { createClient } from '@supabase/supabase-js'

const MAX_EDGE = 1600
const TARGET_BYTES = 120 * 1024
const CACHE_CONTROL = '31536000'
const LOG_PATH = join(dirname(fileURLToPath(import.meta.url)), 'portfolio-originals.json')

function supabaseConfig() {
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').replace(/\/$/, '')
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('SUPABASE_URL / VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')
  }
  return { url, key }
}

function defaultAltText(title, jobType) {
  const trimmed = (title || '').trim()
  if (trimmed) return trimmed
  if (jobType) return `${jobType} work in Plant City area`
  return 'Tree work in Plant City area'
}

function storagePathFromPublicUrl(url) {
  const marker = '/storage/v1/object/public/portfolio-media/'
  const index = url.indexOf(marker)
  if (index === -1) return null
  return decodeURIComponent(url.slice(index + marker.length))
}

function webpPath(objectPath) {
  return objectPath.replace(/\.[^.]+$/, '.webp')
}

async function encodeWebp(input, width, height, quality) {
  return sharp(input)
    .resize(width, height, { withoutEnlargement: true })
    .webp({ quality })
    .toBuffer()
}

async function compressToWebp(input) {
  const meta = await sharp(input).metadata()
  const sourceWidth = meta.width || 0
  const sourceHeight = meta.height || 0
  if (!sourceWidth || !sourceHeight) throw new Error('could not read image size')

  let maxEdge = MAX_EDGE
  let quality = 80
  let width
  let height
  let buffer

  while (true) {
    const longEdge = Math.max(sourceWidth, sourceHeight)
    const scale = longEdge > maxEdge ? maxEdge / longEdge : 1
    width = Math.max(1, Math.round(sourceWidth * scale))
    height = Math.max(1, Math.round(sourceHeight * scale))
    buffer = await encodeWebp(input, width, height, quality)

    if (buffer.length <= TARGET_BYTES) break
    if (quality > 40) {
      quality -= 5
      continue
    }
    if (maxEdge > 1200) {
      maxEdge = 1200
      quality = 70
      continue
    }
    if (maxEdge > 900) {
      maxEdge = 900
      quality = 70
      continue
    }
    break
  }

  return { buffer, width, height, bytes: buffer.length, quality }
}

async function updateRow(supabase, id, fields) {
  const withOriginal = await supabase.from('portfolio_items').update(fields).eq('id', id)
  if (!withOriginal.error) return { originalColumn: 'original_media_url' in fields }

  const missingColumn =
    withOriginal.error.message?.includes('original_media_url') ||
    withOriginal.error.code === 'PGRST204'
  if (!missingColumn || !('original_media_url' in fields)) {
    throw new Error(withOriginal.error.message)
  }

  const { original_media_url: _ignored, ...rest } = fields
  const fallback = await supabase.from('portfolio_items').update(rest).eq('id', id)
  if (fallback.error) throw new Error(fallback.error.message)
  return { originalColumn: false }
}

const { url, key } = supabaseConfig()
const supabase = createClient(url, key, { auth: { persistSession: false } })

let { data: rows, error: loadError } = await supabase
  .from('portfolio_items')
  .select('id, title, media_type, media_url, job_type, width, height, alt_text, original_media_url')
  .order('created_at', { ascending: true })

if (loadError) {
  const fallback = await supabase
    .from('portfolio_items')
    .select('id, title, media_type, media_url, job_type, width, height, alt_text')
    .order('created_at', { ascending: true })
  if (fallback.error) throw new Error(fallback.error.message)
  rows = (fallback.data ?? []).map((row) => ({ ...row, original_media_url: null }))
}

let previousLog = []
try {
  previousLog = JSON.parse(await readFile(LOG_PATH, 'utf8'))
} catch {
  previousLog = []
}
const originalsById = new Map(previousLog.map((entry) => [entry.id, entry.original_media_url]))

const log = []
let compressed = 0
let skipped = 0
let altsOnly = 0

for (const item of rows) {
  const altText = defaultAltText(item.title, item.job_type)

  if (item.media_type !== 'image') {
    if (!item.alt_text) {
      await updateRow(supabase, item.id, { alt_text: altText })
      altsOnly += 1
      console.log(`alt  ${item.title || item.id}`)
    } else {
      skipped += 1
    }
    continue
  }

  const sourceUrl = item.original_media_url || originalsById.get(item.id) || item.media_url
  const alreadyWebp = /\.webp(\?|$)/i.test(item.media_url || '')
  if (alreadyWebp && sourceUrl === item.media_url) {
    skipped += 1
    console.log(`skip ${item.title || item.id} (already webp)`)
    continue
  }

  const objectPath = storagePathFromPublicUrl(sourceUrl)
  if (!objectPath) {
    console.error(`fail ${item.id}: not a portfolio-media URL`)
    continue
  }

  const response = await fetch(sourceUrl)
  if (!response.ok) {
    console.error(`fail ${item.title || item.id}: download ${response.status}`)
    continue
  }
  const input = Buffer.from(await response.arrayBuffer())
  const webp = await compressToWebp(input)
  const nextPath = webpPath(objectPath)

  const { error: uploadError } = await supabase.storage.from('portfolio-media').upload(nextPath, webp.buffer, {
    contentType: 'image/webp',
    cacheControl: CACHE_CONTROL,
    upsert: true,
  })

  if (uploadError && !/already exists|Duplicate/i.test(uploadError.message || '')) {
    console.error(`fail ${item.title || item.id}: upload ${uploadError.message}`)
    continue
  }

  const publicUrl = supabase.storage.from('portfolio-media').getPublicUrl(nextPath).data.publicUrl
  const fields = {
    original_media_url: item.original_media_url || item.media_url,
    media_url: publicUrl,
    width: webp.width,
    height: webp.height,
    alt_text: altText,
  }

  await updateRow(supabase, item.id, fields)
  compressed += 1
  log.push({
    id: item.id,
    title: item.title,
    original_media_url: fields.original_media_url,
    media_url: publicUrl,
    bytes: webp.bytes,
    quality: webp.quality,
    width: webp.width,
    height: webp.height,
  })
  console.log(
    `webp ${item.title || item.id} ${webp.width}x${webp.height} ${Math.round(webp.bytes / 1024)}KiB q${webp.quality}`,
  )
}

if (log.length) {
  const merged = new Map(previousLog.map((entry) => [entry.id, entry]))
  for (const entry of log) merged.set(entry.id, entry)
  await mkdir(dirname(LOG_PATH), { recursive: true })
  await writeFile(LOG_PATH, `${JSON.stringify([...merged.values()], null, 2)}\n`)
}

console.log(
  JSON.stringify(
    {
      compressed,
      altsOnly,
      skipped,
      log: LOG_PATH,
    },
    null,
    2,
  ),
)
