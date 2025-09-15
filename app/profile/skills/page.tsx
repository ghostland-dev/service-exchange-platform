import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { SkillsManager } from "@/components/skills-manager"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Handshake, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function SkillsPage() {
  const supabase = await createClient()

  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData?.user) {
    redirect("/auth/login")
  }

  // Get all available skills
  const { data: allSkills } = await supabase
    .from("skills")
    .select("*")
    .order("category", { ascending: true })
    .order("name", { ascending: true })

  // Get user's current skills
  const { data: userSkills } = await supabase
    .from("user_skills")
    .select(`
      *,
      skills (
        id,
        name,
        category
      )
    `)
    .eq("user_id", userData.user.id)

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
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/profile">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour au profil
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Gérer mes compétences</h1>
          <p className="text-muted-foreground">
            Ajoutez et gérez vos compétences pour que les autres membres puissent vous trouver facilement.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Mes compétences</CardTitle>
          </CardHeader>
          <CardContent>
            <SkillsManager allSkills={allSkills || []} userSkills={userSkills || []} userId={userData.user.id} />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
