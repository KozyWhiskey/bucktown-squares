"use client"

import { Database } from "@/types/database.types"
import { cn } from "@/utils/cn" // Need to create this utils helper first or inline it. I'll inline for now or create utils/cn.ts
import { User } from "lucide-react"

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
  let bgClass = isTaken ? "bg-slate-800/90" : "bg-slate-800/40"
  let borderClass = "border-white/15" // Increased from white/5
  
  // Single Light Highlight for ANY win
  const hasWin = wins.length > 0
  
  if (hasWin) {
    // A clean, single light-blue/white highlight for visibility
    borderClass = "border-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.4)] z-10"
    bgClass = "bg-slate-700"
  }

  return (
    <button
      onClick={() => !disabled && onClick(square)}
      disabled={disabled}
      className={cn(
        "group relative aspect-square w-full flex items-center justify-center p-0.5 sm:p-1 text-xs sm:text-sm font-medium transition-all duration-200",
        "border rounded-sm",
        borderClass,
        bgClass,
        !isTaken && !disabled && "hover:bg-slate-700/50 cursor-pointer hover:text-white/40",
        isTaken && !disabled && "cursor-pointer",
        "backdrop-blur-sm shadow-inner"
      )}
    >
      {/* Explicit Win Labels */}
      {wins.length > 0 && (
        <div className="absolute top-0.5 right-0.5 flex flex-col gap-0.5 z-20 items-end">
          {wins.map((w, i) => (
            <div 
              key={i} 
              className={cn(
                "text-[6px] sm:text-[7px] leading-none px-1 py-0.5 rounded-sm font-bold border shadow-sm whitespace-nowrap",
                // Keep the color categories but make them consistent with the "focus" on labels
                w.color === "purple" && "bg-purple-600/90 border-purple-400 text-white",
                w.color === "blue" && "bg-blue-600/90 border-blue-400 text-white",
                w.color === "orange" && "bg-orange-600/90 border-orange-400 text-white",
                w.color === "green" && "bg-green-600/90 border-green-400 text-white",
                w.isReverse && "opacity-60" // Reverse labels are slightly more subtle
              )}
            >
              {getExplicitLabel(w)}
            </div>
          ))}
        </div>
      )}

      {isTaken ? (
        <div className="flex flex-col items-center justify-center w-full h-full overflow-hidden z-0">
          <span className="truncate w-full text-center text-[9px] sm:text-[10px] font-bold tracking-wide text-white">
            {square.user_name}
          </span>
        </div>
      ) : (
        <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-white/40">
          +
        </span>
      )}

      {/* Tooltip */}
      {isTaken && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 border border-white/10 text-white text-xs rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
          <div className="font-bold mb-0.5">{square.user_name}</div>
          {wins.length > 0 && (
            <div className="text-[10px] text-gray-400 border-t border-white/10 pt-1 mt-1 space-y-0.5">
              {wins.map((w, i) => (
                 <div key={i} className={cn("flex items-center gap-1.5", w.isReverse && "opacity-50")}>
                   <div className={cn("w-1.5 h-1.5 rounded-full", 
                      w.color === "purple" && "bg-purple-500",
                      w.color === "blue" && "bg-blue-500",
                      w.color === "orange" && "bg-orange-500",
                      w.color === "green" && "bg-green-500",
                   )} />
                   <span>{w.label} {w.isReverse && "(Reverse)"}</span>
                 </div>
              ))}
            </div>
          )}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
        </div>
      )}
    </button>
  )
}
