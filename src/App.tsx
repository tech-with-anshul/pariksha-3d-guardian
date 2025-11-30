
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { TestProvider } from "@/context/TestContext";
import Login from "./pages/Login";
import FacultyDashboard from "./pages/FacultyDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import CreateTest from "./pages/CreateTest";
import TakeTest from "./pages/TakeTest";
import EvaluateTest from "./pages/EvaluateTest";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import AdminPanel from "./pages/AdminPanel";
import TestDashboard from "./pages/TestDashboard";
import Developers from "./pages/Developers";
import React from "react";

const App = () => {
  return (
    <React.StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <TestProvider>
            <TooltipProvider>
                <Toaster />
                <Sonner />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/landing" element={<Landing />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/faculty-dashboard" element={<FacultyDashboard />} />
                  <Route path="/student-dashboard" element={<StudentDashboard />} />
                  <Route path="/create-test" element={<CreateTest />} />
                  <Route path="/take-test/:id" element={<TakeTest />} />
                  <Route path="/evaluate-test/:id" element={<EvaluateTest />} />
                  <Route path="/admin" element={<AdminPanel />} />
                  <Route path="/test-dashboard/:id" element={<TestDashboard />} />
                  <Route path="/developers" element={<Developers />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
            </TooltipProvider>
          </TestProvider>
        </AuthProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
};

export default App;
