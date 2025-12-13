"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/theme-toggle"
import { NotificationsDropdown } from "@/components/notifications-dropdown"
import { cn } from "@/lib/utils"
import { PatientSidebar } from "@/components/patient-sidebar"
import { useToast } from "@/hooks/use-toast"
import { appointmentsApi, AppointmentResponse, AppointmentRequestResponse, LinkedHospitalWithDepartments, AppointmentRequestCreate } from "@/lib/appointments-api"
import {
    Calendar as CalendarIcon,
    Clock,
    Bell,
    Settings,
    LogOut,
    Menu,
    X,
    Home,
    MessageSquare,
    History,
    Plus,
    Search,
    Filter,
    Video,
    MapPin,
    User,
    ChevronRight,
    Download,
    Edit,
    Trash2,
    Loader2,
} from "lucide-react"

interface Appointment {
    id: string
    doctor: string
    specialty: string
    date: string
    time: string
    type: "in-person" | "video"
    status: "upcoming" | "completed" | "cancelled"
    location?: string
    notes?: string
}

// Transform API response to local format
function transformAppointment(apt: AppointmentResponse): Appointment {
    return {
        id: apt.id,
        doctor: apt.doctor_name,
        specialty: apt.specialty || "",
        date: new Date(apt.scheduled_date).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' }),
        time: apt.scheduled_time,
        type: apt.type,
        status: apt.status as "upcoming" | "completed" | "cancelled",
        location: apt.location || apt.hospital_name || undefined,
        notes: apt.notes || undefined,
    }
}

