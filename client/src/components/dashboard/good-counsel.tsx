import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Brain, Send, RefreshCw, AlertCircle, CheckCircle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

interface GoodCounselProps {
  caseContext?: string;
  timePressure?: "low" | "medium" | "high" | "critical";
}

export function GoodCounsel({ caseContext = "", timePressure = "medium" }: GoodCounselProps) {
  const [context, setContext] = useState(caseContext);
  const [selectedProvider, setSelectedProvider] = useState<string>("perplexity");
  const [userState, setUserState] = useState<string>("");
  const [ethicalConcerns, setEthicalConcerns] = useState<string>("");

  const providers = [
    { id: "perplexity", name: "Perplexity AI", status: "✅ Working", icon: "🔍" },
    { id: "anthropic", name: "Claude (Anthropic)", status: "✅ Working", icon: "🧠" },
    { id: "openai", name: "ChatGPT (OpenAI)", status: "✅ Working", icon: "🤖" },
    { id: "google", name: "Gemini (Google)", status: "❌ Needs API Key", icon: "💎" },
    { id: "xai", name: "Grok (xAI)", status: "❌ Needs Credits", icon: "🔥" },
    { id: "deepseek", name: "DeepSeek", status: "❌ Needs Balance", icon: "🧮" },
  ];

  const counselMutation = useMutation({
    mutationFn: async (data: {
      context: string;
      ai_provider: string;
      user_state?: string;
      time_pressure: string;
      ethical_concerns?: string[];
    }) => {
      const response = await fetch("http://localhost:5002/mcp/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool: "good_counsel",
          arguments: data,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    },
  });

  const handleGetCounsel = () => {
    if (!context.trim()) return;

    const ethicalConcernsArray = ethicalConcerns
      .split(",")
      .map(c => c.trim())
      .filter(c => c.length > 0);

    counselMutation.mutate({
      context: context.trim(),
      ai_provider: selectedProvider,
      user_state: userState.trim() || undefined,
      time_pressure: timePressure,
      ethical_concerns: ethicalConcernsArray.length > 0 ? ethicalConcernsArray : undefined,
    });
  };

  const selectedProviderData = providers.find(p => p.id === selectedProvider);

  return (
    <Card className="bg-card-dark border-border-gray">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Brain className="w-5 h-5" />
          AI Legal Counsel
        </CardTitle>
        <p className="text-secondary text-sm">
          Get AI-powered ethical guidance and workflow optimization for your legal practice
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Provider Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-secondary">AI Provider</label>
          <Select value={selectedProvider} onValueChange={setSelectedProvider}>
            <SelectTrigger className="bg-primary-dark border-border-gray">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card-dark border-border-gray">
              {providers.map((provider) => (
                <SelectItem key={provider.id} value={provider.id} className="text-white">
                  <div className="flex items-center gap-2">
                    <span>{provider.icon}</span>
                    <span>{provider.name}</span>
                    <Badge variant={provider.status.includes("✅") ? "default" : "destructive"} className="ml-auto">
                      {provider.status}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Context Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-secondary">
            Legal Context or Situation *
          </label>
          <Textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Describe the legal case, workflow issue, or situation requiring guidance..."
            className="bg-primary-dark border-border-gray min-h-[100px] resize-none"
          />
        </div>

        {/* User State */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-secondary">
            Your Current State (Optional)
          </label>
          <Textarea
            value={userState}
            onChange={(e) => setUserState(e.target.value)}
            placeholder="How are you feeling? Any stress, time pressure, or focus issues?"
            className="bg-primary-dark border-border-gray min-h-[60px] resize-none"
          />
        </div>

        {/* Ethical Concerns */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-secondary">
            Ethical Concerns (Optional)
          </label>
          <Textarea
            value={ethicalConcerns}
            onChange={(e) => setEthicalConcerns(e.target.value)}
            placeholder="Any ethical issues or concerns (comma-separated)..."
            className="bg-primary-dark border-border-gray resize-none"
          />
        </div>

        {/* Time Pressure Display */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-secondary">Time Pressure:</span>
          <Badge variant={
            timePressure === "critical" ? "destructive" :
            timePressure === "high" ? "default" :
            "secondary"
          }>
            {timePressure.toUpperCase()}
          </Badge>
        </div>

        {/* Action Button */}
        <Button
          onClick={handleGetCounsel}
          disabled={!context.trim() || counselMutation.isPending}
          className="w-full bg-accent-gold hover:bg-accent-gold/90 text-slate-900 font-semibold"
        >
          {counselMutation.isPending ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Getting AI Counsel...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Get AI Counsel
            </>
          )}
        </Button>

        {/* Results */}
        {counselMutation.isError && (
          <div className="p-4 bg-status-critical/20 border border-status-critical rounded-lg">
            <div className="flex items-center gap-2 text-status-critical">
              <AlertCircle className="w-4 h-4" />
              <span className="font-medium">Error getting AI counsel</span>
            </div>
            <p className="text-sm text-secondary mt-1">
              {counselMutation.error instanceof Error
                ? counselMutation.error.message
                : "Unknown error occurred"}
            </p>
            <p className="text-xs text-secondary mt-2">
              Make sure the Cyrano HTTP bridge is running on port 5002
            </p>
          </div>
        )}

        {counselMutation.isSuccess && counselMutation.data && (
          <div className="p-4 bg-status-success/20 border border-status-success rounded-lg">
            <div className="flex items-center gap-2 text-status-success mb-3">
              <CheckCircle className="w-4 h-4" />
              <span className="font-medium">AI Counsel Received</span>
              <Badge variant="outline" className="ml-auto">
                {selectedProviderData?.icon} {selectedProviderData?.name}
              </Badge>
            </div>

            <div className="space-y-3 text-sm">
              {counselMutation.data.content?.[0]?.text && (
                <div>
                  <h4 className="font-medium text-primary mb-2">Guidance:</h4>
                  <div className="bg-primary-dark/50 p-3 rounded border border-border-gray text-secondary whitespace-pre-wrap">
                    {counselMutation.data.content[0].text}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}