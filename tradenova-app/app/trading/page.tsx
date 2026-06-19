"use client"

import { useState, useEffect } from "react"
import { getDoc, doc } from "firebase/firestore"
import { db } from "../lib/firebase"
import { getUserEmail, updateUser, ensureUser, listenUser } from "../lib/userHelper"
import Link from "next/link"

const coins = [
  { pair: "BTC/USDT", price: 73313.00, change: -2.62 },
  { pair: "ETH/USDT", price: 3520.50, change: 2.81 },
  { pair: "SOL/USDT", price: 144.80, change: 5.45 },
  { pair: "XRP/USDT", price: 2.42, change: 1.62 },
  { pair: "DOGE/USDT", price: 0.152, change: -0.81 },
]

const candles = [
  [120, 220, true],
  [220, 160, false],
  [160, 300, true],
  [300, 260, false],
  [260, 340, true],
  [340, 290, false],
  [290, 420, true],
  [420, 380, false],
  [380, 460, true],
  [460, 410, false],
  [410, 480, true],
  [480, 430, false],
  [430, 520, true],
  [520, 470, false],
  [470, 560, true],
]

export default function TradingPage() {

  const [userData, setUserData] = useState<any>(null)
  const [tradeAmount, setTradeAmount] = useState("")
  const [selectedCoin, setSelectedCoin] = useState("BTC/USDT")
  const [loading, setLoading] = useState(false)
  const [livePrices, setLivePrices] = useState(coins)

  // ✅ REAL-TIME USER DATA
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

  // ✅ LIVE PRICE FLUCTUATION
  useEffect(() => {
    const interval = setInterval(() => {
      setLivePrices(prev => prev.map(c => {
        const fluctuation = (Math.random() - 0.5) * c.price * 0.002
        const newPrice = c.price + fluctuation
        const newChange = c.change + (Math.random() - 0.5) * 0.05
        return { ...c, price: Number(newPrice.toFixed(c.price > 100 ? 2 : 4)), change: Number(newChange.toFixed(2)) }
      }))
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const formatPrice = (price: number) => {
    if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
    if (price >= 1) return price.toFixed(2)
    return price.toFixed(4)
  }

  const currentCoin = livePrices.find(c => c.pair === selectedCoin) || livePrices[0]
  const balance = Number(userData?.balance || 0)
  const totalTrades = Number(userData?.totalTrades || 0)
  const totalProfit = Number(userData?.profit || 0)

  const executeTrade = async (type: "BUY" | "SELL") => {

    if (!tradeAmount || Number(tradeAmount) <= 0) {
      alert("Enter trade amount")
      return
    }

    if (Number(tradeAmount) > balance) {
      alert("❌ Insufficient balance! Your balance: $" + balance.toFixed(2))
      return
    }

    if (Number(tradeAmount) < 5) {
      alert("❌ Minimum trade amount is $5")
      return
    }

    setLoading(true)

    try {

      const email = getUserEmail()
      if (!email) { setLoading(false); return }

      const userSnap = await getDoc(doc(db, "users", email))
      const data = userSnap.data()
      const currentBalance = Number(data?.balance || 0)
      const currentProfit = Number(data?.profit || 0)
      const currentTrades = Number(data?.totalTrades || 0)
      const currentHistory = data?.tradeHistory || []

      // Simulated P&L: -15% to +25%
      const pnlPercent = (Math.random() - 0.35) * 0.4
      const pnl = Number(tradeAmount) * pnlPercent
      const finalAmount = Number(tradeAmount) + pnl

      const newTrade = {
        id: Date.now().toString(),
        pair: selectedCoin,
        type,
        amount: Number(tradeAmount),
        pnl: Number(pnl.toFixed(2)),
        entryPrice: currentCoin.price,
        date: new Date().toISOString(),
      }

      await updateUser(email, {
        balance: currentBalance - Number(tradeAmount) + finalAmount,
        profit: currentProfit + pnl,
        totalTrades: currentTrades + 1,
        tradeHistory: [newTrade, ...currentHistory],
      })

      const emoji = pnl >= 0 ? "🟢" : "🔴"
      alert(`${emoji} ${type} Order Executed!\n\nPair: ${selectedCoin}\nAmount: $${Number(tradeAmount)}\nP&L: ${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}\nNew Balance: $${(currentBalance - Number(tradeAmount) + finalAmount).toFixed(2)}`)

      setTradeAmount("")

    } catch (error) {

      console.log(error)
      alert("❌ Trade Failed! Try again")

    }

    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-black text-white overflow-x-hidden">

      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_left,#00ff8808,transparent_35%),radial-gradient(circle_at_bottom_right,#0066ff08,transparent_35%)] pointer-events-none" />

      <div className="relative z-10">

        {/* HEADER */}
        <div className="flex justify-between items-center px-4 md:px-8 py-4 md:py-6 border-b border-cyan-500/10 bg-[#020817cc]">
          <Link href="/dashboard" className="text-cyan-400 hover:text-cyan-300 text-sm md:text-base font-bold">← Back</Link>
          <h1 className="text-2xl md:text-4xl font-black bg-gradient-to-r from-cyan-300 to-green-400 bg-clip-text text-transparent">
            Live Trading
          </h1>
          <div className="bg-green-500/20 text-green-400 px-4 py-1.5 rounded-full text-xs md:text-sm font-bold flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div> LIVE
          </div>
        </div>

        <div className="p-4 md:p-8">
          <div className="grid lg:grid-cols-[1fr_360px] gap-5">

            {/* LEFT — CHART */}
            <div className="bg-[#050b16] border border-cyan-500/20 rounded-[35px] overflow-hidden">

              <div className="p-4 md:p-6 border-b border-cyan-500/10">

                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl md:text-5xl font-black text-cyan-400">{selectedCoin}</h1>
                    <div className="flex items-center gap-3 md:gap-4 mt-2 md:mt-3">
                      <p className="text-2xl md:text-4xl font-black text-white font-mono">${formatPrice(currentCoin.price)}</p>
                      <p className={`text-base md:text-xl font-bold ${currentCoin.change >= 0 ? 'text-green-400' : 'text-red-500'}`}>
                        {currentCoin.change >= 0 ? '▲' : '▼'} {Math.abs(currentCoin.change).toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* TIMEFRAMES */}
                <div className="flex gap-2 md:gap-3 mt-4 md:mt-6 text-xs md:text-lg overflow-x-auto pb-2">
                  {["1m","5m","15m","30m","1H","4H","1D","1W","1M"].map((time) => (
                    <button
                      key={time}
                      className={`px-3 py-1.5 md:px-4 md:py-2 rounded-xl whitespace-nowrap ${time === "1D" ? "bg-cyan-500 text-black font-bold" : "bg-black text-white"}`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              {/* CANDLESTICK CHART */}
              <div className="relative h-[300px] md:h-[500px] bg-[#020817] overflow-hidden">
                <div className="absolute inset-0">
                  {[...Array(16)].map((_, i) => (
                    <div key={`h-${i}`} className="absolute w-full border-t border-white/5" style={{ top: `${i * 40}px` }} />
                  ))}
                  {[...Array(18)].map((_, i) => (
                    <div key={`v-${i}`} className="absolute h-full border-l border-white/5" style={{ left: `${i * 60}px` }} />
                  ))}
                </div>

                <div className="relative z-10 flex items-end h-full gap-2 md:gap-3 px-4 md:px-6 pb-12">
                  {candles.map((candle, i) => {
                    const open = candle[0] as number
                    const close = candle[1] as number
                    const green = candle[2] as boolean
                    return (
                      <div key={i} className="flex flex-col items-center flex-1 relative">
                        <div className="w-[2px] absolute bg-white opacity-70" style={{ height: `${Math.max(open, close) + 50}px`, bottom: `${Math.min(open, close) - 20}px` }} />
                        <div className={`w-full rounded-sm shadow-lg ${green ? "bg-green-500 shadow-green-500/40" : "bg-red-500 shadow-red-500/40"}`} style={{ height: `${Math.abs(close - open)}px`, marginBottom: `${Math.min(open, close)}px` }} />
                      </div>
                    )
                  })}
                </div>

                <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#050b16] to-transparent" />
              </div>

              {/* TRADE INPUT + BUTTONS */}
              <div className="p-4 md:p-6 border-t border-cyan-500/10 space-y-4">
                <div>
                  <label className="text-gray-400 text-xs md:text-sm mb-2 block">Trade Amount (USD)</label>
                  <input
                    type="number"
                    placeholder="Enter amount"
                    value={tradeAmount}
                    onChange={(e) => setTradeAmount(e.target.value)}
                    className="w-full p-4 md:p-5 rounded-2xl bg-black border border-cyan-500/20 outline-none text-lg md:text-xl font-mono focus:border-cyan-400 transition-all placeholder:text-gray-700"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => executeTrade("BUY")}
                    disabled={loading}
                    className={`p-4 md:p-6 rounded-2xl text-xl md:text-3xl font-black shadow-[0_0_35px_#00ff00] transition-all ${loading ? "bg-gray-600 text-gray-400 cursor-not-allowed shadow-none" : "bg-green-500 text-black hover:scale-105 active:scale-[0.98]"}`}
                  >
                    BUY
                  </button>
                  <button
                    onClick={() => executeTrade("SELL")}
                    disabled={loading}
                    className={`p-4 md:p-6 rounded-2xl text-xl md:text-3xl font-black shadow-[0_0_35px_#ff0000] transition-all ${loading ? "bg-gray-600 text-gray-400 cursor-not-allowed shadow-none" : "bg-red-500 text-white hover:scale-105 active:scale-[0.98]"}`}
                  >
                    SELL
                  </button>
                </div>
              </div>

            </div>

            {/* RIGHT — SIDEBAR */}
            <div className="space-y-5">

              {/* LIVE MARKET */}
              <div className="bg-[#050b16] border border-cyan-500/20 rounded-[35px] p-4 md:p-5">
                <h1 className="text-2xl md:text-4xl font-black mb-4 md:mb-6">Live Market</h1>
                <div className="space-y-3 md:space-y-4">
                  {livePrices.map((coin, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedCoin(coin.pair)}
                      className={`w-full bg-black rounded-2xl p-3 md:p-4 flex justify-between items-center border transition-all ${selectedCoin === coin.pair ? "border-cyan-400/60 shadow-[0_0_15px_#00ffff22]" : "border-white/5 hover:border-cyan-500/20"}`}
                    >
                      <div className="text-left">
                        <h1 className="text-base md:text-xl font-black">{coin.pair}</h1>
                        <p className="text-gray-600 text-[10px] md:text-xs">Live Pair</p>
                      </div>
                      <div className="text-right">
                        <p className="text-base md:text-xl font-black font-mono">${formatPrice(coin.price)}</p>
                        <p className={`text-[10px] md:text-xs font-bold ${coin.change >= 0 ? "text-green-400" : "text-red-500"}`}>
                          {coin.change >= 0 ? '▲' : '▼'} {Math.abs(coin.change).toFixed(2)}%
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* PORTFOLIO */}
              <div className="bg-[#050b16] border border-yellow-500/20 rounded-[35px] p-4 md:p-5">
                <h1 className="text-2xl md:text-4xl font-black text-yellow-400 mb-4 md:mb-6">Portfolio</h1>
                <div className="space-y-3 md:space-y-4">
                  <div className="bg-black rounded-2xl p-3 md:p-5">
                    <p className="text-gray-400 text-xs md:text-sm">Wallet Balance</p>
                    <h1 className="text-2xl md:text-4xl font-black text-cyan-400 mt-1 md:mt-2 font-mono">${balance.toFixed(2)}</h1>
                  </div>
                  <div className="bg-black rounded-2xl p-3 md:p-5">
                    <p className="text-gray-400 text-xs md:text-sm">Total Trades</p>
                    <h1 className="text-2xl md:text-4xl font-black text-yellow-400 mt-1 md:mt-2 font-mono">{totalTrades}</h1>
                  </div>
                  <div className="bg-black rounded-2xl p-3 md:p-5">
                    <p className="text-gray-400 text-xs md:text-sm">Total P&L</p>
                    <h1 className={`text-2xl md:text-4xl font-black mt-1 md:mt-2 font-mono ${totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {totalProfit >= 0 ? '+' : ''}{totalProfit.toFixed(2)}
                    </h1>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </main>
  )
}