import { createClient as createClientSide } from "./client"

export async function createClient() {
  // For server-side, we'll use the same mock client
  return createClientSide()
}
