"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertTriangle, X, RefreshCw, Info, CheckCircle } from "lucide-react"

export type ErrorType = "error" | "warning" | "info" | "success"

interface ErrorAlertProps {
  type?: ErrorType
  title?: string
  message: string
  dismissible?: boolean
  onDismiss?: () => void
  onRetry?: () => void
  className?: string
}

const iconMap = {
  error: AlertTriangle,
  warning: AlertTriangle,
  info: Info,
  success: CheckCircle,
}

const variantMap = {
  error: "destructive" as const,
  warning: "default" as const,
  info: "default" as const,
  success: "default" as const,
}

export function ErrorAlert({
  type = "error",
  title,
  message,
  dismissible = false,
  onDismiss,
  onRetry,
  className,
}: ErrorAlertProps) {
  const Icon = iconMap[type]

  return (
    <Alert variant={variantMap[type]} className={className}>
      <Icon className="h-4 w-4" />
      <div className="flex-1">
        {title && <AlertTitle>{title}</AlertTitle>}
        <AlertDescription>{message}</AlertDescription>
      </div>
      <div className="flex items-center space-x-2">
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RefreshCw className="w-3 h-3 mr-1" />
            Réessayer
          </Button>
        )}
        {dismissible && onDismiss && (
          <Button variant="ghost" size="sm" onClick={onDismiss}>
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>
    </Alert>
  )
}
