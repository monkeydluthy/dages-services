import siteConfig from '../config/siteConfig.json'

function PhoneIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M6.6 3.8c.4-.4 1.1-.5 1.6-.2l2.1 1.1c.5.3.8.8.7 1.4l-.4 2.2c-.1.4-.3.7-.7.9l-1.3.5a12.1 12.1 0 0 0 5.7 5.7l.5-1.3c.2-.4.5-.6.9-.7l2.2-.4c.6-.1 1.1.2 1.4.7l1.1 2.1c.3.5.2 1.2-.2 1.6l-1.3 1.3c-.5.5-1.2.7-1.9.5C10.2 18.5 5.5 13.8 4.8 7c-.2-.7 0-1.4.5-1.9l1.3-1.3Z" />
    </svg>
  )
}

function StickyCallButton() {
  return (
    <a
      href={`tel:${siteConfig.phone}`}
      className="fixed inset-x-0 bottom-0 z-50 flex h-14 items-center justify-center gap-2 bg-brand text-base font-semibold text-white md:hidden"
    >
      <PhoneIcon />
      Call Joseph Now
    </a>
  )
}

export default StickyCallButton
