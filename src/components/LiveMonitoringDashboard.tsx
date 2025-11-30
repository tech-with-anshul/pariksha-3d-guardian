import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRealtimeTestSessions } from '@/hooks/useRealtimeTestSessions';
import { 
  Users, 
  AlertTriangle, 
  Eye, 
  Clock, 
  Activity,
  Shield,
  XCircle,
  CheckCircle,
  MonitorOff,
  Maximize,
  ArrowLeft,
  RefreshCw
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

interface LiveMonitoringDashboardProps {
  testId: string;
  testTitle: string;
  warningThreshold?: number;
  onBack: () => void;
}

export const LiveMonitoringDashboard = ({
  testId,
  testTitle,
  warningThreshold = 3,
  onBack,
}: LiveMonitoringDashboardProps) => {
  const {
    sessions,
    monitoringLogs,
    isLoading,
    terminateStudent,
    allowContinue,
  } = useRealtimeTestSessions(testId);

  const [activeTab, setActiveTab] = useState('live');
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

  // Calculate stats
  const activeSessions = sessions.filter(s => s.status === 'in_progress');
  const completedSessions = sessions.filter(s => s.status === 'completed' || s.status === 'submitted');
  const terminatedSessions = sessions.filter(s => s.status === 'terminated');
  const totalWarnings = sessions.reduce((acc, s) => acc + s.total_warnings, 0);
  const studentsAtRisk = sessions.filter(s => s.total_warnings >= warningThreshold && s.status === 'in_progress');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in_progress':
        return <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/30 animate-pulse">Live</Badge>;
      case 'completed':
      case 'submitted':
        return <Badge className="bg-green-500/20 text-green-500 border-green-500/30">Submitted</Badge>;
      case 'terminated':
        return <Badge className="bg-red-500/20 text-red-500 border-red-500/30">Terminated</Badge>;
      case 'not_started':
        return <Badge variant="outline">Not Started</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getWarningColor = (warnings: number) => {
    if (warnings === 0) return 'text-green-500';
    if (warnings < warningThreshold) return 'text-yellow-500';
    return 'text-red-500 font-bold';
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'tab_switch':
        return <MonitorOff className="h-4 w-4 text-yellow-500" />;
      case 'fullscreen_exit':
        return <Maximize className="h-4 w-4 text-orange-500" />;
      case 'face_away':
        return <Eye className="h-4 w-4 text-yellow-500" />;
      case 'multiple_faces':
        return <Users className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getEventDescription = (eventType: string, eventData: any) => {
    switch (eventType) {
      case 'tab_switch':
        return 'Switched to another tab';
      case 'fullscreen_exit':
        return 'Exited fullscreen mode';
      case 'face_away':
        return `Face direction: ${eventData?.direction || 'Away'}`;
      case 'multiple_faces':
        return `${eventData?.count || 'Multiple'} faces detected`;
      case 'warning':
        return eventData?.message || 'Warning issued';
      default:
        return eventType.replace(/_/g, ' ');
    }
  };

  const selectedStudentSession = selectedStudent 
    ? sessions.find(s => s.id === selectedStudent)
    : null;

  const studentLogs = selectedStudent
    ? monitoringLogs.filter(log => log.session_id === selectedStudent)
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              Live Monitoring
            </h1>
            <p className="text-muted-foreground">{testTitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/20 text-green-500 text-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Real-time
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-card/60 backdrop-blur-md border-primary/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Users className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{activeSessions.length}</p>
                  <p className="text-xs text-muted-foreground">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card className="bg-card/60 backdrop-blur-md border-primary/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{completedSessions.length}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-card/60 backdrop-blur-md border-primary/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <XCircle className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{terminatedSessions.length}</p>
                  <p className="text-xs text-muted-foreground">Terminated</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="bg-card/60 backdrop-blur-md border-primary/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalWarnings}</p>
                  <p className="text-xs text-muted-foreground">Warnings</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className={`bg-card/60 backdrop-blur-md ${studentsAtRisk.length > 0 ? 'border-red-500/50 animate-pulse' : 'border-primary/10'}`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 ${studentsAtRisk.length > 0 ? 'bg-red-500/20' : 'bg-muted/50'} rounded-lg`}>
                  <Shield className={`h-5 w-5 ${studentsAtRisk.length > 0 ? 'text-red-500' : 'text-muted-foreground'}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{studentsAtRisk.length}</p>
                  <p className="text-xs text-muted-foreground">At Risk</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Alert for students at risk */}
      <AnimatePresence>
        {studentsAtRisk.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="border-red-500/50 bg-red-500/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="font-medium text-red-500">
                      {studentsAtRisk.length} student(s) have reached the warning threshold
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Consider reviewing their sessions or taking action
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/50">
          <TabsTrigger value="live" className="data-[state=active]:bg-primary/20">
            <Activity className="h-4 w-4 mr-2" />
            Live Sessions
          </TabsTrigger>
          <TabsTrigger value="violations" className="data-[state=active]:bg-primary/20">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Violations Log
          </TabsTrigger>
          <TabsTrigger value="all" className="data-[state=active]:bg-primary/20">
            <Users className="h-4 w-4 mr-2" />
            All Students
          </TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="mt-4">
          <Card className="bg-card/60 backdrop-blur-md border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Active Sessions
              </CardTitle>
              <CardDescription>
                Students currently taking the test
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : activeSessions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No active sessions at the moment
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Started</TableHead>
                      <TableHead>Tab Switches</TableHead>
                      <TableHead>Fullscreen Exits</TableHead>
                      <TableHead>Warnings</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeSessions.map((session) => (
                      <TableRow 
                        key={session.id}
                        className={session.total_warnings >= warningThreshold ? 'bg-red-500/5' : ''}
                      >
                        <TableCell>
                          <div>
                            <p className="font-medium">{session.student_name}</p>
                            <p className="text-sm text-muted-foreground">{session.student_email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {session.started_at 
                            ? formatDistanceToNow(new Date(session.started_at), { addSuffix: true })
                            : '-'
                          }
                        </TableCell>
                        <TableCell>
                          <span className={session.tab_switch_count > 0 ? 'text-yellow-500 font-medium' : ''}>
                            {session.tab_switch_count}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={session.fullscreen_exit_count > 0 ? 'text-orange-500 font-medium' : ''}>
                            {session.fullscreen_exit_count}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={getWarningColor(session.total_warnings)}>
                            {session.total_warnings}
                          </span>
                        </TableCell>
                        <TableCell>{getStatusBadge(session.status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedStudent(session.id);
                                setActiveTab('violations');
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => terminateStudent(session.id)}
                            >
                              Terminate
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="violations" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Student List */}
            <Card className="bg-card/60 backdrop-blur-md border-primary/10">
              <CardHeader>
                <CardTitle className="text-lg">Students</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-2">
                    {sessions.map((session) => (
                      <button
                        key={session.id}
                        onClick={() => setSelectedStudent(session.id)}
                        className={`w-full p-3 rounded-lg text-left transition-colors ${
                          selectedStudent === session.id
                            ? 'bg-primary/10 border-primary'
                            : 'bg-muted/50 hover:bg-muted'
                        } border`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{session.student_name}</p>
                            <p className="text-xs text-muted-foreground">{session.status}</p>
                          </div>
                          <div className={`text-sm font-bold ${getWarningColor(session.total_warnings)}`}>
                            {session.total_warnings}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Violation Details */}
            <Card className="lg:col-span-2 bg-card/60 backdrop-blur-md border-primary/10">
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>
                    {selectedStudentSession
                      ? `${selectedStudentSession.student_name}'s Activity`
                      : 'Select a student'}
                  </span>
                  {selectedStudentSession && (
                    <div className="flex gap-2">
                      {selectedStudentSession.status === 'in_progress' && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => terminateStudent(selectedStudentSession.id)}
                        >
                          Terminate
                        </Button>
                      )}
                      {selectedStudentSession.status === 'terminated' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => allowContinue(selectedStudentSession.id)}
                        >
                          Allow Continue
                        </Button>
                      )}
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedStudent ? (
                  <>
                    {/* Stats */}
                    {selectedStudentSession && (
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="p-3 rounded-lg bg-muted/50">
                          <p className="text-xs text-muted-foreground">Tab Switches</p>
                          <p className="text-xl font-bold">{selectedStudentSession.tab_switch_count}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-muted/50">
                          <p className="text-xs text-muted-foreground">Fullscreen Exits</p>
                          <p className="text-xl font-bold">{selectedStudentSession.fullscreen_exit_count}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-muted/50">
                          <p className="text-xs text-muted-foreground">Total Warnings</p>
                          <p className={`text-xl font-bold ${getWarningColor(selectedStudentSession.total_warnings)}`}>
                            {selectedStudentSession.total_warnings}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Event Log */}
                    <ScrollArea className="h-[350px]">
                      {studentLogs.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          No violations recorded for this student
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {studentLogs.map((log) => (
                            <div
                              key={log.id}
                              className="flex items-start gap-3 p-3 rounded-lg bg-muted/30"
                            >
                              {getEventIcon(log.event_type)}
                              <div className="flex-1">
                                <p className="text-sm font-medium">
                                  {getEventDescription(log.event_type, log.event_data)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {format(new Date(log.timestamp), 'HH:mm:ss')}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Select a student to view their activity log
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="all" className="mt-4">
          <Card className="bg-card/60 backdrop-blur-md border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                All Students
              </CardTitle>
              <CardDescription>
                Complete list of all test sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : sessions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No students have joined this test yet
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Started</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Tab Switches</TableHead>
                      <TableHead>Fullscreen Exits</TableHead>
                      <TableHead>Warnings</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{session.student_name}</p>
                            <p className="text-sm text-muted-foreground">{session.student_email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {session.started_at 
                            ? format(new Date(session.started_at), 'MMM d, HH:mm')
                            : '-'
                          }
                        </TableCell>
                        <TableCell>
                          {session.submitted_at 
                            ? format(new Date(session.submitted_at), 'MMM d, HH:mm')
                            : '-'
                          }
                        </TableCell>
                        <TableCell>
                          <span className={session.tab_switch_count > 0 ? 'text-yellow-500 font-medium' : ''}>
                            {session.tab_switch_count}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={session.fullscreen_exit_count > 0 ? 'text-orange-500 font-medium' : ''}>
                            {session.fullscreen_exit_count}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={getWarningColor(session.total_warnings)}>
                            {session.total_warnings}
                          </span>
                        </TableCell>
                        <TableCell>{getStatusBadge(session.status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {session.status === 'in_progress' && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => terminateStudent(session.id)}
                              >
                                Terminate
                              </Button>
                            )}
                            {session.status === 'terminated' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => allowContinue(session.id)}
                              >
                                Allow
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
