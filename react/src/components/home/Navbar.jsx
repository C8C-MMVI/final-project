import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background:    scrolled ? 'rgba(10,22,44,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom:  scrolled ? '1px solid rgba(26,188,156,0.15)' : 'none',
        boxShadow:     scrolled ? '0 4px 24px rgba(0,0,0,0.3)' : 'none',
      }}
    >
      <div className="max-w-[1280px] mx-auto px-8 py-5 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 no-underline">
          <img src="/images/Logo2.png" alt="TechnoLogs" className="h-15 w-auto"
            style={{ filter: 'drop-shadow(0 0 8px rgba(26,188,156,0.4))' }} />
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-10">
          {['Home', 'Services', 'Track Repair'].map(label => (
            <a
              key={label}
              href={`#${label.toLowerCase().replace(' ', '-')}`}
              className="font-koho text-[0.9rem] tracking-wide text-[rgba(255,255,255,0.7)] hover:text-teal transition-colors duration-200 no-underline"
            >
              {label}
            </a>
          ))}
        </div>

        {/* Auth buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/login"
            className="font-koho text-[0.88rem] font-semibold tracking-wider text-teal border border-[rgba(26,188,156,0.4)] px-5 py-[10px] rounded-[8px] no-underline transition-all duration-200 hover:bg-[rgba(26,188,156,0.1)] hover:border-teal"
          >
            SIGN IN
          </Link>
          <Link
            to="/register"
            className="font-koho text-[0.88rem] font-semibold tracking-wider text-white px-5 py-[10px] rounded-[8px] no-underline transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_6px_20px_rgba(26,188,156,0.4)]"
            style={{ background: 'linear-gradient(90deg, #0ea882, #1abc9c)' }}
          >
            GET STARTED
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-[5px] bg-transparent border-none cursor-pointer p-1"
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Toggle menu"
        >
          {[0, 1, 2].map(i => (
            <span
              key={i}
              className="block w-6 h-[2px] bg-teal transition-all duration-300 rounded-full"
              style={{
                transform: menuOpen
                  ? i === 0 ? 'translateY(7px) rotate(45deg)'
                  : i === 2 ? 'translateY(-7px) rotate(-45deg)'
                  : 'scaleX(0)'
                  : 'none',
              }}
            />
          ))}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden px-8 pb-6 flex flex-col gap-4"
          style={{ background: 'rgba(10,22,44,0.98)', borderTop: '1px solid rgba(26,188,156,0.15)' }}>
          {['Home', 'Services', 'Track Repair'].map(label => (
            <a key={label} href={`#${label.toLowerCase().replace(' ', '-')}`}
              className="font-koho text-white no-underline text-[1rem] hover:text-teal transition-colors"
              onClick={() => setMenuOpen(false)}>
              {label}
            </a>
          ))}
          <div className="flex gap-3 mt-2">
            <Link to="/login"
              className="flex-1 text-center font-koho text-teal border border-teal px-4 py-2 rounded-[8px] no-underline text-[0.88rem] font-semibold">
              SIGN IN
            </Link>
            <Link to="/register"
              className="flex-1 text-center font-koho text-white px-4 py-2 rounded-[8px] no-underline text-[0.88rem] font-semibold"
              style={{ background: 'linear-gradient(90deg, #0ea882, #1abc9c)' }}>
              GET STARTED
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}