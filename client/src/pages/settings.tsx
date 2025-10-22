import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Settings as SettingsIcon, User, Key, Zap, Download, Upload, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

interface SettingsState {
  profile: {
    name: string;
    email: string;
    avatar: string;
  };
  api: {
    openaiKey: string;
    model: string;
    temperature: number;
    maxTokens: number;
    endpoint: string;
  };
}

const STORAGE_KEY = "rajgpt_settings";

export default function Settings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<SettingsState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {
      profile: {
        name: "",
        email: "",
        avatar: "",
      },
      api: {
        openaiKey: "",
        model: "gpt-4",
        temperature: 0.7,
        maxTokens: 2000,
        endpoint: "https://api.openai.com/v1",
      },
    };
  });

  const saveSettings = () => {
    const safeSettings = {
      ...settings,
      api: {
        ...settings.api,
        openaiKey: "", // Never persist API keys to localStorage for security
      },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(safeSettings));
    toast({
      title: "Settings Saved",
      description: "Your settings have been saved (API keys excluded for security).",
    });
  };

  const exportSettings = () => {
    const safeSettings = {
      ...settings,
      api: {
        ...settings.api,
        openaiKey: "", // Never export API keys for security
      },
    };
    const dataStr = JSON.stringify(safeSettings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'rajgpt-settings.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    toast({
      title: "Settings Exported",
      description: "Your settings have been exported (API keys excluded for security).",
    });
  };

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string);
          // Sanitize: never import API keys for security
          const safeImported = {
            ...imported,
            api: {
              ...imported.api,
              openaiKey: "", // Strip API key from imports
            },
          };
          setSettings(safeImported);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(safeImported));
          toast({
            title: "Settings Imported",
            description: "Your settings have been imported (API keys excluded for security).",
          });
        } catch (error) {
          toast({
            title: "Import Failed",
            description: "Invalid settings file.",
            variant: "destructive",
          });
        }
      };
      reader.readAsText(file);
    }
  };

  const clearSettings = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSettings({
      profile: { name: "", email: "", avatar: "" },
      api: {
        openaiKey: "",
        model: "gpt-4",
        temperature: 0.7,
        maxTokens: 2000,
        endpoint: "https://api.openai.com/v1",
      },
    });
    toast({
      title: "Settings Cleared",
      description: "All settings have been reset to defaults.",
    });
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold font-[family-name:var(--font-display)]">Settings</h1>
        <p className="text-muted-foreground">
          Manage your profile, API keys, and application preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="profile" data-testid="tab-profile">
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="api" data-testid="tab-api">
            <Key className="h-4 w-4 mr-2" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="advanced" data-testid="tab-advanced">
            <Zap className="h-4 w-4 mr-2" />
            Advanced
          </TabsTrigger>
        </TabsList>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <TabsContent value="profile" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal information and display preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Your name"
                    value={settings.profile.name}
                    onChange={(e) => setSettings({
                      ...settings,
                      profile: { ...settings.profile, name: e.target.value }
                    })}
                    data-testid="input-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={settings.profile.email}
                    onChange={(e) => setSettings({
                      ...settings,
                      profile: { ...settings.profile, email: e.target.value }
                    })}
                    data-testid="input-email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="avatar">Avatar URL</Label>
                  <Input
                    id="avatar"
                    placeholder="https://example.com/avatar.jpg"
                    value={settings.profile.avatar}
                    onChange={(e) => setSettings({
                      ...settings,
                      profile: { ...settings.profile, avatar: e.target.value }
                    })}
                    data-testid="input-avatar"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>API Configuration</CardTitle>
                <CardDescription>
                  Configure your AI model settings and API credentials
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="apiKey">OpenAI API Key</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    placeholder="sk-..."
                    value={settings.api.openaiKey}
                    onChange={(e) => setSettings({
                      ...settings,
                      api: { ...settings.api, openaiKey: e.target.value }
                    })}
                    data-testid="input-api-key"
                  />
                  <p className="text-xs text-muted-foreground">
                    ⚠️ For security, API keys are not persisted to localStorage. Use environment variables (VITE_OPENAI_API_KEY) or configure via backend for production use.
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="model">Model Selection</Label>
                  <Select
                    value={settings.api.model}
                    onValueChange={(value) => setSettings({
                      ...settings,
                      api: { ...settings.api, model: value }
                    })}
                  >
                    <SelectTrigger id="model" data-testid="select-model">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4">GPT-4</SelectItem>
                      <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                      <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                      <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                      <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="temperature">Temperature: {settings.api.temperature}</Label>
                  <Input
                    id="temperature"
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={settings.api.temperature}
                    onChange={(e) => setSettings({
                      ...settings,
                      api: { ...settings.api, temperature: parseFloat(e.target.value) }
                    })}
                    data-testid="input-temperature"
                  />
                  <p className="text-xs text-muted-foreground">
                    Lower values make output more focused, higher values more creative
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxTokens">Max Tokens</Label>
                  <Input
                    id="maxTokens"
                    type="number"
                    value={settings.api.maxTokens}
                    onChange={(e) => setSettings({
                      ...settings,
                      api: { ...settings.api, maxTokens: parseInt(e.target.value) }
                    })}
                    data-testid="input-max-tokens"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>API Endpoint</CardTitle>
                <CardDescription>
                  Configure custom API endpoint for advanced use cases
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="endpoint">Base URL</Label>
                  <Input
                    id="endpoint"
                    placeholder="https://api.openai.com/v1"
                    value={settings.api.endpoint}
                    onChange={(e) => setSettings({
                      ...settings,
                      api: { ...settings.api, endpoint: e.target.value }
                    })}
                    data-testid="input-endpoint"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
                <CardDescription>
                  Export, import, or clear your application settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" onClick={exportSettings} className="gap-2" data-testid="button-export">
                    <Download className="h-4 w-4" />
                    Export Settings
                  </Button>
                  <Button variant="outline" className="gap-2" asChild>
                    <label htmlFor="import-file" className="cursor-pointer">
                      <Upload className="h-4 w-4" />
                      Import Settings
                      <input
                        id="import-file"
                        type="file"
                        accept=".json"
                        className="hidden"
                        onChange={importSettings}
                        data-testid="input-import"
                      />
                    </label>
                  </Button>
                  <Button variant="destructive" onClick={clearSettings} className="gap-2" data-testid="button-clear">
                    <Trash2 className="h-4 w-4" />
                    Clear All Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </motion.div>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={saveSettings} className="gap-2" data-testid="button-save">
          <SettingsIcon className="h-4 w-4" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}
