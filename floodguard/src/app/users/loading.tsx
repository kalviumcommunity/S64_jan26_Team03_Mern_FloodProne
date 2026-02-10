export default function Loading() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="h-10 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-6"></div>
      
      {/* Add User Skeleton */}
      <div className="h-32 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-6"></div>

      {/* User List Skeleton */}
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-20 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse border border-gray-300 dark:border-gray-600"></div>
        ))}
      </div>
    </div>
  );
}
