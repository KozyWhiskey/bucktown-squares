"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/utils/cn"

export function Rules() {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <div className="w-full max-w-5xl mx-auto mb-16 glass-card rounded-2xl overflow-hidden transition-all duration-300">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 sm:p-6 text-left hover:bg-white/5 transition-colors focus:outline-none"
      >
        <h2 className="text-1xl sm:text-2xl font-black text-white flex items-center gap-3">
          <span className="p-1 bg-white/10 rounded-xl">📜</span> Rules & Payouts
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
          isOpen ? "max-h-[1200px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="p-6 sm:p-8 pt-0 grid grid-cols-1 md:grid-cols-2 gap-8 text-blue-50 border-t border-white/10 mt-2">
          
          <div className="space-y-4">
            <h3 className="font-semibold text-blue-200 uppercase tracking-wider text-sm sm:text-base">How it Works</h3>
            <ul className="space-y-3 text-base sm:text-lg opacity-80">
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
                <span className="font-bold text-white">4.</span> 
                <span>
                  Pay Craig - 
                  <a 
                    href="https://venmo.com/CraigKoszewski" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="mx-1 text-blue-400 hover:text-blue-300 font-bold underline underline-offset-4 decoration-blue-400/30 transition-colors"
                  >
                    Venmo @CraigKoszewski
                  </a> 
                  or Zelle - <span className="text-white font-bold">ckoszewski@gmail.com</span>
                </span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-green-300 uppercase tracking-wider text-sm sm:text-base">Prize Pot ($1,000)</h3>
            <p className="text-sm text-blue-200/60 mb-2">
              <span className="text-pink-300 font-bold">$50</span> payout for the <span className="text-pink-300">Reverse Score</span> of EVERY quarter!
            </p>
            <div className="grid grid-cols-2 gap-4 text-base sm:text-lg">
              <div className="bg-purple-500/10 p-4 rounded-lg border border-purple-500/20 flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/10 blur-xl rounded-full -mr-8 -mt-8" />
                <span className="text-xs text-purple-300 uppercase font-bold">1st Quarter</span>
                <span className="font-bold text-white text-xl sm:text-2xl">$100</span>
              </div>
              <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20 flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 blur-xl rounded-full -mr-8 -mt-8" />
                <span className="text-xs text-blue-300 uppercase font-bold">Halftime</span>
                <span className="font-bold text-white text-xl sm:text-2xl">$200</span>
              </div>
              <div className="bg-orange-500/10 p-4 rounded-lg border border-orange-500/20 flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-orange-500/10 blur-xl rounded-full -mr-8 -mt-8" />
                <span className="text-xs text-orange-300 uppercase font-bold">3rd Quarter</span>
                <span className="font-bold text-white text-xl sm:text-2xl">$100</span>
              </div>
              <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/20 flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-green-500/10 blur-xl rounded-full -mr-8 -mt-8" />
                <span className="text-xs text-green-300 uppercase font-bold">Final Score</span>
                <span className="font-bold text-white text-xl sm:text-2xl">$400</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}