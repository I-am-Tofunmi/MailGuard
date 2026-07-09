import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import HowItWorksSection from "../components/HowItWorksSection";
import StatsBanner from "../components/StatsBanner";
import AfricaSection from "../components/AfricaSection";
import CTASection from "../components/CTASection";
import Footer from "../components/Footer";
function LandingPage() {
    return (
        <div>
            <Navbar />
            <HeroSection />
            <HowItWorksSection />
            <StatsBanner />
            <AfricaSection />
            <CTASection />
            <Footer />
        </div>
    )
}
export default LandingPage
