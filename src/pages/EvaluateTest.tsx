
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { EvaluateAnswer } from "@/components/EvaluateAnswer";
import { EvaluationResult } from "@/components/EvaluationResult";

const EvaluateTest = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [test, setTest] = useState<any | null>(null);
  const [student, setStudent] = useState<any | null>(null);
  const [studentAnswers, setStudentAnswers] = useState<any[]>([]);
  const [evaluations, setEvaluations] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== "faculty") {
      navigate("/login");
      return;
    }

    const loadTestData = async () => {
      setIsLoading(true);
      try {
        // Fetch test details
        const { data: testData, error: testError } = await supabase
          .from("tests")
          .select(`
            *,
            questions(*)
          `)
          .eq("id", id)
          .single();

        if (testError) {
          console.error("Error fetching test:", testError);
          toast({
            title: "Error loading test",
            description: "Failed to load test details.",
            variant: "destructive",
          });
          navigate("/faculty-dashboard");
          return;
        }

        if (!testData) {
          toast({
            title: "Test not found",
            description: "The specified test does not exist.",
            variant: "destructive",
          });
          navigate("/faculty-dashboard");
          return;
        }

        setTest(testData);

        // Fetch student details
        const { data: studentData, error: studentError } = await supabase
          .from("test_sessions")
          .select("student_id")
          .eq("test_id", id)
          .limit(1)
          .single();

        if (studentError) {
          console.error("Error fetching student:", studentError);
          toast({
            title: "Error loading student",
            description: "Failed to load student details.",
            variant: "destructive",
          });
          navigate("/faculty-dashboard");
          return;
        }

        const { data: studentProfile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", studentData.student_id)
          .single();

        if (profileError) {
          console.error("Error fetching student profile:", profileError);
          toast({
            title: "Error loading student profile",
            description: "Failed to load student profile.",
            variant: "destructive",
          });
          navigate("/faculty-dashboard");
          return;
        }

        setStudent(studentProfile);

        // Fetch student answers via test_sessions
        const { data: sessionData, error: sessionError } = await supabase
          .from("test_sessions")
          .select("id")
          .eq("test_id", id)
          .eq("student_id", studentData.student_id)
          .single();

        if (sessionError || !sessionData) {
          console.error("Error fetching test session:", sessionError);
          setStudentAnswers([]);
          setIsLoading(false);
          return;
        }

        const { data: answerData, error: answerError } = await supabase
          .from("answers")
          .select("*")
          .eq("session_id", sessionData.id);

        if (answerError) {
          console.error("Error fetching student answers:", answerError);
          toast({
            title: "Error loading answers",
            description: "Failed to load student answers.",
            variant: "destructive",
          });
          navigate("/faculty-dashboard");
          return;
        }

        setStudentAnswers(answerData || []);

        // Map evaluations by answer id (evaluations are stored in the answers table)
        const evaluationMap: Record<string, any> = {};
        if (answerData && answerData.length > 0) {
          answerData.forEach((answer) => {
            if (answer.graded_by) {
              evaluationMap[answer.id] = {
                score: answer.marks_awarded,
                evaluated_at: answer.graded_at,
                graded_by: answer.graded_by,
              };
            }
          });
        }
        setEvaluations(evaluationMap);
      } catch (error) {
        console.error("Unexpected error:", error);
        toast({
          title: "Unexpected error",
          description: "An unexpected error occurred.",
          variant: "destructive",
        });
        navigate("/faculty-dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    loadTestData();
  }, [id, user, navigate, toast]);

  const handleAnswerEvaluated = async (answerId: string) => {
    // Refresh answer after evaluation
    try {
      const { data: answerData, error: answerError } = await supabase
        .from("answers")
        .select("*")
        .eq("id", answerId)
        .single();

      if (answerError) {
        console.error("Error fetching answer:", answerError);
        toast({
          title: "Error refreshing evaluation",
          description: "Failed to refresh the evaluation.",
          variant: "destructive",
        });
        return;
      }

      if (answerData && answerData.graded_by) {
        setEvaluations((prevEvaluations) => ({
          ...prevEvaluations,
          [answerId]: {
            score: answerData.marks_awarded,
            evaluated_at: answerData.graded_at,
            graded_by: answerData.graded_by,
          },
        }));
      }
    } catch (error) {
      console.error("Error refreshing evaluation:", error);
      toast({
        title: "Error refreshing evaluation",
        description: "Failed to refresh the evaluation.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card>
          <CardContent className="p-6">
            <CardTitle className="text-lg font-bold">Loading...</CardTitle>
            <p>Fetching test and student data...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!test || !student) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card>
          <CardContent className="p-6">
            <CardTitle className="text-lg font-bold">Not Found</CardTitle>
            <p>Test or student data not available.</p>
            <Button onClick={() => navigate("/faculty-dashboard")}>
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Evaluate Test: {test.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <p className="text-lg">
              Student: {student.name}
            </p>
            <p className="text-muted-foreground">Email: {student.email}</p>
          </div>
          {test.unique_id && (
            <p className="text-sm bg-primary/10 text-primary inline-block px-2 py-1 rounded">
              Test ID: {test.unique_id}
            </p>
          )}
        </CardContent>
      </Card>

      {studentAnswers.length > 0 ? (
        studentAnswers.map((answer) => {
          const question = test.questions.find((q: any) => q.id === answer.question_id);
          const evaluation = evaluations[answer.id];

          return (
            <div key={answer.id} className="mb-8">
              {evaluation ? (
                <EvaluationResult
                  score={evaluation.score}
                  maxMarks={question?.marks || 0}
                  feedback={null}
                  evaluatedAt={evaluation.evaluated_at}
                />
              ) : (
                question && (
                  <EvaluateAnswer
                    key={answer.id}
                    studentAnswerId={answer.id}
                    questionText={question.question_text}
                    answerText={answer.student_answer}
                    answerImageUrl={null}
                    maxMarks={question.marks}
                    testId={test.id}
                    onEvaluated={() => handleAnswerEvaluated(answer.id)}
                  />
                )
              )}
            </div>
          );
        })
      ) : (
        <Card className="mb-6">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No answers submitted yet.</p>
          </CardContent>
        </Card>
      )}

      <Button onClick={() => navigate("/faculty-dashboard")}>
        Return to Dashboard
      </Button>
    </div>
  );
};

export default EvaluateTest;
