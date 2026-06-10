"use client"

import { useEffect, useState } from "react"
import {
  collection,
  getDocs,
} from "firebase/firestore"
import { db } from "../lib/firebase"

type TabType = "trades" | "deposits" | "withdrawals"

export default function HistoryPage() {
  const [deposits, setDeposits] = useState<any[]>([])
  const [withdraws, setWithdraws] = useState<any[]>([])
  const [trades, setTrades] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<TabType>("trades")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    setLoading(true)
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    if (!user.email) return

    try {
      // Fetch Deposits
      const depositSnap = await getDocs(collection(db, "deposits"))
      const userDeposits = depositSnap.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((item: any) => item.email === user.email)
      setDeposits(userDeposits)

      // Fetch Withdrawals
      const withdrawSnap = await getDocs(collection(db, "withdrawals"))
      const userWithdraws = withdrawSnap.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((item: any) => item.email === user.email)
      setWithdraws(userWithdraws)

      // Fetch Trades (From localStorage as built earlier)
      const savedTrades = JSON.parse(localStorage.getItem("transactions") || "[]")
      const userTrades = savedTrades.filter((item: any) => item.email === user.email || !item.email) // show all if email not tracked in trade
      setTrades(userTrades)
      
    } catch (error) {
      console.error("Error fetching history:", error)
    } finally {
      setLoading(false)
    }
  }

  // Format Date safely
  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A"
    try {
      if (timestamp.seconds) { // Firestore Timestamp
        return new Date(timestamp.seconds * 1000).toLocaleString()
      }
      return new Date(timestamp).toLocaleString()
    } catch {
      return "N/A"
    }
  }

  // Status Badge Component
  const StatusBadge = ({ status }: { status: string }) => {
    const lowerStatus = (status || "pending").toLowerCase()
    const styles = {
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

  return (
    <main className="min-h-screen bg-[#0B0E11] text-[#EAECEF] p-6 md:p-10">
      
      <div className="max-w-7xl mx-auto">
        
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
          <div className="bg-[#1E2329] rounded-xl border border-[#2B3139] overflow-hidden shadow-xl">
            
            {/* ==================== TRADES TAB ==================== */}
            {activeTab === "trades" && (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[#2B3139] bg-[#0B0E11]">
                      <th className="px-6 py-4 text-xs font-semibold text-[#848E9C] uppercase tracking-wider">Coin</th>
                      <th className="px-6 py-4 text-xs font-semibold text-[#848E9C] uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-4 text-xs font-semibold text-[#848E9C] uppercase tracking-wider">Direction</th>
                      <th className="px-6 py-4 text-xs font-semibold text-[#848E9C] uppercase tracking-wider">Result</th>
                      <th className="px-6 py-4 text-xs font-semibold text-[#848E9C] uppercase tracking-wider">Profit/Loss</th>
                      <th className="px-6 py-4 text-xs font-semibold text-[#848E9C] uppercase tracking-wider">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2B3139]/50">
                    {trades.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-16 text-[#5E6673]">
                          <div className="flex flex-col items-center">
                            <span className="text-4xl mb-3">📊</span>
                            <p className="font-semibold text-[#848E9C]">No Trade History</p>
                            <p className="text-sm mt-1">Start trading to see your results here</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      trades.map((item, index) => (
                        <tr key={index} className="hover:bg-[#0B0E11]/50 transition-colors">
                          <td className="px-6 py-4 font-bold text-white">{item.coin || "N/A"}</td>
                          <td className="px-6 py-4 font-mono text-white">${Number(item.amount || 0).toFixed(2)}</td>
                          <td className="px-6 py-4">
                            <span className={`font-bold text-sm ${
                              item.direction === "UP" || item.direction === "BUY" ? "text-[#0ECB81]" : "text-[#F6465D]"
                            }`}>
                              {item.direction === "UP" || item.direction === "BUY" ? "▲ BUY" : "▼ SELL"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge status={item.adminResult || "Pending"} />
                          </td>
                          <td className={`px-6 py-4 font-mono font-bold ${
                            item.profit?.includes("+") ? "text-[#0ECB81]" : 
                            item.profit?.includes("-") ? "text-[#F6465D]" : "text-[#848E9C]"
                          }`}>
                            {item.profit || "$0.00"}
                          </td>
                          <td className="px-6 py-4 text-xs text-[#848E9C]">{formatDate(item.timestamp)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* ==================== DEPOSITS TAB ==================== */}
            {activeTab === "deposits" && (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[#2B3139] bg-[#0B0E11]">
                      <th className="px-6 py-4 text-xs font-semibold text-[#848E9C] uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-4 text-xs font-semibold text-[#848E9C] uppercase tracking-wider">Coin</th>
                      <th className="px-6 py-4 text-xs font-semibold text-[#848E9C] uppercase tracking-wider">TxHash</th>
                      <th className="px-6 py-4 text-xs font-semibold text-[#848E9C] uppercase tracking-wider">Proof</th>
                      <th className="px-6 py-4 text-xs font-semibold text-[#848E9C] uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-xs font-semibold text-[#848E9C] uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2B3139]/50">
                    {deposits.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-16 text-[#5E6673]">
                          <div className="flex flex-col items-center">
                            <span className="text-4xl mb-3">💵</span>
                            <p className="font-semibold text-[#848E9C]">No Deposit History</p>
                            <p className="text-sm mt-1">Your deposit records will appear here</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      deposits.map((item, index) => (
                        <tr key={index} className="hover:bg-[#0B0E11]/50 transition-colors">
                          <td className="px-6 py-4 font-mono font-bold text-[#0ECB81]">${Number(item.amount || 0).toFixed(2)}</td>
                          <td className="px-6 py-4 font-medium text-white">{item.coin || "USDT"}</td>
                          <td className="px-6 py-4 font-mono text-xs text-[#848E9C] max-w-[150px] truncate">{item.txHash || "N/A"}</td>
                          <td className="px-6 py-4">
                            {item.screenshot ? (
                              <a href={item.screenshot} target="_blank" className="text-[#FCD535] text-sm font-medium hover:underline">View</a>
                            ) : "N/A"}
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge status={item.status} />
                          </td>
                          <td className="px-6 py-4 text-xs text-[#848E9C]">{formatDate(item.createdAt)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* ==================== WITHDRAWALS TAB ==================== */}
            {activeTab === "withdrawals" && (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[#2B3139] bg-[#0B0E11]">
                      <th className="px-6 py-4 text-xs font-semibold text-[#848E9C] uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-4 text-xs font-semibold text-[#848E9C] uppercase tracking-wider">Coin</th>
                      <th className="px-6 py-4 text-xs font-semibold text-[#848E9C] uppercase tracking-wider">Wallet</th>
                      <th className="px-6 py-4 text-xs font-semibold text-[#848E9C] uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-xs font-semibold text-[#848E9C] uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2B3139]/50">
                    {withdraws.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-16 text-[#5E6673]">
                          <div className="flex flex-col items-center">
                            <span className="text-4xl mb-3">💸</span>
                            <p className="font-semibold text-[#848E9C]">No Withdrawal History</p>
                            <p className="text-sm mt-1">Your withdrawal records will appear here</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      withdraws.map((item, index) => (
                        <tr key={index} className="hover:bg-[#0B0E11]/50 transition-colors">
                          <td className="px-6 py-4 font-mono font-bold text-[#F6465D]">${Number(item.amount || 0).toFixed(2)}</td>
                          <td className="px-6 py-4 font-medium text-white">{item.coin || "USDT"}</td>
                          <td className="px-6 py-4 font-mono text-xs text-[#848E9C] max-w-[150px] truncate">{item.wallet || "N/A"}</td>
                          <td className="px-6 py-4">
                            <StatusBadge status={item.status} />
                          </td>
                          <td className="px-6 py-4 text-xs text-[#848E9C]">{formatDate(item.createdAt)}</td>
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