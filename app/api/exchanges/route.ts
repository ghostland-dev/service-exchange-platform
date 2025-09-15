import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status") || ""

    // Build query for exchanges where user is involved
    let query = supabase
      .from("exchanges")
      .select(
        `
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
      `,
        { count: "exact" },
      )
      .or(`provider_id.eq.${userData.user.id},requester_id.eq.${userData.user.id}`)
      .range((page - 1) * limit, page * limit - 1)
      .order("created_at", { ascending: false })

    // Apply status filter
    if (status) {
      query = query.eq("status", status)
    }

    const { data: exchanges, error, count } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      exchanges,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching exchanges:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { service_id, service_request_id, provider_id, message } = body

    // Validate required fields
    if (!provider_id || (!service_id && !service_request_id)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Prevent self-exchange
    if (provider_id === userData.user.id) {
      return NextResponse.json({ error: "Cannot create exchange with yourself" }, { status: 400 })
    }

    const { data: exchange, error } = await supabase
      .from("exchanges")
      .insert({
        service_id,
        service_request_id,
        provider_id,
        requester_id: userData.user.id,
        status: "pending",
        message,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ exchange }, { status: 201 })
  } catch (error) {
    console.error("Error creating exchange:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
