
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface TestMonitoringOptions {
  onFullscreenExit?: () => void;
  onTabSwitch?: () => void;
  warningThreshold?: number;
  autoTerminateOnThreshold?: boolean;
}

export const useTestMonitoring = (options: TestMonitoringOptions = {}) => {
  const { toast } = useToast();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [warningCount, setWarningCount] = useState(0);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [isMonitoring, setIsMonitoring] = useState(false);

  const {
    onFullscreenExit,
    onTabSwitch,
    warningThreshold = 3,
    autoTerminateOnThreshold = true
  } = options;

  // Check if currently in fullscreen
  const checkFullscreenStatus = useCallback(() => {
    return !!(
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement
    );
  }, []);

  // Request fullscreen mode
  const requestFullscreen = useCallback(async () => {
    try {
      const element = document.documentElement;
      
      if (element.requestFullscreen) {
        await element.requestFullscreen();
      } else if ((element as any).webkitRequestFullscreen) {
        await (element as any).webkitRequestFullscreen();
      } else if ((element as any).mozRequestFullScreen) {
        await (element as any).mozRequestFullScreen();
      } else if ((element as any).msRequestFullscreen) {
        await (element as any).msRequestFullscreen();
      }
      
      setIsFullscreen(true);
      return true;
    } catch (error) {
      console.error('Failed to enter fullscreen:', error);
      toast({
        title: "Fullscreen Required",
        description: "Please enable fullscreen mode to continue with the test.",
        variant: "destructive",
      });
      return false;
    }
  }, [toast]);

  // Exit fullscreen mode
  const exitFullscreen = useCallback(async () => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        await (document as any).mozCancelFullScreen();
      } else if ((document as any).msExitFullscreen) {
        await (document as any).msExitFullscreen();
      }
      
      setIsFullscreen(false);
    } catch (error) {
      console.error('Failed to exit fullscreen:', error);
    }
  }, []);

  // Handle fullscreen change
  const handleFullscreenChange = useCallback(() => {
    const isCurrentlyFullscreen = checkFullscreenStatus();
    setIsFullscreen(isCurrentlyFullscreen);

    if (!isCurrentlyFullscreen && isMonitoring) {
      const newWarningCount = warningCount + 1;
      setWarningCount(newWarningCount);

      toast({
        title: `Warning ${newWarningCount}/${warningThreshold}`,
        description: "Please return to fullscreen mode immediately.",
        variant: "destructive",
      });

      if (newWarningCount >= warningThreshold && autoTerminateOnThreshold) {
        onFullscreenExit?.();
      }
    }
  }, [checkFullscreenStatus, isMonitoring, warningCount, warningThreshold, autoTerminateOnThreshold, onFullscreenExit, toast]);

  // Handle tab visibility change
  const handleVisibilityChange = useCallback(() => {
    if (document.hidden && isMonitoring) {
      const newTabSwitchCount = tabSwitchCount + 1;
      setTabSwitchCount(newTabSwitchCount);

      toast({
        title: `Tab Switch Detected ${newTabSwitchCount}/${warningThreshold}`,
        description: "Please stay on this tab during the test.",
        variant: "destructive",
      });

      if (newTabSwitchCount >= warningThreshold && autoTerminateOnThreshold) {
        onTabSwitch?.();
      }
    }
  }, [isMonitoring, tabSwitchCount, warningThreshold, autoTerminateOnThreshold, onTabSwitch, toast]);

  // Start monitoring
  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
    setWarningCount(0);
    setTabSwitchCount(0);
  }, []);

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
  }, []);

  // Reset warnings
  const resetWarnings = useCallback(() => {
    setWarningCount(0);
    setTabSwitchCount(0);
  }, []);

  // Set up event listeners
  useEffect(() => {
    if (!isMonitoring) return;

    // Fullscreen event listeners
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    // Tab visibility event listener
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isMonitoring, handleFullscreenChange, handleVisibilityChange]);

  return {
    isFullscreen,
    warningCount,
    tabSwitchCount,
    isMonitoring,
    requestFullscreen,
    exitFullscreen,
    startMonitoring,
    stopMonitoring,
    resetWarnings,
    totalViolations: warningCount + tabSwitchCount
  };
};
