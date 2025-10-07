import { Brain, TrendingUp, AlertCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface GoodCounselWidgetProps {
  onClick?: () => void;
}

export function GoodCounselWidget({ onClick }: GoodCounselWidgetProps) {
  // Mock data - will be replaced with real GoodCounsel recommendations
  const recommendations = [
    { type: "wellness", text: "You've been focused for 2 hours - time for a mindful break", priority: "support" },
    { type: "ethical", text: "Case priority alignment looks strong", priority: "affirmation" },
    { type: "workflow", text: "Opportunity to delegate routine tasks", priority: "growth" }
  ];

  const activeRecommendation = recommendations[0];

  return (
    <Card 
      className="swim-panel stat-card cursor-pointer transition-all relative overflow-hidden"
      onClick={onClick}
      style={{
        background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(217, 119, 6, 0.12) 100%)',
        borderColor: 'rgba(251, 191, 36, 0.4)',
        borderWidth: '2px'
      }}
    >
      {/* Subtle gold shimmer effect */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          background: 'radial-gradient(circle at 30% 30%, rgba(251, 191, 36, 0.3) 0%, transparent 60%)'
        }}
      />
      
      <CardHeader className="pb-3 relative z-10">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base panel-heading" style={{ color: '#fbbf24' }}>
            <Brain className="w-4 h-4" style={{ color: '#10b981' }} />
            Good Counsel
          </CardTitle>
          <Badge 
            className="text-xs"
            style={{
              background: 'rgba(16, 185, 129, 0.2)',
              color: '#10b981',
              border: '1px solid rgba(16, 185, 129, 0.4)'
            }}
          >
            {recommendations.length} insights
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full mt-1.5" style={{ backgroundColor: '#10b981' }} />
            <div className="flex-1">
              <p className="text-sm font-medium" style={{ color: '#fbbf24' }}>{activeRecommendation.text}</p>
              <p className="text-xs mt-1" style={{ color: 'rgba(251, 191, 36, 0.7)' }}>
                {activeRecommendation.type === "ethical" && "Guidance & support"}
                {activeRecommendation.type === "wellness" && "Personal wellness"}
                {activeRecommendation.type === "workflow" && "Growth opportunity"}
              </p>
            </div>
          </div>
          
          {recommendations.length > 1 && (
            <div className="pt-2 border-t" style={{ borderColor: 'rgba(251, 191, 36, 0.2)' }}>
              <p className="text-xs" style={{ color: 'rgba(16, 185, 129, 0.8)' }}>
                +{recommendations.length - 1} more insights available
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
