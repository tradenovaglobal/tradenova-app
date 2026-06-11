"use client"

import { useEffect, useState } from "react"
import {
  collection,
  onSnapshot,
  getDocs,
} from "firebase/firestore"
import { db } from "../lib/firebase"

type TabType = "trades" | "deposits" | "withdrawals"

// Safe Date Formatter
const safeFormatDate = (timestamp: any): string => {
  if (!timestamp) return "N/A"
  try {
    let date;
    if (timestamp?.seconds) { date = new Date(timestamp.seconds * 1000) }
    else if (timestamp instanceof Date) { date = timestamp }
    else { date = new Date(timestamp) }
    return date.toLocaleString()
  } catch { return "N/A" }
}

// Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
  const lowerStatus = (status || "pending").toLowerCase()
  const styles: Record<string, string> = {
    approved: "bg-[#0ECB81]/10 text-[#0ECB81] border-[#0ECB81]/30",
    win: "bg-[#0ECB81]/10 text-[#0ECB81] border-[#0ECB81]/30",
    answered: "bg-[#0ECB81]/10 text-[#0ECB81] border-[#0ECB81]/30",
    pending: "bg-[#FCD535]/10 text-[#FCD535] border-[#FCD535]/30",
    active: "bg-[#FCD535]/10 text-[#FCD535] border-[#FCD535]/30",
    rejected: "bg-[#F6465D]/10 text-[#F6465D] border-[#F6465D]/30",
    loss: "bg-[#F6465D]/10 text-[#F6465D] border-[#F6465D]/30",
    closed: "bg-[#848E9C]/10 text-[#848E9C] border-[#848E9C]/30",
  }
  const styleKey = Object.keys(styles).find(key => lowerStatus.includes(key)) || "pending"
  
  return (
    <span className={`px-2.5 py-1 rounded-md text-xs font-bold border capitalize ${styles[styleKey as keyof typeof styles]}`}>
      {status || "Pending"}
    </span>
  )
}

