import ThreeDBackground from "@/components/3d/ThreeDBackground";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  ArrowLeft,
  Bug,
  Clipboard,
  ClipboardCheck,
  Ghost,
  GraduationCap,
  Home,
  LifeBuoy,
  LogIn,
  Search,
  ShieldCheck,
  Sparkles,
  User
} from "lucide-react";
import {
  KeyboardEvent,
  MouseEvent as ReactMouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";

type Suggestion = { label: string; path: string; icon: JSX.Element };

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Tilt interaction
  const tiltRef = useRef<HTMLDivElement | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [12, -12]), {
    stiffness: 200,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-12, 12]), {
    stiffness: 200,
    damping: 20,
  });

  const handleMouseMove = useCallback((e: ReactMouseEvent) => {
    const el = tiltRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(px);
    y.set(py);
  }, [x, y]);

  const resetTilt = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  // Suggestions + search
  const allSuggestions: Suggestion[] = useMemo(
    () => [
      { label: "Home", path: "/", icon: <Home className="h-4 w-4" /> },
      { label: "Login", path: "/login", icon: <LogIn className="h-4 w-4" /> },
      { label: "Faculty Dashboard", path: "/faculty-dashboard", icon: <User className="h-4 w-4" /> },
      { label: "Student Dashboard", path: "/student-dashboard", icon: <GraduationCap className="h-4 w-4" /> },
      { label: "Admin Panel", path: "/admin", icon: <ShieldCheck className="h-4 w-4" /> },
      { label: "Developers", path: "/developers", icon: <Bug className="h-4 w-4" /> },
    ],
    []
  );
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allSuggestions;
    return allSuggestions.filter(
      (s) => s.label.toLowerCase().includes(q) || s.path.toLowerCase().includes(q)
    );
  }, [query, allSuggestions]);
  const [activeIndex, setActiveIndex] = useState(0);

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!filtered.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % filtered.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + filtered.length) % filtered.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      navigate(filtered[activeIndex].path);
    }
  };

  // Utilities
  const [copied, setCopied] = useState(false);
  const copyPath = async () => {
    try {
      await navigator.clipboard.writeText(location.pathname);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* noop */
    }
  };

  const reportLink = useMemo(() => {
    const subject = encodeURIComponent("Broken link report");
    const body = encodeURIComponent(
      `Hi team,\n\nI encountered a 404 on the following path:\n${location.pathname}\n\nSteps to reproduce:\n1. \n2. \n3. \n\nExpected:\n\nActual:\n\nThanks!`
    );
    return `mailto:support@pariksha.edu?subject=${subject}&body=${body}`;
  }, [location.pathname]);

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      <ThreeDBackground />

      {/* Floating decorations */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-10 -left-10 h-60 w-60 rounded-full bg-primary/20 blur-3xl"
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -bottom-10 -right-10 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl"
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 9, repeat: Infinity }}
      />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <motion.div
          ref={tiltRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={resetTilt}
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" as any }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-3xl"
        >
          <Card className="bg-card/80 backdrop-blur-xl border-primary/10 shadow-2xl shadow-black/10 overflow-hidden">
            <CardContent className="p-8 md:p-10">
              <div className="flex flex-col items-center text-center">
                {/* Draggable ghost */}
                <motion.div
                  drag
                  dragConstraints={{ left: -40, right: 40, top: -30, bottom: 30 }}
                  dragElastic={0.2}
                  whileTap={{ scale: 0.95 }}
                  className="relative mb-6 will-change-transform"
                  style={{ transformStyle: "preserve-3d" as any }}
                >
                  <div className="absolute -inset-6 rounded-3xl bg-gradient-to-br from-primary/20 to-violet-500/20 blur-2xl" />
                  <div className="relative inline-flex items-center justify-center h-20 w-20 rounded-2xl bg-gradient-to-br from-primary to-violet-500 text-white shadow-lg">
                    <Ghost className="h-10 w-10" />
                  </div>
                </motion.div>

                {/* Glitchy 404 */}
                <div className="relative mb-2">
                  <motion.h1
                    className="text-5xl md:text-6xl font-extrabold tracking-tight"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12 }}
                  >
                    <span className="bg-gradient-to-r from-primary via-violet-400 to-purple-500 bg-clip-text text-transparent select-none">
                      404
                    </span>
                  </motion.h1>
                  <motion.span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 blur-sm opacity-30 bg-gradient-to-r from-primary via-violet-400 to-purple-500 bg-clip-text text-transparent"
                    animate={{ opacity: [0.2, 0.4, 0.2], x: [-1, 1, -1] }}
                    transition={{ duration: 2.2, repeat: Infinity }}
                  >
                    404
                  </motion.span>
                </div>

                <motion.p
                  className="text-muted-foreground mb-6 max-w-md"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.22 }}
                >
                  The page you’re looking for doesn’t exist or has moved.
                </motion.p>

                {/* Attempted path with copy */}
                <motion.div
                  className="mb-8 rounded-xl bg-muted/50 border border-primary/10 px-4 py-3 w-full"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.28 }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs text-muted-foreground truncate">
                      Attempted path:
                      <code className="ml-2 rounded bg-muted px-2 py-0.5 text-foreground">
                        {location.pathname}
                      </code>
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={copyPath}
                      className="h-8 px-2 border-primary/20"
                      title="Copy path"
                    >
                      {copied ? (
                        <>
                          <ClipboardCheck className="h-4 w-4 mr-1" /> Copied
                        </>
                      ) : (
                        <>
                          <Clipboard className="h-4 w-4 mr-1" /> Copy
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>

                {/* Smart search */}
                <motion.div
                  className="w-full mb-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.32 }}
                >
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={query}
                      onChange={(e) => {
                        setQuery(e.target.value);
                        setActiveIndex(0);
                      }}
                      onKeyDown={onKeyDown}
                      placeholder="Search pages or type a path… (↑/↓ to navigate, Enter to open)"
                      className="pl-9 h-11"
                    />
                    {/* Suggestions dropdown */}
                    {!!filtered.length && (
                      <div className="absolute z-10 mt-2 w-full overflow-hidden rounded-xl border border-primary/10 bg-card/95 backdrop-blur-xl shadow-lg">
                        {filtered.slice(0, 6).map((s, i) => (
                          <button
                            key={s.path}
                            onMouseEnter={() => setActiveIndex(i)}
                            onClick={() => navigate(s.path)}
                            className={`w-full text-left px-3 py-2.5 flex items-center gap-2 text-sm transition-colors ${
                              i === activeIndex
                                ? "bg-primary/10 text-foreground"
                                : "hover:bg-muted/60 text-muted-foreground"
                            }`}
                          >
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-muted">
                              {s.icon}
                            </span>
                            <span className="font-medium">{s.label}</span>
                            <span className="ml-auto text-xs opacity-70">{s.path}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Quick links */}
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.36 }}
                >
                  <Button
                    onClick={() => navigate("/")}
                    className="h-11 px-5 bg-gradient-to-r from-primary to-violet-500 hover:opacity-90"
                  >
                    <Home className="mr-2 h-4 w-4" />
                    Go Home
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => navigate("/login")}
                    className="h-11 px-5"
                  >
                    <LogIn className="mr-2 h-4 w-4" />
                    Login
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate(-1)}
                    className="h-11 px-5 border-primary/20 hover:bg-primary/10"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Go Back
                  </Button>
                </motion.div>

                {/* Helpful actions */}
                <motion.div
                  className="mt-6 text-xs text-muted-foreground flex flex-wrap items-center gap-3 justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.45 }}
                >
                  <Sparkles className="h-4 w-4 text-primary" />
                  Still lost?{" "}
                  <a
                    href="mailto:support@pariksha.edu"
                    className="underline decoration-primary/50 hover:decoration-primary"
                  >
                    Contact support
                  </a>
                  <span className="opacity-50">•</span>
                  <a
                    href={reportLink}
                    className="inline-flex items-center gap-1 underline decoration-primary/50 hover:decoration-primary"
                  >
                    <Bug className="h-3.5 w-3.5" />
                    Report broken link
                  </a>
                  <span className="opacity-50">•</span>
                  <a
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/developers");
                    }}
                    href="/developers"
                    className="inline-flex items-center gap-1 underline decoration-primary/50 hover:decoration-primary"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Meet our team
                  </a>
                  <span className="opacity-50">•</span>
                  <LifeBuoy className="h-4 w-4 text-primary" />
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;