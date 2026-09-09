function PhotoUpload({ files, onChange }) {
  return (
    <div>
      <label htmlFor="photos" className="mb-1 block text-sm font-medium text-ink">
        Photos (optional)
      </label>
      <input
        id="photos"
        name="photos"
        type="file"
        accept="image/*"
        multiple
        onChange={(event) => onChange(Array.from(event.target.files ?? []))}
        className="block w-full text-sm text-ink/70 file:mr-4 file:rounded-md file:border-0 file:bg-brand file:px-4 file:py-2 file:text-sm file:font-medium file:text-brandTint"
      />
      {files.length > 0 && (
        <ul className="mt-2 list-disc pl-5 text-sm text-ink/70">
          {files.map((file) => (
            <li key={`${file.name}-${file.lastModified}`}>{file.name}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default PhotoUpload
