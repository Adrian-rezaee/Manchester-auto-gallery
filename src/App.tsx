import React, { Suspense, lazy, useState } from 'react';
import { Navbar } from './components/navigation/Navbar';
import { HeroSection } from './components/hero/HeroSection';
import { FeaturedCollection } from './components/collection/FeaturedCollection';
import { BrandStory } from './components/brand/BrandStory';
import { ShowroomExperience } from './components/showroom/ShowroomExperience';
import { ConciergeServices } from './components/concierge/ConciergeServices';
import { FinalCta } from './components/cta/FinalCta';
import { Footer } from './components/footer/Footer';
import { Vehicle, CurrencyCode, VEHICLES } from './data/vehicles';
import { ThemeProvider } from './theme/ThemeContext';

// Modals only load the first time someone opens them — keeps the first page load small.
const VehicleModal = lazy(() =>
  import('./components/collection/VehicleModal').then((m) => ({ default: m.VehicleModal }))
);
const PrivateViewingModal = lazy(() =>
  import('./components/modals/PrivateViewingModal').then((m) => ({ default: m.PrivateViewingModal }))
);

const AppContent: React.FC = () => {
  const [currency, setCurrency] = useState<CurrencyCode>('AED');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingPreselectedVehicleId, setBookingPreselectedVehicleId] = useState<string | undefined>(undefined);

  const handleOpenBookingModal = (vehicleId?: string) => {
    setBookingPreselectedVehicleId(vehicleId);
    setBookingModalOpen(true);
  };

  const handleNavigateVehicle = (direction: 'next' | 'prev') => {
    if (!selectedVehicle) return;
    const currentIndex = VEHICLES.findIndex((v) => v.id === selectedVehicle.id);
    if (currentIndex === -1) return;

    if (direction === 'next') {
      const nextIndex = (currentIndex + 1) % VEHICLES.length;
      setSelectedVehicle(VEHICLES[nextIndex]);
    } else {
      const prevIndex = (currentIndex - 1 + VEHICLES.length) % VEHICLES.length;
      setSelectedVehicle(VEHICLES[prevIndex]);
    }
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-paper text-ink selection:bg-[#D4AF37] selection:text-[#0E1013] font-sans antialiased overflow-x-hidden">
      {/* Top Floating Transparent Navigation */}
      <Navbar
        currentCurrency={currency}
        onCurrencyChange={(curr) => setCurrency(curr)}
        onOpenBookingModal={() => handleOpenBookingModal()}
      />

      {/* Hero Section — The Cinematic 3D Automotive Experience (Pristine White & 24K Gold Studio) */}
      <HeroSection
        onExploreCollection={() => scrollToSection('collection')}
        onDiscoverVeltrix={() => scrollToSection('about')}
      />

      {/* Featured Collection Section */}
      <FeaturedCollection
        currency={currency}
        onSelectVehicle={(vehicle) => setSelectedVehicle(vehicle)}
      />

      {/* Brand Story Editorial Section: "MORE THAN A CAR. A STATEMENT." */}
      <BrandStory />

      {/* Dubai Showroom Experience */}
      <ShowroomExperience
        onBookTour={() => handleOpenBookingModal()}
      />

      {/* Private Client Services & Concierge */}
      <ConciergeServices
        onInquire={() => handleOpenBookingModal()}
      />

      {/* Final CTA Section: "YOUR NEXT ICON IS WAITING." */}
      <FinalCta
        onExploreCollection={() => scrollToSection('collection')}
        onContactTeam={() => handleOpenBookingModal()}
      />

      {/* Footer */}
      <Footer
        onOpenBooking={() => handleOpenBookingModal()}
      />

      <Suspense fallback={null}>
        {/* Vehicle Technical Dossier Modal */}
        {selectedVehicle && (
          <VehicleModal
            vehicle={selectedVehicle}
            currency={currency}
            onClose={() => setSelectedVehicle(null)}
            onRequestViewing={(vehicleId) => handleOpenBookingModal(vehicleId)}
            onNavigateVehicle={handleNavigateVehicle}
          />
        )}

        {/* Private Viewing Appointment Modal */}
        {bookingModalOpen && (
          <PrivateViewingModal
            isOpen={bookingModalOpen}
            preselectedVehicleId={bookingPreselectedVehicleId}
            onClose={() => {
              setBookingModalOpen(false);
              setBookingPreselectedVehicleId(undefined);
            }}
          />
        )}
      </Suspense>
    </div>
  );
};

export const App: React.FC = () => (
  <ThemeProvider>
    <AppContent />
  </ThemeProvider>
);

export default App;