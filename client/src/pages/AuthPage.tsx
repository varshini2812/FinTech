import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { TrendingUp, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { api } from "@shared/routes";
import { motion } from "framer-motion";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = api.auth.register.input.extend({
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords must match",
  path: ["confirmPassword"],
});

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const { login, register, user } = useAuth();
  const [, setLocation] = useLocation();

  if (user) {
    setLocation("/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row overflow-hidden">
      {/* Left Panel - Visuals */}
      <div className="lg:w-1/2 bg-card relative overflow-hidden flex flex-col justify-between p-12 lg:p-16">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background z-0" />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <TrendingUp className="h-7 w-7 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-2xl tracking-tight text-white">FinTrade</span>
          </div>
          
          <h1 className="font-display text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
            Master the Markets <br />
            <span className="text-primary">Without the Risk.</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-md leading-relaxed">
            Experience a professional-grade trading simulation platform powered by advanced AI market predictions.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-2 gap-6 mt-12">
          <div className="bg-background/40 backdrop-blur-md p-5 rounded-2xl border border-white/5">
            <ShieldCheck className="h-8 w-8 text-primary mb-4" />
            <h3 className="font-bold text-white mb-1">Risk-Free Environment</h3>
            <p className="text-sm text-muted-foreground">Trade with $100k virtual currency.</p>
          </div>
          <div className="bg-background/40 backdrop-blur-md p-5 rounded-2xl border border-white/5">
            <Zap className="h-8 w-8 text-blue-400 mb-4" />
            <h3 className="font-bold text-white mb-1">Real-time Data</h3>
            <p className="text-sm text-muted-foreground">Live market simulation engine.</p>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="font-display text-3xl font-bold text-white">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {isLogin 
                ? "Enter your credentials to access your terminal." 
                : "Start your journey with $100,000 in virtual funds."}
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            key={isLogin ? 'login' : 'register'}
            className="bg-card p-8 rounded-2xl border border-border shadow-2xl"
          >
            {isLogin ? (
              <LoginForm 
                onSubmit={(data) => login.mutate(data)} 
                isLoading={login.isPending} 
              />
            ) : (
              <RegisterForm 
                onSubmit={(data) => register.mutate(data)} 
                isLoading={register.isPending} 
              />
            )}
            
            <div className="mt-6 text-center">
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function LoginForm({ onSubmit, isLoading }: { onSubmit: (data: any) => void, isLoading: boolean }) {
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">Username</label>
        <input 
          {...form.register("username")}
          className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
          placeholder="trader123"
        />
        {form.formState.errors.username && (
          <p className="text-xs text-red-500">{form.formState.errors.username.message}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">Password</label>
        <input 
          {...form.register("password")}
          type="password"
          className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
          placeholder="••••••••"
        />
        {form.formState.errors.password && (
          <p className="text-xs text-red-500">{form.formState.errors.password.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Authenticating..." : (
          <>Sign In <ArrowRight className="h-4 w-4" /></>
        )}
      </button>
    </form>
  );
}

function RegisterForm({ onSubmit, isLoading }: { onSubmit: (data: any) => void, isLoading: boolean }) {
  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Full Name</label>
          <input 
            {...form.register("fullName")}
            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
            placeholder="John Doe"
          />
          {form.formState.errors.fullName && (
            <p className="text-xs text-red-500">{form.formState.errors.fullName.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Username</label>
          <input 
            {...form.register("username")}
            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
            placeholder="trader123"
          />
          {form.formState.errors.username && (
            <p className="text-xs text-red-500">{form.formState.errors.username.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">Email</label>
        <input 
          {...form.register("email")}
          type="email"
          className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
          placeholder="john@example.com"
        />
        {form.formState.errors.email && (
          <p className="text-xs text-red-500">{form.formState.errors.email.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Password</label>
          <input 
            {...form.register("password")}
            type="password"
            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
            placeholder="••••••••"
          />
          {form.formState.errors.password && (
            <p className="text-xs text-red-500">{form.formState.errors.password.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Confirm</label>
          <input 
            {...form.register("confirmPassword")}
            type="password"
            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
            placeholder="••••••••"
          />
          {form.formState.errors.confirmPassword && (
            <p className="text-xs text-red-500">{form.formState.errors.confirmPassword.message}</p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
      >
        {isLoading ? "Creating Account..." : (
          <>Get Started <ArrowRight className="h-4 w-4" /></>
        )}
      </button>
    </form>
  );
}
