
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Monitor,
  Mic,
  Camera,
  Bell,
  Settings
} from 'lucide-react';
import { backgroundAppController } from '@/utils/backgroundAppController';

interface BackgroundAppManagerProps {
  onSystemReady: () => void;
  onSystemNotReady: (warnings: string[]) => void;
}

const BackgroundAppManager: React.FC<BackgroundAppManagerProps> = ({
  onSystemReady,
  onSystemNotReady
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [permissions, setPermissions] = useState<{
    notifications: boolean;
    camera: boolean;
    microphone: boolean;
    warnings: string[];
  } | null>(null);
  const [backgroundActivity, setBackgroundActivity] = useState<{
    suspiciousActivity: boolean;
    warnings: string[];
  } | null>(null);
  const [systemInfo, setSystemInfo] = useState<any>(null);

  useEffect(() => {
    // Get system info immediately
    const info = backgroundAppController.getSystemInfo();
    setSystemInfo(info);
  }, []);

  const handleSystemScan = async () => {
    setIsScanning(true);
    
    try {
      // Request permissions
      const permissionResults = await backgroundAppController.requestSystemPermissions();
      setPermissions(permissionResults);

      // Detect background activity
      const activityResults = await backgroundAppController.detectBackgroundActivity();
      setBackgroundActivity(activityResults);

      // Minimize distractions
      await backgroundAppController.minimizeDistractions();

      setScanComplete(true);

      // Check if system is ready
      const allWarnings = [
        ...permissionResults.warnings,
        ...activityResults.warnings
      ];

      if (allWarnings.length === 0 && permissionResults.camera) {
        onSystemReady();
      } else {
        onSystemNotReady(allWarnings);
      }

    } catch (error) {
      console.error('Error during system scan:', error);
      onSystemNotReady(['System scan failed. Please try again.']);
    } finally {
      setIsScanning(false);
    }
  };

  const getPermissionIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const optimizationSuggestions = backgroundAppController.getOptimizationSuggestions();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            System Preparation for Exam
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              To ensure exam integrity, we need to check your system and minimize distractions.
              This process will request permissions and attempt to optimize your environment.
            </AlertDescription>
          </Alert>

          {!scanComplete && (
            <Button 
              onClick={handleSystemScan} 
              disabled={isScanning}
              className="w-full"
            >
              {isScanning ? 'Scanning System...' : 'Start System Preparation'}
            </Button>
          )}

          {permissions && (
            <div className="space-y-3">
              <h4 className="font-medium">System Permissions</h4>
              <div className="grid grid-cols-1 gap-2">
                <div className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    <span>Camera Access</span>
                  </div>
                  {getPermissionIcon(permissions.camera)}
                </div>
                <div className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    <Mic className="h-4 w-4" />
                    <span>Microphone Access</span>
                  </div>
                  {getPermissionIcon(permissions.microphone)}
                </div>
                <div className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    <span>Notification Control</span>
                  </div>
                  {getPermissionIcon(permissions.notifications)}
                </div>
              </div>
            </div>
          )}

          {backgroundActivity && backgroundActivity.suspiciousActivity && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Potential Issues Detected:</p>
                  <ul className="text-sm space-y-1">
                    {backgroundActivity.warnings.map((warning, index) => (
                      <li key={index}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {scanComplete && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-medium">System preparation complete</span>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    System Optimization Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm space-y-1">
                    {optimizationSuggestions.map((suggestion, index) => (
                      <div key={index} className="text-muted-foreground">
                        {suggestion}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {systemInfo && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Monitor className="h-4 w-4" />
                      System Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Platform: {systemInfo.platform}</div>
                      <div>Online: {systemInfo.onlineStatus ? 'Yes' : 'No'}</div>
                      <div>Screen: {systemInfo.screenInfo.width}x{systemInfo.screenInfo.height}</div>
                      <div>Color Depth: {systemInfo.screenInfo.colorDepth}bit</div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BackgroundAppManager;
