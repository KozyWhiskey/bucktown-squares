"use server"

import { createClient, createAdminClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function claimSquare(id: string, name: string, email: string) {
  const supabase = await createClient() as any

  // Verify it's empty first (Double check security, though RLS handles this too)
  const { data: square } = await supabase
    .from("squares")
    .select("*")
    .eq("id", id)
    .single()

  if (square?.user_name) {
    throw new Error("Square already taken")
  }

  const { error } = await supabase
    .from("squares")
    .update({ user_name: name, user_email: email })
    .eq("id", id)
    .is("user_name", null) // Extra safety: ensuring we only update if null

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/")
}

// Admin Actions
// NOTE: In a real app, add authentication checks here (e.g., check session role)

export async function removePlayer(id: string) {
  const supabase = await createAdminClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("squares") as any)
    .update({ user_name: null, user_email: null, paid: false })
    .eq("id", id)

  if (error) throw new Error(error.message)
  revalidatePath("/admin")
  revalidatePath("/")
}

export async function togglePaid(id: string, currentStatus: boolean) {
  const supabase = await createAdminClient()
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("squares") as any)
    .update({ paid: !currentStatus })
    .eq("id", id)

  if (error) throw new Error(error.message)
  revalidatePath("/admin")
}

export async function generateNumbers() {
  const supabase = await createAdminClient()

  // Generate random 0-9 arrays
  const shuffle = (arr: number[]) => arr.sort(() => Math.random() - 0.5)
  const rows = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
  const cols = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])

  // Get the single game state row ID (assuming only 1 exists)
  const { data: states } = await supabase.from("game_state").select("id").limit(1)
  if (!states || states.length === 0) throw new Error("No game state found")
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("game_state") as any)
    .update({ row_numbers: rows, col_numbers: cols, is_locked: true })
    // @ts-ignore
    .eq("id", states[0].id)

  if (error) throw new Error(error.message)
  revalidatePath("/")
}

export async function resetGame() {
  const supabase = await createAdminClient()
  
  const { data: states } = await supabase.from("game_state").select("id").limit(1)
  if (!states || states.length === 0) throw new Error("No game state found")

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("game_state") as any)
    .update({ 
      row_numbers: null, 
      col_numbers: null, 
      is_locked: false,
      q1_home: null, q1_away: null,
      q2_home: null, q2_away: null,
      q3_home: null, q3_away: null,
      final_home: null, final_away: null
    })
    // @ts-ignore
    .eq("id", states[0].id)

  if (error) throw new Error(error.message)
  revalidatePath("/")
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateGameState(newState: any) {
  const supabase = await createAdminClient()
  
  const { data: states } = await supabase.from("game_state").select("id").limit(1)
  if (!states || states.length === 0) throw new Error("No game state found")

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("game_state") as any)
    .update(newState)
    // @ts-ignore
    .eq("id", states[0].id)

  if (error) throw new Error(error.message)
  revalidatePath("/")
}