import Background from '../components/shared/Background';
import Navbar from '../components/home/Navbar';
import Hero from '../components/home/Hero';
import Services from '../components/home/Services';
import TrackRepair from '../components/home/TrackRepair';
import Footer from '../components/home/Footer';

export default function Home() {
  return (
    <>
      <Background />
      <div className="relative z-[2] min-h-screen overflow-y-auto text-white">
        <Navbar />
        <Hero />
        <Services />
        <TrackRepair />
        <Footer />
      </div>
    </>
  );
}