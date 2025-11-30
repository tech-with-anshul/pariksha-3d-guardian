import FloatingShield from "@/components/3d/FloatingShield";
import ThreeDBackground from "@/components/3d/ThreeDBackground";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { useTest } from "@/context/TestContext";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  AlertCircle,
  Award,
  BarChart2,
  Bell,
  Book,
  CheckCircle2,
  ChevronRight,
  Clock,
  Command,
  Download,
  FileText,
  Filter,
  LogOut,
  Plus,
  Search,
  Settings,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  UserCircle,
  Users,
  Zap
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

type StatusFilter = "all" | "published" | "draft";
type SortKey = "title" | "questions" | "duration" | "recent";

const FacultyDashboard = () => {
  const { user, logout } = useAuth();
  const { tests } = useTest();
  const navigate = useNavigate();

  // Local UI state
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState<SortKey>("recent");
  const [showShortcuts, setShowShortcuts] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user || user.role !== "faculty") {
      navigate("/login");
    }
  }, [user, navigate]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const tag = target?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea") return;

      if (e.key === "/") {
        e.preventDefault();
        searchRef.current?.focus();
      } else if (e.key === "n" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        navigate("/create-test");
      } else if (e.key === "?" && e.shiftKey) {
        e.preventDefault();
        setShowShortcuts((prev) => !prev);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  // Tests authored by the logged-in faculty
  const facultyTests = useMemo(() => {
    if (!user) return [];
    return tests.filter((t) => t.createdBy === user.id);
  }, [tests, user]);

  // Derived stats
  const publishedCount = useMemo(
    () => facultyTests.filter((t) => t.status === "published").length,
    [facultyTests]
  );
  const draftCount = useMemo(
    () => facultyTests.filter((t) => t.status === "draft").length,
    [facultyTests]
  );
  const totalQuestions = useMemo(
    () => facultyTests.reduce((acc, t) => acc + t.questions.length, 0),
    [facultyTests]
  );
  const avgDuration = useMemo(() => {
    if (facultyTests.length === 0) return 0;
    return Math.round(
      facultyTests.reduce((acc, t) => acc + t.duration, 0) / facultyTests.length
    );
  }, [facultyTests]);

  // Mock recent activity (in real app, fetch from backend)
  const recentActivity = useMemo(
    () => [
      {
        id: 1,
        action: "Created",
        test: "Mid-Term Mathematics",
        time: "2 hours ago",
        icon: <Plus className="h-4 w-4" />,
      },
      {
        id: 2,
        action: "Published",
        test: "Physics Final Exam",
        time: "5 hours ago",
        icon: <CheckCircle2 className="h-4 w-4" />,
      },
      {
        id: 3,
        action: "Edited",
        test: "Chemistry Quiz 2",
        time: "1 day ago",
        icon: <FileText className="h-4 w-4" />,
      },
      {
        id: 4,
        action: "Monitored",
        test: "Biology Assessment",
        time: "2 days ago",
        icon: <BarChart2 className="h-4 w-4" />,
      },
    ],
    []
  );

  // Filter + search + sort
  const visibleTests = useMemo(() => {
    let list = facultyTests.slice();

    if (status !== "all") {
      list = list.filter((t) => t.status === status);
    }

    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.subject.toLowerCase().includes(q) ||
          String(t.id).toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      if (sortBy === "title") return a.title.localeCompare(b.title);
      if (sortBy === "questions") return b.questions.length - a.questions.length;
      if (sortBy === "duration") return b.duration - a.duration;
      if (sortBy === "recent") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return 0;
    });

    return list;
  }, [facultyTests, status, query, sortBy]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  // Quick actions
  const quickActions = useMemo(
    () => [
      {
        icon: <Plus className="h-5 w-5" />,
        label: "New Test",
        action: () => navigate("/create-test"),
        color: "from-blue-500 to-cyan-500",
      },
      {
        icon: <FileText className="h-5 w-5" />,
        label: "Templates",
        action: () => console.log("Templates"),
        color: "from-purple-500 to-pink-500",
      },
      {
        icon: <Download className="h-5 w-5" />,
        label: "Export Data",
        action: () => console.log("Export"),
        color: "from-emerald-500 to-teal-500",
      },
      {
        icon: <Settings className="h-5 w-5" />,
        label: "Settings",
        action: () => console.log("Settings"),
        color: "from-orange-500 to-amber-500",
      },
    ],
    [navigate]
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (!user) return null;

  return (
    <div className="min-h-screen p-4 md:p-6 relative overflow-hidden">
      <ThreeDBackground />

      {/* Keyboard Shortcuts Modal */}
      <AnimatePresence>
        {showShortcuts && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowShortcuts(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-primary/20 rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Command className="h-5 w-5 text-primary" />
                  Keyboard Shortcuts
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowShortcuts(false)}
                >
                  ✕
                </Button>
              </div>
              <div className="space-y-3">
                {[
                  { keys: ["/"], desc: "Focus search" },
                  { keys: ["⌘", "N"], desc: "Create new test" },
                  { keys: ["?"], desc: "Show shortcuts" },
                ].map((shortcut, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2 border-b border-primary/10 last:border-0"
                  >
                    <span className="text-sm text-muted-foreground">
                      {shortcut.desc}
                    </span>
                    <div className="flex gap-1">
                      {shortcut.keys.map((key, j) => (
                        <kbd
                          key={j}
                          className="px-2 py-1 bg-muted rounded text-xs font-mono"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Navigation */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6 relative z-10"
      >
        <div className="flex items-center gap-3">
          <motion.div
            className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center shadow-lg shadow-primary/25"
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <Shield className="h-7 w-7 text-white" />
          </motion.div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent">
              Pariksha Protector
            </h1>
            <p className="text-xs text-muted-foreground">Faculty Dashboard</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => setShowShortcuts(true)}
          >
            <Command className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse" />
          </Button>
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border border-primary/10">
            <UserCircle className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{user.name}</span>
          </div>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>
      </motion.div>

      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative z-10 mb-6"
      >
        <Card className="bg-gradient-to-br from-primary/20 via-violet-500/20 to-purple-500/20 backdrop-blur-xl border-primary/20 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/30 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500/30 rounded-full blur-3xl" />
          <CardContent className="relative p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h2 className="text-2xl font-bold">
                    {greeting}, {user.name.split(" ")[0]}!
                  </h2>
                </div>
                <p className="text-muted-foreground">
                  You have {publishedCount} published tests and {draftCount}{" "}
                  drafts. Ready to create something amazing?
                </p>
              </div>
              <Button
                size="lg"
                className="bg-gradient-to-r from-primary to-violet-500 hover:opacity-90 shadow-lg"
                onClick={() => navigate("/create-test")}
              >
                <Plus className="mr-2 h-5 w-5" />
                Create New Test
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 relative z-10"
      >
        {[
          {
            icon: <Book className="h-5 w-5" />,
            value: facultyTests.length,
            label: "Total Tests",
            color: "from-blue-500 to-cyan-500",
          },
          {
            icon: <CheckCircle2 className="h-5 w-5" />,
            value: publishedCount,
            label: "Published",
            color: "from-emerald-500 to-teal-500",
          },
          {
            icon: <FileText className="h-5 w-5" />,
            value: totalQuestions,
            label: "Questions",
            color: "from-purple-500 to-pink-500",
          },
          {
            icon: <Clock className="h-5 w-5" />,
            value: `${avgDuration}m`,
            label: "Avg Duration",
            color: "from-orange-500 to-amber-500",
          },
        ].map((stat, i) => (
          <motion.div key={i} variants={itemVariants}>
            <Card className="bg-card/60 backdrop-blur-md border-primary/10 hover:border-primary/30 transition-all group cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`p-2 rounded-lg bg-gradient-to-br ${stat.color} text-white group-hover:scale-110 transition-transform`}
                  >
                    {stat.icon}
                  </div>
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative z-10 mb-6"
      >
        <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
          <Zap className="h-4 w-4" />
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map((action, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={action.action}
              className="p-4 rounded-xl bg-card/60 backdrop-blur-md border border-primary/10 hover:border-primary/30 transition-all text-left group"
            >
              <div
                className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${action.color} text-white mb-2 group-hover:scale-110 transition-transform`}
              >
                {action.icon}
              </div>
              <p className="text-sm font-medium">{action.label}</p>
            </motion.button>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        {/* Left Column - Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 }}
          className="lg:col-span-1 space-y-6"
        >
          {/* Recent Activity */}
          <Card className="bg-card/60 backdrop-blur-md border-primary/10">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="h-5 w-5 text-primary" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="p-1.5 rounded-md bg-primary/20 text-primary">
                      {activity.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {activity.action}{" "}
                        <span className="text-muted-foreground">
                          {activity.test}
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.time}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card className="bg-card/60 backdrop-blur-md border-primary/10">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Award className="h-5 w-5 text-primary" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-amber-500/20 to-yellow-500/20">
                  <Target className="h-6 w-6 text-amber-500" />
                  <div>
                    <p className="text-sm font-medium">Test Master</p>
                    <p className="text-xs text-muted-foreground">
                      Created 10+ tests
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-blue-500/20 to-cyan-500/20">
                  <Users className="h-6 w-6 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">Educator Pro</p>
                    <p className="text-xs text-muted-foreground">
                      100+ students tested
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Column - Tests */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <Card className="bg-card/60 backdrop-blur-md border-primary/10">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Book className="h-5 w-5 text-primary" />
                  Your Tests
                </CardTitle>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Filter className="h-3 w-3" />
                  {visibleTests.length} shown
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {/* Toolbar */}
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-3 mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    ref={searchRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search tests... (press / to focus)"
                    className="pl-9 h-10"
                  />
                </div>

                <div className="flex items-center gap-1 bg-muted/50 border border-primary/10 rounded-lg p-1">
                  {(["all", "published", "draft"] as StatusFilter[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatus(s)}
                      className={`px-3 py-1.5 text-xs rounded-md transition-colors capitalize ${
                        status === s ? "bg-primary text-white" : "hover:bg-muted"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortKey)}
                  className="h-10 rounded-lg bg-muted/50 border border-primary/10 px-3 text-sm"
                >
                  <option value="recent">Recent</option>
                  <option value="title">Title</option>
                  <option value="questions">Questions</option>
                  <option value="duration">Duration</option>
                </select>
              </div>

              {/* Tests List */}
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {visibleTests.length > 0 ? (
                  visibleTests.map((test, index) => (
                    <motion.div
                      key={test.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.01, x: 4 }}
                      className="p-4 rounded-xl bg-accent/50 hover:bg-accent border border-transparent hover:border-primary/20 cursor-pointer transition-all group"
                      onClick={() => navigate(`/test-dashboard/${test.id}`)}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="p-2 rounded-lg bg-primary/20 group-hover:bg-primary/30 transition-colors">
                            <Book className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate group-hover:text-primary transition-colors">
                              {test.title}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                              <span className="flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                {test.subject}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Target className="h-3 w-3" />
                                {test.questions.length} questions
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {test.duration}m
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              test.status === "published" ? "default" : "secondary"
                            }
                            className={`${
                              test.status === "published"
                                ? "bg-emerald-500/20 text-emerald-600 border-emerald-500/30"
                                : "bg-yellow-500/20 text-yellow-600 border-yellow-500/30"
                            }`}
                          >
                            {test.status === "published" ? (
                              <>
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Published
                              </>
                            ) : (
                              <>
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Draft
                              </>
                            )}
                          </Badge>

                          {test.status === "published" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/test-dashboard/${test.id}`);
                              }}
                            >
                              <BarChart2 className="h-4 w-4 mr-1" />
                              Monitor
                            </Button>
                          )}

                          <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="mx-auto w-32 h-32 mb-4">
                      <FloatingShield />
                    </div>
                    <h3 className="text-xl font-medium mb-2">No matching tests</h3>
                    <p className="text-muted-foreground mb-4">
                      {query
                        ? "Try a different search term"
                        : "Create your first test to get started"}
                    </p>
                    <Button
                      onClick={() => navigate("/create-test")}
                      className="flex items-center gap-2 mx-auto"
                    >
                      <Plus className="h-4 w-4" />
                      Create New Test
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: hsl(var(--primary) / 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--primary) / 0.5);
        }
      `}</style>
    </div>
  );
};

export default FacultyDashboard;