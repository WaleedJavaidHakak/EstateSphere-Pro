'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, Building2, MapPin, Shield, Star, Users } from 'lucide-react';
import { propertyService } from '@/services/propertyService';
import { Property } from '@/types';
import PropertyCard from '@/components/properties/PropertyCard';
import { PropertiesGridSkeleton } from '@/components/ui/Skeletons';
import SearchBar from '@/components/properties/SearchBar';
import { useAuthStore } from '@/store/authStore';

export default function Home() {
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [recentProperties, setRecentProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [featured, recent] = await Promise.all([
          propertyService.getProperties({ featured: true, limit: 3 }),
          propertyService.getProperties({ sort: 'newest', limit: 6 })
        ]);
        setFeaturedProperties(featured.properties);
        setRecentProperties(recent.properties);
      } catch (error) {
        console.error('Failed to fetch home properties', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[90vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600"
            alt="Hero Background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 hero-overlay" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 drop-shadow-lg leading-tight">
              Find Your Dream Home <br className="hidden md:block" />
              in Pakistan
            </h1>
            <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl mx-auto drop-shadow-md">
              Discover thousands of premium properties for sale and rent across the country. Your perfect space is just a search away.
            </p>
          </motion.div>

          <SearchBar variant="hero" />
        </div>
      </section>

      {/* Stats/Features Section */}
      <section className="py-16 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-6 rounded-2xl hover:bg-muted transition-colors"
            >
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">10k+ Properties</h3>
              <p className="text-muted-foreground text-sm">Explore a vast selection of premium homes and commercial spaces.</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="p-6 rounded-2xl hover:bg-muted transition-colors"
            >
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Verified Listings</h3>
              <p className="text-muted-foreground text-sm">Every property on our platform is thoroughly vetted for authenticity.</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="p-6 rounded-2xl hover:bg-muted transition-colors"
            >
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Expert Agents</h3>
              <p className="text-muted-foreground text-sm">Connect with top-rated real estate professionals in your area.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold mb-2">Featured Properties</h2>
              <p className="text-muted-foreground">Handpicked premium listings just for you</p>
            </div>
            <Link href="/properties?featured=true" className="hidden sm:flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <PropertiesGridSkeleton count={3} />
          ) : featuredProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProperties.map((property) => (
                <PropertyCard
                  key={property._id}
                  property={property}
                  isFavorited={user?.favorites?.includes(property._id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-muted/30 rounded-2xl border border-border border-dashed">
              <p className="text-muted-foreground">No featured properties found.</p>
            </div>
          )}
        </div>
      </section>

      {/* Recent Properties */}
      <section className="py-20 bg-muted/30 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold mb-2">Newest Listings</h2>
              <p className="text-muted-foreground">The latest properties added to our platform</p>
            </div>
            <Link href="/properties?sort=newest" className="hidden sm:flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all">
              Browse all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <PropertiesGridSkeleton count={6} />
          ) : recentProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentProperties.map((property) => (
                <PropertyCard
                  key={property._id}
                  property={property}
                  isFavorited={user?.favorites?.includes(property._id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-muted/30 rounded-2xl border border-border border-dashed">
              <p className="text-muted-foreground">No recent properties found.</p>
            </div>
          )}
          
          <div className="mt-12 text-center sm:hidden">
            <Link href="/properties" className="inline-flex items-center justify-center w-full px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all">
              View All Properties
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden bg-primary">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to find your next home?</h2>
          <p className="text-primary-foreground/80 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied users who found their perfect property through our platform. Create an account to save favorites and contact agents instantly.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/register" className="px-8 py-3.5 bg-white text-primary font-bold rounded-xl hover:shadow-lg hover:-translate-y-1 transition-all">
              Sign Up Now
            </Link>
            <Link href="/properties" className="px-8 py-3.5 bg-primary-foreground/10 text-white border border-primary-foreground/20 font-bold rounded-xl hover:bg-primary-foreground/20 transition-all">
              Browse Properties
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
