export default function ProductSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden flex flex-col h-full animate-pulse">
      <div className="h-48 bg-neutral-200" />
      <div className="p-3 flex flex-col flex-1">
        <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2" />
        <div className="h-3 bg-neutral-200 rounded w-1/2 mb-2" />
        <div className="h-6 bg-neutral-200 rounded w-1/3 mb-4" />
        <div className="mt-auto h-10 bg-neutral-200 rounded-full" />
      </div>
    </div>
  );
}
