"use client"

import { useEffect, useState } from "react"
import { ensureUser, listenUser, getUserEmail } from "../lib/userHelper"
import Link from "next/link"

export default function HistoryPage() {

  const [userData, setUserData] = useState<any>(null)
  const [tab, setTab] = useState<"deposits" | "withdraws" | "trades">("deposits")

  // ✅ REAL-TIME USER DATA — sab history yahan se aayegi
  useEffect(() => {
    let unsub: any = null
    const init = async () => {
      const email = await ensureUser()
      if (!email) return
      unsub = listenUser(email, (data) => setUserData(data))
    }
    init()
    return () => { if (unsub) unsub() }
  }, [])

  const deposits = userData?.depositHistory || []
  const withdraws = userData?.withdrawHistory || []
  const trades = userData?.tradeHistory || []

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit"
      })
    } catch {
      return dateStr
    }
  }

  const tabs = [
    { key: "deposits" as const, label: "Deposits", color: "cyan", count: deposits.length },
    { key: "withdraws" as const, label: "Withdraws", color: "red", count: withdraws.length },
    { key: "trades" as const, label: "Trades", color: "green", count: trades.length },
  ]

  const colorMap: Record<string, { border: string; text: string; bg: string; badge: string }> = {
    cyan: { border: "border-cyan-500/40", text: "text-cyan-400", bg: "bg-cyan-500", badge: "bg-cyan-500/20 text-cyan-400" },
    red: { border: "border-red-500/40", text: "text-red-400", bg: "bg-red-500", badge: "bg-red-500/20 text-red-400" },
    green: { border: "border-green-500/40", text: "text-green-400", bg: "bg-green-500", badge: "bg-green-500/20 text-green-400" },
  }

  const activeColor = colorMap[tabs.find(t => t.key === tab)?.color || "cyan"]

  return (
    <main className="min-h-screen bg-black text-white overflow-x-hidden">

      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_left,#8000ff08,transparent_35%),radial-gradient(circle_at_bottom_right,#0066ff08,transparent_35%)] pointer-events-none" />

      <div className="relative z-10">

        {/* HEADER */}
        <div className="flex justify-between items-center px-4 md:px-8 py-4 md:py-6 border-b border-purple-500/10 bg-[#020817cc]">
          <Link href="/dashboard" className="text-purple-400 hover:text-purple-300 text-sm md:text-base font-bold">← Back</Link>
          <h1 className="text-2xl md:text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Transaction History
          </h1>
          <div className="w-16"></div>
        </div>

        <div className="p-4 md:p-8">
          <div className="max-w-6xl mx-auto">

            {/* TABS */}
            <div className="flex gap-2 md:gap-3 mb-6 md:mb-8">
              {tabs.map((t) => {
                const c = colorMap[t.color]
                const isActive = tab === t.key
                return (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    className={`px-4 py-2.5 md:px-6 md:py-3 rounded-2xl text-sm md:text-lg font-bold transition-all ${
                      isActive
                        ? `${c.bg} text-black shadow-[0_0_20px_${c.bg}66]`
                        : `bg-[#07111d] ${c.text} border ${c.border} hover:scale-105`
                    }`}
                  >
                    {t.label} ({t.count})
                  </button>
                )
              })}
            </div>

            {/* DEPOSITS TAB */}
            {tab === "deposits" && (
              <div className="bg-[#07111d] border border-cyan-500/20 rounded-[30px] p-4 md:p-6">
                <h2 className="text-2xl md:text-3xl font-black text-cyan-400 mb-4 md:mb-6">Deposit History</h2>
                {deposits.length === 0 ? (
                  <div className="text-center py-16 md:py-24">
                    <p className="text-5xl mb-4">📥</p>
                    <p className="text-gray-500 text-sm md:text-lg">No deposits yet</p>
                    <Link href="/deposit" className="inline-block mt-4 px-6 py-3 rounded-2xl bg-cyan-500 text-black font-bold hover:scale-105 transition-all">Make Deposit</Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {deposits.map((item: any, i: number) => (
                      <div key={item.id || i} className="bg-black rounded-2xl p-4 md:p-5 border border-cyan-500/10 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 flex items-center justify-center text-xl">📥</div>
                          <div>
                            <p className="text-white font-bold text-lg md:text-xl">+${Number(item.amount).toFixed(2)}</p>
                            <p className="text-gray-500 text-xs md:text-sm">{item.coin || "USDT (TRC20)"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 md:gap-6">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${item.status === "Approved" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                            {item.status}
                          </span>
                          <p className="text-gray-500 text-xs md:text-sm font-mono">{formatDate(item.date)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* WITHDRAWS TAB */}
            {tab === "withdraws" && (
              <div className="bg-[#07111d] border border-red-500/20 rounded-[30px] p-4 md:p-6">
                <h2 className="text-2xl md:text-3xl font-black text-red-400 mb-4 md:mb-6">Withdraw History</h2>
                {withdraws.length === 0 ? (
                  <div className="text-center py-16 md:py-24">
                    <p className="text-5xl mb-4">📤</p>
                    <p className="text-gray-500 text-sm md:text-lg">No withdrawals yet</p>
                    <Link href="/withdraw" className="inline-block mt-4 px-6 py-3 rounded-2xl bg-red-500 text-white font-bold hover:scale-105 transition-all">Make Withdrawal</Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {withdraws.map((item: any, i: number) => (
                      <div key={item.id || i} className="bg-black rounded-2xl p-4 md:p-5 border border-red-500/10 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-red-500/20 flex items-center justify-center text-xl">📤</div>
                          <div>
                            <p className="text-white font-bold text-lg md:text-xl">-${Number(item.amount).toFixed(2)}</p>
                            <p className="text-gray-500 text-xs md:text-sm font-mono truncate max-w-[200px]">{item.wallet || ""}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 md:gap-6">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${item.status === "Approved" ? "bg-green-500/20 text-green-400" : item.status === "Rejected" ? "bg-red-500/20 text-red-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                            {item.status}
                          </span>
                          <p className="text-gray-500 text-xs md:text-sm font-mono">{formatDate(item.date)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TRADES TAB */}
            {tab === "trades" && (
              <div className="bg-[#07111d] border border-green-500/20 rounded-[30px] p-4 md:p-6">
                <h2 className="text-2xl md:text-3xl font-black text-green-400 mb-4 md:mb-6">Trade History</h2>
                {trades.length === 0 ? (
                  <div className="text-center py-16 md:py-24">
                    <p className="text-5xl mb-4">📊</p>
                    <p className="text-gray-500 text-sm md:text-lg">No trades yet</p>
                    <Link href="/trading" className="inline-block mt-4 px-6 py-3 rounded-2xl bg-green-500 text-black font-bold hover:scale-105 transition-all">Start Trading</Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {trades.map((item: any, i: number) => (
                      <div key={item.id || i} className="bg-black rounded-2xl p-4 md:p-5 border border-green-500/10 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${item.type === "BUY" ? "bg-green-500/20" : "bg-red-500/20"}`}>
                            {item.type === "BUY" ? "🟢" : "🔴"}
                          </div>
                          <div>
                            <div className="flex items-center gap-3">
                              <p className="text-white font-bold text-lg md:text-xl">{item.pair}</p>
                              <span className={`px-3 py-0.5 rounded-full text-xs font-bold ${item.type === "BUY" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                                {item.type}
                              </span>
                            </div>
                            <p className="text-gray-500 text-xs md:text-sm">Amount: ${Number(item.amount).toFixed(2)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 md:gap-6">
                          <p className={`text-lg md:text-xl font-black font-mono ${item.pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                            {item.pnl >= 0 ? "+" : ""}{Number(item.pnl).toFixed(2)}
                          </p>
                          <p className="text-gray-500 text-xs md:text-sm font-mono">{formatDate(item.date)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </main>
  )
}