import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLiveEvaluation } from '@/hooks/useLiveEvaluation';
import { useAuth } from '@/context/AuthContext';
import { EvaluateAnswer } from '@/components/EvaluateAnswer';
import { Users, CheckCircle, Clock, AlertTriangle, FileText, RefreshCw, Eye } from 'lucide-react';
import { format } from 'date-fns';

interface LiveEvaluationDashboardProps {
  testId: string;
  testTitle: string;
  questions: any[];
  onBack: () => void;
}

export const LiveEvaluationDashboard = ({
  testId,
  testTitle,
  questions,
  onBack,
}: LiveEvaluationDashboardProps) => {
  const { user } = useAuth();
  const { sessions, answers, isLoading, getLiveStats, getSessionAnswers, refetch } = useLiveEvaluation(testId);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const stats = getLiveStats();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
      case 'in_progress':
        return <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/30">In Progress</Badge>;
      case 'completed':
      case 'submitted':
        return <Badge className="bg-green-500/20 text-green-500 border-green-500/30">Submitted</Badge>;
      case 'terminated':
        return <Badge className="bg-red-500/20 text-red-500 border-red-500/30">Terminated</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const selectedSessionData = selectedSession
    ? sessions.find(s => s.id === selectedSession)
    : null;
  const selectedSessionAnswers = selectedSession
    ? getSessionAnswers(selectedSession)
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{testTitle}</h1>
          <p className="text-muted-foreground">Live Evaluation Dashboard</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refetch} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={onBack}>
            Back to Dashboard
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold">{stats.totalSessions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Clock className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold">{stats.activeSessions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Submitted</p>
                <p className="text-2xl font-bold">{stats.submittedSessions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <FileText className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Graded</p>
                <p className="text-2xl font-bold">{stats.gradedAnswers}/{stats.totalAnswers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grading Progress */}
      {stats.totalAnswers > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Grading Progress</span>
              <span className="text-sm text-muted-foreground">
                {Math.round((stats.gradedAnswers / stats.totalAnswers) * 100)}%
              </span>
            </div>
            <Progress value={(stats.gradedAnswers / stats.totalAnswers) * 100} />
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="evaluate">Evaluate Answers</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Student Sessions</CardTitle>
              <CardDescription>Real-time view of all test sessions</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading sessions...
                </div>
              ) : sessions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No students have started this test yet
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Started At</TableHead>
                      <TableHead>Warnings</TableHead>
                      <TableHead>Answers</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessions.map((session) => {
                      const sessionAnswers = getSessionAnswers(session.id);
                      const gradedCount = sessionAnswers.filter(a => a.graded_by).length;
                      
                      return (
                        <TableRow key={session.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {session.student?.full_name || 'Unknown Student'}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {session.student?.email || session.student_id}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(session.status)}</TableCell>
                          <TableCell>
                            {session.started_at
                              ? format(new Date(session.started_at), 'MMM d, HH:mm')
                              : '-'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {session.total_warnings > 0 && (
                                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                              )}
                              <span>{session.total_warnings}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {gradedCount}/{sessionAnswers.length} graded
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedSession(session.id);
                                setActiveTab('evaluate');
                              }}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evaluate" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Session List */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-2">
                    {sessions.filter(s => 
                      s.status === 'completed' || s.status === 'submitted'
                    ).map((session) => {
                      const sessionAnswers = getSessionAnswers(session.id);
                      const pendingCount = sessionAnswers.filter(a => !a.graded_by).length;
                      
                      return (
                        <button
                          key={session.id}
                          onClick={() => setSelectedSession(session.id)}
                          className={`w-full p-3 rounded-lg text-left transition-colors ${
                            selectedSession === session.id
                              ? 'bg-primary/10 border-primary'
                              : 'bg-muted/50 hover:bg-muted'
                          } border`}
                        >
                          <p className="font-medium">
                            {session.student?.full_name || 'Unknown'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {pendingCount > 0 
                              ? `${pendingCount} pending` 
                              : 'All graded'}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Evaluation Panel */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">
                  {selectedSessionData
                    ? `Evaluating: ${selectedSessionData.student?.full_name || 'Student'}`
                    : 'Select a session'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedSession && selectedSessionAnswers.length > 0 ? (
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-4">
                      {selectedSessionAnswers.map((answer) => {
                        const question = questions.find(q => q.id === answer.question_id);
                        
                        if (!question) return null;
                        
                        if (answer.graded_by) {
                          return (
                            <Card key={answer.id} className="bg-green-500/5 border-green-500/20">
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="font-medium mb-1">{question.question_text}</p>
                                    <p className="text-sm text-muted-foreground">
                                      Answer: {answer.student_answer || 'No answer'}
                                    </p>
                                  </div>
                                  <Badge className="bg-green-500/20 text-green-500">
                                    {answer.marks_awarded}/{question.marks} marks
                                  </Badge>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        }
                        
                        return (
                          <EvaluateAnswer
                            key={answer.id}
                            studentAnswerId={answer.id}
                            questionText={question.question_text}
                            answerText={answer.student_answer || undefined}
                            maxMarks={question.marks}
                            testId={testId}
                            onEvaluated={refetch}
                          />
                        );
                      })}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    {selectedSession
                      ? 'No answers submitted yet'
                      : 'Select a session to start evaluating'}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="monitoring" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Monitoring Summary</CardTitle>
              <CardDescription>Overview of violations and warnings</CardDescription>
            </CardHeader>
            <CardContent>
              {sessions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No sessions to display
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Tab Switches</TableHead>
                      <TableHead>Fullscreen Exits</TableHead>
                      <TableHead>Total Warnings</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell className="font-medium">
                          {session.student?.full_name || 'Unknown'}
                        </TableCell>
                        <TableCell>
                          <span className={session.tab_switch_count > 0 ? 'text-yellow-500' : ''}>
                            {session.tab_switch_count}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={session.fullscreen_exit_count > 0 ? 'text-yellow-500' : ''}>
                            {session.fullscreen_exit_count}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={session.total_warnings >= 3 ? 'text-red-500 font-bold' : ''}>
                            {session.total_warnings}
                          </span>
                        </TableCell>
                        <TableCell>{getStatusBadge(session.status)}</TableCell>
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
