import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen } from "lucide-react";

export default function StudentLoading() {
  return (
    <div className="flex-1 p-8 pt-6 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-5 w-48" />
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-32 rounded-full" />
        </div>
      </div>

      {/* Stats/Welcome Banner Skeleton */}
      <div className="glass-panel p-8 rounded-[2rem] relative overflow-hidden">
        <div className="relative z-10 flex justify-between items-center">
          <div className="space-y-4">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-6 w-72" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="hidden md:block">
            <Skeleton className="h-32 w-32 rounded-full" />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content Area Skeleton */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2 mb-6">
            <BookOpen className="h-5 w-5 text-primary/50" />
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="glass-panel p-6 rounded-3xl flex flex-col h-[280px]">
                <Skeleton className="h-12 w-12 rounded-2xl mb-4" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-auto" />
                
                <div className="space-y-4 mt-6">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-10 w-full rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Area Skeleton */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-6 rounded-3xl min-h-[400px]">
            <Skeleton className="h-6 w-32 mb-6" />
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-4 items-center p-3 rounded-2xl bg-card/30">
                  <Skeleton className="h-12 w-12 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
