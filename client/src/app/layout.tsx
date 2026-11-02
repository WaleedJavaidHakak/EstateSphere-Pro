
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
    default: 'Walestate — Premium Property Listings in India',
    template: '%s | Walestate',
  },
  description:
    'Find your dream property with Walestate. Browse houses, apartments, villas and commercial properties for sale and rent across India.',
  keywords: [
    'Walestate',
    'property India',
    'houses',
    'apartments',
    'villas',
    'buy property',
    'rent property',
    'sell property',
    'Bengaluru',
    'Mumbai',
    'New Delhi',
  ],
  authors: [{ name: 'Walestate' }],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'Walestate',
    title: 'Walestate — Premium Property Listings in India',
    description:
      'Find your dream property in India. Explore properties for sale and rent with Walestate.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-IN" suppressHydrationWarning className={inter.variable}>
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
