import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import ThreeDBackground from "@/components/3d/ThreeDBackground";
import { useAuth } from "@/context/AuthContext";
import { useTest, Question } from "@/context/TestContext";
import CodingConsole from "@/components/CodingConsole";
import { 
  Plus, 
  Minus, 
  ArrowLeft, 
  Save, 
  Check, 
  Shield, 
  LogOut,
  Trash,
  FileImage,
  FileText,
  Text,
  Code,
  Upload,
  Sparkles,
  Loader2
} from "lucide-react";

const subjects = [
  "Computer Science",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "History",
  "Geography",
  "English",
  "Economics",
];

const CODING_LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "c", label: "C" },
];

const CreateTest = () => {
  const { user, logout } = useAuth();
  const { createTest } = useTest();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [testTitle, setTestTitle] = useState("");
  const [subject, setSubject] = useState<string>("");
  const [duration, setDuration] = useState(60);
  const [questions, setQuestions] = useState<Omit<Question, "id">[]>([
    {
      type: "mcq",
      text: "",
      options: ["", "", "", ""],
      correctAnswer: "",
      marks: 5,
    },
  ]);
  
  // AI Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [numberOfQuestions, setNumberOfQuestions] = useState(10);
  const [difficulty, setDifficulty] = useState("medium");

  // Redirect if not authenticated
  useEffect(() => {
    if (!user || user.role !== "faculty") {
      navigate("/login");
    }
  }, [user, navigate]);

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        type: "mcq",
        text: "",
        options: ["", "", "", ""],
        correctAnswer: "",
        marks: 5,
      },
    ]);
  };

  const handleRemoveQuestion = (index: number) => {
    if (questions.length > 1) {
      const newQuestions = [...questions];
      newQuestions.splice(index, 1);
      setQuestions(newQuestions);
    } else {
      toast({
        title: "Error",
        description: "You must have at least one question",
        variant: "destructive",
      });
    }
  };

  // AI Generation handlers
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload PDF, DOC, DOCX, or TXT files only",
          variant: "destructive",
        });
        return;
      }
      
      if (file.size > 20 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please upload a file smaller than 20MB",
          variant: "destructive",
        });
        return;
      }
      
      setUploadedFile(file);
      toast({
        title: "File Uploaded",
        description: `${file.name} is ready for processing`,
      });
    }
  };

  const handleGenerateTest = async () => {
    if (!uploadedFile) {
      toast({
        title: "No File Selected",
        description: "Please upload a document first",
        variant: "destructive",
      });
      return;
    }

    if (!subject) {
      toast({
        title: "Subject Required",
        description: "Please select a subject before generating",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Read file content
      const text = await uploadedFile.text();
      
      // Call edge function to generate questions
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-test-from-document`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            documentText: text,
            subject,
            numberOfQuestions,
            difficulty,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate test");
      }

      const data = await response.json();
      
      // Transform AI questions to match our format
      const transformedQuestions = data.questions.map((q: any) => {
        if (q.type === "mcq") {
          return {
            type: "mcq",
            text: q.text,
            options: q.options,
            correctAnswer: q.correctAnswer,
            marks: q.marks || 5,
          };
        } else if (q.type === "truefalse") {
          return {
            type: "truefalse",
            text: q.text,
            correctAnswer: q.correctAnswer.toLowerCase() === "true",
            marks: q.marks || 3,
          };
        } else {
          return {
            type: "short",
            text: q.text,
            correctAnswer: q.correctAnswer,
            marks: q.marks || 5,
          };
        }
      });

      setQuestions(transformedQuestions);
      
      toast({
        title: "Test Generated Successfully!",
        description: `${transformedQuestions.length} questions created. Review and edit as needed.`,
      });
    } catch (error) {
      console.error("Error generating test:", error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate test questions",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleQuestionTypeChange = (index: number, type: "mcq" | "essay" | "truefalse" | "short" | "long" | "image" | "coding") => {
    const newQuestions = [...questions];
    
    if (type === "mcq") {
      newQuestions[index] = {
        ...newQuestions[index],
        type,
        options: ["", "", "", ""],
        correctAnswer: "",
      };
    } else if (type === "truefalse") {
      newQuestions[index] = {
        ...newQuestions[index],
        type,
        options: undefined,
        correctAnswer: true,
      };
    } else if (type === "image") {
      newQuestions[index] = {
        ...newQuestions[index],
        type,
        options: undefined,
        correctAnswer: undefined,
        imagePrompt: "Upload an image related to the question",
      };
    } else if (type === "coding") {
      newQuestions[index] = {
        ...newQuestions[index],
        type,
        options: undefined,
        correctAnswer: undefined,
        codingLanguage: "python",
        starterCode: "# Write your code here\n",
        expectedOutput: "",
        testCases: [
          {
            input: "",
            expectedOutput: "",
            description: "Test case 1"
          }
        ]
      };
    } else {
      // essay, short, long question types
      newQuestions[index] = {
        ...newQuestions[index],
        type,
        options: undefined,
        correctAnswer: undefined,
      };
    }
    
    setQuestions(newQuestions);
  };

  const handleQuestionChange = (index: number, field: string, value: any) => {
    const newQuestions = [...questions];
    (newQuestions[index] as any)[field] = value;
    setQuestions(newQuestions);
  };

  const handleOptionChange = (questionIndex: number, optionIndex: number, value: string) => {
    const newQuestions = [...questions];
    if (newQuestions[questionIndex].options) {
      newQuestions[questionIndex].options![optionIndex] = value;
      setQuestions(newQuestions);
    }
  };

  const handleCorrectAnswerChange = (questionIndex: number, value: string | boolean) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].correctAnswer = value;
    setQuestions(newQuestions);
  };

  const handleTestCaseChange = (questionIndex: number, testCaseIndex: number, field: string, value: string) => {
    const newQuestions = [...questions];
    if (newQuestions[questionIndex].testCases) {
      newQuestions[questionIndex].testCases![testCaseIndex] = {
        ...newQuestions[questionIndex].testCases![testCaseIndex],
        [field]: value
      };
      setQuestions(newQuestions);
    }
  };

  const handleAddTestCase = (questionIndex: number) => {
    const newQuestions = [...questions];
    if (newQuestions[questionIndex].testCases) {
      newQuestions[questionIndex].testCases!.push({
        input: "",
        expectedOutput: "",
        description: `Test case ${newQuestions[questionIndex].testCases!.length + 1}`
      });
      setQuestions(newQuestions);
    }
  };

  const handleRemoveTestCase = (questionIndex: number, testCaseIndex: number) => {
    const newQuestions = [...questions];
    if (newQuestions[questionIndex].testCases && newQuestions[questionIndex].testCases!.length > 1) {
      newQuestions[questionIndex].testCases!.splice(testCaseIndex, 1);
      setQuestions(newQuestions);
    }
  };

  const validateTest = () => {
    if (!testTitle || !subject || duration <= 0) {
      toast({
        title: "Error",
        description: "Please fill in all test details",
        variant: "destructive",
      });
      return false;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text || q.marks <= 0) {
        toast({
          title: "Error",
          description: `Question ${i + 1} is incomplete`,
          variant: "destructive",
        });
        return false;
      }

      if (q.type === "mcq") {
        if (!q.options || q.options.some(opt => !opt)) {
          toast({
            title: "Error",
            description: `All options for Question ${i + 1} must be filled`,
            variant: "destructive",
          });
          return false;
        }

        if (!q.correctAnswer) {
          toast({
            title: "Error",
            description: `Please select a correct answer for Question ${i + 1}`,
            variant: "destructive",
          });
          return false;
        }
      }

      if (q.type === "coding") {
        if (!q.codingLanguage || !q.starterCode) {
          toast({
            title: "Error",
            description: `Please configure the coding environment for Question ${i + 1}`,
            variant: "destructive",
          });
          return false;
        }
      }
    }

    return true;
  };

  const handleSaveTest = (status: "draft" | "published") => {
    if (!user) return;
    
    if (status === "published" && !validateTest()) {
      return;
    }

    const questionsWithIds: Question[] = questions.map((q, index) => ({
      ...q,
      id: `q${index + 1}`,
    }));

    createTest({
      title: testTitle || "Untitled Test",
      subject: subject || "Unspecified",
      duration,
      questions: questionsWithIds,
      createdBy: user.id,
      status,
      unique_id: undefined, // Will be auto-generated
    });

    toast({
      title: "Success",
      description: `Test ${status === "published" ? "published" : "saved as draft"}`,
    });

    navigate("/faculty-dashboard");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const renderQuestionTypeIcon = (type: string) => {
    switch (type) {
      case "mcq":
        return <Check className="h-4 w-4 mr-2" />;
      case "essay":
        return <FileText className="h-4 w-4 mr-2" />;
      case "truefalse":
        return <Check className="h-4 w-4 mr-2" />;
      case "short":
        return <Text className="h-4 w-4 mr-2" />;
      case "long":
        return <FileText className="h-4 w-4 mr-2" />;
      case "image":
        return <FileImage className="h-4 w-4 mr-2" />;
      case "coding":
        return <Code className="h-4 w-4 mr-2" />;
      default:
        return null;
    }
  };

  // Function to render question format guidance based on question type
  const renderFormatGuidance = (type: string) => {
    switch (type) {
      case "short":
        return (
          <div className="text-sm text-muted-foreground mt-1">
            Short answer questions typically require 1-2 sentences or a few words.
          </div>
        );
      case "long":
        return (
          <div className="text-sm text-muted-foreground mt-1">
            Long answer questions require extended responses, typically paragraphs.
          </div>
        );
      case "image":
        return (
          <div className="text-sm text-muted-foreground mt-1">
            Student will upload an image as their answer. Consider specifying image requirements.
          </div>
        );
      case "coding":
        return (
          <div className="text-sm text-muted-foreground mt-1">
            Students will write and execute code. Configure the programming language and test cases.
          </div>
        );
      default:
        return null;
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen p-6">
      <ThreeDBackground />
      
      {/* Top Navigation */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex justify-between items-center mb-8 relative z-10"
      >
        <div className="flex items-center gap-3">
          <div className="h-12 w-12">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Pariksha Protector</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => navigate("/faculty-dashboard")} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          
          <Button variant="ghost" onClick={handleLogout} className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </motion.div>
      
      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative z-10"
      >
        {/* AI Test Generator Card */}
        <Card className="bg-gradient-to-br from-primary/10 to-accent/10 backdrop-blur-md border-primary/30 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI-Powered Test Generator
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ai-file-upload">Upload Document (PDF, DOC, DOCX, TXT)</Label>
                <div className="flex gap-2">
                  <Input
                    id="ai-file-upload"
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileUpload}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                  />
                </div>
                {uploadedFile && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {uploadedFile.name}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="num-questions">Number of Questions</Label>
                <Input
                  id="num-questions"
                  type="number"
                  min="5"
                  max="50"
                  value={numberOfQuestions}
                  onChange={(e) => setNumberOfQuestions(parseInt(e.target.value))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty Level</Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger id="difficulty">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button 
              onClick={handleGenerateTest}
              disabled={isGenerating || !uploadedFile || !subject}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Test...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Test with AI
                </>
              )}
            </Button>
            
            <p className="text-xs text-muted-foreground text-center">
              Upload a document and AI will automatically create exam questions. You can review and edit them afterwards.
            </p>
          </CardContent>
        </Card>
      
        <Card className="bg-card/90 backdrop-blur-md border-primary/20 mb-6">
          <CardHeader className="pb-2">
            <CardTitle>Test Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="test-title">Test Title</Label>
                <Input
                  id="test-title"
                  placeholder="Enter test title"
                  value={testTitle}
                  onChange={(e) => setTestTitle(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Select value={subject} onValueChange={setSubject}>
                  <SelectTrigger id="subject">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((sub) => (
                      <SelectItem key={sub} value={sub}>
                        {sub}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value) || 60)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Questions */}
        <div className="space-y-6">
          {questions.map((question, index) => (
            <Card key={index} className="bg-card/90 backdrop-blur-md border-primary/20">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle>Question {index + 1}</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleRemoveQuestion(index)}
                  className="h-8 w-8 p-0 text-destructive"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2 space-y-2">
                      <Label>Question Type</Label>
                      <Select 
                        value={question.type} 
                        onValueChange={(value) => handleQuestionTypeChange(
                          index, 
                          value as "mcq" | "essay" | "truefalse" | "short" | "long" | "image" | "coding"
                        )}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mcq" className="flex items-center">
                            <div className="flex items-center">
                              {renderQuestionTypeIcon("mcq")}
                              Multiple Choice
                            </div>
                          </SelectItem>
                          <SelectItem value="essay" className="flex items-center">
                            <div className="flex items-center">
                              {renderQuestionTypeIcon("essay")}
                              Essay
                            </div>
                          </SelectItem>
                          <SelectItem value="truefalse" className="flex items-center">
                            <div className="flex items-center">
                              {renderQuestionTypeIcon("truefalse")}
                              True/False
                            </div>
                          </SelectItem>
                          <SelectItem value="short" className="flex items-center">
                            <div className="flex items-center">
                              {renderQuestionTypeIcon("short")}
                              Short Answer
                            </div>
                          </SelectItem>
                          <SelectItem value="long" className="flex items-center">
                            <div className="flex items-center">
                              {renderQuestionTypeIcon("long")}
                              Long Answer
                            </div>
                          </SelectItem>
                          <SelectItem value="image" className="flex items-center">
                            <div className="flex items-center">
                              {renderQuestionTypeIcon("image")}
                              Image Upload
                            </div>
                          </SelectItem>
                          <SelectItem value="coding" className="flex items-center">
                            <div className="flex items-center">
                              {renderQuestionTypeIcon("coding")}
                              Coding Question
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {renderFormatGuidance(question.type)}
                    </div>
                    
                    <div className="md:col-span-1 space-y-2">
                      <Label htmlFor={`q${index}-marks`}>Marks</Label>
                      <Input
                        id={`q${index}-marks`}
                        type="number"
                        min="1"
                        value={question.marks}
                        onChange={(e) => handleQuestionChange(index, "marks", parseInt(e.target.value) || 1)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`q${index}-text`}>Question Text</Label>
                    <Textarea
                      id={`q${index}-text`}
                      rows={3}
                      placeholder="Enter your question here"
                      value={question.text}
                      onChange={(e) => handleQuestionChange(index, "text", e.target.value)}
                    />
                  </div>
                  
                  {question.type === "mcq" && (
                    <div className="space-y-4">
                      <Label>Options</Label>
                      
                      {question.options?.map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center gap-3">
                          <Button
                            variant={question.correctAnswer === option ? "default" : "outline"}
                            size="sm"
                            className="w-8 h-8 p-0 flex-shrink-0"
                            onClick={() => handleCorrectAnswerChange(index, option || "")}
                          >
                            {question.correctAnswer === option && <Check className="h-4 w-4" />}
                          </Button>
                          
                          <Input
                            placeholder={`Option ${optIndex + 1}`}
                            value={option}
                            onChange={(e) => handleOptionChange(index, optIndex, e.target.value)}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {question.type === "truefalse" && (
                    <div className="space-y-2">
                      <Label>Correct Answer</Label>
                      <div className="flex gap-3">
                        <Button
                          variant={question.correctAnswer === true ? "default" : "outline"}
                          onClick={() => handleCorrectAnswerChange(index, true)}
                          className="w-full"
                        >
                          True
                        </Button>
                        <Button
                          variant={question.correctAnswer === false ? "default" : "outline"}
                          onClick={() => handleCorrectAnswerChange(index, false)}
                          className="w-full"
                        >
                          False
                        </Button>
                      </div>
                    </div>
                  )}

                  {question.type === "short" && (
                    <div className="space-y-2">
                      <Label>Expected Answer Format</Label>
                      <Input
                        placeholder="e.g., A single word or short phrase"
                        value={question.answerHint || ""}
                        onChange={(e) => handleQuestionChange(index, "answerHint", e.target.value)}
                      />
                      <div className="p-3 bg-muted/50 rounded-md">
                        <div className="text-sm font-medium">Preview:</div>
                        <div className="mt-2 border rounded-md p-2 bg-background h-10">
                          <div className="text-sm text-muted-foreground italic">Short answer field</div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {question.type === "long" && (
                    <div className="space-y-2">
                      <Label>Expected Answer Format</Label>
                      <Input
                        placeholder="e.g., A detailed explanation with at least 300 words"
                        value={question.answerHint || ""}
                        onChange={(e) => handleQuestionChange(index, "answerHint", e.target.value)}
                      />
                      <div className="p-3 bg-muted/50 rounded-md">
                        <div className="text-sm font-medium">Preview:</div>
                        <div className="mt-2 border rounded-md p-2 bg-background h-32">
                          <div className="text-sm text-muted-foreground italic">Long answer field</div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {question.type === "image" && (
                    <div className="space-y-2">
                      <Label>Image Upload Instructions</Label>
                      <Textarea
                        rows={2}
                        placeholder="e.g., Upload a diagram showing the water cycle"
                        value={question.imagePrompt || ""}
                        onChange={(e) => handleQuestionChange(index, "imagePrompt", e.target.value)}
                      />
                      <div className="p-3 bg-muted/50 rounded-md">
                        <div className="text-sm font-medium">Preview:</div>
                        <div className="mt-2 border border-dashed rounded-md p-4 bg-background flex flex-col items-center justify-center">
                          <FileImage className="h-8 w-8 text-muted-foreground mb-2" />
                          <div className="text-sm text-center text-muted-foreground">
                            Click to upload an image or drag and drop
                          </div>
                          <div className="text-xs text-center text-muted-foreground mt-1">
                            (PNG or JPG up to 5MB)
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {question.type === "coding" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Programming Language</Label>
                          <Select 
                            value={question.codingLanguage || "python"} 
                            onValueChange={(value) => handleQuestionChange(index, "codingLanguage", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                            <SelectContent>
                              {CODING_LANGUAGES.map((lang) => (
                                <SelectItem key={lang.value} value={lang.value}>
                                  {lang.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Expected Output</Label>
                          <Input
                            placeholder="e.g., factorial(5) should return 120"
                            value={question.expectedOutput || ""}
                            onChange={(e) => handleQuestionChange(index, "expectedOutput", e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Starter Code</Label>
                        <Textarea
                          rows={6}
                          placeholder="Enter starter code template for students..."
                          value={question.starterCode || ""}
                          onChange={(e) => handleQuestionChange(index, "starterCode", e.target.value)}
                          className="font-mono text-sm"
                        />
                      </div>

                      {/* Test Cases */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label>Test Cases</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddTestCase(index)}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Test Case
                          </Button>
                        </div>

                        {question.testCases?.map((testCase, testCaseIndex) => (
                          <Card key={testCaseIndex} className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium">Test Case {testCaseIndex + 1}</h4>
                              {question.testCases && question.testCases.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveTestCase(index, testCaseIndex)}
                                  className="text-destructive"
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div className="space-y-1">
                                <Label className="text-xs">Input</Label>
                                <Input
                                  placeholder="Test input"
                                  value={testCase.input}
                                  onChange={(e) => handleTestCaseChange(index, testCaseIndex, "input", e.target.value)}
                                />
                              </div>
                              
                              <div className="space-y-1">
                                <Label className="text-xs">Expected Output</Label>
                                <Input
                                  placeholder="Expected result"
                                  value={testCase.expectedOutput}
                                  onChange={(e) => handleTestCaseChange(index, testCaseIndex, "expectedOutput", e.target.value)}
                                />
                              </div>
                              
                              <div className="space-y-1">
                                <Label className="text-xs">Description (Optional)</Label>
                                <Input
                                  placeholder="Test description"
                                  value={testCase.description || ""}
                                  onChange={(e) => handleTestCaseChange(index, testCaseIndex, "description", e.target.value)}
                                />
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>

                      {/* Preview */}
                      <div className="space-y-2">
                        <Label>Preview</Label>
                        <div className="border rounded-md p-3 bg-muted/30">
                          <CodingConsole
                            language={question.codingLanguage || "python"}
                            starterCode={question.starterCode || "# Write your code here\n"}
                            testCases={question.testCases}
                            expectedOutput={question.expectedOutput}
                            onCodeChange={() => {}}
                            readOnly={true}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          
          <Button 
            variant="outline" 
            onClick={handleAddQuestion}
            className="w-full flex items-center justify-center gap-2 border-dashed"
          >
            <Plus className="h-4 w-4" />
            Add Question
          </Button>
        </div>
        
        {/* Action Buttons */}
        <div className="mt-8 flex justify-end gap-4">
          <Button 
            variant="outline" 
            onClick={() => handleSaveTest("draft")}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Save as Draft
          </Button>
          
          <Button 
            onClick={() => handleSaveTest("published")}
            className="flex items-center gap-2"
          >
            <Check className="h-4 w-4" />
            Publish Test
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default CreateTest;
