import ThreeDBackground from "@/components/3d/ThreeDBackground";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useAuth, UserRole } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { Eye, EyeOff, GraduationCap, IdCard, Loader2, Lock, Mail, Shield, User } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("faculty");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { toast } = useToast();
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!identifier || !password) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields to continue",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const success = await login(identifier, password, role);
      
      if (success) {
        toast({
          title: "Welcome back! 🎉",
          description: `Successfully signed in as ${role}`,
        });
        
        if (role === "faculty") {
          navigate("/faculty-dashboard");
        } else if (role === "student") {
          navigate("/student-dashboard");
        } else if (role === "admin") {
          navigate("/admin");
        }
      } else {
        toast({
          title: "Authentication Failed",
          description: "Invalid credentials. Please check and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Unable to connect. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPlaceholder = () => {
    if (role === "faculty") return "DBUUF001 or email";
    if (role === "student") return "22BTCSE0200 or email";
    return "admin@pariksha.edu";
  };

  const getCredentialText = () => {
    if (role === "faculty") return "ERP ID or Email";
    if (role === "student") return "ERP ID or Email";
    return "Email Address";
  };

  const getInputIcon = () => {
    if (role === "admin") return <Mail className="h-4 w-4 text-muted-foreground" />;
    return <IdCard className="h-4 w-4 text-muted-foreground" />;
  };

  const getRoleIcon = () => {
    if (role === "faculty") return <User className="h-5 w-5" />;
    if (role === "student") return <GraduationCap className="h-5 w-5" />;
    return <Shield className="h-5 w-5" />;
  };

  const getRoleColor = () => {
    if (role === "faculty") return "from-blue-500 to-cyan-500";
    if (role === "student") return "from-emerald-500 to-teal-500";
    return "from-purple-500 to-pink-500";
  };

  const showDemoCredentials = () => {
    if (role === "faculty") {
      setIdentifier("DBUUF001");
      setPassword("123456");
      toast({
        title: "Demo Credentials Applied",
        description: "ERP ID: DBUUF001, Password: 123456",
      });
    } else if (role === "student") {
      setIdentifier("22BTCSE0200");
      setPassword("24042004");
      toast({
        title: "Demo Credentials Applied",
        description: "ERP ID: 22BTCSE0200, Password: 24042004",
      });
    } else {
      setIdentifier("admin@pariksha.edu");
      setPassword("admin123");
      toast({
        title: "Demo Credentials Applied",
        description: "Email: admin@pariksha.edu, Password: admin123",
      });
    }
  };

  const renderLoginForm = (roleType: UserRole) => (
    <form onSubmit={handleLogin}>
      <CardContent className="space-y-5 pt-4">
        {/* Role indicator */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r ${getRoleColor()} bg-opacity-10 border border-primary/10`}
        >
          <div className={`p-2 rounded-full bg-gradient-to-r ${getRoleColor()} text-white`}>
            {getRoleIcon()}
          </div>
          <div>
            <p className="text-sm font-medium capitalize">{roleType} Login</p>
            <p className="text-xs text-muted-foreground">
              {roleType === "faculty" && "Access exam management & monitoring"}
              {roleType === "student" && "Take exams & view results"}
              {roleType === "admin" && "System administration & settings"}
            </p>
          </div>
        </motion.div>

        {/* Identifier field */}
        <div className="space-y-2">
          <Label htmlFor={`${roleType}-identifier`} className="text-sm font-medium">
            {getCredentialText()}
          </Label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              {getInputIcon()}
            </div>
            <Input
              id={`${roleType}-identifier`}
              placeholder={getPlaceholder()}
              type={roleType === "admin" ? "email" : "text"}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              disabled={isLoading}
              required
              className="pl-10 h-11 transition-all focus:ring-2 focus:ring-primary/20"
              autoComplete={roleType === "admin" ? "email" : "username"}
            />
          </div>
        </div>

        {/* Password field */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor={`${roleType}-password`} className="text-sm font-medium">
              Password
            </Label>
            <button 
              type="button"
              className="text-xs text-primary hover:text-primary/80 hover:underline transition-colors font-medium"
              onClick={(e) => {
                e.preventDefault();
                showDemoCredentials();
              }}
            >
              Use Demo Credentials
            </button>
          </div>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <Lock className="h-4 w-4 text-muted-foreground" />
            </div>
            <Input
              id={`${roleType}-password`}
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              disabled={isLoading}
              required
              className="pl-10 pr-10 h-11 transition-all focus:ring-2 focus:ring-primary/20"
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Remember me & Forgot password */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id={`${roleType}-remember`}
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked as boolean)}
            />
            <label
              htmlFor={`${roleType}-remember`}
              className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
            >
              Remember me
            </label>
          </div>
          <button
            type="button"
            className="text-sm text-primary hover:text-primary/80 hover:underline transition-colors"
            onClick={() => toast({ title: "Password Reset", description: "Contact your administrator to reset password." })}
          >
            Forgot password?
          </button>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-4 pb-6">
        <Button 
          type="submit" 
          className={`w-full h-11 font-medium bg-gradient-to-r ${getRoleColor()} hover:opacity-90 transition-all shadow-lg shadow-primary/25`}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              {getRoleIcon()}
              <span className="ml-2">Sign in as {roleType}</span>
            </>
          )}
        </Button>
        
        <p className="text-xs text-center text-muted-foreground">
          By signing in, you agree to our{" "}
          <a href="#" className="text-primary hover:underline">Terms of Service</a>
          {" "}and{" "}
          <a href="#" className="text-primary hover:underline">Privacy Policy</a>
        </p>
      </CardFooter>
    </form>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 overflow-hidden">
      <ThreeDBackground />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="z-10 w-full max-w-md"
      >
        <Card className="bg-card/90 backdrop-blur-xl border-primary/10 shadow-2xl shadow-black/10">
          <CardHeader className="space-y-3 text-center pb-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg"
            >
              <Shield className="w-8 h-8 text-white" />
            </motion.div>
            <div>
              <CardTitle className="text-2xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                Pariksha Protector
              </CardTitle>
              <CardDescription className="text-sm mt-1">
                Secure examination monitoring system
              </CardDescription>
            </div>
          </CardHeader>
          
          <Tabs 
            defaultValue="faculty" 
            onValueChange={(value) => {
              setRole(value as UserRole);
              setIdentifier("");
              setPassword("");
            }}
            className="mt-2"
          >
            <TabsList className="grid grid-cols-3 mx-6 h-11 bg-muted/50">
              <TabsTrigger 
                value="faculty" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white transition-all"
              >
                <User className="w-4 h-4 mr-1.5" />
                Faculty
              </TabsTrigger>
              <TabsTrigger 
                value="student"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white transition-all"
              >
                <GraduationCap className="w-4 h-4 mr-1.5" />
                Student
              </TabsTrigger>
              <TabsTrigger 
                value="admin"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white transition-all"
              >
                <Shield className="w-4 h-4 mr-1.5" />
                Admin
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="faculty" className="mt-0">
              {renderLoginForm("faculty")}
            </TabsContent>
            
            <TabsContent value="student" className="mt-0">
              {renderLoginForm("student")}
            </TabsContent>
            
            <TabsContent value="admin" className="mt-0">
              {renderLoginForm("admin")}
            </TabsContent>
          </Tabs>
        </Card>

        {/* Footer branding */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs text-muted-foreground mt-6"
        >
          © 2025 Pariksha Protector. Secure & Reliable Examination System.
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Login;