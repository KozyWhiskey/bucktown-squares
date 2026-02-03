"use client"

import { useEffect, useState } from "react"
import { Database } from "@/types/database.types"
import { createClient } from "@/utils/supabase/client"
import { Square, WinStatus } from "./Square"
import { ClaimModal } from "./ClaimModal"
import { claimSquare } from "@/app/actions"
import { cn } from "@/utils/cn"

type SquareRow = Database['public']['Tables']['squares']['Row']
type GameStateRow = Database['public']['Tables']['game_state']['Row']

interface GridProps {
  initialSquares: SquareRow[]
  initialGameState: GameStateRow | null
}

export function Grid({ initialSquares, initialGameState }: GridProps) {
  const [squares, setSquares] = useState<SquareRow[]>(initialSquares)
  const [gameState, setGameState] = useState<GameStateRow | null>(initialGameState)
  const [selectedSquare, setSelectedSquare] = useState<SquareRow | null>(null)
  
  const supabase = createClient()

  useEffect(() => {
    // Realtime subscription for Squares
    const channel = supabase
      .channel('grid-updates')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'squares' },
        (payload) => {
          const newSquare = payload.new as SquareRow
          setSquares((prev) => 
            prev.map((s) => s.id === newSquare.id ? newSquare : s)
          )
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'game_state' },
        (payload) => {
          setGameState(payload.new as GameStateRow)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  // Helper to get square by x,y
  const getSquare = (x: number, y: number) => {
    return squares.find(s => s.x === x && s.y === y)
  }

  const handleClaim = async (id: string, name: string, email: string) => {
    await claimSquare(id, name, email)
  }

  // Row/Col Headers
  const colHeaders = gameState?.col_numbers ?? Array(10).fill("?")
  const rowHeaders = gameState?.row_numbers ?? Array(10).fill("?")

  // Winner Calculation Logic
  const getWinningSquare = (homeScore: number | null | undefined, awayScore: number | null | undefined, isReverse = false) => {
    if (homeScore == null || awayScore == null || !gameState?.col_numbers || !gameState?.row_numbers) return null
    
    const hDigit = Number(homeScore) % 10
    const aDigit = Number(awayScore) % 10

    const targetColDigit = isReverse ? aDigit : hDigit
    const targetRowDigit = isReverse ? hDigit : aDigit

    const colIndex = gameState.col_numbers.indexOf(targetColDigit)
    const rowIndex = gameState.row_numbers.indexOf(targetRowDigit)

    if (colIndex === -1 || rowIndex === -1) return null
    return getSquare(rowIndex, colIndex) || null
  }

  // Calculate all winners
  const winners: Record<string, { square: SquareRow | null, label: string, color: string, payout: string }> = {
    q1: { square: getWinningSquare(gameState?.q1_home, gameState?.q1_away), label: "Q1 Winner", color: "purple", payout: "$100" },
    q1Rev: { square: getWinningSquare(gameState?.q1_home, gameState?.q1_away, true), label: "Q1 Reverse", color: "purple", payout: "$50" },
    half: { square: getWinningSquare(gameState?.q2_home, gameState?.q2_away), label: "Halftime", color: "blue", payout: "$200" },
    halfRev: { square: getWinningSquare(gameState?.q2_home, gameState?.q2_away, true), label: "Half Reverse", color: "blue", payout: "$50" },
    q3: { square: getWinningSquare(gameState?.q3_home, gameState?.q3_away), label: "Q3 Winner", color: "orange", payout: "$100" },
    q3Rev: { square: getWinningSquare(gameState?.q3_home, gameState?.q3_away, true), label: "Q3 Reverse", color: "orange", payout: "$50" },
    final: { square: getWinningSquare(gameState?.final_home, gameState?.final_away), label: "Final Winner", color: "green", payout: "$400" },
    finalRev: { square: getWinningSquare(gameState?.final_home, gameState?.final_away, true), label: "Final Reverse", color: "green", payout: "$50" },
  }

  return (
    <div className="relative w-full max-w-7xl mx-auto p-2 sm:p-4">
      {/* Team Header (Top) - Patriots */}
      <div className="mb-4 text-center">
        <h2 className="text-xl sm:text-3xl font-black uppercase tracking-widest drop-shadow-[0_2px_10px_rgba(0,0,0,0.3)]">
          <span className="bg-gradient-to-r from-[#002244] via-white to-[#C60C30] bg-clip-text text-transparent">
            Patriots
          </span>
        </h2>
        <p className="text-[10px] sm:text-sm text-blue-200/60 font-medium tracking-wide uppercase mt-1">
          (Last Digit of Score)
        </p>
      </div>

      <div className="overflow-x-auto pb-4 scrollbar-hide">
        <div className="flex min-w-[900px]">
          {/* Team Header (Side) - Seahawks */}
          <div className="flex flex-col justify-center items-center mr-2 sm:mr-6">
            <div className="h-full flex items-center">
              <h2 className="-rotate-180 text-xl sm:text-3xl font-black text-white uppercase tracking-widest drop-shadow-[0_2px_10px_rgba(0,0,0,0.3)] whitespace-nowrap" style={{ writingMode: 'vertical-rl' }}>
                <span className="bg-gradient-to-b from-[#69BE28] via-white to-[#002244] bg-clip-text text-transparent">
                  Seahawks
                </span>
              </h2>
            </div>
          </div>

          {/* Container for the grid with headers */}
          <div className="grid grid-cols-[auto_1fr] gap-2 sm:gap-3 flex-1">
            
            {/* Top Left Corner (Empty/Logo) */}
            <div className="w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center text-white/20 font-bold text-sm sm:text-xl">
              🏈
            </div>

            {/* Top Headers (Columns) */}
            <div className="grid grid-cols-10 gap-1 sm:gap-1.5">
              {colHeaders.map((num, i) => (
                <div 
                  key={`col-${i}`} 
                  className="aspect-square flex items-center justify-center text-sm sm:text-2xl font-black bg-slate-900/80 backdrop-blur-md border border-white/10 text-white/90 rounded-t-lg shadow-sm"
                >
                  {num}
                </div>
              ))}
            </div>

            {/* Side Headers (Rows) */}
            <div className="grid grid-rows-10 gap-1 sm:gap-1.5">
              {rowHeaders.map((num, i) => (
                <div 
                  key={`row-${i}`} 
                  className="aspect-square flex items-center justify-center text-sm sm:text-2xl font-black bg-slate-900/80 backdrop-blur-md border border-white/10 text-white/90 rounded-l-lg shadow-sm"
                >
                  {num}
                </div>
              ))}
            </div>

            {/* The Grid */}
            <div className="grid grid-cols-10 grid-rows-10 gap-1 sm:gap-1.5 glass-card bg-black/60 rounded-br-2xl p-1 sm:p-2 shadow-2xl overflow-hidden">
              {Array.from({ length: 10 }).map((_, x) => 
                Array.from({ length: 10 }).map((_, y) => {
                  const square = getSquare(x, y)
                  if (!square) return <div key={`${x}-${y}`} className="bg-red-500/10" /> 
                  
                  // Check if this square is a winner
                  const squareWins: WinStatus[] = []
                  if (winners.q1.square?.id === square.id) squareWins.push({ label: "Q1", color: "purple", isReverse: false })
                  if (winners.q1Rev.square?.id === square.id) squareWins.push({ label: "Q1", color: "purple", isReverse: true })
                  if (winners.half.square?.id === square.id) squareWins.push({ label: "Half", color: "blue", isReverse: false })
                  if (winners.halfRev.square?.id === square.id) squareWins.push({ label: "Half", color: "blue", isReverse: true })
                  if (winners.q3.square?.id === square.id) squareWins.push({ label: "Q3", color: "orange", isReverse: false })
                  if (winners.q3Rev.square?.id === square.id) squareWins.push({ label: "Q3", color: "orange", isReverse: true })
                  if (winners.final.square?.id === square.id) squareWins.push({ label: "Final", color: "green", isReverse: false })
                  if (winners.finalRev.square?.id === square.id) squareWins.push({ label: "Final", color: "green", isReverse: true })

                  return (
                    <Square 
                      key={square.id} 
                      square={square} 
                      onClick={setSelectedSquare} 
                      disabled={gameState?.is_locked}
                      wins={squareWins}
                    />
                  )
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Winners List Section */}
      <div className="mt-16 w-full">
         <h3 className="text-3xl font-black text-white mb-8 flex items-center gap-3 tracking-tighter">
           <span className="p-2 bg-white/10 rounded-xl">🏆</span> Winners Board
         </h3>
         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { id: 'q1', title: '1st Quarter', color: 'purple' },
              { id: 'half', title: 'Halftime', color: 'blue' },
              { id: 'q3', title: '3rd Quarter', color: 'orange' },
              { id: 'final', title: 'Final Score', color: 'green' }
            ].map((q) => {
               const win = winners[q.id]
               const rev = winners[q.id + 'Rev']
               
               const hasWinner = !!win.square
               
               return (
                 <div key={q.id} className={cn("glass-card rounded-2xl overflow-hidden transition-all hover:scale-[1.02]", `border-${q.color}-500/20`)}>
                    <div className={cn("p-3 text-center font-black text-xs uppercase tracking-widest text-white/90", `bg-${q.color}-500/20`)}>
                      {q.title}
                    </div>
                    <div className="p-5 space-y-5">
                      {/* Standard Winner */}
                      <div>
                        <div className="flex justify-between text-xs uppercase font-bold tracking-wider text-white/40 mb-2">
                          <span>Winner</span>
                          <span className={cn(`text-${q.color}-400`, "font-black")}>{win.payout}</span>
                        </div>
                        {hasWinner ? (
                          <div className="font-black text-white text-2xl truncate tracking-tight">
                            {win.square?.user_name || "Unclaimed"}
                          </div>
                        ) : (
                          <div className="text-white/10 text-base font-medium italic">Waiting...</div>
                        )}
                      </div>
                      
                      {/* Reverse Winner */}
                      <div className="pt-4 border-t border-white/5">
                        <div className="flex justify-between text-xs uppercase font-bold tracking-wider text-white/40 mb-2">
                          <span>Reverse</span>
                          <span className="text-pink-400 font-black">{rev.payout}</span>
                        </div>
                         {hasWinner ? (
                          <div className="font-black text-white/80 text-lg truncate tracking-tight">
                            {rev.square?.user_name || "Unclaimed"}
                          </div>
                        ) : (
                          <div className="text-white/10 text-sm font-medium italic">Waiting...</div>
                        )}
                      </div>
                    </div>
                 </div>
               )
            })}
         </div>
      </div>

      {selectedSquare && (
        <ClaimModal
          square={selectedSquare}
          onClose={() => setSelectedSquare(null)}
          onClaim={handleClaim}
        />
      )}
    </div>
  )
}