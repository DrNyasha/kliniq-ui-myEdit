"use client"

import { useEffect, useRef, useState } from "react"

const stats = [
  { value: 50, suffix: "+", label: "Partner Hospitals" },
  { value: 100, suffix: "K+", label: "Patients Served" },
  { value: 20, suffix: "+", label: "Languages Supported" },
  { value: 99, suffix: "%", label: "Translation Accuracy" },
]

export function StatsSection() {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-accent" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />

      {/* Floating elements */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-float" />
      <div
        className="absolute bottom-10 right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl animate-float"
        style={{ animationDelay: "2s" }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((stat, index) => (
            <StatItem key={stat.label} stat={stat} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}

function StatItem({ stat, index }: { stat: (typeof stats)[0]; index: number }) {
  const [count, setCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 },
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [isVisible])

  useEffect(() => {
    if (!isVisible) return

    const duration = 2000
    const steps = 60
    const stepValue = stat.value / steps
    let current = 0

    const timer = setInterval(() => {
      current += stepValue
      if (current >= stat.value) {
        setCount(stat.value)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [isVisible, stat.value])

  return (
    <div
      ref={ref}
      className={`text-center transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-2">
        {count}
        {stat.suffix}
      </div>
      <div className="text-white/70 text-sm sm:text-base">{stat.label}</div>
    </div>
  )
}
