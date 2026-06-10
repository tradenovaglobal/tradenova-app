"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { doc, getDoc } from "firebase/firestore"
import { db } from "../lib/firebase"
import LiveTradeModal from "../components/LiveTradeModal" // ✅ Modal Import Kiya

const marketData = [
  { pair: "BTC/USDT", price: "$73,313", change: "-2.62%", vol: "1.2B" },
  { pair: "ETH/USDT", price: "$3,520", change: "+2.81%", vol: "850M" },
  { pair: "SOL/USDT", price: "$144", change: "+5.45%", vol: "420M" },
  { pair: "XRP/USDT", price: "$2.42", change: "+1.62%", vol: "310M" },
  { pair: "DOGE/USDT", price: "$0.22", change: "-0.81%", vol: "150M" },
]

const timeframes = ["1m", "5m", "15m", "1H", "4H", "1D", "1W"]

export default function DashboardPage() {
  const [userData, setUserData] = useState<any>(null)
  const [activeTimeframe, setActiveTimeframe] = useState("1H")
  
  // ✅ Modal aur Trade ke liye States add kiye
  const [isTradeOpen, setIsTradeOpen] = useState(false)
  const [activeTrade, setActiveTrade] = useState<any>(null)
  const [tradeAmount, setTradeAmount] = useState(100) // Default amount

  useEffect(() => {
    const loadUser = async () => {
      const user = JSON.parse(localStorage.getItem("user") || "{}")
      if (!user.email) {
        window.location.href = "/login"
        return
      }

      const ref = doc(db, "users", user.email)
      const snap = await getDoc(ref)

      if (snap.exists()) {
        const data = snap.data()
        if (data.role === "admin") {
          window.location.href = "/admin"
          return
        }
        setUserData(data)
        localStorage.setItem("loginTime", new Date().toLocaleString())
        localStorage.setItem("userName", data.name)
      }
    }
    loadUser()
  }, [])

  const logout = () => {
    localStorage.removeItem("user")
    window.location.href = "/"
  }

  const loginTime = typeof window !== "undefined" ? localStorage.getItem("loginTime") : ""

  // ✅ Trade Open Karne ka Function (BUY/SELL dabane pe ye chalega)
  const openTrade = (direction: string) => {
    if (!tradeAmount || tradeAmount <= 0) {
      alert("Please enter a valid amount!")
      return
    }
    const tradeInfo = {
      coin: "BTC/USDT",
      amount: tradeAmount,
      entryPrice: 73313, // Static price for now
      direction: direction // "BUY" ya "SELL"
    }
    setActiveTrade(tradeInfo)
    setIsTradeOpen(true) // Modal kholega
  }

  return (
    <main className="min-h-screen bg-[#0B0E11] text-[#EAECEF] font-sans flex flex-col">
      
      {/* ✅ Live Trade Modal - Ye sirf tab dikhega jab isTradeOpen true ho */}
      <LiveTradeModal 
        isOpen={isTradeOpen} 
        onClose={() => setIsTradeOpen(false)} 
        tradeData={activeTrade} 
      />

      {/* === TOP NAVBAR (Binance Style) === */}
      <nav className="w-full bg-[#1E2329] border-b border-[#2B3139] px-4 md:px-6 py-3 flex items-center justify-between z-50 sticky top-0">
        <div className="flex items-center gap-6">
          <h1 className="text-xl md:text-2xl font-black text-[#FCD535] tracking-tight">TRADE-X</h1>
          <div className="hidden lg:flex items-center gap-5 text-sm text-[#848E9C] font-medium">
            <Link href="/trading" className="hover:text-white transition-colors">Trade</Link>
            <Link href="/deposit" className="hover:text-white transition-colors">Buy Crypto</Link>
            <Link href="/history" className="hover:text-white transition-colors">Orders</Link>
            <Link href="/kyc" className="hover:text-white transition-colors">Verification</Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 bg-[#2B3139] px-3 py-1.5 rounded-md text-xs">
            <span className="text-[#848E9C]">Balance:</span>
            <span className="text-[#FCD535] font-bold">${userData?.balance?.toFixed(2) || "0.00"}</span>
          </div>
          <div className="relative group">
            <button className="w-9 h-9 rounded-full bg-[#2B3139] flex items-center justify-center text-[#FCD535] font-bold text-sm border-2 border-transparent hover:border-[#FCD535] transition-all">
              {userData?.name?.substring(0, 1).toUpperCase() || "U"}
            </button>
            <div className="absolute right-0 top-12 bg-[#1E2329] border border-[#2B3139] rounded-lg p-3 w-48 shadow-xl hidden group-hover:block z-50">
              <p className="text-sm font-bold text-white">{userData?.name}</p>
              <p className="text-xs text-[#848E9C] mb-3">{userData?.email}</p>
              <div className="border-t border-[#2B3139] pt-2 flex flex-col gap-2">
                <Link href="/kyc" className="text-sm text-[#848E9C] hover:text-white">🛡️ KYC Status</Link>
                <Link href="/support" className="text-sm text-[#848E9C] hover:text-white">🎧 Support</Link>
                <button onClick={logout} className="text-sm text-red-500 hover:text-red-400 text-left mt-1">🚪 Logout</button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* === TICKER STRIP === */}
      <div className="w-full bg-[#0B0E11] border-b border-[#1E2329] overflow-x-auto scrollbar-hide py-2 px-4 flex gap-8">
        {marketData.map((coin) => (
          <div key={coin.pair} className="flex items-center gap-3 whitespace-nowrap text-xs">
            <span className="font-bold text-white">{coin.pair}</span>
            <span className="font-mono text-white">{coin.price}</span>
            <span className={`font-mono font-medium ${coin.change.includes("-") ? "text-[#F6465D]" : "text-[#0ECB81]"}`}>
              {coin.change}
            </span>
          </div>
        ))}
      </div>

      {/* === MAIN DASHBOARD LAYOUT === */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_360px]">

        {/* === LEFT SIDE: CHART & STATS === */}
        <div className="border-r border-[#1E2329] flex flex-col">
          
          {/* Chart Header & Timeframes */}
          <div className="p-4 border-b border-[#1E2329] bg-[#0B0E11]">
            <div className="flex flex-wrap items-center gap-4 mb-3">
              <h2 className="text-xl font-bold text-white">BTC/USDT</h2>
              <span className="text-[#F6465D] text-xl font-mono font-bold">$73,313.00</span>
              <span className="bg-[#F6465D]/10 text-[#F6465D] px-2 py-0.5 rounded text-xs font-bold">▼ -2.62%</span>
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

          {/* Chart SVG */}
          <div className="flex-1 min-h-[400px] lg:min-h-0 bg-[#0B0E11] relative p-4">
            <div className="absolute inset-0">
              {[...Array(8)].map((_, i) => (
                <div key={`h${i}`} className="absolute w-full border-t border-[#1E2329]" style={{ top: `${i * 14}%` }} />
              ))}
            </div>
            <svg className="absolute inset-0 w-full h-full p-4" viewBox="0 0 1200 600" preserveAspectRatio="none">
              <defs>
                <linearGradient id="premiumGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0ECB81" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#0ECB81" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0,450 L100,420 L200,440 L300,350 L400,380 L500,300 L600,320 L700,220 L800,260 L900,150 L1000,200 L1100,120 L1200,160 L1200,600 L0,600 Z"
                fill="url(#premiumGrad)"
              />
              <polyline
                fill="none"
                stroke="#0ECB81"
                strokeWidth="3"
                points="0,450 100,420 200,440 300,350 400,380 500,300 600,320 700,220 800,260 900,150 1000,200 1100,120 1200,160"
              />
            </svg>
          </div>

          {/* Quick Actions & Portfolio Row */}
          <div className="p-4 border-t border-[#1E2329] bg-[#0B0E11]">
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-4">
              <Link href="/deposit" className="bg-[#0ECB81] text-black font-bold text-center py-2.5 rounded text-sm hover:bg-opacity-90 transition-all">Deposit</Link>
              <Link href="/withdraw" className="bg-[#F6465D] text-white font-bold text-center py-2.5 rounded text-sm hover:bg-opacity-90 transition-all">Withdraw</Link>
              <Link href="/trading" className="bg-[#2B3139] text-white font-bold text-center py-2.5 rounded text-sm hover:bg-[#3B4149] transition-all">Trade Now</Link>
              <Link href="/kyc" className="bg-[#2B3139] text-[#FCD535] font-bold text-center py-2.5 rounded text-sm hover:bg-[#3B4149] transition-all">Verify KYC</Link>
              <Link href="/history" className="bg-[#2B3139] text-white font-bold text-center py-2.5 rounded text-sm hover:bg-[#3B4149] transition-all">History</Link>
              <Link href="/support" className="bg-[#2B3139] text-white font-bold text-center py-2.5 rounded text-sm hover:bg-[#3B4149] transition-all">24/7 Chat</Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-[#1E2329] p-3 rounded-lg border border-[#2B3139]">
                <p className="text-[#848E9C] text-xs">Wallet Balance</p>
                <p className="text-lg font-bold text-[#FCD535]">${userData?.balance?.toFixed(2) || "0.00"}</p>
              </div>
              <div className="bg-[#1E2329] p-3 rounded-lg border border-[#2B3139]">
                <p className="text-[#848E9C] text-xs">Total Profit</p>
                <p className="text-lg font-bold text-[#0ECB81]">+$2,450.00</p>
              </div>
              <div className="bg-[#1E2329] p-3 rounded-lg border border-[#2B3139]">
                <p className="text-[#848E9C] text-xs">Open Positions</p>
                <p className="text-lg font-bold text-white">12 Trades</p>
              </div>
              <div className="bg-[#1E2329] p-3 rounded-lg border border-[#2B3139]">
                <p className="text-[#848E9C] text-xs">Referral Bonus</p>
                <p className="text-lg font-bold text-purple-400">$540.00</p>
              </div>
            </div>
          </div>
        </div>

        {/* === RIGHT SIDE: ORDER BOOK & MARKETS === */}
        <div className="bg-[#0B0E11] flex flex-col overflow-y-auto hidden lg:flex">
          
          {/* Order Form - ✅ Updated with Trade Functions */}
          <div className="p-4 border-b border-[#1E2329]">
            <div className="grid grid-cols-2 mb-3">
              <button className="w-full py-2 text-sm font-bold bg-[#0ECB81]/10 text-[#0ECB81] border-b-2 border-[#0ECB81]">Buy</button>
              <button className="w-full py-2 text-sm font-bold text-[#848E9C] border-b-2 border-transparent hover:text-white">Sell</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-[#848E9C]">Price</label>
                <input type="text" value="73,313.00" readOnly className="w-full bg-[#1E2329] border border-[#2B3139] rounded p-2 text-white text-sm font-mono mt-1 focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-[#848E9C]">Amount (USDT)</label>
                {/* ✅ Amount input ko state se connect kiya */}
                <input 
                  type="number" 
                  value={tradeAmount}
                  onChange={(e) => setTradeAmount(Number(e.target.value))}
                  placeholder="0.00" 
                  className="w-full bg-[#1E2329] border border-[#2B3139] rounded p-2 text-white text-sm font-mono mt-1 focus:outline-none focus:border-[#FCD535]" 
                />
              </div>
              <div className="flex gap-1.5">
                {[25, 50, 75, 100].map(p => (
                  <button 
                    key={p} 
                    onClick={() => setTradeAmount(p)} // ✅ Percentage pe click karne pe amount set hoga
                    className="flex-1 bg-[#2B3139] text-[#848E9C] text-xs py-1 rounded hover:bg-[#3B4149] hover:text-white transition-colors"
                  >
                    {p}%
                  </button>
                ))}
              </div>
              
              {/* ✅ BUY and SELL Buttons - Ab ye modal kholega */}
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button 
                  onClick={() => openTrade("BUY")} 
                  className="bg-[#0ECB81] hover:bg-[#0ECB81]/90 text-black font-bold py-3 rounded transition-all text-sm"
                >
                  BUY / LONG
                </button>
                <button 
                  onClick={() => openTrade("SELL")} 
                  className="bg-[#F6465D] hover:bg-[#F6465D]/90 text-white font-bold py-3 rounded transition-all text-sm"
                >
                  SELL / SHORT
                </button>
              </div>

            </div>
          </div>

          {/* Order Book Visual (Fake) */}
          <div className="p-4 border-b border-[#1E2329]">
            <h3 className="text-sm font-bold text-[#848E9C] mb-2">Order Book</h3>
            <div className="space-y-1">
              {[0.14, 0.22, 0.35, 0.18, 0.42].map((val, i) => (
                <div key={`ask${i}`} className="relative w-full h-5 flex items-center text-xs font-mono">
                  <div className="absolute right-0 h-full bg-[#F6465D]/10" style={{ width: `${val * 200}%` }}></div>
                  <span className="relative z-10 text-[#F6465D] mr-auto pl-1">73,31{i + 3}.00</span>
                  <span className="relative z-10 text-[#848E9C] pr-1">{val.toFixed(4)}</span>
                </div>
              ))}
              <div className="text-center py-1 text-lg font-bold text-[#0ECB81] border-y border-[#2B3139] my-1">73,313.00</div>
              {[0.31, 0.25, 0.40, 0.15, 0.28].map((val, i) => (
                <div key={`bid${i}`} className="relative w-full h-5 flex items-center text-xs font-mono">
                  <div className="absolute left-0 h-full bg-[#0ECB81]/10" style={{ width: `${val * 200}%` }}></div>
                  <span className="relative z-10 text-[#0ECB81] mr-auto pl-1">73,30{(4 - i)}.00</span>
                  <span className="relative z-10 text-[#848E9C] pr-1">{val.toFixed(4)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Live Market List */}
          <div className="p-4 flex-1">
            <h3 className="text-sm font-bold text-[#848E9C] mb-3">Markets</h3>
            <div className="space-y-2">
              {marketData.map((coin) => (
                <Link href="/trading" key={coin.pair} className="flex items-center justify-between p-2 rounded hover:bg-[#1E2329] transition-colors group">
                  <div>
                    <p className="text-sm font-bold text-white group-hover:text-[#FCD535] transition-colors">{coin.pair}</p>
                    <p className="text-xs text-[#5E6673]">Vol {coin.vol}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono font-bold text-white">{coin.price}</p>
                    <p className={`text-xs font-mono font-medium ${coin.change.includes("-") ? "text-[#F6465D]" : "text-[#0ECB81]"}`}>
                      {coin.change}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Footer Profile Info */}
          <div className="p-4 border-t border-[#1E2329] bg-[#0B0E11] mt-auto">
            <div className="flex items-center gap-2 text-xs text-[#848E9C] mb-1">
              <span>📧 {userData?.email}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#5E6673]">
              <span>🕒 Login: {loginTime}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}