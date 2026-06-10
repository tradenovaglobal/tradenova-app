"use client"

import { useEffect, useState, useCallback } from "react"

// Toast Notification Component
const Toast = ({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl border backdrop-blur-md flex items-center gap-3 animate-slide-in ${
      type === "success" ? "bg-green-900/90 border-green-500/50 text-green-200" : "bg-red-900/90 border-red-500/50 text-red-200"
    }`}>
      <span className="text-xl">{type === "success" ? "✅" : "❌"}</span>
      <span className="font-semibold">{message}</span>
    </div>
  )
}

export default function AdminTradesPage() {
  const [trades, setTrades] = useState<any[]>([])
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "WIN" | "LOSS">("ALL")
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)

  // Data fetch karo with Normalization (Missing fields fill karo)
  const fetchTrades = useCallback(() => {
    const savedTrades = JSON.parse(localStorage.getItem("transactions") || "[]")
    
    // Ensure every trade has an ID and PENDING status if missing
    const normalizedTrades = savedTrades.map((trade: any, index: number) => ({
      ...trade,
      id: trade.id || trade.timestamp || Date.now() + index, // Unique ID
      adminResult: trade.adminResult || "PENDING", // Default PENDING
      status: trade.status || "Active"
    }))

    setTrades(normalizedTrades)
  }, [])

  // Data fetch + Auto-Sync (Har 2 sec me check karega + Cross tab)
  useEffect(() => {
    fetchTrades() // Initial load

    // Auto-Polling: Har 2 second me data check karega (Same tab ke liye)
    const intervalId = setInterval(fetchTrades, 2000)

    // Cross-Tab Sync: Jab dusri tab se trade kare
    window.addEventListener("storage", fetchTrades)

    // Cleanup
    return () => {
      clearInterval(intervalId)
      window.removeEventListener("storage", fetchTrades)
    }
  }, [fetchTrades])

  // Trade ka result update karo (Profit/Loss) - Using ID instead of Index
  const updateTrade = (tradeId: string | number, result: "WIN" | "LOSS") => {
    const savedTrades = JSON.parse(localStorage.getItem("transactions") || "[]")
    
    const PAYOUT_RATE = 0.85 
    
    const updatedTrades = savedTrades.map((trade: any) => {
      if (trade.id === tradeId || trade.timestamp === tradeId) {
        const tradeAmount = Number(trade.amount) || 0
        const profitValue = result === "WIN" 
          ? `+${(tradeAmount * PAYOUT_RATE).toFixed(2)}` 
          : `-${tradeAmount.toFixed(2)}`

        return {
          ...trade,
          adminResult: result,
          status: "Closed",
          profit: profitValue
        }
      }
      return trade
    })

    localStorage.setItem("transactions", JSON.stringify(updatedTrades))
    setTrades(updatedTrades) // Immediate UI update
    
    const targetTrade = savedTrades.find((t: any) => t.id === tradeId || t.timestamp === tradeId)
    const profitVal = result === "WIN" 
      ? `+${((Number(targetTrade?.amount) || 0) * PAYOUT_RATE).toFixed(2)}` 
      : `-${(Number(targetTrade?.amount) || 0).toFixed(2)}`

    setToast({ 
      message: `${targetTrade?.coin || 'Trade'} marked as ${result}. P/L: $${profitVal}`, 
      type: result === "WIN" ? "success" : "error" 
    })
  }

  // Filtered trades
  const filteredTrades = trades.filter(trade => {
    if (filter === "ALL") return true
    if (filter === "PENDING") return trade.adminResult === "PENDING"
    return trade.adminResult === filter
  })

  // Stats calculation
  const totalVolume = trades.reduce((sum, t) => sum + (Number(t.amount) || 0), 0)
  const pendingCount = trades.filter(t => t.adminResult === "PENDING").length
  const winCount = trades.filter(t => t.adminResult === "WIN").length
  const lossCount = trades.filter(t => t.adminResult === "LOSS").length

  return (
    <main className="min-h-screen bg-[#0b0e11] text-white p-6 md:p-10 font-sans relative">
      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-white flex items-center gap-3">
            Admin <span className="text-cyan-400">Trade Control</span>
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
          </h1>
          <p className="text-gray-500 mt-1 text-sm">Monitor and manage all user trading activities (Live Sync)</p>
        </div>
        <div className="flex gap-2">
          {["ALL", "PENDING", "WIN", "LOSS"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                filter === f 
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 shadow-lg shadow-cyan-500/10" 
                  : "bg-[#1e2329] text-gray-400 border border-transparent hover:bg-[#2b3139]"
              }`}
            >
              {f} {f === "PENDING" && pendingCount > 0 && `(${pendingCount})`}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-gradient-to-br from-[#1e2329] to-[#181a20] p-5 rounded-xl border border-gray-800 shadow-md">
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Total Trades</p>
          <p className="text-2xl font-bold text-white">{trades.length}</p>
        </div>
        <div className="bg-gradient-to-br from-[#1e2329] to-[#181a20] p-5 rounded-xl border border-yellow-900/30 shadow-md shadow-yellow-900/5">
          <p className="text-yellow-500 text-xs uppercase tracking-wider mb-1">Pending</p>
          <p className="text-2xl font-bold text-yellow-400">{pendingCount}</p>
        </div>
        <div className="bg-gradient-to-br from-[#1e2329] to-[#181a20] p-5 rounded-xl border border-green-900/30 shadow-md shadow-green-900/5">
          <p className="text-green-500 text-xs uppercase tracking-wider mb-1">Wins Given</p>
          <p className="text-2xl font-bold text-green-400">{winCount}</p>
        </div>
        <div className="bg-gradient-to-br from-[#1e2329] to-[#181a20] p-5 rounded-xl border border-red-900/30 shadow-md shadow-red-900/5">
          <p className="text-red-500 text-xs uppercase tracking-wider mb-1">Losses Given</p>
          <p className="text-2xl font-bold text-red-400">{lossCount}</p>
        </div>
        <div className="bg-gradient-to-br from-[#1e2329] to-[#181a20] p-5 rounded-xl border border-cyan-900/30 shadow-md shadow-cyan-900/5">
          <p className="text-cyan-500 text-xs uppercase tracking-wider mb-1">Total Volume</p>
          <p className="text-2xl font-bold text-cyan-400">${totalVolume.toFixed(2)}</p>
        </div>
      </div>

      {/* Trades Table */}
      <div className="bg-[#1e2329] rounded-xl border border-gray-800 overflow-hidden shadow-2xl shadow-black/30">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-800 bg-[#0b0e11]">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Coin</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Direction</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Result</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Profit/Loss</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {filteredTrades.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-gray-600">
                    <div className="flex flex-col items-center">
                      <span className="text-5xl mb-3 animate-bounce">📊</span>
                      <p className="font-semibold text-gray-400">No Trades Found</p>
                      <p className="text-sm text-gray-600 mt-1">Waiting for users to place trades...</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTrades.map((trade) => {
                  const isClosed = trade.status === "Closed" || (trade.adminResult && trade.adminResult !== "PENDING")
                  
                  return (
                    <tr key={trade.id} className="hover:bg-[#2b3139]/50 transition-colors duration-200">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#0b0e11] flex items-center justify-center text-yellow-500 font-bold text-xs border border-yellow-900/30">
                            {trade.coin?.substring(0, 2) || "??"}
                          </div>
                          <span className="font-bold text-white">{trade.coin || "N/A"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 font-mono text-white font-semibold">
                        ${(Number(trade.amount) || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-3 py-1.5 rounded-md text-xs font-bold tracking-wider ${
                          trade.direction === "UP" || trade.direction === "BUY" || trade.direction === "Call" 
                            ? "bg-green-900/30 text-green-400 border border-green-800/50" 
                            : "bg-red-900/30 text-red-400 border border-red-800/50"
                        }`}>
                          {trade.direction === "UP" || trade.direction === "BUY" ? "▲ CALL" : "▼ PUT"}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                          isClosed ? "bg-gray-800 text-gray-400" : "bg-yellow-900/30 text-yellow-400 border border-yellow-800/50 animate-pulse"
                        }`}>
                          {isClosed ? "Closed" : "Active"}
                        </span>
                      </td>
                      <td className="px-6 py-5 font-bold">
                        {trade.adminResult === "PENDING" ? (
                          <span className="text-yellow-500">⏳ PENDING</span>
                        ) : trade.adminResult === "WIN" ? (
                          <span className="text-green-400">🏆 WIN</span>
                        ) : (
                          <span className="text-red-400">💀 LOSS</span>
                        )}
                      </td>
                      <td className="px-6 py-5 font-mono font-bold">
                        {trade.adminResult === "WIN" ? (
                          <span className="text-green-400">{trade.profit || "+$0.00"}</span>
                        ) : trade.adminResult === "LOSS" ? (
                          <span className="text-red-400">{trade.profit || "-$0.00"}</span>
                        ) : (
                          <span className="text-gray-500">$0.00</span>
                        )}
                      </td>
                      <td className="px-6 py-5 text-right">
                        {!isClosed ? (
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => updateTrade(trade.id, "WIN")}
                              className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white px-5 py-2.5 rounded-lg text-xs font-bold transition-all shadow-lg hover:shadow-green-900/40 active:scale-95"
                            >
                              ✅ WIN
                            </button>
                            <button
                              onClick={() => updateTrade(trade.id, "LOSS")}
                              className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white px-5 py-2.5 rounded-lg text-xs font-bold transition-all shadow-lg hover:shadow-red-900/40 active:scale-95"
                            >
                              ❌ LOSS
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-600 text-xs italic px-3 py-1 bg-gray-800 rounded-md">Completed</span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tailwind Animation for Toast */}
      <style jsx>{`
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out forwards;
        }
      `}</style>
    </main>
  )
}