export default function AppointmentsPage() {
    const [mounted, setMounted] = useState(false)
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [filter, setFilter] = useState<"all" | "upcoming" | "completed" | "pending">("all")
    const [searchQuery, setSearchQuery] = useState("")
    const [pendingRequests, setPendingRequests] = useState<AppointmentRequestResponse[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null)
    const [showBookModal, setShowBookModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showRescheduleModal, setShowRescheduleModal] = useState(false)
    const [appointmentToEdit, setAppointmentToEdit] = useState<Appointment | null>(null)

    // Linked hospitals and form state
    const [linkedHospitals, setLinkedHospitals] = useState<LinkedHospitalWithDepartments[]>([])
    const [selectedHospitalId, setSelectedHospitalId] = useState<string>("")
    const [selectedDepartment, setSelectedDepartment] = useState<string>("")
    const [reason, setReason] = useState("")
    const [preferredType, setPreferredType] = useState<"video" | "in-person">("video")
    const [urgency, setUrgency] = useState<"low" | "normal" | "urgent">("normal")
    const [submitting, setSubmitting] = useState(false)

    // Delete confirmation modal state
    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false)
    const [requestToDelete, setRequestToDelete] = useState<AppointmentRequestResponse | null>(null)

    // Store all appointments (unfiltered) for client-side filtering
    const [allAppointments, setAllAppointments] = useState<Appointment[]>([])

    const { toast } = useToast()

    // Fetch ALL data once on mount
    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true)
            try {
                // Fetch all appointments and pending requests in parallel
                const [appointmentsResponse, requestsResponse] = await Promise.all([
                    appointmentsApi.getAppointments(), // Fetch all appointments
                    appointmentsApi.getAppointmentRequests("pending") // Fetch pending requests
                ])

                setAllAppointments(appointmentsResponse.appointments.map(transformAppointment))
                setPendingRequests(requestsResponse.requests)
            } catch (error) {
                console.error("Failed to load data:", error)
                toast({
                    title: "Error",
                    description: "Failed to load appointments",
                    variant: "destructive",
                })
            } finally {
                setLoading(false)
            }
        }
        fetchAllData()
    }, []) // Only run on mount

    useEffect(() => {
        setMounted(true)
    }, [])

    // Fetch linked hospitals when modal opens
    useEffect(() => {
        if (showBookModal) {
            const fetchHospitals = async () => {
                try {
                    const response = await appointmentsApi.getLinkedHospitals()
                    setLinkedHospitals(response.hospitals)
                    // Reset form
                    setSelectedHospitalId("")
                    setSelectedDepartment("")
                    setReason("")
                    setPreferredType("video")
                    setUrgency("normal")
                } catch (error) {
                    console.error("Failed to load hospitals:", error)
                }
            }
            fetchHospitals()
        }
    }, [showBookModal])

    // Get departments for selected hospital
    const selectedHospital = linkedHospitals.find(h => h.id === selectedHospitalId)
    const departments = selectedHospital?.departments || []

    // Filter appointments client-side based on selected filter
    const filteredAppointments = allAppointments.filter((apt) => {
        // Apply status filter
        if (filter !== "all" && filter !== "pending") {
            if (apt.status !== filter) return false
        }
        // Apply search filter
        const matchesSearch =
            apt.doctor.toLowerCase().includes(searchQuery.toLowerCase()) ||
            apt.specialty.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesSearch
    })

    const handleRequestAppointment = () => {
        setShowBookModal(true)
    }

    // Submit appointment request
    const handleSubmitRequest = async () => {
        if (!selectedHospitalId || !selectedDepartment || !reason.trim()) {
            toast({
                title: "Missing Information",
                description: "Please fill in all required fields",
                variant: "destructive",
            })
            return
        }

        setSubmitting(true)
        try {
            const request: AppointmentRequestCreate = {
                hospital_id: selectedHospitalId,
                department: selectedDepartment,
                reason: reason.trim(),
                preferred_type: preferredType,
                urgency: urgency,
            }
            const result = await appointmentsApi.createAppointmentRequest(request)
            if (result.success) {
                setShowBookModal(false)
                toast({
                    title: "Request Submitted!",
                    description: "Your appointment request has been sent. You'll be notified once it's confirmed.",
                })
                // Add to local pending requests state (avoid re-fetch)
                if (result.request) {
                    setPendingRequests(prev => [result.request!, ...prev])
                }
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to submit request",
                variant: "destructive",
            })
        } finally {
            setSubmitting(false)
        }
    }

    // Cancel pending request
    const handleCancelRequest = async (requestId: string) => {
        try {
            const result = await appointmentsApi.cancelAppointmentRequest(requestId)
            if (result.success) {
                setPendingRequests(pendingRequests.filter(r => r.id !== requestId))
                toast({
                    title: "Request Cancelled",
                    description: "Your appointment request has been cancelled.",
                })
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to cancel request",
                variant: "destructive",
            })
        }
    }

    const handleEditAppointment = (appointment: Appointment) => {
        setAppointmentToEdit(appointment)
        setShowEditModal(true)
    }

    const handleCancelAppointment = async (appointmentId: string) => {
        const appointment = allAppointments.find(apt => apt.id === appointmentId)
        try {
            const result = await appointmentsApi.cancelAppointment(appointmentId)
            if (result.success) {
                setAllAppointments(allAppointments.filter(apt => apt.id !== appointmentId))
                toast({
                    title: "Appointment Cancelled",
                    description: `Your appointment with ${appointment?.doctor} has been cancelled.`,
                    variant: "destructive",
                })
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to cancel appointment",
                variant: "destructive",
            })
        }
    }

    const handleDownloadReport = (appointment: Appointment) => {
        // Show initial toast
        toast({
            title: "Preparing Download",
            description: `Generating report for ${appointment.doctor}...`,
        })

        // Simulate report generation and download
        setTimeout(() => {
            // Create a mock PDF blob (in real app, this would be actual PDF data)
            const reportContent = `
MEDICAL APPOINTMENT REPORT
==========================

Patient: Adebayo Ogundimu
Doctor: ${appointment.doctor}
Specialty: ${appointment.specialty}
Date: ${appointment.date}
Time: ${appointment.time}
Type: ${appointment.type === "video" ? "Video Consultation" : "In-Person Consultation"}
${appointment.location ? `Location: ${appointment.location}` : ''}

Summary:
This was a follow-up consultation regarding the patient's ongoing treatment plan.

Recommendations:
- Continue current medication
- Schedule follow-up in 2 weeks
- Monitor symptoms daily

Report generated on: ${new Date().toLocaleDateString()}
            `.trim()

            // Create blob and download
            const blob = new Blob([reportContent], { type: 'text/plain' })
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `medical-report-${appointment.date.replace(/\s/g, '-')}.txt`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)

            // Show success toast
            toast({
                title: "Download Complete",
                description: "Medical report has been downloaded successfully.",
            })
        }, 1000)
    }

    const handleToggleDetails = (appointmentId: string) => {
        setSelectedAppointment(selectedAppointment === appointmentId ? null : appointmentId)
    }

    const handleReschedule = (appointment: Appointment) => {
        setAppointmentToEdit(appointment)
        setShowRescheduleModal(true)
    }

    if (!mounted) return null

    return (
        <div className="min-h-screen bg-background flex max-w-full overflow-x-hidden">
            <PatientSidebar activePath="/dashboard/appointments" sidebarOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <main className="flex-1 flex flex-col min-h-screen max-w-full">
                <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 sm:px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-secondary transition-colors">
                                <Menu className="w-5 h-5" />
                            </button>
                            <div>
                                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">Appointments</h1>
                                <p className="text-sm text-muted-foreground">Manage your healthcare appointments</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3">
                            <Button onClick={handleRequestAppointment} className="bg-gradient-to-r from-primary to-primary/80 sm:px-4">
                                <Plus className="w-4 h-4" />
                                <span className="hidden sm:inline ml-2">Request Appointment</span>
                            </Button>
                            <NotificationsDropdown />
                            <div className="hidden md:block">
                                <ThemeToggle />
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex-1 p-6 overflow-y-auto">
                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
                        <div className="flex items-center gap-2 p-1.5 bg-secondary/30 rounded-xl">
                            {(["all", "upcoming", "completed", "pending"] as const).map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={cn(
                                        "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 capitalize",
                                        filter === f ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search appointments..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-card border-border/50 rounded-xl"
                            />
                        </div>
                    </div>

                    {/* Pending Requests Grid */}
                    {filter === "pending" && (
                        <div className="grid gap-4">
                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                </div>
                            ) : pendingRequests.length > 0 ? (
                                pendingRequests.map((req, index) => (
                                    <motion.div
                                        key={req.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="group relative p-6 rounded-3xl bg-card border border-border/50 overflow-hidden hover:border-primary/30 transition-all duration-300"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                        <div className="relative flex items-start justify-between gap-4">
                                            <div className="flex items-start gap-4 flex-1">
                                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-yellow-500/20 to-orange-500/10">
                                                    <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <h3 className="font-semibold text-foreground text-lg">{req.hospital_name}</h3>
                                                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">
                                                            Pending
                                                        </span>
                                                        <span className={cn(
                                                            "px-2 py-0.5 rounded-full text-xs font-medium",
                                                            req.urgency === "urgent"
                                                                ? "bg-red-500/10 text-red-600 dark:text-red-400"
                                                                : req.urgency === "low"
                                                                    ? "bg-gray-500/10 text-gray-600 dark:text-gray-400"
                                                                    : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                                        )}>
                                                            {req.urgency}
                                                        </span>
                                                    </div>
                                                    <p className="text-muted-foreground mb-2">{req.department}</p>
                                                    <p className="text-sm text-muted-foreground line-clamp-2">{req.reason}</p>
                                                    <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                                                        <span className="flex items-center gap-1">
                                                            <CalendarIcon className="w-4 h-4" />
                                                            {new Date(req.created_at).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            {req.preferred_type === "video" ? <Video className="w-4 h-4" /> : <User className="w-4 h-4" />}
                                                            {req.preferred_type === "video" ? "Video" : "In-Person"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                onClick={() => {
                                                    setRequestToDelete(req)
                                                    setShowDeleteConfirmModal(true)
                                                }}
                                            >
                                                <Trash2 className="w-4 h-4 mr-1" />
                                                Delete
                                            </Button>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="text-center py-12">
                                    <Clock className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                                    <h3 className="text-lg font-semibold text-foreground mb-2">No Pending Requests</h3>
                                    <p className="text-muted-foreground mb-4">You don't have any pending appointment requests</p>
                                    <Button onClick={handleRequestAppointment} className="bg-gradient-to-r from-primary to-primary/80">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Request an Appointment
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Appointments Grid */}
                    {filter !== "pending" && (
                        <div className="grid gap-4">
                            {filteredAppointments.map((apt, index) => (
                                <motion.div
                                    key={apt.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="group relative p-6 rounded-3xl bg-card border border-border/50 overflow-hidden hover:border-primary/30 transition-all duration-300"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                    <div className="relative flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-4 flex-1">
                                            <div
                                                className={cn(
                                                    "w-14 h-14 rounded-2xl flex items-center justify-center",
                                                    apt.type === "video"
                                                        ? "bg-gradient-to-br from-accent/20 to-accent/10"
                                                        : "bg-gradient-to-br from-primary/20 to-primary/10"
                                                )}
                                            >
                                                {apt.type === "video" ? (
                                                    <Video className="w-6 h-6 text-accent" />
                                                ) : (
                                                    <User className="w-6 h-6 text-primary" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h3 className="font-semibold text-foreground text-lg">{apt.doctor}</h3>
                                                    <span
                                                        className={cn(
                                                            "px-2 py-0.5 rounded-full text-xs font-medium",
                                                            apt.status === "upcoming"
                                                                ? "bg-green-500/10 text-green-600 dark:text-green-400"
                                                                : apt.status === "completed"
                                                                    ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                                                    : "bg-red-500/10 text-red-600 dark:text-red-400"
                                                        )}
                                                    >
                                                        {apt.status}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-primary mb-3">{apt.specialty}</p>
                                                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                                    <span className="flex items-center gap-1.5">
                                                        <CalendarIcon className="w-4 h-4" />
                                                        {apt.date}
                                                    </span>
                                                    <span className="flex items-center gap-1.5">
                                                        <Clock className="w-4 h-4" />
                                                        {apt.time}
                                                    </span>
                                                    {apt.location && (
                                                        <span className="flex items-center gap-1.5">
                                                            <MapPin className="w-4 h-4" />
                                                            {apt.location}
                                                        </span>
                                                    )}
                                                </div>
                                                {apt.notes && (
                                                    <p className="mt-3 text-sm text-muted-foreground italic">Note: {apt.notes}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {apt.status === "upcoming" && (
                                                <>
                                                    <button onClick={() => handleEditAppointment(apt)} className="p-2 rounded-xl hover:bg-secondary transition-colors">
                                                        <Edit className="w-4 h-4 text-muted-foreground" />
                                                    </button>
                                                    <button onClick={() => handleCancelAppointment(apt.id)} className="p-2 rounded-xl hover:bg-destructive/10 transition-colors">
                                                        <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                                                    </button>
                                                </>
                                            )}
                                            {apt.status === "completed" && (
                                                <button onClick={() => handleDownloadReport(apt)} className="p-2 rounded-xl hover:bg-secondary transition-colors">
                                                    <Download className="w-4 h-4 text-muted-foreground" />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {apt.status === "upcoming" && (
                                        <div className="relative mt-4 pt-4 border-t border-border/50 flex items-center gap-2">
                                            <Button
                                                onClick={() => handleToggleDetails(apt.id)}
                                                size="sm"
                                                className="flex-1 rounded-xl bg-primary hover:bg-primary/90"
                                            >
                                                {selectedAppointment === apt.id ? "Close" : (apt.type === "video" ? "Join Video Call" : "View Details")}
                                                <ChevronRight className="w-4 h-4 ml-2" />
                                            </Button>
                                            <Button
                                                onClick={() => handleReschedule(apt)}
                                                size="sm"
                                                variant="outline"
                                                className="flex-1 rounded-xl bg-transparent"
                                            >
                                                Reschedule
                                            </Button>
                                        </div>
                                    )}

                                    {/* Expandable Details */}
                                    <AnimatePresence>
                                        {selectedAppointment === apt.id && apt.status === "upcoming" && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="mt-4 pt-4 border-t border-border/50 space-y-3"
                                            >
                                                {apt.type === "video" ? (
                                                    <>
                                                        <p className="text-sm font-medium text-foreground">Video Call Link</p>
                                                        <button
                                                            onClick={() => toast({
                                                                title: "Launching Video Call",
                                                                description: "Opening video call in new window...",
                                                            })}
                                                            className="w-full p-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-medium transition-colors flex items-center justify-center gap-2"
                                                        >
                                                            <Video className="w-4 h-4" />
                                                            Launch Video Call
                                                        </button>
                                                        <p className="text-xs text-muted-foreground">The call will start in your browser</p>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                                            <div>
                                                                <p className="text-muted-foreground mb-1">Type</p>
                                                                <p className="font-medium">In-Person</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-muted-foreground mb-1">Status</p>
                                                                <p className="font-medium capitalize">{apt.status}</p>
                                                            </div>
                                                            {apt.location && (
                                                                <div className="col-span-2">
                                                                    <p className="text-muted-foreground mb-1">Location</p>
                                                                    <p className="font-medium">{apt.location}</p>
                                                                </div>
                                                            )}
                                                            {apt.notes && (
                                                                <div className="col-span-2">
                                                                    <p className="text-muted-foreground mb-1">Notes</p>
                                                                    <p className="font-medium">{apt.notes}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <Button
                                                            onClick={() => {
                                                                const mapUrl = `https://maps.google.com/?q=${encodeURIComponent(apt.location || "Lagos General Hospital")}`
                                                                window.open(mapUrl, '_blank')
                                                            }}
                                                            className="w-full rounded-xl"
                                                            variant="outline"
                                                        >
                                                            <MapPin className="w-4 h-4 mr-2" />
                                                            Get Directions
                                                        </Button>
                                                    </>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ))}
                        </div>
                    )}
                    {filteredAppointments.length === 0 && filter !== "pending" && (
                        <div className="text-center py-12">
                            <CalendarIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-foreground mb-2">No appointments found</h3>
                            <p className="text-sm text-muted-foreground mb-6">
                                {filter === "all" ? "You haven't requested any appointments yet" : `No ${filter} appointments`}
                            </p>
                            <Button onClick={handleRequestAppointment} className="bg-gradient-to-r from-primary to-primary/80">
                                <Plus className="w-4 h-4 mr-2" />
                                Request Your First Appointment
                            </Button>
                        </div>
                    )}
                </div>
            </main>

            {/* Request Appointment Modal */}
            <AnimatePresence>
                {showBookModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowBookModal(false)}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-card rounded-3xl max-w-md w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto"
                        >
                            <h3 className="text-2xl font-bold text-foreground mb-2">Request Appointment</h3>
                            <p className="text-muted-foreground mb-6">Submit a request and we'll match you with an available doctor</p>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-foreground mb-2 block">Select Hospital</label>
                                    <select
                                        className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground"
                                        value={selectedHospitalId}
                                        onChange={(e) => {
                                            setSelectedHospitalId(e.target.value)
                                            setSelectedDepartment("") // Reset department when hospital changes
                                        }}
                                    >
                                        <option value="">Select a hospital...</option>
                                        {linkedHospitals.map((hospital) => (
                                            <option key={hospital.id} value={hospital.id}>
                                                {hospital.name} - {hospital.city}
                                            </option>
                                        ))}
                                    </select>
                                    {linkedHospitals.length === 0 && (
                                        <p className="text-xs text-muted-foreground mt-1">No linked hospitals. Link a hospital first from your dashboard.</p>
                                    )}
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-foreground mb-2 block">Department / Specialty Needed</label>
                                    <select
                                        className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground"
                                        value={selectedDepartment}
                                        onChange={(e) => setSelectedDepartment(e.target.value)}
                                        disabled={!selectedHospitalId}
                                    >
                                        <option value="">Select a department...</option>
                                        {departments.map((dept) => (
                                            <option key={dept.id} value={dept.name}>
                                                {dept.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-foreground mb-2 block">Reason for Visit</label>
                                    <textarea
                                        className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground resize-none h-24"
                                        placeholder="Briefly describe your symptoms or reason for the appointment..."
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-foreground mb-2 block">Preferred Appointment Type</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setPreferredType("video")}
                                            className={cn(
                                                "px-4 py-3 rounded-xl font-medium transition-all",
                                                preferredType === "video"
                                                    ? "border-2 border-primary bg-primary/10 text-primary"
                                                    : "border border-border hover:bg-secondary text-foreground"
                                            )}
                                        >
                                            Video Call
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setPreferredType("in-person")}
                                            className={cn(
                                                "px-4 py-3 rounded-xl font-medium transition-all",
                                                preferredType === "in-person"
                                                    ? "border-2 border-primary bg-primary/10 text-primary"
                                                    : "border border-border hover:bg-secondary text-foreground"
                                            )}
                                        >
                                            In-Person
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-foreground mb-2 block">Urgency Level</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {(["low", "normal", "urgent"] as const).map((level) => (
                                            <button
                                                key={level}
                                                type="button"
                                                onClick={() => setUrgency(level)}
                                                className={cn(
                                                    "px-3 py-2 rounded-xl text-sm font-medium transition-all capitalize",
                                                    urgency === level
                                                        ? "border-2 border-primary bg-primary/10 text-primary"
                                                        : "border border-border hover:bg-secondary text-foreground"
                                                )}
                                            >
                                                {level}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="p-4 rounded-xl bg-secondary/30 border border-border/50">
                                    <p className="text-xs text-muted-foreground">
                                        <strong>Note:</strong> After submitting your request, the hospital will review it and assign an available doctor. You'll receive a notification once your appointment is confirmed.
                                    </p>
                                </div>
                                <div className="flex gap-3 mt-6">
                                    <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setShowBookModal(false)}>Cancel</Button>
                                    <Button
                                        className="flex-1 rounded-xl bg-gradient-to-r from-primary to-primary/80"
                                        onClick={handleSubmitRequest}
                                        disabled={submitting || !selectedHospitalId || !selectedDepartment || !reason.trim()}
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Submitting...
                                            </>
                                        ) : (
                                            "Submit Request"
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Edit Appointment Modal */}
            <AnimatePresence>
                {showEditModal && appointmentToEdit && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowEditModal(false)}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-card rounded-3xl max-w-md w-full p-6 shadow-xl"
                        >
                            <h3 className="text-2xl font-bold text-foreground mb-2">Edit Appointment</h3>
                            <p className="text-muted-foreground mb-6">{appointmentToEdit.doctor}</p>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-sm font-medium text-foreground mb-2 block">Date</label>
                                        <Input type="date" defaultValue="2025-12-05" className="rounded-xl" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-foreground mb-2 block">Time</label>
                                        <Input type="time" defaultValue="10:00" className="rounded-xl" />
                                    </div>
                                </div>
                                {appointmentToEdit.location && (
                                    <div>
                                        <label className="text-sm font-medium text-foreground mb-2 block">Location</label>
                                        <Input defaultValue={appointmentToEdit.location} className="rounded-xl" />
                                    </div>
                                )}
                                <div className="flex gap-3 mt-6">
                                    <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setShowEditModal(false)}>Cancel</Button>
                                    <Button
                                        className="flex-1 rounded-xl bg-gradient-to-r from-primary to-primary/80"
                                        onClick={() => {
                                            setShowEditModal(false)
                                            toast({
                                                title: "Appointment Updated",
                                                description: "Your appointment has been updated successfully.",
                                            })
                                        }}
                                    >
                                        Save Changes
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Reschedule Appointment Modal */}
            <AnimatePresence>
                {showRescheduleModal && appointmentToEdit && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowRescheduleModal(false)}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-card rounded-3xl max-w-md w-full p-6 shadow-xl"
                        >
                            <h3 className="text-2xl font-bold text-foreground mb-2">Reschedule Appointment</h3>
                            <p className="text-muted-foreground mb-6">{appointmentToEdit.doctor} - {appointmentToEdit.specialty}</p>
                            <div className="space-y-4">
                                <div className="p-4 rounded-xl bg-secondary/30 border border-border/50">
                                    <p className="text-sm text-muted-foreground mb-1">Current Appointment</p>
                                    <p className="font-medium text-foreground">{appointmentToEdit.date} at {appointmentToEdit.time}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-sm font-medium text-foreground mb-2 block">New Date</label>
                                        <Input type="date" className="rounded-xl" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-foreground mb-2 block">New Time</label>
                                        <Input type="time" className="rounded-xl" />
                                    </div>
                                </div>
                                <div className="flex gap-3 mt-6">
                                    <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setShowRescheduleModal(false)}>Cancel</Button>
                                    <Button
                                        className="flex-1 rounded-xl bg-gradient-to-r from-primary to-primary/80"
                                        onClick={() => {
                                            setShowRescheduleModal(false)
                                            toast({
                                                title: "Appointment Rescheduled",
                                                description: "Your appointment has been rescheduled successfully.",
                                            })
                                        }}
                                    >
                                        Confirm Reschedule
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Request Confirmation Modal */}
            <AnimatePresence>
                {showDeleteConfirmModal && requestToDelete && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowDeleteConfirmModal(false)}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-card rounded-3xl max-w-md w-full p-6 shadow-xl"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                                    <Trash2 className="w-6 h-6 text-destructive" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-foreground">Delete Request</h3>
                                    <p className="text-sm text-muted-foreground">This action cannot be undone</p>
                                </div>
                            </div>

                            <div className="p-4 rounded-xl bg-secondary/30 border border-border/50 mb-6">
                                <p className="text-sm text-foreground font-medium">{requestToDelete.hospital_name}</p>
                                <p className="text-sm text-muted-foreground">{requestToDelete.department}</p>
                                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{requestToDelete.reason}</p>
                            </div>

                            <p className="text-muted-foreground mb-6">
                                Are you sure you want to delete this appointment request?
                            </p>

                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    className="flex-1 rounded-xl"
                                    onClick={() => setShowDeleteConfirmModal(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="flex-1 rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                                    onClick={async () => {
                                        await handleCancelRequest(requestToDelete.id)
                                        setShowDeleteConfirmModal(false)
                                        setRequestToDelete(null)
                                    }}
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete Request
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
