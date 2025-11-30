import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

// UI-compatible Question interface (supports all UI question types)
export interface Question {
  id: string;
  type: "mcq" | "essay" | "truefalse" | "short" | "long" | "image" | "coding";
  text: string;
  options?: string[];
  correctAnswer?: string | boolean;
  marks: number;
  answerHint?: string;
  imagePrompt?: string;
  codingLanguage?: string;
  starterCode?: string;
  expectedOutput?: string;
  testCases?: Array<{
    input: string;
    expectedOutput: string;
    description?: string;
  }>;
}

export interface Test {
  id: string;
  title: string;
  subject: string;
  duration: number;
  questions: Question[];
  createdBy: string;
  createdAt: Date;
  status: "draft" | "published";
  unique_id?: string;
  description?: string;
  totalMarks?: number;
  passingMarks?: number;
  enableMonitoring?: boolean;
  testType?: "mcq" | "descriptive" | "mixed";
}

interface TestContextType {
  tests: Test[];
  isLoading: boolean;
  createTest: (test: Omit<Test, "id" | "createdAt">) => Promise<void>;
  getTestById: (id: string) => Test | undefined;
  updateTest: (id: string, test: Partial<Test>) => Promise<void>;
  deleteTest: (id: string) => Promise<void>;
  generateUniqueTestId: () => string;
  refreshTests: () => Promise<void>;
}

const TestContext = createContext<TestContextType | undefined>(undefined);

// Map database question type to UI type
const mapDbTypeToUiType = (dbType: string): Question["type"] => {
  const typeMap: Record<string, Question["type"]> = {
    "mcq": "mcq",
    "truefalse": "truefalse",
    "short": "short",
    "descriptive": "long",
    "image": "image"
  };
  return typeMap[dbType] || "mcq";
};

// Map UI type to database type
const mapUiTypeToDbType = (uiType: string): "mcq" | "truefalse" | "short" | "descriptive" | "image" => {
  if (uiType === "mcq") return "mcq";
  if (uiType === "truefalse") return "truefalse";
  if (uiType === "short" || uiType === "coding") return "short";
  if (uiType === "essay" || uiType === "long" || uiType === "descriptive") return "descriptive";
  if (uiType === "image") return "image";
  return "mcq";
};

