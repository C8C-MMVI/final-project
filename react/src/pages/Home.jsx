import Navbar           from '../components/home/Navbar';
import Hero             from '../components/home/Hero';
import Services         from '../components/home/Services';
import HowItWorks       from '../components/home/HowItWorks';
import TrackRepair      from '../components/home/TrackRepair';
import Footer           from '../components/home/Footer';
import TechnoLogsLogo   from '../components/shared/TechnoLogsLogo';

export default function Home() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,400&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }

        :root {
          --font-display: 'Orbitron', sans-serif;
          --font-body:    'DM Sans',  sans-serif;
        }

        /*
         * Alias Orbitron → Orbitron so every child component's inline
         * fontFamily: "'Orbitron', sans-serif" automatically resolves to Orbitron
         * without touching any child file.
         */
        @font-face {
          font-family: 'Orbitron';
          src: local('Orbitron');
          font-weight: 100 900;
        }

        body {
          background: #f0f6f3;
          color: #0d1f1a;
          font-family: var(--font-body);
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          overflow-x: hidden;
        }

        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #e8f0ec; }
        ::-webkit-scrollbar-thumb { background: rgba(26,188,156,0.4); border-radius: 99px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(26,188,156,0.65); }

        ::selection { background: rgba(26,188,156,0.18); color: #0d1f1a; }
        input::placeholder { color: rgba(15,31,26,0.35); }

        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: '#f0f6f3',
        backgroundImage: `
          radial-gradient(ellipse 80% 40% at 60% 0%, rgba(26,188,156,0.08) 0%, transparent 60%),
          radial-gradient(ellipse 50% 30% at 10% 80%, rgba(26,188,156,0.05) 0%, transparent 60%)
        `,
        position: 'relative',
      }}>
        {/*
          Navbar, Hero, and Footer receive the logo as a prop.
          Each component should render props.logo in place of the <img> tag.
          If they don't yet accept a logo prop, the TechnoLogsLogo will simply
          be unused until you wire up the prop — the font alias still applies globally.
        */}
        <Navbar logo={<TechnoLogsLogo size="sm" />} />
        <main>
          <Hero logo={<TechnoLogsLogo size="md" />} />
          <Services />
          <HowItWorks />
          <TrackRepair />
        </main>
        <Footer logo={<TechnoLogsLogo size="sm" />} />
      </div>
    </>
  );
}