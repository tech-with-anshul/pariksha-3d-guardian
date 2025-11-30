
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";

const SystemSettings = () => {
    const { toast } = useToast();
  return (
    <Card>
      <CardHeader>
        <CardTitle>System Settings</CardTitle>
        <CardDescription>
          Configure global system settings and preferences.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
            <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
                <div className="flex flex-col space-y-1">
                    <Label htmlFor="maintenance-mode" className="cursor-pointer">Maintenance Mode</Label>
                    <span className="text-sm font-normal leading-snug text-muted-foreground">
                        When enabled, only admins can access the site.
                    </span>
                </div>
                <Switch 
                    id="maintenance-mode" 
                    onCheckedChange={() => {
                        toast({
                            title: "Coming Soon!",
                            description: "This feature is not yet implemented.",
                        })
                    }}
                />
            </div>
            <div className="flex items-center justify-between space-x-2 rounded-lg border p-4 opacity-50 cursor-not-allowed">
                <div className="flex flex-col space-y-1">
                    <Label htmlFor="allow-registration">Allow New User Registration</Label>
                    <span className="text-sm font-normal leading-snug text-muted-foreground">
                        Control whether new users can sign up.
                    </span>
                </div>
                <Switch id="allow-registration" disabled />
            </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemSettings;
