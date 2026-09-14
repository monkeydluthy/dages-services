import { Link } from 'react-router-dom'
import siteConfig from '../config/siteConfig.json'

function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-brand/20 bg-white">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        {/* Text wordmark until a real logo file is provided. Swap for <img> then. */}
        <Link to="/" className="font-display text-xl font-bold text-brand">
          Dages Services
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
