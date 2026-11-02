export function PropertyCardSkeleton() {
  return (
    <div className="bg-card rounded-2xl overflow-hidden border border-border shadow-sm">
      <div className="w-full h-52 skeleton" />
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="w-2/3 h-5 skeleton rounded" />
          <div className="w-16 h-5 skeleton rounded" />
        </div>
        <div className="w-3/4 h-4 skeleton rounded mb-4" />
        <div className="flex items-center gap-4 pt-3 border-t border-border">
          <div className="w-10 h-4 skeleton rounded" />
          <div className="w-10 h-4 skeleton rounded" />
          <div className="w-16 h-4 skeleton rounded ml-auto" />
        </div>
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
          <div className="w-6 h-6 rounded-full skeleton" />
          <div className="w-24 h-4 skeleton rounded" />
        </div>
      </div>
    </div>
  );
}

export function PropertiesGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <PropertyCardSkeleton key={i} />
      ))}
    </div>
  );
}
