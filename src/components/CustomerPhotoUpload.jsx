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

    for (const file of files) {
      const itemId = crypto.randomUUID()
      setItems((current) => [
        ...current,
        { id: itemId, name: file.name, status: 'uploading' },
      ])

      const objectPath = `${leadId}/${Date.now()}-${sanitizeFileName(file.name)}`

      const { error: uploadError } = await supabase.storage
        .from('job-photos')
        .upload(objectPath, file, {
          contentType: file.type || 'image/jpeg',
          upsert: false,
        })

      if (uploadError) {
        setItems((current) =>
          current.map((item) =>
            item.id === itemId
              ? { ...item, status: 'error', error: 'Upload failed. Try another photo.' }
              : item,
          ),
        )
        continue
      }

      const { data } = supabase.storage.from('job-photos').getPublicUrl(objectPath)
      const { error: updateError } = await supabase.rpc('append_lead_photos', {
        lead_id: leadId,
        urls: [data.publicUrl],
      })

      if (updateError) {
        setItems((current) =>
          current.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  status: 'error',
                  error: 'Uploaded, but we could not attach it to your request.',
                }
              : item,
          ),
        )
        continue
      }

      setItems((current) =>
        current.map((item) =>
          item.id === itemId ? { ...item, status: 'done' } : item,
        ),
      )
    }
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
      ) : (
        <p className="mt-2 text-xs text-ink/50">You can skip this — Joseph will still call.</p>
      )}
    </div>
  )
}

export default CustomerPhotoUpload
