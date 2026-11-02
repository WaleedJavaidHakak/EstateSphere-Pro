'use client';

import { useEffect, useState } from 'react';
import { favoriteService } from '@/services/propertyService';
import { Favorite } from '@/types';
import PropertyCard from '@/components/properties/PropertyCard';
import { PropertiesGridSkeleton } from '@/components/ui/Skeletons';
import Link from 'next/link';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const data = await favoriteService.getFavorites();
      setFavorites(data.favorites);
    } catch (error) {
      console.error('Error fetching favorites', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteToggle = (id: string) => {
    setFavorites(prev => prev.filter(fav => fav.property._id !== id));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Favorites</h1>
        <p className="text-muted-foreground mt-1">Properties you've saved for later.</p>
      </div>

      {loading ? (
        <PropertiesGridSkeleton count={3} />
      ) : favorites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((fav) => (
            <div key={fav._id}>
              {/* @ts-ignore - The populated property has all required fields */}
              <PropertyCard 
                property={fav.property} 
                isFavorited={true}
                onFavoriteToggle={handleFavoriteToggle}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-card rounded-2xl border border-border border-dashed">
          <h3 className="text-xl font-bold mb-2">No favorites yet</h3>
          <p className="text-muted-foreground mb-6">Start exploring properties and save your favorites here.</p>
          <Link href="/properties" className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition">
            Browse Properties
          </Link>
        </div>
      )}
    </div>
  );
}
