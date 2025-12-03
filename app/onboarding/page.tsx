"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Globe,
  User,
  Stethoscope,
  Phone,
  Calendar,
  MapPin,
  Sparkles,
  Volume2,
  Link2,
  Search,
} from "lucide-react"
import { cn } from "@/lib/utils"

type Step = 1 | 2 | 3

interface Language {
  id: string
  name: string
  nativeName: string
  greeting: string
  flag: string
}

const languages: Language[] = [
  { id: "en", name: "English", nativeName: "English", greeting: "Hello!", flag: "🇬🇧" },
  { id: "yo", name: "Yoruba", nativeName: "Èdè Yorùbá", greeting: "Ẹ káàbọ̀!", flag: "🇳🇬" },
  { id: "ha", name: "Hausa", nativeName: "Harshen Hausa", greeting: "Sannu!", flag: "🇳🇬" },
  { id: "ig", name: "Igbo", nativeName: "Asụsụ Igbo", greeting: "Nnọọ!", flag: "🇳🇬" },
  { id: "pcm", name: "Pidgin", nativeName: "Naija Pidgin", greeting: "How you dey!", flag: "🇳🇬" },
  { id: "sw", name: "Swahili", nativeName: "Kiswahili", greeting: "Habari!", flag: "🇰🇪" },
  { id: "am", name: "Amharic", nativeName: "አማርኛ", greeting: "ሰላም!", flag: "🇪🇹" },
  { id: "zu", name: "Zulu", nativeName: "isiZulu", greeting: "Sawubona!", flag: "🇿🇦" },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Form state
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null)
  const [playingAudio, setPlayingAudio] = useState<string | null>(null)
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    dateOfBirth: "",
    location: "",
  })
  const [doctorCode, setDoctorCode] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [linkedDoctor, setLinkedDoctor] = useState<{ name: string; hospital: string; specialty: string } | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handlePlayGreeting = (langId: string) => {
    setPlayingAudio(langId)
    // Simulate audio playback
    setTimeout(() => setPlayingAudio(null), 2000)
  }

  const handleLinkDoctor = () => {
    if (doctorCode.length >= 6) {
      // Simulate doctor lookup
      setLinkedDoctor({
        name: "Dr. Oluwaseun Adeyemi",
        hospital: "Lagos University Teaching Hospital",
        specialty: "General Medicine",
      })
    }
  }

  const handleComplete = async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    router.push("/dashboard")
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return selectedLanguage !== null
      case 2:
        return profile.firstName && profile.lastName && profile.phone
      case 3:
        return true // Doctor linking is optional
      default:
        return false
    }
  }

  const steps = [
    { number: 1, label: "Language", icon: Globe },
    { number: 2, label: "Profile", icon: User },
    { number: 3, label: "Link Doctor", icon: Stethoscope },
  ]

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-primary/10 via-accent/5 to-transparent rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-accent/10 via-primary/5 to-transparent rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" />

        {/* Floating orbs */}
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-primary/20 rounded-full animate-float"
            style={{
              top: `${15 + i * 18}%`,
              left: `${5 + i * 8}%`,
              animationDelay: `${i * 0.7}s`,
            }}
          />
        ))}
        {[...Array(5)].map((_, i) => (
          <div
            key={`right-${i}`}
            className="absolute w-2 h-2 bg-accent/20 rounded-full animate-float"
            style={{
              top: `${20 + i * 16}%`,
              right: `${8 + i * 6}%`,
              animationDelay: `${i * 0.5 + 0.3}s`,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between p-6 md:px-12">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
            <div className="relative w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center transform group-hover:scale-105 transition-transform">
              <span className="text-primary-foreground font-bold text-lg">K</span>
            </div>
          </div>
          <span className="text-xl font-bold text-foreground">Kliniq</span>
        </Link>
        <ThemeToggle />
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-6 py-8 md:py-12">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center gap-2 md:gap-4">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = currentStep === step.number
              const isCompleted = currentStep > step.number

              return (
                <div key={step.number} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <motion.div
                      initial={false}
                      animate={{
                        scale: isActive ? 1.1 : 1,
                        backgroundColor: isCompleted
                          ? "var(--primary)"
                          : isActive
                            ? "var(--primary)"
                            : "var(--secondary)",
                      }}
                      className={cn(
                        "relative w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center transition-all duration-300",
                        isActive && "shadow-lg shadow-primary/30",
                      )}
                    >
                      {isCompleted ? (
                        <Check className="w-5 h-5 md:w-6 md:h-6 text-primary-foreground" />
                      ) : (
                        <Icon
                          className={cn(
                            "w-5 h-5 md:w-6 md:h-6 transition-colors",
                            isActive ? "text-primary-foreground" : "text-muted-foreground",
                          )}
                        />
                      )}
                      {isActive && (
                        <motion.div
                          layoutId="activeStep"
                          className="absolute inset-0 rounded-2xl ring-2 ring-primary ring-offset-2 ring-offset-background"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                    </motion.div>
                    <span
                      className={cn(
                        "text-xs md:text-sm mt-2 font-medium transition-colors",
                        isActive ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {step.label}
                    </span>
                  </div>

                  {index < steps.length - 1 && (
                    <div className="w-8 md:w-16 h-0.5 mx-2 md:mx-4 rounded-full overflow-hidden bg-secondary">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: currentStep > step.number ? "100%" : "0%" }}
                        className="h-full bg-gradient-to-r from-primary to-accent"
                        transition={{ duration: 0.4 }}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="space-y-8"
            >
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                  <Sparkles className="w-4 h-4" />
                  AI-Powered Translation
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Choose Your Language</h1>
                <p className="text-muted-foreground text-lg max-w-md mx-auto">
                  Kliniq will communicate with you in your preferred language for a better healthcare experience
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {languages.map((lang) => (
                  <motion.button
                    key={lang.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedLanguage(lang.id)}
                    className={cn(
                      "relative group p-5 rounded-2xl border-2 transition-all duration-300 text-left overflow-hidden",
                      selectedLanguage === lang.id
                        ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                        : "border-border/50 bg-card hover:border-primary/50 hover:bg-primary/5",
                    )}
                  >
                    {/* Selected indicator */}
                    {selectedLanguage === lang.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-3 right-3 w-6 h-6 bg-primary rounded-full flex items-center justify-center"
                      >
                        <Check className="w-4 h-4 text-primary-foreground" />
                      </motion.div>
                    )}

                    {/* Hover glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <div className="relative z-10">
                      <span className="text-2xl mb-3 block">{lang.flag}</span>
                      <h3 className="font-semibold text-foreground mb-0.5">{lang.name}</h3>
                      <p className="text-xs text-muted-foreground mb-3">{lang.nativeName}</p>

                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handlePlayGreeting(lang.id)
                        }}
                        className={cn(
                          "flex items-center gap-2 text-xs font-medium transition-colors",
                          playingAudio === lang.id ? "text-primary" : "text-muted-foreground hover:text-primary",
                        )}
                      >
                        <Volume2 className={cn("w-3.5 h-3.5", playingAudio === lang.id && "animate-pulse")} />
                        <span>{lang.greeting}</span>
                      </button>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="max-w-lg mx-auto space-y-8"
            >
              <div className="text-center">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Tell Us About Yourself</h1>
                <p className="text-muted-foreground text-lg">This helps us personalize your healthcare experience</p>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-foreground">
                      First Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="firstName"
                        value={profile.firstName}
                        onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                        placeholder="First name"
                        className="pl-12 h-12 bg-secondary/30 border-border/50 rounded-xl focus:border-primary focus:ring-primary/20"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-foreground">
                      Last Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="lastName"
                        value={profile.lastName}
                        onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                        placeholder="Last name"
                        className="pl-12 h-12 bg-secondary/30 border-border/50 rounded-xl focus:border-primary focus:ring-primary/20"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-foreground">
                    Phone Number
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      placeholder="+234 XXX XXX XXXX"
                      className="pl-12 h-12 bg-secondary/30 border-border/50 rounded-xl focus:border-primary focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dob" className="text-foreground">
                    Date of Birth
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="dob"
                      type="date"
                      value={profile.dateOfBirth}
                      onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
                      className="pl-12 h-12 bg-secondary/30 border-border/50 rounded-xl focus:border-primary focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="text-foreground">
                    Location (Optional)
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="location"
                      value={profile.location}
                      onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                      placeholder="City, State"
                      className="pl-12 h-12 bg-secondary/30 border-border/50 rounded-xl focus:border-primary focus:ring-primary/20"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="max-w-lg mx-auto space-y-8"
            >
              <div className="text-center">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Link Your Doctor</h1>
                <p className="text-muted-foreground text-lg">
                  Connect with your healthcare provider for seamless communication
                </p>
              </div>

              {/* Doctor Code Input */}
              <div className="space-y-4">
                <div className="relative p-6 rounded-2xl bg-gradient-to-br from-primary/5 via-card to-accent/5 border border-border/50">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full" />

                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Link2 className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Enter Doctor Code</h3>
                        <p className="text-xs text-muted-foreground">Found on your doctor's visiting card</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Input
                        value={doctorCode}
                        onChange={(e) => setDoctorCode(e.target.value.toUpperCase())}
                        placeholder="e.g., DOC-A1B2C3"
                        maxLength={10}
                        className="h-12 bg-background/50 border-border/50 rounded-xl focus:border-primary font-mono text-lg tracking-wider uppercase"
                      />
                      <Button
                        onClick={handleLinkDoctor}
                        disabled={doctorCode.length < 6}
                        className="h-12 px-6 rounded-xl bg-primary hover:bg-primary/90"
                      >
                        Link
                      </Button>
                    </div>
                  </div>
                </div>

                {/* OR Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border/50" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-4 text-muted-foreground">Or search</span>
                  </div>
                </div>

                {/* Search Doctor/Hospital */}
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by doctor name or hospital..."
                      className="pl-12 h-12 bg-secondary/30 border-border/50 rounded-xl focus:border-primary"
                    />
                  </div>
                </div>

                {/* Linked Doctor Card */}
                <AnimatePresence>
                  {linkedDoctor && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="p-5 rounded-2xl bg-gradient-to-br from-primary/10 via-card to-accent/10 border-2 border-primary/30"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                          <Stethoscope className="w-7 h-7 text-primary-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-foreground truncate">{linkedDoctor.name}</h3>
                            <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                              <Check className="w-3 h-3 text-green-500" />
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{linkedDoctor.specialty}</p>
                          <p className="text-xs text-muted-foreground mt-1 truncate">{linkedDoctor.hospital}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Skip hint */}
                <p className="text-center text-sm text-muted-foreground">
                  You can also skip this step and link your doctor later
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-12 max-w-lg mx-auto">
          <Button
            variant="ghost"
            onClick={() => setCurrentStep((prev) => (prev > 1 ? ((prev - 1) as Step) : prev))}
            disabled={currentStep === 1}
            className="h-12 px-6 rounded-xl text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>

          <Button
            onClick={() => {
              if (currentStep < 3) {
                setCurrentStep((prev) => (prev + 1) as Step)
              } else {
                handleComplete()
              }
            }}
            disabled={!canProceed() || isLoading}
            className="relative h-12 px-8 rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 group"
          >
            <span className="flex items-center gap-2">
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <>
                  {currentStep === 3 ? "Complete Setup" : "Continue"}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </span>
          </Button>
        </div>
      </main>
    </div>
  )
}
