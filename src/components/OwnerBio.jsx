import siteConfig from '../config/siteConfig.json'

function OwnerBio() {
  const { name, bio, photoSrc, photoCaption } = siteConfig.owner

  return (
    <section className="bg-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-5 px-4 py-10 md:flex-row md:items-start md:gap-8 md:py-12">
        {photoSrc ? (
          <figure className="w-full shrink-0 md:max-w-sm">
            <img
              src={photoSrc}
              alt={photoCaption || name}
              className="h-auto w-full rounded-lg object-cover object-center"
            />
            {photoCaption ? (
              <figcaption className="mt-2 text-center text-sm text-ink/60 md:text-left">
                {photoCaption}
              </figcaption>
            ) : null}
          </figure>
        ) : null}
        <p className="text-base leading-relaxed text-ink sm:text-lg">{bio}</p>
      </div>
    </section>
  )
}

export default OwnerBio
