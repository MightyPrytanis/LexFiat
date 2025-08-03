import { useQuery } from "@tanstack/react-query";
import { Lightbulb } from "lucide-react";
import Header from "@/components/layout/header";
import WorkflowPipeline from "@/components/dashboard/workflow-pipeline";
import AlertsBanner from "@/components/dashboard/alerts-banner";
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
      <div className="min-h-screen bg-light-blue">
        <div className="bg-slate-blue h-20 border-b-2 border-steel-blue">
          <Skeleton className="h-full w-full" />
        </div>
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="bg-warm-white rounded-xl p-8 shadow-xl border-2 border-steel-blue">
            <Skeleton className="h-12 w-96 mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-blue">
      <Header attorney={attorney as any} />
      
      <main className="max-w-7xl mx-auto px-8 py-8">
        {/* LexFiat's Unique Value: Adaptive Workflow Intelligence */}
        <div className="mb-8">
          <div className="bg-warm-white rounded-xl p-8 shadow-xl border-2 border-steel-blue">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-serif font-bold text-deep-navy mb-2">
                  Document Analysis & Response
                </h1>
                <p className="text-steel-blue text-lg font-medium">
                  Active workflow for Johnson v Johnson (Oakland County)
                </p>
              </div>
              <div className="flex items-center space-x-6">
                <div className="text-right">
                  <p className="text-sm text-steel-blue font-semibold tracking-wide">TRO RESPONSE DUE</p>
                  <p className="text-3xl font-bold text-alert-amber">47 hours</p>
                  <div className="workflow-progress mt-2">
                    <div className="progress-pulse"></div>
                  </div>
                </div>
                <div className="relative w-16 h-16 edison-bulb">
                  <div className="edison-filament"></div>
                  <div className="light-rays"></div>
                </div>
              </div>
            </div>

            {/* Emergency Alerts */}
            {urgentRedFlags.length > 0 && (
              <div className="mb-6">
                <AlertsBanner redFlags={urgentRedFlags} />
              </div>
            )}

            {/* Workflow Pipeline - LexFiat's Core Value */}
            <WorkflowPipeline 
              cases={cases as any}
              redFlags={redFlags as any}
              dashboardStats={dashboardStats as any}
              isLoading={casesLoading || redFlagsLoading || statsLoading}
            />
          </div>
        </div>

        {/* Secondary Workflows - Uniform and Inevitable */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-blue rounded-lg p-6 shadow-lg border-2 border-steel-blue">
            <h3 className="text-lg font-semibold text-warm-white mb-2">Emergency Response</h3>
            <p className="text-sm text-light-blue mb-4">Ready for urgent motions & TROs</p>
            <div className="workflow-progress mb-4">
              <div className="progress-pulse"></div>
            </div>
            <button className="w-full bg-professional-blue hover:bg-accent-gold text-warm-white hover:text-deep-navy font-semibold py-3 rounded-md transition-all duration-300 tracking-wide">
              ACTIVATE WORKFLOW
            </button>
          </div>
          
          <div className="bg-slate-blue rounded-lg p-6 shadow-lg border-2 border-steel-blue">
            <h3 className="text-lg font-semibold text-warm-white mb-2">Discovery Management</h3>
            <p className="text-sm text-light-blue mb-4">Automated discovery tracking</p>
            <div className="workflow-progress mb-4">
              <div className="progress-pulse"></div>
            </div>
            <button className="w-full bg-professional-blue hover:bg-accent-gold text-warm-white hover:text-deep-navy font-semibold py-3 rounded-md transition-all duration-300 tracking-wide">
              ACTIVATE WORKFLOW
            </button>
          </div>
          
          <div className="bg-slate-blue rounded-lg p-6 shadow-lg border-2 border-steel-blue">
            <h3 className="text-lg font-semibold text-warm-white mb-2">Settlement Negotiation</h3>
            <p className="text-sm text-light-blue mb-4">AI-assisted negotiation support</p>
            <div className="workflow-progress mb-4">
              <div className="progress-pulse"></div>
            </div>
            <button className="w-full bg-professional-blue hover:bg-accent-gold text-warm-white hover:text-deep-navy font-semibold py-3 rounded-md transition-all duration-300 tracking-wide">
              ACTIVATE WORKFLOW
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
