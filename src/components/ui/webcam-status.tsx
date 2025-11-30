import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Camera, Users, Eye, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WebcamStatusProps {
  isActive: boolean;
  peopleCount: number;
  faceDirection: string;
  violationCount: number;
  isFullscreen: boolean;
  className?: string;
}

export const WebcamStatus = ({
  isActive,
  peopleCount,
  faceDirection,
  violationCount,
  isFullscreen,
  className
}: WebcamStatusProps) => {
  const getStatusColor = (count: number, threshold: number) => {
    if (count === 0) return 'bg-green-500/20 text-green-500';
    if (count < threshold / 2) return 'bg-yellow-500/20 text-yellow-500';
    if (count < threshold) return 'bg-orange-500/20 text-orange-500';
    return 'bg-red-500/20 text-red-500';
  };

  const getPeopleColor = (count: number) => {
    if (count === 1) return 'bg-green-500/20 text-green-500';
    return 'bg-red-500/20 text-red-500';
  };

  if (!isActive) {
    return (
      <Card className={cn("fixed top-4 right-4 z-50 bg-card/95 backdrop-blur-sm border-muted", className)}>
        <CardContent className="p-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Camera className="h-3 w-3" />
            <span>Monitoring Inactive</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("fixed top-4 right-4 z-50 bg-card/95 backdrop-blur-sm border-primary/20", className)}>
      <CardContent className="p-3">
        <div className="flex items-center gap-3 text-sm">
          {/* Fullscreen status */}
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${
            isFullscreen ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
          }`}>
            <Monitor className="h-3 w-3" />
            <span>{isFullscreen ? 'Fullscreen' : 'Not Fullscreen'}</span>
          </div>

          {/* Camera status */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 text-green-500">
            <Camera className="h-3 w-3" />
            <span>AI Active</span>
          </div>
          
          {/* People count */}
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${getPeopleColor(peopleCount)}`}>
            <Users className="h-3 w-3" />
            <span>{peopleCount} {peopleCount === 1 ? 'person' : 'people'}</span>
          </div>
          
          {/* Face direction */}
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${
            faceDirection === 'Forward' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'
          }`}>
            <Eye className="h-3 w-3" />
            <span>Looking {faceDirection}</span>
          </div>
          
          {/* Violations */}
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${getStatusColor(violationCount, 5)}`}>
            <AlertTriangle className="h-3 w-3" />
            <span>Violations: {violationCount}/5</span>
          </div>
          
          {violationCount > 0 && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Risk Level: {violationCount >= 5 ? 'Critical' : violationCount >= 3 ? 'High' : 'Medium'}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};