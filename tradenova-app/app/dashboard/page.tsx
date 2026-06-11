"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { doc, getDoc } from "firebase/firestore"
import { db } from "../lib/firebase"

const market = [
  ["BTC/USDT", "$73,313", "-2.62%"],
  ["ETH/USDT", "$3,520", "+2.81%"],
  ["SOL/USDT", "$144", "+5.45%"],
  ["XRP/USDT", "$2.42", "+1.62%"],
  ["DOGE/USDT", "$0.22", "-0.81%"],
]

export default function DashboardPage() {
  const [userData, setUserData] = useState<any>(null)

  useEffect(() => {
    const loadUser = async () => {
      const user = JSON.parse(localStorage.getItem("user") || "{}")
      if (!user.email) return

      const ref = doc(db, "users", user.email)
      const snap = await getDoc(ref)
      
      if (snap.exists()) {
        const data = snap.data()
        if (data.role === "admin") {
          window.location.href = "/admin"
          return
        }
        setUserData(data)
      } else {
        // Agar Firebase mein data nahi hai toh default 0 values
        setUserData({ name: user.name || user.email, email: user.email, balance: 0, profit: 0, totalTrades: 0, referralBonus: 0 })
      }
    }
    loadUser()
  }, [])

  const logout = () => {
    localStorage.removeItem("user")
    window.location.href = "/"
  }

  // ✅ REAL VALUES FROM FIREBASE (0 for new users)
  const balance = Number(userData?.balance || 0).toFixed(2)
  const profit = Number(userData?.profit || 0)
  const totalTrades = Number(userData?.totalTrades || 0)
  const referralBonus = Number(userData?.referralBonus || 0).toFixed(2)

  return (
    // ✅ Mobile Fix: max-w-[100vw] overflow-x-hidden lagaya hai
    <main className="min-h-screen bg-black text-white max-w-[100vw] overflow-x-hidden">

      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_left,#00ffff22,transparent_35%),radial-gradient(circle_at_bottom_right,#0066ff22,transparent_35%)] pointer-events-none" />

      <div className="relative z-10">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center px-4 md:px-8 py-4 md:py-6 border-b border-cyan-500/10 bg-[#020817cc]">
          <div className="mb-3 md:mb-0">
            <h1 className="text-3xl md:text-5xl font-black bg-gradient-to-r from-cyan-300 to-blue-500 bg-clip-text text-transparent">
              Welcome {userData?.name || "Trader"}
            </h1>
            {/* ✅ USER ID / EMAIL VISIBLE */}
            <p className="text-gray-500 mt-1 text-xs md:text-sm font-mono">
              ID: {userData?.email || "Loading..."}
            </p>
          </div>

          <button
            onClick={logout}
            className="px-5 py-2 md:px-6 md:py-3 rounded-2xl bg-red-500 hover:bg-red-600 font-bold text-sm md:text-base shadow-[0_0_25px_#ff000088] transition-all"
          >
            Logout
          </button>
        </div>

        <div className="p-4 md:p-8">

          {/* ✅ REAL DATA CARDS (No Fake +$2450) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-8 md:mb-10">

            <div className="bg-[#07111d] border border-cyan-500/20 rounded-2xl md:rounded-[30px] p-4 md:p-6">
              <p className="text-gray-400 text-xs md:text-sm">Wallet Balance</p>
              <h1 className="text-2xl md:text-5xl font-black text-cyan-400 mt-2 md:mt-4 font-mono">
                ${balance}
              </h1>
            </div>

            <div className="bg-[#07111d] border border-green-500/20 rounded-2xl md:rounded-[30px] p-4 md:p-6">
              <p className="text-gray-400 text-xs md:text-sm">Total Profit</p>
              <h1 className={`text-2xl md:text-5xl font-black mt-2 md:mt-4 font-mono ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {profit >= 0 ? '+' : ''}{profit.toFixed(2)}
              </h1>
            </div>

            <div className="bg-[#07111d] border border-yellow-500/20 rounded-2xl md:rounded-[30px] p-4 md:p-6">
              <p className="text-gray-400 text-xs md:text-sm">Open Trades</p>
              <h1 className="text-2xl md:text-5xl font-black text-yellow-400 mt-2 md:mt-4 font-mono">
                {totalTrades}
              </h1>
            </div>

            <div className="bg-[#07111d] border border-pink-500/20 rounded-2xl md:rounded-[30px] p-4 md:p-6">
              <p className="text-gray-400 text-xs md:text-sm">Referral Bonus</p>
              <h1 className="text-2xl md:text-5xl font-black text-pink-400 mt-2 md:mt-4 font-mono">
                ${referralBonus}
              </h1>
            </div>

          </div>

          {/* ACTION BUTTONS */}
          <div className="flex flex-wrap gap-3 md:gap-5 mb-8 md:mb-10">

            <Link href="/deposit" className="px-5 py-3 md:px-8 md:py-4 rounded-2xl bg-cyan-400 text-black font-bold text-sm md:text-xl shadow-[0_0_20px_#00ffff] hover:scale-105 transition-all">
              Deposit
            </Link>

            <Link href="/withdraw" className="px-5 py-3 md:px-8 md:py-4 rounded-2xl bg-red-500 text-white font-bold text-sm md:text-xl shadow-[0_0_20px_#ff0000] hover:scale-105 transition-all">
              Withdraw
            </Link>

            <Link href="/trading" className="px-5 py-3 md:px-8 md:py-4 rounded-2xl bg-green-500 text-black font-bold text-sm md:text-xl shadow-[0_0_20px_#00ff00] hover:scale-105 transition-all">
              Trading
            </Link>

            <Link href="/kyc" className="px-5 py-3 md:px-8 md:py-4 rounded-2xl bg-yellow-400 text-black font-bold text-sm md:text-xl shadow-[0_0_20px_#ffff00] hover:scale-105 transition-all">
              KYC
            </Link>

            <Link href="/history" className="px-5 py-3 md:px-8 md:py-4 rounded-2xl bg-purple-500 text-white font-bold text-sm md:text-xl shadow-[0_0_20px_#8000ff] hover:scale-105 transition-all">
              History
            </Link>

            <Link href="/support" className="px-5 py-3 md:px-8 md:py-4 rounded-2xl bg-blue-500 text-white font-bold text-sm md:text-xl shadow-[0_0_20px_#0066ff] hover:scale-105 transition-all">
              Customer Service
            </Link>

          </div>

          <div className="grid lg:grid-cols-[1fr_380px] gap-6 md:gap-8">

            {/* CHART SECTION */}
            <div className="bg-[#07111d] border border-cyan-500/20 rounded-[20px] md:rounded-[35px] p-4 md:p-6">

              <div className="flex justify-between items-center mb-4 md:mb-6">
                <div>
                  <h1 className="text-3xl md:text-5xl font-black text-cyan-400">
                    BTC/USDT
                  </h1>
                  <p className="text-red-500 text-lg md:text-2xl mt-1 md:mt-2">
                    $73,313 ▼ -2.62%
                  </p>
                </div>
                <div className="bg-green-500/20 text-green-400 px-4 py-1.5 md:px-5 md:py-2 rounded-full text-xs md:text-sm font-bold">
                  LIVE
                </div>
              </div>

              <div className="h-[250px] md:h-[450px] rounded-[20px] md:rounded-[30px] bg-[#020817] border border-cyan-500/10 relative overflow-hidden">
                <div className="absolute inset-0">
                  {[...Array(12)].map((_, i) => (
                    <div key={`h-${i}`} className="absolute w-full border-t border-white/5" style={{ top: `${i * 40}px` }} />
                  ))}
                  {[...Array(18)].map((_, i) => (
                    <div key={`v-${i}`} className="absolute h-full border-l border-white/5" style={{ left: `${i * 60}px` }} />
                  ))}
                </div>

                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 450" preserveAspectRatio="none">
                  <polyline fill="none" stroke="#00ffcc" strokeWidth="5" points="0,360 80,330 160,340 240,250 320,290 400,220 480,240 560,160 640,210 720,130 820,190 920,110 1000,140" />
                </svg>
              </div>

              <div className="grid grid-cols-2 gap-3 md:gap-5 mt-6 md:mt-8">
                <Link href="/trading" className="p-4 md:p-5 rounded-2xl bg-green-500 text-black font-black text-lg md:text-2xl shadow-[0_0_20px_#00ff00] text-center hover:scale-105 transition-all">
                  BUY
                </Link>
                <Link href="/trading" className="p-4 md:p-5 rounded-2xl bg-red-500 text-white font-black text-lg md:text-2xl shadow-[0_0_20px_#ff0000] text-center hover:scale-105 transition-all">
                  SELL
                </Link>
              </div>

            </div>

            {/* RIGHT SIDE: MARKET & PORTFOLIO */}
            <div className="space-y-6 md:space-y-8">

              <div className="bg-[#07111d] border border-cyan-500/20 rounded-[20px] md:rounded-[35px] p-4 md:p-6">
                <h1 className="text-2xl md:text-4xl font-black mb-4 md:mb-6">Live Market</h1>
                <div className="space-y-3 md:space-y-4">
                  {market.map((coin, i) => (
                    <div key={i} className="bg-black rounded-xl md:rounded-2xl p-3 md:p-5 flex justify-between items-center">
                      <div>
                        <h1 className="text-lg md:text-2xl font-black">{coin[0]}</h1>
                        <p className="text-gray-500 text-xs">Live Pair</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg md:text-2xl font-black">{coin[1]}</p>
                        <p className={`text-sm font-bold ${coin[2].includes("-") ? "text-red-500" : "text-green-400"}`}>
                          {coin[2]}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ✅ PORTFOLIO WITH REAL DATA */}
              <div className="bg-[#07111d] border border-yellow-500/20 rounded-[20px] md:rounded-[35px] p-4 md:p-6">
                <h1 className="text-2xl md:text-4xl font-black text-yellow-400 mb-4 md:mb-6">Portfolio</h1>
                <div className="space-y-3 md:space-y-4">

                  <div className="bg-black rounded-xl md:rounded-2xl p-3 md:p-5">
                    <p className="text-gray-400 text-xs md:text-sm">Wallet Balance</p>
                    <h1 className="text-2xl md:text-5xl font-black text-cyan-400 mt-1 md:mt-3 font-mono">${balance}</h1>
                  </div>

                  <div className="bg-black rounded-xl md:rounded-2xl p-3 md:p-5">
                    <p className="text-gray-400 text-xs md:text-sm">Open Positions</p>
                    <h1 className="text-2xl md:text-5xl font-black text-yellow-400 mt-1 md:mt-3 font-mono">{totalTrades} Trades</h1>
                  </div>

                  <div className="bg-black rounded-xl md:rounded-2xl p-3 md:p-5">
                    <p className="text-gray-400 text-xs md:text-sm">Today's PnL</p>
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