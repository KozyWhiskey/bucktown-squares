"use client"

import { Database } from "@/types/database.types"
import { cn } from "@/utils/cn" // Need to create this utils helper first or inline it. I'll inline for now or create utils/cn.ts

type SquareRow = Database['public']['Tables']['squares']['Row']

export interface WinStatus {
  label: string
  color: string // e.g. "purple"
  isReverse: boolean
}

interface SquareProps {
  square: SquareRow
  rowNumbers?: number[] | null
  colNumbers?: number[] | null
  onClick: (square: SquareRow) => void
  disabled?: boolean
  wins?: WinStatus[]
}

export function Square({ square, onClick, disabled, wins = [] }: SquareProps) {
  const isTaken = !!square.user_name

  // Mapping for explicit labels as requested
  const getExplicitLabel = (w: WinStatus) => {
    let base = ""
    if (w.label.includes("Q1")) base = "Q1"
    else if (w.label.includes("Half")) base = "Half"
    else if (w.label.includes("Q3")) base = "Q3"
    else if (w.label.includes("Final")) base = "Final"
    else base = w.label

    return w.isReverse ? `${base} R` : base
  }

  // Base classes
  let bgClass = isTaken ? "bg-slate-900/60" : "bg-slate-900/40"
  let borderClass = "border-white/10"
  
  // Single Light Highlight for ANY win
  const hasWin = wins.length > 0
  
  if (hasWin) {
    // A clean, single light-blue/white highlight for visibility
    borderClass = "border-blue-400/50 shadow-[0_0_20px_rgba(56,189,248,0.3)] z-10"
    bgClass = "bg-blue-500/20"
  }

  return (
    <button
      onClick={() => !disabled && onClick(square)}
      disabled={disabled}
      className={cn(
        "group relative aspect-square w-full flex items-center justify-center p-0.5 sm:p-1 text-xs sm:text-sm font-medium transition-all duration-300",
        "border rounded-md",
        borderClass,
        bgClass,
        !isTaken && !disabled && "hover:bg-white/20 cursor-pointer",
        isTaken && !disabled && "cursor-pointer hover:bg-white/20",
        "backdrop-blur-md shadow-sm overflow-hidden"
      )}
    >
      {/* Glossy overlay effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

      {/* Explicit Win Labels */}
      {wins.length > 0 && (
        <div className="absolute top-0.5 right-0.5 flex flex-col gap-0.5 z-20 items-end">
          {wins.map((w, i) => (
            <div 
              key={i} 
              className={cn(
                "text-[7px] sm:text-[9px] leading-none px-1.5 py-1 rounded-sm font-black border shadow-sm whitespace-nowrap uppercase tracking-tighter",
                w.color === "purple" && "bg-purple-500/80 border-purple-400 text-white",
                w.color === "blue" && "bg-blue-500/80 border-blue-400 text-white",
                w.color === "orange" && "bg-orange-500/80 border-orange-400 text-white",
                w.color === "green" && "bg-green-500/80 border-green-400 text-white",
                w.isReverse && "opacity-60"
              )}
            >
              {getExplicitLabel(w)}
            </div>
          ))}
        </div>
      )}

      {isTaken ? (
        <div className="flex flex-col items-center justify-center w-full h-full overflow-hidden z-0 px-1">
          <span className="truncate w-full text-center text-[10px] sm:text-xs font-black tracking-tight text-white/90">
            {square.user_name}
          </span>
        </div>
      ) : (
        <span className="opacity-0 group-hover:opacity-100 transition-opacity text-sm text-white/40 font-black">
          +
        </span>
      )}

      {/* Tooltip */}
      {isTaken && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 glass-card text-white text-xs rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 transform group-hover:-translate-y-1">
          <div className="font-black mb-1 tracking-tight">{square.user_name}</div>
          {wins.length > 0 && (
            <div className="text-[10px] text-white/60 border-t border-white/10 pt-2 mt-2 space-y-1">
              {wins.map((w, i) => (
                 <div key={i} className={cn("flex items-center gap-2", w.isReverse && "opacity-50")}>
                   <div className={cn("w-2 h-2 rounded-full shadow-sm", 
                      w.color === "purple" && "bg-purple-400",
                      w.color === "blue" && "bg-blue-400",
                      w.color === "orange" && "bg-orange-400",
                      w.color === "green" && "bg-green-400",
                   )} />
                   <span className="font-bold uppercase tracking-wider">{w.label} {w.isReverse && "(Rev)"}</span>
                 </div>
              ))}
            </div>
          )}
        </div>
      )}
    </button>
  )
}
