export default function CategorySkeleton() {
  return (
    <div className="flex flex-col items-center text-center animate-pulse">
      <div className="w-24 h-24 md:w-28 md:h-28 bg-neutral-200 rounded-full" />
      <div className="mt-3 h-4 w-16 bg-neutral-200 rounded" />
    </div>
  );
}