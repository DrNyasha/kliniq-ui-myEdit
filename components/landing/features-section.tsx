"use client"

import { useEffect, useRef, useState } from "react"
import { Globe, MessageSquare, Shield, Stethoscope, Clock, Users } from "lucide-react"

const features = [
  {
    icon: Globe,
    title: "Multilingual AI",
    description:
      "Powered by N-ATLaS, supporting Yoruba, Hausa, Igbo, Swahili, and 20+ African languages with cultural context understanding.",
    gradient: "from-primary to-primary/60",
  },
  {
    icon: MessageSquare,
    title: "Smart Triage",
    description:
      "AI-powered symptom analysis that creates structured summaries for clinicians, reducing consultation time by 40%.",
    gradient: "from-accent to-accent/60",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description:
      "End-to-end encryption, HIPAA compliant, with full patient control over their data and recording consent.",
    gradient: "from-primary to-accent",
  },
  {
    icon: Stethoscope,
    title: "Doctor Dashboard",
    description:
      "Streamlined interface for nurses and doctors with AI-assisted responses, escalation routing, and structured notes.",
    gradient: "from-accent to-primary",
  },
  {
    icon: Clock,
    title: "Doctor Replay",
    description:
      "Patients can ask 'What did the doctor say?' and get simple explanations in their native language anytime.",
    gradient: "from-primary/80 to-accent/80",
  },
  {
    icon: Users,
    title: "Hospital Integration",
    description:
      "Seamless integration with existing hospital systems. Analytics, patient retention tools, and subscription management.",
    gradient: "from-accent/80 to-primary/80",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-32 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-gradient-to-l from-primary/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-r from-accent/10 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            Features
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            <span className="text-foreground">Everything you need for </span>
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">better care</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Kliniq combines cutting-edge AI with deep cultural understanding to create a healthcare communication
            platform that actually works for Africa.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}

function FeatureCard({ feature, index }: { feature: (typeof features)[0]; index: number }) {
  const [isVisible, setIsVisible] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), index * 100)
        }
      },
      { threshold: 0.1 },
    )

    if (cardRef.current) {
      observer.observe(cardRef.current)
    }

    return () => observer.disconnect()
  }, [index])

  const Icon = feature.icon

  return (
    <div
      ref={cardRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      {/* Hover glow effect */}
      <div
        className={`absolute -inset-0.5 bg-gradient-to-r ${feature.gradient} rounded-3xl blur-lg transition-opacity duration-500 ${isHovered ? "opacity-30" : "opacity-0"}`}
      />

      {/* Card */}
      <div className="relative h-full bg-gradient-to-br from-card to-card/50 backdrop-blur-sm rounded-3xl p-8 border border-border/50 hover:border-primary/30 transition-all duration-500">
        {/* Icon */}
        <div
          className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} p-0.5 mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}
        >
          <div className="w-full h-full bg-card rounded-2xl flex items-center justify-center">
            <Icon
              className={`w-6 h-6 bg-gradient-to-br ${feature.gradient} bg-clip-text`}
              style={{ color: "var(--primary)" }}
            />
          </div>
        </div>

        {/* Content */}
        <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
          {feature.title}
        </h3>
        <p className="text-muted-foreground leading-relaxed">{feature.description}</p>

        {/* Decorative corner */}
        <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
    </div>
  )
}
