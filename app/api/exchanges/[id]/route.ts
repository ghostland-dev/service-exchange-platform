import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: exchange, error } = await supabase
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
          avatar_url,
          email
        ),
        requester:profiles!requester_id (
          id,
          full_name,
          avatar_url,
          email
        )
      `)
      .eq("id", params.id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    // Check if user is involved in this exchange
    if (exchange.provider_id !== userData.user.id && exchange.requester_id !== userData.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json({ exchange })
  } catch (error) {
    console.error("Error fetching exchange:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is involved in this exchange
    const { data: existingExchange, error: fetchError } = await supabase
      .from("exchanges")
      .select("provider_id, requester_id, status")
      .eq("id", params.id)
      .single()

    if (fetchError) {
      return NextResponse.json({ error: "Exchange not found" }, { status: 404 })
    }

    if (existingExchange.provider_id !== userData.user.id && existingExchange.requester_id !== userData.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { status, message } = body

    // Validate status transitions
    const validTransitions: Record<string, string[]> = {
      pending: ["accepted", "rejected"],
      accepted: ["in_progress", "cancelled"],
      in_progress: ["completed", "cancelled"],
      completed: [],
      rejected: [],
      cancelled: [],
    }

    if (!validTransitions[existingExchange.status]?.includes(status)) {
      return NextResponse.json({ error: "Invalid status transition" }, { status: 400 })
    }

    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    }

    if (message) {
      updateData.message = message
    }

    if (status === "completed") {
      updateData.completed_at = new Date().toISOString()
    }

    const { data: exchange, error } = await supabase
      .from("exchanges")
      .update(updateData)
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ exchange })
  } catch (error) {
    console.error("Error updating exchange:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
