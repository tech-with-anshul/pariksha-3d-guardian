
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useTest } from "@/context/TestContext";
import ThreeDBackground from "@/components/3d/ThreeDBackground";
import FloatingShield from "@/components/3d/FloatingShield";
import { LogOut, Shield, Clock, Calendar } from "lucide-react";

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const { tests } = useTest();
  const navigate = useNavigate();

  // Redirect if not authenticated
  useEffect(() => {
    if (!user || user.role !== "student") {
      navigate("/login");
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  // Get only published tests that students can take
  const availableTests = tests.filter(test => test.status === "published");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen p-6">
      <ThreeDBackground />
      
      {/* Top Navigation */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex justify-between items-center mb-8 relative z-10"
      >
        <div className="flex items-center gap-3">
          <div className="h-12 w-12">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Pariksha Protector</h1>
        </div>
        
        <Button variant="ghost" onClick={handleLogout} className="flex items-center gap-2">
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </motion.div>
      
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        {/* Left Column - Profile */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-1"
        >
          <Card className="bg-card/90 backdrop-blur-md border-primary/20 h-full">
            <CardHeader className="pb-2">
              <CardTitle>Student Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center mb-6">
                <div className="w-32 h-32 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                  <div className="text-3xl font-bold">
                    {user.name.split(" ").map(n => n[0]).join("")}
                  </div>
                </div>
                <h3 className="text-xl font-semibold">{user.name}</h3>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-accent">
                  <div className="flex items-center gap-3 mb-3">
                    <Calendar className="h-5 w-5 text-primary" />
                    <h4 className="font-medium">Available Tests</h4>
                  </div>
                  <p className="text-2xl font-bold">{availableTests.length}</p>
                  <p className="text-sm text-muted-foreground">
                    {availableTests.length > 0
                      ? "You have tests available to take"
                      : "No tests available at the moment"}
                  </p>
                </div>
                
                <div className="p-4 rounded-lg bg-accent">
                  <div className="flex items-center gap-3 mb-3">
                    <Clock className="h-5 w-5 text-primary" />
                    <h4 className="font-medium">Test Security</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    When taking a test, the system will monitor your activity to ensure academic integrity.
                  </p>
                </div>
                
                <div className="w-full h-48">
                  <FloatingShield />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Right Column - Available Tests */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <Card className="bg-card/90 backdrop-blur-md border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle>Available Tests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {availableTests.length > 0 ? (
                  availableTests.map((test) => (
                    <div
                      key={test.id}
                      className="p-4 rounded-lg bg-accent hover:bg-accent/80 cursor-pointer transition-colors"
                      onClick={() => navigate(`/take-test/${test.id}`)}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-lg font-medium">{test.title}</h4>
                        <span className="px-3 py-1 bg-primary/20 text-primary text-xs rounded-full">
                          {test.duration} minutes
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {test.subject} • {test.questions.length} Questions
                      </p>
                      <Button className="w-full">
                        Start Test
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <h3 className="text-xl font-medium mb-2">No tests available</h3>
                    <p className="text-muted-foreground">
                      There are no tests available for you at the moment.
                      Check back later.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default StudentDashboard;
