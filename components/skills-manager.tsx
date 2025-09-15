"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Plus, X, Search } from "lucide-react"

interface Skill {
  id: string
  name: string
  category: string
  description: string | null
}

interface UserSkill {
  id: string
  skill_id: string
  proficiency_level: string
  years_experience: number | null
  skills: {
    id: string
    name: string
    category: string
  } | null
}

interface SkillsManagerProps {
  allSkills: Skill[]
  userSkills: UserSkill[]
  userId: string
}

export function SkillsManager({ allSkills, userSkills, userId }: SkillsManagerProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const categories = Array.from(new Set(allSkills.map((skill) => skill.category)))
  const userSkillIds = new Set(userSkills.map((us) => us.skill_id))

  const filteredSkills = allSkills.filter((skill) => {
    const matchesSearch = skill.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || skill.category === selectedCategory
    const notAlreadyAdded = !userSkillIds.has(skill.id)
    return matchesSearch && matchesCategory && notAlreadyAdded
  })

  const addSkill = async (skillId: string, proficiencyLevel = "intermediate") => {
    setIsLoading(true)
    try {
      const supabase = createClient()

      const { error } = await supabase.from("user_skills").insert({
        user_id: userId,
        skill_id: skillId,
        proficiency_level: proficiencyLevel,
      })

      if (error) throw error

      toast({
        title: "Compétence ajoutée",
        description: "La compétence a été ajoutée à votre profil.",
      })

      // Refresh the page to update the lists
      window.location.reload()
    } catch (error) {
      console.error("Error adding skill:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'ajout de la compétence.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const removeSkill = async (userSkillId: string) => {
    setIsLoading(true)
    try {
      const supabase = createClient()

      const { error } = await supabase.from("user_skills").delete().eq("id", userSkillId)

      if (error) throw error

      toast({
        title: "Compétence supprimée",
        description: "La compétence a été retirée de votre profil.",
      })

      // Refresh the page to update the lists
      window.location.reload()
    } catch (error) {
      console.error("Error removing skill:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateProficiency = async (userSkillId: string, newLevel: string) => {
    setIsLoading(true)
    try {
      const supabase = createClient()

      const { error } = await supabase.from("user_skills").update({ proficiency_level: newLevel }).eq("id", userSkillId)

      if (error) throw error

      toast({
        title: "Niveau mis à jour",
        description: "Le niveau de compétence a été modifié.",
      })

      // Refresh the page to update the display
      window.location.reload()
    } catch (error) {
      console.error("Error updating proficiency:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Current Skills */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Mes compétences actuelles</h3>
        {userSkills.length > 0 ? (
          <div className="space-y-4">
            {Object.entries(
              userSkills.reduce(
                (acc, userSkill) => {
                  const category = userSkill.skills?.category || "Autre"
                  if (!acc[category]) acc[category] = []
                  acc[category].push(userSkill)
                  return acc
                },
                {} as Record<string, UserSkill[]>,
              ),
            ).map(([category, skills]) => (
              <Card key={category}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-muted-foreground uppercase tracking-wide">{category}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {skills.map((userSkill) => (
                      <div key={userSkill.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className="font-medium">{userSkill.skills?.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {userSkill.proficiency_level}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Select
                            value={userSkill.proficiency_level}
                            onValueChange={(value) => updateProficiency(userSkill.id, value)}
                            disabled={isLoading}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="beginner">Débutant</SelectItem>
                              <SelectItem value="intermediate">Intermédiaire</SelectItem>
                              <SelectItem value="advanced">Avancé</SelectItem>
                              <SelectItem value="expert">Expert</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSkill(userSkill.id)}
                            disabled={isLoading}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">Vous n'avez pas encore ajouté de compétences.</p>
        )}
      </div>

      {/* Add New Skills */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Ajouter des compétences</h3>

        {/* Search and Filter */}
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <Label htmlFor="search" className="sr-only">
              Rechercher
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Rechercher une compétence..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les catégories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Available Skills */}
        <div className="grid gap-2 max-h-96 overflow-y-auto">
          {filteredSkills.map((skill) => (
            <div key={skill.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
              <div>
                <span className="font-medium">{skill.name}</span>
                <Badge variant="outline" className="ml-2 text-xs">
                  {skill.category}
                </Badge>
                {skill.description && <p className="text-sm text-muted-foreground mt-1">{skill.description}</p>}
              </div>
              <Button size="sm" onClick={() => addSkill(skill.id)} disabled={isLoading}>
                <Plus className="w-4 h-4 mr-1" />
                Ajouter
              </Button>
            </div>
          ))}
        </div>

        {filteredSkills.length === 0 && (
          <p className="text-muted-foreground text-center py-8">
            {searchTerm || selectedCategory !== "all"
              ? "Aucune compétence trouvée avec ces critères."
              : "Toutes les compétences disponibles ont été ajoutées à votre profil."}
          </p>
        )}
      </div>
    </div>
  )
}
