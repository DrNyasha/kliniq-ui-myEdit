"use client"

import { useEffect, useRef, useState } from "react"

const steps = [
  {
    number: "01",
    title: "Patient Speaks",
    description: "Patient describes symptoms in their native language via voice or text. No English required.",
    visual: "speak",
  },
  {
    number: "02",
    title: "AI Processes",
    description:
      "N-ATLaS AI translates, extracts symptoms, determines urgency, and creates a structured triage summary.",
    visual: "process",
  },
  {
    number: "03",
    title: "Clinician Reviews",
    description: "Nurses handle routine cases, escalate complex ones to doctors. AI suggests responses for approval.",
    visual: "review",
  },
  {
    number: "04",
    title: "Patient Understands",
    description:
      "Doctor's instructions are explained back to the patient in their language using simple, cultural terms.",
    visual: "understand",
  },
]

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="relative py-16 bg-gradient-to-b from-background via-secondary/30 to-background overflow-hidden"
    >
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gradient-radial from-primary/5 via-transparent to-transparent rounded-full" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-6">
            How It Works
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            <span className="text-foreground">Simple for patients, </span>
            <span className="bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
              powerful for providers
            </span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Four seamless steps that transform healthcare communication across language barriers.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent -translate-y-1/2" />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {steps.map((step, index) => (
              <StepCard key={step.number} step={step} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function StepCard({ step, index }: { step: (typeof steps)[0]; index: number }) {
  const [isVisible, setIsVisible] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), index * 150)
        }
      },
      { threshold: 0.1 },
    )

    if (cardRef.current) {
      observer.observe(cardRef.current)
    }

    return () => observer.disconnect()
  }, [index])

  return (
    <div
      ref={cardRef}
      className={`relative transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
    >
      {/* Step Number */}
      <div className="relative z-10 mx-auto w-16 h-16 mb-6">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-2xl rotate-45 group-hover:rotate-[60deg] transition-transform duration-500" />
        <div className="absolute inset-1 bg-background rounded-xl rotate-45" />
        <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          {step.number}
        </span>
      </div>

      {/* Content */}
      <div className="text-center">
        <h3 className="text-xl font-semibold text-foreground mb-3">{step.title}</h3>
        <p className="text-muted-foreground leading-relaxed">{step.description}</p>
      </div>

      {/* Connector arrow for desktop */}
      {index < steps.length - 1 && (
        <div className="hidden lg:block absolute top-8 -right-3 w-6 h-6">
          <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-primary/30">
            <path
              d="M5 12h14m-7-7l7 7-7 7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
    </div>
  )
}
