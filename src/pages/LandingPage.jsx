import FAQ from '../components/FAQ'
import FinancingBadge from '../components/FinancingBadge'
import Footer from '../components/Footer'
import Hero from '../components/Hero'
import LeadForm from '../components/LeadForm'
import OwnerBio from '../components/OwnerBio'
import ServiceArea from '../components/ServiceArea'
import ServiceCards from '../components/ServiceCards'
import TrustBar from '../components/TrustBar'
// import PortfolioGallery from '../components/PortfolioGallery'

function LandingPage() {
  return (
    <main>
      <Hero />
      <TrustBar />
      <ServiceCards />
      <FinancingBadge />
      <ServiceArea />
      <FAQ />
      {/* Phase 4 reserved slot — one-line swap: <PortfolioGallery /> */}
      <OwnerBio />
      <section className="bg-brand px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-xl">
          <LeadForm />
        </div>
      </section>
      <Footer />
    </main>
  )
}

export default LandingPage
