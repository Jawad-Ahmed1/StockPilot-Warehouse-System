import React from 'react'
import Header from '../components/Header'
import HeroSection from '../components/HeroSection'
import FeaturesSection from '../components/FeaturesSection'
import AICapabilitiesSection from '../components/AICapabilitiesSection'
import BenefitsSection from '../components/BenefitsSection'
import CallToActionSection from '../components/CallToActionSection'
import Footer from '../components/Footer'
import './HomePage.css'

export default function HomePage({ 
  isAuthenticated, 
  user, 
  onLogout, 
  onNavigateToLogin, 
  onNavigateToSignup,
  onNavigateToAdmin,
  onNavigateToAI
}) {
  return (
    <div className="home-page">
      <Header 
        isAuthenticated={isAuthenticated}
        user={user}
        onLogout={onLogout}
        onNavigateToLogin={onNavigateToLogin}
        onNavigateToSignup={onNavigateToSignup}
        onNavigateToAdmin={onNavigateToAdmin}
        onNavigateToAI={onNavigateToAI}
      />
      <HeroSection />
      <FeaturesSection />
      <AICapabilitiesSection />
      <BenefitsSection />
      <CallToActionSection />
      <Footer />
    </div>
  )
}
