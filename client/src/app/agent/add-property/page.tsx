'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { propertyService } from '@/services/propertyService';
import { PROPERTY_TYPES, AMENITIES_LIST, PAKISTANI_CITIES } from '@/lib/utils';
import toast from 'react-hot-toast';
import { Plus, X, UploadCloud } from 'lucide-react';

const propertySchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  price: z.number().min(1, 'Price must be greater than 0'),
  type: z.string().min(1, 'Please select a type'),
  status: z.enum(['sale', 'rent']),
  bedrooms: z.number().min(0),
  bathrooms: z.number().min(0),
  area: z.number().min(1, 'Area is required'),
  yearBuilt: z.number().optional(),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(1, 'City is required'),
});

type PropertyForm = z.infer<typeof propertySchema>;

export default function AddPropertyPage() {
  const router = useRouter();
  const [images, setImages] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [features, setFeatures] = useState<string[]>([]);
  const [featureInput, setFeatureInput] = useState('');
  const [amenities, setAmenities] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<PropertyForm>({
    resolver: zodResolver(propertySchema),
    defaultValues: { status: 'sale', bedrooms: 0, bathrooms: 0 }
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      if (images.length + filesArray.length > 10) {
        toast.error('Maximum 10 images allowed');
        return;
      }
      setImages(prev => [...prev, ...filesArray]);
      
      const newPreviews = filesArray.map(file => URL.createObjectURL(file));
      setImagePreview(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreview(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const addFeature = () => {
    if (featureInput.trim() && !features.includes(featureInput.trim())) {
      setFeatures(prev => [...prev, featureInput.trim()]);
      setFeatureInput('');
    }
  };

  const toggleAmenity = (amenity: string) => {
    setAmenities(prev => 
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  const onSubmit = async (data: PropertyForm) => {
    if (images.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('price', data.price.toString());
      formData.append('type', data.type);
      formData.append('status', data.status);
      formData.append('bedrooms', data.bedrooms.toString());
      formData.append('bathrooms', data.bathrooms.toString());
      formData.append('area', data.area.toString());
      if (data.yearBuilt) formData.append('yearBuilt', data.yearBuilt.toString());
      
      formData.append('location', JSON.stringify({
        address: data.address,
        city: data.city,
      }));

      formData.append('features', JSON.stringify(features));
      formData.append('amenities', JSON.stringify(amenities));

      images.forEach(img => formData.append('images', img));

      await propertyService.createProperty(formData);
      toast.success('Property listed successfully! Pending admin approval.');
      router.push('/agent/properties');
    } catch (error) {
      toast.error('Failed to create property');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Add New Property</h1>
        <p className="text-muted-foreground mt-1">Fill out the details to list your property on the platform.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Details */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-4">
          <h2 className="text-xl font-semibold mb-4 border-b border-border pb-2">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Property Title *</label>
              <input {...register('title')} className="w-full p-3 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/30" placeholder="e.g. Modern 4 Bed Villa in DHA" />
              {errors.title && <p className="text-xs text-destructive mt-1">{errors.title.message}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Description *</label>
              <textarea {...register('description')} rows={5} className="w-full p-3 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/30" placeholder="Describe the property in detail..." />
              {errors.description && <p className="text-xs text-destructive mt-1">{errors.description.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Price (PKR) *</label>
              <input type="number" {...register('price', { valueAsNumber: true })} className="w-full p-3 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/30" placeholder="e.g. 50000000" />
              {errors.price && <p className="text-xs text-destructive mt-1">{errors.price.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Purpose *</label>
              <select {...register('status')} className="w-full p-3 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/30">
                <option value="sale">For Sale</option>
                <option value="rent">For Rent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Property Type *</label>
              <select {...register('type')} className="w-full p-3 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/30">
                <option value="">Select Type...</option>
                {PROPERTY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              {errors.type && <p className="text-xs text-destructive mt-1">{errors.type.message}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Area (sq ft) *</label>
              <input type="number" {...register('area', { valueAsNumber: true })} className="w-full p-3 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/30" placeholder="e.g. 4500" />
              {errors.area && <p className="text-xs text-destructive mt-1">{errors.area.message}</p>}
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-4">
          <h2 className="text-xl font-semibold mb-4 border-b border-border pb-2">Location Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Address *</label>
              <input {...register('address')} className="w-full p-3 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/30" placeholder="e.g. House 123, Street 4, Sector G-11" />
              {errors.address && <p className="text-xs text-destructive mt-1">{errors.address.message}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">City *</label>
              <select {...register('city')} className="w-full p-3 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/30">
                <option value="">Select City...</option>
                {PAKISTANI_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.city && <p className="text-xs text-destructive mt-1">{errors.city.message}</p>}
            </div>
          </div>
        </div>

        {/* Features & Amenities */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-6">
          <h2 className="text-xl font-semibold mb-4 border-b border-border pb-2">Features & Amenities</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Bedrooms</label>
              <input type="number" {...register('bedrooms', { valueAsNumber: true })} className="w-full p-3 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Bathrooms</label>
              <input type="number" {...register('bathrooms', { valueAsNumber: true })} className="w-full p-3 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Year Built (Optional)</label>
              <input type="number" {...register('yearBuilt', { valueAsNumber: true })} className="w-full p-3 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/30" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Amenities</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {AMENITIES_LIST.map(amenity => (
                <label key={amenity} className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={amenities.includes(amenity)}
                    onChange={() => toggleAmenity(amenity)}
                    className="w-4 h-4 text-primary rounded focus:ring-primary"
                  />
                  <span className="text-sm">{amenity}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Additional Features</label>
            <div className="flex gap-2 mb-3">
              <input 
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                className="flex-1 p-3 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/30" 
                placeholder="e.g. Marble Floors"
              />
              <button type="button" onClick={addFeature} className="px-4 py-3 bg-muted hover:bg-muted/80 rounded-xl font-medium">Add</button>
            </div>
            {features.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {features.map((feature, i) => (
                  <span key={i} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm flex items-center gap-1">
                    {feature} <button type="button" onClick={() => setFeatures(prev => prev.filter((_, idx) => idx !== i))}><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Images */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-4">
          <h2 className="text-xl font-semibold mb-4 border-b border-border pb-2">Images * (Max 10)</h2>
          
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-border border-dashed rounded-xl cursor-pointer bg-background hover:bg-muted transition">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <UploadCloud className="w-10 h-10 text-muted-foreground mb-3" />
                <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                <p className="text-xs text-muted-foreground">PNG, JPG or WEBP (Max. 10MB)</p>
              </div>
              <input type="file" className="hidden" multiple accept="image/*" onChange={handleImageChange} />
            </label>
          </div>

          {imagePreview.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
              {imagePreview.map((src, i) => (
                <div key={i} className="relative aspect-video rounded-lg overflow-hidden border border-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="Preview" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition shadow-md disabled:opacity-50"
          >
            {isSubmitting ? 'Publishing...' : 'Publish Property'}
          </button>
        </div>
      </form>
    </div>
  );
}
