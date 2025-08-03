import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import AlertsBanner from "@/components/dashboard/alerts-banner";
import ActiveCases from "@/components/dashboard/active-cases";
import WorkflowModules from "@/components/dashboard/workflow-modules";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: attorney, isLoading: attorneyLoading } = useQuery({
    queryKey: ["/api/attorneys/profile"],
  });

  const { data: cases, isLoading: casesLoading } = useQuery({
    queryKey: ["/api/cases"],
  });

  const { data: redFlags, isLoading: redFlagsLoading } = useQuery({
    queryKey: ["/api/red-flags"],
  });

  const { data: dashboardStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const urgentRedFlags = (redFlags as any[])?.filter((flag: any) => 
    flag.severity === 'critical' || flag.severity === 'high'
  ) || [];

  if (attorneyLoading) {
    return (
      <div className="min-h-screen bg-navy">
        <div className="flex">
          <div className="w-64 bg-charcoal p-6">
            <Skeleton className="h-8 w-32 mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </div>
          <div className="flex-1 p-6">
            <Skeleton className="h-12 w-96 mb-6" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-64 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy text-warm-white">
      <Header attorney={attorney as any} />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-8 overflow-y-auto">
          {/* Dashboard Header - Simplified */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-serif font-bold mb-1">Legal Intelligence Dashboard</h1>
                <p className="text-gray-400 text-sm">
                  {statsLoading ? (
                    <Skeleton className="h-3 w-80" />
                  ) : (
                    `${(dashboardStats as any)?.activeCases || 0} active matters • ${urgentRedFlags.length} urgent alerts • Last sync: ${(dashboardStats as any)?.lastSync || 'Unknown'}`
                  )}
                </p>
              </div>
            </div>

            {/* Alerts Banner */}
            {urgentRedFlags.length > 0 && (
              <AlertsBanner redFlags={urgentRedFlags} />
            )}
          </div>

          {/* Active Cases and Workflow Status */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
            <ActiveCases 
              cases={cases as any} 
              redFlags={redFlags as any}
              isLoading={casesLoading || redFlagsLoading} 
            />
          </div>

          {/* Workflow Modules */}
          <WorkflowModules dashboardStats={dashboardStats as any} isLoading={statsLoading} />
        </main>
      </div>
    </div>
  );
}
