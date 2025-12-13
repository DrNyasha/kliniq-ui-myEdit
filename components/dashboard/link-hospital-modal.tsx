"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Search, Building2, MapPin, Star, Loader2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { dashboardApi, HospitalSearchResult, LinkedHospital } from "@/lib/dashboard-api"
import { cn } from "@/lib/utils"

interface LinkHospitalModalProps {
    isOpen: boolean
    onClose: () => void
    onLinked: (hospital: LinkedHospital) => void
}

export function LinkHospitalModal({ isOpen, onClose, onLinked }: LinkHospitalModalProps) {
    const [mode, setMode] = useState<"code" | "search">("code")
    const [hospitalCode, setHospitalCode] = useState("")
    const [searchQuery, setSearchQuery] = useState("")
    const [hospitals, setHospitals] = useState<HospitalSearchResult[]>([])
    const [selectedHospital, setSelectedHospital] = useState<HospitalSearchResult | null>(null)
    const [loading, setLoading] = useState(false)
    const [linking, setLinking] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    // Load all hospitals initially
    useEffect(() => {
        if (isOpen) {
            loadHospitals()
        }
    }, [isOpen])

    // Search hospitals when query changes
    useEffect(() => {
        if (searchQuery.length >= 2) {
            const timer = setTimeout(() => {
                searchHospitals(searchQuery)
            }, 300)
            return () => clearTimeout(timer)
        } else if (searchQuery.length === 0) {
            loadHospitals()
        }
    }, [searchQuery])

    const loadHospitals = async () => {
        setLoading(true)
        try {
            const response = await dashboardApi.getHospitals()
            setHospitals(response.hospitals)
        } catch (err) {
            console.error("Failed to load hospitals:", err)
        } finally {
            setLoading(false)
        }
    }

    const searchHospitals = async (query: string) => {
        setLoading(true)
        try {
            const response = await dashboardApi.searchHospitals(query)
            setHospitals(response.hospitals)
        } catch (err) {
            console.error("Failed to search hospitals:", err)
        } finally {
            setLoading(false)
        }
    }

    const handleLinkByCode = async () => {
        if (!hospitalCode.trim()) {
            setError("Please enter a hospital code")
            return
        }

        setLinking(true)
        setError(null)
        try {
            const response = await dashboardApi.linkHospital({ hospital_code: hospitalCode.toUpperCase() })
            if (response.success && response.hospital) {
                setSuccess(response.message)
                onLinked(response.hospital)
                setTimeout(() => {
                    onClose()
                    resetForm()
                }, 1500)
            } else {
                setError(response.message)
            }
        } catch (err) {
            setError("Failed to link hospital. Please check the code and try again.")
        } finally {
            setLinking(false)
        }
    }

    const handleLinkById = async (hospital: HospitalSearchResult) => {
        setLinking(true)
        setError(null)
        setSelectedHospital(hospital)
        try {
            const response = await dashboardApi.linkHospital({ hospital_id: hospital.id })
            if (response.success && response.hospital) {
                setSuccess(response.message)
                onLinked(response.hospital)
                setTimeout(() => {
                    onClose()
                    resetForm()
                }, 1500)
            } else {
                setError(response.message)
            }
        } catch (err) {
            setError("Failed to link hospital. Please try again.")
        } finally {
            setLinking(false)
        }
    }

    const resetForm = () => {
        setHospitalCode("")
        setSearchQuery("")
        setSelectedHospital(null)
        setError(null)
        setSuccess(null)
        setMode("code")
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-x-4 top-[10%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[500px] max-h-[80vh] overflow-hidden bg-card border border-border/50 rounded-2xl shadow-2xl z-50"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-border/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                                    <Building2 className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-foreground">Link Hospital</h2>
                                    <p className="text-sm text-muted-foreground">Connect to a healthcare facility</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-xl hover:bg-secondary transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Mode Toggle */}
                        <div className="p-4 border-b border-border/50">
                            <div className="flex gap-2 p-1 bg-secondary/30 rounded-xl">
                                <button
                                    onClick={() => setMode("code")}
                                    className={cn(
                                        "flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all",
                                        mode === "code"
                                            ? "bg-primary text-white shadow-lg"
                                            : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    Enter Code
                                </button>
                                <button
                                    onClick={() => setMode("search")}
                                    className={cn(
                                        "flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all",
                                        mode === "search"
                                            ? "bg-primary text-white shadow-lg"
                                            : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    Search Hospitals
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-5 overflow-y-auto max-h-[50vh]">
                            {/* Success Message */}
                            <AnimatePresence>
                                {success && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="mb-4 p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-3"
                                    >
                                        <Check className="w-5 h-5 text-green-500" />
                                        <span className="text-sm text-green-500">{success}</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Error Message */}
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="mb-4 p-4 rounded-xl bg-destructive/10 border border-destructive/20"
                                    >
                                        <span className="text-sm text-destructive">{error}</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {mode === "code" ? (
                                /* Code Entry Mode */
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            Hospital Code
                                        </label>
                                        <Input
                                            value={hospitalCode}
                                            onChange={(e) => setHospitalCode(e.target.value.toUpperCase())}
                                            placeholder="e.g., HOSP-LUTH-001"
                                            className="h-12 rounded-xl bg-secondary/30 border-border/50"
                                        />
                                        <p className="text-xs text-muted-foreground mt-2">
                                            Ask your hospital for their unique linking code
                                        </p>
                                    </div>
                                    <Button
                                        onClick={handleLinkByCode}
                                        disabled={linking || !hospitalCode.trim()}
                                        className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90"
                                    >
                                        {linking ? (
                                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                        ) : null}
                                        Link Hospital
                                    </Button>
                                </div>
                            ) : (
                                /* Search Mode */
                                <div className="space-y-4">
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                        <Input
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Search by name or city..."
                                            className="h-12 pl-12 rounded-xl bg-secondary/30 border-border/50"
                                        />
                                    </div>

                                    {/* Hospital List */}
                                    <div className="space-y-2">
                                        {loading ? (
                                            <div className="flex items-center justify-center py-8">
                                                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                            </div>
                                        ) : hospitals.length === 0 ? (
                                            <p className="text-center py-8 text-muted-foreground">
                                                No hospitals found
                                            </p>
                                        ) : (
                                            hospitals.map((hospital) => (
                                                <button
                                                    key={hospital.id}
                                                    onClick={() => handleLinkById(hospital)}
                                                    disabled={linking}
                                                    className={cn(
                                                        "w-full p-4 rounded-xl border text-left transition-all",
                                                        selectedHospital?.id === hospital.id && linking
                                                            ? "bg-primary/10 border-primary/50"
                                                            : "bg-secondary/30 border-border/50 hover:bg-secondary/50 hover:border-primary/30"
                                                    )}
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <h3 className="font-semibold text-foreground">{hospital.name}</h3>
                                                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                                                <MapPin className="w-4 h-4" />
                                                                <span>{hospital.city}, {hospital.state}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 mt-2">
                                                                <span className="text-xs px-2 py-1 rounded-full bg-secondary text-muted-foreground">
                                                                    {hospital.type}
                                                                </span>
                                                                <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                                                                    {hospital.hospital_code}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1 text-yellow-500">
                                                            <Star className="w-4 h-4 fill-current" />
                                                            <span className="text-sm font-medium">{hospital.rating.toFixed(1)}</span>
                                                        </div>
                                                    </div>
                                                    {selectedHospital?.id === hospital.id && linking && (
                                                        <div className="mt-3 flex items-center gap-2 text-sm text-primary">
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                            <span>Linking...</span>
                                                        </div>
                                                    )}
                                                </button>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
