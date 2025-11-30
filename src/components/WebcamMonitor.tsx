import { useEffect, useRef, useState } from 'react';
import { FaceLandmarker, FilesetResolver, FaceLandmarkerResult } from '@mediapipe/tasks-vision';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Camera, Users, Eye } from 'lucide-react';

interface WebcamMonitorProps {
  isActive: boolean;
  onViolation: (type: 'multiple_people' | 'no_face' | 'looking_away', details?: any) => void;
  onStatusUpdate: (status: { peopleCount: number; faceDirection: string; isLookingAway: boolean }) => void;
}

interface Detection {
  timestamp: number;
  type: 'multiple_people' | 'no_face' | 'looking_away';
  details?: any;
}

const WebcamMonitor = ({ isActive, onViolation, onStatusUpdate }: WebcamMonitorProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [faceLandmarker, setFaceLandmarker] = useState<FaceLandmarker | null>(null);
  const [peopleCount, setPeopleCount] = useState(1);
  const [faceDirection, setFaceDirection] = useState('Forward');
  const [violations, setViolations] = useState<Detection[]>([]);
  const monitoringIntervalRef = useRef<number | null>(null);
  const lastDetectionRef = useRef<{ faces: number; direction: string; timestamp: number }>({
    faces: 1,
    direction: 'Forward',
    timestamp: Date.now()
  });

  // Initialize MediaPipe Face Landmarker
  useEffect(() => {
    const initFaceLandmarker = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );
        
        const landmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
            delegate: 'GPU'
          },
          outputFaceBlendshapes: false,
          outputFacialTransformationMatrixes: true,
          runningMode: 'VIDEO',
          numFaces: 2
        });
        
        setFaceLandmarker(landmarker);
        setIsInitialized(true);
        console.log('MediaPipe Face Landmarker initialized');
      } catch (err) {
        console.error('Error initializing Face Landmarker:', err);
        setError('Failed to initialize AI models');
      }
    };

    initFaceLandmarker();

    return () => {
      faceLandmarker?.close();
    };
  }, []);

  // Setup webcam when active
  useEffect(() => {
    if (!isActive || !isInitialized) {
      stopWebcam();
      return;
    }

    startWebcam();

    return () => {
      stopWebcam();
    };
  }, [isActive, isInitialized]);

  const startWebcam = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        
        videoRef.current.onloadedmetadata = () => {
          startMonitoring();
        };
      }
    } catch (err) {
      console.error('Error accessing webcam:', err);
      setError('Webcam access denied. Please enable webcam to continue the test.');
    }
  };

  const stopWebcam = () => {
    if (monitoringIntervalRef.current) {
      clearInterval(monitoringIntervalRef.current);
      monitoringIntervalRef.current = null;
    }

    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const startMonitoring = () => {
    if (monitoringIntervalRef.current) {
      clearInterval(monitoringIntervalRef.current);
    }

    // Monitor every 2 seconds for more responsive detection
    monitoringIntervalRef.current = window.setInterval(async () => {
      await analyzeFrame();
    }, 2000);
  };

  const drawLandmarks = (canvas: HTMLCanvasElement, result: FaceLandmarkerResult, direction: string) => {
    const ctx = canvas.getContext('2d');
    if (!ctx || !videoRef.current) return;

    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw face landmarks
    if (result.faceLandmarks && result.faceLandmarks.length > 0) {
      for (const landmarks of result.faceLandmarks) {
        // Draw face mesh
        ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
        for (const landmark of landmarks) {
          ctx.beginPath();
          ctx.arc(
            landmark.x * canvas.width,
            landmark.y * canvas.height,
            2,
            0,
            2 * Math.PI
          );
          ctx.fill();
        }

        // Draw face outline
        ctx.strokeStyle = 'rgba(0, 255, 0, 0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        const faceOval = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109];
        faceOval.forEach((index, i) => {
          if (index < landmarks.length) {
            const point = landmarks[index];
            if (i === 0) {
              ctx.moveTo(point.x * canvas.width, point.y * canvas.height);
            } else {
              ctx.lineTo(point.x * canvas.width, point.y * canvas.height);
            }
          }
        });
        ctx.closePath();
        ctx.stroke();
      }
    }

    // Draw direction indicator
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = direction === 'Forward' ? '#00ff00' : '#ff0000';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    const text = `Looking: ${direction}`;
    ctx.strokeText(text, 20, 40);
    ctx.fillText(text, 20, 40);

    // Draw face count
    const faceCountText = `Faces: ${result.faceLandmarks.length}`;
    ctx.fillStyle = result.faceLandmarks.length === 1 ? '#00ff00' : '#ff0000';
    ctx.strokeText(faceCountText, 20, 75);
    ctx.fillText(faceCountText, 20, 75);
  };

  const calculateHeadPose = (result: FaceLandmarkerResult): string => {
    if (!result.facialTransformationMatrixes || result.facialTransformationMatrixes.length === 0) {
      return 'Forward';
    }

    const matrix = result.facialTransformationMatrixes[0].data;
    
    // Extract rotation angles from transformation matrix
    const rotationY = Math.atan2(matrix[8], matrix[10]);
    const rotationYDegrees = rotationY * (180 / Math.PI);

    // Determine direction based on Y-axis rotation
    if (rotationYDegrees < -20) {
      return 'Left';
    } else if (rotationYDegrees > 20) {
      return 'Right';
    } else {
      return 'Forward';
    }
  };

  const analyzeFrame = async () => {
    if (!videoRef.current || !canvasRef.current || !faceLandmarker) return;

    const video = videoRef.current;
    
    // Check if video is ready
    if (video.readyState !== video.HAVE_ENOUGH_DATA) return;

    try {
      const startTimeMs = performance.now();
      const result = faceLandmarker.detectForVideo(video, startTimeMs);

      const currentTime = Date.now();
      const facesDetected = result.faceLandmarks.length;

      // Update people count
      setPeopleCount(facesDetected);

      // Determine face direction for the first detected face
      let direction = 'Forward';
      let isLookingAway = false;

      if (facesDetected > 0) {
        direction = calculateHeadPose(result);
        isLookingAway = direction !== 'Forward';
        setFaceDirection(direction);
      }

      // Draw landmarks overlay
      drawLandmarks(canvasRef.current, result, direction);

      // Check for violations with debouncing (only trigger if consistent for 2 checks)
      const timeSinceLastCheck = currentTime - lastDetectionRef.current.timestamp;
      
      // Multiple people violation
      if (facesDetected > 1 && lastDetectionRef.current.faces > 1) {
        const violation: Detection = {
          timestamp: currentTime,
          type: 'multiple_people',
          details: { count: facesDetected }
        };
        setViolations(prev => [...prev, violation]);
        onViolation('multiple_people', { count: facesDetected });
      }

      // No face detected violation
      if (facesDetected === 0 && lastDetectionRef.current.faces === 0) {
        const violation: Detection = {
          timestamp: currentTime,
          type: 'no_face',
          details: {}
        };
        setViolations(prev => [...prev, violation]);
        onViolation('no_face');
      }

      // Looking away violation
      if (facesDetected === 1 && isLookingAway && 
          lastDetectionRef.current.direction !== 'Forward' && 
          timeSinceLastCheck > 1000) {
        const violation: Detection = {
          timestamp: currentTime,
          type: 'looking_away',
          details: { direction }
        };
        setViolations(prev => [...prev, violation]);
        onViolation('looking_away', { direction });
      }

      // Update last detection
      lastDetectionRef.current = {
        faces: facesDetected,
        direction,
        timestamp: currentTime
      };

      // Update status
      onStatusUpdate({
        peopleCount: facesDetected,
        faceDirection: direction,
        isLookingAway
      });

    } catch (err) {
      console.error('Error analyzing frame:', err);
    }
  };

  const getViolationColor = (count: number) => {
    if (count === 0) return 'text-green-500';
    if (count <= 2) return 'text-yellow-500';
    if (count <= 5) return 'text-orange-500';
    return 'text-destructive';
  };

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!isInitialized) {
    return (
      <Alert className="mb-4">
        <Camera className="h-4 w-4" />
        <AlertDescription>Initializing AI monitoring system...</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {/* Webcam preview with overlay */}
      <div className="relative w-full max-w-2xl mx-auto rounded-lg overflow-hidden border-2 border-border bg-card">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-auto"
        />
        <canvas 
          ref={canvasRef} 
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
        />

      </div>

      {/* Monitoring status */}
      {isActive && (
        <div className="flex flex-wrap items-center gap-4 p-3 bg-card rounded-lg border">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Camera className="h-4 w-4 text-primary" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            </div>
            <span className="text-sm font-medium">AI Monitoring Active</span>
          </div>

          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className={`text-sm font-medium ${getViolationColor(peopleCount > 1 ? 1 : 0)}`}>
              {peopleCount} {peopleCount === 1 ? 'person' : 'people'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <span className={`text-sm font-medium ${faceDirection === 'Forward' ? 'text-green-500' : 'text-destructive'}`}>
              Looking {faceDirection}
            </span>
          </div>

          {violations.length > 0 && (
            <Badge variant="destructive" className="ml-auto">
              {violations.length} violations
            </Badge>
          )}
        </div>
      )}

      {/* Recent violations */}
      {violations.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Recent Violations:</h4>
          {violations.slice(-3).map((violation, index) => (
            <Alert key={index} variant="destructive" className="py-2">
              <AlertTriangle className="h-3 w-3" />
              <AlertDescription className="text-xs">
                {violation.type === 'multiple_people' && 
                  `Multiple people detected (${violation.details?.count})`}
                {violation.type === 'no_face' && 'No person detected in frame'}
                {violation.type === 'looking_away' && 'Looking away from screen'}
                <span className="ml-2 text-muted-foreground">
                  {new Date(violation.timestamp).toLocaleTimeString()}
                </span>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}
    </div>
  );
};

export default WebcamMonitor;