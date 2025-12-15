"use client"

import type React from "react"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ThemeToggle } from "@/components/theme-toggle"
import { useToast } from "@/hooks/use-toast"
import { useAuth, getRedirectPath } from "@/contexts/auth-context"
import { SignupRole } from "@/lib/auth-api"
import { ApiError } from "@/lib/api-client"
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowRight,
  Stethoscope,
  Users,
  Building2,
  Heart,
  ChevronLeft,
} from "lucide-react"
import { cn } from "@/lib/utils"

type AuthMode = "login" | "register"
type UserRoleType = "patient" | "nurse" | "doctor" | "admin"

const roles: { id: UserRoleType; label: string; icon: React.ReactNode; description: string }[] = [
  { id: "patient", label: "Patient", icon: <Heart className="w-6 h-6" />, description: "Get care in your language" },
  { id: "nurse", label: "Nurse", icon: <Users className="w-6 h-6" />, description: "Manage patient triage" },
  { id: "doctor", label: "Doctor", icon: <Stethoscope className="w-6 h-6" />, description: "Review & verify cases" },
  {
    id: "admin",
    label: "Hospital Admin",
    icon: <Building2 className="w-6 h-6" />,
    description: "Manage your facility",
  },
]

function AuthContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  const { login, signup, isAuthenticated, user, isLoading: authLoading } = useAuth()

  const [mode, setMode] = useState<AuthMode>("login")
  const [selectedRole, setSelectedRole] = useState<UserRoleType | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  useEffect(() => {
    setMounted(true)
    const modeParam = searchParams.get("mode")
    if (modeParam === "register") {
      setMode("register")
    }

    // Check if redirected due to session expiry
    const expired = searchParams.get("expired")
    if (expired === "true") {
      toast({
        variant: "destructive",
        title: "Session Expired",
        description: "Your session has expired. Please log in again.",
      })
      // Clean up the URL
      window.history.replaceState({}, '', '/auth')
    }
  }, [searchParams, toast])

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const redirectPath = getRedirectPath(user)
      router.push(redirectPath)
    }
  }, [isAuthenticated, user, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({
      ...prev,
      [id]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (mode === "login") {
        await login({
          email: formData.email,
          password: formData.password,
        })

        toast({
          title: "Welcome back!",
          description: "You have successfully logged in.",
        })
        // Redirect will happen automatically via useEffect
      } else {
        // Register
        if (formData.password !== formData.confirmPassword) {
          toast({
            variant: "destructive",
            title: "Passwords don't match",
            description: "Please make sure your passwords match.",
          })
          setIsLoading(false)
          return
        }

        await signup({
          full_name: formData.fullName,
          email: formData.email,
          password: formData.password,
          password_confirm: formData.confirmPassword,
          role: selectedRole as SignupRole,
        })

        toast({
          title: "Account created!",
          description: "Please check your email to verify your account.",
        })

        // Redirect to verification page with email
        const encodedEmail = encodeURIComponent(formData.email)
        router.push(`/auth/verify?email=${encodedEmail}`)
      }
    } catch (err) {
      if (err instanceof ApiError) {
        toast({
          variant: "destructive",
          title: mode === "login" ? "Login failed" : "Registration failed",
          description: err.message,
        })
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-accent">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          {/* Morphing blobs */}
          <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl animate-morph" />
          <div
            className="absolute bottom-1/4 -right-20 w-[400px] h-[400px] bg-accent/30 rounded-full blur-3xl animate-morph"
            style={{ animationDelay: "4s" }}
          />

          {/* Floating orbs */}
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 bg-white/30 rounded-full animate-float"
              style={{
                top: `${20 + i * 15}%`,
                left: `${10 + i * 12}%`,
                animationDelay: `${i * 0.5}s`,
              }}
            />
          ))}

          {/* Grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16 py-12">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 mb-16 group">
            <div className="relative">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <span className="text-white font-bold text-2xl">K</span>
              </div>
            </div>
            <span className="text-3xl font-bold text-white">Kliniq</span>
          </Link>

          {/* Tagline */}
          <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6">
            Healthcare that
            <br />
            <span className="text-white/80">speaks your language</span>
          </h1>

          <p className="text-lg text-white/70 max-w-md leading-relaxed mb-12">
            Join thousands of healthcare providers and patients across Africa bridging the communication gap with
            AI-powered multilingual support.
          </p>

          {/* Feature highlights */}
          <div className="space-y-6">
            {[
              { label: "20+ African Languages", value: "Supported" },
              { label: "Real-time Translation", value: "<1 second" },
              { label: "Healthcare Providers", value: "500+" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
                </div>
                <div>
                  <p className="text-white font-medium">{item.label}</p>
                  <p className="text-white/60 text-sm">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex-1 flex flex-col bg-background">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-6 border-b border-border/50">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
              <span className="text-primary-foreground font-bold">K</span>
            </div>
            <span className="text-xl font-bold">Kliniq</span>
          </Link>
          <ThemeToggle />
        </div>

        {/* Desktop Theme Toggle */}
        <div className="hidden lg:flex justify-end p-6">
          <ThemeToggle />
        </div>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            <AnimatePresence mode="wait">
              {mode === "register" && !selectedRole ? (
                // Role Selection
                <motion.div
                  key="role-selection"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-foreground mb-3">Join Kliniq</h2>
                    <p className="text-muted-foreground">Select your role to get started</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    {roles.map((role) => (
                      <button
                        key={role.id}
                        onClick={() => setSelectedRole(role.id)}
                        className={cn(
                          "relative group p-6 rounded-2xl border-2 transition-all duration-300 text-left",
                          "hover:border-primary hover:bg-primary/5",
                          "border-border bg-card",
                        )}
                      >
                        {/* Hover glow effect */}
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        <div className="relative z-10">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform duration-300">
                            {role.icon}
                          </div>
                          <h3 className="font-semibold text-foreground mb-1">{role.label}</h3>
                          <p className="text-xs text-muted-foreground">{role.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>

                  <p className="text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <button
                      onClick={() => setMode("login")}
                      className="text-primary hover:text-primary/80 font-medium transition-colors"
                    >
                      Sign in
                    </button>
                  </p>
                </motion.div>
              ) : (
                // Login / Register Form
                <motion.div
                  key="auth-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Back button for register */}
                  {mode === "register" && selectedRole && (
                    <button
                      onClick={() => setSelectedRole(null)}
                      className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span className="text-sm">Change role</span>
                    </button>
                  )}

                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-foreground mb-3">
                      {mode === "login"
                        ? "Welcome back"
                        : `Register as ${roles.find((r) => r.id === selectedRole)?.label}`}
                    </h2>
                    <p className="text-muted-foreground">
                      {mode === "login"
                        ? "Sign in to continue to your dashboard"
                        : "Create your account to get started"}
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    {mode === "register" && (
                      <div className="space-y-2">
                        <Label htmlFor="fullName" className="text-foreground">
                          Full Name
                        </Label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            id="fullName"
                            type="text"
                            placeholder="Enter your full name"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            className="pl-12 h-12 bg-secondary/30 border-border/50 rounded-xl focus:border-primary focus:ring-primary/20 transition-all duration-300"
                            required
                          />
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-foreground">
                        Email Address
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="pl-12 h-12 bg-secondary/30 border-border/50 rounded-xl focus:border-primary focus:ring-primary/20 transition-all duration-300"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password" className="text-foreground">
                          Password
                        </Label>
                        {mode === "login" && (
                          <Link
                            href="/auth/forgot-password"
                            className="text-sm text-primary hover:text-primary/80 transition-colors"
                          >
                            Forgot password?
                          </Link>
                        )}
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className="pl-12 pr-12 h-12 bg-secondary/30 border-border/50 rounded-xl focus:border-primary focus:ring-primary/20 transition-all duration-300"
                          required
                          minLength={8}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {mode === "register" && (
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-foreground">
                          Confirm Password
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            id="confirmPassword"
                            type={showPassword ? "text" : "password"}
                            placeholder="Confirm your password"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            className="pl-12 h-12 bg-secondary/30 border-border/50 rounded-xl focus:border-primary focus:ring-primary/20 transition-all duration-300"
                            required
                            minLength={8}
                          />
                        </div>
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={isLoading || authLoading}
                      className="relative w-full h-12 text-base font-medium overflow-hidden group bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 rounded-xl"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {isLoading || authLoading ? (
                          <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        ) : (
                          <>
                            {mode === "login" ? "Sign In" : "Create Account"}
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                          </>
                        )}
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-accent/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </Button>
                  </form>

                  {/* Divider */}
                  <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border/50" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-4 text-muted-foreground">Or continue with</span>
                    </div>
                  </div>

                  {/* Social Login */}
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      variant="outline"
                      type="button"
                      className="h-12 rounded-xl bg-transparent border-border/50 hover:bg-secondary/50 hover:border-primary/30 transition-all duration-300"
                    >
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Google
                    </Button>
                    <Button
                      variant="outline"
                      type="button"
                      className="h-12 rounded-xl bg-transparent border-border/50 hover:bg-secondary/50 hover:border-primary/30 transition-all duration-300"
                    >
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                      </svg>
                      GitHub
                    </Button>
                  </div>

                  {/* Toggle Auth Mode */}
                  <p className="text-center text-sm text-muted-foreground mt-8">
                    {mode === "login" ? (
                      <>
                        Don&apos;t have an account?{" "}
                        <button
                          onClick={() => {
                            setMode("register")
                            setSelectedRole(null)
                          }}
                          className="text-primary hover:text-primary/80 font-medium transition-colors"
                        >
                          Sign up
                        </button>
                      </>
                    ) : (
                      <>
                        Already have an account?{" "}
                        <button
                          onClick={() => setMode("login")}
                          className="text-primary hover:text-primary/80 font-medium transition-colors"
                        >
                          Sign in
                        </button>
                      </>
                    )}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 text-center text-sm text-muted-foreground border-t border-border/50">
          <p>
            By continuing, you agree to our{" "}
            <Link href="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      }
    >
      <AuthContent />
    </Suspense>
  )
}
