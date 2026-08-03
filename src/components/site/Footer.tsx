import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";

export function Footer() {
  const services = [
    { name: "Curtain Cleaning", to: "/services" },
    { name: "Carpet Cleaning", to: "/services" },
    { name: "Sofa Cleaning", to: "/services" },
    { name: "Mattress Cleaning", to: "/services" },
    { name: "Blanket Cleaning", to: "/services" },
    { name: "Upholstery Cleaning", to: "/services" },
  ];

  const links = [
    { name: "Our Process", to: "/process" },
    { name: "Pricing & Rates", to: "/pricing" },
    { name: "Service Areas", to: "/coverage" },
    { name: "FAQs", to: "/faq" },
    { name: "Track an Order", to: "/track" },
    { name: "Book a Pickup", to: "/book" },
  ];

  return (
    <footer className="relative bg-navy text-white overflow-hidden">
      {/* Top Border Accent Gradient */}
      <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-teal via-royal to-gold opacity-50" />
      
      {/* Background Decorative Glow */}
      <div className="absolute -bottom-48 -right-48 w-96 h-96 bg-royal/10 rounded-full blur-3xl" />
      
      <div className="relative mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr_1fr]">
          <div className="space-y-6">
            <Link to="/" className="inline-flex items-center gap-2.5 font-display text-2xl font-black text-white group">
              <Logo size={34} variant="teal" className="transition-transform duration-500 group-hover:rotate-12" />
              <span>
                Spin<span className="text-teal">Shine</span>
              </span>
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-white/50">
              Professional fabric care, delivered to your doorstep. Restoring hygiene, comfort, and luxury to Bangalore's finest homes and offices.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <a
                href="tel:+910000000000"
                className="rounded-full bg-white px-6 py-3 text-xs font-bold tracking-wider uppercase text-navy transition-all duration-300 hover:bg-teal hover:text-navy hover:shadow-glow"
              >
                Call now
              </a>
              <a
                href="https://wa.me/910000000000"
                className="rounded-full border border-white/10 px-6 py-3 text-xs font-bold tracking-wider uppercase text-white transition-all duration-300 hover:border-white/40 hover:bg-white/5"
              >
                WhatsApp
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-xs font-bold tracking-[0.2em] text-white/40 uppercase">Services</h3>
            <ul className="mt-5 space-y-3.5 text-sm text-white/60">
              {services.map((s, idx) => (
                <li key={idx}>
                  <Link to={s.to} className="transition-colors duration-300 hover:text-white">
                    {s.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-bold tracking-[0.2em] text-white/40 uppercase">Company</h3>
            <ul className="mt-5 space-y-3.5 text-sm text-white/60">
              {links.map((link, idx) => (
                <li key={idx}>
                  <Link to={link.to} className="transition-colors duration-300 hover:text-white">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-20 border-t border-white/5 pt-8 text-xs text-white/40 flex flex-wrap justify-between items-center gap-4">
          <span>© {new Date().getFullYear()} SpinShine Fabric Care. All rights reserved.</span>
          <span className="flex items-center gap-2">
            <span>Delivered across Bangalore</span>
            <span className="h-1.5 w-1.5 rounded-full bg-teal" />
            <span className="text-teal font-semibold">Premium Standards</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
