import { Link } from 'react-router-dom'
import siteConfig from '../config/siteConfig.json'

function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-brand/20 bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex min-w-0 items-center gap-2.5">
          <img
            src="/header-icon.png"
            alt=""
            width="48"
            height="48"
            className="h-10 w-10 shrink-0 sm:h-12 sm:w-12"
          />
          <span className="truncate font-display text-base font-bold text-brand sm:text-xl">
            {siteConfig.businessName}
          </span>
        </Link>
        <a
          href={`tel:${siteConfig.phone}`}
          className="hidden rounded-md bg-brand px-4 py-2 text-sm font-semibold text-brandTint hover:opacity-90 md:inline-flex"
        >
          {siteConfig.phone}
        </a>
      </div>
    </header>
  )
}

export default Header
