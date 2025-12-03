export default function ClinicianLoading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary to-accent animate-pulse" />
          <div className="absolute inset-1 rounded-xl bg-background flex items-center justify-center">
            <span className="text-2xl font-bold text-primary">K</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  )
}
