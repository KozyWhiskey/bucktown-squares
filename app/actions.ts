"use server"

import { createClient, createAdminClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { Database } from "@/types/database.types"

type SquareUpdate = Database['public']['Tables']['squares']['Update']
type SquareRow = Database['public']['Tables']['squares']['Row']
type GameStateUpdate = Database['public']['Tables']['game_state']['Update']
type GameStateRow = Database['public']['Tables']['game_state']['Row']

export async function claimSquare(id: string, name: string, email: string) {
  const supabase = await createClient()

  // Verify it's empty first
  const { data } = await supabase
    .from("squares")
    .select()
    .eq("id", id)
    .single()

  const square = data as SquareRow | null

  if (square?.user_name) {
    throw new Error("Square already taken")
  }

  const { error } = await (supabase
    .from("squares") as any)
    .update({ user_name: name, user_email: email } as SquareUpdate)
    .eq("id", id)
    .is("user_name", null)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/")
}

export async function removePlayer(id: string) {
  const supabase = await createAdminClient()

  const { error } = await (supabase
    .from("squares") as any)
    .update({ user_name: null, user_email: null, paid: false } as SquareUpdate)
    .eq("id", id)

  if (error) throw new Error(error.message)
  revalidatePath("/admin")
  revalidatePath("/")
}

export async function togglePaid(id: string, currentStatus: boolean) {
  const supabase = await createAdminClient()
  
  const { error } = await (supabase
    .from("squares") as any)
    .update({ paid: !currentStatus } as SquareUpdate)
    .eq("id", id)

  if (error) throw new Error(error.message)
  revalidatePath("/admin")
}

export async function generateNumbers() {
  const supabase = await createAdminClient()

  const shuffle = (arr: number[]) => [...arr].sort(() => Math.random() - 0.5)
  const rows = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
  const cols = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])

  const { data } = await supabase.from("game_state").select("id").limit(1)
  const states = data as { id: string }[] | null // Only selecting ID here

  if (!states || states.length === 0) throw new Error("No game state found")
  
  const { error } = await (supabase
    .from("game_state") as any)
    .update({ row_numbers: rows, col_numbers: cols, is_locked: true } as GameStateUpdate)
    .eq("id", states[0].id)

  if (error) throw new Error(error.message)
  revalidatePath("/")
}

export async function resetGame() {
  const supabase = await createAdminClient()
  
  const { data } = await supabase.from("game_state").select("id").limit(1)
  const states = data as { id: string }[] | null

  if (!states || states.length === 0) throw new Error("No game state found")

  const { error } = await (supabase
    .from("game_state") as any)
    .update({ 
      row_numbers: null, 
      col_numbers: null, 
      is_locked: false,
      q1_home: null, q1_away: null,
      q2_home: null, q2_away: null,
      q3_home: null, q3_away: null,
      final_home: null, final_away: null
    } as GameStateUpdate)
    .eq("id", states[0].id)

  if (error) throw new Error(error.message)
  revalidatePath("/")
}

export async function updateGameState(newState: GameStateUpdate) {
  const supabase = await createAdminClient()
  
  const { data } = await supabase.from("game_state").select("id").limit(1)
  const states = data as { id: string }[] | null

  if (!states || states.length === 0) throw new Error("No game state found")

  const { error } = await (supabase
    .from("game_state") as any)
    .update(newState)
    .eq("id", states[0].id)

  if (error) throw new Error(error.message)
  revalidatePath("/")
}