"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ThemeToggle } from "@/components/theme-toggle"
import { NotificationsDropdown } from "@/components/notifications-dropdown"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import {
  ArrowLeft,
  Phone,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  Sparkles,
  FileText,
  MessageSquare,
  Pill,
  Heart,
  Activity,
  Stethoscope,
  Save,
  Edit3,
  Globe,
  ThermometerSun,
  Plus,
  X,
  Check,
  Copy,
  Volume2,
  Languages,
  Clipboard,
  History,
  Bell,
  Send,
  AlertTriangle,
  Download,
  User,
} from "lucide-react"

interface PatientData {
  id: string
  name: string
  age: number
  gender: string
  phone: string
  location: string
  language: string
  linkedSince: string
  avatar: string
  bloodType: string
  allergies: string[]
}

interface TriageData {
  symptoms: string
  duration: string
  urgency: "low" | "medium" | "high"
  submittedAt: string
  vitalSigns?: {
    temperature?: string
    bloodPressure?: string
    heartRate?: string
    oxygenLevel?: string
  }
  aiSummary: string
  aiRecommendation: string
}

interface MedicalNote {
  id: string
  date: string
  diagnosis: string
  medications: string[]
  lifestyle: string[]
  followUp: string
  doctor: string
}

interface PendingQuery {
  id: string
  question: string
  submittedAt: string
  aiDraft: string
  status: "pending" | "answered"
}

interface HistoryItem {
  id: string
  type: "consultation" | "prescription" | "test" | "diagnosis"
  title: string
  doctor: string
  date: string
  description: string
  status?: string
  typeIcon: any
}

const mockPatient: PatientData = {
  id: "KLQ-2847",
  name: "Adebayo Ogundimu",
  age: 58,
  gender: "Male",
  phone: "+234 801 234 5678",
  location: "Ikeja, Lagos",
  language: "Yoruba",
  linkedSince: "March 2024",
  avatar: "AO",
  bloodType: "O+",
  allergies: ["Penicillin", "Dust"],
}

const mockTriage: TriageData = {
  symptoms:
    "Persistent headache for 3 days, mild fever (38.2°C), general fatigue and body weakness. Patient mentions increased stress at work recently.",
  duration: "3 days",
  urgency: "medium",
  submittedAt: "Today, 10:32 AM",
  vitalSigns: {
    temperature: "38.2°C",
    bloodPressure: "145/92 mmHg",
    heartRate: "88 bpm",
    oxygenLevel: "97%",
  },
  aiSummary:
    "Patient presents with tension-type headache symptoms accompanied by low-grade fever and fatigue. The elevated blood pressure reading may be related to stress or underlying hypertension that requires monitoring. No red flags for serious neurological conditions identified.",
  aiRecommendation:
    "Recommend: (1) Basic pain management with Paracetamol 1g every 8 hours, (2) Hydration and rest, (3) Follow-up BP check in 1 week, (4) Consider stress management counseling if symptoms persist.",
}

const mockNotes: MedicalNote[] = [
  {
    id: "N001",
    date: "Nov 15, 2024",
    diagnosis: "Tension Headache with Hypertensive Tendency",
    medications: ["Paracetamol 1g - Every 8 hours for 5 days", "Amlodipine 5mg - Once daily"],
    lifestyle: ["Reduce salt intake", "30 mins daily walking", "Stress management techniques"],
    followUp: "Nov 22, 2024",
    doctor: "Dr. Oluwaseun",
  },
  {
    id: "N002",
    date: "Oct 28, 2024",
    diagnosis: "Upper Respiratory Tract Infection",
    medications: ["Amoxicillin 500mg - 3 times daily for 7 days", "Vitamin C 1000mg - Once daily"],
    lifestyle: ["Plenty of fluids", "Rest", "Avoid cold drinks"],
    followUp: "Nov 5, 2024",
    doctor: "Dr. Amaka",
  },
]

const mockQueries: PendingQuery[] = [
  {
    id: "Q001",
    question: "Can I take the medication with my herbal supplements (agbo)?",
    submittedAt: "2 hours ago",
    aiDraft:
      "Based on the prescribed Paracetamol and Amlodipine, there are no known major interactions with common herbal preparations. However, I recommend spacing them at least 2 hours apart for optimal absorption. If the herbal preparation contains any stimulants, please consult before combining with the blood pressure medication.",
    status: "pending",
  },
  {
    id: "Q002",
    question: "My head still hurts even after taking the medicine. What should I do?",
    submittedAt: "45 mins ago",
    aiDraft:
      "If the headache persists after taking Paracetamol for more than 24 hours, please ensure you are taking the medication with food and drinking plenty of water (at least 8 glasses daily). If the pain worsens or you experience vision changes, numbness, or severe dizziness, please come to the hospital immediately.",
    status: "pending",
  },
]

