export default function ProductDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 animate-pulse">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-1 mb-4">
        <div className="h-4 w-10 bg-neutral-200 rounded" />
        <div className="h-4 w-4 bg-neutral-200 rounded" />
        <div className="h-4 w-16 bg-neutral-200 rounded" />
        <div className="h-4 w-4 bg-neutral-200 rounded" />
        <div className="h-4 w-24 bg-neutral-200 rounded" />
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Image skeleton */}
        <div className="bg-neutral-200 rounded-2xl h-96 md:h-125" />
        {/* Details skeleton */}
        <div className="flex flex-col gap-4">
          <div className="h-6 w-20 bg-neutral-200 rounded-full" />
          <div className="h-10 w-3/4 bg-neutral-200 rounded" />
          <div className="flex gap-3">
            <div className="h-10 w-24 bg-neutral-200 rounded" />
            <div className="h-6 w-16 bg-neutral-200 rounded" />
          </div>

          <div className="border-t border-b border-neutral-200 py-3 flex gap-4">
            <div className="h-4 w-16 bg-neutral-200 rounded" />
            <div className="h-4 w-20 bg-neutral-200 rounded" />
          </div>

          <div className="flex items-center gap-4 mt-2">
            <div className="h-12 w-32 bg-neutral-200 rounded-full" />
            <div className="h-12 flex-1 bg-neutral-200 rounded-full" />
          </div>

          <div className="mt-6 border border-neutral-200 rounded-xl overflow-hidden">
            <div className="flex justify-between items-center p-4 bg-neutral-50">
              <div className="h-6 w-32 bg-neutral-200 rounded" />
              <div className="h-5 w-5 bg-neutral-200 rounded" />
            </div>
          </div>
        </div>
      </div>

      {/* Suggested products skeleton */}
      <div className="mt-16">
        <div className="h-8 w-48 bg-neutral-200 rounded mb-4" />
        <div className="flex gap-4 overflow-x-auto pb-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="min-w-62.5 sm:min-w-70 snap-start">
              <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
                <div className="h-48 bg-neutral-200" />
                <div className="p-3 space-y-2">
                  <div className="h-4 w-3/4 bg-neutral-200 rounded" />
                  <div className="h-3 w-1/2 bg-neutral-200 rounded" />
                  <div className="h-6 w-1/3 bg-neutral-200 rounded" />
                  <div className="h-10 bg-neutral-200 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
