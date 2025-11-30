import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Copy, 
  ArrowLeft, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Activity,
  Eye,
  MonitorX,
  TabletSmartphone,
  Clock,
  RefreshCw,
  Wifi,
  WifiOff
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useTest } from "@/context/TestContext";
import { useRealtimeTestSessions } from "@/hooks/useRealtimeTestSessions";
import ThreeDBackground from "@/components/3d/ThreeDBackground";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const TestDashboard = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getTestById } = useTest();
  const [isLive, setIsLive] = useState(true);

  const test = getTestById(id || "");
  
  const {
    sessions,
    monitoringLogs,
    isLoading,
    terminateStudent,
    allowContinue,
  } = useRealtimeTestSessions(id || "");

  useEffect(() => {
    if (!test && !isLoading) {
      navigate("/faculty-dashboard");
    }
  }, [test, navigate, isLoading]);

  if (!test) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Calculate statistics
  const activeStudents = sessions.filter(s => s.status === "in_progress").length;
  const completedStudents = sessions.filter(s => s.status === "submitted").length;
  const terminatedStudents = sessions.filter(s => s.status === "terminated").length;
  const totalWarnings = sessions.reduce((acc, s) => acc + s.total_warnings, 0);
  const highRiskStudents = sessions.filter(s => s.total_warnings >= 3).length;

  const handleCopyTestId = () => {
    if (test.unique_id) {
      navigator.clipboard.writeText(test.unique_id);
      toast({
        title: "Test ID Copied",
        description: "Share this ID with students to join the test.",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "in_progress":
        return <Badge className="bg-green-500/20 text-green-500 border-green-500/30">Active</Badge>;
      case "submitted":
        return <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/30">Submitted</Badge>;
      case "terminated":
        return <Badge className="bg-red-500/20 text-red-500 border-red-500/30">Terminated</Badge>;
      case "not_started":
        return <Badge className="bg-gray-500/20 text-gray-500 border-gray-500/30">Not Started</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getWarningLevel = (warnings: number) => {
    if (warnings >= 5) return "text-red-500 bg-red-500/20";
    if (warnings >= 3) return "text-orange-500 bg-orange-500/20";
    if (warnings >= 1) return "text-yellow-500 bg-yellow-500/20";
    return "text-green-500 bg-green-500/20";
  };

  const formatTime = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleTimeString();
  };

  return (
    <div className="min-h-screen p-4 md:p-6 relative overflow-hidden">
      <ThreeDBackground />
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between mb-6 relative z-10 gap-4"
      >
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate("/faculty-dashboard")}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{test.title}</h1>
            <p className="text-sm text-muted-foreground">{test.subject} • {test.duration} minutes</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Live Indicator */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${isLive ? 'bg-green-500/20' : 'bg-gray-500/20'}`}>
            {isLive ? (
              <>
                <Wifi className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-500 font-medium">Live</span>
                <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-500 font-medium">Offline</span>
              </>
            )}
          </div>

          {/* Test ID */}
          <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-1.5">
            <span className="text-sm font-mono">{test.unique_id}</span>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopyTestId}>
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6 relative z-10"
      >
        {[
          { icon: <Users className="h-5 w-5" />, value: sessions.length, label: "Total Joined", color: "from-blue-500 to-cyan-500" },
          { icon: <Activity className="h-5 w-5" />, value: activeStudents, label: "Active Now", color: "from-green-500 to-emerald-500" },
          { icon: <CheckCircle className="h-5 w-5" />, value: completedStudents, label: "Completed", color: "from-purple-500 to-violet-500" },
          { icon: <XCircle className="h-5 w-5" />, value: terminatedStudents, label: "Terminated", color: "from-red-500 to-pink-500" },
          { icon: <AlertTriangle className="h-5 w-5" />, value: totalWarnings, label: "Total Warnings", color: "from-orange-500 to-amber-500" },
        ].map((stat, i) => (
          <Card key={i} className="bg-card/60 backdrop-blur-md border-primary/10">
            <CardContent className="p-4">
              <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${stat.color} text-white mb-2`}>
                {stat.icon}
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        {/* Students Table */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card className="bg-card/60 backdrop-blur-md border-primary/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                Student Monitoring
              </CardTitle>
              <Badge variant="outline" className="font-mono">
                {sessions.length} students
              </Badge>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : sessions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No students have joined yet</p>
                  <p className="text-sm">Share the test ID to allow students to join</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Warnings</TableHead>
                        <TableHead>Tab Switches</TableHead>
                        <TableHead>Started</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence>
                        {sessions.map((session) => (
                          <motion.tr
                            key={session.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="border-b border-primary/10"
                          >
                            <TableCell>
                              <div>
                                <p className="font-medium">{session.student_name}</p>
                                <p className="text-xs text-muted-foreground">{session.student_email}</p>
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(session.status)}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getWarningLevel(session.total_warnings)}`}>
                                {session.total_warnings}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <TabletSmartphone className="h-3 w-3" />
                                {session.tab_switch_count}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 text-sm">
                                <Clock className="h-3 w-3" />
                                {formatTime(session.started_at)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                {session.status === "in_progress" && (
                                  <Button 
                                    variant="destructive" 
                                    size="sm"
                                    onClick={() => terminateStudent(session.id)}
                                  >
                                    Terminate
                                  </Button>
                                )}
                                {session.status === "terminated" && (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => allowContinue(session.id)}
                                  >
                                    Allow Continue
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Live Activity Feed */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-card/60 backdrop-blur-md border-primary/10 h-full">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Live Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {monitoringLogs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No activity yet</p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {monitoringLogs.slice(0, 20).map((log, index) => (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                      >
                        <div className={`p-1.5 rounded-md ${
                          log.event_type.includes("warning") || log.event_type.includes("violation")
                            ? "bg-red-500/20 text-red-500"
                            : log.event_type.includes("tab") || log.event_type.includes("fullscreen")
                            ? "bg-orange-500/20 text-orange-500"
                            : "bg-blue-500/20 text-blue-500"
                        }`}>
                          {log.event_type.includes("tab") ? (
                            <MonitorX className="h-4 w-4" />
                          ) : log.event_type.includes("warning") ? (
                            <AlertTriangle className="h-4 w-4" />
                          ) : (
                            <Activity className="h-4 w-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium capitalize">
                            {log.event_type.replace(/_/g, " ")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* High Risk Alert */}
      {highRiskStudents > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 relative z-10"
        >
          <Card className="bg-red-500/10 border-red-500/30">
            <CardContent className="p-4 flex items-center gap-4">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <div>
                <h3 className="font-semibold text-red-500">High Risk Alert</h3>
                <p className="text-sm text-muted-foreground">
                  {highRiskStudents} student(s) have 3 or more warnings. Consider reviewing their activity.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default TestDashboard;
