"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { ArrowRight, Play, Globe, Shield, Zap } from "lucide-react"
import { useEffect, useState } from "react"

const languages = ["Yoruba", "Hausa", "Igbo", "Swahili", "Pidgin", "Twi", "Zulu"]

export function HeroSection() {
  const [currentLang, setCurrentLang] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    const interval = setInterval(() => {
      setCurrentLang((prev) => (prev + 1) % languages.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large organic blob - top right */}
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-gradient-to-br from-primary/20 via-accent/10 to-transparent rounded-full blur-3xl animate-pulse-glow" />

        {/* Medium blob - bottom left */}
        <div
          className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-gradient-to-tr from-accent/20 via-primary/10 to-transparent rounded-full blur-3xl animate-pulse-glow"
          style={{ animationDelay: "2s" }}
        />

        {/* Floating orbs */}
        <div
          className="absolute top-1/4 left-1/4 w-4 h-4 bg-primary/40 rounded-full animate-float"
          style={{ animationDelay: "0s" }}
        />
        <div
          className="absolute top-1/3 right-1/3 w-3 h-3 bg-accent/50 rounded-full animate-float"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute bottom-1/3 left-1/3 w-5 h-5 bg-primary/30 rounded-full animate-float"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute top-1/2 right-1/4 w-2 h-2 bg-accent/40 rounded-full animate-float"
          style={{ animationDelay: "3s" }}
        />

        {/* Morphing shape */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-primary/5 via-transparent to-accent/5 animate-morph opacity-50" />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Left Content */}
          <div
            className={`flex-1 text-center lg:text-left transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 mb-8 animate-fade-in">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-foreground/80">Now serving 50+ hospitals across Africa</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-6">
              <span className="text-foreground">Healthcare that </span>
              <span className="relative">
                <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient">
                  speaks your
                </span>
              </span>
              <br />
              <span className="relative inline-block">
                <span className="text-foreground">language in </span>
                <span className="inline-block min-w-[200px] align-baseline">
                  <span
                    key={currentLang}
                    className="inline-block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent animate-slide-up"
                  >
                    {languages[currentLang]}
                  </span>
                </span>
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed">
              Kliniq bridges the communication gap between patients and healthcare providers using AI-powered
              multilingual translation. Better understanding, better outcomes.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Button
                size="lg"
                className="relative overflow-hidden group h-14 px-8 text-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-2xl shadow-primary/30 hover:shadow-primary/40 transition-all duration-500 hover:scale-105"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-accent/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="h-14 px-8 text-lg border-2 border-primary/30 hover:border-primary/50 hover:bg-primary/5 group transition-all duration-300 bg-transparent"
              >
                <Play className="w-5 h-5 mr-2 text-primary group-hover:scale-110 transition-transform duration-300" />
                Watch Demo
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center gap-6 mt-12 justify-center lg:justify-start">
              <TrustBadge icon={<Globe className="w-4 h-4" />} text="20+ African Languages" />
              <TrustBadge icon={<Shield className="w-4 h-4" />} text="HIPAA Compliant" />
              <TrustBadge icon={<Zap className="w-4 h-4" />} text="Real-time Translation" />
            </div>
          </div>

          {/* Right Content - Interactive Demo Card */}
          <div
            className={`flex-1 w-full max-w-lg transition-all duration-1000 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            <div className="relative">
              {/* Glow effect behind card */}
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/30 via-accent/20 to-primary/30 rounded-3xl blur-2xl animate-pulse-glow" />

              {/* Main Card */}
              <div className="relative bg-gradient-to-br from-card via-card to-card/80 backdrop-blur-xl rounded-3xl p-8 border border-primary/10 shadow-2xl">
                {/* Card Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <span className="ml-auto text-xs text-muted-foreground">Live Demo</span>
                </div>

                {/* Chat Interface */}
                <div className="space-y-4">
                  {/* Patient Message */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-accent/30 to-accent/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm">👤</span>
                    </div>
                    <div className="flex-1">
                      <div className="bg-secondary/50 rounded-2xl rounded-tl-sm p-4">
                        <p className="text-sm text-foreground/90 italic">"Orí mi ń dùn mi, mo sì ti ń gbóná ara"</p>
                        <p className="text-xs text-muted-foreground mt-2">Patient speaking in Yoruba</p>
                      </div>
                    </div>
                  </div>

                  {/* AI Translation */}
                  <div className="flex items-center gap-2 px-4">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                    <span className="text-xs text-primary font-medium px-2">AI Translating...</span>
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                  </div>

                  {/* Doctor View */}
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl rounded-tr-sm p-4 border border-primary/10">
                        <p className="text-sm text-foreground/90">"I have a headache and fever"</p>
                        <div className="flex items-center gap-2 mt-3">
                          <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
                            Urgency: Medium
                          </span>
                          <span className="px-2 py-1 text-xs bg-accent/10 text-accent rounded-full">
                            Duration: 2 days
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm">⚕️</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Stats */}
                <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-border/50">
                  <MiniStat value="99.2%" label="Accuracy" />
                  <MiniStat value="<1s" label="Response" />
                  <MiniStat value="20+" label="Languages" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-primary/30 flex items-start justify-center p-2">
          <div className="w-1.5 h-3 bg-primary/50 rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  )
}

function TrustBadge({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <div className="text-primary">{icon}</div>
      <span className="text-sm">{text}</span>
    </div>
  )
}

function MiniStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
        {value}
      </div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  )
}
