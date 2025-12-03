"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"
import {
  Users,
  Clock,
  ChevronRight,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  Sparkles,
  FileText,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  TrendingUp,
  Star,
  Gift,
  MessageSquare,
  Search,
  MoreVertical,
  Eye,
  UserCheck,
  Clipboard,
  Home,
  Calendar,
  Award,
} from "lucide-react"

type UserRole = "nurse" | "doctor"

interface TriageCase {
  id: string
  patientName: string
  patientId: string
  symptoms: string
  duration: string
  urgency: "low" | "medium" | "high"
  language: string
  submittedAt: string
  status: "pending" | "in-review" | "escalated" | "resolved"
  aiSummary: string
}

interface EscalatedQuery {
  id: string
  patientName: string
  patientId: string
  question: string
  nurseNote?: string
  urgency: "medium" | "high"
  submittedAt: string
  status: "pending" | "answered"
  aiDraft?: string
}

const mockTriageCases: TriageCase[] = [
  {
    id: "T001",
    patientName: "Adebayo Ogundimu",
    patientId: "KLQ-2847",
    symptoms: "Persistent headache, mild fever, fatigue",
    duration: "3 days",
    urgency: "medium",
    language: "Yoruba",
    submittedAt: "10 mins ago",
    status: "pending",
    aiSummary:
      "Patient reports tension-type headache symptoms with low-grade fever. Recommend basic assessment and hydration advice.",
  },
  {
    id: "T002",
    patientName: "Chioma Eze",
    patientId: "KLQ-3921",
    symptoms: "Severe chest pain, difficulty breathing",
    duration: "2 hours",
    urgency: "high",
    language: "Igbo",
    submittedAt: "5 mins ago",
    status: "pending",
    aiSummary:
      "URGENT: Patient describes acute chest pain with dyspnea. Immediate escalation recommended. Possible cardiac event.",
  },
  {
    id: "T003",
    patientName: "Ibrahim Musa",
    patientId: "KLQ-1573",
    symptoms: "Mild cough, runny nose",
    duration: "5 days",
    urgency: "low",
    language: "Hausa",
    submittedAt: "25 mins ago",
    status: "in-review",
    aiSummary: "Common cold symptoms. Recommend symptomatic treatment and rest. No red flags identified.",
  },
  {
    id: "T004",
    patientName: "Funke Adeoye",
    patientId: "KLQ-4482",
    symptoms: "Joint pain in knees and ankles, morning stiffness",
    duration: "2 weeks",
    urgency: "medium",
    language: "Yoruba",
    submittedAt: "1 hour ago",
    status: "pending",
    aiSummary:
      "Arthralgia pattern suggests possible inflammatory arthritis. Recommend scheduling consultation for examination.",
  },
]

const mockEscalatedQueries: EscalatedQuery[] = [
  {
    id: "E001",
    patientName: "Adebayo Ogundimu",
    patientId: "KLQ-2847",
    question: "Can I take the medication with my herbal supplements?",
    nurseNote: "Patient uses traditional agbo regularly. Needs drug interaction guidance.",
    urgency: "medium",
    submittedAt: "15 mins ago",
    status: "pending",
    aiDraft:
      "Based on the prescribed Paracetamol, there are no known interactions with common herbal preparations. However, I recommend spacing them 2 hours apart for optimal absorption.",
  },
  {
    id: "E002",
    patientName: "Chioma Eze",
    patientId: "KLQ-3921",
    question: "My mother's blood pressure reading is 180/110. What should we do?",
    nurseNote: "Elderly patient, history of hypertension. Currently on Amlodipine.",
    urgency: "high",
    submittedAt: "8 mins ago",
    status: "pending",
    aiDraft:
      "This reading indicates hypertensive urgency. Recommend immediate rest, repeat measurement in 15 minutes. If still elevated, advise emergency department visit.",
  },
  {
    id: "E003",
    patientName: "Oluwaseun Bakare",
    patientId: "KLQ-2156",
    question: "Is it normal to feel dizzy after starting the new medication?",
    nurseNote: "Started on Metformin 3 days ago for newly diagnosed T2DM.",
    urgency: "medium",
    submittedAt: "45 mins ago",
    status: "pending",
    aiDraft:
      "Mild dizziness can occur when starting Metformin, especially if blood sugar levels are adjusting. Recommend taking with food and monitoring glucose levels.",
  },
]

