import ThreeDBackground from "@/components/3d/ThreeDBackground";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  Building2,
  Check,
  ChevronRight,
  Clock,
  Eye,
  GraduationCap,
  Lock,
  Monitor,
  Play,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Zap
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const [activeTab, setActiveTab] = useState("features");
  const navigate = useNavigate();

  const features = [
    { 
      icon: <ShieldCheck className="h-8 w-8" />,
      title: "AI-Powered Proctoring", 
      description: "Advanced facial recognition and behavior analysis to detect suspicious activities in real-time",
      color: "from-blue-500 to-cyan-500"
    },
    { 
      icon: <Eye className="h-8 w-8" />,
      title: "Live Monitoring", 
      description: "Watch multiple students simultaneously with instant alerts for violations",
      color: "from-purple-500 to-pink-500"
    },
    { 
      icon: <Lock className="h-8 w-8" />,
      title: "Secure Browser", 
      description: "Lockdown browser mode prevents tab switching, copy-paste, and screen capture",
      color: "from-emerald-500 to-teal-500"
    },
    { 
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Detailed Analytics", 
      description: "Comprehensive reports on student performance and integrity metrics",
      color: "from-orange-500 to-amber-500"
    },
    { 
      icon: <Clock className="h-8 w-8" />,
      title: "Flexible Scheduling", 
      description: "Set custom time windows, duration limits, and automatic submissions",
      color: "from-rose-500 to-red-500"
    },
    { 
      icon: <Zap className="h-8 w-8" />,
      title: "Instant Results", 
      description: "Automatic grading for objective questions with manual review options",
      color: "from-indigo-500 to-violet-500"
    },
  ];

  const stats = [
    { value: "50K+", label: "Exams Conducted", icon: <BookOpen className="h-5 w-5" /> },
    { value: "200+", label: "Institutions", icon: <Building2 className="h-5 w-5" /> },
    { value: "99.9%", label: "Uptime", icon: <Zap className="h-5 w-5" /> },
    { value: "1M+", label: "Students", icon: <GraduationCap className="h-5 w-5" /> },
  ];

  const testimonials = [
    {
      quote: "Pariksha Protector has revolutionized how we conduct online exams. The AI proctoring is incredibly accurate.",
      author: "Dr. Priya Sharma",
      role: "Head of Examinations",
      institution: "Delhi Technical University",
      avatar: "PS"
    },
    {
      quote: "The interface is intuitive and students find it easy to use. Violation tracking has reduced cheating by 95%.",
      author: "Prof. Rajesh Kumar",
      role: "Computer Science Department",
      institution: "IIT Bombay",
      avatar: "RK"
    },
    {
      quote: "Excellent support team and regular updates. This is the most reliable proctoring solution we've used.",
      author: "Dr. Anita Desai",
      role: "Dean of Academics",
      institution: "BITS Pilani",
      avatar: "AD"
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      <ThreeDBackground />
      
      {/* Header/Nav */}
      <header className="relative z-10 py-4 px-4 md:px-8 sticky top-0 backdrop-blur-xl bg-background/80 border-b border-primary/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div 
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent">
                Pariksha Protector
              </h1>
              <p className="text-[10px] text-muted-foreground -mt-1">Secure Exam Platform</p>
            </div>
          </motion.div>
          
          <motion.nav 
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Button 
              variant="ghost" 
              size="sm"
              className="hidden md:inline-flex"
              onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
            >
              Features
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className="hidden md:inline-flex"
              onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })}
            >
              About
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className="hidden md:inline-flex"
              onClick={() => navigate("/developers")}
            >
              Team
            </Button>
            <Button 
              onClick={() => navigate("/login")}
              className="bg-gradient-to-r from-primary to-violet-500 hover:opacity-90"
            >
              Sign In
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.nav>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="relative z-10 pt-16 pb-24 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
            >
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">AI-Powered Examination System</span>
            </motion.div>
            
            <motion.h1 
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              The Future of{" "}
              <span className="bg-gradient-to-r from-primary via-violet-400 to-purple-500 bg-clip-text text-transparent">
                Secure Online
              </span>{" "}
              Examinations
            </motion.h1>
            
            <motion.p 
              className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Ensure academic integrity with our advanced AI proctoring, real-time monitoring, 
              and comprehensive analytics. Trusted by 200+ institutions worldwide.
            </motion.p>
            
            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-primary to-violet-500 hover:opacity-90 shadow-lg shadow-primary/25 h-12 px-8"
                onClick={() => navigate("/login")}
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="h-12 px-8 border-primary/20 hover:bg-primary/5"
                onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
              >
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              className="mt-10 pt-8 border-t border-primary/10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <p className="text-sm text-muted-foreground mb-4">Trusted by leading institutions</p>
              <div className="flex flex-wrap gap-6 items-center opacity-60">
                <span className="font-semibold text-lg">IIT Delhi</span>
                <span className="font-semibold text-lg">BITS Pilani</span>
                <span className="font-semibold text-lg">NIT Trichy</span>
                <span className="font-semibold text-lg">DTU</span>
              </div>
            </motion.div>
          </motion.div>
          
          {/* Hero Visual */}
          <motion.div
            className="hidden lg:block relative"
            initial={{ opacity: 0, scale: 0.8, rotateY: -15 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <div className="relative">
              {/* Main card */}
              <div className="relative h-[450px] w-full bg-gradient-to-br from-card/90 to-card/50 rounded-3xl backdrop-blur-xl border border-primary/20 shadow-2xl shadow-primary/10 overflow-hidden">
                {/* Mock dashboard header */}
                <div className="p-4 border-b border-primary/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500" />
                    <div className="h-3 w-3 rounded-full bg-yellow-500" />
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                  </div>
                  <div className="text-xs text-muted-foreground">Live Monitoring Dashboard</div>
                </div>
                
                {/* Mock content */}
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3].map((i) => (
                      <motion.div
                        key={i}
                        className="aspect-video rounded-lg bg-gradient-to-br from-primary/20 to-violet-500/20 flex items-center justify-center"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                      >
                        <Monitor className="h-8 w-8 text-primary/40" />
                      </motion.div>
                    ))}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="h-3 w-full rounded bg-primary/20" />
                    <div className="h-3 w-3/4 rounded bg-primary/10" />
                    <div className="h-3 w-1/2 rounded bg-primary/10" />
                  </div>
                  
                  <div className="flex gap-2">
                    <div className="flex-1 h-20 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                      <Check className="h-8 w-8 text-emerald-500" />
                    </div>
                    <div className="flex-1 h-20 rounded-lg bg-primary/20 flex items-center justify-center">
                      <BarChart3 className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating elements */}
              <motion.div
                className="absolute -top-4 -right-4 px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-medium shadow-lg"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Check className="inline h-4 w-4 mr-1" />
                Exam Secure
              </motion.div>
              
              <motion.div
                className="absolute -bottom-4 -left-4 px-4 py-2 rounded-xl bg-card border border-primary/20 shadow-lg"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 3.5, repeat: Infinity }}
              >
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center text-white text-xs font-bold">
                    42
                  </div>
                  <div>
                    <p className="text-xs font-medium">Students Online</p>
                    <p className="text-[10px] text-muted-foreground">0 violations detected</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-16 px-4 md:px-8 border-y border-primary/10 bg-card/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10 text-primary mb-3">
                  {stat.icon}
                </div>
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      
      {/* Features Section */}
      <section id="features" className="relative z-10 py-24 px-4 md:px-8 max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Features
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything You Need for{" "}
            <span className="bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent">
              Secure Exams
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comprehensive tools designed to maintain academic integrity while providing a seamless experience for students and faculty.
          </p>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
            >
              <Card className="h-full bg-card/50 backdrop-blur-sm border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 group">
                <CardHeader>
                  <div className={`inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br ${feature.color} text-white mb-4 group-hover:scale-110 transition-transform`}>
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>
      
      {/* About/Tabs Section */}
      <section id="about" className="relative z-10 py-24 px-4 md:px-8 bg-card/30 backdrop-blur-sm border-y border-primary/10">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Platform Overview
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Designed for Everyone
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Whether you're faculty managing exams or students taking them, our platform provides the tools you need.
            </p>
          </motion.div>
          
          <Tabs 
            defaultValue={activeTab} 
            onValueChange={setActiveTab}
            className="w-full max-w-4xl mx-auto"
          >
            <TabsList className="grid grid-cols-3 mb-8 h-12 bg-muted/50">
              <TabsTrigger value="features" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                <Zap className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="faculty" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                <Users className="h-4 w-4 mr-2" />
                For Faculty
              </TabsTrigger>
              <TabsTrigger value="students" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                <GraduationCap className="h-4 w-4 mr-2" />
                For Students
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="features">
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
                  <CardHeader>
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white mb-2">
                      <Monitor className="h-6 w-6" />
                    </div>
                    <CardTitle>Real-Time Dashboard</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Monitor all active exams from a single dashboard with live student feeds, violation alerts, and instant notifications.
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
                  <CardHeader>
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white mb-2">
                      <Award className="h-6 w-6" />
                    </div>
                    <CardTitle>Automated Grading</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Save hours with automatic grading for MCQs and true/false questions. AI-assisted evaluation for subjective answers.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
            
            <TabsContent value="faculty">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      Faculty Features
                    </CardTitle>
                    <CardDescription>Everything you need to create and manage secure examinations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-4">
                      {[
                        "Create multiple question types: MCQ, true/false, short answer, and essay",
                        "Set flexible time limits, date windows, and attempt restrictions",
                        "Monitor students in real-time with webcam and screen capture",
                        "Receive instant alerts for suspicious behavior or violations",
                        "Generate detailed reports with integrity scores and analytics",
                        "Export results in multiple formats (CSV, PDF, Excel)"
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <div className="h-6 w-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="h-4 w-4 text-emerald-500" />
                          </div>
                          <span className="text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
            
            <TabsContent value="students">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-primary" />
                      Student Experience
                    </CardTitle>
                    <CardDescription>A seamless and stress-free examination experience</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-4">
                      {[
                        "Clean, intuitive interface that's easy to navigate",
                        "Clear instructions and question-by-question navigation",
                        "Real-time timer with warnings as time runs low",
                        "Auto-save functionality to prevent data loss",
                        "Flag questions for review before final submission",
                        "Instant results for objective questions after submission"
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <div className="h-6 w-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="h-4 w-4 text-emerald-500" />
                          </div>
                          <span className="text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative z-10 py-24 px-4 md:px-8 max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Testimonials
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Loved by Educators{" "}
            <span className="bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent">
              Everywhere
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See what academic leaders are saying about Pariksha Protector.
          </p>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {testimonials.map((testimonial, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="h-full bg-card/50 backdrop-blur-sm border-primary/10 hover:border-primary/30 transition-all">
                <CardContent className="pt-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6 italic">
                    "{testimonial.quote}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center text-white font-bold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-semibold">{testimonial.author}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      <p className="text-xs text-primary">{testimonial.institution}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>
      
      {/* CTA Section */}
      <section className="relative z-10 py-24 px-4 md:px-8">
        <motion.div 
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="relative p-12 rounded-3xl bg-gradient-to-br from-primary/20 via-violet-500/20 to-purple-500/20 backdrop-blur-sm border border-primary/20 overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/30 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500/30 rounded-full blur-3xl" />
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Transform Your Examinations?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                Join hundreds of institutions already using Pariksha Protector for secure, reliable online examinations.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-primary to-violet-500 hover:opacity-90 shadow-lg h-12 px-8"
                  onClick={() => navigate("/login")}
                >
                  Get Started Now
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="h-12 px-8 border-primary/30 hover:bg-primary/10"
                >
                  Schedule Demo
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
      
      {/* Footer */}
      <footer className="relative z-10 py-12 px-4 md:px-8 border-t border-primary/10 bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center">
                  <ShieldCheck className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Pariksha Protector</h3>
                  <p className="text-xs text-muted-foreground">Secure Exam Platform</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground max-w-sm">
                The most trusted AI-powered proctoring solution for educational institutions worldwide.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Updates</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">About</a></li>
                <li>
                  <button 
                    onClick={() => navigate("/developers")}
                    className="hover:text-primary transition-colors"
                  >
                    Team
                  </button>
                </li>
                <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-primary/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Pariksha Protector. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;