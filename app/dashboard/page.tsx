import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Handshake, User, LogOut, Plus, MessageSquare, TrendingUp, Star, Activity, Users } from "lucide-react"
import Link from "next/link"
import { NotificationCenter } from "@/components/notification-center"

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get user's services count
  const { count: servicesCount } = await supabase
    .from("services")
    .select("*", { count: "exact", head: true })
    .eq("user_id", data.user.id)
    .eq("is_active", true)

  // Get user's exchanges counts
  const { count: activeExchangesCount } = await supabase
    .from("exchanges")
    .select("*", { count: "exact", head: true })
    .or(`provider_id.eq.${data.user.id},requester_id.eq.${data.user.id}`)
    .in("status", ["pending", "accepted", "in_progress"])

  const { count: completedExchangesCount } = await supabase
    .from("exchanges")
    .select("*", { count: "exact", head: true })
    .or(`provider_id.eq.${data.user.id},requester_id.eq.${data.user.id}`)
    .eq("status", "completed")

  // Get user's average rating
  const { data: reviews } = await supabase.from("reviews").select("rating").eq("reviewee_id", data.user.id)

  const averageRating =
    reviews && reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : null

  const handleSignOut = async () => {
    "use server"
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Handshake className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">ServiceSwap</span>
          </Link>

          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-medium">
                {data.user.user_metadata?.full_name || data.user.email?.split("@")[0]}
              </span>
            </div>
            <NotificationCenter userId={data.user.id} />
            <form action={handleSignOut}>
              <Button variant="ghost" size="sm" type="submit" className="hover:scale-105 transition-transform">
                <LogOut className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Déconnexion</span>
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-in fade-in-50 slide-in-from-top-4 duration-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                Tableau de bord
              </h1>
              <p className="text-muted-foreground">
                Gérez vos services, échanges et profil depuis votre espace personnel.
              </p>
            </div>
            <Badge variant="secondary" className="hidden sm:flex">
              <Activity className="w-3 h-3 mr-1" />
              En ligne
            </Badge>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {[
            {
              title: "Mon Profil",
              description: "Complétez votre profil pour attirer plus de partenaires d'échange.",
              icon: User,
              href: "/profile",
              buttonText: "Voir mon profil",
              color: "bg-blue-500/10 text-blue-600",
              delay: "delay-0",
            },
            {
              title: "Services",
              description: "Découvrez et publiez des services dans la communauté.",
              icon: Handshake,
              href: "/services",
              buttonText: "Explorer",
              color: "bg-green-500/10 text-green-600",
              delay: "delay-100",
              hasSecondaryAction: true,
            },
            {
              title: "Échanges",
              description: "Suivez vos échanges en cours et votre historique.",
              icon: MessageSquare,
              href: "/exchanges",
              buttonText: "Voir mes échanges",
              color: "bg-purple-500/10 text-purple-600",
              delay: "delay-200",
            },
          ].map((item, index) => (
            <Card
              key={index}
              className={`group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-in fade-in-50 slide-in-from-bottom-4 duration-700 ${item.delay} border-0 shadow-md`}
            >
              <CardHeader>
                <CardTitle className="flex items-center group-hover:text-primary transition-colors">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${item.color} group-hover:scale-110 transition-transform duration-300`}
                  >
                    <item.icon className="w-5 h-5" />
                  </div>
                  {item.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4 text-sm leading-relaxed">{item.description}</p>
                <div className="flex gap-2">
                  <Button asChild className="flex-1 group-hover:scale-[1.02] transition-transform">
                    <Link href={item.href}>{item.buttonText}</Link>
                  </Button>
                  {item.hasSecondaryAction && (
                    <Button
                      asChild
                      variant="outline"
                      className="group-hover:scale-[1.02] transition-transform bg-transparent"
                    >
                      <Link href="/services/create">
                        <Plus className="w-4 h-4" />
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center">
              <TrendingUp className="w-6 h-6 mr-2 text-primary" />
              Aperçu rapide
            </h2>
            <Badge variant="outline">Dernière mise à jour: maintenant</Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                value: servicesCount || 0,
                label: "Services actifs",
                icon: Handshake,
                color: "text-blue-600",
                bgColor: "bg-blue-500/10",
              },
              {
                value: activeExchangesCount || 0,
                label: "Échanges en cours",
                icon: Activity,
                color: "text-green-600",
                bgColor: "bg-green-500/10",
              },
              {
                value: completedExchangesCount || 0,
                label: "Échanges terminés",
                icon: Users,
                color: "text-purple-600",
                bgColor: "bg-purple-500/10",
              },
              {
                value: averageRating ? averageRating.toFixed(1) : "-",
                label: "Note moyenne",
                icon: Star,
                color: "text-yellow-600",
                bgColor: "bg-yellow-500/10",
              },
            ].map((stat, index) => (
              <Card
                key={index}
                className={`group hover:shadow-md transition-all duration-300 hover:-translate-y-1 animate-in fade-in-50 slide-in-from-bottom-3 duration-700`}
                style={{ animationDelay: `${400 + index * 100}ms` }}
              >
                <CardContent className="p-6 text-center">
                  <div
                    className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div className={`text-2xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
                  <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="mt-12 animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-500">
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Star className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Conseil du jour</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Complétez votre profil avec vos compétences et ajoutez une photo pour augmenter vos chances de
                    trouver des partenaires d'échange !
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
