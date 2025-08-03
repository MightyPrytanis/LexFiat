import { Mail, Brain, FileText, Send, Check, Clock, AlertTriangle, Lightbulb } from "lucide-react";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import DraftApproval from "./draft-approval";

interface WorkflowPipelineProps {
  cases?: any[];
  redFlags?: any[];
  dashboardStats?: any;
  isLoading: boolean;
}

export default function WorkflowPipeline({ cases, redFlags, dashboardStats, isLoading }: WorkflowPipelineProps) {
  const [showDraftApproval, setShowDraftApproval] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const pipelineSteps = [
    {
      id: 1,
      title: "Gmail Fetch",
      description: "Monitor incoming emails",
      icon: Mail,
      status: "active",
      count: 12,
      detail: "New emails today",
      bgColor: "bg-professional-blue bg-opacity-10",
      iconColor: "text-professional-blue",
      borderColor: "border-professional-blue"
    },
    {
      id: 2,
      title: "AI Analysis",
      description: "Claude analyzes content",
      icon: Brain,
      status: "processing",
      count: 8,
      detail: "Being analyzed",
      bgColor: "bg-accent-gold bg-opacity-10",
      iconColor: "text-rich-gold",
      borderColor: "border-accent-gold"
    },
    {
      id: 3,
      title: "Draft Response",
      description: "Generate replies",
      icon: FileText,
      status: "ready",
      count: 3,
      detail: "Awaiting review",
      bgColor: "bg-professional-blue bg-opacity-15",
      iconColor: "text-professional-blue",
      borderColor: "border-professional-blue"
    },
    {
      id: 4,
      title: "Attorney Review",
      description: "Your approval needed",
      icon: Check,
      status: "pending",
      count: 2,
      detail: "Ready for approval",
      bgColor: "bg-alert-amber bg-opacity-10",
      iconColor: "text-alert-amber",
      borderColor: "border-alert-amber"
    },
    {
      id: 5,
      title: "Send Response",
      description: "Auto-send approved",
      icon: Send,
      status: "completed",
      count: 5,
      detail: "Sent today",
      bgColor: "bg-steel-blue bg-opacity-10",
      iconColor: "text-steel-blue",
      borderColor: "border-steel-blue"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Pipeline Header */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-semibold text-deep-navy flex items-center space-x-3">
          <Lightbulb className="h-6 w-6 text-accent-gold" />
          <span className="tracking-wide">LEGAL INTELLIGENCE PIPELINE</span>
        </h2>
        <div className="text-sm text-steel-blue font-medium">
          Last updated: 2 minutes ago
        </div>
      </div>
      
      <div className="workflow-progress mb-6">
        <div className="progress-pulse"></div>
      </div>

      {/* Workflow Pipeline Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {pipelineSteps.map((step, index) => {
          const IconComponent = step.icon;
          const isActive = step.status === 'active' || step.status === 'processing';
          
          return (
            <div
              key={step.id}
              className={`relative ${step.bgColor} border-2 ${step.borderColor} rounded-lg p-5 transition-all duration-300 hover:shadow-lg ${
                isActive ? 'shadow-xl scale-105 border-accent-gold' : 'hover:border-accent-gold'
              }`}
            >
              {/* Pipeline connector - Inexorable Progress */}
              {index < pipelineSteps.length - 1 && (
                <div className="hidden md:block absolute -right-2 top-1/2 transform -translate-y-1/2 z-10">
                  <div className="w-4 h-1 bg-gradient-to-r from-professional-blue to-accent-gold rounded-full shadow-sm"></div>
                </div>
              )}

              <div className="text-center space-y-3">
                <div className={`w-14 h-14 ${step.bgColor} rounded-full flex items-center justify-center mx-auto border-2 ${step.borderColor} shadow-md`}>
                  <IconComponent className={`h-7 w-7 ${step.iconColor}`} />
                </div>
                
                <div>
                  <h3 className="font-bold text-deep-navy text-sm mb-1 tracking-wide">{step.title.toUpperCase()}</h3>
                  <p className="text-xs text-steel-blue mb-3 font-medium">{step.description}</p>
                  
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${step.iconColor} mb-1`}>
                      {step.count}
                    </div>
                    <div className="text-xs text-steel-blue font-medium">
                      {step.detail}
                    </div>
                  </div>
                </div>

                {/* Status indicator - Inevitable Progress */}
                {step.status === 'active' && (
                  <div className="absolute -top-2 -right-2">
                    <div className="w-5 h-5 bg-professional-blue rounded-full animate-pulse shadow-lg border-2 border-warm-white"></div>
                  </div>
                )}
                
                {step.status === 'processing' && (
                  <div className="absolute -top-2 -right-2">
                    <div className="w-5 h-5 bg-accent-gold rounded-full animate-spin shadow-lg border-2 border-warm-white"></div>
                  </div>
                )}

                {step.status === 'pending' && (
                  <div className="absolute -top-2 -right-2">
                    <AlertTriangle className="w-5 h-5 text-alert-amber animate-bounce drop-shadow-lg" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Buttons - Inexorable Legal Intelligence */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8 border-t-2 border-steel-blue">
        <button 
          onClick={() => setShowDraftApproval(true)}
          className="bg-professional-blue hover:bg-accent-gold text-warm-white hover:text-deep-navy font-bold py-4 px-6 rounded-lg transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg tracking-wide">
          <FileText className="h-5 w-5" />
          <span>REVIEW 2 DRAFT RESPONSES</span>
        </button>
        
        <button className="bg-accent-gold hover:bg-professional-blue text-deep-navy hover:text-warm-white font-bold py-4 px-6 rounded-lg transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg tracking-wide">
          <Check className="h-5 w-5" />
          <span>APPROVE & SEND 3 RESPONSES</span>
        </button>
        
        <button className="bg-steel-blue hover:bg-accent-gold text-warm-white hover:text-deep-navy font-bold py-4 px-6 rounded-lg transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg tracking-wide">
          <Brain className="h-5 w-5" />
          <span>VIEW AI ANALYSIS</span>
        </button>
      </div>

      {/* Task Tracking & Prioritization - Inexorable Progress */}
      <div className="bg-slate-blue rounded-lg p-8 shadow-lg border-2 border-steel-blue">
        <h3 className="text-xl font-bold text-warm-white mb-6 tracking-wide flex items-center space-x-3">
          <Clock className="h-6 w-6 text-accent-gold" />
          <span>TASK PRIORITY & COMPLETION TRACKING</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <h4 className="font-bold text-accent-gold tracking-wide">CRITICAL PRIORITY</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-warm-white rounded-lg border-l-4 border-alert-amber shadow-md">
                <span className="text-sm font-semibold text-deep-navy">TRO Response - Johnson v Johnson</span>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-alert-amber" />
                  <span className="text-xs font-bold text-alert-amber">47H</span>
                </div>
              </div>
              <div className="workflow-progress">
                <div className="progress-pulse"></div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-bold text-professional-blue tracking-wide">STANDARD PRIORITY</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-warm-white rounded-lg border-l-4 border-professional-blue shadow-md">
                <span className="text-sm font-semibold text-deep-navy">Discovery Request Review</span>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-professional-blue" />
                  <span className="text-xs font-bold text-professional-blue">3D</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-bold text-accent-gold tracking-wide">COMPLETED TODAY</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-warm-white rounded-lg border-l-4 border-accent-gold shadow-md">
                <span className="text-sm font-semibold text-deep-navy">5 Client Email Responses</span>
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-accent-gold" />
                  <span className="text-xs font-bold text-accent-gold">DONE</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Draft Approval Modal */}
      <DraftApproval 
        isOpen={showDraftApproval}
        onClose={() => setShowDraftApproval(false)}
      />
    </div>
  );
}