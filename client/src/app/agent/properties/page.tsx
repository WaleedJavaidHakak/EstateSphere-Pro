'use client';

import { motion } from 'framer-motion';
import { Building2, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { propertyService } from '@/services/propertyService';
import PropertyCard from '@/components/properties/PropertyCard';
import { Property } from '@/types';

export default function AgentPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const data = await propertyService.getMyProperties();
        setProperties(data.properties || []);
      } catch (error) {
        console.error('Failed to fetch properties', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Properties</h1>
          <p className="text-muted-foreground mt-1">Manage your property listings.</p>
        </div>
        <Link 
          href="/agent/add-property" 
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition shadow-sm"
        >
          <PlusCircle className="w-5 h-5" /> Add Property
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : properties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map(property => (
            <PropertyCard key={property._id} property={property} />
          ))}
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl border border-border p-10 flex flex-col items-center text-center"
        >
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Building2 className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">No Properties Found</h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            You haven't added any properties yet. Click the button above to add your first property!
          </p>
        </motion.div>
      )}
    </div>
  );
}
