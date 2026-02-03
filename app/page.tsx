import { createClient } from "@/utils/supabase/server"
import { Grid } from "@/components/Grid"
import { Rules } from "@/components/Rules"

export const dynamic = 'force-dynamic'

export default async function Home() {
  const supabase = await createClient()

  // Fetch all squares
  const { data: squares } = await supabase
    .from("squares")
    .select("*")
    .order("x")
    .order("y")

  // Fetch game state
  const { data: gameState } = await supabase
    .from("game_state")
    .select("*")
    .single()

  return (
    <main className="min-h-screen bg-aurora flex flex-col items-center py-10 sm:py-20 px-4">
      <div className="text-center mb-8 sm:mb-12 space-y-4">
        <h1 className="text-3xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-indigo-200 to-pink-200 drop-shadow-sm tracking-tight">
          Super Bowl Squares
        </h1>
      </div>

      <Rules />

      <Grid 
        initialSquares={squares || []} 
        initialGameState={gameState || null} 
      />
    </main>
  )
}