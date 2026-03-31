export default function Footer() {
  return (
    <footer
      className="relative w-full py-8 border-t"
      style={{ borderColor: 'rgba(26,188,156,0.12)', background: 'rgba(10,22,44,0.6)' }}
    >
      <div className="w-full max-w-[1280px] mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <img src="/images/Logo.png" alt="TechnoLogs" className="h-8 w-auto opacity-70" />
        <p className="font-koho text-[rgba(255,255,255,0.35)] text-[0.8rem] tracking-wide text-center md:text-right">
          © {new Date().getFullYear()} TechnoLogs Management System. All rights reserved.
        </p>
      </div>
    </footer>
  );
}