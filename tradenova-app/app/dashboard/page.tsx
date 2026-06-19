"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { doc, getDoc } from "firebase/firestore"
import { db } from "../lib/firebase"

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
        setUserData({ name: user.name || user.email, balance: 0, profit: 0, totalTrades: 0, referralBonus: 0 })
      }
    }
    loadUser()
  }, [])

  const logout = () => {
    localStorage.removeItem("user")
    window.location.href = "/"
  }

  // ✅ SIRF FIREBASE KA DATA (Naya user = 0)
  const balance = Number(userData?.balance || 0).toFixed(2)
  const profit = Number(userData?.profit || 0)
  const totalTrades = Number(userData?.totalTrades || 0)
  const referralBonus = Number(userData?.referralBonus || 0).toFixed(2)

  return (
    <main className="min-h-screen bg-black text-white overflow-x-hidden">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_left,#00ffff11,transparent_35%),radial-gradient(circle_at_bottom_right,#0066ff11,transparent_35%)] pointer-events-none" />
      <div className="relative z-10">
        <div className="flex justify-between items-center px-4 md:px-8 py-4 md:py-6 border-b border-cyan-500/10 bg-[#020817cc]">
          <div>
            <h1 className="text-3xl md:text-5xl font-black bg-gradient-to-r from-cyan-300 to-blue-500 bg-clip-text text-transparent">
              Welcome {userData?.name || "Trader"}
            </h1>
            <p className="text-gray-500 mt-1 text-xs md:text-sm font-mono">ID: {userData?.email || "Loading..."}</p>
          </div>
          <button onClick={logout} className="px-4 py-2 md:px-6 md:py-3 rounded-2xl bg-red-500 hover:bg-red-600 font-bold text-sm md:text-base shadow-[0_0_15px_#ff000088] transition-all">Logout</button>
        </div>

        <div className="p-4 md:p-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-8 md:mb-10">
            <div className="bg-[#07111d] border border-cyan-500/20 rounded-2xl md:rounded-[30px] p-4 md:p-6">
              <p className="text-gray-500 text-xs md:text-sm">Wallet Balance</p>
              <h1 className="text-xl md:text-5xl font-black text-cyan-400 mt-2 md:mt-4 font-mono">${balance}</h1>
            </div>
            <div className="bg-[#07111d] border border-green-500/20 rounded-2xl md:rounded-[30px] p-4 md:p-6">
              <p className="text-gray-500 text-xs md:text-sm">Total Profit</p>
              <h1 className={`text-xl md:text-5xl font-black mt-2 md:mt-4 font-mono ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>{profit >= 0 ? '+' : ''}{profit.toFixed(2)}</h1>
            </div>
            <div className="bg-[#07111d] border border-yellow-500/20 rounded-2xl md:rounded-[30px] p-4 md:p-6">
              <p className="text-gray-500 text-xs md:text-sm">Total Trades</p>
              <h1 className="text-xl md:text-5xl font-black text-yellow-400 mt-2 md:mt-4 font-mono">{totalTrades}</h1>
            </div>
            <div className="bg-[#07111d] border border-pink-500/20 rounded-2xl md:rounded-[30px] p-4 md:p-6">
              <p className="text-gray-500 text-xs md:text-sm">Referral Bonus</p>
              <h1 className="text-xl md:text-5xl font-black text-pink-400 mt-2 md:mt-4 font-mono">${referralBonus}</h1>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 md:gap-5 mb-8 md:mb-10">
            <Link href="/deposit" className="px-5 py-3 md:px-8 md:py-4 rounded-2xl bg-cyan-400 text-black font-bold text-sm md:text-xl shadow-[0_0_20px_#00ffff] hover:scale-105 transition-all">Deposit</Link>
            <Link href="/withdraw" className="px-5 py-3 md:px-8 md:py-4 rounded-2xl bg-red-500 text-white font-bold text-sm md:text-xl shadow-[0_0_20px_#ff0000] hover:scale-105 transition-all">Withdraw</Link>
            <Link href="/trading" className="px-5 py-3 md:px-8 md:py-4 rounded-2xl bg-green-500 text-black font-bold text-sm md:text-xl shadow-[0_0_20px_#00ff00] hover:scale-105 transition-all">Trading</Link>
            <Link href="/kyc" className="px-5 py-3 md:px-8 md:py-4 rounded-2xl bg-yellow-400 text-black font-bold text-sm md:text-xl shadow-[0_0_20px_#ffff00] hover:scale-105 transition-all">KYC</Link>
            <Link href="/history" className="px-5 py-3 md:px-8 md:py-4 rounded-2xl bg-purple-500 text-white font-bold text-sm md:text-xl shadow-[0_0_20px_#8000ff] hover:scale-105 transition-all">History</Link>
            <Link href="/support" className="px-5 py-3 md:px-8 md:py-4 rounded-2xl bg-blue-500 text-white font-bold text-sm md:text-xl shadow-[0_0_20px_#0066ff] hover:scale-105 transition-all">Customer Service</Link>
          </div>
        </div>
      </div>
    </main>
  )
}