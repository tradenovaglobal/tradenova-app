"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ensureUser, listenUser, getUserEmail } from "../lib/userHelper"

const initialMarket = [
  { pair: "BTC/USDT", price: 73313.00, change: -2.62 },
  { pair: "ETH/USDT", price: 3520.50, change: 2.81 },
  { pair: "SOL/USDT", price: 144.80, change: 5.45 },
  { pair: "XRP/USDT", price: 2.42, change: 1.62 },
  { pair: "DOGE/USDT", price: 0.152, change: -0.81 },
]

export default function DashboardPage() {
  const [userData, setUserData] = useState<any>(null)
  const [liveMarket, setLiveMarket] = useState(initialMarket)
  const [chartData, setChartData] = useState<number[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Chart init
  useEffect(() => {
    setChartData(Array.from({ length: 40 }, () => 360 + (Math.random() - 0.5) * 200))
    setIsLoaded(true)
  }, [])

  // ✅ REAL-TIME USER DATA — auto create + live update
  useEffect(() => {
    let unsub: any = null

    const init = async () => {
      const email = await ensureUser()
      if (!email) return

      unsub = listenUser(email, (data) => {
        if (data.role === "admin") {
          window.location.href = "/admin"
          return
        }
        setUserData(data)
      })
    }

    init()
    return () => { if (unsub) unsub() }
  }, [])

  // ✅ LIVE CHART
  useEffect(() => {
    if (!isLoaded) return
    const interval = setInterval(() => {
      setChartData(prev => {
        if (prev.length === 0) return prev
        const newData = [...prev.slice(1)]
        const lastPrice = newData[newData.length - 1]
        const nextPrice = lastPrice + (Math.random() - 0.48) * 40
        newData.push(Math.max(150, Math.min(450, nextPrice)))
        return newData
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [isLoaded])

  // ✅ LIVE MARKET
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveMarket(prev => prev.map(coin => {
        const fluctuation = (Math.random() - 0.5) * coin.price * 0.002
        const newPrice = coin.price + fluctuation
        const newChange = coin.change + (Math.random() - 0.5) * 0.05
        return { ...coin, price: Number(newPrice.toFixed(coin.price > 100 ? 2 : 4)), change: Number(newChange.toFixed(2)) }
      }))
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const logout = () => {
    localStorage.removeItem("user")
    window.location.href = "/"
  }

  const balance = Number(userData?.balance || 0).toFixed(2)
  const profit = Number(userData?.profit || 0)
  const totalTrades = Number(userData?.totalTrades || 0)
  const referralBonus = Number(userData?.referralBonus || 0).toFixed(2)

  const formatPrice = (price: number) => {
    if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    if (price >= 1) return price.toFixed(2)
    return price.toFixed(4)
  }

  const generateSvgPath = () => {
    if (chartData.length === 0) return ""
    return chartData.map((val, i) => `${i * 25},${val}`).join(' ')
  }

  const isChartUp = chartData.length > 1 && chartData[chartData.length - 1] > chartData[0]
  const chartColor = isChartUp ? "#00ffcc" : "#ff4757"
  const chartGradientId = isChartUp ? "gradUp" : "gradDown"

  return (
    <main className="min-h-screen bg-black text-white overflow-x-hidden">

      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_left,#00ffff11,transparent_35%),radial-gradient(circle_at_bottom_right,#0066ff11,transparent_35%)] pointer-events-none" />

      <div className="relative z-10">

        {/* HEADER */}
        <div className="flex justify-between items-center px-4 md:px-8 py-4 md:py-6 border-b border-cyan-500/10 bg-[#020817cc]">
          <div>
            <h1 className="text-3xl md:text-5xl font-black bg-gradient-to-r from-cyan-300 to-blue-500 bg-clip-text text-transparent">
              Welcome {userData?.name || "Trader"}
            </h1>
            <p className="text-gray-500 mt-1 text-xs md:text-sm font-mono">
              ID: {userData?.email || "Loading..."}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden md:flex items-center gap-1 text-[10px] font-bold bg-green-500/20 text-green-400 px-2 py-1 rounded-full border border-green-500/30 animate-pulse">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span> V2.0 LIVE
            </span>
            <button onClick={logout} className="px-4 py-2 md:px-6 md:py-3 rounded-2xl bg-red-500 hover:bg-red-600 font-bold text-sm md:text-base shadow-[0_0_15px_#ff000088] transition-all">
              Logout
            </button>
          </div>
        </div>

        <div className="p-4 md:p-8">

          {/* STATS CARDS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-8 md:mb-10">
            <div className="bg-[#07111d] border border-cyan-500/20 rounded-2xl md:rounded-[30px] p-4 md:p-6 hover:border-cyan-400/40 transition-all">
              <p className="text-gray-500 text-xs md:text-sm">Wallet Balance</p>
              <h1 className="text-xl md:text-5xl font-black text-cyan-400 mt-2 md:mt-4 font-mono">${balance}</h1>
            </div>
            <div className="bg-[#07111d] border border-green-500/20 rounded-2xl md:rounded-[30px] p-4 md:p-6 hover:border-green-400/40 transition-all">
              <p className="text-gray-500 text-xs md:text-sm">Total Profit</p>
              <h1 className={`text-xl md:text-5xl font-black mt-2 md:mt-4 font-mono ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {profit >= 0 ? '+' : ''}{profit.toFixed(2)}
              </h1>
            </div>
            <div className="bg-[#07111d] border border-yellow-500/20 rounded-2xl md:rounded-[30px] p-4 md:p-6 hover:border-yellow-400/40 transition-all">
              <p className="text-gray-500 text-xs md:text-sm">Total Trades</p>
              <h1 className="text-xl md:text-5xl font-black text-yellow-400 mt-2 md:mt-4 font-mono">{totalTrades}</h1>
            </div>
            <div className="bg-[#07111d] border border-pink-500/20 rounded-2xl md:rounded-[30px] p-4 md:p-6 hover:border-pink-400/40 transition-all">
              <p className="text-gray-500 text-xs md:text-sm">Referral Bonus</p>
              <h1 className="text-xl md:text-5xl font-black text-pink-400 mt-2 md:mt-4 font-mono">${referralBonus}</h1>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex flex-wrap gap-3 md:gap-5 mb-8 md:mb-10">
            <Link href="/deposit" className="px-5 py-3 md:px-8 md:py-4 rounded-2xl bg-cyan-400 text-black font-bold text-sm md:text-xl shadow-[0_0_20px_#00ffff] hover:scale-105 transition-all">Deposit</Link>
            <Link href="/withdraw" className="px-5 py-3 md:px-8 md:py-4 rounded-2xl bg-red-500 text-white font-bold text-sm md:text-xl shadow-[0_0_20px_#ff0000] hover:scale-105 transition-all">Withdraw</Link>
            <Link href="/trading" className="px-5 py-3 md:px-8 md:py-4 rounded-2xl bg-green-500 text-black font-bold text-sm md:text-xl shadow-[0_0_20px_#00ff00] hover:scale-105 transition-all">Trading</Link>
            <Link href="/kyc" className="px-5 py-3 md:px-8 md:py-4 rounded-2xl bg-yellow-400 text-black font-bold text-sm md:text-xl shadow-[0_0_20px_#ffff00] hover:scale-105 transition-all">KYC</Link>
            <Link href="/history" className="px-5 py-3 md:px-8 md:py-4 rounded-2xl bg-purple-500 text-white font-bold text-sm md:text-xl shadow-[0_0_20px_#8000ff] hover:scale-105 transition-all">History</Link>
            <Link href="/support" className="px-5 py-3 md:px-8 md:py-4 rounded-2xl bg-blue-500 text-white font-bold text-sm md:text-xl shadow-[0_0_20px_#0066ff] hover:scale-105 transition-all">Customer Service</Link>
          </div>

          <div className="grid lg:grid-cols-[1fr_380px] gap-6 md:gap-8">

            {/* LIVE CHART */}
            <div className="bg-[#07111d] border border-cyan-500/20 rounded-[20px] md:rounded-[35px] p-4 md:p-6">
              <div className="flex justify-between items-center mb-4 md:mb-6">
                <div>
                  <h1 className="text-3xl md:text-5xl font-black text-cyan-400">BTC/USDT</h1>
                  <p className={`text-lg md:text-2xl mt-1 md:mt-2 font-mono font-bold ${liveMarket[0].change >= 0 ? 'text-green-400' : 'text-red-500'}`}>
                    ${formatPrice(liveMarket[0].price)} {liveMarket[0].change >= 0 ? '▲' : '▼'} {Math.abs(liveMarket[0].change).toFixed(2)}%
                  </p>
                </div>
                <div className="bg-green-500/20 text-green-400 px-4 py-1.5 md:px-5 md:py-2 rounded-full text-xs md:text-sm font-bold flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div> LIVE
                </div>
              </div>

              <div className="h-[250px] md:h-[450px] rounded-[20px] md:rounded-[30px] bg-[#020817] border border-cyan-500/10 relative overflow-hidden">
                <div className="absolute inset-0">
                  {[...Array(12)].map((_, i) => <div key={`h-${i}`} className="absolute w-full border-t border-white/5" style={{ top: `${i * 40}px` }} />)}
                  {[...Array(25)].map((_, i) => <div key={`v-${i}`} className="absolute h-full border-l border-white/5" style={{ left: `${i * 40}px` }} />)}
                </div>

                {isLoaded && chartData.length > 0 && (
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 450" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id={chartGradientId} x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor={chartColor} stopOpacity="0.3"/>
                        <stop offset="100%" stopColor={chartColor} stopOpacity="0"/>
                      </linearGradient>
                    </defs>
                    <path
                      d={`M0,${chartData[0]} ${chartData.map((val, i) => `L${i*25},${val}`).join(' ')} L${(chartData.length-1)*25},450 L0,450 Z`}
                      fill={`url(#${chartGradientId})`}
                    />
                    <polyline
                      fill="none"
                      stroke={chartColor}
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={generateSvgPath()}
                      style={{ filter: `drop-shadow(0 0 8px ${chartColor})` }}
                    />
                  </svg>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 md:gap-5 mt-6 md:mt-8">
                <Link href="/trading" className="p-4 md:p-5 rounded-2xl bg-green-500 text-black font-black text-lg md:text-2xl shadow-[0_0_20px_#00ff00] text-center hover:scale-105 transition-all">BUY</Link>
                <Link href="/trading" className="p-4 md:p-5 rounded-2xl bg-red-500 text-white font-black text-lg md:text-2xl shadow-[0_0_20px_#ff0000] text-center hover:scale-105 transition-all">SELL</Link>
              </div>
            </div>

            <div className="space-y-6 md:space-y-8">

              {/* LIVE MARKET */}
              <div className="bg-[#07111d] border border-cyan-500/20 rounded-[20px] md:rounded-[35px] p-4 md:p-6">
                <h1 className="text-2xl md:text-4xl font-black mb-4 md:mb-6">Live Market</h1>
                <div className="space-y-3 md:space-y-4">
                  {liveMarket.map((coin, i) => (
                    <div key={i} className="bg-black rounded-xl md:rounded-2xl p-3 md:p-5 flex justify-between items-center border border-transparent hover:border-cyan-500/20 transition-all">
                      <div>
                        <h1 className="text-lg md:text-2xl font-black">{coin.pair}</h1>
                        <p className="text-gray-600 text-xs">Live Pair</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg md:text-2xl font-black font-mono">${formatPrice(coin.price)}</p>
                        <p className={`text-xs md:text-sm font-bold ${coin.change >= 0 ? "text-green-400" : "text-red-500"}`}>
                          {coin.change >= 0 ? '▲' : '▼'} {Math.abs(coin.change).toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* PORTFOLIO */}
              <div className="bg-[#07111d] border border-yellow-500/20 rounded-[20px] md:rounded-[35px] p-4 md:p-6">
                <h1 className="text-2xl md:text-4xl font-black text-yellow-400 mb-4 md:mb-6">Portfolio</h1>
                <div className="space-y-3 md:space-y-4">
                  <div className="bg-black rounded-xl md:rounded-2xl p-3 md:p-5">
                    <p className="text-gray-500 text-xs md:text-sm">Wallet Balance</p>
                    <h1 className="text-2xl md:text-5xl font-black text-cyan-400 mt-1 md:mt-3 font-mono">${balance}</h1>
                  </div>
                  <div className="bg-black rounded-xl md:rounded-2xl p-3 md:p-5">
                    <p className="text-gray-500 text-xs md:text-sm">Total Trades</p>
                    <h1 className="text-2xl md:text-5xl font-black text-yellow-400 mt-1 md:mt-3 font-mono">{totalTrades}</h1>
                  </div>
                  <div className="bg-black rounded-xl md:rounded-2xl p-3 md:p-5">
                    <p className="text-gray-500 text-xs md:text-sm">Total Profit/Loss</p>
                    <h1 className={`text-2xl md:text-5xl font-black mt-1 md:mt-3 font-mono ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {profit >= 0 ? '+' : ''}{profit.toFixed(2)}
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