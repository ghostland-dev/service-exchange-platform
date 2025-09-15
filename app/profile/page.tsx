import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Handshake, User, MapPin, Globe, Edit, Plus, Star } from "lucide-react"
import Link from "next/link"

export default async function ProfilePage() {
  const supabase = await createClient()

  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData?.user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", userData.user.id).single()

  // Get user skills with skill details
  const { data: userSkills } = await supabase
    .from("user_skills")
    .select(`
      *,
      skills (
        name,
        category
      )
    `)
    .eq("user_id", userData.user.id)

  // Get user's services count
  const { count: servicesCount } = await supabase
    .from("services")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userData.user.id)
    .eq("is_active", true)

  // Get user's completed exchanges count
  const { count: exchangesCount } = await supabase
    .from("exchanges")
    .select("*", { count: "exact", head: true })
    .or(`provider_id.eq.${userData.user.id},requester_id.eq.${userData.user.id}`)
    .eq("status", "completed")

  // Get user's average rating
  const { data: reviews } = await supabase.from("reviews").select("rating").eq("reviewee_id", userData.user.id)

  const averageRating =
    reviews && reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : null

  const handleSignOut = async () => {
    "use server"
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Handshake className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">ServiceSwap</span>
          </div>

          <nav className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/dashboard">Tableau de bord</Link>
            </Button>
            <form action={handleSignOut}>
              <Button variant="ghost" size="sm" type="submit">
                Déconnexion
              </Button>
            </form>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <Avatar className="w-24 h-24 mx-auto mb-4">
                  <AvatarImage src={profile?.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback className="text-2xl">
                    {profile?.full_name?.charAt(0) || userData.user.email?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-2xl">{profile?.full_name || "Utilisateur"}</CardTitle>
                <p className="text-muted-foreground">{profile?.email || userData.user.email}</p>

                {averageRating && (
                  <div className="flex items-center justify-center mt-2">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                    <span className="font-medium">{averageRating.toFixed(1)}</span>
                    <span className="text-muted-foreground ml-1">({reviews?.length} avis)</span>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {profile?.location && (
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{profile.location}</span>
                  </div>
                )}

                {profile?.website && (
                  <div className="flex items-center text-muted-foreground">
                    <Globe className="w-4 h-4 mr-2" />
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                      {profile.website}
                    </a>
                  </div>
                )}

                {profile?.bio && (
                  <div>
                    <h3 className="font-semibold mb-2">À propos</h3>
                    <p className="text-muted-foreground text-sm">{profile.bio}</p>
                  </div>
                )}

                <Button asChild className="w-full">
                  <Link href="/profile/edit">
                    <Edit className="w-4 h-4 mr-2" />
                    Modifier le profil
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Statistiques</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Services actifs</span>
                  <span className="font-medium">{servicesCount || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Échanges terminés</span>
                  <span className="font-medium">{exchangesCount || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Membre depuis</span>
                  <span className="font-medium">
                    {new Date(userData.user.created_at).toLocaleDateString("fr-FR", {
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Skills and Services */}
          <div className="lg:col-span-2 space-y-8">
            {/* Skills Section */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Mes Compétences</CardTitle>
                <Button asChild size="sm">
                  <Link href="/profile/skills">
                    <Plus className="w-4 h-4 mr-2" />
                    Gérer
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {userSkills && userSkills.length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(
                      userSkills.reduce(
                        (acc, userSkill) => {
                          const category = userSkill.skills?.category || "Autre"
                          if (!acc[category]) acc[category] = []
                          acc[category].push(userSkill)
                          return acc
                        },
                        {} as Record<string, typeof userSkills>,
                      ),
                    ).map(([category, skills]) => (
                      <div key={category}>
                        <h3 className="font-semibold mb-2 text-sm text-muted-foreground uppercase tracking-wide">
                          {category}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {skills.map((userSkill) => (
                            <Badge key={userSkill.id} variant="secondary" className="text-sm">
                              {userSkill.skills?.name}
                              <span className="ml-1 text-xs opacity-70">({userSkill.proficiency_level})</span>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">Vous n'avez pas encore ajouté de compétences</p>
                    <Button asChild>
                      <Link href="/profile/skills">Ajouter des compétences</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Activité récente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Aucune activité récente</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