const stats = {
  nurse: [
    { label: "Pending Triage", value: 12, icon: Clipboard, trend: "+3 today" },
    { label: "Reviewed Today", value: 28, icon: CheckCircle2, trend: "+8 from yesterday" },
    { label: "Escalated", value: 4, icon: AlertTriangle, trend: "2 urgent" },
    { label: "Avg Response", value: "8m", icon: Clock, trend: "-2m improvement" },
  ],
  doctor: [
    { label: "Pending Queries", value: 7, icon: MessageSquare, trend: "+2 today" },
    { label: "Answered Today", value: 15, icon: CheckCircle2, trend: "+5 from yesterday" },
    { label: "Urgent Cases", value: 2, icon: AlertTriangle, trend: "Action needed" },
    { label: "Avg Response", value: "12m", icon: Clock, trend: "-3m improvement" },
  ],
}

const pointsData = {
  current: 385,
  goal: 500,
  thisMonth: 385,
  lastMonth: 420,
  breakdown: [
    { action: "Triage Verifications", points: 150, count: 30 },
    { action: "Query Responses", points: 180, count: 18 },
    { action: "Note Updates", points: 55, count: 11 },
  ],
}

export default function ClinicianDashboard() {
  const [mounted, setMounted] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [role, setRole] = useState<UserRole>("nurse")
  const [activeFilter, setActiveFilter] = useState<"all" | "pending" | "urgent">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCase, setSelectedCase] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const navItems = [
    { icon: Home, label: "Dashboard", active: true },
    { icon: Users, label: "Patients", badge: role === "nurse" ? 12 : 7 },
    { icon: Calendar, label: "Schedule" },
    { icon: Award, label: "Points", badge: "New" },
    { icon: Settings, label: "Settings" },
  ]

  const filteredCases = mockTriageCases.filter((c) => {
    if (activeFilter === "pending" && c.status !== "pending") return false
    if (activeFilter === "urgent" && c.urgency !== "high") return false
    if (searchQuery && !c.patientName.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const filteredQueries = mockEscalatedQueries.filter((q) => {
    if (activeFilter === "pending" && q.status !== "pending") return false
    if (activeFilter === "urgent" && q.urgency !== "high") return false
    if (searchQuery && !q.patientName.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const urgencyStyles = {
    low: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
    medium: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    high: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 animate-pulse",
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-72 bg-card border-r border-border/50 p-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 mb-8 group">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
            <div className="relative w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">K</span>
            </div>
          </div>
          <span className="text-xl font-bold text-foreground">Kliniq</span>
        </Link>

        {/* Role Switcher */}
        <div className="relative p-1.5 bg-secondary/50 rounded-2xl mb-6">
          <div className="grid grid-cols-2 gap-1">
            {(["nurse", "doctor"] as UserRole[]).map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={cn(
                  "relative px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300",
                  role === r ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {role === r && (
                  <motion.div
                    layoutId="roleIndicator"
                    className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 rounded-xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative capitalize">{r}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Profile Card */}
        <div className="relative p-4 rounded-2xl bg-gradient-to-br from-primary/10 via-card to-accent/5 border border-border/50 mb-8 overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-primary/20 to-transparent rounded-bl-full" />
          <div className="relative flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-lg">
              {role === "nurse" ? "NA" : "DR"}
            </div>
            <div>
              <p className="font-semibold text-foreground">{role === "nurse" ? "Nurse Amaka" : "Dr. Oluwaseun"}</p>
              <p className="text-xs text-muted-foreground">
                {role === "nurse" ? "Triage Specialist" : "General Physician"}
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-muted-foreground">Online</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-primary">
              <Star className="w-3 h-3 fill-primary" />
              <span>{pointsData.current} pts</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.label}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                item.active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
              {item.badge && (
                <span
                  className={cn(
                    "ml-auto px-2 py-0.5 rounded-full text-xs font-medium",
                    typeof item.badge === "number" ? "bg-primary/20 text-primary" : "bg-accent/20 text-accent",
                  )}
                >
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="pt-6 border-t border-border/50 space-y-2">
          <ThemeToggle />
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200">
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Log Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-72 bg-card border-r border-border/50 p-6 z-50"
            >
              <div className="flex items-center justify-between mb-8">
                <Link href="/" className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-lg">K</span>
                  </div>
                  <span className="text-xl font-bold text-foreground">Kliniq</span>
                </Link>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-xl hover:bg-secondary transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {/* Mobile Role Switcher */}
              <div className="relative p-1.5 bg-secondary/50 rounded-2xl mb-6">
                <div className="grid grid-cols-2 gap-1">
                  {(["nurse", "doctor"] as UserRole[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => setRole(r)}
                      className={cn(
                        "relative px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300",
                        role === r ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {role === r && (
                        <motion.div
                          layoutId="mobileRoleIndicator"
                          className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 rounded-xl"
                        />
                      )}
                      <span className="relative capitalize">{r}</span>
                    </button>
                  ))}
                </div>
              </div>
              <nav className="space-y-2">
                {navItems.map((item) => (
                  <button
                    key={item.label}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                      item.active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl hover:bg-secondary transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {role === "nurse" ? "Triage Dashboard" : "Clinical Queries"}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {role === "nurse" ? "Review and process patient submissions" : "Respond to escalated medical queries"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="relative p-2 rounded-xl hover:bg-secondary transition-colors">
                <Bell className="w-5 h-5 text-muted-foreground" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full animate-pulse" />
              </button>
              <div className="hidden md:block">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 p-6 overflow-y-auto">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats[role].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative group p-5 rounded-2xl bg-card border border-border/50 overflow-hidden hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <stat.icon className="w-5 h-5 text-primary" />
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-xs text-primary mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {stat.trend}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Queue */}
            <div className="lg:col-span-2 space-y-4">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex items-center gap-2 p-1.5 bg-secondary/30 rounded-xl">
                  {[
                    { id: "all", label: "All" },
                    { id: "pending", label: "Pending" },
                    { id: "urgent", label: "Urgent" },
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setActiveFilter(filter.id as typeof activeFilter)}
                      className={cn(
                        "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                        activeFilter === filter.id
                          ? "bg-card text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search patients..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-card border-border/50 rounded-xl"
                  />
                </div>
              </div>

              {/* Cases/Queries List */}
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {role === "nurse"
                    ? filteredCases.map((triageCase, index) => (
                        <motion.div
                          key={triageCase.id}
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ delay: index * 0.05 }}
                          className={cn(
                            "group relative p-5 rounded-2xl bg-card border transition-all duration-300 cursor-pointer",
                            selectedCase === triageCase.id
                              ? "border-primary shadow-lg shadow-primary/10"
                              : "border-border/50 hover:border-primary/30 hover:shadow-md",
                          )}
                          onClick={() => setSelectedCase(triageCase.id === selectedCase ? null : triageCase.id)}
                        >
                          {triageCase.urgency === "high" && (
                            <div className="absolute -top-px -left-px -right-px h-1 bg-gradient-to-r from-red-500 via-red-400 to-red-500 rounded-t-2xl" />
                          )}
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-4 flex-1">
                              <div
                                className={cn(
                                  "w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shrink-0",
                                  triageCase.urgency === "high"
                                    ? "bg-red-500/20 text-red-500"
                                    : "bg-primary/10 text-primary",
                                )}
                              >
                                {triageCase.patientName
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className="font-semibold text-foreground">{triageCase.patientName}</h3>
                                  <span className="text-xs text-muted-foreground">{triageCase.patientId}</span>
                                  <span
                                    className={cn(
                                      "px-2 py-0.5 rounded-full text-xs font-medium border",
                                      urgencyStyles[triageCase.urgency],
                                    )}
                                  >
                                    {triageCase.urgency}
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{triageCase.symptoms}</p>
                                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {triageCase.duration}
                                  </span>
                                  <span>{triageCase.language}</span>
                                  <span>{triageCase.submittedAt}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <Link
                                href={`/clinician/patient/${triageCase.patientId}`}
                                className="p-2 rounded-xl hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Eye className="w-4 h-4" />
                              </Link>
                              <button className="p-2 rounded-xl hover:bg-secondary text-muted-foreground transition-colors">
                                <MoreVertical className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Expandable AI Summary */}
                          <AnimatePresence>
                            {selectedCase === triageCase.id && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="pt-4 mt-4 border-t border-border/50">
                                  <div className="flex items-start gap-3 p-3 rounded-xl bg-primary/5">
                                    <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                    <div>
                                      <p className="text-xs font-medium text-primary mb-1">AI Summary</p>
                                      <p className="text-sm text-foreground">{triageCase.aiSummary}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 mt-3">
                                    <Button size="sm" className="flex-1 rounded-xl">
                                      <CheckCircle2 className="w-4 h-4 mr-2" />
                                      Verify & Close
                                    </Button>
                                    <Button size="sm" variant="outline" className="flex-1 rounded-xl bg-transparent">
                                      <AlertTriangle className="w-4 h-4 mr-2" />
                                      Escalate to Doctor
                                    </Button>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      ))
                    : filteredQueries.map((query, index) => (
                        <motion.div
                          key={query.id}
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ delay: index * 0.05 }}
                          className={cn(
                            "group relative p-5 rounded-2xl bg-card border transition-all duration-300 cursor-pointer",
                            selectedCase === query.id
                              ? "border-primary shadow-lg shadow-primary/10"
                              : "border-border/50 hover:border-primary/30 hover:shadow-md",
                          )}
                          onClick={() => setSelectedCase(query.id === selectedCase ? null : query.id)}
                        >
                          {query.urgency === "high" && (
                            <div className="absolute -top-px -left-px -right-px h-1 bg-gradient-to-r from-red-500 via-red-400 to-red-500 rounded-t-2xl" />
                          )}
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-4 flex-1">
                              <div
                                className={cn(
                                  "w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shrink-0",
                                  query.urgency === "high"
                                    ? "bg-red-500/20 text-red-500"
                                    : "bg-primary/10 text-primary",
                                )}
                              >
                                {query.patientName
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className="font-semibold text-foreground">{query.patientName}</h3>
                                  <span className="text-xs text-muted-foreground">{query.patientId}</span>
                                  <span
                                    className={cn(
                                      "px-2 py-0.5 rounded-full text-xs font-medium border",
                                      urgencyStyles[query.urgency],
                                    )}
                                  >
                                    {query.urgency}
                                  </span>
                                </div>
                                <p className="text-sm text-foreground mt-1 font-medium">"{query.question}"</p>
                                {query.nurseNote && (
                                  <p className="text-xs text-muted-foreground mt-1 italic">
                                    Nurse note: {query.nurseNote}
                                  </p>
                                )}
                                <p className="text-xs text-muted-foreground mt-2">{query.submittedAt}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <Link
                                href={`/clinician/patient/${query.patientId}`}
                                className="p-2 rounded-xl hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Eye className="w-4 h-4" />
                              </Link>
                            </div>
                          </div>

                          {/* Expandable AI Draft */}
                          <AnimatePresence>
                            {selectedCase === query.id && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="pt-4 mt-4 border-t border-border/50">
                                  <div className="flex items-start gap-3 p-3 rounded-xl bg-primary/5">
                                    <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                    <div>
                                      <p className="text-xs font-medium text-primary mb-1">AI Suggested Response</p>
                                      <p className="text-sm text-foreground">{query.aiDraft}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 mt-3">
                                    <Button size="sm" className="flex-1 rounded-xl">
                                      <CheckCircle2 className="w-4 h-4 mr-2" />
                                      Approve & Send
                                    </Button>
                                    <Button size="sm" variant="outline" className="flex-1 rounded-xl bg-transparent">
                                      <FileText className="w-4 h-4 mr-2" />
                                      Edit Response
                                    </Button>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Points & Activity Sidebar */}
            <div className="space-y-6">
              {/* Points Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="relative p-6 rounded-2xl bg-gradient-to-br from-primary/20 via-card to-accent/10 border border-primary/20 overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/20 to-transparent rounded-bl-full" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-accent/20 to-transparent rounded-tr-full" />

                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                        <Award className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">Your Points</p>
                        <p className="text-xs text-muted-foreground">This month</p>
                      </div>
                    </div>
                    <Gift className="w-5 h-5 text-accent" />
                  </div>

                  <div className="mb-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-foreground">{pointsData.current}</span>
                      <span className="text-sm text-muted-foreground">/ {pointsData.goal}</span>
                    </div>
                    <div className="mt-2 h-2 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(pointsData.current / pointsData.goal) * 100}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {pointsData.goal - pointsData.current} points to next reward
                    </p>
                  </div>

                  <div className="space-y-2">
                    {pointsData.breakdown.map((item) => (
                      <div key={item.action} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{item.action}</span>
                        <span className="font-medium text-foreground">+{item.points}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Quick Actions */}
              <div className="p-5 rounded-2xl bg-card border border-border/50">
                <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  {[
                    { icon: UserCheck, label: "View All Patients", color: "text-primary" },
                    { icon: FileText, label: "Update Notes", color: "text-accent" },
                    { icon: Calendar, label: "My Schedule", color: "text-kliniq-cyan" },
                  ].map((action) => (
                    <button
                      key={action.label}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/50 transition-colors group"
                    >
                      <div
                        className={cn("w-8 h-8 rounded-lg bg-secondary flex items-center justify-center", action.color)}
                      >
                        <action.icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium text-foreground">{action.label}</span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Activity Feed */}
              <div className="p-5 rounded-2xl bg-card border border-border/50">
                <h3 className="font-semibold text-foreground mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {[
                    { action: "Verified triage for Adebayo O.", time: "2 mins ago", points: "+5" },
                    { action: "Answered query from Chioma E.", time: "15 mins ago", points: "+10" },
                    { action: "Updated notes for Ibrahim M.", time: "1 hour ago", points: "+15" },
                  ].map((activity, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                      <span className="text-xs font-medium text-primary shrink-0">{activity.points}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
