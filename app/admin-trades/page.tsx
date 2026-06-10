"use client"

import { useEffect, useState } from "react"

// Toast Notification Component
const Toast = ({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl border backdrop-blur-md flex items-center gap-3 animate-slide-in ${
      type === "success" ? "bg-green-900/80 border-green-500/50 text-green-200" : "bg-red-900/80 border-red-500/50 text-red-200"
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

  // Data fetch karo aur cross-tab sync rakho
  useEffect(() => {
    const fetchTrades = () => {
      const savedTrades = JSON.parse(localStorage.getItem("transactions") || "[]")
      setTrades(savedTrades)
    }

    fetchTrades() // Initial load

    // Jab user dusri tab se trade kare to yahan update ho
    window.addEventListener("storage", fetchTrades)

    // Cleanup memory leak
    return () => window.removeEventListener("storage", fetchTrades)
  }, [])

  // Trade ka result update karo (Profit/Loss)
  const updateTrade = (tradeIndex: number, result: "WIN" | "LOSS") => {
    const updatedTrades = [...trades]
    const trade = updatedTrades[tradeIndex]
    
    // Payout percentage (85% profit on win, 100% loss on lose)
    const PAYOUT_RATE = 0.85 
    const tradeAmount = Number(trade.amount) || 0; // Safety: agar amount number nahi hai
    
    // Dynamic profit/loss calculation based on trade amount
    const profitValue = result === "WIN" 
      ? `+${(tradeAmount * PAYOUT_RATE).toFixed(2)}` 
      : `-${tradeAmount.toFixed(2)}`

    updatedTrades[tradeIndex] = {
      ...trade,
      adminResult: result,
      status: "Closed",
      profit: profitValue
    }

    localStorage.setItem("transactions", JSON.stringify(updatedTrades))
    setTrades(updatedTrades)
    
    setToast({ 
      message: `${trade.coin} trade marked as ${result}. P/L: $${profitValue}`, 
      type: result === "WIN" ? "success" : "error" 
    })
  }

  // Filtered trades
  const filteredTrades = trades.filter(trade => {
    if (filter === "ALL") return true
    if (filter === "PENDING") return !trade.adminResult || trade.adminResult === "PENDING"
    return trade.adminResult === filter
  })

  // Stats calculation
  const totalVolume = trades.reduce((sum, t) => sum + (Number(t.amount) || 0), 0)
  const pendingCount = trades.filter(t => !t.adminResult || t.adminResult === "PENDING").length
  const winCount = trades.filter(t => t.adminResult === "WIN").length
  const lossCount = trades.filter(t => t.adminResult === "LOSS").length

  return (
    <main className="min-h-screen bg-[#0b0e11] text-white p-6 md:p-10 font-sans relative">
      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-white">
            Admin <span className="text-cyan-400">Trade Control</span>
          </h1>
          <p className="text-gray-500 mt-1 text-sm">Monitor and manage all user trading activities</p>
        </div>
        <div className="flex gap-2">
          {["ALL", "PENDING", "WIN", "LOSS"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                filter === f 
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50" 
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
        <div className="bg-[#1e2329] p-5 rounded-xl border border-gray-800">
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Total Trades</p>
          <p className="text-2xl font-bold text-white">{trades.length}</p>
        </div>
        <div className="bg-[#1e2329] p-5 rounded-xl border border-yellow-900/30">
          <p className="text-yellow-500 text-xs uppercase tracking-wider mb-1">Pending</p>
          <p className="text-2xl font-bold text-yellow-400">{pendingCount}</p>
        </div>
        <div className="bg-[#1e2329] p-5 rounded-xl border border-green-900/30">
          <p className="text-green-500 text-xs uppercase tracking-wider mb-1">Wins Given</p>
          <p className="text-2xl font-bold text-green-400">{winCount}</p>
        </div>
        <div className="bg-[#1e2329] p-5 rounded-xl border border-red-900/30">
          <p className="text-red-500 text-xs uppercase tracking-wider mb-1">Losses Given</p>
          <p className="text-2xl font-bold text-red-400">{lossCount}</p>
        </div>
        <div className="bg-[#1e2329] p-5 rounded-xl border border-cyan-900/30">
          <p className="text-cyan-500 text-xs uppercase tracking-wider mb-1">Total Volume</p>
          <p className="text-2xl font-bold text-cyan-400">${totalVolume.toFixed(2)}</p>
        </div>
      </div>

      {/* Trades Table */}
      <div className="bg-[#1e2329] rounded-xl border border-gray-800 overflow-hidden">
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
                      <span className="text-4xl mb-3">📊</span>
                      <p className="font-semibold text-gray-400">No Trades Found</p>
                      <p className="text-sm text-gray-600 mt-1">Waiting for users to place trades...</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTrades.map((trade, index) => {
                  // Find original index for update function
                  const originalIndex = trades.indexOf(trade)
                  const isClosed = trade.status === "Closed" || (trade.adminResult && trade.adminResult !== "PENDING")
                  
                  return (
                    <tr key={index} className="hover:bg-[#2b3139] transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[#0b0e11] flex items-center justify-center text-yellow-500 font-bold text-xs">
                            {trade.coin?.substring(0, 2) || "???"}
                          </div>
                          <span className="font-bold text-white">{trade.coin || "N/A"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 font-mono text-white font-semibold">
                        ${(Number(trade.amount) || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-3 py-1 rounded-md text-xs font-bold ${
                          trade.direction === "UP" || trade.direction === "BUY" || trade.direction === "Call" 
                            ? "bg-green-900/30 text-green-400 border border-green-800/50" 
                            : "bg-red-900/30 text-red-400 border border-red-800/50"
                        }`}>
                          {trade.direction || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          isClosed ? "bg-gray-800 text-gray-400" : "bg-yellow-900/30 text-yellow-400 border border-yellow-800/50"
                        }`}>
                          {isClosed ? "Closed" : "Active"}
                        </span>
                      </td>
                      <td className="px-6 py-5 font-bold">
                        {!trade.adminResult || trade.adminResult === "PENDING" ? (
                          <span className="text-yellow-500">⏳ PENDING</span>
                        ) : trade.adminResult === "WIN" ? (
                          <span className="text-green-400">🏆 WIN</span>
                        ) : (
                          <span className="text-red-400">💀 LOSS</span>
                        )}
                      </td>
                      {/* SAFE PROFIT LOGIC - No .startsWith() */}
                      <td className="px-6 py-5 font-mono font-bold">
                        {trade.adminResult === "WIN" ? (
                          <span className="text-green-400">{trade.profit || "+$0.00"}</span>
                        ) : trade.adminResult === "LOSS" ? (
                          <span className="text-red-400">{trade.profit || "-$0.00"}</span>
                        ) : (
                          <span className="text-gray-500">{trade.profit || "$0.00"}</span>
                        )}
                      </td>
                      <td className="px-6 py-5 text-right">
                        {!isClosed ? (
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => updateTrade(originalIndex, "WIN")}
                              className="bg-green-600 hover:bg-green-500 text-white px-5 py-2 rounded-lg text-xs font-bold transition-all hover:shadow-lg hover:shadow-green-900/30"
                            >
                              WIN
                            </button>
                            <button
                              onClick={() => updateTrade(originalIndex, "LOSS")}
                              className="bg-red-600 hover:bg-red-500 text-white px-5 py-2 rounded-lg text-xs font-bold transition-all hover:shadow-lg hover:shadow-red-900/30"
                            >
                              LOSS
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-600 text-xs italic">Completed</span>
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