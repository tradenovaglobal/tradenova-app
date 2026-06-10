"use client"

import { useEffect, useState } from "react"

export default function LiveTradeModal({ 
  isOpen, 
  onClose, 
  tradeData 
}: { 
  isOpen: boolean
  onClose: () => void
  tradeData: any
}) {
  const [price, setPrice] = useState(tradeData?.entryPrice || 73313)
  const entryPrice = tradeData?.entryPrice || 73313
  const amount = tradeData?.amount || 100
  const direction = tradeData?.direction || "BUY"

  useEffect(() => {
    if (!isOpen) return

    // Simulate live price movement
    const interval = setInterval(() => {
      setPrice((prev) => {
        const change = Math.random() * 100 - 50
        return Number((prev + change).toFixed(2))
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [isOpen])

  // Dynamic PnL Calculation
  const profit = direction === "BUY" 
    ? ((price - entryPrice) * amount) / entryPrice
    : ((entryPrice - price) * amount) / entryPrice // Short selling logic

  const handleCloseTrade = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    
    // Save to "transactions" (Admin panel reads this)
    const history = JSON.parse(localStorage.getItem("transactions") || "[]")
    history.push({
      id: Date.now(),
      coin: tradeData?.coin || "BTC/USDT",
      amount: amount,
      direction: direction,
      entryPrice: entryPrice,
      exitPrice: price.toFixed(2),
      profit: profit >= 0 ? `+${profit.toFixed(2)}` : `-${Math.abs(profit).toFixed(2)}`,
      adminResult: "PENDING", // Admin will decide WIN/LOSS
      status: "Active",
      email: user.email || "",
      timestamp: new Date().toISOString()
    })

    localStorage.setItem("transactions", JSON.stringify(history))

    // Remove active trade data
    localStorage.removeItem("tradeAmount")
    localStorage.removeItem("entryPrice")
    localStorage.removeItem("buyTime")
    localStorage.removeItem("activeTrade")

    onClose() // Close the modal
    window.location.href = "/dashboard" // Redirect to dashboard
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal Card */}
      <div className="relative bg-[#1E2329] border border-[#2B3139] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-[#2B3139] flex justify-between items-center bg-[#0B0E11]">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-white">{tradeData?.coin || "BTC/USDT"}</span>
            <span className="bg-[#0ECB81]/10 text-[#0ECB81] border border-[#0ECB81]/30 px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-[#0ECB81] rounded-full animate-pulse"></span> LIVE
            </span>
          </div>
          <button onClick={onClose} className="text-[#848E9C] hover:text-white text-xl font-bold">✕</button>
        </div>

        <div className="p-6 space-y-4">
          
          {/* Direction Badge */}
          <div className={`flex items-center gap-2 text-sm font-bold ${direction === "BUY" ? "text-[#0ECB81]" : "text-[#F6465D]"}`}>
            <span>{direction === "BUY" ? "▲ LONG" : "▼ SHORT"}</span>
          </div>

          {/* Price Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#0B0E11] border border-[#2B3139] rounded-lg p-3">
              <p className="text-[#848E9C] text-xs mb-1">Entry Price</p>
              <p className="text-white font-mono font-bold">${entryPrice.toFixed(2)}</p>
            </div>
            <div className="bg-[#0B0E11] border border-[#2B3139] rounded-lg p-3">
              <p className="text-[#848E9C] text-xs mb-1">Current Price</p>
              <p className="text-white font-mono font-bold">${price.toFixed(2)}</p>
            </div>
          </div>

          <div className="bg-[#0B0E11] border border-[#2B3139] rounded-lg p-3">
            <p className="text-[#848E9C] text-xs mb-1">Investment Amount</p>
            <p className="text-[#FCD535] font-mono font-bold">${amount.toFixed(2)}</p>
          </div>

          {/* Live PnL */}
          <div className={`p-5 rounded-xl border text-center transition-colors duration-300 ${
            profit >= 0 
              ? "bg-[#0ECB81]/5 border-[#0ECB81]/30" 
              : "bg-[#F6465D]/5 border-[#F6465D]/30"
          }`}>
            <p className="text-[#848E9C] text-xs uppercase tracking-wider mb-2">Unrealized PnL</p>
            <h2 className={`text-3xl font-black font-mono ${profit >= 0 ? "text-[#0ECB81]" : "text-[#F6465D]"}`}>
              {profit >= 0 ? "+" : "-"}${Math.abs(profit).toFixed(2)}
            </h2>
          </div>

          {/* Close Trade Button */}
          <button
            onClick={handleCloseTrade}
            className="w-full py-4 rounded-xl bg-[#F6465D] hover:bg-red-600 text-white font-black text-base transition-all active:scale-95 shadow-lg shadow-red-900/30 flex items-center justify-center gap-2"
          >
            ❌ Close Trade Now
          </button>

        </div>
      </div>
    </div>
  )
}