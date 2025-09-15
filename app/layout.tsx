import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Suspense } from "react"
import "./globals.css"
import { NotificationProvider } from "@/components/notification-provider"

export const metadata: Metadata = {
  title: "ServiceSwap - Échangez vos compétences digitales",
  description:
    "Plateforme collaborative pour échanger des services digitaux entre particuliers : design, développement, marketing, SEO, rédaction et plus.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={null}>{children}</Suspense>
        <NotificationProvider />
      </body>
    </html>
  )
}
