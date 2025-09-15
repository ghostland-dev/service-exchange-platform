"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Clock, CheckCircle, XCircle, AlertCircle, Star, MessageSquare } from "lucide-react"

interface Exchange {
  id: string
  service_id: string | null
  request_id: string | null
  provider_id: string
  requester_id: string
  status: string
  provider_notes: string | null
  requester_notes: string | null
  created_at: string
  updated_at: string
  completed_at: string | null
  services: {
    id: string
    title: string
    description: string
    category: string
  } | null
  service_requests: {
    id: string
    title: string
    description: string
    category: string
  } | null
  provider: {
    id: string
    full_name: string
    avatar_url: string | null
  } | null
  requester: {
    id: string
    full_name: string
    avatar_url: string | null
  } | null
}

interface ExchangeManagerProps {
  exchanges: Exchange[]
  currentUserId: string
  reviewedExchangeIds: Set<string>
}

export function ExchangeManager({ exchanges, currentUserId, reviewedExchangeIds }: ExchangeManagerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: "",
  })
  const { toast } = useToast()

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "accepted":
        return "bg-blue-100 text-blue-800"
      case "in_progress":
        return "bg-purple-100 text-purple-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />
      case "accepted":
      case "in_progress":
        return <AlertCircle className="w-4 h-4" />
      case "completed":
        return <CheckCircle className="w-4 h-4" />
      case "cancelled":
        return <XCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "En attente"
      case "accepted":
        return "Accepté"
      case "in_progress":
        return "En cours"
      case "completed":
        return "Terminé"
      case "cancelled":
        return "Annulé"
      default:
        return status
    }
  }

  const updateExchangeStatus = async (exchangeId: string, newStatus: string, notes?: string) => {
    setIsLoading(true)
    try {
      const supabase = createClient()

      const updateData: any = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      }

      if (newStatus === "completed") {
        updateData.completed_at = new Date().toISOString()
      }

      if (notes) {
        // Determine if current user is provider or requester to update correct notes field
        const exchange = exchanges.find((e) => e.id === exchangeId)
        if (exchange) {
          if (exchange.provider_id === currentUserId) {
            updateData.provider_notes = notes
          } else {
            updateData.requester_notes = notes
          }
        }
      }

      const { error } = await supabase.from("exchanges").update(updateData).eq("id", exchangeId)

      if (error) throw error

      toast({
        title: "Statut mis à jour",
        description: "Le statut de l'échange a été modifié.",
      })

      // Refresh the page to show updated data
      window.location.reload()
    } catch (error) {
      console.error("Error updating exchange:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const submitReview = async (exchangeId: string, revieweeId: string) => {
    setIsLoading(true)
    try {
      const supabase = createClient()

      const { error } = await supabase.from("reviews").insert({
        exchange_id: exchangeId,
        reviewer_id: currentUserId,
        reviewee_id: revieweeId,
        rating: reviewData.rating,
        comment: reviewData.comment || null,
      })

      if (error) throw error

      toast({
        title: "Avis publié",
        description: "Votre avis a été publié avec succès.",
      })

      setReviewData({ rating: 5, comment: "" })
      // Refresh the page to show updated data
      window.location.reload()
    } catch (error) {
      console.error("Error submitting review:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la publication de l'avis.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterExchanges = (status?: string) => {
    if (!status) return exchanges
    return exchanges.filter((exchange) => exchange.status === status)
  }

  const canUpdateStatus = (exchange: Exchange, newStatus: string) => {
    const isProvider = exchange.provider_id === currentUserId
    const isRequester = exchange.requester_id === currentUserId

    switch (newStatus) {
      case "accepted":
        return isProvider && exchange.status === "pending"
      case "in_progress":
        return (isProvider || isRequester) && exchange.status === "accepted"
      case "completed":
        return (isProvider || isRequester) && exchange.status === "in_progress"
      case "cancelled":
        return (isProvider || isRequester) && ["pending", "accepted"].includes(exchange.status)
      default:
        return false
    }
  }

  const getOtherParty = (exchange: Exchange) => {
    return exchange.provider_id === currentUserId ? exchange.requester : exchange.provider
  }

  const getOtherPartyId = (exchange: Exchange) => {
    return exchange.provider_id === currentUserId ? exchange.requester_id : exchange.provider_id
  }

  const canLeaveReview = (exchange: Exchange) => {
    return exchange.status === "completed" && !reviewedExchangeIds.has(exchange.id)
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">Tous ({exchanges.length})</TabsTrigger>
          <TabsTrigger value="pending">En attente ({filterExchanges("pending").length})</TabsTrigger>
          <TabsTrigger value="in_progress">En cours ({filterExchanges("in_progress").length})</TabsTrigger>
          <TabsTrigger value="completed">Terminés ({filterExchanges("completed").length})</TabsTrigger>
          <TabsTrigger value="cancelled">Annulés ({filterExchanges("cancelled").length})</TabsTrigger>
        </TabsList>

        {["all", "pending", "in_progress", "completed", "cancelled"].map((tabValue) => (
          <TabsContent key={tabValue} value={tabValue} className="space-y-4">
            {filterExchanges(tabValue === "all" ? undefined : tabValue).length > 0 ? (
              <div className="space-y-4">
                {filterExchanges(tabValue === "all" ? undefined : tabValue).map((exchange) => {
                  const otherParty = getOtherParty(exchange)
                  const otherPartyId = getOtherPartyId(exchange)
                  const isProvider = exchange.provider_id === currentUserId
                  const serviceOrRequest = exchange.services || exchange.service_requests

                  return (
                    <Card key={exchange.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={otherParty?.avatar_url || "/placeholder.svg"} />
                              <AvatarFallback>{otherParty?.full_name?.charAt(0) || "U"}</AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="text-lg">{serviceOrRequest?.title}</CardTitle>
                              <p className="text-sm text-muted-foreground">
                                {isProvider ? "Demandé par" : "Proposé par"} {otherParty?.full_name}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={`${getStatusColor(exchange.status)} flex items-center gap-1`}>
                              {getStatusIcon(exchange.status)}
                              {getStatusText(exchange.status)}
                            </Badge>
                            <Badge variant="outline">{serviceOrRequest?.category}</Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">{serviceOrRequest?.description}</p>

                        {/* Notes */}
                        {(exchange.provider_notes || exchange.requester_notes) && (
                          <div className="space-y-2">
                            {exchange.provider_notes && (
                              <div className="p-3 bg-muted rounded-lg">
                                <p className="text-xs font-medium text-muted-foreground mb-1">Note du prestataire:</p>
                                <p className="text-sm">{exchange.provider_notes}</p>
                              </div>
                            )}
                            {exchange.requester_notes && (
                              <div className="p-3 bg-muted rounded-lg">
                                <p className="text-xs font-medium text-muted-foreground mb-1">Note du demandeur:</p>
                                <p className="text-sm">{exchange.requester_notes}</p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-2">
                          {canUpdateStatus(exchange, "accepted") && (
                            <Button size="sm" onClick={() => updateExchangeStatus(exchange.id, "accepted")}>
                              Accepter
                            </Button>
                          )}

                          {canUpdateStatus(exchange, "in_progress") && (
                            <Button size="sm" onClick={() => updateExchangeStatus(exchange.id, "in_progress")}>
                              Commencer
                            </Button>
                          )}

                          {canUpdateStatus(exchange, "completed") && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm">Marquer comme terminé</Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Terminer l'échange</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="completion-notes">Notes (optionnel)</Label>
                                    <Textarea
                                      id="completion-notes"
                                      placeholder="Ajoutez des notes sur cet échange..."
                                      onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                                    />
                                  </div>
                                  <Button
                                    onClick={() => updateExchangeStatus(exchange.id, "completed", reviewData.comment)}
                                    disabled={isLoading}
                                  >
                                    Confirmer
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}

                          {canUpdateStatus(exchange, "cancelled") && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => updateExchangeStatus(exchange.id, "cancelled")}
                            >
                              Annuler
                            </Button>
                          )}

                          {canLeaveReview(exchange) && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline">
                                  <Star className="w-4 h-4 mr-2" />
                                  Laisser un avis
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Évaluer {otherParty?.full_name}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label>Note</Label>
                                    <Select
                                      value={reviewData.rating.toString()}
                                      onValueChange={(value) =>
                                        setReviewData({ ...reviewData, rating: Number.parseInt(value) })
                                      }
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="5">⭐⭐⭐⭐⭐ Excellent</SelectItem>
                                        <SelectItem value="4">⭐⭐⭐⭐ Très bien</SelectItem>
                                        <SelectItem value="3">⭐⭐⭐ Bien</SelectItem>
                                        <SelectItem value="2">⭐⭐ Moyen</SelectItem>
                                        <SelectItem value="1">⭐ Décevant</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <Label htmlFor="review-comment">Commentaire (optionnel)</Label>
                                    <Textarea
                                      id="review-comment"
                                      placeholder="Partagez votre expérience..."
                                      value={reviewData.comment}
                                      onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                                    />
                                  </div>
                                  <Button onClick={() => submitReview(exchange.id, otherPartyId)} disabled={isLoading}>
                                    Publier l'avis
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>

                        {/* Timestamps */}
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p>Créé le {new Date(exchange.created_at).toLocaleDateString("fr-FR")}</p>
                          {exchange.completed_at && (
                            <p>Terminé le {new Date(exchange.completed_at).toLocaleDateString("fr-FR")}</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {tabValue === "all"
                    ? "Vous n'avez pas encore d'échanges."
                    : `Aucun échange ${getStatusText(tabValue).toLowerCase()}.`}
                </p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
