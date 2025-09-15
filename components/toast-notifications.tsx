"use client"

import { useEffect } from "react"
import { toast } from "sonner"
import { CheckCircle, AlertCircle, Info, XCircle } from "lucide-react"

export type NotificationType = "success" | "error" | "info" | "warning"

interface ToastNotificationProps {
  type: NotificationType
  title: string
  description?: string
  duration?: number
}

export function showNotification({ type, title, description, duration = 4000 }: ToastNotificationProps) {
  const icons = {
    success: <CheckCircle className="w-4 h-4" />,
    error: <XCircle className="w-4 h-4" />,
    info: <Info className="w-4 h-4" />,
    warning: <AlertCircle className="w-4 h-4" />,
  }

  const styles = {
    success: "border-green-200 bg-green-50 text-green-800",
    error: "border-red-200 bg-red-50 text-red-800",
    info: "border-blue-200 bg-blue-50 text-blue-800",
    warning: "border-yellow-200 bg-yellow-50 text-yellow-800",
  }

  toast.custom(
    (t) => (
      <div className={`flex items-start space-x-3 p-4 rounded-lg border shadow-lg ${styles[type]}`}>
        <div className="flex-shrink-0">{icons[type]}</div>
        <div className="flex-1">
          <p className="font-medium">{title}</p>
          {description && <p className="text-sm mt-1 opacity-90">{description}</p>}
        </div>
        <button
          onClick={() => toast.dismiss(t)}
          className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
        >
          <XCircle className="w-4 h-4" />
        </button>
      </div>
    ),
    { duration },
  )
}

// Utility functions for common notifications
export const notifySuccess = (title: string, description?: string) =>
  showNotification({ type: "success", title, description })

export const notifyError = (title: string, description?: string) =>
  showNotification({ type: "error", title, description })

export const notifyInfo = (title: string, description?: string) =>
  showNotification({ type: "info", title, description })

export const notifyWarning = (title: string, description?: string) =>
  showNotification({ type: "warning", title, description })

// Hook for real-time notifications
export function useRealTimeNotifications(userId: string) {
  useEffect(() => {
    // In a real app, you would set up WebSocket or Server-Sent Events here
    // For demo purposes, we'll simulate some notifications
    const interval = setInterval(() => {
      const notifications = [
        {
          type: "info" as const,
          title: "Nouveau service disponible",
          description: "Un service de design graphique vient d'être publié",
        },
        { type: "success" as const, title: "Échange accepté", description: "Votre demande d'échange a été acceptée" },
        {
          type: "warning" as const,
          title: "Profil incomplet",
          description: "Complétez votre profil pour plus de visibilité",
        },
      ]

      // Randomly show a notification (10% chance every 30 seconds)
      if (Math.random() < 0.1) {
        const randomNotification = notifications[Math.floor(Math.random() * notifications.length)]
        showNotification(randomNotification)
      }
    }, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [userId])
}
