"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { X } from "lucide-react"

interface Skill {
  id: string
  name: string
  category: string
}

interface ServiceFormProps {
  allSkills: Skill[]
  userId: string
}

export function ServiceForm({ allSkills, userId }: ServiceFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    estimated_hours: "",
    difficulty_level: "",
  })

  const router = useRouter()
  const { toast } = useToast()

  const categories = Array.from(new Set(allSkills.map((skill) => skill.category)))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (selectedSkills.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner au moins une compétence.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    try {
      const supabase = createClient()

      const { error } = await supabase.from("services").insert({
        user_id: userId,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        skill_ids: selectedSkills,
        estimated_hours: formData.estimated_hours ? Number.parseInt(formData.estimated_hours) : null,
        difficulty_level: formData.difficulty_level || null,
        is_active: true,
      })

      if (error) throw error

      toast({
        title: "Service publié",
        description: "Votre service a été publié avec succès.",
      })

      router.push("/services")
    } catch (error) {
      console.error("Error creating service:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la publication.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const toggleSkill = (skillId: string) => {
    setSelectedSkills((prev) => (prev.includes(skillId) ? prev.filter((id) => id !== skillId) : [...prev, skillId]))
  }

  const removeSkill = (skillId: string) => {
    setSelectedSkills((prev) => prev.filter((id) => id !== skillId))
  }

  const getSkillName = (skillId: string) => {
    return allSkills.find((skill) => skill.id === skillId)?.name || ""
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-2">
        <Label htmlFor="title">Titre du service *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => handleChange("title", e.target.value)}
          placeholder="Ex: Création de logo professionnel"
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Décrivez en détail ce que vous proposez, votre approche, vos outils..."
          rows={4}
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="category">Catégorie *</Label>
        <Select value={formData.category} onValueChange={(value) => handleChange("category", value)} required>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionnez une catégorie" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label>Compétences requises *</Label>
        <div className="space-y-4">
          {/* Selected Skills */}
          {selectedSkills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedSkills.map((skillId) => (
                <Badge key={skillId} variant="default" className="flex items-center gap-1">
                  {getSkillName(skillId)}
                  <button
                    type="button"
                    onClick={() => removeSkill(skillId)}
                    className="ml-1 hover:bg-primary/20 rounded"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {/* Skill Selection */}
          <div className="border rounded-lg p-4 max-h-48 overflow-y-auto">
            {Object.entries(
              allSkills.reduce(
                (acc, skill) => {
                  if (!acc[skill.category]) acc[skill.category] = []
                  acc[skill.category].push(skill)
                  return acc
                },
                {} as Record<string, Skill[]>,
              ),
            ).map(([category, skills]) => (
              <div key={category} className="mb-4">
                <h4 className="font-medium text-sm text-muted-foreground mb-2">{category}</h4>
                <div className="space-y-2">
                  {skills.map((skill) => (
                    <div key={skill.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={skill.id}
                        checked={selectedSkills.includes(skill.id)}
                        onCheckedChange={() => toggleSkill(skill.id)}
                      />
                      <Label htmlFor={skill.id} className="text-sm cursor-pointer">
                        {skill.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="estimated_hours">Durée estimée (heures)</Label>
          <Input
            id="estimated_hours"
            type="number"
            min="1"
            value={formData.estimated_hours}
            onChange={(e) => handleChange("estimated_hours", e.target.value)}
            placeholder="Ex: 5"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="difficulty_level">Niveau de difficulté</Label>
          <Select value={formData.difficulty_level} onValueChange={(value) => handleChange("difficulty_level", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Facile</SelectItem>
              <SelectItem value="medium">Moyen</SelectItem>
              <SelectItem value="hard">Difficile</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Publication..." : "Publier le service"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/services")}>
          Annuler
        </Button>
      </div>
    </form>
  )
}
