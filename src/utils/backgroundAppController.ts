
// Utility to help manage background applications during test
export class BackgroundAppController {
  private static instance: BackgroundAppController;
  private mediaDevices: MediaDeviceInfo[] = [];
  private activeStreams: MediaStream[] = [];

  private constructor() {}

  static getInstance(): BackgroundAppController {
    if (!BackgroundAppController.instance) {
      BackgroundAppController.instance = new BackgroundAppController();
    }
    return BackgroundAppController.instance;
  }

  // Request permissions and check for potential distractions
  async requestSystemPermissions(): Promise<{
    notifications: boolean;
    camera: boolean;
    microphone: boolean;
    warnings: string[];
  }> {
    const permissions = {
      notifications: false,
      camera: false,
      microphone: false,
      warnings: [] as string[]
    };

    try {
      // Request notification permission and disable them
      if ('Notification' in window) {
        const notificationPermission = await Notification.requestPermission();
        permissions.notifications = notificationPermission === 'granted';
        
        if (notificationPermission === 'granted') {
          // Close any existing notifications
          this.closeExistingNotifications();
        }
      }

      // Check camera access
      try {
        const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
        permissions.camera = true;
        this.activeStreams.push(cameraStream);
      } catch (error) {
        permissions.warnings.push('Camera access required for exam monitoring');
      }

      // Check microphone access (optional for some exams)
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        permissions.microphone = true;
        this.activeStreams.push(audioStream);
      } catch (error) {
        permissions.warnings.push('Microphone access may be required');
      }

      // Get list of media devices
      this.mediaDevices = await navigator.mediaDevices.enumerateDevices();

    } catch (error) {
      console.error('Error requesting system permissions:', error);
      permissions.warnings.push('Unable to access required system permissions');
    }

    return permissions;
  }

  // Close existing notifications
  private closeExistingNotifications() {
    // Unfortunately, we can't close notifications created by other apps
    // But we can prevent new ones during the exam
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        // Close any notifications from our service worker
        registration.getNotifications().then(notifications => {
          notifications.forEach(notification => notification.close());
        });
      });
    }
  }

  // Attempt to detect and warn about background applications
  async detectBackgroundActivity(): Promise<{
    suspiciousActivity: boolean;
    warnings: string[];
  }> {
    const result = {
      suspiciousActivity: false,
      warnings: [] as string[]
    };

    try {
      // Check for multiple audio/video inputs (could indicate screen recording software)
      const videoInputs = this.mediaDevices.filter(device => device.kind === 'videoinput');
      const audioInputs = this.mediaDevices.filter(device => device.kind === 'audioinput');

      if (videoInputs.length > 2) {
        result.suspiciousActivity = true;
        result.warnings.push(`Multiple video inputs detected (${videoInputs.length}). Please close any screen recording software.`);
      }

      if (audioInputs.length > 2) {
        result.suspiciousActivity = true;
        result.warnings.push(`Multiple audio inputs detected (${audioInputs.length}). Please close any audio recording software.`);
      }

      // Check for screen sharing (if supported)
      if (navigator.mediaDevices.getDisplayMedia) {
        try {
          // This will show a permission dialog, but we immediately stop it
          const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
          displayStream.getTracks().forEach(track => track.stop());
          result.warnings.push('Screen sharing capability detected. Please ensure no screen sharing apps are running.');
        } catch (error) {
          // User denied or no screen sharing - this is actually good
        }
      }

      // Check browser focus and visibility API
      if (document.hidden) {
        result.suspiciousActivity = true;
        result.warnings.push('Browser tab is not focused. Please close other applications and focus on the exam.');
      }

    } catch (error) {
      console.error('Error detecting background activity:', error);
      result.warnings.push('Unable to fully scan for background applications');
    }

    return result;
  }

  // Cleanup function to stop all streams
  cleanup() {
    this.activeStreams.forEach(stream => {
      stream.getTracks().forEach(track => track.stop());
    });
    this.activeStreams = [];
  }

  // Get system information for monitoring
  getSystemInfo(): {
    userAgent: string;
    platform: string;
    cookieEnabled: boolean;
    onlineStatus: boolean;
    screenInfo: {
      width: number;
      height: number;
      colorDepth: number;
    };
  } {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      onlineStatus: navigator.onLine,
      screenInfo: {
        width: screen.width,
        height: screen.height,
        colorDepth: screen.colorDepth
      }
    };
  }

  // Show system optimization suggestions
  getOptimizationSuggestions(): string[] {
    const suggestions = [
      '• Close all unnecessary browser tabs',
      '• Close social media applications (WhatsApp, Telegram, etc.)',
      '• Close streaming applications (YouTube, Netflix, Spotify)',
      '• Close communication apps (Skype, Teams, Discord)',
      '• Close file sharing applications',
      '• Close any screen recording software',
      '• Disable desktop notifications',
      '• Close background downloads or updates',
      '• Ensure stable internet connection',
      '• Close any VPN or proxy applications'
    ];

    return suggestions;
  }

  // Attempt to minimize distractions using available APIs
  async minimizeDistractions(): Promise<void> {
    try {
      // Request fullscreen mode
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }

      // Hide cursor after period of inactivity (optional)
      document.body.style.cursor = 'none';
      
      // Prevent context menu
      document.addEventListener('contextmenu', (e) => e.preventDefault());
      
      // Prevent certain keyboard shortcuts
      document.addEventListener('keydown', (e) => {
        // Prevent Alt+Tab, Ctrl+Alt+Del, Windows key, etc.
        if (
          (e.altKey && e.code === 'Tab') ||
          (e.ctrlKey && e.altKey && e.code === 'Delete') ||
          e.code === 'MetaLeft' ||
          e.code === 'MetaRight' ||
          (e.ctrlKey && e.shiftKey && e.code === 'KeyI') || // Dev tools
          e.code === 'F12' // Dev tools
        ) {
          e.preventDefault();
          return false;
        }
      });

    } catch (error) {
      console.error('Error minimizing distractions:', error);
    }
  }

  // Show cursor again
  showCursor() {
    document.body.style.cursor = 'auto';
  }
}

export const backgroundAppController = BackgroundAppController.getInstance();
