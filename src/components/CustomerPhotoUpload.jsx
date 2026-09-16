import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function sanitizeFileName(name) {
  const base = name.split(/[/\\]/).pop() || 'upload'
  return base.replace(/[^\w.-]+/g, '-').replace(/-+/g, '-')
}

function statusLabel(item) {
  if (item.status === 'uploading') return 'Uploading…'
  if (item.status === 'done') return 'Uploaded'
  return item.error || 'Could not upload'
}

function CustomerPhotoUpload({ leadId }) {
  const [items, setItems] = useState([])
  const canUpload = UUID_PATTERN.test(leadId ?? '')

  async function handleFileSelect(event) {
    const files = Array.from(event.target.files ?? [])
    event.target.value = ''

    if (!canUpload || files.length === 0) return

    const batch = files.map((file) => ({
      id: crypto.randomUUID(),
      name: file.name,
      file,
      status: 'uploading',
    }))

    setItems((current) => [...current, ...batch])

    const uploadedUrls = []

    await Promise.all(
      batch.map(async (item, index) => {
        const objectPath = `${leadId}/${Date.now()}-${index}-${item.id.slice(0, 8)}-${sanitizeFileName(item.file.name)}`

        const { error: uploadError } = await supabase.storage
          .from('job-photos')
          .upload(objectPath, item.file, {
            contentType: item.file.type || 'image/jpeg',
            upsert: false,
          })

        if (uploadError) {
          setItems((current) =>
            current.map((row) =>
              row.id === item.id
                ? { ...row, status: 'error', error: 'Upload failed. Try another photo.' }
                : row,
            ),
          )
          return
        }

        const { data } = supabase.storage.from('job-photos').getPublicUrl(objectPath)
        uploadedUrls.push({ id: item.id, url: data.publicUrl })
      }),
    )

    if (uploadedUrls.length === 0) return

    const { error: updateError } = await supabase.rpc('append_lead_photos', {
      lead_id: leadId,
      urls: uploadedUrls.map((entry) => entry.url),
    })

    const uploadedIds = new Set(uploadedUrls.map((entry) => entry.id))

    setItems((current) =>
      current.map((row) => {
        if (!uploadedIds.has(row.id)) return row
        if (updateError) {
          return {
            ...row,
            status: 'error',
            error: 'Uploaded, but we could not attach it to your request.',
          }
        }
        return { ...row, status: 'done' }
      }),
    )
  }

  if (!canUpload) return null

  return (
    <div className="mx-auto mt-6 w-full max-w-md rounded-lg border border-brand/20 bg-white p-4 text-left shadow-sm">
      <label htmlFor="job-photos" className="mb-1 block text-sm font-medium text-ink">
        Photos of the job{' '}
        <span className="font-normal text-ink/60">(optional)</span>
      </label>
      <input
        id="job-photos"
        name="job-photos"
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="block w-full text-sm text-ink/70 file:mr-4 file:rounded-md file:border-0 file:bg-brand file:px-4 file:py-2 file:text-sm file:font-medium file:text-brandTint"
      />
      <p className="mt-2 text-xs text-ink/50">
        Optional — Joseph will still call. You can select several photos at once.
      </p>
      {items.length > 0 ? (
        <ul className="mt-3 space-y-1.5 text-sm">
          {items.map((item) => (
            <li key={item.id} className="flex items-start justify-between gap-3">
              <span className="min-w-0 truncate text-ink/80">{item.name}</span>
              <span
                className={
                  item.status === 'done'
                    ? 'shrink-0 font-medium text-brand'
                    : item.status === 'error'
                      ? 'shrink-0 text-red-700'
                      : 'shrink-0 text-ink/60'
                }
              >
                {statusLabel(item)}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

export default CustomerPhotoUpload
