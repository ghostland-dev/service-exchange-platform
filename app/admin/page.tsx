import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminDashboard } from "@/components/admin-dashboard"

export default async function AdminPage() {
  const supabase = await createClient()

  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData?.user) {
    redirect("/auth/login")
  }

  // Check if user is admin (in a real app, you'd check user roles)
  const isAdmin = userData.user.email === "admin@serviceswap.com" || userData.user.user_metadata?.role === "admin"

  if (!isAdmin) {
    redirect("/dashboard")
  }

  // Get platform statistics
  const { count: totalUsers } = await supabase.from("profiles").select("*", { count: "exact", head: true })

  const { count: totalServices } = await supabase.from("services").select("*", { count: "exact", head: true })

  const { count: activeExchanges } = await supabase
    .from("exchanges")
    .select("*", { count: "exact", head: true })
    .in("status", ["pending", "accepted", "in_progress"])

  const { count: completedExchanges } = await supabase
    .from("exchanges")
    .select("*", { count: "exact", head: true })
    .eq("status", "completed")

  // Get recent users
  const { data: recentUsers } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10)

  // Get recent services
  const { data: recentServices } = await supabase
    .from("services")
    .select(`
      *,
      profiles (
        full_name,
        email
      )
    `)
    .order("created_at", { ascending: false })
    .limit(10)

  // Get recent exchanges
  const { data: recentExchanges } = await supabase
    .from("exchanges")
    .select(`
      *,
      provider:profiles!provider_id (
        full_name,
        email
      ),
      requester:profiles!requester_id (
        full_name,
        email
      )
    `)
    .order("created_at", { ascending: false })
    .limit(10)

  const stats = {
    totalUsers: totalUsers || 0,
    totalServices: totalServices || 0,
    activeExchanges: activeExchanges || 0,
    completedExchanges: completedExchanges || 0,
  }

  return (
    <AdminDashboard
      stats={stats}
      recentUsers={recentUsers || []}
      recentServices={recentServices || []}
      recentExchanges={recentExchanges || []}
      currentUser={userData.user}
    />
  )
}
