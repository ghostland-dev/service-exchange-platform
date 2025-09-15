"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"

interface FormErrorProps {
  error?: string | string[]
  className?: string
}

export function FormError({ error, className }: FormErrorProps) {
  if (!error) return null

  const errorMessage = Array.isArray(error) ? error[0] : error

  return (
    <Alert variant="destructive" className={className}>
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>{errorMessage}</AlertDescription>
    </Alert>
  )
}

interface FieldErrorProps {
  error?: string
  className?: string
}

export function FieldError({ error, className }: FieldErrorProps) {
  if (!error) return null

  return <p className={`text-sm text-destructive ${className}`}>{error}</p>
}
