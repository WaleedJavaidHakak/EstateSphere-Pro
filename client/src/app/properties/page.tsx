import { Suspense } from 'react';
import PropertiesContent from './PropertiesContent';

export default function PropertiesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading properties...</p>
            </div>
          </div>
        </div>
      </div>
    }>
      <PropertiesContent />
    </Suspense>
  );
}