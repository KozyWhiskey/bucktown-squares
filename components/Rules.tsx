"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/utils/cn"

export function Rules() {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <div className="w-full max-w-4xl mx-auto mb-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-xl overflow-hidden transition-all duration-300">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors focus:outline-none"
      >
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <span>📜</span> Rules & Payouts
        </h2>
        {isOpen ? (
          <ChevronUp className="w-6 h-6 text-blue-200" />
        ) : (
          <ChevronDown className="w-6 h-6 text-blue-200" />
        )}
      </button>
      
      <div 
        className={cn(
          "transition-all duration-300 ease-in-out overflow-hidden",
          isOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="p-6 pt-0 grid grid-cols-1 md:grid-cols-2 gap-6 text-blue-50 border-t border-white/10 mt-2">
          
          <div className="space-y-3">
            <h3 className="font-semibold text-blue-200 uppercase tracking-wider text-sm">How it Works</h3>
            <ul className="space-y-2 text-sm md:text-base opacity-80">
              <li className="flex gap-2">
                <span className="font-bold text-white">1.</span> Pick any empty square on the grid.
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-white">2.</span> Enter your name and email to claim it.
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-white">3.</span> Cost is <span className="font-bold text-green-300">$10</span> per square.
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-white">4.</span> Numbers (0-9) are randomly assigned to rows/cols once the grid is full.
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-green-300 uppercase tracking-wider text-sm">Prize Pot ($1,000)</h3>
            <p className="text-xs text-blue-200/60 mb-2">
              <span className="text-pink-300 font-bold">$50</span> payout for the <span className="text-pink-300">Reverse Score</span> of EVERY quarter!
            </p>
            <div className="grid grid-cols-2 gap-3 text-sm md:text-base">
              <div className="bg-purple-500/10 p-3 rounded-lg border border-purple-500/20 flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/10 blur-xl rounded-full -mr-8 -mt-8" />
                <span className="text-xs text-purple-300 uppercase font-bold">1st Quarter</span>
                <span className="font-bold text-white text-lg">$100</span>
              </div>
              <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/20 flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 blur-xl rounded-full -mr-8 -mt-8" />
                <span className="text-xs text-blue-300 uppercase font-bold">Halftime</span>
                <span className="font-bold text-white text-lg">$200</span>
              </div>
              <div className="bg-orange-500/10 p-3 rounded-lg border border-orange-500/20 flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-orange-500/10 blur-xl rounded-full -mr-8 -mt-8" />
                <span className="text-xs text-orange-300 uppercase font-bold">3rd Quarter</span>
                <span className="font-bold text-white text-lg">$100</span>
              </div>
              <div className="bg-green-500/10 p-3 rounded-lg border border-green-500/20 flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-green-500/10 blur-xl rounded-full -mr-8 -mt-8" />
                <span className="text-xs text-green-300 uppercase font-bold">Final Score</span>
                <span className="font-bold text-white text-lg">$400</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}