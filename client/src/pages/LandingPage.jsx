import {
  LandingNavbar,
  HeroSection,
  FeaturesSection,
  HowItWorksSection,
  RolesSection,
  CTASection,
  LandingFooter,
} from '../components/landing';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans antialiased">
      <LandingNavbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <RolesSection />
        <CTASection />
      </main>
      <LandingFooter />
    </div>
  );
}
