"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/theme-toggle"
import { NotificationsDropdown } from "@/components/notifications-dropdown"
import { cn } from "@/lib/utils"
import { PatientSidebar } from "@/components/patient-sidebar"
import { LinkHospitalModal } from "@/components/dashboard/link-hospital-modal"
import { useToast } from "@/hooks/use-toast"
import { settingsApi, NotificationSettings } from "@/lib/settings-api"
import { dashboardApi, LinkedHospital } from "@/lib/dashboard-api"
import {
    Settings as SettingsIcon,
    Bell,
    LogOut,
    Menu,
    Home,
    MessageSquare,
    Calendar,
    History,
    User,
    Globe,
    Shield,
    Smartphone,
    Link as LinkIcon,
    Trash2,
    Plus,
    Check,
    ChevronRight,
    Edit,
    Edit2,
    Building2,
    Star,
    MapPin,
    Loader2,
} from "lucide-react"

const languages = [
    { code: "yo", name: "Yoruba", native: "Yorùbá" },
    { code: "ig", name: "Igbo", native: "Igbo" },
    { code: "ha", name: "Hausa", native: "Hausa" },
    { code: "en", name: "English", native: "English" },
]

export default function SettingsPage() {
    const [mounted, setMounted] = useState(false)
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [isEditingProfile, setIsEditingProfile] = useState(false)
    const [selectedLanguage, setSelectedLanguage] = useState("en")
    const [notifications, setNotifications] = useState<NotificationSettings>({
        appointments: true,
        messages: true,
        reminders: true,
        updates: false,
    })

    // Profile data
    const [userName, setUserName] = useState("")
    const [userEmail, setUserEmail] = useState("")
    const [userPhone, setUserPhone] = useState("")

    // Linked hospitals
    const [linkedHospitals, setLinkedHospitals] = useState<LinkedHospital[]>([])
    const [showLinkModal, setShowLinkModal] = useState(false)
    const [unlinking, setUnlinking] = useState<string | null>(null)

    const { toast } = useToast()

    // Fetch all data on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch settings and dashboard data in parallel
                const [settings, dashboard] = await Promise.all([
                    settingsApi.getSettings(),
                    dashboardApi.getDashboard()
                ])

                setSelectedLanguage(settings.preferred_language || "en")
                setNotifications(settings.notification_settings)

                // Set user info from dashboard
                setUserName(dashboard.user_name || "")
                setLinkedHospitals(dashboard.linked_hospitals || [])
            } catch (error) {
                console.error("Failed to load settings:", error)
            } finally {
                setLoading(false)
            }
        }

        setMounted(true)
        fetchData()
    }, [])

    // Save language preference
    const handleLanguageChange = async (langCode: string) => {
        setSelectedLanguage(langCode)
        setSaving(true)
        try {
            await settingsApi.updateSettings({ preferred_language: langCode })
            toast({ title: "Saved", description: "Language preference updated" })
        } catch (error) {
            toast({ title: "Error", description: "Failed to save language", variant: "destructive" })
        } finally {
            setSaving(false)
        }
    }

    // Save notification setting
    const handleNotificationChange = async (key: keyof NotificationSettings) => {
        const newSettings = { ...notifications, [key]: !notifications[key] }
        setNotifications(newSettings)
        setSaving(true)
        try {
            await settingsApi.updateSettings({ notification_settings: newSettings })
            toast({ title: "Saved", description: "Notification setting updated" })
        } catch (error) {
            toast({ title: "Error", description: "Failed to save setting", variant: "destructive" })
        } finally {
            setSaving(false)
        }
    }

    // Handle hospital linked
    const handleHospitalLinked = (hospital: LinkedHospital) => {
        setLinkedHospitals(prev => [...prev, hospital])
        setShowLinkModal(false)
        toast({ title: "Hospital Linked", description: `${hospital.name} has been linked to your account` })
    }

    // Unlink hospital
    const handleUnlinkHospital = async (hospitalId: string, hospitalName: string) => {
        setUnlinking(hospitalId)
        try {
            const result = await dashboardApi.unlinkHospital(hospitalId)
            if (result.success) {
                setLinkedHospitals(prev => prev.filter(h => h.id !== hospitalId))
                toast({ title: "Unlinked", description: `${hospitalName} has been removed` })
            } else {
                throw new Error(result.message)
            }
        } catch (error) {
            toast({ title: "Error", description: "Failed to unlink hospital", variant: "destructive" })
        } finally {
            setUnlinking(null)
        }
    }

    if (!mounted) return null

    return (
        <div className="min-h-screen bg-background flex">
            <PatientSidebar activePath="/dashboard/settings" sidebarOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <main className="flex-1 flex flex-col min-h-screen">
                <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 sm:px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-secondary transition-colors">
                                <Menu className="w-5 h-5" />
                            </button>
                            <div>
                                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">Settings</h1>
                                <p className="text-sm text-muted-foreground">Manage your account and preferences</p>
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

                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="flex-1 p-6 overflow-y-auto">
                        <div className="max-w-4xl mx-auto space-y-6">
                            {/* Profile Section */}
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
                                            <h2 className="text-lg font-semibold text-foreground">Profile Information</h2>
                                            <p className="text-sm text-muted-foreground">Your account details</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm text-muted-foreground">Full Name</label>
                                        <p className="font-medium text-foreground">{userName || "Not set"}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm text-muted-foreground">Language</label>
                                        <p className="font-medium text-foreground capitalize">
                                            {languages.find(l => l.code === selectedLanguage)?.name || selectedLanguage}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Language Preferences */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="p-6 rounded-3xl bg-card border border-border/50"
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center">
                                        <Globe className="w-5 h-5 text-accent" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-foreground">Language</h2>
                                        <p className="text-sm text-muted-foreground">Choose your preferred language</p>
                                    </div>
                                </div>
                                <div className="grid sm:grid-cols-2 gap-3">
                                    {languages.map((lang) => (
                                        <button
                                            key={lang.code}
                                            onClick={() => handleLanguageChange(lang.code)}
                                            disabled={saving}
                                            className={cn(
                                                "p-4 rounded-2xl border-2 transition-all duration-200 text-left disabled:opacity-50",
                                                selectedLanguage === lang.code
                                                    ? "border-primary bg-primary/10"
                                                    : "border-border/50 hover:border-primary/30"
                                            )}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium text-foreground">{lang.name}</p>
                                                    <p className="text-sm text-muted-foreground">{lang.native}</p>
                                                </div>
                                                {selectedLanguage === lang.code && <Check className="w-5 h-5 text-primary" />}
                                            </div>
                                        </button>
                                    ))}
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
                                        <p className="text-sm text-muted-foreground">Manage how you receive updates</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    {Object.entries(notifications).map(([key, value]) => (
                                        <div key={key} className="flex items-center justify-between p-4 rounded-2xl bg-secondary/30">
                                            <div>
                                                <p className="font-medium text-foreground capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Get notified about {key.toLowerCase()} activities
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleNotificationChange(key as keyof NotificationSettings)}
                                                disabled={saving}
                                                className={cn(
                                                    "w-12 h-6 rounded-full transition-colors duration-200 relative disabled:opacity-50",
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

                            {/* Linked Hospitals */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="p-6 rounded-3xl bg-card border border-border/50"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-green-500/10 flex items-center justify-center">
                                            <Building2 className="w-5 h-5 text-green-500" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-semibold text-foreground">Linked Hospitals</h2>
                                            <p className="text-sm text-muted-foreground">Healthcare facilities with access to your records</p>
                                        </div>
                                    </div>
                                    <Button size="sm" className="rounded-xl bg-primary" onClick={() => setShowLinkModal(true)}>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Link Hospital
                                    </Button>
                                </div>
                                <div className="space-y-3">
                                    {linkedHospitals.length === 0 ? (
                                        <div className="text-center py-8">
                                            <Building2 className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                                            <p className="text-muted-foreground">No hospitals linked yet</p>
                                            <p className="text-sm text-muted-foreground">Link a hospital to access their services</p>
                                        </div>
                                    ) : (
                                        linkedHospitals.map((hospital) => (
                                            <div key={hospital.id} className="flex items-center justify-between p-4 rounded-2xl bg-secondary/30">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                                                        <Building2 className="w-5 h-5 text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-foreground">{hospital.name}</p>
                                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                            <MapPin className="w-3 h-3" />
                                                            {hospital.location}
                                                        </div>
                                                        <div className="flex items-center gap-3 mt-1">
                                                            <span className="text-xs text-muted-foreground">Code: {hospital.hospital_code}</span>
                                                            <div className="flex items-center gap-1">
                                                                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                                                <span className="text-xs text-muted-foreground">{hospital.rating}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleUnlinkHospital(hospital.id, hospital.name)}
                                                    disabled={unlinking === hospital.id}
                                                    className="p-2 rounded-xl hover:bg-destructive/10 transition-colors disabled:opacity-50"
                                                >
                                                    {unlinking === hospital.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                                                    ) : (
                                                        <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                                                    )}
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </motion.div>

                            {/* Privacy & Security */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="p-6 rounded-3xl bg-card border border-border/50"
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500/20 to-red-500/10 flex items-center justify-center">
                                        <Shield className="w-5 h-5 text-red-500" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-foreground">Privacy & Security</h2>
                                        <p className="text-sm text-muted-foreground">Manage your data and account security</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-secondary/30 hover:bg-secondary/50 transition-colors">
                                        <div>
                                            <p className="font-medium text-foreground text-left">Change Password</p>
                                            <p className="text-sm text-muted-foreground">Update your account password</p>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                                    </button>
                                    <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-secondary/30 hover:bg-secondary/50 transition-colors">
                                        <div>
                                            <p className="font-medium text-foreground text-left">Two-Factor Authentication</p>
                                            <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                                    </button>
                                    <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-secondary/30 hover:bg-secondary/50 transition-colors">
                                        <div>
                                            <p className="font-medium text-foreground text-left">Download My Data</p>
                                            <p className="text-sm text-muted-foreground">Get a copy of all your data</p>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                                    </button>
                                </div>
                            </motion.div>

                            {/* Danger Zone */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="p-6 rounded-3xl bg-card border border-destructive/30"
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-destructive/20 to-destructive/10 flex items-center justify-center">
                                        <LogOut className="w-5 h-5 text-destructive" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-foreground">Danger Zone</h2>
                                        <p className="text-sm text-muted-foreground">Irreversible actions</p>
                                    </div>
                                </div>
                                <Button variant="destructive" className="rounded-xl">
                                    Delete Account
                                </Button>
                            </motion.div>
                        </div>
                    </div>
                )}
            </main>

            {/* Link Hospital Modal */}
            <LinkHospitalModal
                isOpen={showLinkModal}
                onClose={() => setShowLinkModal(false)}
                onLinked={handleHospitalLinked}
                linkedHospitalIds={linkedHospitals.map(h => h.id)}
            />
        </div>
    )
}
