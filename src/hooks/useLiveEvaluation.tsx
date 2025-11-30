import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface LiveSession {
  id: string;
  student_id: string;
  test_id: string;
  status: string;
  started_at: string | null;
  submitted_at: string | null;
  total_warnings: number;
  tab_switch_count: number;
  fullscreen_exit_count: number;
  student?: {
    full_name: string;
    email: string;
  };
}

interface LiveAnswer {
  id: string;
  session_id: string;
  question_id: string;
  student_answer: string | null;
  marks_awarded: number | null;
  is_correct: boolean | null;
  graded_by: string | null;
  graded_at: string | null;
}

export const useLiveEvaluation = (testId: string) => {
  const { toast } = useToast();
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [answers, setAnswers] = useState<LiveAnswer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial data
  const fetchData = useCallback(async () => {
    if (!testId) return;

    try {
      setIsLoading(true);

      // Fetch sessions with student info
      const { data: sessionData, error: sessionError } = await supabase
        .from('test_sessions')
        .select(`
          *,
          profiles:student_id (
            full_name,
            email
          )
        `)
        .eq('test_id', testId);

      if (sessionError) {
        console.error('Error fetching sessions:', sessionError);
        throw sessionError;
      }

      // Map the nested profile data
      const mappedSessions = (sessionData || []).map(session => ({
        ...session,
        student: session.profiles
      }));

      setSessions(mappedSessions);

      // Fetch answers for all sessions
      if (sessionData && sessionData.length > 0) {
        const sessionIds = sessionData.map(s => s.id);
        const { data: answerData, error: answerError } = await supabase
          .from('answers')
          .select('*')
          .in('session_id', sessionIds);

        if (answerError) {
          console.error('Error fetching answers:', answerError);
          throw answerError;
        }

        setAnswers(answerData || []);
      }
    } catch (error) {
      console.error('Error in fetchData:', error);
      toast({
        title: 'Error',
        description: 'Failed to load evaluation data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [testId, toast]);

  // Set up realtime subscriptions
  useEffect(() => {
    if (!testId) return;

    fetchData();

    // Subscribe to session changes
    const sessionChannel = supabase
      .channel(`sessions-${testId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'test_sessions',
          filter: `test_id=eq.${testId}`,
        },
        async (payload) => {
          console.log('Session change:', payload);
          
          if (payload.eventType === 'INSERT') {
            // Fetch the new session with student info
            const { data } = await supabase
              .from('test_sessions')
              .select(`
                *,
                profiles:student_id (
                  full_name,
                  email
                )
              `)
              .eq('id', payload.new.id)
              .single();

            if (data) {
              setSessions(prev => [...prev, { ...data, student: data.profiles }]);
              toast({
                title: 'New Submission',
                description: `A student has started the test`,
              });
            }
          } else if (payload.eventType === 'UPDATE') {
            setSessions(prev =>
              prev.map(s =>
                s.id === payload.new.id
                  ? { ...s, ...payload.new }
                  : s
              )
            );

            // Notify on status changes
            if (payload.new.status === 'completed' || payload.new.status === 'submitted') {
              toast({
                title: 'Test Submitted',
                description: 'A student has submitted their test',
              });
            }
          } else if (payload.eventType === 'DELETE') {
            setSessions(prev => prev.filter(s => s.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    // Subscribe to answer changes
    const answerChannel = supabase
      .channel(`answers-${testId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'answers',
        },
        (payload) => {
          console.log('Answer change:', payload);
          
          if (payload.eventType === 'INSERT') {
            setAnswers(prev => [...prev, payload.new as LiveAnswer]);
          } else if (payload.eventType === 'UPDATE') {
            setAnswers(prev =>
              prev.map(a =>
                a.id === payload.new.id
                  ? { ...a, ...payload.new }
                  : a
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setAnswers(prev => prev.filter(a => a.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(sessionChannel);
      supabase.removeChannel(answerChannel);
    };
  }, [testId, fetchData, toast]);

  // Get answers for a specific session
  const getSessionAnswers = useCallback(
    (sessionId: string) => {
      return answers.filter(a => a.session_id === sessionId);
    },
    [answers]
  );

  // Get live stats
  const getLiveStats = useCallback(() => {
    const activeSessions = sessions.filter(s => s.status === 'active' || s.status === 'in_progress');
    const submittedSessions = sessions.filter(s => s.status === 'completed' || s.status === 'submitted');
    const terminatedSessions = sessions.filter(s => s.status === 'terminated');
    
    const totalAnswers = answers.length;
    const gradedAnswers = answers.filter(a => a.graded_by !== null).length;

    return {
      totalSessions: sessions.length,
      activeSessions: activeSessions.length,
      submittedSessions: submittedSessions.length,
      terminatedSessions: terminatedSessions.length,
      totalAnswers,
      gradedAnswers,
      pendingGrading: totalAnswers - gradedAnswers,
    };
  }, [sessions, answers]);

  // Grade an answer
  const gradeAnswer = useCallback(
    async (answerId: string, marks: number, graderId: string) => {
      try {
        const { error } = await supabase
          .from('answers')
          .update({
            marks_awarded: marks,
            is_correct: marks > 0,
            graded_by: graderId,
            graded_at: new Date().toISOString(),
          })
          .eq('id', answerId);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Answer graded successfully',
        });

        return true;
      } catch (error) {
        console.error('Error grading answer:', error);
        toast({
          title: 'Error',
          description: 'Failed to grade answer',
          variant: 'destructive',
        });
        return false;
      }
    },
    [toast]
  );

  return {
    sessions,
    answers,
    isLoading,
    getSessionAnswers,
    getLiveStats,
    gradeAnswer,
    refetch: fetchData,
  };
};
