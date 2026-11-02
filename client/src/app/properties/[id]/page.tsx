'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { MapPin, Bed, Bath, Maximize, Calendar, Check, Mail, Phone, Heart, Share2, AlertCircle } from 'lucide-react';
import { propertyService } from '@/services/propertyService';
import { inquiryService } from '@/services/propertyService';
import { Property } from '@/types';
import { formatPrice, formatArea, timeAgo } from '@/lib/utils';
import ImageGallery from '@/components/properties/ImageGallery';
import PropertyCard from '@/components/properties/PropertyCard';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

export default function PropertyDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [property, setProperty] = useState<Property | null>(null);
  const [related, setRelated] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [inquiryMsg, setInquiryMsg] = useState('');
  const [sendingInquiry, setSendingInquiry] = useState(false);
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const data = await propertyService.getProperty(id);
        setProperty(data.property);
        setRelated(data.related);
      } catch (error) {
        console.error('Failed to fetch property details', error);
        toast.error('Property not found');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const handleInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to send an inquiry');
      return;
    }
    
    if (!inquiryMsg.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setSendingInquiry(true);
    try {
      await inquiryService.sendInquiry({
        propertyId: id,
        message: inquiryMsg,
      });
      toast.success('Inquiry sent successfully!');
      setInquiryMsg('');
    } catch (error) {
      toast.error('Failed to send inquiry');
    } finally {
      setSendingInquiry(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex justify-center items-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!property) return null;

  return (
    <div className="min-h-screen bg-background pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-3 py-1 rounded-lg text-sm font-bold uppercase tracking-wide text-white ${property.status === 'sale' ? 'bg-blue-600' : 'bg-emerald-600'}`}>
                For {property.status}
              </span>
              <span className="px-3 py-1 rounded-lg text-sm font-semibold capitalize bg-muted text-foreground">
                {property.type}
              </span>
              <span className="text-sm text-muted-foreground">Listed {timeAgo(property.createdAt)}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{property.title}</h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4 text-primary" />
              <span>{property.location.address}, {property.location.city}, {property.location.province}</span>
            </div>
          </div>
          <div className="flex flex-col items-start md:items-end gap-3">
            <div className="text-3xl md:text-4xl font-extrabold text-primary">
              {formatPrice(property.price, property.status)}
            </div>
            <div className="flex gap-2">
              <button onClick={copyLink} className="p-2.5 rounded-xl border border-border bg-card hover:bg-muted transition flex items-center gap-2 shadow-sm">
                <Share2 className="w-4 h-4" /> <span className="text-sm font-medium">Share</span>
              </button>
            </div>
          </div>
        </div>

        {/* Gallery */}
        <div className="mb-10">
          <ImageGallery images={property.images} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-10">
            
            {/* Quick Stats */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-wrap gap-y-6 gap-x-12">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bed className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Bedrooms</p>
                  <p className="font-bold text-lg">{property.bedrooms || '-'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bath className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Bathrooms</p>
                  <p className="font-bold text-lg">{property.bathrooms || '-'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Maximize className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Area</p>
                  <p className="font-bold text-lg">{formatArea(property.area)}</p>
                </div>
              </div>
              {property.yearBuilt && (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Year Built</p>
                    <p className="font-bold text-lg">{property.yearBuilt}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <h3 className="text-2xl font-bold mb-4">Description</h3>
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm prose dark:prose-invert max-w-none">
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {property.description}
                </p>
              </div>
            </div>

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <div>
                <h3 className="text-2xl font-bold mb-4">Amenities</h3>
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {property.amenities.map(amenity => (
                      <div key={amenity} className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                          <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <span className="text-sm font-medium">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Features */}
            {property.features && property.features.length > 0 && (
              <div>
                <h3 className="text-2xl font-bold mb-4">Key Features</h3>
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    {property.features.map(feature => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Agent Info */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm sticky top-24">
              <h3 className="text-xl font-bold mb-6">Contact Agent</h3>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border-2 border-border relative">
                  {property.agent.avatar?.url ? (
                    <Image src={property.agent.avatar.url} alt={property.agent.name} fill className="object-cover" />
                  ) : (
                    <span className="text-xl font-bold text-primary">{property.agent.name[0]}</span>
                  )}
                </div>
                <div>
                  <p className="font-bold text-lg">{property.agent.name}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-blue-500" /> Verified Agent
                  </p>
                </div>
              </div>

              {property.agent.phone && (
                <div className="flex items-center gap-3 p-3 bg-muted rounded-xl mb-3">
                  <Phone className="w-5 h-5 text-primary" />
                  <span className="font-medium">{property.agent.phone}</span>
                </div>
              )}
              
              <div className="flex items-center gap-3 p-3 bg-muted rounded-xl mb-6">
                <Mail className="w-5 h-5 text-primary" />
                <span className="font-medium truncate">{property.agent.email}</span>
              </div>

              <form onSubmit={handleInquiry} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Message</label>
                  <textarea
                    rows={4}
                    value={inquiryMsg}
                    onChange={(e) => setInquiryMsg(e.target.value)}
                    placeholder="I am interested in this property..."
                    className="w-full p-3 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/30 outline-none resize-none"
                  />
                </div>
                {!isAuthenticated && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 rounded-lg text-xs flex gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <p>You must be logged in to send an inquiry.</p>
                  </div>
                )}
                <button
                  type="submit"
                  disabled={sendingInquiry || !isAuthenticated}
                  className="w-full py-3.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition shadow-md disabled:opacity-50"
                >
                  {sendingInquiry ? 'Sending...' : 'Send Inquiry'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Related Properties */}
        {related && related.length > 0 && (
          <div className="mt-20 pt-10 border-t border-border">
            <h2 className="text-2xl font-bold mb-6">Similar Properties in {property.location.city}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map(relProp => (
                <PropertyCard key={relProp._id} property={relProp} />
              ))}
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
}
