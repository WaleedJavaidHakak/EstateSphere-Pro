import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'RealEstate Pro — Premium Property Listings',
    template: '%s | RealEstate Pro',
  },
  description:
    'Find your dream property with RealEstate Pro. Browse thousands of houses, apartments, villas and commercial properties for sale and rent across Pakistan.',
  keywords: ['real estate', 'property', 'houses', 'apartments', 'Pakistan', 'buy', 'rent', 'sell'],
  authors: [{ name: 'RealEstate Pro' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'RealEstate Pro',
    title: 'RealEstate Pro — Premium Property Listings',
    description: 'Find your dream property in Pakistan.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="font-sans antialiased min-h-screen flex flex-col">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
