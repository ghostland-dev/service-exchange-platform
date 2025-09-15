"use client"

import type React from "react"
import { useRealTimeNotifications } from "@/components/toast-notifications"

interface DashboardWithNotificationsProps {
  userId: string
  children: React.ReactNode
}

export function DashboardWithNotifications({ userId, children }: DashboardWithNotificationsProps) {
  // Set up real-time notifications
  useRealTimeNotifications(userId)

  return <>{children}</>
}
