import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useTest } from "@/context/TestContext";
import { FullscreenIcon, Timer, Eye, FileImage, Camera, TabletSmartphone, AlertTriangle } from "lucide-react";
import ThreeDBackground from "@/components/3d/ThreeDBackground";
import { TestIDVerification } from "@/components/TestIDVerification";

import { detectPose, detectPeople, saveImage } from "@/model";
import { useTestMonitoring } from "@/hooks/useTestMonitoring";
import TestMonitoringStatus from "@/components/TestMonitoringStatus";
import BackgroundAppManager from "@/components/BackgroundAppManager";
import { backgroundAppController } from "@/utils/backgroundAppController";
import WebcamMonitor from "@/components/WebcamMonitor";
import { useWebcamMonitoring } from "@/hooks/useWebcamMonitoring";
import { WebcamStatus } from "@/components/ui/webcam-status";

const TakeTest = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { getTestById } = useTest();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [test, setTest] = useState<any | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | boolean>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [warningCount, setWarningCount] = useState(0);
  const [imageFiles, setImageFiles] = useState<Record<string, File | null>>({});
  const [imagePreviewUrls, setImagePreviewUrls] = useState<Record<string, string>>({});
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluations, setEvaluations] = useState<Record<string, any>>({});
  const [testIdVerified, setTestIdVerified] = useState(false);
  const [systemReady, setSystemReady] = useState(false);
  const [systemWarnings, setSystemWarnings] = useState<string[]>([]);

  // Simplified state - webcam handled by WebcamMonitor component
  const [lastTabSwitchTime, setLastTabSwitchTime] = useState<number | null>(null);
  const [rapidTabSwitches, setRapidTabSwitches] = useState(0);
  
  // Test monitoring hook
  const {
    isFullscreen: monitorFullscreen,
    warningCount: monitoringWarnings,
    tabSwitchCount,
    isMonitoring,
    requestFullscreen,
    startMonitoring,
    stopMonitoring,
    resetWarnings,
    totalViolations
  } = useTestMonitoring({
    onFullscreenExit: () => handleSubmit(true),
    onTabSwitch: () => handleSubmit(true),
    warningThreshold: 1, // Immediate termination on first violation
    autoTerminateOnThreshold: true
  });

  // Webcam monitoring hook
  const webcamMonitoring = useWebcamMonitoring({
    onViolationThreshold: (violations) => {
      toast({
        title: "Test Terminated",
        description: `Test terminated due to excessive violations (${violations.length}).`,
        variant: "destructive",
      });
      handleSubmit(true);
    },
    violationThreshold: 5,
    warningThreshold: 3
  });

  // Update existing warningCount to include webcam violations
  const totalWarningCount = warningCount + monitoringWarnings + webcamMonitoring.violationCount;

  // System preparation handlers
  const handleSystemReady = () => {
    setSystemReady(true);
    setSystemWarnings([]);
    toast({
      title: "System Ready",
      description: "Your system has been prepared for the exam. You can now proceed.",
    });
  };

  const handleSystemNotReady = (warnings: string[]) => {
    setSystemReady(false);
    setSystemWarnings(warnings);
    toast({
      title: "System Issues Detected",
      description: `${warnings.length} issue(s) need attention before starting the exam.`,
      variant: "destructive",
    });
  };

  // Redirect if not authenticated as student
  useEffect(() => {
    if (!user || user.role !== "student") {
      navigate("/login");
      return;
    }

    if (!id) return;

    // Load test from local storage/context
    const t = getTestById(id);
    if (!t || t.status !== "published") {
      navigate("/student-dashboard");
      toast({
        title: "Test not found",
        description: "The test you're looking for is not available.",
        variant: "destructive",
      });
      return;
    }

    setTest(t);
    setTimeLeft(t.duration * 60);

    // Local session management
    const SESS_KEY = "pariksha_sessions";
    const sessions: any[] = JSON.parse(localStorage.getItem(SESS_KEY) || "[]");
    let existing = sessions.find(s => s.test_id === t.id && s.student_id === user.id);

    if (existing) {
      setSessionId(existing.id);
      if (existing.status === 'completed') {
        toast({
          title: "Test already submitted",
          description: "You have already completed this test.",
          variant: "destructive",
        });
        navigate("/student-dashboard");
        return;
      }
      loadPreviousAnswers(existing.id);
    } else {
      const newSession = {
        id: crypto.randomUUID(),
        test_id: t.id,
        student_id: user.id,
        started_at: new Date().toISOString(),
        status: 'active',
        warnings: 0,
      };
      sessions.push(newSession);
      localStorage.setItem(SESS_KEY, JSON.stringify(sessions));
      setSessionId(newSession.id);
    }

    // Load evaluations (local no-op for now)
    loadEvaluations(t.id);
  }, [id, user, navigate, getTestById, toast]);

  // Load evaluations (local placeholder)
  const loadEvaluations = async (_testId: string) => {
    setEvaluations({});
  };

  // Load previously saved answers (local)
  const loadPreviousAnswers = async (_testSessionId: string) => {
    if (!user || !id) return;
    try {
      const answersKey = `pariksha_answers_${id}_${user.id}`;
      const imagesKey = `pariksha_images_${id}_${user.id}`;
      const savedAnswers = JSON.parse(localStorage.getItem(answersKey) || '{}');
      const savedImages = JSON.parse(localStorage.getItem(imagesKey) || '{}');
      setAnswers(savedAnswers);
      setImagePreviewUrls(savedImages);
    } catch (error) {
      console.error("Error loading previous answers (local):", error);
    }
  };

  // Timer effect
  useEffect(() => {
    if (!timeLeft || timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev && prev > 0) {
          return prev - 1;
        } else {
          clearInterval(timer);
          handleSubmit(false);
          return 0;
        }
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement
      );
      
      setIsFullscreen(isCurrentlyFullscreen);
      
      // Warn if exiting fullscreen
      if (!isCurrentlyFullscreen && test) {
        const newWarningCount = warningCount + 1;
        setWarningCount(newWarningCount);
        
        toast({
          title: `Warning (${newWarningCount}/3)`,
          description: "Please return to fullscreen mode or your test may be invalidated.",
          variant: "destructive",
        });
        
        if (newWarningCount >= 3) {
          handleSubmit(true);
        }
        
        // Update warning count in session
        if (sessionId) {
          updateSessionWarnings(newWarningCount);
        }
      }
    };
    
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
    };
  }, [test, warningCount, toast, sessionId]);

  // Update session warnings (local)
  const updateSessionWarnings = async (count: number) => {
    if (!sessionId) return;
    try {
      const SESS_KEY = "pariksha_sessions";
      const sessions: any[] = JSON.parse(localStorage.getItem(SESS_KEY) || "[]");
      const idx = sessions.findIndex(s => s.id === sessionId);
      if (idx !== -1) {
        sessions[idx].warnings = count;
        localStorage.setItem(SESS_KEY, JSON.stringify(sessions));
      }
    } catch (error) {
      console.error("Error updating session warnings (local):", error);
    }
  };

  // Monitoring integration
  useEffect(() => {
    if (test && testIdVerified && monitorFullscreen && !isMonitoring) {
      startMonitoring();
      webcamMonitoring.startMonitoring();
      toast({
        title: "Monitoring Active",
        description: "AI-powered test monitoring is now active. Stay in fullscreen and on this tab.",
      });
    }
    
    if (!monitorFullscreen && isMonitoring) {
      stopMonitoring();
      webcamMonitoring.stopMonitoring();
    }
  }, [test, testIdVerified, monitorFullscreen, isMonitoring, startMonitoring, stopMonitoring, toast]);

  // Enhanced tab switching prevention
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && test && isFullscreen) {
        // Immediate termination on any tab switch during test
        toast({
          title: "Test Terminated",
          description: "Tab switching detected. Test has been automatically terminated.",
          variant: "destructive",
        });
        handleSubmit(true);
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (test && isFullscreen) {
        e.preventDefault();
        e.returnValue = 'Are you sure you want to leave? Your test will be terminated.';
        return e.returnValue;
      }
    };

    const handleBlur = () => {
      if (test && isFullscreen) {
        toast({
          title: "Test Terminated", 
          description: "Window lost focus. Test has been automatically terminated.",
          variant: "destructive",
        });
        handleSubmit(true);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (test && isFullscreen) {
        // Prevent common shortcuts that might exit fullscreen or switch tabs
        if (
          (e.ctrlKey && (e.key === 't' || e.key === 'w' || e.key === 'Tab')) ||
          (e.altKey && e.key === 'Tab') ||
          e.key === 'F11' ||
          (e.ctrlKey && e.shiftKey && e.key === 'T')
        ) {
          e.preventDefault();
          toast({
            title: "Action Blocked",
            description: "This action is not allowed during the test.",
            variant: "destructive",
          });
        }
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      if (test && isFullscreen) {
        e.preventDefault();
      }
    };
    
    if (test && isFullscreen) {
      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('beforeunload', handleBeforeUnload);
      window.addEventListener('blur', handleBlur);
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('contextmenu', handleContextMenu);
    }
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [test, isFullscreen, toast, sessionId]);

  // Handle when multiple people are detected (now handled by WebcamMonitor)
  const handleMultiplePeopleDetected = (count: number) => {
    toast({
      title: `Security Warning`,
      description: `Multiple people detected (${count}). You should be alone during the test.`,
      variant: "destructive",
    });
  };

  // Handle when face is not detected or looking away (now handled by WebcamMonitor)
  const handleFaceNotDetected = (direction: string) => {
    toast({
      title: `Webcam Warning`,
      description: direction === "No face detected" 
        ? "Your face is not visible. Please face the camera."
        : `You appear to be looking ${direction.toLowerCase()}. Please look at the screen.`,
      variant: "destructive",
    });
  };

  // Save answer after change (debounced)
  useEffect(() => {
    const saveTimeout = setTimeout(async () => {
      if (!user || !test || !sessionId) return;
      const currentQuestion = test.questions[currentQuestionIndex];
      if (!currentQuestion) return;
      const answer = answers[currentQuestion.id];
      if (answer === undefined) return;

      try {
        const answersKey = `pariksha_answers_${test.id}_${user.id}`;
        const existing = JSON.parse(localStorage.getItem(answersKey) || '{}');
        existing[currentQuestion.id] = answer;
        localStorage.setItem(answersKey, JSON.stringify(existing));
      } catch (error) {
        console.error("Error saving answer (local):", error);
      }
    }, 500);

    return () => clearTimeout(saveTimeout);
  }, [answers, currentQuestionIndex, test, user, sessionId]);

  const handleAnswerChange = (questionId: string, value: string | boolean) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleImageUpload = async (questionId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !user || !test) return;
    
    const file = e.target.files[0];
    
    // Create a preview URL
    const previewUrl = URL.createObjectURL(file);
    
    setImageFiles(prev => ({
      ...prev,
      [questionId]: file
    }));
    
    setImagePreviewUrls(prev => ({
      ...prev,
      [questionId]: previewUrl
    }));
    
    // Set a placeholder answer to track that this question has been answered
    setAnswers(prev => ({
      ...prev,
      [questionId]: "image_uploaded"
    }));
    
    try {
      // Save image locally (base64) for this user/test/question
      const reader = new FileReader();
      const dataUrl: string = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const imagesKey = `pariksha_images_${test.id}_${user.id}`;
      const existingImages = JSON.parse(localStorage.getItem(imagesKey) || '{}');
      existingImages[questionId] = dataUrl;
      localStorage.setItem(imagesKey, JSON.stringify(existingImages));

      // Also persist the placeholder answer so reloading restores state
      const answersKey = `pariksha_answers_${test.id}_${user.id}`;
      const existingAnswers = JSON.parse(localStorage.getItem(answersKey) || '{}');
      existingAnswers[questionId] = "image_uploaded";
      localStorage.setItem(answersKey, JSON.stringify(existingAnswers));

      toast({
        title: "Image saved",
        description: "Your image has been saved locally for this test.",
      });
    } catch (error) {
      console.error("Error processing image upload (local):", error);
      toast({
        title: "Save failed",
        description: "An error occurred while saving your image locally.",
        variant: "destructive",
      });
    }
  };

  const handleNextQuestion = () => {
    if (test && currentQuestionIndex < test.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async (forced = false) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      // Stop monitoring
      stopMonitoring();
      
      // Clean up any object URLs to avoid memory leaks
      Object.values(imagePreviewUrls).forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
      
      if (sessionId) {
        const SESS_KEY = "pariksha_sessions";
        const sessions: any[] = JSON.parse(localStorage.getItem(SESS_KEY) || "[]");
        const idx = sessions.findIndex(s => s.id === sessionId);
        if (idx !== -1) {
          sessions[idx].status = forced ? 'terminated' : 'completed';
          sessions[idx].ended_at = new Date().toISOString();
          localStorage.setItem(SESS_KEY, JSON.stringify(sessions));
        }
      }
      
      navigate("/student-dashboard");
      toast({
        title: forced ? "Test Terminated" : "Test Submitted",
        description: forced 
          ? `Test terminated due to security violations. Total violations: ${totalViolations}` 
          : "Your answers have been submitted successfully.",
        variant: forced ? "destructive" : "default",
      });
    } catch (error) {
      console.error("Error submitting test:", error);
      toast({
        title: "Submission Error",
        description: "There was an error submitting your test. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Create wrapper functions for onClick handlers
  const handleSubmitClick = () => {
    handleSubmit(false);
  };

  if (!test) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading test...</h2>
          <p>If the test doesn't load, please return to the dashboard.</p>
        </div>
      </div>
    );
  }

  const currentQuestion = test.questions[currentQuestionIndex];
  const hasEvaluation = currentQuestion && evaluations[currentQuestion.id];

  return (
    <>
      <ThreeDBackground />
      <div className="min-h-screen p-4 relative z-10">
        {!systemReady ? (
          <div className="flex items-center justify-center h-screen">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-4xl mx-auto"
            >
              <BackgroundAppManager
                onSystemReady={handleSystemReady}
                onSystemNotReady={handleSystemNotReady}
              />
              
              {systemWarnings.length > 0 && (
                <Card className="mt-6 bg-card/90 backdrop-blur-md border-destructive/20">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-destructive">Issues that need attention:</h3>
                      <ul className="space-y-2">
                        {systemWarnings.map((warning, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{warning}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="flex gap-4">
                        <Button 
                          onClick={() => {
                            setSystemReady(false);
                            setSystemWarnings([]);
                          }}
                          variant="outline"
                        >
                          Try Again
                        </Button>
                        <Button 
                          onClick={() => setSystemReady(true)}
                          variant="destructive"
                        >
                          Proceed Anyway (Not Recommended)
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              <div className="mt-6 text-center">
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/student-dashboard")}
                >
                  Return to Dashboard
                </Button>
              </div>
            </motion.div>
          </div>
        ) : !isFullscreen ? (
          <div className="flex items-center justify-center h-screen">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center max-w-md mx-auto"
            >
              <Card className="bg-card/90 backdrop-blur-md border-primary/20">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-4">{test.title}</h2>
                  {test.unique_id && (
                    <p className="text-sm bg-primary/10 text-primary inline-block px-2 py-1 rounded mb-4">
                      Test ID: {test.unique_id}
                    </p>
                  )}
                  <p className="mb-6">
                    This test requires fullscreen mode with advanced monitoring. 
                    Exiting fullscreen or switching tabs will result in warnings and potential test termination.
                  </p>
                  <div className="flex flex-col gap-4">
                    <Button 
                      onClick={requestFullscreen} 
                      className="flex items-center gap-2"
                    >
                      <FullscreenIcon className="h-5 w-5" />
                      Enter Fullscreen & Start Monitoring
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => navigate("/student-dashboard")}
                    >
                      Return to Dashboard
                    </Button>
                  </div>
                  <div className="mt-6 text-sm text-muted-foreground">
                    <p>⚠️ <strong>Security Notice:</strong></p>
                    <ul className="text-left mt-2 space-y-1">
                      <li>• Exiting fullscreen mode</li>
                      <li>• Switching browser tabs</li>
                      <li>• Looking away from camera</li>
                      <li>• Multiple people detected</li>
                    </ul>
                    <p className="mt-2">Any 3 violations will automatically terminate your test.</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        ) : !testIdVerified ? (
          <div className="flex items-center justify-center h-screen">
            <TestIDVerification 
              expectedTestId={test.unique_id || ''} 
              onSuccess={() => setTestIdVerified(true)}
              testTitle={test.title}
            />
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="container mx-auto py-6"
          >
            {/* Add monitoring status display */}
            <WebcamStatus
              isActive={webcamMonitoring.isMonitoring}
              peopleCount={webcamMonitoring.status.peopleCount}
              faceDirection={webcamMonitoring.status.faceDirection}
              violationCount={webcamMonitoring.violationCount}
              isFullscreen={monitorFullscreen}
            />

            {/* WebcamMonitor component */}
            <WebcamMonitor
              isActive={webcamMonitoring.isMonitoring}
              onViolation={webcamMonitoring.addViolation}
              onStatusUpdate={webcamMonitoring.updateStatus}
            />

            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold">{test.title}</h1>
                <div className="flex gap-2 items-center">
                  <p className="text-muted-foreground">{test.subject}</p>
                  {test.unique_id && (
                    <p className="text-sm bg-primary/10 text-primary px-2 py-0.5 rounded">
                      ID: {test.unique_id}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-primary/20 text-primary p-2 rounded-md">
                  <Timer className="h-5 w-5" />
                  {timeLeft !== null ? formatTime(timeLeft) : "00:00"}
                </div>
                <div className="flex items-center gap-2 bg-primary/20 text-primary p-2 rounded-md">
                  <AlertTriangle className="h-5 w-5" />
                  Total Violations: {totalViolations}/9
                </div>
                <div className="flex items-center gap-2 bg-primary/20 text-primary p-2 rounded-md">
                  <Eye className="h-5 w-5" />
                  Warnings: {warningCount}/3
                </div>
                <div className="flex items-center gap-2 bg-primary/20 text-primary p-2 rounded-md">
                  <TabletSmartphone className="h-5 w-5" />
                  Tab Shifts: {rapidTabSwitches}/3
                </div>
              </div>
            </div>
            
            <Card className="bg-card/90 backdrop-blur-md border-primary/20 mb-6">
              <CardContent className="p-6">
                {currentQuestion && (
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-muted-foreground">
                          Question {currentQuestionIndex + 1} of {test.questions.length}
                        </span>
                        <span className="text-sm font-medium text-muted-foreground">
                          {currentQuestion.marks} marks
                        </span>
                      </div>
                      
                      {/* Show evaluation if available */}
                      {hasEvaluation && (
                        <div className="mb-4 p-4 bg-primary/10 rounded-lg">
                          <div className="font-medium">Evaluation Result:</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-lg font-bold">
                              {evaluations[currentQuestion.id].score} / {currentQuestion.marks}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              ({((evaluations[currentQuestion.id].score / currentQuestion.marks) * 100).toFixed(1)}%)
                            </span>
                          </div>
                          {evaluations[currentQuestion.id].feedback && (
                            <div className="mt-2 text-sm">
                              <span className="font-medium">Feedback: </span>
                              {evaluations[currentQuestion.id].feedback}
                            </div>
                          )}
                        </div>
                      )}
                      
                      <h3 className="text-xl font-semibold mb-4">{currentQuestion.text}</h3>
                      
                      {/* MCQ Question */}
                      {currentQuestion.type === "mcq" && currentQuestion.options && (
                        <div className="space-y-3">
                          {currentQuestion.options.map((option: string, index: number) => (
                            <div 
                              key={index}
                              onClick={() => handleAnswerChange(currentQuestion.id, option)}
                              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                answers[currentQuestion.id] === option 
                                  ? "border-primary bg-primary/10" 
                                  : "border-border hover:border-primary/50"
                              }`}
                            >
                              {option}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* True/False Question */}
                      {currentQuestion.type === "truefalse" && (
                        <div className="flex gap-3">
                          <div 
                            onClick={() => handleAnswerChange(currentQuestion.id, true)}
                            className={`p-3 border rounded-lg cursor-pointer transition-colors flex-1 text-center ${
                              answers[currentQuestion.id] === true 
                                ? "border-primary bg-primary/10" 
                                : "border-border hover:border-primary/50"
                            }`}
                          >
                            True
                          </div>
                          <div 
                            onClick={() => handleAnswerChange(currentQuestion.id, false)}
                            className={`p-3 border rounded-lg cursor-pointer transition-colors flex-1 text-center ${
                              answers[currentQuestion.id] === false 
                                ? "border-primary bg-primary/10" 
                                : "border-border hover:border-primary/50"
                            }`}
                          >
                            False
                          </div>
                        </div>
                      )}
                      
                      {/* Essay Question */}
                      {currentQuestion.type === "essay" && (
                        <textarea
                          className="w-full p-3 border rounded-lg h-36 bg-background"
                          value={answers[currentQuestion.id] as string || ""}
                          onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                          placeholder="Type your answer here..."
                        />
                      )}
                      
                      {/* Short Answer Question */}
                      {currentQuestion.type === "short" && (
                        <div className="space-y-2">
                          <Input
                            className="w-full"
                            value={answers[currentQuestion.id] as string || ""}
                            onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                            placeholder={currentQuestion.answerHint || "Type your answer here..."}
                          />
                          {currentQuestion.answerHint && (
                            <div className="text-sm text-muted-foreground">
                              Hint: {currentQuestion.answerHint}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Long Answer Question */}
                      {currentQuestion.type === "long" && (
                        <div className="space-y-2">
                          <textarea
                            className="w-full p-3 border rounded-lg h-64 bg-background"
                            value={answers[currentQuestion.id] as string || ""}
                            onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                            placeholder={currentQuestion.answerHint || "Type your detailed answer here..."}
                          />
                          {currentQuestion.answerHint && (
                            <div className="text-sm text-muted-foreground">
                              Hint: {currentQuestion.answerHint}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Image Upload Question */}
                      {currentQuestion.type === "image" && (
                        <div className="space-y-3">
                          {imagePreviewUrls[currentQuestion.id] ? (
                            <div className="space-y-3">
                              <div className="border rounded-lg overflow-hidden">
                                <img 
                                  src={imagePreviewUrls[currentQuestion.id]} 
                                  alt="Your uploaded image" 
                                  className="max-w-full h-auto"
                                />
                              </div>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  // Clear the image
                                  if (imagePreviewUrls[currentQuestion.id]) {
                                    URL.revokeObjectURL(imagePreviewUrls[currentQuestion.id]);
                                  }
                                  
                                  setImageFiles(prev => ({
                                    ...prev,
                                    [currentQuestion.id]: null
                                  }));
                                  
                                  setImagePreviewUrls(prev => {
                                    const newUrls = {...prev};
                                    delete newUrls[currentQuestion.id];
                                    return newUrls;
                                  });
                                  
                                  setAnswers(prev => {
                                    const newAnswers = {...prev};
                                    delete newAnswers[currentQuestion.id];
                                    return newAnswers;
                                  });
                                }}
                              >
                                Change Image
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <label 
                                htmlFor={`image-upload-${currentQuestion.id}`}
                                className="border border-dashed rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-accent/50 transition-colors"
                              >
                                <FileImage className="h-12 w-12 text-muted-foreground mb-4" />
                                <p className="text-center">
                                  {currentQuestion.imagePrompt || "Click to upload an image or drag and drop"}
                                </p>
                                <p className="text-sm text-muted-foreground mt-2">
                                  PNG or JPG (max. 5MB)
                                </p>
                              </label>
                              <input
                                id={`image-upload-${currentQuestion.id}`}
                                type="file"
                                className="hidden"
                                accept="image/png, image/jpeg"
                                onChange={(e) => handleImageUpload(currentQuestion.id, e)}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </Button>
              
              <Button 
                onClick={handleSubmitClick}
                variant="destructive"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Test"}
              </Button>
              
              <Button 
                onClick={handleNextQuestion}
                disabled={currentQuestionIndex === test.questions.length - 1}
              >
                Next
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </>
  );
};

export default TakeTest;
