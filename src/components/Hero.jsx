import { useEffect, useState } from 'react'
import LeadForm from './LeadForm'
import siteConfig from '../config/siteConfig.json'
import heroVideo from '../assets/video/hero-bg.mp4'

const HERO_POSTER = '/hero-poster.jpg'
const DESKTOP_BREAKPOINT = '(min-width: 768px)'

function canPlayHeroVideo() {
  if (typeof window === 'undefined') return false
  if (!window.matchMedia(DESKTOP_BREAKPOINT).matches) return false
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  if (navigator.connection?.saveData) return false
  return true
}

function useHeroVideo() {
  const [showVideo, setShowVideo] = useState(false)

  useEffect(() => {
    const desktop = window.matchMedia(DESKTOP_BREAKPOINT)
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const connection = navigator.connection

    const update = () => {
      setShowVideo(canPlayHeroVideo())
    }

    update()
    desktop.addEventListener('change', update)
    reduceMotion.addEventListener('change', update)
    connection?.addEventListener?.('change', update)

    return () => {
      desktop.removeEventListener('change', update)
      reduceMotion.removeEventListener('change', update)
      connection?.removeEventListener?.('change', update)
    }
  }, [])

  return showVideo
}

function Hero() {
  const showVideo = useHeroVideo()

  return (
    <section className="relative text-brandTint">
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        {showVideo ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            poster={HERO_POSTER}
            preload="none"
            className="absolute inset-0 h-full w-full object-cover"
          >
            <source src={heroVideo} type="video/mp4" />
          </video>
        ) : null}
        <div className="absolute inset-0 bg-brand/80" />
      </div>
      <div className="relative z-10 mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-2 md:items-center md:gap-20 md:py-16">
        <div className="flex flex-col gap-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-brandTint">
            {siteConfig.businessName}
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            {siteConfig.hero.headline}
          </h1>
          <p className="text-base text-brandTint/80 sm:text-lg">
            {siteConfig.hero.subheadline}
          </p>
          <div>
            <a
              href={`tel:${siteConfig.phone}`}
              className="inline-flex w-full items-center justify-center rounded-md bg-brandTint px-5 py-3 font-semibold text-brand hover:opacity-90 md:w-auto"
            >
              {siteConfig.callToday}
            </a>
          </div>
        </div>
        <div className="w-full md:justify-self-end">
          <LeadForm id="hero-lead-form" />
        </div>
      </div>
    </section>
  )
}

export default Hero
