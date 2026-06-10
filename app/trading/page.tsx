"use client"

import { useEffect, useState } from "react"
import { doc, getDoc } from "firebase/firestore"
import { db } from "../lib/firebase"

const coins = [
  { pair: "BTC/USDT", price: "$73,313", change: "-2.62%" },
  { pair: "ETH/USDT", price: "$3,520", change: "+2.81%" },
  { pair: "SOL/USDT", price: "$144", change: "+5.45%" },
  { pair: "XRP/USDT", price: "$2.42", change: "+1.62%" },
  { pair: "DOGE/USDT", price: "$0.22", change: "-0.81%" },
]

const timeframes = ["1m", "5m", "15m", "30m", "1H", "4H", "1D", "1W"]

export default function TradingPage() {
  const [userData, setUserData] = useState<any>(null)
  const [price, setPrice] = useState(73313)
  const [activeTimeframe, setActiveTimeframe] = useState("1H")
  
  // Trade Modal States
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [tradeAmount, setTradeAmount] = useState("")
  const [tradeTime, setTradeTime] = useState(60)
  const [tradeDirection, setTradeDirection] = useState<"BUY" | "SELL">("BUY")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)

  // Fetch User Data
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

  // Live Price Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setPrice(prev => {
        const change = Math.random() * 100 - 50
        return Number((prev + change).toFixed(2))
      })
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  // Open Modal Function
  const openTradeModal = (dir: "BUY" | "SELL") => {
    setTradeDirection(dir)
    setIsModalOpen(true)
  }

  // Execute Trade Function
  const executeTrade = () => {
    if (!tradeAmount || Number(tradeAmount) <= 0) {
      setToast({ message: "Please enter a valid amount!", type: "error" })
      return
    }

    setIsSubmitting(true)
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    const transactions = JSON.parse(localStorage.getItem("transactions") || "[]")

    transactions.push({
      id: Date.now(),
      coin: "BTC/USDT",
      amount: Number(tradeAmount),
      direction: tradeDirection,
      entryPrice: price,
      profit: "$0.00",
      adminResult: "PENDING", // Admin will decide
      status: "Active",
      email: user.email || "",
      timestamp: new Date().toISOString()
    })

    localStorage.setItem("transactions", JSON.stringify(transactions))
    
    setTimeout(() => {
      setIsSubmitting(false)
      setIsModalOpen(false)
      setTradeAmount("")
      setToast({ message: `${tradeDirection} order placed successfully!`, type: "success" })
    }, 1000)
  }

  return (
    <main className="min-h-screen bg-[#0B0E11] text-[#EAECEF] font-sans">
      
      {/* Toast */}
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
                <div className="grid grid-cols-5 gap-2">
                  {[60, 90, 120, 180, 300].map(t => (
                    <button 
                      key={t} 
                      onClick={() => setTradeTime(t)}
                      className={`py-2 rounded text-xs font-bold transition-colors ${
                        tradeTime === t ? "bg-[#FCD535] text-black" : "bg-[#0B0E11] text-[#848E9C] border border-[#2B3139] hover:border-[#FCD535]"
                      }`}
                    >
                      {t}s
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

      {/* Main Layout */}
      <div className="grid lg:grid-cols-[1fr_360px] h-screen">
        
        {/* Left: Chart Area */}
        <div className="flex flex-col border-r border-[#1E2329] overflow-y-auto">
          
          {/* Header & Timeframes */}
          <div className="p-4 border-b border-[#1E2329] bg-[#0B0E11]">
            <div className="flex flex-wrap items-center gap-4 mb-3">
              <h2 className="text-xl font-bold text-white">BTC/USDT</h2>
              <span className="text-[#F6465D] text-xl font-mono font-bold">${price.toFixed(2)}</span>
            </div>
            <div className="flex gap-1">
              {timeframes.map((tf) => (
                <button 
                  key={tf} 
                  onClick={() => setActiveTimeframe(tf)}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    activeTimeframe === tf ? "bg-[#2B3139] text-[#FCD535]" : "text-[#848E9C] hover:bg-[#1E2329]"
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* Fake Candlestick Chart */}
          <div className="flex-1 bg-[#0B0E11] relative p-4 min-h-[400px]">
             {/* Background Grid */}
             <div className="absolute inset-0">
                {[...Array(10)].map((_, i) => <div key={i} className="absolute w-full border-t border-[#1E2329]" style={{ top: `${i * 10}%` }} />)}
             </div>
             {/* Chart placeholder visual */}
             <div className="relative z-10 flex items-end h-full gap-2">
                {[40, 60, 30, 80, 50, 90, 60, 75, 45, 85, 55, 95, 40, 70].map((h, i) => (
                   <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                      <div className={`w-full rounded-sm ${i % 2 === 0 ? 'bg-[#0ECB81]' : 'bg-[#F6465D]'}`} style={{ height: `${h}%` }}></div>
                   </div>
                ))}
             </div>
          </div>

          {/* BUY / SELL Buttons */}
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

        {/* Right: Markets & Portfolio */}
        <div className="bg-[#0B0E11] flex flex-col overflow-y-auto hidden lg:flex">
          
          <div className="p-4 border-b border-[#1E2329]">
            <h3 className="text-sm font-bold text-[#848E9C] mb-3 uppercase tracking-wider">Markets</h3>
            <div className="space-y-2">
              {coins.map((coin) => (
                <div key={coin.pair} className="flex items-center justify-between p-2 rounded hover:bg-[#1E2329] transition-colors cursor-pointer">
                  <div>
                    <p className="text-sm font-bold text-white">{coin.pair}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono font-bold text-white">{coin.price}</p>
                    <p className={`text-xs font-mono font-medium ${coin.change.includes("-") ? "text-[#F6465D]" : "text-[#0ECB81]"}`}>
                      {coin.change}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 flex-1">
            <h3 className="text-sm font-bold text-[#848E9C] mb-3 uppercase tracking-wider">Account</h3>
            <div className="space-y-3">
              <div className="bg-[#1E2329] p-3 rounded-lg border border-[#2B3139]">
                <p className="text-[#848E9C] text-xs">Wallet Balance</p>
                <p className="text-lg font-bold text-[#FCD535]">${userData?.balance?.toFixed(2) || "0.00"}</p>
              </div>
              <div className="bg-[#1E2329] p-3 rounded-lg border border-[#2B3139]">
                <p className="text-[#848E9C] text-xs">Today's PnL</p>
                <p className="text-lg font-bold text-[#0ECB81]">+$2,450.00</p>
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