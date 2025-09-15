import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ServiceBoard } from "@/components/service-board"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Handshake, Plus, LogOut, User, Search, TrendingUp } from "lucide-react"
import Link from "next/link"
import { NotificationCenter } from "@/components/notification-center"

export default async function ServicesPage() {
  const supabase = await createClient()

  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData?.user) {
    redirect("/auth/login")
  }

  // Get all active services with user profiles and skills
  const { data: services } = await supabase
    .from("services")
    .select(`
      *,
      profiles (
        id,
        full_name,
        avatar_url,
        location
      )
    `)
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  // Get all active service requests with user profiles
  const { data: requests } = await supabase
    .from("service_requests")
    .select(`
      *,
      profiles (
        id,
        full_name,
        avatar_url,
        location
      )
    `)
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  // Get all skills for filtering
  const { data: allSkills } = await supabase.from("skills").select("*").order("name")

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

          <nav className="flex items-center space-x-4">
            <Button variant="ghost" asChild className="hover:scale-105 transition-transform">
              <Link href="/dashboard">Tableau de bord</Link>
            </Button>
            <Button asChild className="group hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg">
              <Link href="/services/create">
                <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                Publier un service
              </Link>
            </Button>

            <div className="hidden sm:flex items-center space-x-2 px-3 py-1 bg-muted/50 rounded-full">
              <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="w-3 h-3 text-primary" />
              </div>
              <span className="text-sm font-medium">
                {userData.user.user_metadata?.full_name || userData.user.email?.split("@")[0]}
              </span>
            </div>

            <NotificationCenter userId={userData.user.id} />

            <form action={handleSignOut}>
              <Button variant="ghost" size="sm" type="submit" className="hover:scale-105 transition-transform">
                <LogOut className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Déconnexion</span>
              </Button>
            </form>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-in fade-in-50 slide-in-from-top-4 duration-700">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent flex items-center">
                <Search className="w-8 h-8 mr-3 text-primary" />
                Tableau d'échange
              </h1>
              <p className="text-muted-foreground">
                Découvrez les services disponibles et les demandes de la communauté
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="hidden sm:flex">
                <TrendingUp className="w-3 h-3 mr-1" />
                {(services?.length || 0) + (requests?.length || 0)} offres actives
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-100">
            <div className="bg-card/50 backdrop-blur-sm rounded-lg p-4 text-center border hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <div className="text-2xl font-bold text-primary">{services?.length || 0}</div>
              <div className="text-sm text-muted-foreground">Services disponibles</div>
            </div>
            <div className="bg-card/50 backdrop-blur-sm rounded-lg p-4 text-center border hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <div className="text-2xl font-bold text-green-600">{requests?.length || 0}</div>
              <div className="text-sm text-muted-foreground">Demandes actives</div>
            </div>
            <div className="bg-card/50 backdrop-blur-sm rounded-lg p-4 text-center border hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <div className="text-2xl font-bold text-purple-600">{allSkills?.length || 0}</div>
              <div className="text-sm text-muted-foreground">Compétences</div>
            </div>
            <div className="bg-card/50 backdrop-blur-sm rounded-lg p-4 text-center border hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <div className="text-2xl font-bold text-orange-600">
                {Math.round(((services?.length || 0) + (requests?.length || 0)) / 7)}
              </div>
              <div className="text-sm text-muted-foreground">Nouveautés/semaine</div>
            </div>
          </div>
        </div>

        <div className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-200">
          <ServiceBoard
            services={services || []}
            requests={requests || []}
            allSkills={allSkills || []}
            currentUserId={userData.user.id}
          />
        </div>
      </main>
    </div>
  )
}
