"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Check } from "lucide-react"

const benefits = ["Free 14-day trial", "No credit card required", "Full feature access", "Dedicated onboarding support"]

export function CTASection() {
  return (
    <section className="relative py-16 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary/10 via-transparent to-transparent rounded-full animate-pulse-glow" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-6 lg:px-8 text-center">
        {/* Badge */}
        <span className="inline-block px-4 py-1.5 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 text-primary text-sm font-medium mb-8">
          Start Your Journey
        </span>

        {/* Headline */}
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
          <span className="text-foreground">Ready to transform </span>
          <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient">
            healthcare communication?
          </span>
        </h2>

        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          Join 50+ hospitals already using Kliniq to break down language barriers and deliver better patient outcomes
          across Africa.
        </p>

        {/* Benefits */}
        <div className="flex flex-wrap items-center justify-center gap-6 mb-10">
          {benefits.map((benefit) => (
            <div key={benefit} className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm text-foreground/80">{benefit}</span>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            size="lg"
            className="relative overflow-hidden group h-14 px-10 text-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-2xl shadow-primary/30 hover:shadow-primary/40 transition-all duration-500 hover:scale-105"
          >
            <span className="relative z-10 flex items-center gap-2">
              Get Started Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-accent/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="h-14 px-10 text-lg border-2 border-primary/30 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 bg-transparent"
          >
            Schedule Demo
          </Button>
        </div>

        {/* Trust note */}
        <p className="text-xs text-muted-foreground mt-8">
          HIPAA compliant • AES-256 encryption • Your data stays yours
        </p>
      </div>
    </section>
  )
}
