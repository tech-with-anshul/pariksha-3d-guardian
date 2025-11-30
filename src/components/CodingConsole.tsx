
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Play, CheckCircle, XCircle, Clock } from "lucide-react";

interface TestCase {
  input: string;
  expectedOutput: string;
  description?: string;
}

interface CodingConsoleProps {
  language: string;
  starterCode: string;
  testCases?: TestCase[];
  expectedOutput?: string;
  onCodeChange: (code: string) => void;
  readOnly?: boolean;
}

const SUPPORTED_LANGUAGES = [
  { value: "javascript", label: "JavaScript", extension: ".js" },
  { value: "python", label: "Python", extension: ".py" },
  { value: "java", label: "Java", extension: ".java" },
  { value: "cpp", label: "C++", extension: ".cpp" },
  { value: "c", label: "C", extension: ".c" },
];

const CodingConsole = ({ 
  language, 
  starterCode, 
  testCases, 
  expectedOutput, 
  onCodeChange,
  readOnly = false 
}: CodingConsoleProps) => {
  const [code, setCode] = useState(starterCode);
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<Array<{
    passed: boolean;
    input: string;
    expected: string;
    actual: string;
    description?: string;
  }>>([]);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    onCodeChange(newCode);
  };

  const mockRunCode = async () => {
    setIsRunning(true);
    setOutput("Running code...");
    
    // Simulate code execution
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock output based on language
    let mockOutput = "";
    if (language === "python") {
      mockOutput = "Code executed successfully!\nOutput: Hello, World!";
    } else if (language === "javascript") {
      mockOutput = "Code executed successfully!\nOutput: Hello, World!";
    } else {
      mockOutput = "Code compiled and executed successfully!\nOutput: Hello, World!";
    }
    
    setOutput(mockOutput);
    
    // Mock test case results if provided
    if (testCases && testCases.length > 0) {
      const mockResults = testCases.map((testCase, index) => ({
        passed: index < Math.ceil(testCases.length * 0.8), // 80% pass rate for demo
        input: testCase.input,
        expected: testCase.expectedOutput,
        actual: index < Math.ceil(testCases.length * 0.8) ? testCase.expectedOutput : "Different output",
        description: testCase.description,
      }));
      setTestResults(mockResults);
    }
    
    setIsRunning(false);
  };

  const selectedLanguage = SUPPORTED_LANGUAGES.find(lang => lang.value === language);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Code Editor</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {selectedLanguage?.label || language}
              </Badge>
              <Button 
                onClick={mockRunCode} 
                disabled={isRunning || readOnly}
                size="sm"
                className="flex items-center gap-2"
              >
                {isRunning ? (
                  <>
                    <Clock className="h-4 w-4 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Run Code
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Textarea
            value={code}
            onChange={(e) => handleCodeChange(e.target.value)}
            placeholder={`Write your ${selectedLanguage?.label || language} code here...`}
            className="font-mono text-sm min-h-[300px] resize-none"
            readOnly={readOnly}
          />
        </CardContent>
      </Card>

      {/* Output Section */}
      {output && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Output</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-3 rounded-md text-sm font-mono whitespace-pre-wrap">
              {output}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Test Cases Results */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div 
                  key={index}
                  className={`p-3 rounded-md border ${
                    result.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {result.passed ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span className="font-medium">
                      Test Case {index + 1}
                      {result.description && `: ${result.description}`}
                    </span>
                  </div>
                  <div className="text-sm space-y-1">
                    <div><strong>Input:</strong> {result.input}</div>
                    <div><strong>Expected:</strong> {result.expected}</div>
                    <div><strong>Actual:</strong> {result.actual}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expected Output */}
      {expectedOutput && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Expected Output</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-3 rounded-md text-sm font-mono whitespace-pre-wrap">
              {expectedOutput}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CodingConsole;
