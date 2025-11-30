import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export interface TestSession {
  id: string;
  test_id: string;
  student_id: string;
  status: string;
  started_at: string | null;
  submitted_at: string | null;
  total_warnings: number;
  tab_switch_count: number;
  fullscreen_exit_count: number;
  created_at: string;
  student_name?: string;
  student_email?: string;
}

export interface MonitoringLog {
  id: string;
  session_id: string;
  event_type: string;
  event_data: any;
  timestamp: string;
}

export function useRealtimeTestSessions(testId: string) {
  const [sessions, setSessions] = useState<TestSession[]>([]);
  const [monitoringLogs, setMonitoringLogs] = useState<MonitoringLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Fetch initial sessions
  useEffect(() => {
    const fetchSessions = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("test_sessions")
          .select(`
            *,
            profiles:student_id (full_name, email)
          `)
          .eq("test_id", testId)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching sessions:", error);
          return;
        }

        const mappedSessions: TestSession[] = (data || []).map((session: any) => ({
          id: session.id,
          test_id: session.test_id,
          student_id: session.student_id,
          status: session.status,
          started_at: session.started_at,
          submitted_at: session.submitted_at,
          total_warnings: session.total_warnings,
          tab_switch_count: session.tab_switch_count,
          fullscreen_exit_count: session.fullscreen_exit_count,
          created_at: session.created_at,
          student_name: session.profiles?.full_name || "Unknown Student",
          student_email: session.profiles?.email || "",
        }));

        setSessions(mappedSessions);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchMonitoringLogs = async () => {
      try {
        // Get all session IDs for this test first
        const { data: sessionData } = await supabase
          .from("test_sessions")
          .select("id")
          .eq("test_id", testId);

        if (!sessionData || sessionData.length === 0) return;

        const sessionIds = sessionData.map(s => s.id);

        const { data, error } = await supabase
          .from("monitoring_logs")
          .select("*")
          .in("session_id", sessionIds)
          .order("timestamp", { ascending: false })
          .limit(100);

        if (error) {
          console.error("Error fetching monitoring logs:", error);
          return;
        }

        setMonitoringLogs(data || []);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchSessions();
    fetchMonitoringLogs();
  }, [testId]);

  // Subscribe to realtime updates
  useEffect(() => {
    // Subscribe to test_sessions changes
    const sessionsChannel = supabase
      .channel(`test-sessions-${testId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "test_sessions",
          filter: `test_id=eq.${testId}`,
        },
        async (payload) => {
          console.log("Session change:", payload);

          if (payload.eventType === "INSERT") {
            // Fetch student info for new session
            const { data: profileData } = await supabase
              .from("profiles")
              .select("full_name, email")
              .eq("id", (payload.new as any).student_id)
              .single();

            const newSession: TestSession = {
              ...(payload.new as any),
              student_name: profileData?.full_name || "Unknown Student",
              student_email: profileData?.email || "",
            };

            setSessions((prev) => [newSession, ...prev]);
            
            toast({
              title: "New Student Joined",
              description: `${newSession.student_name} has joined the test`,
            });
          } else if (payload.eventType === "UPDATE") {
            setSessions((prev) =>
              prev.map((session) =>
                session.id === (payload.new as any).id
                  ? { ...session, ...(payload.new as any) }
                  : session
              )
            );

            // Check for warning increase
            const oldSession = sessions.find(s => s.id === (payload.new as any).id);
            if (oldSession && (payload.new as any).total_warnings > oldSession.total_warnings) {
              toast({
                title: "Warning Alert",
                description: `Student received a new warning`,
                variant: "destructive",
              });
            }
          } else if (payload.eventType === "DELETE") {
            setSessions((prev) =>
              prev.filter((session) => session.id !== (payload.old as any).id)
            );
          }
        }
      )
      .subscribe();

    // Subscribe to monitoring_logs changes
    const logsChannel = supabase
      .channel(`monitoring-logs-${testId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "monitoring_logs",
        },
        (payload) => {
          const newLog = payload.new as MonitoringLog;
          
          // Check if this log belongs to a session of this test
          const sessionBelongsToTest = sessions.some(s => s.id === newLog.session_id);
          if (sessionBelongsToTest) {
            setMonitoringLogs((prev) => [newLog, ...prev.slice(0, 99)]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(sessionsChannel);
      supabase.removeChannel(logsChannel);
    };
  }, [testId, sessions, toast]);

  // Update session status
  const updateSessionStatus = async (sessionId: string, status: string) => {
    const { error } = await supabase
      .from("test_sessions")
      .update({ status })
      .eq("id", sessionId);

    if (error) {
      console.error("Error updating session:", error);
      toast({
        title: "Error",
        description: "Failed to update session status",
        variant: "destructive",
      });
    }
  };

  // Terminate student
  const terminateStudent = async (sessionId: string) => {
    await updateSessionStatus(sessionId, "terminated");
    toast({
      title: "Student Terminated",
      description: "The student has been removed from the test",
      variant: "destructive",
    });
  };

  // Allow student to continue
  const allowContinue = async (sessionId: string) => {
    await updateSessionStatus(sessionId, "in_progress");
    toast({
      title: "Student Allowed",
      description: "The student can continue the test",
    });
  };

  return {
    sessions,
    monitoringLogs,
    isLoading,
    terminateStudent,
    allowContinue,
    updateSessionStatus,
  };
}
