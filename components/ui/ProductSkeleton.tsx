export default function ProductSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden flex flex-col h-full animate-pulse">
      {/* Image placeholder – matches the real card's aspect ratio */}
      <div className="relative bg-neutral-200" style={{ aspectRatio: "1 / 1" }}>
        {/* Fake discount badge */}
        <div className="absolute top-2 inset-s-2 h-5 w-14 bg-neutral-300 rounded-full" />
      </div>

      <div className="p-3 flex flex-col flex-1">
        {/* Product name */}
        <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2" />
        {/* Product meta (origin + weight) */}
        <div className="flex items-center gap-1 mb-2">
          <div className="h-4 w-4 rounded-full bg-neutral-200" />
          <div className="h-3 bg-neutral-200 rounded w-12" />
          <div className="h-3 bg-neutral-200 rounded w-6" />
          <div className="h-3 bg-neutral-200 rounded w-10" />
        </div>
        {/* Price */}
        <div className="h-6 bg-neutral-200 rounded w-1/3 mb-4" />
        {/* Add‑to‑cart button */}
        <div className="mt-auto h-10 bg-neutral-200 rounded-full" />
      </div>
    </div>
  );
}
