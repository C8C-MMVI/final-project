import Background from '../components/shared/Background';
import Navbar from '../components/home/Navbar';
import Hero from '../components/home/Hero';
import Services from '../components/home/Services';
import HowItWorks from '../components/home/HowItWorks';
import TrackRepair from '../components/home/TrackRepair';
import Footer from '../components/home/Footer';

export default function Home() {
  return (
    <>
      <Background />
      <div style={{ position: 'relative', zIndex: 2, minHeight: '100vh', overflowY: 'auto', color: '#fff' }}>
        <Navbar />
        <Hero />
        <Services />
        <HowItWorks />
        <TrackRepair />
        <Footer />
      </div>
    </>
  );
}