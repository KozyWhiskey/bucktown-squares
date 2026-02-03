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
    <main className="flex flex-col items-center py-5 sm:py-10 px-4">
      <div className="text-center mb-12 sm:mb-20 space-y-4">
        <h1 className="text-3xl sm:text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-indigo-200 to-pink-200 drop-shadow-sm tracking-tighter">
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