import Link from 'next/link';
import { Building2, Mail, Phone, MapPin, Globe, Share2, Camera, Briefcase } from 'lucide-react';

const footerLinks = {
  company: [
    { href: '/about', label: 'About Us' },
    { href: '/contact', label: 'Contact' },
    { href: '/properties', label: 'Properties' },
    { href: '/register', label: 'Become an Agent' },
  ],
  support: [
    { href: '#', label: 'Help Center' },
    { href: '#', label: 'Privacy Policy' },
    { href: '#', label: 'Terms of Service' },
    { href: '#', label: 'Cookie Policy' },
  ],
  propertyTypes: [
    { href: '/properties?type=house', label: 'Houses' },
    { href: '/properties?type=apartment', label: 'Apartments' },
    { href: '/properties?type=villa', label: 'Villas' },
    { href: '/properties?type=commercial', label: 'Commercial' },
  ],
};

const socials = [
  { icon: Globe, href: '#', label: 'Facebook' },
  { icon: Share2, href: '#', label: 'Twitter' },
  { icon: Camera, href: '#', label: 'Instagram' },
  { icon: Briefcase, href: '#', label: 'LinkedIn' },
];

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl">
                <span className="text-primary">Real</span>Estate<span className="text-primary text-sm font-semibold">Pro</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-xs">
              Pakistan's premier real estate platform. Find your dream property or list yours with ease. Trusted by thousands of buyers, sellers, and agents.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                <span>DHA Phase 5, Karachi, Pakistan</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                <span>+92-21-111-ESTATE</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                <span>hello@realestatepro.pk</span>
              </div>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-foreground mb-4">Company</h3>
            <ul className="space-y-2.5">
              {footerLinks.company.map(({ href, label }) => (
                <li key={label}>
                  <Link href={href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-foreground mb-4">Property Types</h3>
            <ul className="space-y-2.5">
              {footerLinks.propertyTypes.map(({ href, label }) => (
                <li key={label}>
                  <Link href={href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-foreground mb-4">Support</h3>
            <ul className="space-y-2.5">
              {footerLinks.support.map(({ href, label }) => (
                <li key={label}>
                  <Link href={href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground text-center sm:text-left">
            © {new Date().getFullYear()} RealEstate Pro. All rights reserved. Built with ❤️ in Pakistan.
          </p>
          <div className="flex items-center gap-3">
            {socials.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="w-8 h-8 rounded-lg bg-muted hover:bg-primary hover:text-white flex items-center justify-center transition-all duration-200"
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
