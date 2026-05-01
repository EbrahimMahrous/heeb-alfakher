import ProductSkeleton from "./ProductSkeleton";

export default function CartSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 animate-pulse">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 mb-6">
        <div className="h-4 w-10 bg-neutral-200 rounded" />
        <div className="h-4 w-4 bg-neutral-200 rounded" />
        <div className="h-4 w-12 bg-neutral-200 rounded" />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Items skeletons */}
        <div className="lg:col-span-2 space-y-6">
          <div className="h-8 w-48 bg-neutral-200 rounded" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex gap-4 border-b border-neutral-200 pb-6"
            >
              <div className="w-24 h-24 bg-neutral-200 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-5 w-3/4 bg-neutral-200 rounded" />
                <div className="h-4 w-24 bg-neutral-200 rounded-full" />
                <div className="h-6 w-20 bg-neutral-200 rounded" />
              </div>
              <div className="flex flex-col items-end gap-3">
                <div className="h-10 w-24 bg-neutral-200 rounded-full" />
                <div className="h-5 w-5 bg-neutral-200 rounded" />
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary skeleton */}
        <div className="bg-white border border-neutral-200 p-6 rounded-2xl shadow-lg h-fit sticky top-24 space-y-4">
          <div className="h-6 w-36 bg-neutral-200 rounded mx-auto" />
          <div className="flex justify-between">
            <div className="h-4 w-16 bg-neutral-200 rounded" />
            <div className="h-4 w-12 bg-neutral-200 rounded" />
          </div>
          <div className="flex justify-between border-b pb-3">
            <div className="h-4 w-16 bg-neutral-200 rounded" />
            <div className="h-4 w-12 bg-neutral-200 rounded" />
          </div>
          <div className="pt-2">
            <div className="flex justify-between">
              <div className="h-5 w-12 bg-neutral-200 rounded" />
              <div className="h-5 w-16 bg-neutral-200 rounded" />
            </div>
          </div>
          <div className="h-10 w-full bg-neutral-200 rounded-full" />
          <div className="h-4 w-36 bg-neutral-200 rounded mx-auto" />
        </div>
      </div>

      {/* Suggested products skeleton */}
      <div className="mt-16">
        <div className="h-8 w-48 bg-neutral-200 rounded mb-4" />
        <div className="flex gap-4 overflow-x-auto pb-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="min-w-62.5 sm:min-w-70 snap-start">
              <ProductSkeleton />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
