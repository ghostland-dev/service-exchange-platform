"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

interface Profile {
  id: string
  email: string
  full_name: string
  bio: string | null
  location: string | null
  website: string | null
  avatar_url: string | null
}

interface ProfileEditFormProps {
  profile: Profile | null
  userId: string
}

export function ProfileEditForm({ profile, userId }: ProfileEditFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || "",
    bio: profile?.bio || "",
    location: profile?.location || "",
    website: profile?.website || "",
  })

  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = createClient()

      const { error } = await supabase.from("profiles").upsert({
        id: userId,
        email: profile?.email || "",
        ...formData,
        updated_at: new Date().toISOString(),
      })

      if (error) throw error

      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été sauvegardées avec succès.",
      })

      router.push("/profile")
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-2">
        <Label htmlFor="full_name">Nom complet *</Label>
        <Input
          id="full_name"
          value={formData.full_name}
          onChange={(e) => handleChange("full_name", e.target.value)}
          placeholder="Votre nom complet"
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="bio">Biographie</Label>
        <Textarea
          id="bio"
          value={formData.bio}
          onChange={(e) => handleChange("bio", e.target.value)}
          placeholder="Parlez-nous de vous, vos expériences, vos passions..."
          rows={4}
        />
        <p className="text-xs text-muted-foreground">
          Une bonne biographie aide les autres membres à mieux vous connaître.
        </p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="location">Localisation</Label>
        <Input
          id="location"
          value={formData.location}
          onChange={(e) => handleChange("location", e.target.value)}
          placeholder="Paris, France"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="website">Site web</Label>
        <Input
          id="website"
          type="url"
          value={formData.website}
          onChange={(e) => handleChange("website", e.target.value)}
          placeholder="https://votre-site.com"
        />
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Sauvegarde..." : "Sauvegarder"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/profile")}>
          Annuler
        </Button>
      </div>
    </form>
  )
}
