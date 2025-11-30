
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Loader } from "lucide-react";

interface EvaluateAnswerProps {
  studentAnswerId: string;
  questionText: string;
  answerText?: string;
  answerImageUrl?: string;
  maxMarks: number;
  testId: string;
  onEvaluated: () => void;
}

export function EvaluateAnswer({
  studentAnswerId,
  questionText,
  answerText,
  answerImageUrl,
  maxMarks,
  testId,
  onEvaluated,
}: EvaluateAnswerProps) {
  const [score, setScore] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (isNaN(value)) {
      setScore(0);
      return;
    }
    
    // Ensure score is between 0 and maxMarks
    if (value > maxMarks) {
      setScore(maxMarks);
    } else if (value < 0) {
      setScore(0);
    } else {
      setScore(value);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      // Update answer with evaluation
      const { error } = await supabase
        .from("answers")
        .update({
          marks_awarded: score,
          is_correct: score > 0,
          graded_by: user.id,
          graded_at: new Date().toISOString(),
        })
        .eq("id", studentAnswerId);
      
      if (error) {
        console.error("Error submitting evaluation:", error);
        toast({
          title: "Error",
          description: "Failed to submit evaluation. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Success",
        description: "Evaluation submitted successfully.",
      });
      
      // Notify parent component
      onEvaluated();
    } catch (error) {
      console.error("Error submitting evaluation:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Evaluate Answer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h3 className="font-medium">Question:</h3>
          <p className="p-3 bg-muted rounded-md">{questionText}</p>
        </div>
        
        <div className="space-y-2">
          <h3 className="font-medium">Student's Answer:</h3>
          {answerText ? (
            <p className="p-3 bg-muted rounded-md whitespace-pre-wrap">{answerText}</p>
          ) : answerImageUrl ? (
            <div className="p-3 bg-muted rounded-md">
              <img 
                src={answerImageUrl} 
                alt="Student's answer" 
                className="max-w-full h-auto max-h-96 mx-auto"
              />
            </div>
          ) : (
            <p className="p-3 bg-muted rounded-md italic text-muted-foreground">No answer provided</p>
          )}
        </div>
        
        <div className="space-y-2 pt-4 border-t">
          <div className="flex items-center justify-between">
            <label htmlFor="score" className="font-medium">
              Score:
            </label>
            <span className="text-sm text-muted-foreground">
              Max: {maxMarks} points
            </span>
          </div>
          <Input
            id="score"
            type="number"
            min="0"
            max={maxMarks}
            value={score}
            onChange={handleScoreChange}
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="feedback" className="font-medium">
            Feedback (optional):
          </label>
          <Textarea
            id="feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Enter feedback for the student..."
            rows={4}
          />
        </div>
        
        <Button 
          onClick={handleSubmit} 
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Evaluation"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
