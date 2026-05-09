export default function CategoriesSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      {/* Simulate multiple categories */}
      {Array.from({ length: 4 }).map((_, catIdx) => (
        <div key={catIdx} className="border-b border-neutral-200 pb-8">
          {/* Category title placeholder */}
          <div className="flex items-baseline gap-3 mb-4">
            <div className="h-6 w-32 bg-neutral-200 rounded" />
            <div className="h-4 w-12 bg-neutral-200 rounded" />
          </div>

          {/* Products row placeholder */}
          <div className="flex gap-5 pb-4">
            {Array.from({ length: 6 }).map((_, prodIdx) => (
              <div key={prodIdx} className="shrink-0 w-36 sm:w-40">
                {/* Image placeholder */}
                <div className="w-32 h-32 mx-auto rounded-lg bg-neutral-200" />
                {/* Text placeholder */}
                <div className="mt-2 h-4 w-24 mx-auto bg-neutral-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