export default function HistoryPage() {
  const [deposits, setDeposits] = useState<any[]>([])
  const [withdraws, setWithdraws] = useState<any[]>([])
  const [trades, setTrades] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<TabType>("trades")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    if (!user.email) return

    let isMounted = true

    const loadHistory = async () => {
      try {
        const depositSnap = await getDocs(collection(db, "deposits"))
        const userDeposits = depositSnap.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter((item: any) => item.email === user.email)
        if (isMounted) setDeposits(userDeposits)

        const withdrawSnap = await getDocs(collection(db, "withdrawals"))
        const userWithdraws = withdrawSnap.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter((item: any) => item.email === user.email)
        if (isMounted) setWithdraws(userWithdraws)
        
      } catch (error) {
        console.error("Error fetching history:", error)
      }
    }

    const q = collection(db, "trades")
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userTrades = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(trade => trade.email === user.email)
        .sort((a, b) => {
          const timeA = a.createdAt?.seconds || 0
          const timeB = b.createdAt?.seconds || 0
          return timeB - timeA
        })
      
      if (isMounted) {
        setTrades(userTrades)
        setLoading(false)
      }
    }, (error) => {
      console.error("Error fetching trades:", error)
      if (isMounted) setLoading(false)
    })

    loadHistory()

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [])

  return (
    <main className="min-h-screen bg-[#0B0E11] text-[#EAECEF] p-6 md:p-10">
      
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white">Transaction History</h1>
          <p className="text-sm text-[#848E9C] mt-1">View your trading, deposit, and withdrawal records</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-[#1E2329] p-1.5 rounded-xl w-fit mb-8">
          {[
            { id: "trades", label: "📈 Trades" },
            { id: "deposits", label: "💵 Deposits" },
            { id: "withdrawals", label: "💸 Withdrawals" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
                activeTab === tab.id 
                  ? "bg-[#0B0E11] text-[#FCD535] shadow-lg" 
                  : "text-[#848E9C] hover:text-white hover:bg-[#0B0E11]/50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#848E9C]">
            <div className="w-12 h-12 border-4 border-[#2B3139] border-t-[#FCD535] rounded-full animate-spin mb-4"></div>
            <p className="font-semibold">Loading History...</p>
          </div>
        ) : (
          <div className="space-y-4">
            
            {/* ==================== TRADES TAB (Premium Trade Receipts) ==================== */}
            {activeTab === "trades" && (
              <>
                {trades.length === 0 ? (
                  <div className="text-center py-16 bg-[#1E2329] rounded-xl border border-[#2B3139]">
                    <span className="text-4xl mb-3 block">📊</span>
                    <p className="font-semibold text-[#848E9C]">No Trade History</p>
                    <p className="text-sm mt-1 text-[#5E6673]">Start trading to see your results here</p>
                  </div>
                ) : (
                  trades.map((item) => {
                    const isBuy = item.direction === "BUY"
                    const isWin = item.adminResult === "WIN"
                    
                    return (
                      // ✅ PREMIUM TRADE RECEIPT CARD (Real App Style)
                      <div key={item.id} className={`bg-[#1E2329] border ${isWin ? 'border-[#0ECB81]/30' : 'border-[#F6465D]/30'} rounded-2xl overflow-hidden shadow-lg`}>
                        
                        {/* Top Bar */}
                        <div className={`flex items-center justify-between px-5 py-3 ${isWin ? 'bg-[#0ECB81]/5' : 'bg-[#F6465D]/5'}`}>
                          <div className="flex items-center gap-2">
                            <span className="text-white font-bold">{item.coin || "BTC/USDT"}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${isBuy ? 'bg-[#0ECB81]/20 text-[#0ECB81]' : 'bg-[#F6465D]/20 text-[#F6465D]'}`}>
                              {isBuy ? "▲ BUY" : "▼ SELL"}
                            </span>
                          </div>
                          <StatusBadge status={item.adminResult || "Pending"} />
                        </div>

                        {/* Prices Section (The Real Deal) */}
                        <div className="grid grid-cols-2 gap-4 p-5">
                          <div className="bg-[#0B0E11] rounded-lg p-3 border border-[#2B3139]">
                            <p className="text-[#848E9C] text-[10px] uppercase mb-1">Entry Price</p>
                            <p className="text-white font-mono font-bold text-sm">${Number(item.entryPrice || 0).toFixed(2)}</p>
                          </div>
                          <div className="bg-[#0B0E11] rounded-lg p-3 border border-[#2B3139]">
                            <p className="text-[#848E9C] text-[10px] uppercase mb-1">Closing Price</p>
                            <p className={`font-mono font-bold text-sm ${isWin ? 'text-[#0ECB81]' : 'text-[#F6465D]'}`}>
                              ${Number(item.exitPrice || 0).toFixed(2)}
                            </p>
                          </div>
                        </div>

                        {/* Bottom Details */}
                        <div className="flex items-center justify-between px-5 pb-4 text-xs text-[#848E9C]">
                          <div className="flex gap-4">
                            <span>💰 ${Number(item.amount || 0).toFixed(2)}</span>
                            <span>⏱️ {item.duration || 60}s</span>
                            <span>🎯 {item.payoutPercent || 30}%</span>
                          </div>
                          <span className={`font-bold text-sm ${isWin ? 'text-[#0ECB81]' : 'text-[#F6465D]'}`}>
                            {item.profit || "$0.00"}
                          </span>
                        </div>

                      </div>
                    )
                  })
                )}
              </>
            )}

            {/* ==================== DEPOSITS TAB ==================== */}
            {activeTab === "deposits" && (
              <div className="bg-[#1E2329] rounded-xl border border-[#2B3139] overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[#2B3139] bg-[#0B0E11]">
                      <th className="px-6 py-4 text-xs font-semibold text-[#848E9C] uppercase">Amount</th>
                      <th className="px-6 py-4 text-xs font-semibold text-[#848E9C] uppercase">Coin</th>
                      <th className="px-6 py-4 text-xs font-semibold text-[#848E9C] uppercase">Status</th>
                      <th className="px-6 py-4 text-xs font-semibold text-[#848E9C] uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2B3139]/50">
                    {deposits.length === 0 ? (
                      <tr><td colSpan={4} className="text-center py-12 text-[#5E6673]">No Deposits Found</td></tr>
                    ) : (
                      deposits.map((item) => (
                        <tr key={item.id} className="hover:bg-[#0B0E11]/50">
                          <td className="px-6 py-4 font-mono font-bold text-[#0ECB81]">${(Number(item.amount) || 0).toFixed(2)}</td>
                          <td className="px-6 py-4 text-white">{item.coin || "USDT"}</td>
                          <td className="px-6 py-4"><StatusBadge status={item.status} /></td>
                          <td className="px-6 py-4 text-xs text-[#848E9C]">{safeFormatDate(item.createdAt)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* ==================== WITHDRAWALS TAB ==================== */}
            {activeTab === "withdrawals" && (
              <div className="bg-[#1E2329] rounded-xl border border-[#2B3139] overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[#2B3139] bg-[#0B0E11]">
                      <th className="px-6 py-4 text-xs font-semibold text-[#848E9C] uppercase">Amount</th>
                      <th className="px-6 py-4 text-xs font-semibold text-[#848E9C] uppercase">Status</th>
                      <th className="px-6 py-4 text-xs font-semibold text-[#848E9C] uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2B3139]/50">
                    {withdraws.length === 0 ? (
                      <tr><td colSpan={3} className="text-center py-12 text-[#5E6673]">No Withdrawals Found</td></tr>
                    ) : (
                      withdraws.map((item) => (
                        <tr key={item.id} className="hover:bg-[#0B0E11]/50">
                          <td className="px-6 py-4 font-mono font-bold text-[#F6465D]">${(Number(item.amount) || 0).toFixed(2)}</td>
                          <td className="px-6 py-4"><StatusBadge status={item.status} /></td>
                          <td className="px-6 py-4 text-xs text-[#848E9C]">{safeFormatDate(item.createdAt)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        )}
      </div>
    </main>
  )
}