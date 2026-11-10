export default function Loading() {
  return (
    <div role="status" aria-label="Loading" className="space-y-4 max-w-xl mx-auto">
      <div className="h-5 w-24 rounded-md bg-black/10 motion-safe:animate-pulse" />
      <div className="h-10 w-2/3 rounded-lg bg-black/10 motion-safe:animate-pulse" />
      <div className="h-16 rounded-2xl bg-black/10 motion-safe:animate-pulse" />
      <div className="h-32 rounded-2xl bg-black/10 motion-safe:animate-pulse" />
      <div className="h-48 rounded-2xl bg-black/10 motion-safe:animate-pulse" />
    </div>
  )
}
