import Footer from '../components/Footer'
import Hero from '../components/Hero'
import LeadForm from '../components/LeadForm'
import ServiceArea from '../components/ServiceArea'
import ServiceCards from '../components/ServiceCards'
import TrustBar from '../components/TrustBar'

function LandingPage() {
  return (
    <main>
      <Hero />
      <TrustBar />
      <ServiceCards />
      <ServiceArea />
      <LeadForm />
      <Footer />
    </main>
  )
}

export default LandingPage
