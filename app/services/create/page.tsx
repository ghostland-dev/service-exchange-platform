import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ServiceForm } from "@/components/service-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Handshake, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function CreateServicePage() {
  const supabase = await createClient()

  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData?.user) {
    redirect("/auth/login")
  }

  // Get all skills for the form
  const { data: allSkills } = await supabase.from("skills").select("*").order("category").order("name")

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
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/services">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux services
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Publier un service</h1>
          <p className="text-muted-foreground">
            Partagez vos compétences avec la communauté et trouvez des partenaires d'échange.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Détails du service</CardTitle>
          </CardHeader>
          <CardContent>
            <ServiceForm allSkills={allSkills || []} userId={userData.user.id} />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
