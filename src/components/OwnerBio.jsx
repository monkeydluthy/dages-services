import siteConfig from '../config/siteConfig.json'

function OwnerBio() {
  const { name, bio, photoSrc } = siteConfig.owner
  // Swap siteConfig.owner.photoSrc to the headshot path when it lands.

  return (
    <section className="bg-white">
      <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-8 sm:gap-5 sm:py-10">
        {photoSrc ? (
          <img
            src={photoSrc}
            alt={name}
            className="h-16 w-16 shrink-0 rounded-full object-cover sm:h-20 sm:w-20"
          />
        ) : (
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand text-2xl font-bold text-white sm:h-20 sm:w-20 sm:text-3xl"
            aria-hidden="true"
          >
            J
          </div>
        )}
        <p className="text-base text-ink sm:text-lg">{bio}</p>
      </div>
    </section>
  )
}

export default OwnerBio
