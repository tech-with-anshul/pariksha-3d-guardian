
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Lock } from "lucide-react";

interface TestIDVerificationProps {
  expectedTestId: string;
  onSuccess: () => void;
  testTitle: string;
}

export function TestIDVerification({ expectedTestId, onSuccess, testTitle }: TestIDVerificationProps) {
  const [testId, setTestId] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const { toast } = useToast();

  const handleVerify = () => {
    setIsVerifying(true);
    
    // Simple timeout to simulate verification process
    setTimeout(() => {
      if (testId.trim() === expectedTestId) {
        toast({
          title: "Success",
          description: "Test ID verified successfully.",
        });
        onSuccess();
      } else {
        toast({
          title: "Invalid Test ID",
          description: "The Test ID you entered is incorrect. Please try again.",
          variant: "destructive",
        });
      }
      setIsVerifying(false);
    }, 500);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Test Verification</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-primary/10 p-3">
            <Lock className="h-6 w-6 text-primary" />
          </div>
        </div>
        
        <p className="text-center mb-6">
          Please enter the Test ID provided by your instructor to access:
          <span className="block font-medium mt-2">{testTitle}</span>
        </p>
        
        <div className="space-y-4">
          <div>
            <Input
              value={testId}
              onChange={(e) => setTestId(e.target.value)}
              placeholder="Enter Test ID (e.g., TST-AB12CD34)"
              className="text-center text-lg"
            />
          </div>
          
          <Button 
            onClick={handleVerify} 
            className="w-full" 
            disabled={!testId.trim() || isVerifying}
          >
            {isVerifying ? "Verifying..." : "Verify & Start Test"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
