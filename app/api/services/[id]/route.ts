import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()

    const { data: service, error } = await supabase
      .from("services")
      .select(`
        *,
        profiles (
          id,
          full_name,
          avatar_url,
          location,
          bio
        )
      `)
      .eq("id", params.id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    return NextResponse.json({ service })
  } catch (error) {
    console.error("Error fetching service:", error)
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

    // Check if user owns this service or is admin
    const { data: existingService, error: fetchError } = await supabase
      .from("services")
      .select("user_id")
      .eq("id", params.id)
      .single()

    if (fetchError) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }

    const isAdmin = userData.user.user_metadata?.role === "admin"
    if (existingService.user_id !== userData.user.id && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, category, skill_ids, estimated_hours, difficulty_level, is_active } = body

    const updateData: any = {
      title,
      description,
      category,
      skill_ids,
      estimated_hours: estimated_hours ? Number.parseInt(estimated_hours) : null,
      difficulty_level,
      updated_at: new Date().toISOString(),
    }

    // Only admins can update is_active status
    if (isAdmin && typeof is_active === "boolean") {
      updateData.is_active = is_active
    }

    const { data: service, error } = await supabase
      .from("services")
      .update(updateData)
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ service })
  } catch (error) {
    console.error("Error updating service:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user owns this service or is admin
    const { data: existingService, error: fetchError } = await supabase
      .from("services")
      .select("user_id")
      .eq("id", params.id)
      .single()

    if (fetchError) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }

    const isAdmin = userData.user.user_metadata?.role === "admin"
    if (existingService.user_id !== userData.user.id && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { error } = await supabase.from("services").delete().eq("id", params.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: "Service deleted successfully" })
  } catch (error) {
    console.error("Error deleting service:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
