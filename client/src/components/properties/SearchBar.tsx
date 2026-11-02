'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Home, ChevronDown, SlidersHorizontal } from 'lucide-react';
import { cn, PROPERTY_TYPES, PAKISTANI_CITIES } from '@/lib/utils';
import { motion } from 'framer-motion';

interface SearchBarProps {
  variant?: 'hero' | 'inline';
  initialValues?: {
    keyword?: string;
    city?: string;
    type?: string;
    status?: string;
  };
}

export default function SearchBar({ variant = 'hero', initialValues = {} }: SearchBarProps) {
  const router = useRouter();
  const [keyword, setKeyword] = useState(initialValues.keyword || '');
  const [city, setCity] = useState(initialValues.city || '');
  const [type, setType] = useState(initialValues.type || '');
  const [status, setStatus] = useState(initialValues.status || '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword) params.set('keyword', keyword);
    if (city) params.set('city', city);
    if (type) params.set('type', type);
    if (status) params.set('status', status);
    router.push(`/properties?${params.toString()}`);
  };

  if (variant === 'inline') {
    return (
      <form onSubmit={handleSearch} className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-muted-foreground mb-1">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Keywords..."
              className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
          </div>
        </div>
        <div className="min-w-[150px]">
          <label className="block text-xs font-medium text-muted-foreground mb-1">City</label>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
          >
            <option value="">All Cities</option>
            {PAKISTANI_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="min-w-[130px]">
          <label className="block text-xs font-medium text-muted-foreground mb-1">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
          >
            <option value="">All Types</option>
            {PROPERTY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div className="min-w-[120px]">
          <label className="block text-xs font-medium text-muted-foreground mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
          >
            <option value="">Buy or Rent</option>
            <option value="sale">For Sale</option>
            <option value="rent">For Rent</option>
          </select>
        </div>
        <button
          type="submit"
          className="px-6 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-all shadow-sm flex items-center gap-2"
        >
          <Search className="w-4 h-4" /> Search
        </button>
      </form>
    );
  }

  return (
    <motion.form
      onSubmit={handleSearch}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white/95 dark:bg-card/95 backdrop-blur-xl rounded-2xl shadow-2xl p-2 w-full max-w-4xl"
    >
      {/* Status Tabs */}
      <div className="flex gap-1 mb-2 px-1">
        {['', 'sale', 'rent'].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatus(s)}
            className={cn(
              'px-4 py-1.5 rounded-lg text-xs font-semibold transition-all',
              status === s ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {s === '' ? 'All' : s === 'sale' ? 'Buy' : 'Rent'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-1">
        {/* Keyword */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Search properties..."
            className="w-full pl-9 pr-4 py-3.5 rounded-xl bg-muted/50 text-sm focus:outline-none focus:bg-muted transition text-foreground placeholder:text-muted-foreground"
          />
        </div>

        {/* City */}
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full pl-9 pr-4 py-3.5 rounded-xl bg-muted/50 text-sm focus:outline-none focus:bg-muted transition appearance-none text-foreground"
          >
            <option value="">All Cities</option>
            {PAKISTANI_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Type */}
        <div className="relative">
          <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full pl-9 pr-4 py-3.5 rounded-xl bg-muted/50 text-sm focus:outline-none focus:bg-muted transition appearance-none text-foreground"
          >
            <option value="">Property Type</option>
            {PROPERTY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        {/* Search Button */}
        <button
          type="submit"
          className="w-full py-3.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold text-sm transition-all shadow-md hover:shadow-primary/40 flex items-center justify-center gap-2"
        >
          <Search className="w-4 h-4" />
          Search Now
        </button>
      </div>
    </motion.form>
  );
}
