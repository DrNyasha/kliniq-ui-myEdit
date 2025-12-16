"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/theme-toggle"
import { NotificationsDropdown } from "@/components/notifications-dropdown"
import { cn } from "@/lib/utils"
import { ClinicianSidebar } from "@/components/clinician-sidebar"
import { useAuth } from "@/contexts/auth-context"
import { clinicianApi } from "@/lib/clinician-api"
import {
    Settings as SettingsIcon,
    Bell,
    LogOut,
    Menu,
    Home,
    Users,
    Calendar,
    Award,
    User,
    Shield,
    Mic,
    ChevronRight,
    Edit2,
} from "lucide-react"

export default function ClinicianSettingsPage() {
    const [mounted, setMounted] = useState(false)
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [isEditingProfile, setIsEditingProfile] = useState(false)
    const [recordingEnabled, setRecordingEnabled] = useState(true)
    const [loading, setLoading] = useState(true)
    const [hospitalName, setHospitalName] = useState<string | null>(null)
    const [notifications, setNotifications] = useState({
        newPatients: true,
        queryAlerts: true,
        pointsMilestones: true,
    })
    const { user } = useAuth()

    useEffect(() => {
        setMounted(true)
        fetchProfileData()
    }, [])

    const fetchProfileData = async () => {
        try {
            setLoading(true)
            const dashboardData = await clinicianApi.getDashboard()
            setHospitalName(dashboardData.hospital_name || null)
        } catch (error) {
            console.error('Failed to fetch profile data:', error)
        } finally {
            setLoading(false)
        }
    }

    const fullName = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : ''
    const role = user?.role?.toLowerCase() === 'doctor' ? 'Doctor' : 'Nurse'

    if (!mounted) return null

    return (
        <div className="min-h-screen bg-background flex">
            <ClinicianSidebar activePath="/clinician/settings" sidebarOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <main className="flex-1 flex flex-col min-h-screen">
                <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/50 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-secondary transition-colors">
                                <Menu className="w-5 h-5" />
                            </button>
                            <div>
                                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">Settings</h1>
                                <p className="text-sm text-muted-foreground">Manage your profile and preferences</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <NotificationsDropdown />
                            <div className="hidden md:block">
                                <ThemeToggle />
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex-1 p-6 overflow-y-auto">
                    <div className="max-w-4xl mx-auto space-y-6">
                        {/* Profile */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-6 rounded-3xl bg-card border border-border/50"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                                        <User className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-foreground">Professional Profile</h2>
                                        <p className="text-sm text-muted-foreground">Update your professional information</p>
                                    </div>
                                </div>
                                {!isEditingProfile && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="rounded-xl"
                                        onClick={() => setIsEditingProfile(true)}
                                    >
                                        <Edit2 className="w-4 h-4 mr-2" />
                                        Edit
                                    </Button>
                                )}
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
                                    <Input value={fullName || ''} className="rounded-xl" disabled={!isEditingProfile} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">Role</label>
                                    <Input value={role} className="rounded-xl" disabled />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                                    <Input value={user?.email || ''} className="rounded-xl" disabled />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">Phone Number</label>
                                    <Input type="tel" value={user?.phone || ''} className="rounded-xl" disabled={!isEditingProfile} />
                                </div>
                                {hospitalName && (
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-foreground mb-2">Hospital/Clinic</label>
                                        <Input value={hospitalName} className="rounded-xl" disabled />
                                    </div>
                                )}
                            </div>
                            {isEditingProfile && (
                                <div className="mt-6 flex justify-end gap-3">
                                    <Button variant="outline" className="rounded-xl bg-transparent" onClick={() => setIsEditingProfile(false)}>
                                        Cancel
                                    </Button>
                                    <Button className="rounded-xl bg-gradient-to-r from-primary to-primary/80" onClick={() => setIsEditingProfile(false)}>
                                        Save Changes
                                    </Button>
                                </div>
                            )}
                        </motion.div>

                        {/* Recording Preferences */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="p-6 rounded-3xl bg-card border border-border/50"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center">
                                    <Mic className="w-5 h-5 text-accent" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-foreground">Recording Preferences</h2>
                                    <p className="text-sm text-muted-foreground">Control consultation recording settings</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 rounded-2xl bg-secondary/30">
                                    <div>
                                        <p className="font-medium text-foreground">Allow Consultation Recording</p>
                                        <p className="text-sm text-muted-foreground">Enable patients to record consultations</p>
                                    </div>
                                    <button
                                        onClick={() => setRecordingEnabled(!recordingEnabled)}
                                        className={cn(
                                            "w-12 h-6 rounded-full transition-colors duration-200 relative",
                                            recordingEnabled ? "bg-primary" : "bg-muted-foreground/30"
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                "absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200",
                                                recordingEnabled ? "right-0.5" : "left-0.5"
                                            )}
                                        />
                                    </button>
                                </div>
                                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                                    <p className="text-sm text-amber-600 dark:text-amber-400">
                                        <strong>Note:</strong> Disabling recording will prevent patients from recording consultations for quality assurance and reference purposes.
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Notifications */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="p-6 rounded-3xl bg-card border border-border/50"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-kliniq-cyan/20 to-kliniq-cyan/10 flex items-center justify-center">
                                    <Bell className="w-5 h-5 text-kliniq-cyan" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
                                    <p className="text-sm text-muted-foreground">Manage your notification preferences</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                {Object.entries(notifications).map(([key, value]) => (
                                    <div key={key} className="flex items-center justify-between p-4 rounded-2xl bg-secondary/30">
                                        <div>
                                            <p className="font-medium text-foreground capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</p>
                                            <p className="text-sm text-muted-foreground">
                                                Receive notifications for {key.toLowerCase()}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setNotifications({ ...notifications, [key]: !value })}
                                            className={cn(
                                                "w-12 h-6 rounded-full transition-colors duration-200 relative",
                                                value ? "bg-primary" : "bg-muted-foreground/30"
                                            )}
                                        >
                                            <div
                                                className={cn(
                                                    "absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200",
                                                    value ? "right-0.5" : "left-0.5"
                                                )}
                                            />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Security */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="p-6 rounded-3xl bg-card border border-border/50"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500/20 to-red-500/10 flex items-center justify-center">
                                    <Shield className="w-5 h-5 text-red-500" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-foreground">Security & Privacy</h2>
                                    <p className="text-sm text-muted-foreground">Manage your account security</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-secondary/30 hover:bg-secondary/50 transition-colors">
                                    <span className="text-foreground font-medium">Change Password</span>
                                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                                </button>
                                <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-secondary/30 hover:bg-secondary/50 transition-colors">
                                    <span className="text-foreground font-medium">Two-Factor Authentication</span>
                                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                                </button>
                                <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-secondary/30 hover:bg-secondary/50 transition-colors">
                                    <span className="text-foreground font-medium">Privacy Policy</span>
                                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </main>
        </div>
    )
}