export function TestProvider({ children }: { children: ReactNode }) {
  const [tests, setTests] = useState<Test[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchTests = async () => {
    setIsLoading(true);
    try {
      const { data: testsData, error: testsError } = await supabase
        .from("tests")
        .select(`*, questions(*)`)
        .order("created_at", { ascending: false });

      if (testsError) {
        console.error("Error fetching tests:", testsError);
        toast({
          title: "Error",
          description: "Failed to fetch tests from database.",
          variant: "destructive",
        });
        return;
      }

      const mappedTests: Test[] = (testsData || []).map((test: any) => ({
        id: test.id,
        title: test.title,
        subject: test.subject,
        duration: test.duration_minutes,
        createdBy: test.created_by,
        createdAt: new Date(test.created_at),
        status: "published" as const,
        unique_id: test.test_id,
        description: test.description,
        totalMarks: test.total_marks,
        passingMarks: test.passing_marks,
        enableMonitoring: test.enable_monitoring,
        testType: test.test_type,
        questions: (test.questions || [])
          .sort((a: any, b: any) => a.order_number - b.order_number)
          .map((q: any) => ({
            id: q.id,
            type: mapDbTypeToUiType(q.question_type),
            text: q.question_text,
            options: q.options || [],
            correctAnswer: q.correct_answer,
            marks: q.marks,
          })),
      }));

      setTests(mappedTests);
    } catch (error) {
      console.error("Unexpected error fetching tests:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while fetching tests.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  const generateUniqueTestId = () => {
    const randomPart = Math.random().toString(36).substring(2, 10).toUpperCase();
    return `TST-${randomPart}`;
  };

  const createTest = async (test: Omit<Test, "id" | "createdAt">) => {
    setIsLoading(true);

    try {
      const testId = test.unique_id || generateUniqueTestId();
      const totalMarks = test.questions.reduce((sum, q) => sum + q.marks, 0);

      const { data: newTest, error: testError } = await supabase
        .from("tests")
        .insert({
          title: test.title,
          subject: test.subject,
          duration_minutes: test.duration,
          created_by: test.createdBy,
          test_id: testId,
          description: test.description || null,
          total_marks: totalMarks,
          passing_marks: test.passingMarks || Math.floor(totalMarks * 0.4),
          enable_monitoring: test.enableMonitoring ?? true,
          test_type: test.testType || "mixed",
        })
        .select()
        .single();

      if (testError) {
        console.error("Error creating test:", testError);
        toast({
          title: "Error",
          description: "Failed to create test: " + testError.message,
          variant: "destructive",
        });
        return;
      }

      if (test.questions.length > 0) {
        const questionsToInsert = test.questions.map((q, index) => ({
          test_id: newTest.id,
          question_text: q.text,
          question_type: mapUiTypeToDbType(q.type),
          options: q.options || null,
          correct_answer: typeof q.correctAnswer === 'boolean' 
            ? String(q.correctAnswer) 
            : (q.correctAnswer || null),
          marks: q.marks,
          order_number: index + 1,
        }));

        const { error: questionsError } = await supabase
          .from("questions")
          .insert(questionsToInsert);

        if (questionsError) {
          console.error("Error creating questions:", questionsError);
          toast({
            title: "Warning",
            description: "Test created but some questions failed to save.",
            variant: "destructive",
          });
        }
      }

      toast({
        title: "Success",
        description: "Test created successfully!",
      });

      await fetchTests();
    } catch (error) {
      console.error("Error in createTest:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateTest = async (id: string, updatedFields: Partial<Test>) => {
    setIsLoading(true);

    try {
      const updateData: any = {};
      
      if (updatedFields.title) updateData.title = updatedFields.title;
      if (updatedFields.subject) updateData.subject = updatedFields.subject;
      if (updatedFields.duration) updateData.duration_minutes = updatedFields.duration;
      if (updatedFields.description !== undefined) updateData.description = updatedFields.description;
      if (updatedFields.enableMonitoring !== undefined) updateData.enable_monitoring = updatedFields.enableMonitoring;
      if (updatedFields.testType) updateData.test_type = updatedFields.testType;

      if (Object.keys(updateData).length > 0) {
        const { error: updateError } = await supabase
          .from("tests")
          .update(updateData)
          .eq("id", id);

        if (updateError) {
          console.error("Error updating test:", updateError);
          toast({
            title: "Error",
            description: "Failed to update test.",
            variant: "destructive",
          });
          return;
        }
      }

      if (updatedFields.questions) {
        await supabase.from("questions").delete().eq("test_id", id);

        const questionsToInsert = updatedFields.questions.map((q, index) => ({
          test_id: id,
          question_text: q.text,
          question_type: mapUiTypeToDbType(q.type),
          options: q.options || null,
          correct_answer: typeof q.correctAnswer === 'boolean' 
            ? String(q.correctAnswer) 
            : (q.correctAnswer || null),
          marks: q.marks,
          order_number: index + 1,
        }));

        const { error: questionsError } = await supabase
          .from("questions")
          .insert(questionsToInsert);

        if (questionsError) {
          console.error("Error updating questions:", questionsError);
        }

        const totalMarks = updatedFields.questions.reduce((sum, q) => sum + q.marks, 0);
        await supabase.from("tests").update({ total_marks: totalMarks }).eq("id", id);
      }

      toast({
        title: "Success",
        description: "Test updated successfully!",
      });

      await fetchTests();
    } catch (error) {
      console.error("Error in updateTest:", error);
      toast({
        title: "Error",
        description: "Failed to update test.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTest = async (id: string) => {
    setIsLoading(true);

    try {
      const { error } = await supabase.from("tests").delete().eq("id", id);

      if (error) {
        console.error("Error deleting test:", error);
        toast({
          title: "Error",
          description: "Failed to delete test.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Test deleted successfully!",
      });

      await fetchTests();
    } catch (error) {
      console.error("Error in deleteTest:", error);
      toast({
        title: "Error",
        description: "Failed to delete test.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTestById = (id: string) => {
    return tests.find((test) => test.id === id || test.unique_id === id);
  };

  const refreshTests = async () => {
    await fetchTests();
  };

  const value: TestContextType = {
    tests,
    isLoading,
    createTest,
    updateTest,
    deleteTest,
    getTestById,
    generateUniqueTestId,
    refreshTests,
  };

  return <TestContext.Provider value={value}>{children}</TestContext.Provider>;
}

export function useTest() {
  const context = useContext(TestContext);
  if (context === undefined) {
    throw new Error("useTest must be used within a TestProvider");
  }
  return context;
}
