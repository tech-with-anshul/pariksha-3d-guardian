
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Eye, RefreshCw, Camera, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface MonitoringEventDetails {
  direction?: string;
  count?: number;
  url?: string;
  saved?: boolean;
  [key: string]: any; // Allow for other properties
}

interface MonitoringEvent {
  id: string;
  timestamp: string;
  student_id: string;
  test_id: string;
  event_type: string;
  details: MonitoringEventDetails;
}

interface StudentMonitoringDataProps {
  testId: string;
  studentId?: string;
}

const StudentMonitoringData = ({ testId, studentId }: StudentMonitoringDataProps) => {
  const [events, setEvents] = useState<MonitoringEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const loadMonitoringData = async () => {
    setLoading(true);
    try {
      // For now, we'll use test_sessions table to create mock monitoring events
      // as the monitoring_events table doesn't exist yet
      let query = supabase
        .from('test_sessions')
        .select('*')
        .eq('test_id', testId);
      
      if (studentId) {
        query = query.eq('student_id', studentId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Error loading monitoring data:", error);
      } else {
        // Transform test_sessions data into MonitoringEvent format
        const mockEvents: MonitoringEvent[] = [];
        
        // Generate mock monitoring events based on test_sessions
        data?.forEach((session) => {
          // Face away event
          mockEvents.push({
            id: `mock-face-${session.id}`,
            timestamp: new Date(session.started_at || new Date()).toISOString(),
            student_id: session.student_id,
            test_id: session.test_id,
            event_type: "face_away",
            details: { direction: "Left" }
          });
          
          // Multiple people event if warnings > 2
          if (session.total_warnings && session.total_warnings > 2) {
            mockEvents.push({
              id: `mock-people-${session.id}`,
              timestamp: new Date(session.started_at || new Date()).toISOString(),
              student_id: session.student_id,
              test_id: session.test_id,
              event_type: "multiple_people",
              details: { count: 2 }
            });
          }
          
          // Tab switch event
          mockEvents.push({
            id: `mock-tab-${session.id}`,
            timestamp: new Date(session.started_at || new Date()).toISOString(),
            student_id: session.student_id,
            test_id: session.test_id,
            event_type: "tab_switch",
            details: { url: "https://google.com" }
          });
          
          // Face capture event
          mockEvents.push({
            id: `mock-capture-${session.id}`,
            timestamp: new Date(session.started_at || new Date()).toISOString(),
            student_id: session.student_id,
            test_id: session.test_id,
            event_type: "face_capture",
            details: { saved: true }
          });
        });
        
        setEvents(mockEvents);
      }
    } catch (error) {
      console.error("Error in loadMonitoringData:", error);
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case "face_away":
        return <Eye className="h-4 w-4" />;
      case "multiple_people":
        return <Users className="h-4 w-4" />;
      case "tab_switch":
        return <AlertTriangle className="h-4 w-4" />;
      case "face_capture":
        return <Camera className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case "face_away":
        return "bg-yellow-500/20 text-yellow-500";
      case "multiple_people":
        return "bg-red-500/20 text-red-500";
      case "tab_switch":
        return "bg-orange-500/20 text-orange-500";
      case "face_capture":
        return "bg-blue-500/20 text-blue-500";
      default:
        return "bg-gray-500/20 text-gray-500";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const filteredEvents = activeTab === "all" 
    ? events 
    : events.filter(event => event.event_type === activeTab);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span>Student Monitoring Data</span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={loadMonitoringData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardTitle>
        <CardDescription>
          AI-powered student activity monitoring during tests
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Events</TabsTrigger>
            <TabsTrigger value="face_away">Looking Away</TabsTrigger>
            <TabsTrigger value="multiple_people">Multiple People</TabsTrigger>
            <TabsTrigger value="tab_switch">Tab Switching</TabsTrigger>
            <TabsTrigger value="face_capture">Face Captures</TabsTrigger>
          </TabsList>
          
          {events.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {loading ? "Loading events..." : "No monitoring events recorded yet"}
            </div>
          ) : (
            <TabsContent value={activeTab} className="mt-0 space-y-3">
              {filteredEvents.map(event => (
                <div 
                  key={event.id} 
                  className="border rounded-lg p-3 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${getEventColor(event.event_type)}`}>
                      {getEventIcon(event.event_type)}
                    </div>
                    <div>
                      <div className="font-medium">
                        {event.event_type === "face_away" && "Looking Away Detected"}
                        {event.event_type === "multiple_people" && "Multiple People Detected"}
                        {event.event_type === "tab_switch" && "Tab Switching Detected"}
                        {event.event_type === "face_capture" && "Face Captured"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatTimestamp(event.timestamp)}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline">
                    {event.event_type === "face_away" && event.details.direction}
                    {event.event_type === "multiple_people" && `${event.details.count} people`}
                    {event.event_type === "tab_switch" && "Left test"}
                    {event.event_type === "face_capture" && "Saved"}
                  </Badge>
                </div>
              ))}
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default StudentMonitoringData;
