import ThreeDBackground from "@/components/3d/ThreeDBackground";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Code2,
  Coffee,
  ExternalLink,
  Github,
  Heart,
  Lightbulb,
  Linkedin,
  Mail,
  Rocket,
  ShieldCheck,
  Sparkles,
  Target,
  Users
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Developers = () => {
  const navigate = useNavigate();

  const teamMembers = [
    {
      name: "Anshul",
      role: "Full Stack Developer",
      image: "https://media.licdn.com/dms/image/v2/D5603AQGAhRojdFVoPQ/profile-displayphoto-scale_200_200/B56ZflCP5LGoAY-/0/1751894263400?e=1766016000&v=beta&t=bzq6gumZPPjMz7o_OCw0bH6NCp27vGCnUgs0p7bRwjs",
      bio: "Passionate about building scalable applications and crafting exceptional user experiences. Specializes in React, Node.js, and cloud architecture.",
      skills: ["React", "TypeScript", "Node.js", "Python", "AWS"],
      color: "from-blue-500 to-cyan-500",
      linkedin: "https://linkedin.com/in/anshul",
      github: "https://github.com/anshul",
      email: "anshul@pariksha.edu"
    },
    {
      name: "Ishika Saxena",
      role: "UI/UX Designer & Developer",
      image: "https://media.licdn.com/dms/image/v2/D5603AQHWE2DpNCRHwQ/profile-displayphoto-shrink_200_200/B56ZeXWRagHUAg-/0/1750590888794?e=1766016000&v=beta&t=LvKbvq1hp3JVtP6gvUe99nDK9Oy-_mXu-HcmDgY_GG4",
      bio: "Creative designer with a keen eye for detail. Transforms complex ideas into intuitive, beautiful interfaces that users love.",
      skills: ["Figma", "React", "Tailwind CSS", "Framer Motion", "UI/UX"],
      color: "from-purple-500 to-pink-500",
      linkedin: "https://linkedin.com/in/ishika-saxena",
      github: "https://github.com/ishika-saxena",
      email: "ishika@pariksha.edu"
    },
  ];

  const values = [
    {
      icon: <Target className="h-6 w-6" />,
      title: "Mission Driven",
      description: "We're committed to ensuring academic integrity through innovative technology."
    },
    {
      icon: <Lightbulb className="h-6 w-6" />,
      title: "Innovation First",
      description: "Constantly pushing boundaries with AI and cutting-edge solutions."
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "User Centric",
      description: "Every feature is designed with students and faculty in mind."
    },
    {
      icon: <Heart className="h-6 w-6" />,
      title: "Passion for Education",
      description: "We believe technology should empower, not complicate learning."
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      <ThreeDBackground />
      
      {/* Header */}
      <header className="relative z-10 py-4 px-4 md:px-8 sticky top-0 backdrop-blur-xl bg-background/80 border-b border-primary/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div 
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate("/")}
              className="mr-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent">
                Pariksha Protector
              </h1>
              <p className="text-[10px] text-muted-foreground -mt-1">Meet the Team</p>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Button 
              onClick={() => navigate("/login")}
              className="bg-gradient-to-r from-primary to-violet-500 hover:opacity-90"
            >
              Sign In
            </Button>
          </motion.div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-16 pb-12 px-4 md:px-8 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
          >
            <Code2 className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">The Minds Behind Pariksha</span>
          </motion.div>
          
          <motion.h1 
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Meet Our{" "}
            <span className="bg-gradient-to-r from-primary via-violet-400 to-purple-500 bg-clip-text text-transparent">
              Development Team
            </span>
          </motion.h1>
          
          <motion.p 
            className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            A passionate team of developers and designers dedicated to revolutionizing 
            online examinations with cutting-edge technology and thoughtful design.
          </motion.p>
        </motion.div>
      </section>

      {/* Team Members Section */}
      <section className="relative z-10 py-16 px-4 md:px-8 max-w-7xl mx-auto">
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {teamMembers.map((member, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
            >
              <Card className="h-full bg-card/60 backdrop-blur-xl border-primary/10 hover:border-primary/30 transition-all duration-500 overflow-hidden group">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    {/* Image Section */}
                    <div className="relative md:w-1/3 flex-shrink-0">
                      <div className={`absolute inset-0 bg-gradient-to-br ${member.color} opacity-20`} />
                      <div className="p-6 md:p-8 flex items-center justify-center">
                        <motion.div
                          className="relative"
                          whileHover={{ scale: 1.05 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <div className={`absolute -inset-2 bg-gradient-to-br ${member.color} rounded-full blur-lg opacity-40 group-hover:opacity-60 transition-opacity`} />
                          <img
                            src={member.image}
                            alt={member.name}
                            className="relative w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-white/20 shadow-2xl"
                          />
                          <motion.div
                            className={`absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-gradient-to-br ${member.color} flex items-center justify-center shadow-lg`}
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <Sparkles className="h-5 w-5 text-white" />
                          </motion.div>
                        </motion.div>
                      </div>
                    </div>
                    
                    {/* Content Section */}
                    <div className="flex-1 p-6 md:p-8">
                      <div className="mb-4">
                        <h3 className="text-2xl font-bold mb-1">{member.name}</h3>
                        <p className={`text-sm font-medium bg-gradient-to-r ${member.color} bg-clip-text text-transparent`}>
                          {member.role}
                        </p>
                      </div>
                      
                      <p className="text-muted-foreground mb-6 leading-relaxed">
                        {member.bio}
                      </p>
                      
                      {/* Skills */}
                      <div className="mb-6">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Expertise</p>
                        <div className="flex flex-wrap gap-2">
                          {member.skills.map((skill, i) => (
                            <span
                              key={i}
                              className={`px-3 py-1 text-xs font-medium rounded-full bg-gradient-to-r ${member.color} bg-opacity-10 border border-primary/20`}
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      {/* Social Links */}
                      <div className="flex items-center gap-3">
                        <motion.a
                          href={member.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Linkedin className="h-5 w-5" />
                        </motion.a>
                        <motion.a
                          href={member.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Github className="h-5 w-5" />
                        </motion.a>
                        <motion.a
                          href={`mailto:${member.email}`}
                          className="p-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Mail className="h-5 w-5" />
                        </motion.a>
                        <motion.a
                          href={member.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-auto flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                          whileHover={{ x: 5 }}
                        >
                          View Profile
                          <ExternalLink className="h-4 w-4" />
                        </motion.a>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Values Section */}
      <section className="relative z-10 py-20 px-4 md:px-8 bg-card/30 backdrop-blur-sm border-y border-primary/10">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Our Values
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What Drives Us{" "}
              <span className="bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent">
                Every Day
              </span>
            </h2>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {values.map((value, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
              >
                <Card className="h-full bg-card/50 backdrop-blur-sm border-primary/10 hover:border-primary/30 transition-all text-center group">
                  <CardContent className="pt-8 pb-6">
                    <motion.div
                      className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-violet-500 text-white mb-4 group-hover:scale-110 transition-transform"
                      whileHover={{ rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      {value.icon}
                    </motion.div>
                    <h3 className="text-lg font-semibold mb-2">{value.title}</h3>
                    <p className="text-sm text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Fun Stats Section */}
      <section className="relative z-10 py-20 px-4 md:px-8 max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Behind the Scenes
          </span>
          <h2 className="text-3xl md:text-4xl font-bold">
            Building Pariksha Protector
          </h2>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {[
            { icon: <Coffee className="h-6 w-6" />, value: "500+", label: "Cups of Coffee" },
            { icon: <Code2 className="h-6 w-6" />, value: "50K+", label: "Lines of Code" },
            { icon: <Rocket className="h-6 w-6" />, value: "100+", label: "Features Shipped" },
            { icon: <Heart className="h-6 w-6" />, value: "∞", label: "Passion & Dedication" },
          ].map((stat, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="text-center"
            >
              <motion.div
                className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10 text-primary mb-3"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                {stat.icon}
              </motion.div>
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Join Us CTA */}
      <section className="relative z-10 py-20 px-4 md:px-8">
        <motion.div 
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="relative p-12 rounded-3xl bg-gradient-to-br from-primary/20 via-violet-500/20 to-purple-500/20 backdrop-blur-sm border border-primary/20 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/30 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500/30 rounded-full blur-3xl" />
            
            <div className="relative z-10">
              <motion.div
                className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-violet-500 text-white mb-6 mx-auto"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <Rocket className="h-8 w-8" />
              </motion.div>
              
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Want to Join Our Team?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                We're always looking for talented individuals passionate about education technology. 
                Let's build the future of secure examinations together.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-primary to-violet-500 hover:opacity-90 shadow-lg h-12 px-8"
                >
                  <Mail className="mr-2 h-5 w-5" />
                  Get in Touch
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="h-12 px-8 border-primary/30 hover:bg-primary/10"
                  onClick={() => navigate("/")}
                >
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  Back to Home
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-8 px-4 md:px-8 border-t border-primary/10 bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center">
              <ShieldCheck className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold">Pariksha Protector</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Pariksha Protector. Built with <Heart className="inline h-4 w-4 text-red-500 mx-1" /> by our amazing team.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Developers;