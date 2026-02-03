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
    <div className="relative w-full max-w-4xl mx-auto p-2 sm:p-4">
      {/* Team Header (Top) - New England */}
      <div className="mb-4 text-center">
        <h2 className="text-xl sm:text-3xl font-black text-white uppercase tracking-widest drop-shadow-[0_2px_10px_rgba(0,0,0,0.3)] bg-gradient-to-r from-blue-100 via-white to-blue-100 bg-clip-text text-transparent">
          New England
        </h2>
        <p className="text-[10px] sm:text-sm text-blue-200/60 font-medium tracking-wide uppercase mt-1">
          (Last Digit of Score)
        </p>
      </div>

      <div className="overflow-x-auto pb-4">
        <div className="flex min-w-[600px]">
          {/* Team Header (Side) - Seahawks */}
          <div className="flex flex-col justify-center items-center mr-1 sm:mr-4">
            <div className="h-full flex items-center">
              <h2 className="-rotate-180 text-xl sm:text-3xl font-black text-white uppercase tracking-widest drop-shadow-[0_2px_10px_rgba(0,0,0,0.3)] whitespace-nowrap" style={{ writingMode: 'vertical-rl' }}>
                <span className="bg-gradient-to-b from-green-100 via-white to-blue-100 bg-clip-text text-transparent">
                  Seahawks
                </span>
              </h2>
            </div>
          </div>

          {/* Container for the grid with headers */}
          <div className="grid grid-cols-[auto_1fr] gap-2 sm:gap-4 flex-1">
            
            {/* Top Left Corner (Empty/Logo) */}
            <div className="w-8 h-8 sm:w-12 sm:h-12 flex items-center justify-center text-white/20 font-bold text-xs sm:text-lg">
              🏈
            </div>

            {/* Top Headers (Columns) */}
            <div className="grid grid-cols-10 gap-px sm:gap-1">
              {colHeaders.map((num, i) => (
                <div 
                  key={`col-${i}`} 
                  className="aspect-square flex items-center justify-center text-xs sm:text-xl font-bold bg-black/40 text-white/70 rounded-t-sm backdrop-blur-sm"
                >
                  {num}
                </div>
              ))}
            </div>

            {/* Side Headers (Rows) */}
            <div className="grid grid-rows-10 gap-px sm:gap-1">
              {rowHeaders.map((num, i) => (
                <div 
                  key={`row-${i}`} 
                  className="aspect-square flex items-center justify-center text-xs sm:text-xl font-bold bg-black/40 text-white/70 rounded-l-sm backdrop-blur-sm"
                >
                  {num}
                </div>
              ))}
            </div>

            {/* The Grid */}
            <div className="grid grid-cols-10 grid-rows-10 gap-px sm:gap-1 bg-black/30 border border-white/10 rounded-br-lg p-px sm:p-1 backdrop-blur-sm shadow-2xl">
              {Array.from({ length: 10 }).map((_, x) => 
                Array.from({ length: 10 }).map((_, y) => {
                  const square = getSquare(x, y)
                  if (!square) return <div key={`${x}-${y}`} className="bg-red-500/20" /> 
                  
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
      <div className="mt-12 w-full">
         <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
           <span>🏆</span> Winners Board
         </h3>
         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
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
                 <div key={q.id} className={cn("bg-white/5 border rounded-xl overflow-hidden", `border-${q.color}-500/30`)}>
                    <div className={cn("p-2 text-center font-bold text-sm uppercase text-white/80", `bg-${q.color}-500/20`)}>
                      {q.title}
                    </div>
                    <div className="p-4 space-y-4">
                      {/* Standard Winner */}
                      <div>
                        <div className="flex justify-between text-xs text-white/40 mb-1">
                          <span>Winner</span>
                          <span className={cn(`text-${q.color}-300`)}>{win.payout}</span>
                        </div>
                        {hasWinner ? (
                          <div className="font-bold text-white text-lg truncate">
                            {win.square?.user_name || "Unclaimed"}
                          </div>
                        ) : (
                          <div className="text-white/20 text-sm italic">Waiting...</div>
                        )}
                      </div>
                      
                      {/* Reverse Winner */}
                      <div className="pt-3 border-t border-white/10">
                        <div className="flex justify-between text-xs text-white/40 mb-1">
                          <span>Reverse</span>
                          <span className="text-pink-300">{rev.payout}</span>
                        </div>
                         {hasWinner ? (
                          <div className="font-medium text-white/80 truncate">
                            {rev.square?.user_name || "Unclaimed"}
                          </div>
                        ) : (
                          <div className="text-white/20 text-sm italic">Waiting...</div>
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