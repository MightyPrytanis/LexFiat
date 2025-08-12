import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Check, X, Link, Mail, Calendar, Scale, Gavel } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { Attorney } from "@shared/schema";

export function IntegrationSettings() {
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});
  const [editingIntegration, setEditingIntegration] = useState<string | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: attorney } = useQuery({
    queryKey: ["/api/attorneys/current"],
  });

  const updateIntegration = useMutation({
    mutationFn: async (data: Partial<Attorney>) => {
      const response = await fetch(`/api/attorneys/${attorney?.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attorneys/current"] });
      setEditingIntegration(null);
      setApiKeyInput("");
      toast({
        title: "Integration Updated",
        description: "Integration settings saved successfully.",
      });
    },
  });

  const initiateGmailOAuth = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/integrations/gmail/oauth", {
        method: "POST",
      });
      const { authUrl } = await response.json();
      window.location.href = authUrl;
    },
  });

  const toggleApiKeyVisibility = (integration: string) => {
    setShowApiKeys(prev => ({
      ...prev,
      [integration]: !prev[integration]
    }));
  };

  const handleSaveApiKey = (integration: string) => {
    if (!apiKeyInput.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter a valid API key.",
        variant: "destructive",
      });
      return;
    }

    const updateData: Partial<Attorney> = {};
    
    switch (integration) {
      case "clio":
        updateData.clioApiKey = apiKeyInput;
        updateData.clioConnected = true;
        break;
      case "westlaw":
        updateData.westlawApiKey = apiKeyInput;
        updateData.westlawConnected = true;
        break;
      case "claude":
        updateData.claudeApiKey = apiKeyInput;
        updateData.claudeConnected = true;
        break;
    }

    updateIntegration.mutate(updateData);
  };

  const integrations = [
    {
      key: "gmail",
      name: "Gmail & Calendar",
      icon: Mail,
      description: "Connect your Gmail account for email monitoring and calendar integration",
      connected: attorney?.gmailCredentials,
      requiresOAuth: true,
      status: attorney?.gmailCredentials ? "Connected" : "Not Connected",
    },
    {
      key: "clio",
      name: "Clio Practice Management",
      icon: Scale,
      description: "Sync cases, clients, and billing information",
      connected: attorney?.clioConnected,
      apiKey: attorney?.clioApiKey,
      status: attorney?.clioConnected ? "Connected" : "Not Connected",
    },
    {
      key: "westlaw",
      name: "Westlaw Research",
      icon: Gavel,
      description: "Access legal research and case law",
      connected: attorney?.westlawConnected,
      apiKey: attorney?.westlawApiKey,
      status: attorney?.westlawConnected ? "Connected" : "Not Connected",
    },
    {
      key: "claude",
      name: "Claude AI",
      icon: Link,
      description: "Personal Claude API for document analysis",
      connected: attorney?.claudeConnected,
      apiKey: attorney?.claudeApiKey,
      status: attorney?.claudeConnected ? "Connected" : "Not Connected",
    },
  ];

  const getStatusBadge = (connected: boolean | null | undefined) => {
    if (connected) {
      return <Badge className="bg-green-600 text-white">Connected</Badge>;
    }
    return <Badge variant="outline" className="text-slate-400">Not Connected</Badge>;
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-gold flex items-center">
          <Link className="w-5 h-5 mr-2" />
          Account Integrations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-slate-300 text-sm">
          Connect your accounts to unlock the full power of LexFiat's automation features.
        </p>
        
        {integrations.map((integration) => {
          const Icon = integration.icon;
          const isEditing = editingIntegration === integration.key;
          
          return (
            <div key={integration.key} className="bg-slate-700 p-4 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Icon className="w-6 h-6 text-gold" />
                  <div>
                    <h4 className="font-medium text-white">{integration.name}</h4>
                    <p className="text-sm text-slate-400">{integration.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {getStatusBadge(integration.connected)}
                  {integration.connected && !integration.requiresOAuth && (
                    <Switch
                      checked={integration.connected}
                      onCheckedChange={(enabled) => {
                        const updateData: Partial<Attorney> = {};
                        switch (integration.key) {
                          case "clio":
                            updateData.clioConnected = enabled;
                            break;
                          case "westlaw":
                            updateData.westlawConnected = enabled;
                            break;
                          case "claude":
                            updateData.claudeConnected = enabled;
                            break;
                        }
                        updateIntegration.mutate(updateData);
                      }}
                    />
                  )}
                </div>
              </div>

              {isEditing && !integration.requiresOAuth ? (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor={`api-key-${integration.key}`} className="text-slate-300">
                      API Key
                    </Label>
                    <Input
                      id={`api-key-${integration.key}`}
                      type="password"
                      value={apiKeyInput}
                      onChange={(e) => setApiKeyInput(e.target.value)}
                      placeholder="Enter API key..."
                      className="bg-slate-600 border-slate-500 text-white"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleSaveApiKey(integration.key)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingIntegration(null);
                        setApiKeyInput("");
                      }}
                      className="border-slate-500 text-slate-300 hover:bg-slate-600"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  {integration.apiKey && !integration.requiresOAuth ? (
                    <div className="flex items-center space-x-2">
                      <code className="text-xs bg-slate-600 px-2 py-1 rounded">
                        {showApiKeys[integration.key] 
                          ? integration.apiKey 
                          : "••••••••••••••••"
                        }
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleApiKeyVisibility(integration.key)}
                        className="text-slate-400 hover:text-white"
                      >
                        {showApiKeys[integration.key] ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  ) : integration.requiresOAuth && integration.connected ? (
                    <span className="text-green-400 text-sm">✓ OAuth connected</span>
                  ) : (
                    <span className="text-slate-400 text-sm">
                      {integration.requiresOAuth ? "OAuth required" : "No API key configured"}
                    </span>
                  )}
                  
                  {integration.requiresOAuth ? (
                    <Button
                      size="sm"
                      onClick={() => initiateGmailOAuth.mutate()}
                      disabled={initiateGmailOAuth.isPending}
                      className="bg-gold hover:bg-gold/90 text-slate-900"
                    >
                      {integration.connected ? "Reconnect" : "Connect"}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingIntegration(integration.key);
                        setApiKeyInput(integration.apiKey || "");
                      }}
                      className="border-slate-600 text-slate-300 hover:bg-slate-600"
                    >
                      {integration.connected ? "Edit" : "Configure"}
                    </Button>
                  )}
                </div>
              )}
            </div>
          );
        })}
        
        <div className="bg-blue-900/20 border border-blue-700 p-3 rounded-lg">
          <p className="text-blue-300 text-sm">
            <strong>Security:</strong> All credentials are encrypted and stored securely. 
            OAuth tokens are automatically refreshed, and API keys are never shared.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}