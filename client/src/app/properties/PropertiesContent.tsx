'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import { propertyService } from '@/services/propertyService';
import { Property, PropertyFilters } from '@/types';
import PropertyCard from '@/components/properties/PropertyCard';
import SearchBar from '@/components/properties/SearchBar';
import { PropertiesGridSkeleton } from '@/components/ui/Skeletons';
import { useAuthStore } from '@/store/authStore';

export default function PropertiesContent() {
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<PropertyFilters>({ page: 1, limit: 9 });
  const [pagination, setPagination] = useState({ pages: 1, currentPage: 1, total: 0 });
  const [showFilters, setShowFilters] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    const params: PropertyFilters = { page: 1, limit: 9 };
    const keyword = searchParams.get('keyword');
    const city = searchParams.get('city');
    const type = searchParams.get('type') as PropertyFilters['type'];
    const status = searchParams.get('status') as PropertyFilters['status'];
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const bedrooms = searchParams.get('bedrooms');
    const sort = searchParams.get('sort');

    if (keyword) params.keyword = keyword;
    if (city) params.city = city;
    if (type) params.type = type;
    if (status) params.status = status;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    if (bedrooms) params.bedrooms = bedrooms;
    if (sort) params.sort = sort;

    setFilters(params);
  }, [searchParams]);

  useEffect(() => {
    fetchProperties();
  }, [filters]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const data = await propertyService.getProperties(filters);
      setProperties(data.properties);
      setPagination({
        pages: data.pages,
        currentPage: data.currentPage,
        total: data.total,
      });
    } catch (error) {
      console.error('Failed to fetch properties', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.pages) return;
    setFilters(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header & Search */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Properties For You</h1>
          <div className="bg-card p-4 md:p-6 rounded-2xl border border-border shadow-sm">
            <div className="flex justify-between items-center mb-4 md:hidden">
              <h2 className="font-semibold">Search Filters</h2>
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="p-2 bg-muted rounded-lg flex items-center gap-2 text-sm"
              >
                <SlidersHorizontal className="w-4 h-4" /> Filters
              </button>
            </div>
            
            <div className={`md:block ${showFilters ? 'block' : 'hidden'}`}>
              <SearchBar variant="inline" initialValues={{
                keyword: filters.keyword,
                city: filters.city,
                type: filters.type,
                status: filters.status
              }} />
              
              {/* Additional Filters */}
              <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-4 items-end">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Sort By</label>
                  <select 
                    value={filters.sort || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, sort: e.target.value, page: 1 }))}
                    className="px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Bedrooms</label>
                  <select 
                    value={filters.bedrooms || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, bedrooms: e.target.value, page: 1 }))}
                    className="px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="">Any</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                    <option value="5">5+</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-6 flex justify-between items-center text-sm text-muted-foreground">
          <span>Showing {properties.length} of {pagination.total} results</span>
        </div>

        {/* Property Grid */}
        {loading ? (
          <PropertiesGridSkeleton count={9} />
        ) : properties.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property, index) => (
                <motion.div
                  key={property._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <PropertyCard
                    property={property}
                    isFavorited={user?.favorites?.includes(property._id)}
                  />
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="mt-12 flex justify-center items-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="p-2 rounded-lg border border-border bg-card disabled:opacity-50 hover:bg-muted transition"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <div className="flex gap-1">
                  {Array.from({ length: pagination.pages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => handlePageChange(i + 1)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                        pagination.currentPage === i + 1 
                          ? 'bg-primary text-white' 
                          : 'bg-card border border-border hover:bg-muted'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.pages}
                  className="p-2 rounded-lg border border-border bg-card disabled:opacity-50 hover:bg-muted transition"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 bg-card rounded-2xl border border-border border-dashed">
            <h3 className="text-xl font-bold mb-2">No properties found</h3>
            <p className="text-muted-foreground mb-6">Try adjusting your search filters to find what you're looking for.</p>
            <button 
              onClick={() => setFilters({ page: 1, limit: 9 })}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}