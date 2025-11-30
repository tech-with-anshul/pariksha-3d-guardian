
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { LiveEvaluationDashboard } from "@/components/LiveEvaluationDashboard";
import { Loader } from "lucide-react";

const EvaluateTest = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [test, setTest] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || (user.role !== "faculty" && user.role !== "admin")) {
      navigate("/login");
      return;
    }

    const loadTestData = async () => {
      setIsLoading(true);
      try {
        // Fetch test details with questions
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

        // Sort questions by order
        if (testData.questions) {
          testData.questions.sort((a: any, b: any) => a.order_number - b.order_number);
        }

        setTest(testData);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="bg-card/90 backdrop-blur-sm">
          <CardContent className="p-6 flex flex-col items-center gap-4">
            <Loader className="h-8 w-8 animate-spin text-primary" />
            <div>
              <CardTitle className="text-lg font-bold text-center">Loading...</CardTitle>
              <p className="text-muted-foreground">Fetching test data...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="bg-card/90 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <CardTitle className="text-lg font-bold mb-4">Test Not Found</CardTitle>
            <p className="text-muted-foreground mb-4">The test data could not be loaded.</p>
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
      <LiveEvaluationDashboard
        testId={test.id}
        testTitle={test.title}
        questions={test.questions || []}
        onBack={() => navigate("/faculty-dashboard")}
      />
    </div>
  );
};

export default EvaluateTest;
