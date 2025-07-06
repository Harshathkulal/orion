'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent")
    if (!consent) {
      setShowConsent(true)
    }
  }, [])

  const handleConsent = (accepted: boolean) => {
    localStorage.setItem("cookie-consent", accepted ? "accepted" : "rejected")
    setShowConsent(false)
  }

  if (!showConsent) return null

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 w-[90%] max-w-md">
      <Card>
        <CardContent className="p-4 flex flex-col gap-3">
          <p className="text-sm text-gray-700">
            We use cookies to enhance your experience. By accepting, you agree to our cookie policy.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => handleConsent(false)}>
              Reject
            </Button>
            <Button onClick={() => handleConsent(true)}>
              Accept
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
