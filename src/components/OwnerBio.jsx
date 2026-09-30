import siteConfig from '../config/siteConfig.json'

function OwnerBio() {
  const { name, bio, photoSrc, photoCaption } = siteConfig.owner

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-5xl px-4 py-10 md:py-12">
        <h2 className="mb-6 text-2xl font-bold text-ink sm:mb-8 sm:text-3xl">
          Meet Joseph
        </h2>
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:gap-8">
          {photoSrc ? (
            <figure className="w-full shrink-0 md:max-w-sm">
              <img
                src={photoSrc}
                alt={photoCaption || name}
                className="h-auto w-full rounded-lg object-cover object-center"
              />
              {photoCaption ? (
                <figcaption className="mt-2 text-center text-sm italic text-ink/60">
                  {photoCaption}
                </figcaption>
              ) : null}
            </figure>
          ) : null}
          <p className="text-base leading-relaxed text-ink sm:text-lg">{bio}</p>
        </div>
      </div>
    </section>
  )
}

export default OwnerBio
