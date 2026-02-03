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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="w-full max-w-md bg-black/40 backdrop-blur-xl border border-white/20 p-6 rounded-2xl shadow-2xl text-white transform transition-all animate-in fade-in zoom-in-95 duration-200 text-center">
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4 text-2xl">
            🏈
          </div>
          <h2 className="text-xl font-bold mb-2">Square Taken</h2>
          <p className="text-white/60 text-sm mb-6">
            Row {square.x} • Column {square.y}
          </p>

          <div className="p-4 bg-white/5 rounded-xl border border-white/10 mb-6">
             <p className="text-xs text-blue-200/60 uppercase tracking-widest mb-1">Claimed By</p>
             <p className="text-xl font-bold text-white">{square.user_name}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full px-4 py-3 rounded-lg bg-white text-black font-bold hover:bg-white/90 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-black/40 backdrop-blur-xl border border-white/20 p-6 rounded-2xl shadow-2xl text-white transform transition-all animate-in fade-in zoom-in-95 duration-200">
        <h2 className="text-xl font-bold mb-2">Claim Square</h2>
        <p className="text-white/60 text-sm mb-6">
          Row {square.x}, Column {square.y}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-white/80">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
              placeholder="John Doe"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-white/80">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
              placeholder="john@example.com"
            />
            <p className="text-xs text-white/40">
              Only visible to the admin. We won't spam you.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white font-medium transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 rounded-lg bg-white text-black font-bold hover:bg-white/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Claiming..." : "Confirm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
