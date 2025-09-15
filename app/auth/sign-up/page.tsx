"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Progress } from "@/components/ui/progress"
import { Handshake, Eye, EyeOff, ArrowLeft, Check, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const router = useRouter()

  useEffect(() => {
    let strength = 0
    if (password.length >= 6) strength += 25
    if (password.length >= 8) strength += 25
    if (/[A-Z]/.test(password)) strength += 25
    if (/[0-9]/.test(password)) strength += 25
    setPasswordStrength(strength)
  }, [password])

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()

    if (!supabase) {
      setError("Configuration Supabase manquante")
      return
    }

    setIsLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas")
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères")
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
          data: {
            full_name: fullName,
          },
        },
      })
      if (error) throw error
      router.push("/auth/sign-up-success")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  const passwordValidations = [
    { test: password.length >= 6, label: "Au moins 6 caractères" },
    { test: password.length >= 8, label: "Au moins 8 caractères (recommandé)" },
    { test: /[A-Z]/.test(password), label: "Une majuscule" },
    { test: /[0-9]/.test(password), label: "Un chiffre" },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-background via-muted/30 to-background relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-center space-x-2 mb-4 group animate-in fade-in-50 slide-in-from-top-4 duration-700">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <Handshake className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold">ServiceSwap</span>
          </div>

          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-100 shadow-xl border-0 bg-card/95 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                Créer un compte
              </CardTitle>
              <CardDescription>
                Rejoignez la communauté ServiceSwap et commencez à échanger vos compétences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignUp} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-sm font-medium">
                      Nom complet
                    </Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Votre nom complet"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="transition-all duration-200 focus:scale-[1.02] focus:shadow-md"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="votre@email.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="transition-all duration-200 focus:scale-[1.02] focus:shadow-md"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Mot de passe
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Au moins 6 caractères"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="transition-all duration-200 focus:scale-[1.02] focus:shadow-md pr-10"
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>

                    {password && (
                      <div className="space-y-2 animate-in fade-in-50 slide-in-from-top-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Force du mot de passe</span>
                          <span
                            className={`font-medium ${
                              passwordStrength < 50
                                ? "text-red-500"
                                : passwordStrength < 75
                                  ? "text-yellow-500"
                                  : "text-green-500"
                            }`}
                          >
                            {passwordStrength < 50 ? "Faible" : passwordStrength < 75 ? "Moyen" : "Fort"}
                          </span>
                        </div>
                        <Progress value={passwordStrength} className="h-2" />
                        <div className="space-y-1">
                          {passwordValidations.map((validation, index) => (
                            <div key={index} className="flex items-center text-xs">
                              {validation.test ? (
                                <Check className="w-3 h-3 text-green-500 mr-2" />
                              ) : (
                                <X className="w-3 h-3 text-muted-foreground mr-2" />
                              )}
                              <span className={validation.test ? "text-green-600" : "text-muted-foreground"}>
                                {validation.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium">
                      Confirmer le mot de passe
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Répétez votre mot de passe"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="transition-all duration-200 focus:scale-[1.02] focus:shadow-md pr-10"
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={isLoading}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                    {confirmPassword && (
                      <div className="flex items-center text-xs animate-in fade-in-50 slide-in-from-top-2">
                        {password === confirmPassword ? (
                          <>
                            <Check className="w-3 h-3 text-green-500 mr-2" />
                            <span className="text-green-600">Les mots de passe correspondent</span>
                          </>
                        ) : (
                          <>
                            <X className="w-3 h-3 text-red-500 mr-2" />
                            <span className="text-red-500">Les mots de passe ne correspondent pas</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {error && (
                  <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20 animate-in fade-in-50 slide-in-from-top-2">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full group hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-xl"
                  disabled={isLoading || password !== confirmPassword || passwordStrength < 25}
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Création du compte...
                    </>
                  ) : (
                    "Créer mon compte"
                  )}
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  Déjà un compte ?{" "}
                  <Link
                    href="/auth/login"
                    className="text-primary hover:underline underline-offset-4 transition-colors font-medium"
                  >
                    Se connecter
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="text-center animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-200">
            <Link
              href="/"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
