import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication and admin role
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const isAdmin = userData.user.user_metadata?.role === "admin"
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "30d" // 7d, 30d, 90d, 1y

    // Calculate date range
    const now = new Date()
    const startDate = new Date()

    switch (period) {
      case "7d":
        startDate.setDate(now.getDate() - 7)
        break
      case "30d":
        startDate.setDate(now.getDate() - 30)
        break
      case "90d":
        startDate.setDate(now.getDate() - 90)
        break
      case "1y":
        startDate.setFullYear(now.getFullYear() - 1)
        break
    }

    // Get analytics data
    const [
      { count: totalUsers },
      { count: newUsers },
      { count: totalServices },
      { count: newServices },
      { count: totalExchanges },
      { count: completedExchanges },
      { data: userGrowth },
      { data: servicesByCategory },
    ] = await Promise.all([
      // Total users
      supabase
        .from("profiles")
        .select("*", { count: "exact", head: true }),

      // New users in period
      supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", startDate.toISOString()),

      // Total services
      supabase
        .from("services")
        .select("*", { count: "exact", head: true }),

      // New services in period
      supabase
        .from("services")
        .select("*", { count: "exact", head: true })
        .gte("created_at", startDate.toISOString()),

      // Total exchanges
      supabase
        .from("exchanges")
        .select("*", { count: "exact", head: true }),

      // Completed exchanges in period
      supabase
        .from("exchanges")
        .select("*", { count: "exact", head: true })
        .eq("status", "completed")
        .gte("created_at", startDate.toISOString()),

      // User growth over time
      supabase
        .from("profiles")
        .select("created_at")
        .gte("created_at", startDate.toISOString())
        .order("created_at"),

      // Services by category
      supabase
        .from("services")
        .select("category")
        .gte("created_at", startDate.toISOString()),
    ])

    // Process user growth data
    const growthData =
      userGrowth?.reduce((acc: Record<string, number>, user) => {
        const date = new Date(user.created_at).toISOString().split("T")[0]
        acc[date] = (acc[date] || 0) + 1
        return acc
      }, {}) || {}

    // Process services by category
    const categoryData =
      servicesByCategory?.reduce((acc: Record<string, number>, service) => {
        acc[service.category] = (acc[service.category] || 0) + 1
        return acc
      }, {}) || {}

    const analytics = {
      overview: {
        totalUsers: totalUsers || 0,
        newUsers: newUsers || 0,
        totalServices: totalServices || 0,
        newServices: newServices || 0,
        totalExchanges: totalExchanges || 0,
        completedExchanges: completedExchanges || 0,
      },
      userGrowth: Object.entries(growthData).map(([date, count]) => ({
        date,
        count,
      })),
      servicesByCategory: Object.entries(categoryData).map(([category, count]) => ({
        category,
        count,
      })),
      period,
    }

    return NextResponse.json({ analytics })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
