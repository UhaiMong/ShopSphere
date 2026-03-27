import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";
import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";
const LOGO = import.meta.env.VITE_LOGO;

const LINKS = {
  Shop: [
    { label: "All Products", to: "/products" },
    { label: "Featured", to: "/products?isFeatured=true" },
    { label: "Best Sellers", to: "/products?sort=popular" },
    { label: "New Arrivals", to: "/products?sort=newest" },
  ],
  Account: [
    { label: "My Account", to: "/profile" },
    { label: "Orders", to: "/orders" },
    { label: "Wishlist", to: "/wishlist" },
    { label: "Sign In", to: "/auth/login" },
  ],
  Help: [
    { label: "FAQ", to: "/faq" },
    { label: "Shipping Policy", to: "/shipping" },
    { label: "Returns", to: "/returns" },
    { label: "Contact Us", to: "/contact" },
  ],
};

export const Footer = () => (
  <footer className="bg-stone-950 text-stone-400 mt-24">
    <div className="container-app py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
        {/* Brand */}
        <div className="lg:col-span-2">
          <Link to="/" className="flex items-center gap-2 mb-5">
            {/* Logo */}
            <div className="w-52 h-auto rounded-lg flex items-center justify-center">
              <img src={LOGO} className="w-full h-full object-cover" />
            </div>
          </Link>
          <p className="text-sm text-stone-500 leading-relaxed max-w-xs mb-6">
            A modern e-commerce platform delivering quality products with a
            seamless shopping experience.
          </p>

          <div className="space-y-2.5 text-sm">
            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-brand-400 shrink-0" />
              <span>support@shopsphere.com</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-brand-400 shrink-0" />
              <span>+880 1700-000000</span>
            </div>
            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-brand-400 shrink-0" />
              <span>Dhaka, Bangladesh</span>
            </div>
          </div>
        </div>

        {/* Links */}
        {Object.entries(LINKS).map(([title, links]) => (
          <div key={title}>
            <h3
              style={{ fontFamily: "Syne, sans-serif" }}
              className="text-sm font-semibold text-white mb-4 uppercase tracking-wider"
            >
              {title}
            </h3>
            <ul className="space-y-2.5">
              {links.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-stone-500 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-stone-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-stone-600">
          © {new Date().getFullYear()} ShopSphere. All rights reserved.
        </p>
        <div className="flex items-center gap-3">
          {[
            { Icon: FaFacebook, href: "#" },
            { Icon: FaTwitter, href: "#" },
            { Icon: FaInstagram, href: "#" },
          ].map(({ Icon, href }) => (
            <a
              key={href}
              href={href}
              className="w-9 h-9 rounded-xl bg-stone-800 flex items-center justify-center text-stone-400 hover:text-white hover:bg-stone-700 transition-colors"
            >
              <Icon className="w-4 h-4" />
            </a>
          ))}
        </div>
      </div>
    </div>
  </footer>
);
