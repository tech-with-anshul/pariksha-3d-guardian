import { useState, useCallback, useRef } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface WebcamViolation {
  type: 'multiple_people' | 'no_face' | 'looking_away';
  timestamp: number;
  details?: any;
}

interface WebcamStatus {
  peopleCount: number;
  faceDirection: string;
  isLookingAway: boolean;
}

interface UseWebcamMonitoringProps {
  onViolationThreshold?: (violations: WebcamViolation[]) => void;
  violationThreshold?: number;
  warningThreshold?: number;
}

export const useWebcamMonitoring = ({
  onViolationThreshold,
  violationThreshold = 5,
  warningThreshold = 3
}: UseWebcamMonitoringProps = {}) => {
  const { toast } = useToast();
  const [violations, setViolations] = useState<WebcamViolation[]>([]);
  const [status, setStatus] = useState<WebcamStatus>({
    peopleCount: 1,
    faceDirection: 'Forward',
    isLookingAway: false
  });
  const [isMonitoring, setIsMonitoring] = useState(false);
  const violationCooldownRef = useRef<Set<string>>(new Set());

  const addViolation = useCallback((type: WebcamViolation['type'], details?: any) => {
    const violation: WebcamViolation = {
      type,
      timestamp: Date.now(),
      details
    };

    // Prevent spam violations
    const cooldownKey = `${type}-${Math.floor(Date.now() / 10000)}`;
    if (violationCooldownRef.current.has(cooldownKey)) {
      return;
    }
    violationCooldownRef.current.add(cooldownKey);

    setViolations(prev => {
      const newViolations = [...prev, violation];
      
      // Show warning toast
      if (newViolations.length === warningThreshold) {
        toast({
          title: "Monitoring Warning",
          description: `${warningThreshold} violations detected. Test may be terminated if violations continue.`,
          variant: "destructive",
        });
      }

      // Check if threshold reached
      if (newViolations.length >= violationThreshold) {
        onViolationThreshold?.(newViolations);
      }

      return newViolations;
    });

    // Show specific violation message
    let message = '';
    switch (type) {
      case 'multiple_people':
        message = `${details?.count || 'Multiple'} people detected in frame`;
        break;
      case 'no_face':
        message = 'No person detected in camera view';
        break;
      case 'looking_away':
        message = 'Looking away from screen detected';
        break;
    }

    toast({
      title: "Monitoring Alert",
      description: message,
      variant: "destructive",
    });
  }, [toast, violationThreshold, warningThreshold, onViolationThreshold]);

  const updateStatus = useCallback((newStatus: WebcamStatus) => {
    setStatus(newStatus);
  }, []);

  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
    setViolations([]);
    violationCooldownRef.current.clear();
    
    toast({
      title: "Webcam Monitoring Started",
      description: "AI-powered monitoring is now active to ensure test integrity.",
    });
  }, [toast]);

  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
  }, []);

  const resetViolations = useCallback(() => {
    setViolations([]);
    violationCooldownRef.current.clear();
  }, []);

  const getViolationsByType = useCallback((type: WebcamViolation['type']) => {
    return violations.filter(v => v.type === type);
  }, [violations]);

  const getRecentViolations = useCallback((minutes = 5) => {
    const cutoff = Date.now() - (minutes * 60 * 1000);
    return violations.filter(v => v.timestamp > cutoff);
  }, [violations]);

  return {
    violations,
    status,
    isMonitoring,
    violationCount: violations.length,
    addViolation,
    updateStatus,
    startMonitoring,
    stopMonitoring,
    resetViolations,
    getViolationsByType,
    getRecentViolations,
    // Computed properties
    hasMultiplePeopleViolations: violations.some(v => v.type === 'multiple_people'),
    hasNoFaceViolations: violations.some(v => v.type === 'no_face'),
    hasLookingAwayViolations: violations.some(v => v.type === 'looking_away'),
    recentViolationCount: getRecentViolations().length,
    isAtWarningThreshold: violations.length >= warningThreshold,
    isAtViolationThreshold: violations.length >= violationThreshold
  };
};