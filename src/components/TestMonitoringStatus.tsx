
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Eye, Monitor, TabletSmartphone } from 'lucide-react';

interface TestMonitoringStatusProps {
  isFullscreen: boolean;
  warningCount: number;
  tabSwitchCount: number;
  isMonitoring: boolean;
  warningThreshold?: number;
}

const TestMonitoringStatus = ({
  isFullscreen,
  warningCount,
  tabSwitchCount,
  isMonitoring,
  warningThreshold = 3
}: TestMonitoringStatusProps) => {
  const getStatusColor = (count: number) => {
    if (count === 0) return 'bg-green-500/20 text-green-500';
    if (count < warningThreshold / 2) return 'bg-yellow-500/20 text-yellow-500';
    if (count < warningThreshold) return 'bg-orange-500/20 text-orange-500';
    return 'bg-red-500/20 text-red-500';
  };

  if (!isMonitoring) {
    return null;
  }

  return (
    <Card className="fixed top-4 right-4 z-50 bg-card/95 backdrop-blur-sm border-primary/20">
      <CardContent className="p-3">
        <div className="flex items-center gap-3 text-sm">
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${
            isFullscreen ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
          }`}>
            <Monitor className="h-3 w-3" />
            <span>{isFullscreen ? 'Fullscreen' : 'Not Fullscreen'}</span>
          </div>
          
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${getStatusColor(warningCount)}`}>
            <Eye className="h-3 w-3" />
            <span>Exits: {warningCount}/{warningThreshold}</span>
          </div>
          
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${getStatusColor(tabSwitchCount)}`}>
            <TabletSmartphone className="h-3 w-3" />
            <span>Switches: {tabSwitchCount}/{warningThreshold}</span>
          </div>
          
          {(warningCount + tabSwitchCount) > 0 && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Risk Level: {warningCount + tabSwitchCount >= warningThreshold ? 'Critical' : 'Medium'}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TestMonitoringStatus;
