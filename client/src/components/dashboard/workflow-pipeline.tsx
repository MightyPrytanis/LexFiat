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
      bgColor: "bg-aqua bg-opacity-10",
      iconColor: "text-aqua",
      borderColor: "border-aqua"
    },
    {
      id: 2,
      title: "AI Analysis",
      description: "Claude analyzes content",
      icon: Brain,
      status: "processing",
      count: 8,
      detail: "Being analyzed",
      bgColor: "bg-edison-gold bg-opacity-10",
      iconColor: "text-yellow-600",
      borderColor: "border-yellow-400"
    },
    {
      id: 3,
      title: "Draft Response",
      description: "Generate replies",
      icon: FileText,
      status: "ready",
      count: 3,
      detail: "Awaiting review",
      bgColor: "bg-light-green bg-opacity-10",
      iconColor: "text-light-green",
      borderColor: "border-light-green"
    },
    {
      id: 4,
      title: "Attorney Review",
      description: "Your approval needed",
      icon: Check,
      status: "pending",
      count: 2,
      detail: "Ready for approval",
      bgColor: "bg-alert-red bg-opacity-10",
      iconColor: "text-alert-red",
      borderColor: "border-alert-red"
    },
    {
      id: 5,
      title: "Send Response",
      description: "Auto-send approved",
      icon: Send,
      status: "completed",
      count: 5,
      detail: "Sent today",
      bgColor: "bg-charcoal bg-opacity-10",
      iconColor: "text-charcoal",
      borderColor: "border-charcoal"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Pipeline Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-navy flex items-center space-x-2">
          <Lightbulb className="h-5 w-5 text-edison-gold" />
          <span>Legal Intelligence Pipeline</span>
        </h2>
        <div className="text-sm text-charcoal">
          Last updated: 2 minutes ago
        </div>
      </div>

      {/* Workflow Pipeline Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {pipelineSteps.map((step, index) => {
          const IconComponent = step.icon;
          const isActive = step.status === 'active' || step.status === 'processing';
          
          return (
            <div
              key={step.id}
              className={`relative ${step.bgColor} border-2 ${step.borderColor} rounded-lg p-4 transition-all duration-200 hover:shadow-md ${
                isActive ? 'shadow-lg scale-105' : ''
              }`}
            >
              {/* Pipeline connector */}
              {index < pipelineSteps.length - 1 && (
                <div className="hidden md:block absolute -right-2 top-1/2 transform -translate-y-1/2 z-10">
                  <div className="w-4 h-0.5 bg-light-navy"></div>
                </div>
              )}

              <div className="text-center space-y-3">
                <div className={`w-12 h-12 ${step.bgColor} rounded-full flex items-center justify-center mx-auto border ${step.borderColor}`}>
                  <IconComponent className={`h-6 w-6 ${step.iconColor}`} />
                </div>
                
                <div>
                  <h3 className="font-semibold text-navy text-sm mb-1">{step.title}</h3>
                  <p className="text-xs text-charcoal mb-2">{step.description}</p>
                  
                  <div className="text-center">
                    <div className={`text-xl font-bold ${step.iconColor} mb-1`}>
                      {step.count}
                    </div>
                    <div className="text-xs text-charcoal">
                      {step.detail}
                    </div>
                  </div>
                </div>

                {/* Status indicator */}
                {step.status === 'active' && (
                  <div className="absolute -top-2 -right-2">
                    <div className="w-4 h-4 bg-aqua rounded-full animate-pulse"></div>
                  </div>
                )}
                
                {step.status === 'processing' && (
                  <div className="absolute -top-2 -right-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded-full animate-spin"></div>
                  </div>
                )}

                {step.status === 'pending' && (
                  <div className="absolute -top-2 -right-2">
                    <AlertTriangle className="w-4 h-4 text-alert-red animate-bounce" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Buttons - LexFiat's Unique Value */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-light-navy">
        <button 
          onClick={() => setShowDraftApproval(true)}
          className="bg-aqua hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2">
          <FileText className="h-4 w-4" />
          <span>Review 2 Draft Responses</span>
        </button>
        
        <button className="bg-light-green hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2">
          <Check className="h-4 w-4" />
          <span>Approve & Send 3 Responses</span>
        </button>
        
        <button className="bg-light-gray hover:bg-light-navy text-navy font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2">
          <Brain className="h-4 w-4" />
          <span>View AI Analysis</span>
        </button>
      </div>

      {/* Task Tracking & Prioritization */}
      <div className="bg-light-gray rounded-lg p-6">
        <h3 className="text-lg font-semibold text-navy mb-4">Task Priority & Completion Tracking</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <h4 className="font-medium text-charcoal">High Priority (47h deadline)</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-warm-white rounded border-l-4 border-alert-red">
                <span className="text-sm text-navy">TRO Response - Johnson v Johnson</span>
                <Clock className="h-4 w-4 text-alert-red" />
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium text-charcoal">Medium Priority</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-warm-white rounded border-l-4 border-yellow-400">
                <span className="text-sm text-navy">Discovery Request Review</span>
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium text-charcoal">Completed Today</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-warm-white rounded border-l-4 border-light-green">
                <span className="text-sm text-navy">5 Client Email Responses</span>
                <Check className="h-4 w-4 text-light-green" />
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