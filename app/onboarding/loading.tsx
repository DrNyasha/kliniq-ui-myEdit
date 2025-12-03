export default function OnboardingLoading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center animate-pulse">
          <span className="text-primary-foreground font-bold text-2xl">K</span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-2xl blur-xl opacity-50 animate-pulse" />
      </div>
    </div>
  )
}
