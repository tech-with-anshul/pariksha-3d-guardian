
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Users, Eye } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import StudentMonitoringData from "./StudentMonitoringData";

interface Session {
  id: string;
  student_id: string;
  erp_id: string;
  name: string;
  warnings: number;
  status: string;
  message: string;
  face_direction?: string;
  people_detected?: number;
  last_activity?: string;
}

interface StudentWarningsTableProps {
  sessions: Session[];
  onTerminate: (id: string) => void;
  onContinue: (id: string) => void;
  testId: string;
}

const StudentWarningsTable = ({ 
  sessions, 
  onTerminate, 
  onContinue,
  testId
}: StudentWarningsTableProps) => {
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  
  // Sort sessions by number of warnings (descending)
  const sortedSessions = [...sessions].sort((a, b) => b.warnings - a.warnings);

  const getWarningStyle = (warnings: number) => {
    if (warnings === 0) return "text-green-500";
    if (warnings < 3) return "text-yellow-500";
    if (warnings < 5) return "text-orange-500";
    return "text-red-500";
  };

  return (
    <div className="relative overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ERP ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Warnings</TableHead>
            <TableHead>AI Monitoring</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedSessions.length > 0 ? (
            sortedSessions.map((session) => (
              <TableRow key={session.id}>
                <TableCell className="font-medium">{session.erp_id}</TableCell>
                <TableCell>{session.name}</TableCell>
                <TableCell>
                  <span className={`font-medium ${getWarningStyle(session.warnings)}`}>
                    {session.warnings}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {session.face_direction && session.face_direction !== "Forward" && (
                      <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-500 text-xs">
                        <Eye className="h-3 w-3" />
                        <span>Looking {session.face_direction}</span>
                      </div>
                    )}
                    
                    {session.people_detected && session.people_detected > 1 && (
                      <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/20 text-red-500 text-xs">
                        <Users className="h-3 w-3" />
                        <span>{session.people_detected} people</span>
                      </div>
                    )}
                    
                    {session.message && (
                      <div className="flex items-center gap-1">
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        <span>{session.message}</span>
                      </div>
                    )}
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedSession(session)}
                        >
                          Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl">
                        <DialogHeader>
                          <DialogTitle>
                            Student Monitoring Details: {session.name}
                          </DialogTitle>
                        </DialogHeader>
                        
                        {/* Include the StudentMonitoringData component */}
                        {selectedSession && (
                          <StudentMonitoringData
                            testId={testId}
                            studentId={selectedSession.student_id}
                          />
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    session.status === "active" 
                      ? "bg-green-500/20 text-green-500" 
                      : "bg-red-500/20 text-red-500"
                  }`}>
                    {session.status === "active" ? "Active" : "Terminated"}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {session.status === "active" ? (
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => onTerminate(session.id)}
                      >
                        Terminate
                      </Button>
                    ) : (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-green-600"
                        onClick={() => onContinue(session.id)}
                      >
                        Continue
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                No students have joined this test yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default StudentWarningsTable;
