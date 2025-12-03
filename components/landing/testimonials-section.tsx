"use client"

import { useEffect, useRef, useState } from "react"
import { Quote } from "lucide-react"

const testimonials = [
  {
    quote:
      "Kliniq has transformed how we communicate with our elderly patients. The Yoruba translation is remarkably accurate and culturally appropriate.",
    author: "Dr. Adebayo Ogundimu",
    role: "Chief Medical Officer",
    hospital: "Lagos University Teaching Hospital",
    image: "/placeholder.svg?height=80&width=80",
  },
  {
    quote:
      "Our nurses save 2 hours daily on routine clarifications. The AI handles simple questions so we can focus on critical care.",
    author: "Nurse Fatima Ibrahim",
    role: "Head Nurse",
    hospital: "Aminu Kano Teaching Hospital",
    image: "/placeholder.svg?height=80&width=80",
  },
  {
    quote:
      "Finally, my grandmother can understand her medication instructions without me having to translate everything. This is healthcare equality.",
    author: "Chioma Eze",
    role: "Patient Family Member",
    hospital: "Enugu State Hospital",
    image: "/placeholder.svg?height=80&width=80",
  },
]

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="relative py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-gradient-to-l from-accent/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-gradient-to-r from-primary/10 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            Testimonials
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            <span className="text-foreground">Trusted by healthcare </span>
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              pioneers across Africa
            </span>
          </h2>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={testimonial.author} testimonial={testimonial} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}

function TestimonialCard({ testimonial, index }: { testimonial: (typeof testimonials)[0]; index: number }) {
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
      className={`group relative transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      {/* Card */}
      <div className="relative h-full bg-gradient-to-br from-card to-card/50 rounded-3xl p-8 border border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-xl hover:shadow-primary/5">
        {/* Quote Icon */}
        <div className="absolute -top-4 -left-2 w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center transform -rotate-12 group-hover:rotate-0 transition-transform duration-500">
          <Quote className="w-5 h-5 text-white" />
        </div>

        {/* Quote */}
        <p className="text-foreground/80 leading-relaxed mb-8 mt-4">"{testimonial.quote}"</p>

        {/* Author */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-full blur-sm opacity-50" />
            <img
              src={testimonial.image || "/placeholder.svg"}
              alt={testimonial.author}
              className="relative w-14 h-14 rounded-full object-cover border-2 border-background"
            />
          </div>
          <div>
            <div className="font-semibold text-foreground">{testimonial.author}</div>
            <div className="text-sm text-muted-foreground">{testimonial.role}</div>
            <div className="text-xs text-primary">{testimonial.hospital}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
