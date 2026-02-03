"use client"

import { useState } from "react"
import { Database } from "@/types/database.types"
import { Loader2 } from "lucide-react"

type SquareRow = Database['public']['Tables']['squares']['Row']

interface ClaimModalProps {
  square: SquareRow
  onClose: () => void
  onClaim: (id: string, name: string, email: string) => Promise<void>
}

export function ClaimModal({ square, onClose, onClaim }: ClaimModalProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email) {
      setError("Please fill in all fields")
      return
    }
    
    setLoading(true)
    setError("")
    
    try {
      await onClaim(square.id, name, email)
      onClose()
    } catch (err) {
      setError("Failed to claim square. It might be taken.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // If square is already taken, show info only
  if (square.user_name) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
        <div className="w-full max-w-md glass-card p-8 rounded-3xl shadow-2xl text-white transform transition-all animate-in fade-in zoom-in-95 duration-300 text-center">
          <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center mx-auto mb-6 text-3xl shadow-inner">
            🏈
          </div>
          <h2 className="text-2xl font-black mb-2 tracking-tight">Square Taken</h2>
          <p className="text-white/40 text-sm font-medium mb-8 uppercase tracking-widest">
            Row {square.x} • Column {square.y}
          </p>

          <div className="p-6 glass rounded-2xl border border-white/10 mb-8">
             <p className="text-xs text-blue-300/60 uppercase font-black tracking-[0.2em] mb-2">Claimed By</p>
             <p className="text-3xl font-black text-white tracking-tight">{square.user_name}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full px-6 py-4 rounded-2xl bg-white text-black font-black hover:bg-white/90 transition-all shadow-xl hover:shadow-white/10 active:scale-[0.98]"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
      <div className="w-full max-w-md glass-card p-8 rounded-3xl shadow-2xl text-white transform transition-all animate-in fade-in zoom-in-95 duration-300">
        <h2 className="text-3xl font-black mb-2 tracking-tight">Claim Square</h2>
        <p className="text-white/40 text-sm font-medium mb-8 uppercase tracking-widest">
          Row {square.x}, Column {square.y}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="name" className="text-xs font-black uppercase tracking-widest text-white/50 ml-1">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all font-medium text-lg"
              placeholder="John Doe"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-white/50 ml-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all font-medium text-lg"
              placeholder="john@example.com"
            />
            <p className="text-xs text-white/30 font-medium ml-1">
              Only visible to the admin. No spam, ever.
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-bold animate-pulse">
              {error}
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-4 rounded-2xl glass hover:bg-white/10 text-white font-black transition-all disabled:opacity-50 active:scale-[0.98]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-4 rounded-2xl bg-white text-black font-black hover:bg-white/90 transition-all shadow-xl hover:shadow-white/10 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              {loading && <Loader2 className="w-5 h-4 animate-spin" />}
              {loading ? "Claiming..." : "Confirm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
