"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Search, MapPin, Clock, MessageCircle, AlertCircle } from "lucide-react"

interface Service {
  id: string
  title: string
  description: string
  category: string
  skill_ids: string[]
  estimated_hours: number | null
  difficulty_level: string | null
  user_id: string
  created_at: string
  profiles: {
    id: string
    full_name: string
    avatar_url: string | null
    location: string | null
  } | null
}

interface ServiceRequest {
  id: string
  title: string
  description: string
  category: string
  skill_ids: string[]
  estimated_hours: number | null
  urgency: string | null
  user_id: string
  created_at: string
  profiles: {
    id: string
    full_name: string
    avatar_url: string | null
    location: string | null
  } | null
}

interface Skill {
  id: string
  name: string
  category: string
}

interface ServiceBoardProps {
  services: Service[]
  requests: ServiceRequest[]
  allSkills: Skill[]
  currentUserId: string
}

export function ServiceBoard({ services, requests, allSkills, currentUserId }: ServiceBoardProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const categories = Array.from(new Set([...services.map((s) => s.category), ...requests.map((r) => r.category)]))

  const skillsMap = new Map(allSkills.map((skill) => [skill.id, skill]))

  const filterItems = <T extends Service | ServiceRequest>(items: T[]) => {
    return items.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === "all" || item.category === selectedCategory
      const notOwnItem = item.user_id !== currentUserId
      return matchesSearch && matchesCategory && notOwnItem
    })
  }

  const filteredServices = filterItems(services)
  const filteredRequests = filterItems(requests)

  const initiateExchange = async (serviceId?: string, requestId?: string) => {
    setIsLoading(true)
    try {
      const supabase = createClient()

      let providerId: string
      let requesterId: string

      if (serviceId) {
        // User wants to request a service
        const service = services.find((s) => s.id === serviceId)
        if (!service) throw new Error("Service not found")
        providerId = service.user_id
        requesterId = currentUserId
      } else if (requestId) {
        // User wants to offer their service for a request
        const request = requests.find((r) => r.id === requestId)
        if (!request) throw new Error("Request not found")
        providerId = currentUserId
        requesterId = request.user_id
      } else {
        throw new Error("Either serviceId or requestId must be provided")
      }

      const { error } = await supabase.from("exchanges").insert({
        service_id: serviceId || null,
        request_id: requestId || null,
        provider_id: providerId,
        requester_id: requesterId,
        status: "pending",
      })

      if (error) throw error

      toast({
        title: "Échange initié",
        description: "Votre demande d'échange a été envoyée. Vous recevrez une notification de réponse.",
      })
    } catch (error) {
      console.error("Error initiating exchange:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'initiation de l'échange.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getSkillNames = (skillIds: string[]) => {
    return skillIds.map((id) => skillsMap.get(id)?.name).filter(Boolean)
  }

  const getDifficultyColor = (level: string | null) => {
    switch (level) {
      case "easy":
        return "bg-green-100 text-green-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "hard":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getUrgencyColor = (urgency: string | null) => {
    switch (urgency) {
      case "low":
        return "bg-blue-100 text-blue-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "high":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher des services ou demandes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48">
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

      {/* Tabs for Services and Requests */}
      <Tabs defaultValue="services" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="services">Services disponibles ({filteredServices.length})</TabsTrigger>
          <TabsTrigger value="requests">Demandes ({filteredRequests.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-4">
          {filteredServices.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service) => (
                <Card key={service.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={service.profiles?.avatar_url || "/placeholder.svg"} />
                          <AvatarFallback>{service.profiles?.full_name?.charAt(0) || "U"}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{service.profiles?.full_name}</p>
                          {service.profiles?.location && (
                            <p className="text-xs text-muted-foreground flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              {service.profiles.location}
                            </p>
                          )}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {service.category}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-3">{service.description}</p>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-1">
                      {getSkillNames(service.skill_ids).map((skillName) => (
                        <Badge key={skillName} variant="secondary" className="text-xs">
                          {skillName}
                        </Badge>
                      ))}
                    </div>

                    {/* Meta info */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center space-x-4">
                        {service.estimated_hours && (
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {service.estimated_hours}h
                          </span>
                        )}
                        {service.difficulty_level && (
                          <Badge className={`text-xs ${getDifficultyColor(service.difficulty_level)}`}>
                            {service.difficulty_level}
                          </Badge>
                        )}
                      </div>
                      <span>{new Date(service.created_at).toLocaleDateString("fr-FR")}</span>
                    </div>

                    <Button className="w-full" onClick={() => initiateExchange(service.id)} disabled={isLoading}>
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Demander ce service
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm || selectedCategory !== "all"
                  ? "Aucun service trouvé avec ces critères."
                  : "Aucun service disponible pour le moment."}
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          {filteredRequests.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRequests.map((request) => (
                <Card key={request.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={request.profiles?.avatar_url || "/placeholder.svg"} />
                          <AvatarFallback>{request.profiles?.full_name?.charAt(0) || "U"}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{request.profiles?.full_name}</p>
                          {request.profiles?.location && (
                            <p className="text-xs text-muted-foreground flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              {request.profiles.location}
                            </p>
                          )}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {request.category}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{request.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-3">{request.description}</p>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-1">
                      {getSkillNames(request.skill_ids).map((skillName) => (
                        <Badge key={skillName} variant="secondary" className="text-xs">
                          {skillName}
                        </Badge>
                      ))}
                    </div>

                    {/* Meta info */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center space-x-4">
                        {request.estimated_hours && (
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {request.estimated_hours}h
                          </span>
                        )}
                        {request.urgency && (
                          <Badge className={`text-xs ${getUrgencyColor(request.urgency)}`}>
                            <AlertCircle className="w-3 h-3 mr-1" />
                            {request.urgency}
                          </Badge>
                        )}
                      </div>
                      <span>{new Date(request.created_at).toLocaleDateString("fr-FR")}</span>
                    </div>

                    <Button
                      className="w-full"
                      onClick={() => initiateExchange(undefined, request.id)}
                      disabled={isLoading}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Proposer mes services
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm || selectedCategory !== "all"
                  ? "Aucune demande trouvée avec ces critères."
                  : "Aucune demande disponible pour le moment."}
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
