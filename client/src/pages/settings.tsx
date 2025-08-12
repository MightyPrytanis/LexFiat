import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AvatarUpload } from "@/components/dashboard/avatar-upload";
import { IntegrationSettings } from "@/components/dashboard/integration-settings";
import { AiProviderSetup } from "@/components/dashboard/ai-provider-setup";
import { FeedbackSystem } from "@/components/dashboard/feedback-system";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Settings, User, Link, Bot, MessageSquare, Shield, Bell } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

export default function SettingsPage() {
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    specialization: "",
  });
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    desktopNotifications: false,
    weeklyReports: true,
    theme: "dark",
    timeZone: "America/Detroit",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: attorney } = useQuery({
    queryKey: ["/api/attorneys/current"],
  });

  // Update profile data when attorney data loads
  useEffect(() => {
    if (attorney) {
      setProfileData({
        name: attorney.name || "",
        email: attorney.email || "",
        specialization: attorney.specialization || "",
      });
    }
  }, [attorney]);

  const updateProfile = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/attorneys/${attorney?.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attorneys/current"] });
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    },
  });

  const handleProfileSave = () => {
    updateProfile.mutate(profileData);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gold mb-2 flex items-center">
            <Settings className="w-8 h-8 mr-3" />
            Settings & Preferences
          </h1>
          <p className="text-slate-400">
            Configure your LexFiat experience, integrations, and preferences
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center space-x-2">
              <Link className="w-4 h-4" />
              <span>Integrations</span>
            </TabsTrigger>
            <TabsTrigger value="ai-providers" className="flex items-center space-x-2">
              <Bot className="w-4 h-4" />
              <span>AI Providers</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>Preferences</span>
            </TabsTrigger>
            <TabsTrigger value="feedback" className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4" />
              <span>Feedback</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AvatarUpload
                currentAvatarUrl={attorney?.profilePhotoUrl}
                attorneyName={attorney?.name || "Attorney"}
                attorneyId={attorney?.id || ""}
              />

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-gold">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-slate-300">Full Name</Label>
                    <Input
                      id="name"
                      value={profileData.name || attorney?.name || ""}
                      onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter your full name"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-slate-300">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email || attorney?.email || ""}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter your email address"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="specialization" className="text-slate-300">Specialization</Label>
                    <Input
                      id="specialization"
                      value={profileData.specialization || attorney?.specialization || ""}
                      onChange={(e) => setProfileData(prev => ({ ...prev, specialization: e.target.value }))}
                      placeholder="e.g., Family Law, Criminal Defense"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>

                  <Button
                    onClick={handleProfileSave}
                    disabled={updateProfile.isPending}
                    className="w-full bg-gold hover:bg-gold/90 text-slate-900"
                  >
                    {updateProfile.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="integrations">
            <IntegrationSettings />
          </TabsContent>

          <TabsContent value="ai-providers">
            <AiProviderSetup />
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-gold flex items-center">
                  <Bell className="w-5 h-5 mr-2" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-white">Email Notifications</h4>
                    <p className="text-sm text-slate-400">Receive important updates via email</p>
                  </div>
                  <Switch
                    checked={preferences.emailNotifications}
                    onCheckedChange={(checked) => 
                      setPreferences(prev => ({ ...prev, emailNotifications: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-white">Desktop Notifications</h4>
                    <p className="text-sm text-slate-400">Get instant browser notifications</p>
                  </div>
                  <Switch
                    checked={preferences.desktopNotifications}
                    onCheckedChange={(checked) => 
                      setPreferences(prev => ({ ...prev, desktopNotifications: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-white">Weekly Reports</h4>
                    <p className="text-sm text-slate-400">Receive weekly activity summaries</p>
                  </div>
                  <Switch
                    checked={preferences.weeklyReports}
                    onCheckedChange={(checked) => 
                      setPreferences(prev => ({ ...prev, weeklyReports: checked }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-gold">System Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-slate-300">Time Zone</Label>
                  <Select value={preferences.timeZone} onValueChange={(value) => 
                    setPreferences(prev => ({ ...prev, timeZone: value }))
                  }>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      <SelectItem value="America/Detroit" className="text-white">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago" className="text-white">Central Time</SelectItem>
                      <SelectItem value="America/Denver" className="text-white">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles" className="text-white">Pacific Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-slate-300">Theme</Label>
                  <Select value={preferences.theme} onValueChange={(value) => 
                    setPreferences(prev => ({ ...prev, theme: value }))
                  }>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      <SelectItem value="dark" className="text-white">Dark Theme</SelectItem>
                      <SelectItem value="light" className="text-white">Light Theme</SelectItem>
                      <SelectItem value="auto" className="text-white">System Default</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button className="w-full bg-gold hover:bg-gold/90 text-slate-900">
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="feedback">
            <div className="space-y-6">
              <FeedbackSystem />

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-gold">Contact Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-slate-700 p-4 rounded-lg">
                    <h4 className="font-medium text-white mb-2">Development Team</h4>
                    <p className="text-slate-300 text-sm mb-4">
                      For immediate assistance or urgent technical issues, reach out directly:
                    </p>
                    <div className="space-y-2 text-sm">
                      <p className="text-slate-300">
                        <strong>Email:</strong> support@lexfiat.com
                      </p>
                      <p className="text-slate-300">
                        <strong>Priority Support:</strong> Available for critical issues
                      </p>
                      <p className="text-slate-300">
                        <strong>Response Time:</strong> Within 24 hours for standard inquiries
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}