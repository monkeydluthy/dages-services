import { useRef, useState } from 'react'
import siteConfig from '../config/siteConfig.json'
import { videoPosterPath } from '../lib/portfolioMedia'
import { supabase } from '../lib/supabaseClient'

const fieldClass = 'w-full rounded-md border border-brand/30 px-3 py-2.5 text-ink'
const VIDEO_LIMIT_BYTES = 100 * 1024 * 1024

function detectMediaType(file) {
  if (file.type.startsWith('image/')) return 'image'
  if (file.type.startsWith('video/')) return 'video'
  return null
}

function sanitizeFileName(name) {
  const base = name.split(/[/\\]/).pop() || 'upload'
  return base.replace(/[^\w.-]+/g, '-').replace(/-+/g, '-')
}

function captureVideoPoster(file) {
  return new Promise((resolve) => {
    const video = document.createElement('video')
    video.muted = true
    video.playsInline = true
    video.preload = 'auto'
    const objectUrl = URL.createObjectURL(file)
    video.src = objectUrl

    let timer
    const cleanup = (blob) => {
      if (video.dataset.done === '1') return
      video.dataset.done = '1'
      window.clearTimeout(timer)
      URL.revokeObjectURL(objectUrl)
      resolve(blob)
    }

    const capture = () => {
      if (!video.videoWidth) {
        cleanup(null)
        return
      }
      const maxEdge = 720
      const scale = Math.min(1, maxEdge / Math.max(video.videoWidth, video.videoHeight))
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.round(video.videoWidth * scale))
      canvas.height = Math.max(1, Math.round(video.videoHeight * scale))
      canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height)
      canvas.toBlob((blob) => cleanup(blob), 'image/jpeg', 0.82)
    }

    video.addEventListener('error', () => cleanup(null), { once: true })
    video.addEventListener('seeked', capture, { once: true })
    video.addEventListener(
      'loadeddata',
      () => {
        video.currentTime = Math.min(0.5, Math.max(0.1, (video.duration || 1) * 0.08))
      },
      { once: true },
    )
    timer = window.setTimeout(() => cleanup(null), 30000)
  })
}

