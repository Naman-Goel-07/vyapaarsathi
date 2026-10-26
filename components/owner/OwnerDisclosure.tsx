'use client'
import { useState } from 'react'

/** Keep optional tools off the initial render on slower phones; retain state after opening. */
export default function OwnerDisclosure({ title, children }: { title: string; children: React.ReactNode }) {
  const [visited, setVisited] = useState(false)
  return <details className="owner-card" onToggle={event => { if (event.currentTarget.open) setVisited(true) }}><summary>{title}</summary>{visited && <div className="pt-4">{children}</div>}</details>
}
