import { createAdminClient } from "@/utils/supabase/server"
import { AdminDashboard } from "@/components/AdminDashboard"

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  // Use admin client to fetch ALL data including emails
  const supabase = await createAdminClient()

  const { data: squares } = await supabase
    .from("squares")
    .select("*")
    .order("x")
    .order("y")

  const { data: gameState } = await supabase
    .from("game_state")
    .select("*")
    .single()

  return (
    <main className="min-h-screen bg-black text-white p-4 sm:p-8">
      <h1 className="text-3xl font-bold mb-8 text-blue-400">Admin Dashboard</h1>
      <AdminDashboard 
        squares={squares || []} 
        gameState={gameState || null} 
      />
    </main>
  )
}
