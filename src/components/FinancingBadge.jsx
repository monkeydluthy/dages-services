import siteConfig from '../config/siteConfig.json'

function FinancingBadge() {
  const financing = siteConfig.financing
  if (!financing) return null

  // GreenSky is the confirmed program. Set false only if the lender changes.
  const showProvider = true

  const {
    label,
    placeholderLabel,
    applyUrl,
    disclosureUrl,
    greenSkyLogoSrc,
    ehlLogoSrc,
  } = financing

  const hasLogos = showProvider && Boolean(greenSkyLogoSrc && ehlLogoSrc)
  const wording = hasLogos ? label : placeholderLabel
  const providerApplyUrl = showProvider ? applyUrl : ''
  const providerDisclosureUrl = showProvider ? disclosureUrl : ''

  const logos = hasLogos ? (
    <div className="flex items-center justify-center gap-4">
      <img
        src={greenSkyLogoSrc}
        alt="GreenSky"
        width={303}
        height={80}
        className="h-10 w-auto object-contain"
      />
      <img
        src={ehlLogoSrc}
        alt="Equal Housing Lender"
        width={150}
        height={150}
        className="h-10 w-auto object-contain"
      />
    </div>
  ) : null

  const copy = <p className="text-sm font-medium text-ink">{wording}</p>

  const body = (
    <>
      {logos}
      {copy}
    </>
  )

  return (
    <section className="border-b border-brand/20 bg-white">
      <div className="mx-auto flex max-w-5xl justify-center px-4 py-6">
        <div className="flex flex-col items-center space-y-3 text-center">
          {providerApplyUrl ? (
            <a
              href={providerApplyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center space-y-3 hover:opacity-90"
            >
              {body}
            </a>
          ) : (
            body
          )}
          {providerDisclosureUrl ? (
            <a
              href={providerDisclosureUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-brand underline underline-offset-2 hover:opacity-80"
            >
              Disclosures
            </a>
          ) : null}
        </div>
      </div>
    </section>
  )
}

export default FinancingBadge