function uploadWithProgress(file, objectPath, onProgress) {
  const url = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/portfolio-media/${objectPath}`

  return supabase.auth.getSession().then(({ data }) => {
    const token = data.session?.access_token
    if (!token) {
      return Promise.reject(new Error('Sign in again, then retry the upload.'))
    }

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('POST', url)
      xhr.setRequestHeader('Authorization', `Bearer ${token}`)
      xhr.setRequestHeader('apikey', import.meta.env.VITE_SUPABASE_ANON_KEY)
      xhr.setRequestHeader('x-upsert', 'false')
      if (file.type) {
        xhr.setRequestHeader('Content-Type', file.type)
      }

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          onProgress(Math.round((event.loaded / event.total) * 100))
        }
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve()
          return
        }
        reject(new Error('Upload failed. Check that the portfolio-media bucket is set up.'))
      }

      xhr.onerror = () => {
        reject(new Error('Upload failed. Check your connection and try again.'))
      }

      xhr.send(file)
    })
  })
}

function AdminUpload({ onUploaded }) {
  const fileInputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [title, setTitle] = useState('')
  const [jobType, setJobType] = useState('')
  const [progress, setProgress] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  function handleFileChange(event) {
    const nextFile = event.target.files?.[0] ?? null
    setFile(nextFile)
    setError('')
    setSuccess('')
    setProgress(0)

    if (
      nextFile &&
      nextFile.type.startsWith('video/') &&
      nextFile.size > VIDEO_LIMIT_BYTES
    ) {
      setError(
        'That video is over 100MB. Compress it first — large files eat storage fast.',
      )
    }
  }

  function resetForm() {
    setFile(null)
    setTitle('')
    setJobType('')
    setProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!file) {
      setError('Pick a photo or video first.')
      return
    }

    const mediaType = detectMediaType(file)
    if (!mediaType) {
      setError('Use a photo or video file.')
      return
    }

    if (mediaType === 'video' && file.size > VIDEO_LIMIT_BYTES) {
      setError(
        'That video is over 100MB. Compress it first — large files eat storage fast.',
      )
      return
    }

    const objectPath = `${crypto.randomUUID()}/${sanitizeFileName(file.name)}`

    setSubmitting(true)
    setProgress(0)

    try {
      await uploadWithProgress(file, objectPath, setProgress)
      setProgress(100)

      let posterMissing = false
      if (mediaType === 'video') {
        const poster = await captureVideoPoster(file)
        const posterPath = videoPosterPath(objectPath)
        if (poster && posterPath) {
          const { error: posterError } = await supabase.storage
            .from('portfolio-media')
            .upload(posterPath, poster, {
              contentType: 'image/jpeg',
              upsert: true,
            })
          if (posterError) {
            console.error('portfolio poster:', posterError.message)
            posterMissing = true
          }
        } else {
          posterMissing = true
        }
      }

      const { data: publicData } = supabase.storage
        .from('portfolio-media')
        .getPublicUrl(objectPath)

      const { error: insertError } = await supabase.from('portfolio_items').insert({
        title: title.trim() || null,
        media_type: mediaType,
        media_url: publicData.publicUrl,
        job_type: jobType || null,
      })

      if (insertError) {
        const extras = mediaType === 'video' ? [videoPosterPath(objectPath)] : []
        await supabase.storage
          .from('portfolio-media')
          .remove([objectPath, ...extras.filter(Boolean)])
        throw new Error('File uploaded but saving the row failed. Try again.')
      }

      resetForm()
      setSuccess(
        posterMissing
          ? 'Uploaded, but the preview still didn’t generate. The tile may stay blank until a poster is added.'
          : 'Uploaded. You can add another.',
      )
      onUploaded?.()
    } catch (uploadError) {
      setError(uploadError.message || 'Upload failed. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="rounded-lg border border-brand/20 bg-white p-6 shadow-sm">
      <h2 className="mb-1 text-xl font-bold text-ink">Add to portfolio</h2>
      <p className="mb-6 text-sm text-ink/70">
        One photo or video at a time. Title and job type are optional.
      </p>
      <form className="grid gap-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-ink">File</span>
          <input
            ref={fileInputRef}
            required
            type="file"
            name="media"
            accept="image/*,video/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-ink/70 file:mr-4 file:rounded-md file:border-0 file:bg-brand file:px-4 file:py-2 file:text-sm file:font-medium file:text-brandTint"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-ink">
            Title <span className="font-normal text-ink/60">(optional)</span>
          </span>
          <input
            type="text"
            name="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className={fieldClass}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-ink">
            Job type <span className="font-normal text-ink/60">(optional)</span>
          </span>
          <select
            name="jobType"
            value={jobType}
            onChange={(event) => setJobType(event.target.value)}
            className={fieldClass}
          >
            <option value="">None</option>
            {siteConfig.services.map((service) => (
              <option key={service.id} value={service.name}>
                {service.name}
              </option>
            ))}
          </select>
        </label>
        {submitting ? (
          <div>
            <div className="h-2 overflow-hidden rounded-full bg-brandTint">
              <div
                className="h-full bg-brand transition-[width]"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-ink/70">Uploading… {progress}%</p>
          </div>
        ) : null}
        {error ? (
          <p className="text-sm font-medium text-red-700" role="alert">
            {error}
          </p>
        ) : null}
        {success ? (
          <p className="text-sm font-medium text-brand" role="status">
            {success}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-brand px-5 py-3 font-semibold text-brandTint hover:opacity-90 disabled:opacity-60"
        >
          {submitting ? 'Uploading…' : 'Upload'}
        </button>
      </form>
    </section>
  )
}

export default AdminUpload
