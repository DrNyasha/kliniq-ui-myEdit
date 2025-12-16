"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { clinicianApi } from "@/lib/clinician-api"
import { Home, Users, Calendar, Award, Settings, LogOut, Star, X, MessageSquare, ClipboardList } from "lucide-react"

const doctorNavItems = [
    { icon: Home, label: "Dashboard", href: "/clinician" },
    { icon: Users, label: "Patients", href: "/clinician/patients" },
    { icon: MessageSquare, label: "Messages", href: "/clinician/messages" },
    { icon: Calendar, label: "Schedule", href: "/clinician/schedule" },
    { icon: Award, label: "Points", href: "/clinician/points", badge: "New" },
    { icon: Settings, label: "Settings", href: "/clinician/settings" },
]

const nurseNavItems = [
    { icon: Home, label: "Dashboard", href: "/clinician" },
    { icon: Users, label: "Patients", href: "/clinician/patients" },
    { icon: MessageSquare, label: "Messages", href: "/clinician/messages" },
    { icon: ClipboardList, label: "Requests", href: "/clinician/requests" },
    { icon: Award, label: "Points", href: "/clinician/points", badge: "New" },
    { icon: Settings, label: "Settings", href: "/clinician/settings" },
]

interface ClinicianSidebarProps {
    activePath: string
    pointsData?: { current: number }
    sidebarOpen?: boolean
    onClose?: () => void
}

export function ClinicianSidebar({
    activePath,
    pointsData,
    sidebarOpen = false,
    onClose
}: ClinicianSidebarProps) {
    const router = useRouter()
    const { user, logout, isLoading } = useAuth()
    const [badgeCounts, setBadgeCounts] = useState({ patients: 0, requests: 0 })

    // Determine role and navigation items
    const role = user?.role?.toLowerCase() === 'doctor' ? 'doctor' :
        user?.role?.toLowerCase() === 'nurse' ? 'nurse' : 'nurse'
    const navItems = role === "nurse" ? nurseNavItems : doctorNavItems

    // Get user display info
    const userInitials = user ? `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() : 'U'
    const userName = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : 'User'
    const userTitle = role === 'nurse' ? 'Triage Specialist' : 'General Physician'

    // Fetch sidebar counts
    useEffect(() => {
        const fetchCounts = async () => {
            try {
                const counts = await clinicianApi.getSidebarCounts()
                setBadgeCounts({
                    patients: counts.patients_count,
                    requests: counts.requests_count
                })
            } catch (error) {
                console.error('Failed to fetch sidebar counts:', error)
            }
        }

        if (user) {
            fetchCounts()
        }
    }, [user])

    const handleLogout = () => {
        logout()
        router.push("/auth")
    }

    const SidebarContent = () => (
        <>
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

            {/* Profile Card */}
            <div className="relative p-4 rounded-2xl bg-gradient-to-br from-primary/10 via-card to-accent/5 border border-border/50 mb-8 overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-primary/20 to-transparent rounded-bl-full" />
                <div className="relative flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-lg">
                        {userInitials}
                    </div>
                    <div>
                        <p className="font-semibold text-foreground">{role === 'doctor' ? 'Dr. ' : ''}{userName}</p>
                        <p className="text-xs text-muted-foreground">{userTitle}</p>
                    </div>
                </div>
                <div className="mt-4 flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-muted-foreground">Online</span>
                    </div>
                    {pointsData && (
                        <div className="flex items-center gap-1 text-xs text-primary">
                            <Star className="w-3 h-3 fill-primary" />
                            <span>{pointsData.current} pts</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-2">
                {navItems.map((item) => {
                    const isActive = activePath === item.href
                    const badge = item.href === "/clinician/patients" ? badgeCounts.patients :
                        item.href === "/clinician/requests" ? badgeCounts.requests : item.badge

                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            onClick={onClose}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                                isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                            )}
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium">{item.label}</span>
                            {badge && (
                                <span
                                    className={cn(
                                        "ml-auto px-2 py-0.5 rounded-full text-xs font-medium",
                                        typeof badge === "number" ? "bg-primary/20 text-primary" : "bg-accent/20 text-accent"
                                    )}
                                >
                                    {badge}
                                </span>
                            )}
                        </Link>
                    )
                })}
            </nav>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-border/50 space-y-2">
                <ThemeToggle />
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Log Out</span>
                </button>
            </div>
        </>
    )

    if (isLoading) {
        return (
            <aside className="hidden lg:flex flex-col w-72 bg-card border-r border-border/50 p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-10 bg-secondary/50 rounded-xl" />
                    <div className="h-12 bg-secondary/50 rounded-xl" />
                    <div className="h-24 bg-secondary/50 rounded-xl" />
                </div>
            </aside>
        )
    }

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex flex-col w-72 bg-card border-r border-border/50 p-6">
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar */}
            <AnimatePresence>
                {sidebarOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
                        />
                        {/* Sidebar */}
                        <motion.aside
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 30, stiffness: 300 }}
                            className="lg:hidden fixed left-0 top-0 bottom-0 w-72 bg-card border-r border-border/50 p-6 z-50 flex flex-col"
                        >
                            {/* Close button */}
                            <div className="flex items-center justify-between mb-6">
                                <span className="text-sm font-medium text-muted-foreground">Menu</span>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-xl hover:bg-secondary transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <SidebarContent />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}
