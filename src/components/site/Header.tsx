import { Link, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";

export function Header() {
  const [solid, setSolid] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";

  useEffect(() => {
    if (!isHome) {
      setSolid(true);
      return;
    }

    const onScroll = () => setSolid(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  const navItems = [
    { to: "/services", label: "Services" },
    { to: "/process", label: "Process" },
    { to: "/pricing", label: "Pricing" },
    { to: "/coverage", label: "Coverage" },
    { to: "/faq", label: "FAQ" },
  ];

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 py-4 pointer-events-none transition-all duration-500">
      <div
        className={`w-full max-w-6xl px-6 flex items-center justify-between pointer-events-auto transition-all duration-500 rounded-full ${
          solid
            ? "h-14 glass-dark shadow-lift border border-white/10"
            : "h-16 border-transparent bg-transparent"
        }`}
      >
        <Link to="/" className="flex items-center gap-2.5 font-display text-lg font-extrabold tracking-tight text-white group">
          <div className="relative flex items-center justify-center">
            <div className="absolute -inset-1.5 rounded-full bg-teal/20 blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Logo size={26} variant="teal" className="relative transition-transform duration-500 group-hover:rotate-12" />
          </div>
          <span className="bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent">
            Spin<span className="text-teal font-black">Shine</span>
          </span>
        </Link>
        
        <nav className="hidden items-center gap-7 text-xs font-semibold tracking-wider uppercase text-white/70 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeProps={{ className: "text-teal! font-bold" }}
              className="link-underline transition-colors duration-300 hover:text-white hover:opacity-100"
            >
              {item.label}
            </Link>
          ))}
          <span className="h-4 w-px bg-white/10" />
          <Link
            to="/track"
            activeProps={{ className: "text-teal! font-bold" }}
            className="link-underline transition-colors duration-300 hover:text-white"
          >
            Track order
          </Link>
        </nav>

        <Link
          to="/book"
          className="relative inline-flex items-center justify-center overflow-hidden rounded-full p-0.5 font-bold text-white group transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-glow"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-teal via-royal to-gold rounded-full opacity-70 group-hover:opacity-100 transition-opacity duration-300" />
          <span className="relative block px-5 py-1.5 text-xs font-bold bg-navy rounded-full transition-colors duration-300 group-hover:bg-transparent">
            Book Pickup
          </span>
        </Link>
      </div>
    </header>
  );
}