const mockHistory: HistoryItem[] = [
  {
    id: "1",
    type: "consultation",
    title: "General Checkup",
    doctor: "Dr. Oluwaseun Adeyemi",
    date: "Nov 28, 2024",
    description: "Routine health checkup. Blood pressure normal, recommended continued medication.",
    typeIcon: User,
  },
  {
    id: "2",
    type: "prescription",
    title: "Paracetamol 500mg",
    doctor: "Dr. Oluwaseun Adeyemi",
    date: "Nov 28, 2024",
    description: "Take one tablet every 6 hours after meals for headache relief.",
    status: "Active",
    typeIcon: Pill,
  },
  {
    id: "3",
    type: "test",
    title: "Blood Test Results",
    doctor: "Dr. Amara Obi",
    date: "Nov 15, 2024",
    description: "Complete blood count - All values within normal range.",
    status: "Normal",
    typeIcon: Activity,
  },
  {
    id: "4",
    type: "diagnosis",
    title: "Tension Headache",
    doctor: "Dr. Oluwaseun Adeyemi",
    date: "Nov 10, 2024",
    description: "Diagnosed with tension-type headache. Prescribed medication and lifestyle modifications.",
    typeIcon: FileText,
  },
]

const typeStyles = {
  consultation: { gradient: "from-primary/20 to-primary/10", color: "text-primary" },
  prescription: { gradient: "from-accent/20 to-accent/10", color: "text-accent" },
  test: { gradient: "from-kliniq-cyan/20 to-kliniq-cyan/10", color: "text-kliniq-cyan" },
  diagnosis: { gradient: "from-green-500/20 to-green-500/10", color: "text-green-500" },
}

const urgencyStyles = {
  low: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
  medium: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  high: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
}

const urgencyLabels = {
  low: "Low Priority",
  medium: "Medium Priority",
  high: "Urgent",
}

