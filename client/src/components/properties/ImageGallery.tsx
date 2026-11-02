'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { PropertyImage } from '@/types';

export default function ImageGallery({ images }: { images: PropertyImage[] }) {
  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-[400px] md:h-[500px] bg-muted rounded-3xl flex items-center justify-center">
        <span className="text-muted-foreground">No images available</span>
      </div>
    );
  }

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[400px] md:h-[500px]">
        {/* Main Image */}
        <div 
          className="md:col-span-3 relative rounded-3xl overflow-hidden cursor-pointer group"
          onClick={() => setIsFullscreen(true)}
        >
          <Image
            src={images[0].url}
            alt="Main property view"
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            priority
          />
          <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <button className="absolute bottom-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-xl backdrop-blur-md transition flex items-center gap-2 text-sm opacity-0 group-hover:opacity-100">
            <Maximize2 className="w-4 h-4" /> View Fullscreen
          </button>
        </div>

        {/* Side Images */}
        <div className="hidden md:flex flex-col gap-4">
          {images.slice(1, 3).map((img, i) => (
            <div 
              key={img._id || i} 
              className="relative flex-1 rounded-3xl overflow-hidden cursor-pointer group"
              onClick={() => { setSelectedImage(i + 1); setIsFullscreen(true); }}
            >
              <Image
                src={img.url}
                alt={`Property view ${i + 2}`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {i === 1 && images.length > 3 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                  <span className="text-white font-bold text-lg">+{images.length - 3}</span>
                </div>
              )}
            </div>
          ))}
          {images.length === 2 && (
             <div className="flex-1 rounded-3xl bg-muted border border-border border-dashed flex items-center justify-center">
               <span className="text-muted-foreground text-sm">More photos coming soon</span>
             </div>
          )}
           {images.length === 1 && (
             <>
                <div className="flex-1 rounded-3xl bg-muted border border-border border-dashed flex items-center justify-center"></div>
                <div className="flex-1 rounded-3xl bg-muted border border-border border-dashed flex items-center justify-center"></div>
             </>
          )}
        </div>
      </div>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col"
          >
            <div className="flex justify-between items-center p-4">
              <span className="text-white/60 text-sm font-medium">
                {selectedImage + 1} / {images.length}
              </span>
              <button 
                onClick={() => setIsFullscreen(false)}
                className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 relative flex items-center justify-center p-4">
              <button 
                onClick={prevImage}
                className="absolute left-4 md:left-10 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition z-10"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              
              <div className="relative w-full max-w-6xl h-full max-h-[80vh]">
                <Image
                  src={images[selectedImage].url}
                  alt={`Property view ${selectedImage + 1}`}
                  fill
                  className="object-contain"
                />
              </div>

              <button 
                onClick={nextImage}
                className="absolute right-4 md:right-10 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition z-10"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </div>

            {/* Thumbnails */}
            <div className="p-4 flex justify-center gap-2 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={img._id || i}
                  onClick={() => setSelectedImage(i)}
                  className={`relative w-20 h-16 rounded-lg overflow-hidden flex-shrink-0 transition-all ${
                    selectedImage === i ? 'ring-2 ring-primary ring-offset-2 ring-offset-black opacity-100' : 'opacity-50 hover:opacity-100'
                  }`}
                >
                  <Image src={img.url} alt={`Thumbnail ${i + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
