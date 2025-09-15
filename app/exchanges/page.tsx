import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ExchangeManager } from "@/components/exchange-manager"
import { Button } from "@/components/ui/button"
import { Handshake } from "lucide-react"
import Link from "next/link"

export default async function ExchangesPage() {
  const supabase = await createClient()

  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData?.user) {
    redirect("/auth/login")
  }

  // Get all exchanges where user is involved
  const { data: exchanges } = await supabase
    .from("exchanges")
    .select(`
      *,
      services (
        id,
        title,
        description,
        category
      ),
      service_requests (
        id,
        title,
        description,
        category
      ),
      provider:profiles!provider_id (
        id,
        full_name,
        avatar_url
      ),
      requester:profiles!requester_id (
        id,
        full_name,
        avatar_url
      )
    `)
    .or(`provider_id.eq.${userData.user.id},requester_id.eq.${userData.user.id}`)
    .order("created_at", { ascending: false })

  // Get reviews for exchanges where user can leave a review
  const { data: reviews } = await supabase
    .from("reviews")
    .select("exchange_id, reviewer_id")
    .eq("reviewer_id", userData.user.id)

  const reviewedExchangeIds = new Set(reviews?.map((r) => r.exchange_id) || [])

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
            <Button variant="ghost" asChild>
              <Link href="/services">Services</Link>
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Mes échanges</h1>
          <p className="text-muted-foreground">Suivez et gérez tous vos échanges de services</p>
        </div>

        <ExchangeManager
          exchanges={exchanges || []}
          currentUserId={userData.user.id}
          reviewedExchangeIds={reviewedExchangeIds}
        />
      </main>
    </div>
  )
}