export default function PatientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<"overview" | "notes" | "queries" | "history">("overview")
  const [isAddingNote, setIsAddingNote] = useState(false)
  const [newNote, setNewNote] = useState({
    diagnosis: "",
    medications: [""],
    lifestyle: [""],
    followUp: "",
  })
  const [editingQuery, setEditingQuery] = useState<string | null>(null)
  const [queryResponses, setQueryResponses] = useState<Record<string, string>>({})
  const [copiedAI, setCopiedAI] = useState(false)
  const [nurseResponse, setNurseResponse] = useState("")
  const [showEscalateModal, setShowEscalateModal] = useState(false)
  const [showSendConfirmModal, setShowSendConfirmModal] = useState(false)
  const [showApproveConfirmModal, setShowApproveConfirmModal] = useState(false)
  const [showAddNoteModal, setShowAddNoteModal] = useState(false)
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [editedNotes, setEditedNotes] = useState<Record<string, MedicalNote & { editedDate?: string }>>({})
  const { toast } = useToast()

  useEffect(() => {
    setMounted(true)
    // Initialize query responses with AI drafts
    const initialResponses: Record<string, string> = {}
    mockQueries.forEach((q) => {
      initialResponses[q.id] = q.aiDraft
    })
    setQueryResponses(initialResponses)
  }, [])

  const addMedicationField = () => {
    setNewNote({ ...newNote, medications: [...newNote.medications, ""] })
  }

  const addLifestyleField = () => {
    setNewNote({ ...newNote, lifestyle: [...newNote.lifestyle, ""] })
  }

  const removeMedicationField = (index: number) => {
    const updated = newNote.medications.filter((_, i) => i !== index)
    setNewNote({ ...newNote, medications: updated })
  }

  const removeLifestyleField = (index: number) => {
    const updated = newNote.lifestyle.filter((_, i) => i !== index)
    setNewNote({ ...newNote, lifestyle: updated })
  }

  const copyAISummary = () => {
    navigator.clipboard.writeText(mockTriage.aiSummary)
    setCopiedAI(true)
    setTimeout(() => setCopiedAI(false), 2000)
  }

  const handleAcceptAISuggestion = () => {
    setNurseResponse(mockTriage.aiRecommendation)
    toast({
      title: "AI Suggestion Accepted",
      description: "AI recommendation has been added to your response.",
    })
  }

  const handleSendNurseResponse = () => {
    if (!nurseResponse.trim()) {
      toast({
        title: "Response Required",
        description: "Please enter a response before sending.",
        variant: "destructive",
      })
      return
    }
    setShowSendConfirmModal(true)
  }

  const confirmSendResponse = () => {
    toast({
      title: "Response Sent",
      description: `Your response to ${mockPatient.name} has been sent. +10 points earned!`,
    })
    setNurseResponse("")
    setShowSendConfirmModal(false)
  }

  const handleEscalateToDoctor = (doctorName: string) => {
    toast({
      title: "Escalated to Doctor",
      description: `${mockPatient.name}'s case has been escalated to ${doctorName} for medical review.`,
      variant: "destructive",
    })
    setShowEscalateModal(false)
  }

  const handleSaveNote = () => {
    toast({
      title: "Note Saved",
      description: "Medical note has been added successfully.",
    })
    setShowAddNoteModal(false)
    setIsAddingNote(false)
    setNewNote({
      diagnosis: "",
      medications: [""],
      lifestyle: [""],
      followUp: "",
    })
  }

  const handleEditNote = (noteId: string) => {
    if (editingNoteId === noteId) {
      // Save the edited note
      const note = mockNotes.find(n => n.id === noteId)
      if (note) {
        setEditedNotes({
          ...editedNotes,
          [noteId]: {
            ...note,
            editedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          }
        })
      }
      setEditingNoteId(null)
      toast({
        title: "Note Updated",
        description: "Medical note has been updated successfully.",
      })
    } else {
      setEditingNoteId(noteId)
    }
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: Stethoscope },
    { id: "notes", label: "Medical Notes", icon: FileText, badge: mockNotes.length },
    {
      id: "queries",
      label: "Patient Queries",
      icon: MessageSquare,
      badge: mockQueries.filter((q) => q.status === "pending").length,
    },
    { id: "history", label: "History", icon: History },
  ]

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Ambient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-primary/10 via-accent/5 to-transparent rounded-full blur-3xl opacity-50 dark:opacity-30" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-tr from-accent/10 via-primary/5 to-transparent rounded-full blur-3xl opacity-40 dark:opacity-20" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-secondary transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-bold text-foreground">{mockPatient.name}</h1>
                  <span
                    className={cn(
                      "px-2.5 py-1 rounded-full text-xs font-medium border",
                      urgencyStyles[mockTriage.urgency],
                    )}
                  >
                    {urgencyLabels[mockTriage.urgency]}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">Patient ID: {mockPatient.id}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <NotificationsDropdown />
            </div>
          </div>
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Left Column - Patient Info */}
          <div className="space-y-6 min-w-0">
            {/* Patient Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative p-6 rounded-3xl bg-gradient-to-br from-card via-card to-primary/5 border border-border/50 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full" />
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-gradient-to-tr from-accent/10 to-transparent rounded-full blur-xl" />

              <div className="relative">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg shadow-primary/20">
                    {mockPatient.avatar}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-foreground">{mockPatient.name}</h2>
                    <p className="text-sm text-muted-foreground">
                      {mockPatient.age} years old, {mockPatient.gender}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Globe className="w-3.5 h-3.5 text-primary" />
                      <span className="text-sm text-primary font-medium">{mockPatient.language}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <span className="text-foreground">{mockPatient.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <span className="text-foreground">{mockPatient.location}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <span className="text-muted-foreground">Linked since {mockPatient.linkedSince}</span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-border/50">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3 rounded-xl bg-secondary/30">
                      <p className="text-xs text-muted-foreground mb-1">Blood Type</p>
                      <p className="font-semibold text-foreground">{mockPatient.bloodType}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-destructive/10">
                      <p className="text-xs text-muted-foreground mb-1">Allergies</p>
                      <p className="font-semibold text-destructive text-sm">{mockPatient.allergies.join(", ")}</p>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-border/50 flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={() => router.push('/clinician/messages')}
                      className="flex-1 rounded-xl"
                      size="sm"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Contact Patient
                    </Button>
                    <Button
                      onClick={() => setActiveTab('history')}
                      variant="outline"
                      className="flex-1 rounded-xl"
                      size="sm"
                    >
                      <History className="w-4 h-4 mr-2" />
                      View History
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Vital Signs */}
            {mockTriage.vitalSigns && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-6 rounded-3xl bg-card border border-border/50"
              >
                <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" />
                  Vital Signs
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    {
                      label: "Temperature",
                      value: mockTriage.vitalSigns.temperature,
                      icon: ThermometerSun,
                      color: "text-orange-500",
                    },
                    {
                      label: "Blood Pressure",
                      value: mockTriage.vitalSigns.bloodPressure,
                      icon: Heart,
                      color: "text-red-500",
                    },
                    {
                      label: "Heart Rate",
                      value: mockTriage.vitalSigns.heartRate,
                      icon: Activity,
                      color: "text-pink-500",
                    },
                    {
                      label: "Oxygen Level",
                      value: mockTriage.vitalSigns.oxygenLevel,
                      icon: Activity,
                      color: "text-cyan-500",
                    },
                  ].map((vital) => (
                    <div
                      key={vital.label}
                      className="p-3 rounded-xl bg-secondary/30 group hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <vital.icon className={cn("w-3.5 h-3.5", vital.color)} />
                        <span className="text-xs text-muted-foreground">{vital.label}</span>
                      </div>
                      <p className="font-semibold text-foreground">{vital.value}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-3"
            >
              <Button className="w-full gap-2 h-12 rounded-2xl bg-gradient-to-r from-primary to-primary/80 hover:opacity-90">
                <Phone className="w-4 h-4" />
                Contact Patient
              </Button>
              <Button variant="outline" className="w-full gap-2 h-12 rounded-2xl bg-transparent">
                <History className="w-4 h-4" />
                View Full History
              </Button>
            </motion.div>
          </div>

          {/* Right Column - Main Content */}
          <div className="lg:col-span-2 space-y-6 min-w-0">
            {/* Tabs */}
            <div className="flex items-center gap-2 p-1.5 bg-secondary/30 rounded-2xl overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={cn(
                    "relative flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap",
                    activeTab === tab.id ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activePatientTab"
                      className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 rounded-xl"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <tab.icon className="relative w-4 h-4" />
                  <span className="relative">{tab.label}</span>
                  {tab.badge && tab.badge > 0 && (
                    <span
                      className={cn(
                        "relative ml-1 px-2 py-0.5 rounded-full text-xs font-medium",
                        activeTab === tab.id
                          ? "bg-primary-foreground/20 text-primary-foreground"
                          : "bg-primary/20 text-primary",
                      )}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {/* Overview Tab */}
              {activeTab === "overview" && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Triage Summary */}
                  <div className="p-6 rounded-3xl bg-card border border-border/50">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                          <Clipboard className="w-5 h-5 text-primary" />
                          Triage Summary
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">Submitted {mockTriage.submittedAt}</p>
                      </div>
                      <span
                        className={cn(
                          "px-3 py-1.5 rounded-full text-sm font-medium border",
                          urgencyStyles[mockTriage.urgency],
                        )}
                      >
                        {mockTriage.urgency.charAt(0).toUpperCase() + mockTriage.urgency.slice(1)} Urgency
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-secondary/30 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Duration: {mockTriage.duration}</span>
                      </div>
                      <p className="text-foreground leading-relaxed">{mockTriage.symptoms}</p>
                    </div>

                    {/* AI Analysis */}
                    <div className="relative p-5 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-accent/5 border border-primary/20 overflow-hidden">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full" />

                      <div className="relative">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                              <Sparkles className="w-4 h-4 text-primary" />
                            </div>
                            <span className="text-sm font-semibold text-foreground">AI Analysis (N-ATLaS)</span>
                          </div>
                          <button
                            onClick={copyAISummary}
                            className="p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                          >
                            {copiedAI ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4 text-muted-foreground" />
                            )}
                          </button>
                        </div>

                        <p className="text-sm text-foreground/80 leading-relaxed mb-4">{mockTriage.aiSummary}</p>

                        <div className="p-3 rounded-xl bg-card/50 border border-border/50">
                          <p className="text-xs font-medium text-primary mb-1">Recommendation</p>
                          <p className="text-sm text-foreground/80">{mockTriage.aiRecommendation}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Nurse Response Section */}
                  <div className="p-6 rounded-3xl bg-card border border-border/50">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-primary" />
                        Triage Response
                      </h3>
                      <Button
                        onClick={handleAcceptAISuggestion}
                        variant="outline"
                        size="sm"
                        className="rounded-xl"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Accept AI Suggestion
                      </Button>
                    </div>

                    <div className="mb-4">
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">
                        Your Response to Patient
                      </label>
                      <Textarea
                        value={nurseResponse}
                        onChange={(e) => setNurseResponse(e.target.value)}
                        placeholder="Enter your response to the patient based on the triage and AI recommendation..."
                        className="min-h-[120px] rounded-xl resize-none"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <Button onClick={handleSendNurseResponse} className="flex-1 rounded-xl">
                        <Send className="w-4 h-4 mr-2" />
                        Send Response
                      </Button>
                      <Button
                        onClick={() => setShowEscalateModal(true)}
                        variant="outline"
                        className="flex-1 rounded-xl bg-transparent"
                      >
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Escalate to Doctor
                      </Button>
                    </div>
                  </div>

                  {/* Quick Note Entry */}
                  <div className="p-6 rounded-3xl bg-card border border-border/50">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <Edit3 className="w-5 h-5 text-primary" />
                        Medical Notes
                      </h3>
                      <Button
                        onClick={() => setShowAddNoteModal(true)}
                        size="sm"
                        className="rounded-xl"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Note
                      </Button>
                    </div>

                    <AnimatePresence>
                      {isAddingNote && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="space-y-4 pt-2">
                            <div>
                              <label className="text-sm font-medium text-foreground mb-2 block">Diagnosis</label>
                              <Textarea
                                placeholder="Enter diagnosis..."
                                value={newNote.diagnosis}
                                onChange={(e) => setNewNote({ ...newNote, diagnosis: e.target.value })}
                                className="rounded-xl min-h-[80px] bg-secondary/30 border-border/50"
                              />
                            </div>

                            <div>
                              <label className="text-sm font-medium text-foreground mb-2 block">Medications</label>
                              {newNote.medications.map((med, index) => (
                                <div key={index} className="flex gap-2 mb-2">
                                  <Input
                                    placeholder="Medication name and dosage..."
                                    value={med}
                                    onChange={(e) => {
                                      const updated = [...newNote.medications]
                                      updated[index] = e.target.value
                                      setNewNote({ ...newNote, medications: updated })
                                    }}
                                    className="rounded-xl bg-secondary/30 border-border/50"
                                  />
                                  {newNote.medications.length > 1 && (
                                    <button
                                      onClick={() => removeMedicationField(index)}
                                      className="p-2 rounded-xl hover:bg-destructive/10 text-destructive transition-colors"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              ))}
                              <button
                                onClick={addMedicationField}
                                className="flex items-center gap-1 text-sm text-primary hover:underline"
                              >
                                <Plus className="w-3.5 h-3.5" /> Add medication
                              </button>
                            </div>

                            <div>
                              <label className="text-sm font-medium text-foreground mb-2 block">
                                Lifestyle Changes
                              </label>
                              {newNote.lifestyle.map((item, index) => (
                                <div key={index} className="flex gap-2 mb-2">
                                  <Input
                                    placeholder="Lifestyle recommendation..."
                                    value={item}
                                    onChange={(e) => {
                                      const updated = [...newNote.lifestyle]
                                      updated[index] = e.target.value
                                      setNewNote({ ...newNote, lifestyle: updated })
                                    }}
                                    className="rounded-xl bg-secondary/30 border-border/50"
                                  />
                                  {newNote.lifestyle.length > 1 && (
                                    <button
                                      onClick={() => removeLifestyleField(index)}
                                      className="p-2 rounded-xl hover:bg-destructive/10 text-destructive transition-colors"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              ))}
                              <button
                                onClick={addLifestyleField}
                                className="flex items-center gap-1 text-sm text-primary hover:underline"
                              >
                                <Plus className="w-3.5 h-3.5" /> Add recommendation
                              </button>
                            </div>

                            <div>
                              <label className="text-sm font-medium text-foreground mb-2 block">Follow-up Date</label>
                              <Input
                                type="date"
                                value={newNote.followUp}
                                onChange={(e) => setNewNote({ ...newNote, followUp: e.target.value })}
                                className="rounded-xl bg-secondary/30 border-border/50 w-48"
                              />
                            </div>

                            <Button className="w-full rounded-xl h-12 gap-2 bg-gradient-to-r from-primary to-primary/80">
                              <Save className="w-4 h-4" />
                              Save Medical Note
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}

              {/* Notes Tab */}
              {activeTab === "notes" && (
                <motion.div
                  key="notes"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-foreground">Medical Notes History</h3>
                    <Button
                      onClick={() => setShowAddNoteModal(true)}
                      size="sm"
                      className="rounded-xl"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Note
                    </Button>
                  </div>
                  {mockNotes.map((note, index) => (
                    <motion.div
                      key={note.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-6 rounded-3xl bg-card border border-border/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium text-foreground">{note.date}</span>
                            {editedNotes[note.id]?.editedDate && (
                              <span className="text-xs text-muted-foreground italic">
                                (Edited: {editedNotes[note.id].editedDate})
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">By {note.doctor}</p>
                        </div>
                        {editingNoteId === note.id ? (
                          <Button
                            onClick={() => handleEditNote(note.id)}
                            size="sm"
                            className="rounded-xl"
                          >
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                          </Button>
                        ) : (
                          <button
                            onClick={() => handleEditNote(note.id)}
                            className="p-2 rounded-xl hover:bg-secondary transition-colors"
                          >
                            <Edit3 className="w-4 h-4 text-muted-foreground" />
                          </button>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                            Diagnosis
                          </p>
                          {editingNoteId === note.id ? (
                            <Input
                              value={editedNotes[note.id]?.diagnosis || note.diagnosis}
                              onChange={(e) => setEditedNotes({
                                ...editedNotes,
                                [note.id]: { ...(editedNotes[note.id] || note), diagnosis: e.target.value }
                              })}
                              className="rounded-xl bg-secondary/30 border-border/50"
                            />
                          ) : (
                            <p className="text-foreground font-medium">{editedNotes[note.id]?.diagnosis || note.diagnosis}</p>
                          )}
                        </div>

                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                            Medications
                          </p>
                          <div className="space-y-2">
                            {(editedNotes[note.id]?.medications || note.medications).map((med, i) => (
                              editingNoteId === note.id ? (
                                <div key={i} className="flex gap-2">
                                  <Input
                                    value={med}
                                    onChange={(e) => {
                                      const updatedMeds = [...(editedNotes[note.id]?.medications || note.medications)]
                                      updatedMeds[i] = e.target.value
                                      setEditedNotes({
                                        ...editedNotes,
                                        [note.id]: { ...(editedNotes[note.id] || note), medications: updatedMeds }
                                      })
                                    }}
                                    className="rounded-xl bg-secondary/30 border-border/50"
                                  />
                                  {(editedNotes[note.id]?.medications || note.medications).length > 1 && (
                                    <button
                                      onClick={() => {
                                        const updatedMeds = [...(editedNotes[note.id]?.medications || note.medications)]
                                        updatedMeds.splice(i, 1)
                                        setEditedNotes({
                                          ...editedNotes,
                                          [note.id]: { ...(editedNotes[note.id] || note), medications: updatedMeds }
                                        })
                                      }}
                                      className="p-2 rounded-xl hover:bg-destructive/10 text-destructive transition-colors"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              ) : (
                                <div key={i} className="flex items-center gap-2 p-2 rounded-xl bg-secondary/30">
                                  <Pill className="w-4 h-4 text-primary" />
                                  <span className="text-sm text-foreground">{med}</span>
                                </div>
                              )
                            ))}
                            {editingNoteId === note.id && (
                              <button
                                onClick={() => {
                                  const updatedMeds = [...(editedNotes[note.id]?.medications || note.medications), ""]
                                  setEditedNotes({
                                    ...editedNotes,
                                    [note.id]: { ...(editedNotes[note.id] || note), medications: updatedMeds }
                                  })
                                }}
                                className="flex items-center gap-1 text-sm text-primary hover:underline"
                              >
                                <Plus className="w-3.5 h-3.5" /> Add medication
                              </button>
                            )}
                          </div>
                        </div>

                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                            Lifestyle Changes
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {(editedNotes[note.id]?.lifestyle || note.lifestyle).map((item, i) => (
                              editingNoteId === note.id ? (
                                <div key={i} className="flex gap-2">
                                  <Input
                                    value={item}
                                    onChange={(e) => {
                                      const updatedLifestyle = [...(editedNotes[note.id]?.lifestyle || note.lifestyle)]
                                      updatedLifestyle[i] = e.target.value
                                      setEditedNotes({
                                        ...editedNotes,
                                        [note.id]: { ...(editedNotes[note.id] || note), lifestyle: updatedLifestyle }
                                      })
                                    }}
                                    className="rounded-xl bg-secondary/30 border-border/50 w-48"
                                  />
                                  {(editedNotes[note.id]?.lifestyle || note.lifestyle).length > 1 && (
                                    <button
                                      onClick={() => {
                                        const updatedLifestyle = [...(editedNotes[note.id]?.lifestyle || note.lifestyle)]
                                        updatedLifestyle.splice(i, 1)
                                        setEditedNotes({
                                          ...editedNotes,
                                          [note.id]: { ...(editedNotes[note.id] || note), lifestyle: updatedLifestyle }
                                        })
                                      }}
                                      className="p-2 rounded-xl hover:bg-destructive/10 text-destructive transition-colors"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              ) : (
                                <span
                                  key={i}
                                  className="px-3 py-1.5 rounded-full text-sm bg-accent/10 text-accent border border-accent/20"
                                >
                                  {item}
                                </span>
                              )
                            ))}
                          </div>
                          {editingNoteId === note.id && (
                            <button
                              onClick={() => {
                                const updatedLifestyle = [...(editedNotes[note.id]?.lifestyle || note.lifestyle), ""]
                                setEditedNotes({
                                  ...editedNotes,
                                  [note.id]: { ...(editedNotes[note.id] || note), lifestyle: updatedLifestyle }
                                })
                              }}
                              className="flex items-center gap-1 text-sm text-primary hover:underline mt-2"
                            >
                              <Plus className="w-3.5 h-3.5" /> Add lifestyle change
                            </button>
                          )}
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          {editingNoteId === note.id ? (
                            <div className="flex items-center gap-2 flex-1">
                              <span className="text-sm text-muted-foreground">Follow-up:</span>
                              <Input
                                value={editedNotes[note.id]?.followUp || note.followUp}
                                onChange={(e) => setEditedNotes({
                                  ...editedNotes,
                                  [note.id]: { ...(editedNotes[note.id] || note), followUp: e.target.value }
                                })}
                                className="rounded-xl bg-secondary/30 border-border/50 flex-1"
                              />
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">Follow-up: {editedNotes[note.id]?.followUp || note.followUp}</span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* Queries Tab */}
              {activeTab === "queries" && (
                <motion.div
                  key="queries"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  {mockQueries.map((query, index) => (
                    <motion.div
                      key={query.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-6 rounded-3xl bg-card border border-border/50"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <MessageSquare className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-foreground font-medium">{query.question}</p>
                            <p className="text-xs text-muted-foreground mt-1">{query.submittedAt}</p>
                          </div>
                        </div>
                        <span
                          className={cn(
                            "px-2.5 py-1 rounded-full text-xs font-medium",
                            query.status === "pending"
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                              : "bg-green-500/10 text-green-600 dark:text-green-400",
                          )}
                        >
                          {query.status === "pending" ? "Pending" : "Answered"}
                        </span>
                      </div>

                      {/* AI Draft */}
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10 mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="w-4 h-4 text-primary" />
                          <span className="text-xs font-medium text-primary">AI-Drafted Response</span>
                          <button className="ml-auto p-1.5 rounded-lg hover:bg-secondary/50 transition-colors">
                            <Volume2 className="w-3.5 h-3.5 text-muted-foreground" />
                          </button>
                        </div>
                        {editingQuery === query.id ? (
                          <Textarea
                            value={queryResponses[query.id]}
                            onChange={(e) => setQueryResponses({ ...queryResponses, [query.id]: e.target.value })}
                            className="min-h-[100px] bg-card/50 rounded-xl border-border/50"
                          />
                        ) : (
                          <p className="text-sm text-foreground/80 leading-relaxed">{queryResponses[query.id]}</p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3">
                        {editingQuery === query.id ? (
                          <>
                            <Button
                              onClick={() => setEditingQuery(null)}
                              className="flex-1 rounded-xl h-11 gap-2 bg-gradient-to-r from-primary to-primary/80"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              Approve & Send
                            </Button>
                            <Button onClick={() => setEditingQuery(null)} variant="outline" className="rounded-xl h-11">
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button className="flex-1 rounded-xl h-11 gap-2 bg-gradient-to-r from-primary to-primary/80">
                              <CheckCircle2 className="w-4 h-4" />
                              Approve & Send
                            </Button>
                            <Button
                              onClick={() => setEditingQuery(query.id)}
                              variant="outline"
                              className="rounded-xl h-11 gap-2"
                            >
                              <Edit3 className="w-4 h-4" />
                              Edit
                            </Button>
                          </>
                        )}
                      </div>

                      {/* Translation Notice */}
                      <div className="mt-4 pt-4 border-t border-border/50 flex items-center gap-2 text-xs text-muted-foreground">
                        <Languages className="w-3.5 h-3.5" />
                        <span>
                          Response will be translated to{" "}
                          <strong className="text-primary">{mockPatient.language}</strong> for the patient
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* History Tab */}
              {activeTab === "history" && (
                <motion.div
                  key="history"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  {mockHistory.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-6 rounded-3xl bg-card border border-border/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
                    >
                      <div className="flex items-start gap-4">
                        <div className={cn("w-12 h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center shrink-0", typeStyles[item.type].gradient)}>
                          <item.typeIcon className={cn("w-6 h-6", typeStyles[item.type].color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div>
                              <h3 className="font-semibold text-foreground">{item.title}</h3>
                              <p className="text-sm text-muted-foreground">by {item.doctor}</p>
                            </div>
                            {item.status && (
                              <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap", item.status === "Active" ? "bg-green-500/10 text-green-600" : "bg-blue-500/10 text-blue-600")}>
                                {item.status}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-foreground/80 leading-relaxed mb-3">{item.description}</p>
                          <div className="flex items-center justify-between pt-3 border-t border-border/50">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="w-4 h-4" />
                              <span>{item.date}</span>
                            </div>
                            {item.type === "test" && (
                              <Button variant="outline" size="sm" className="rounded-xl">
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Escalate to Doctor Modal */}
      <AnimatePresence>
        {showEscalateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowEscalateModal(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-3xl max-w-md w-full p-6 shadow-xl border border-border/50"
            >
              <h3 className="text-2xl font-bold text-foreground mb-2">Escalate to Doctor</h3>
              <p className="text-muted-foreground mb-6">Select a doctor to review this case</p>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Select Doctor</label>
                  <select
                    id="doctor-select"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="dr-oluwaseun">Dr. Oluwaseun Adeyemi - General Medicine</option>
                    <option value="dr-amara">Dr. Amara Obi - Cardiology</option>
                    <option value="dr-chidinma">Dr. Chidinma Nwosu - Dermatology</option>
                    <option value="dr-ibrahim">Dr. Ibrahim Yusuf - Internal Medicine</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Add Note (Optional)</label>
                  <Textarea
                    placeholder="Add any additional notes for the doctor..."
                    className="min-h-[80px] rounded-xl resize-none"
                  />
                </div>
                <div className="flex gap-3 mt-6">
                  <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setShowEscalateModal(false)}>
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 rounded-xl bg-gradient-to-r from-primary to-primary/80"
                    onClick={() => {
                      const select = document.getElementById('doctor-select') as HTMLSelectElement
                      const doctorName = select.options[select.selectedIndex].text.split(' - ')[0]
                      handleEscalateToDoctor(doctorName)
                    }}
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Escalate Case
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Send Response Confirmation Modal */}
      <AnimatePresence>
        {showSendConfirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSendConfirmModal(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-3xl max-w-md w-full p-6 shadow-xl border border-border/50"
            >
              <h3 className="text-2xl font-bold text-foreground mb-2">Confirm Send Response</h3>
              <p className="text-muted-foreground mb-6">
                Are you sure you want to send this response to {mockPatient.name}?
              </p>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setShowSendConfirmModal(false)}>
                  Cancel
                </Button>
                <Button className="flex-1 rounded-xl bg-gradient-to-r from-primary to-primary/80" onClick={confirmSendResponse}>
                  <Send className="w-4 h-4 mr-2" />
                  Send Response
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Note Modal */}
      <AnimatePresence>
        {showAddNoteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddNoteModal(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-3xl max-w-2xl w-full p-6 shadow-xl border border-border/50 max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-2xl font-bold text-foreground mb-2">Add Medical Note</h3>
              <p className="text-muted-foreground mb-6">Record diagnosis, medications, and recommendations</p>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Diagnosis</label>
                  <Input
                    placeholder="Primary diagnosis..."
                    value={newNote.diagnosis}
                    onChange={(e) => setNewNote({ ...newNote, diagnosis: e.target.value })}
                    className="rounded-xl bg-secondary/30 border-border/50"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Medications</label>
                  {newNote.medications.map((med, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <Input
                        placeholder="Medication and dosage..."
                        value={med}
                        onChange={(e) => {
                          const updated = [...newNote.medications]
                          updated[index] = e.target.value
                          setNewNote({ ...newNote, medications: updated })
                        }}
                        className="rounded-xl bg-secondary/30 border-border/50"
                      />
                      {newNote.medications.length > 1 && (
                        <button
                          onClick={() => removeMedicationField(index)}
                          className="p-2 rounded-xl hover:bg-destructive/10 text-destructive transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addMedicationField}
                    className="flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add medication
                  </button>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Lifestyle Changes</label>
                  {newNote.lifestyle.map((item, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <Input
                        placeholder="Lifestyle recommendation..."
                        value={item}
                        onChange={(e) => {
                          const updated = [...newNote.lifestyle]
                          updated[index] = e.target.value
                          setNewNote({ ...newNote, lifestyle: updated })
                        }}
                        className="rounded-xl bg-secondary/30 border-border/50"
                      />
                      {newNote.lifestyle.length > 1 && (
                        <button
                          onClick={() => removeLifestyleField(index)}
                          className="p-2 rounded-xl hover:bg-destructive/10 text-destructive transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addLifestyleField}
                    className="flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add recommendation
                  </button>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Follow-up Date</label>
                  <Input
                    placeholder="e.g., Dec 15, 2024"
                    value={newNote.followUp}
                    onChange={(e) => setNewNote({ ...newNote, followUp: e.target.value })}
                    className="rounded-xl bg-secondary/30 border-border/50"
                  />
                </div>

                <div className="flex gap-3 mt-6">
                  <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setShowAddNoteModal(false)}>
                    Cancel
                  </Button>
                  <Button className="flex-1 rounded-xl bg-gradient-to-r from-primary to-primary/80" onClick={handleSaveNote}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Note
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
