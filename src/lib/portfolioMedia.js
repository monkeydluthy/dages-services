const PUBLIC_MARKER = '/storage/v1/object/public/portfolio-media/'

export function storagePathFromPublicUrl(url) {
  const index = url.indexOf(PUBLIC_MARKER)
  if (index === -1) return null
  return decodeURIComponent(url.slice(index + PUBLIC_MARKER.length))
}

export function videoPosterPath(objectPath) {
  const folder = objectPath.split('/')[0]
  if (!folder) return null
  return `${folder}/poster.jpg`
}

export function videoPosterUrl(mediaUrl) {
  const objectPath = storagePathFromPublicUrl(mediaUrl)
  const posterPath = objectPath ? videoPosterPath(objectPath) : null
  if (!objectPath || !posterPath) return ''
  return mediaUrl.split('?')[0].replace(objectPath, posterPath)
}
