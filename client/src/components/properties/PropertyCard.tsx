'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Heart, Bed, Bath, Maximize, MapPin, Star } from 'lucide-react';
import { Property } from '@/types';
import { cn, formatPrice, formatArea, truncate } from '@/lib/utils';
import { favoriteService } from '@/services/propertyService';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import { useState } from 'react';

interface PropertyCardProps {
  property: Property;
  isFavorited?: boolean;
  onFavoriteToggle?: (id: string) => void;
}

export default function PropertyCard({ property, isFavorited = false, onFavoriteToggle }: PropertyCardProps) {
  const { isAuthenticated } = useAuthStore();
  const [liked, setLiked] = useState(isFavorited);
  const [likeLoading, setLikeLoading] = useState(false);

  const mainImage = property.images?.[0]?.url || 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800';

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Please login to save favorites');
      return;
    }

    setLikeLoading(true);
    try {
      if (liked) {
        await favoriteService.removeFavorite(property._id);
        toast.success('Removed from favorites');
      } else {
        await favoriteService.addFavorite(property._id);
        toast.success('Added to favorites!');
      }
      setLiked(!liked);
      onFavoriteToggle?.(property._id);
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLikeLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group"
    >
      <Link href={`/properties/${property._id}`}>
        <div className="bg-card rounded-2xl overflow-hidden border border-border card-hover shadow-sm">
          {/* Image */}
          <div className="relative h-52 overflow-hidden">
            <Image
              src={mainImage}
              alt={property.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {/* Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

            {/* Badges */}
            <div className="absolute top-3 left-3 flex gap-2">
              <span className={cn(
                'px-2.5 py-1 rounded-lg text-xs font-semibold uppercase tracking-wide',
                property.status === 'sale'
                  ? 'bg-blue-600 text-white'
                  : 'bg-emerald-600 text-white'
              )}>
                For {property.status}
              </span>
              {property.isFeatured && (
                <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500 text-white flex items-center gap-1">
                  <Star className="w-3 h-3 fill-white" /> Featured
                </span>
              )}
            </div>

            {/* Favorite button */}
            <button
              onClick={handleFavorite}
              disabled={likeLoading}
              className={cn(
                'absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200',
                liked
                  ? 'bg-red-500 text-white shadow-lg'
                  : 'bg-white/90 text-gray-600 hover:bg-red-50 hover:text-red-500 shadow'
              )}
            >
              <Heart className={cn('w-4 h-4', liked && 'fill-white')} />
            </button>

            {/* Price on image */}
            <div className="absolute bottom-3 left-3">
              <span className="bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-sm font-bold">
                {formatPrice(property.price, property.status)}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold text-foreground text-base leading-snug group-hover:text-primary transition-colors line-clamp-1">
                {property.title}
              </h3>
              <span className="text-xs text-muted-foreground capitalize whitespace-nowrap bg-muted px-2 py-0.5 rounded-md">
                {property.type}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-3">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-primary" />
              <span className="truncate">{property.location.address}, {property.location.city}</span>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm border-t border-border pt-3">
              {property.bedrooms > 0 && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Bed className="w-4 h-4 text-primary/70" />
                  <span className="font-medium text-foreground">{property.bedrooms}</span>
                  <span className="text-xs">Beds</span>
                </div>
              )}
              {property.bathrooms > 0 && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Bath className="w-4 h-4 text-primary/70" />
                  <span className="font-medium text-foreground">{property.bathrooms}</span>
                  <span className="text-xs">Baths</span>
                </div>
              )}
              {property.area && (
                <div className="flex items-center gap-1.5 text-muted-foreground ml-auto">
                  <Maximize className="w-3.5 h-3.5 text-primary/70" />
                  <span className="text-xs">{formatArea(property.area)}</span>
                </div>
              )}
            </div>

            {/* Agent */}
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold overflow-hidden">
                {property.agent?.avatar?.url ? (
                  <Image src={property.agent.avatar.url} alt={property.agent.name} width={24} height={24} className="object-cover rounded-full" />
                ) : (
                  property.agent?.name?.[0] || 'A'
                )}
              </div>
              <span className="text-xs text-muted-foreground">{property.agent?.name || 'Agent'}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
