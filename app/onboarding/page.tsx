'use client'

import { useEffect } from 'react'

export default function OnboardingRedirect() {
  useEffect(() => {
    window.location.replace('/matches')
  }, [])

  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-50">
      <p className="text-stone-700">Taking you to your matches...</p>
    </main>
  )
}