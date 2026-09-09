import siteConfig from '../config/siteConfig.json'

function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-medium text-white">{siteConfig.businessName}</p>
        <p>
          <a className="hover:text-white" href={`tel:${siteConfig.phone}`}>
            {siteConfig.phone}
          </a>
          {' · '}
          <a className="hover:text-white" href={`mailto:${siteConfig.email}`}>
            {siteConfig.email}
          </a>
        </p>
      </div>
    </footer>
  )
}

export default Footer
