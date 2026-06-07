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

    const user =
      JSON.parse(localStorage.getItem("user") || "{}")

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

      localStorage.setItem(
        "loginTime",
        new Date().toLocaleString()
      )

      localStorage.setItem(
        "userName",
        data.name
      )
    }
  }

  loadUser()

}, [])

  const logout = () => {

    localStorage.removeItem("user")

    window.location.href = "/"

  }

  return (

    <main className="min-h-screen bg-black text-white overflow-x-hidden">

      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_left,#00ffff22,transparent_35%),radial-gradient(circle_at_bottom_right,#0066ff22,transparent_35%)] pointer-events-none" />

      <div className="relative z-10">

         <div className="flex flex-col md:flex-row justify-between items-center px-4 md:px-8 py-6 gap-4">

          <div>

            <h1 className="text-3xl md:text-5xl font-black bg-gradient-to-r from-cyan-300 to-blue-500 bg-clip-text text-transparent">
              Welcome {userData?.name || "Trader"}
            </h1>

            <p className="text-gray-400 mt-2">
              Premium Crypto Exchange Dashboard
            </p>

<p className="text-cyan-400 mt-2">
  {new Date().toLocaleString()}
</p>

<p className="text-cyan-400 mt-2">
  {userData?.email}
</p>

<p className="text-green-400 mt-1">
 Login: {typeof window !== "undefined"
   ? localStorage.getItem("loginTime")
   : ""}
</p>

          </div>

          <button
            onClick={logout}
            className="px-6 py-3 rounded-2xl bg-red-500 hover:bg-red-600 font-black shadow-[0_0_25px_#ff000088]"
          >
            Logout
          </button>

        </div>

        <div className="p-8">

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10">

            <div className="bg-[#07111d] border border-cyan-500/20 rounded-[30px] p-6">
              <p className="text-gray-400">Wallet Balance</p>
              <h1 className="text-3xl md:text-5xl font-black text-cyan-400 mt-4">
                ${userData?.balance || 0}
              </h1>
            </div>

            <div className="bg-[#07111d] border border-green-500/20 rounded-[30px] p-6">
              <p className="text-gray-400">Total Profit</p>
              <h1 className="text-5xl font-black text-green-400 mt-4">
                +$2,450
              </h1>
            </div>

            <div className="bg-[#07111d] border border-yellow-500/20 rounded-[30px] p-6">
              <p className="text-gray-400">Open Trades</p>
              <h1 className="text-3xl md:text-5xl font-black text-yellow-400 mt-4">
                12
              </h1>
            </div>

            <div className="bg-[#07111d] border border-pink-500/20 rounded-[30px] p-6">
              <p className="text-gray-400">Referral Bonus</p>
              <h1 className="text-5xl font-black text-pink-400 mt-4">
                $540
              </h1>
            </div>

          </div>

          <div className="flex flex-wrap gap-5 mb-10">

            <Link
              href="/deposit"
              className="px-8 py-4 rounded-2xl bg-cyan-400 text-black font-black text-xl shadow-[0_0_30px_#00ffff]"
            >
              Deposit
            </Link>

            <Link
              href="/withdraw"
              className="px-8 py-4 rounded-2xl bg-red-500 text-white font-black text-xl shadow-[0_0_30px_#ff0000]"
            >
              Withdraw
            </Link>

            <Link
              href="/trading"
              className="px-8 py-4 rounded-2xl bg-green-500 text-black font-black text-xl shadow-[0_0_30px_#00ff00]"
            >
              Trading
            </Link>

            <Link
              href="/kyc"
              className="px-8 py-4 rounded-2xl bg-yellow-400 text-black font-black text-xl shadow-[0_0_30px_#ffff00]"
            >
              KYC
            </Link>

            <Link
              href="/history"
              className="px-8 py-4 rounded-2xl bg-purple-500 text-white font-black text-xl shadow-[0_0_30px_#8000ff]"
            >
              History
            </Link>

            <Link
              href="/support"
              className="px-8 py-4 rounded-2xl bg-blue-500 text-white font-black text-xl shadow-[0_0_30px_#0066ff]"
            >
              Customer Service
            </Link>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4 lg:gap-8">

            <div className="bg-[#07111d] border border-cyan-500/20 rounded-[35px] p-6">

              <div className="flex justify-between items-center mb-6">

                <div>

                  <h1 className="text-3xl md:text-5xl font-black text-cyan-400">
                    BTC/USDT
                  </h1>

                  <p className="text-red-500 text-2xl mt-2">
                    $73,313 ▼ -2.62%
                  </p>

                </div>

                <div className="bg-green-500/20 text-green-400 px-5 py-2 rounded-full">
                  LIVE
                </div>

              </div>

              <div className="h-[450px] rounded-[30px] bg-[#020817] border border-cyan-500/10 relative overflow-hidden">

                <div className="absolute inset-0">

                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-full border-t border-white/5"
                      style={{ top: `${i * 40}px` }}
                    />
                  ))}

                  {[...Array(18)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute h-full border-l border-white/5"
                      style={{ left: `${i * 60}px` }}
                    />
                  ))}

                </div>

                <svg
                  className="absolute inset-0 w-full h-full"
                  viewBox="0 0 1000 450"
                  preserveAspectRatio="none"
                >

                  <polyline
                    fill="none"
                    stroke="#00ffcc"
                    strokeWidth="5"
                    points="
                    0,360
                    80,330
                    160,340
                    240,250
                    320,290
                    400,220
                    480,240
                    560,160
                    640,210
                    720,130
                    820,190
                    920,110
                    1000,140
                    "
                  />

                </svg>

              </div>

              <div className="grid grid-cols-2 gap-3 md:gap-5 mt-8">

                <button className="p-5 rounded-2xl bg-green-500 text-black font-black text-2xl shadow-[0_0_30px_#00ff00]">
                  BUY
                </button>

                <button className="p-5 rounded-2xl bg-red-500 text-white font-black text-2xl shadow-[0_0_30px_#ff0000]">
                  SELL
                </button>

              </div>

            </div>

            <div className="space-y-8">

              <div className="bg-[#07111d] border border-cyan-500/20 rounded-[35px] p-6">

                <h1 className="text-4xl font-black mb-6">
                  Live Market
                </h1>

                <div className="space-y-4">

                  {market.map((coin, i) => (

                    <div
                      key={i}
                      className="bg-black rounded-2xl p-5 flex justify-between"
                    >

                      <div>

                        <h1 className="text-2xl font-black">
                          {coin[0]}
                        </h1>

                        <p className="text-gray-500">
                          Live Pair
                        </p>

                      </div>

                      <div className="text-right">

                        <p className="text-2xl font-black">
                          {coin[1]}
                        </p>

                        <p
                          className={
                            coin[2].includes("-")
                              ? "text-red-500"
                              : "text-green-400"
                          }
                        >
                          {coin[2]}
                        </p>

                      </div>

                    </div>

                  ))}

                </div>

              </div>

              <div className="bg-[#07111d] border border-yellow-500/20 rounded-[35px] p-6">

                <h1 className="text-4xl font-black text-yellow-400 mb-6">
                  Portfolio
                </h1>

                <div className="space-y-4">

                  <div className="bg-black rounded-2xl p-5">
                    <p className="text-gray-400">Wallet Balance</p>
                    <h1 className="text-5xl font-black text-cyan-400 mt-3">
                      ${userData?.balance || 0}
                    </h1>
                  </div>

                  <div className="bg-black rounded-2xl p-5">
                    <p className="text-gray-400">Open Positions</p>
                    <h1 className="text-5xl font-black text-green-400 mt-3">
                      12 Trades
                    </h1>
                  </div>

                  <div className="bg-black rounded-2xl p-5">
                    <p className="text-gray-400">Today's PnL</p>
                    <h1 className="text-5xl font-black text-green-400 mt-3">
                      +$2,450
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