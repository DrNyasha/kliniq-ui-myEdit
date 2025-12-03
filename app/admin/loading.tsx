export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent animate-pulse" />
        </div>
      </div>
    </div>
  )
}
