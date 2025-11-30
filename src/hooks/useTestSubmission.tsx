import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface SubmitAnswerData {
  sessionId: string;
  questionId: string;
  answer: string;
}

export const useTestSubmission = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create or get a test session
  const getOrCreateSession = useCallback(
    async (testId: string, studentId: string) => {
      try {
        // Check for existing session
        const { data: existingSession, error: fetchError } = await supabase
          .from('test_sessions')
          .select('*')
          .eq('test_id', testId)
          .eq('student_id', studentId)
          .single();

        if (existingSession) {
          return existingSession;
        }

        // Create new session
        const { data: newSession, error: createError } = await supabase
          .from('test_sessions')
          .insert({
            test_id: testId,
            student_id: studentId,
            status: 'active',
            started_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating session:', createError);
          throw createError;
        }

        return newSession;
      } catch (error) {
        console.error('Error in getOrCreateSession:', error);
        throw error;
      }
    },
    []
  );

  // Submit or update an answer
  const submitAnswer = useCallback(
    async ({ sessionId, questionId, answer }: SubmitAnswerData) => {
      try {
        // Check for existing answer
        const { data: existingAnswer } = await supabase
          .from('answers')
          .select('id')
          .eq('session_id', sessionId)
          .eq('question_id', questionId)
          .single();

        if (existingAnswer) {
          // Update existing answer
          const { error } = await supabase
            .from('answers')
            .update({
              student_answer: answer,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existingAnswer.id);

          if (error) throw error;
        } else {
          // Insert new answer
          const { error } = await supabase
            .from('answers')
            .insert({
              session_id: sessionId,
              question_id: questionId,
              student_answer: answer,
            });

          if (error) throw error;
        }

        return true;
      } catch (error) {
        console.error('Error submitting answer:', error);
        return false;
      }
    },
    []
  );

  // Submit all answers and complete the test
  const submitTest = useCallback(
    async (
      sessionId: string,
      answers: Record<string, string>,
      forced = false
    ) => {
      setIsSubmitting(true);

      try {
        // Submit all answers
        const answerPromises = Object.entries(answers).map(([questionId, answer]) =>
          submitAnswer({
            sessionId,
            questionId,
            answer: String(answer),
          })
        );

        await Promise.all(answerPromises);

        // Update session status
        const { error: sessionError } = await supabase
          .from('test_sessions')
          .update({
            status: forced ? 'terminated' : 'completed',
            submitted_at: new Date().toISOString(),
          })
          .eq('id', sessionId);

        if (sessionError) {
          console.error('Error updating session:', sessionError);
          throw sessionError;
        }

        toast({
          title: forced ? 'Test Terminated' : 'Test Submitted',
          description: forced
            ? 'Your test was terminated due to violations'
            : 'Your answers have been submitted successfully',
          variant: forced ? 'destructive' : 'default',
        });

        return true;
      } catch (error) {
        console.error('Error submitting test:', error);
        toast({
          title: 'Submission Error',
          description: 'Failed to submit your test. Please try again.',
          variant: 'destructive',
        });
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [submitAnswer, toast]
  );

  // Update session warnings
  const updateSessionWarnings = useCallback(
    async (sessionId: string, warningData: {
      total_warnings?: number;
      tab_switch_count?: number;
      fullscreen_exit_count?: number;
    }) => {
      try {
        const { error } = await supabase
          .from('test_sessions')
          .update(warningData)
          .eq('id', sessionId);

        if (error) throw error;
        return true;
      } catch (error) {
        console.error('Error updating warnings:', error);
        return false;
      }
    },
    []
  );

  // Log monitoring event
  const logMonitoringEvent = useCallback(
    async (sessionId: string, eventType: string, eventData?: any) => {
      try {
        const { error } = await supabase
          .from('monitoring_logs')
          .insert({
            session_id: sessionId,
            event_type: eventType,
            event_data: eventData,
          });

        if (error) throw error;
        return true;
      } catch (error) {
        console.error('Error logging event:', error);
        return false;
      }
    },
    []
  );

  return {
    isSubmitting,
    getOrCreateSession,
    submitAnswer,
    submitTest,
    updateSessionWarnings,
    logMonitoringEvent,
  };
};
