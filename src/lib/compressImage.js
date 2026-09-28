const MAX_EDGE = 1600
const WEBP_QUALITY = 0.8

function webpFileName(name) {
  const base = (name.split(/[/\\]/).pop() || 'photo').replace(/\.[^.]+$/, '')
  return `${base}.webp`
}

export function defaultAltText(title, jobType) {
  const trimmed = (title || '').trim()
  if (trimmed) return trimmed
  if (jobType) return `${jobType} work in Plant City area`
  return 'Tree work in Plant City area'
}

async function loadImage(file) {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file)
    } catch {
      // Some iPhone formats fail here; fall through to Image().
    }
  }

  return new Promise((resolve, reject) => {
    const image = new Image()
    const url = URL.createObjectURL(file)
    image.onload = () => {
      URL.revokeObjectURL(url)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not read that photo.'))
    }
    image.src = url
  })
}

export async function compressImageFile(file) {
  const image = await loadImage(file)
  const sourceWidth = image.width || image.naturalWidth
  const sourceHeight = image.height || image.naturalHeight
  const longEdge = Math.max(sourceWidth, sourceHeight)
  const scale = longEdge > MAX_EDGE ? MAX_EDGE / longEdge : 1
  const width = Math.max(1, Math.round(sourceWidth * scale))
  const height = Math.max(1, Math.round(sourceHeight * scale))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) {
    if (typeof image.close === 'function') image.close()
    throw new Error('Could not compress that photo.')
  }
  context.drawImage(image, 0, 0, width, height)
  if (typeof image.close === 'function') image.close()

  const blob = await new Promise((resolve) => {
    canvas.toBlob(resolve, 'image/webp', WEBP_QUALITY)
  })

  if (!blob) {
    throw new Error('Could not compress that photo.')
  }

  const compressed = new File([blob], webpFileName(file.name), {
    type: blob.type || 'image/webp',
    lastModified: Date.now(),
  })

  return { file: compressed, width, height }
}
