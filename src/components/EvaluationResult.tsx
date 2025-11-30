
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDistanceToNow } from "date-fns";

interface EvaluationResultProps {
  score: number;
  maxMarks: number;
  feedback?: string;
  evaluatedAt?: string;
}

export function EvaluationResult({
  score,
  maxMarks,
  feedback,
  evaluatedAt,
}: EvaluationResultProps) {
  // Calculate percentage and determine color
  const percentage = (score / maxMarks) * 100;
  const getColorClass = () => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-blue-600";
    if (percentage >= 40) return "text-amber-600";
    return "text-red-600";
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    
    try {
      const date = new Date(dateString);
      return {
        formatted: date.toLocaleDateString() + " at " + date.toLocaleTimeString(),
        relative: formatDistanceToNow(date, { addSuffix: true })
      };
    } catch (error) {
      return { formatted: dateString, relative: "" };
    }
  };

  const dateInfo = formatDate(evaluatedAt);

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Evaluation Result</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Score</p>
            <p className={`text-2xl font-bold ${getColorClass()}`}>
              {score} / {maxMarks} 
              <span className="text-sm ml-2">({percentage.toFixed(1)}%)</span>
            </p>
          </div>
          {evaluatedAt && dateInfo && (
            <div className="text-sm text-muted-foreground">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-help">Evaluated {dateInfo.relative}</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{dateInfo.formatted}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>

        {feedback && (
          <div className="space-y-2 pt-2 border-t">
            <p className="font-medium">Feedback:</p>
            <p className="p-3 bg-muted rounded-md whitespace-pre-wrap">{feedback}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
