"use client"

import { useState, useTransition, useMemo } from "react"
import { Database } from "@/types/database.types"
import { togglePaid, generateNumbers, updateGameState, resetGame, removePlayer } from "@/app/actions"
import { Check, X, Lock, Trophy, RotateCcw, Trash2, ArrowUpDown, ChevronUp, ChevronDown, Search, Filter } from "lucide-react"

type SquareRow = Database['public']['Tables']['squares']['Row']
type GameStateRow = Database['public']['Tables']['game_state']['Row']

interface AdminDashboardProps {
  squares: SquareRow[]
  gameState: GameStateRow | null
}

export function AdminDashboard({ squares, gameState }: AdminDashboardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [isPending, startTransition] = useTransition()

  // Sorting and Filtering State
  const [sortField, setSortField] = useState<string>('user_name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [searchTerm, setSearchTerm] = useState("")
  const [filterPaid, setFilterPaid] = useState<'all' | 'paid' | 'unpaid'>('all')

  // Local state for scores to handle input before blur/save
  const [scores, setScores] = useState({
    q1_home: gameState?.q1_home ?? "", q1_away: gameState?.q1_away ?? "",
    q2_home: gameState?.q2_home ?? "", q2_away: gameState?.q2_away ?? "", // q2 is halftime essentially
    q3_home: gameState?.q3_home ?? "", q3_away: gameState?.q3_away ?? "",
    final_home: gameState?.final_home ?? "", final_away: gameState?.final_away ?? "",
  })

  const filteredAndSortedSquares = useMemo(() => {
    return squares
      .filter(s => s.user_name)
      .filter(s => {
        const searchMatch = (s.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             s.user_email?.toLowerCase().includes(searchTerm.toLowerCase()))
        const paidMatch = filterPaid === 'all' || 
                          (filterPaid === 'paid' && s.paid) || 
                          (filterPaid === 'unpaid' && !s.paid)
        return searchMatch && paidMatch
      })
      .sort((a, b) => {
        let comparison = 0
        if (sortField === 'loc') {
          comparison = a.x !== b.x ? a.x - b.x : a.y - b.y
        } else if (sortField === 'paid') {
          comparison = (a.paid === b.paid) ? 0 : a.paid ? 1 : -1
        } else {
          const valA = String(a[sortField as keyof SquareRow] ?? "")
          const valB = String(b[sortField as keyof SquareRow] ?? "")
          comparison = valA.localeCompare(valB)
        }
        return sortDirection === 'asc' ? comparison : -comparison
      })
  }, [squares, searchTerm, filterPaid, sortField, sortDirection])

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-white/10 rounded-xl backdrop-blur-md border border-white/20">
        <h2 className="text-xl font-bold mb-4">Admin Access</h2>
        <form onSubmit={(e) => {
          e.preventDefault()
          if (password === "superbowl2025") setIsAuthenticated(true)
          else alert("Wrong password")
        }}>
          <input 
            type="password" 
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full bg-black/50 border border-white/30 rounded p-2 mb-4"
            placeholder="Password"
          />
          <button className="w-full bg-blue-600 hover:bg-blue-500 py-2 rounded font-bold">
            Login
          </button>
        </form>
      </div>
    )
  }

  const handleGenerate = () => {
    if (confirm("Are you sure? This will lock the grid and assign random numbers.")) {
      startTransition(async () => {
        await generateNumbers()
      })
    }
  }

  const handleReset = () => {
    if (confirm("DANGER: This will reset the numbers, unlock the grid, and clear scores. Are you sure?")) {
      startTransition(async () => {
        await resetGame()
        // Reset local score state
        setScores({
          q1_home: "", q1_away: "",
          q2_home: "", q2_away: "",
          q3_home: "", q3_away: "",
          final_home: "", final_away: "",
        })
      })
    }
  }

  const handleScoreUpdate = async () => {
    startTransition(async () => {
      // Convert empty strings to null
      const cleanScores = Object.fromEntries(
        Object.entries(scores).map(([k, v]) => [k, v === "" ? null : Number(v)])
      )
      await updateGameState(cleanScores)
    })
  }

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Winning Logic Helper
  const getWinner = (homeScore: number | string, awayScore: number | string) => {
    if (homeScore === "" || awayScore === "" || !gameState?.col_numbers || !gameState?.row_numbers) return null
    
    // Home = Patriots (Cols/Top), Away = Seahawks (Rows/Side)
    const homeDigit = Number(homeScore) % 10
    const awayDigit = Number(awayScore) % 10

    // Find indices
    // Home = Patriots (Cols/Top) -> Matches y in Grid
    // Away = Seahawks (Rows/Side) -> Matches x in Grid
    
    const colIndex = gameState.col_numbers.indexOf(homeDigit)
    const rowIndex = gameState.row_numbers.indexOf(awayDigit)

    if (rowIndex === -1 || colIndex === -1) return null

    return squares.find(s => s.x === rowIndex && s.y === colIndex)
  }

  const renderSortIcon = (field: string) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 opacity-30" />
    return sortDirection === 'asc' ? <ChevronUp className="w-3 h-3 text-blue-400" /> : <ChevronDown className="w-3 h-3 text-blue-400" />
  }

  return (
    <div className="space-y-8">
      
      {/* Game Control Section */}
      <section className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5 text-yellow-400" /> Game Control
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
             <h3 className="text-sm font-semibold text-white/50 mb-2 uppercase">Setup</h3>
             <button 
               onClick={handleGenerate}
               disabled={isPending || gameState?.is_locked}
               className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded text-sm font-bold w-full md:w-auto"
             >
               {gameState?.is_locked ? "Grid Locked & Numbers Generated" : "Generate Numbers & Lock Grid"}
             </button>
             
             <button 
               onClick={handleReset}
               disabled={isPending}
               className="mt-2 bg-red-600/80 hover:bg-red-500 disabled:opacity-50 px-4 py-2 rounded text-sm font-bold w-full md:w-auto flex items-center justify-center gap-2"
             >
               <RotateCcw className="w-4 h-4" /> Reset Game Data
             </button>

             {gameState?.is_locked && (
               <div className="mt-4 grid grid-cols-2 gap-4">
                 <div className="bg-black/40 p-2 rounded">
                   <span className="text-xs text-white/50 block">PAT (Cols)</span>
                   <span className="font-mono">{gameState.col_numbers?.join(", ")}</span>
                 </div>
                 <div className="bg-black/40 p-2 rounded">
                   <span className="text-xs text-white/50 block">SEA (Rows)</span>
                   <span className="font-mono">{gameState.row_numbers?.join(", ")}</span>
                 </div>
               </div>
             )}
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white/50 mb-2 uppercase flex justify-between">
              <span>Scores (PAT vs SEA)</span>
              <button onClick={handleScoreUpdate} disabled={isPending} className="text-blue-400 hover:text-blue-300 text-xs">Save Updates</button>
            </h3>
            
            {/* Score Inputs */}
            {(
              [
                { label: "Q1", h: "q1_home", a: "q1_away" },
                { label: "Half", h: "q2_home", a: "q2_away" },
                { label: "Q3", h: "q3_home", a: "q3_away" },
                { label: "Final", h: "final_home", a: "final_away" },
              ] as const
            ).map((q) => {
              const win = getWinner(scores[q.h], scores[q.a])
              const rev = getWinner(scores[q.a], scores[q.h])

              return (
              <div key={q.label} className="flex items-start gap-4 border-b border-white/5 pb-4 last:border-0">
                <div className="flex items-center gap-3 mt-1">
                  <span className="w-12 text-sm font-bold text-white/40 uppercase tracking-wider">{q.label}</span>
                  <div className="flex items-center bg-black/60 rounded-lg p-1 border border-white/5">
                    <input 
                      type="number" 
                      value={scores[q.h]} 
                      onChange={e => setScores({...scores, [q.h]: e.target.value})}
                      className="w-16 bg-transparent text-green-400 font-mono text-xl font-bold text-center focus:outline-none placeholder:text-white/10"
                      placeholder="-"
                    />
                    <span className="text-white/10 font-thin text-xl">/</span>
                    <input 
                      type="number" 
                      value={scores[q.a]} 
                      onChange={e => setScores({...scores, [q.a]: e.target.value})}
                      className="w-16 bg-transparent text-green-400 font-mono text-xl font-bold text-center focus:outline-none placeholder:text-white/10"
                      placeholder="-"
                    />
                  </div>
                </div>
                
                <div className="flex-1 flex flex-col justify-center min-h-[44px]">
                  {win ? (
                     <div className="flex items-center gap-2 text-green-400 bg-green-500/10 px-3 py-1.5 rounded-md border border-green-500/20 w-fit">
                       <Trophy className="w-3 h-3" />
                       <span className="font-bold text-sm">{win.user_name || "Unclaimed"}</span>
                       <span className="opacity-50 text-xs font-mono">({win.x}, {win.y})</span>
                     </div>
                  ) : (
                    <span className="text-white/10 text-xs py-1.5 italic">Waiting for scores...</span>
                  )}
                  
                  {rev && (
                     <div className="flex items-center gap-2 text-pink-400 mt-1 pl-1">
                       <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">Rev</span>
                       <span className="font-medium text-sm">{rev.user_name || "Unclaimed"}</span>
                     </div>
                  )}
                </div>
              </div>
            )})}
          </div>
        </div>
      </section>

      {/* Player Management Section */}
      <section className="bg-white/5 border border-white/10 rounded-xl p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span>👥</span> Player Management
          </h2>
          <div className="text-sm text-white/50 bg-black/20 px-3 py-1.5 rounded-full border border-white/5">
            Total Taken: <span className="text-white">{squares.filter(s => s.user_name).length}/100</span>
            <span className="mx-2">•</span>
            Paid: <span className="text-green-400">{squares.filter(s => s.paid).length}</span>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input 
              type="text" 
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-white/30" />
            <select 
              value={filterPaid}
              onChange={e => setFilterPaid(e.target.value as 'all' | 'paid' | 'unpaid')}
              className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500/50 transition-colors flex-1"
            >
              <option value="all">All Statuses</option>
              <option value="paid">Paid Only</option>
              <option value="unpaid">Unpaid Only</option>
            </select>
          </div>
          <div className="flex justify-end items-center text-xs text-white/30 italic">
            Showing {filteredAndSortedSquares.length} players
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-white/50 uppercase text-xs">
              <tr>
                <th className="p-3 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('loc')}>
                  <div className="flex items-center gap-2">Loc {renderSortIcon('loc')}</div>
                </th>
                <th className="p-3 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('user_name')}>
                  <div className="flex items-center gap-2">Name {renderSortIcon('user_name')}</div>
                </th>
                <th className="p-3 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('user_email')}>
                  <div className="flex items-center gap-2">Email {renderSortIcon('user_email')}</div>
                </th>
                <th className="p-3 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('paid')}>
                  <div className="flex items-center gap-2">Status {renderSortIcon('paid')}</div>
                </th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredAndSortedSquares.map((square) => (
                <tr key={square.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-3 font-mono text-white/50">
                    ({square.x}, {square.y})
                  </td>
                  <td className="p-3 font-semibold text-white">
                    {square.user_name}
                  </td>
                  <td className="p-3 text-blue-200/80">
                    {square.user_email}
                  </td>
                  <td className="p-3">
                    {square.paid ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 text-green-300 text-xs font-bold border border-green-500/30">
                        <Check className="w-3 h-3" /> Paid
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/20 text-red-300 text-xs font-bold border border-red-500/30">
                        <X className="w-3 h-3" /> Unpaid
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-right flex justify-end gap-2">
                    <button
                      onClick={() => startTransition(() => togglePaid(square.id, !!square.paid))}
                      disabled={isPending}
                      className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded transition-colors"
                    >
                      Toggle Paid
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to remove ${square.user_name}? This cannot be undone.`)) {
                          startTransition(() => removePlayer(square.id))
                        }
                      }}
                      disabled={isPending}
                      className="text-xs bg-red-500/20 hover:bg-red-500/30 text-red-300 px-3 py-1.5 rounded transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Remove
                    </button>
                  </td>
                </tr>
              ))}
              {filteredAndSortedSquares.length === 0 && (
                 <tr>
                   <td colSpan={5} className="p-8 text-center text-white/30">
                     {squares.filter(s => s.user_name).length === 0 ? "No squares claimed yet." : "No players match your filters."}
                   </td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  )
}
