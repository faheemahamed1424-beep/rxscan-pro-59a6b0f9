import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Stethoscope, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { PageTransition } from "@/components/PageTransition";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <PageTransition>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          {/* Logo Section */}
          <motion.div
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm mb-4">
              <Stethoscope className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">Rx Scanner</h1>
            <p className="text-white/80 mt-2">Your prescription companion</p>
          </motion.div>

          {/* Glass Card Form */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="glass-card rounded-3xl p-8"
          >
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-medical pl-12"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-medical pl-12 pr-12"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-border" />
                  <span className="text-muted-foreground">Remember me</span>
                </label>
                <a href="#" className="text-primary hover:underline">
                  Forgot password?
                </a>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full btn-gradient text-lg"
              >
                Login
              </motion.button>
            </form>

            <div className="mt-6 text-center">
              <span className="text-muted-foreground">New user? </span>
              <a href="#" className="text-primary font-medium hover:underline">
                Create an account
              </a>
            </div>
          </motion.div>

          {/* Bottom Pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center gap-2 mt-8"
          >
            <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs backdrop-blur-sm">
              🔒 Secure
            </span>
            <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs backdrop-blur-sm">
              ⚡ Fast
            </span>
            <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs backdrop-blur-sm">
              💊 Trusted
            </span>
          </motion.div>
        </motion.div>
      </PageTransition>
    </div>
  );
};

export default Login;
