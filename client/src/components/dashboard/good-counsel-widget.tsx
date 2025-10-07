import { Brain, TrendingUp, AlertCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface GoodCounselWidgetProps {
  onClick?: () => void;
}

export function GoodCounselWidget({ onClick }: GoodCounselWidgetProps) {
  // Mock data - will be replaced with real GoodCounsel recommendations
  const recommendations = [
    { type: "ethical", text: "Case priority review recommended", severity: "medium" },
    { type: "wellness", text: "Break suggested - 2hrs focused work", severity: "low" },
    { type: "workflow", text: "Document automation opportunity", severity: "high" }
  ];

  const activeRecommendation = recommendations[0];

  return (
    <Card 
      className="swim-panel stat-card cursor-pointer hover:border-accent-gold transition-all"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base panel-heading">
            <Brain className="w-4 h-4 text-status-success" />
            Good Counsel
          </CardTitle>
          <Badge 
            variant={activeRecommendation.severity === "high" ? "destructive" : "secondary"}
            className="text-xs"
          >
            {recommendations.length} active
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <TrendingUp className="w-4 h-4 text-status-success mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-primary font-medium">{activeRecommendation.text}</p>
              <p className="text-xs text-secondary panel-text-secondary mt-1">
                {activeRecommendation.type === "ethical" && "Ethical guidance"}
                {activeRecommendation.type === "wellness" && "Personal wellness"}
                {activeRecommendation.type === "workflow" && "Workflow optimization"}
              </p>
            </div>
          </div>
          
          {recommendations.length > 1 && (
            <div className="pt-2 border-t border-border-gray">
              <p className="text-xs text-secondary panel-text-secondary">
                +{recommendations.length - 1} more recommendations
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
