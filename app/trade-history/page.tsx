"use client"

import { useEffect, useState } from "react"

export default function TradeHistoryPage() {
  const [trades, setTrades] = useState<any[]>([])

  useEffect(() => {
    // FIXED: Ab "transactions" se data lega jisme Admin ka result hai
    const data = JSON.parse(localStorage.getItem("transactions") || "[]")
    // Newest first
    setTrades(data.reverse())
  }, [])

  // Dynamic Stats Calculation
  const totalTrades = trades.length
  const winTrades = trades.filter(t => t.adminResult === "WIN").length
  const lossTrades = trades.filter(t => t.adminResult === "LOSS").length
  
  const winRate = totalTrades > 0 ? ((winTrades / totalTrades) * 100).toFixed(1) : "0.0"
  
  const totalProfit = trades.reduce((sum, t) => {
    if (t.profit) {
      const val = parseFloat(t.profit.replace('+', '').replace('$', ''))
      if (!isNaN(val)) return sum + val
    }
    return sum
  }, 0)

  return (
    <main className="min-h-screen bg-[#0B0E11] text-[#EAECEF] p-6 md:p-10">
      
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white">Trade History</h1>
          <p className="text-sm text-[#848E9C] mt-1">Detailed analytics and performance of your trades</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          
          <div className="bg-[#1E2329] p-5 rounded-xl border border-[#2B3139] shadow-md">
            <div className="flex justify-between items-start mb-3">
              <p className="text-[#848E9C] text-xs uppercase tracking-wider">Total Trades</p>
              <span className="text-lg">📊</span>
            </div>
            <h2 className="text-2xl font-bold text-white">{totalTrades}</h2>
          </div>

          <div className="bg-[#1E2329] p-5 rounded-xl border border-[#0ECB81]/30 shadow-md">
            <div className="flex justify-between items-start mb-3">
              <p className="text-[#848E9C] text-xs uppercase tracking-wider">Win Rate</p>
              <span className="text-lg">🎯</span>
            </div>
            <h2 className="text-2xl font-bold text-[#0ECB81]">{winRate}%</h2>
          </div>

          <div className="bg-[#1E2329] p-5 rounded-xl border border-[#FCD535]/30 shadow-md">
            <div className="flex justify-between items-start mb-3">
              <p className="text-[#848E9C] text-xs uppercase tracking-wider">Total Profit</p>
              <span className="text-lg">💰</span>
            </div>
            <h2 className={`text-2xl font-bold ${totalProfit >= 0 ? "text-[#0ECB81]" : "text-[#F6465D]"}`}>
              ${totalProfit.toFixed(2)}
            </h2>
          </div>

          <div className="bg-[#1E2329] p-5 rounded-xl border border-[#2B3139] shadow-md">
            <div className="flex justify-between items-start mb-3">
              <p className="text-[#848E9C] text-xs uppercase tracking-wider">W / L Ratio</p>
              <span className="text-lg">⚔️</span>
            </div>
            <h2 className="text-2xl font-bold text-white">
              <span className="text-[#0ECB81]">{winTrades}</span> / <span className="text-[#F6465D]">{lossTrades}</span>
            </h2>
          </div>

        </div>

        {/* Trades Table */}
        <div className="bg-[#1E2329] rounded-xl border border-[#2B3139] overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#2B3139] bg-[#0B0E11]">
                  <th className="px-6 py-4 text-xs font-semibold text-[#848E9C] uppercase tracking-wider">Pair</th>
                  <th className="px-6 py-4 text-xs font-semibold text-[#848E9C] uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-xs font-semibold text-[#848E9C] uppercase tracking-wider">Direction</th>
                  <th className="px-6 py-4 text-xs font-semibold text-[#848E9C] uppercase tracking-wider">Result</th>
                  <th className="px-6 py-4 text-xs font-semibold text-[#848E9C] uppercase tracking-wider">PnL</th>
                  <th className="px-6 py-4 text-xs font-semibold text-[#848E9C] uppercase tracking-wider">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2B3139]/50">
                {trades.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-16 text-[#5E6673]">
                      <div className="flex flex-col items-center">
                        <span className="text-4xl mb-3">📭</span>
                        <p className="font-semibold text-[#848E9C]">No Trade History</p>
                        <p className="text-sm mt-1">Place trades to see your analytics here</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  trades.map((trade, index) => (
                    <tr key={index} className="hover:bg-[#0B0E11]/50 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[#FCD535]/10 border border-[#FCD535]/30 flex items-center justify-center text-[#FCD535] font-bold text-xs">
                            {trade.coin?.substring(0, 2) || "???"}
                          </div>
                          <span className="font-bold text-white">{trade.coin || "N/A"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 font-mono text-white font-medium">
                        ${(Number(trade.amount) || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-3 py-1 rounded-md text-xs font-bold ${
                          trade.direction === "UP" || trade.direction === "BUY" || trade.direction === "Call" 
                            ? "bg-[#0ECB81]/10 text-[#0ECB81] border border-[#0ECB81]/30" 
                            : "bg-[#F6465D]/10 text-[#F6465D] border border-[#F6465D]/30"
                        }`}>
                          {trade.direction === "UP" || trade.direction === "BUY" ? "▲ BUY" : "▼ SELL"}
                        </span>
                      </td>
                      <td className="px-6 py-5 font-bold">
                        {!trade.adminResult || trade.adminResult === "PENDING" ? (
                          <span className="bg-[#FCD535]/10 text-[#FCD535] border border-[#FCD535]/30 px-3 py-1 rounded-md text-xs">⏳ PENDING</span>
                        ) : trade.adminResult === "WIN" ? (
                          <span className="bg-[#0ECB81]/10 text-[#0ECB81] border border-[#0ECB81]/30 px-3 py-1 rounded-md text-xs">🏆 WIN</span>
                        ) : (
                          <span className="bg-[#F6465D]/10 text-[#F6465D] border border-[#F6465D]/30 px-3 py-1 rounded-md text-xs">💀 LOSS</span>
                        )}
                      </td>
                      <td className={`px-6 py-5 font-mono font-bold ${
                        trade.adminResult === "WIN" ? "text-[#0ECB81]" : trade.adminResult === "LOSS" ? "text-[#F6465D]" : "text-[#848E9C]"
                      }`}>
                        {trade.profit || "$0.00"}
                      </td>
                      <td className="px-6 py-5 text-xs text-[#848E9C]">
                        {trade.timestamp ? new Date(trade.timestamp).toLocaleTimeString() : "N/A"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  )
}