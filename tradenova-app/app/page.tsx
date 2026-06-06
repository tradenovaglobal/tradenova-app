"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()

  const [showLogin, setShowLogin] = useState(false)
  const [showRegister, setShowRegister] = useState(false)

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleRegister = () => {
    if (!name || !email || !password) {
      alert("Fill all fields")
      return
    }

    const userData = {
      name,
      email,
      password,
      balance: 0,
    }

    localStorage.setItem("user", JSON.stringify(userData))

    alert("Account Created")

    setShowRegister(false)

    router.push("/dashboard")
  }

  const handleLogin = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}")

    if (
      email === user.email &&
      password === user.password
    ) {
      alert("Login Success")

      router.push("/dashboard")
    } else {
      alert("Wrong Email or Password")
    }
  }

  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">

      {/* NAVBAR */}

      <nav className="w-full border-b border-cyan-900 bg-[#020817]/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-cyan-400 flex items-center justify-center text-black font-bold text-xl shadow-[0_0_30px_#00ffff]">
              ₿
            </div>

            <div>
              <h1 className="text-4xl font-bold text-cyan-400">
                TradeNova
              </h1>

              <p className="text-gray-400 text-sm">
                AI Crypto Exchange
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-10 text-gray-300">
            <button>Markets</button>
            <button>Trading</button>
            <button>Wallet</button>
            <button>Support</button>
          </div>

          <div className="flex items-center gap-4">

            <button
              onClick={() => setShowLogin(true)}
              className="px-6 py-3 border border-cyan-500 rounded-xl hover:bg-cyan-500/10 transition"
            >
              Login
            </button>

            <button
              onClick={() => setShowRegister(true)}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold shadow-[0_0_30px_#00ffff]"
            >
              Sign Up
            </button>

          </div>
        </div>
      </nav>

      {/* LIVE TICKER */}

      <div className="w-full border-b border-cyan-900 overflow-hidden whitespace-nowrap py-4 bg-[#06111f]">

        <div className="animate-marquee inline-flex gap-20 text-xl font-semibold">

          <span className="text-green-400">
            BTC/USDT $68,421 ▲ 4.2%
          </span>

          <span className="text-green-400">
            ETH/USDT $3,520 ▲ 2.8%
          </span>

          <span className="text-red-400">
            DOGE/USDT $0.22 ▼ 0.8%
          </span>

          <span className="text-green-400">
            XRP/USDT $2.42 ▲ 1.6%
          </span>

          <span className="text-green-400">
            SOL/USDT $144 ▲ 5.4%
          </span>

        </div>
      </div>

      {/* HERO */}

      <section className="relative max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-20 items-center">

        <div>

          <div className="inline-flex items-center gap-2 border border-cyan-500/30 rounded-full px-6 py-3 text-cyan-300 bg-cyan-500/5 mb-8 shadow-[0_0_30px_rgba(0,255,255,0.2)]">
            🚀 Trusted by 12M+ Traders Worldwide
          </div>

          <h1 className="text-7xl font-black leading-tight mb-8">

            <span className="text-white">
              TRADE
            </span>

            <br />

            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              LIKE FUTURE
            </span>

          </h1>

          <p className="text-gray-400 text-2xl leading-relaxed max-w-xl mb-10">
            Experience institutional-grade crypto trading with live AI analytics, lightning-fast execution and premium security.
          </p>

          <div className="flex gap-6 mb-14">

            <button
              onClick={() => setShowRegister(true)}
              className="px-10 py-5 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold text-xl shadow-[0_0_40px_#00ffff]"
            >
              Start Trading
            </button>

            <button className="px-10 py-5 rounded-2xl border border-cyan-500/30 text-xl bg-[#07111d]">
              Live Markets
            </button>

          </div>

          <div className="grid grid-cols-3 gap-6">

            <div className="bg-[#07111d] border border-cyan-500/20 rounded-3xl p-6">
              <h2 className="text-5xl font-black text-cyan-400">
                $18B+
              </h2>

              <p className="text-gray-500 mt-3">
                Daily Volume
              </p>
            </div>

            <div className="bg-[#07111d] border border-cyan-500/20 rounded-3xl p-6">
              <h2 className="text-5xl font-black text-cyan-400">
                12M+
              </h2>

              <p className="text-gray-500 mt-3">
                Active Traders
              </p>
            </div>

            <div className="bg-[#07111d] border border-cyan-500/20 rounded-3xl p-6">
              <h2 className="text-5xl font-black text-cyan-400">
                350+
              </h2>

              <p className="text-gray-500 mt-3">
                Coins Listed
              </p>
            </div>

          </div>

        </div>

        {/* LIVE CARD */}

        <div className="relative">

          <div className="absolute inset-0 bg-cyan-500/10 blur-3xl rounded-full"></div>

          <div className="relative bg-[#07111d]/95 border border-cyan-500/20 rounded-[40px] p-8 shadow-[0_0_60px_rgba(0,255,255,0.15)]">

            <div className="flex justify-between items-center mb-6">

              <div>
                <h2 className="text-6xl font-black text-white">
                  LIVE BTC
                </h2>

                <p className="text-gray-500 mt-2">
                  Real-time market analytics
                </p>
              </div>

              <div className="px-6 py-3 rounded-full bg-green-500/20 text-green-400">
                LIVE
              </div>

            </div>

            <div className="mb-6">
              <h3 className="text-7xl font-black text-green-400">
                $68,421
              </h3>

              <p className="text-green-400 text-2xl mt-2">
                ▲ +4.20%
              </p>
            </div>

            {/* LIVE GRAPH */}

            <div className="h-[300px] rounded-3xl bg-gradient-to-b from-cyan-500/10 to-transparent border border-cyan-500/10 flex items-end justify-around px-8 pb-8">

              {[40, 60, 55, 80, 72, 95, 88, 100].map((h, i) => (
                <div
                  key={i}
                  className="w-14 rounded-t-3xl bg-gradient-to-t from-cyan-500 to-cyan-300 shadow-[0_0_30px_#00ffff] animate-pulse"
                  style={{ height: `${h}%` }}
                />
              ))}

            </div>

          </div>

        </div>

      </section>

      {/* LOGIN POPUP */}

      {showLogin && (
        <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-md flex items-center justify-center">

          <div className="relative w-full max-w-md bg-[#07111d] border border-cyan-500/30 rounded-[35px] p-10 shadow-[0_0_50px_#00ffff]">

            <button
              onClick={() => setShowLogin(false)}
              className="absolute top-5 right-5 text-2xl text-gray-400"
            >
              ✕
            </button>

            <h2 className="text-6xl font-black text-center mb-10 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              LOGIN
            </h2>

            <div className="space-y-6">

              <input
                type="email"
                placeholder="Enter Email"
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-5 rounded-2xl bg-black border border-cyan-500/20 outline-none"
              />

              <input
                type="password"
                placeholder="Enter Password"
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-5 rounded-2xl bg-black border border-cyan-500/20 outline-none"
              />

              <button
                onClick={handleLogin}
                className="w-full p-5 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-black text-xl shadow-[0_0_40px_#00ffff]"
              >
                Login Now
              </button>

            </div>

          </div>

        </div>
      )}

      {/* REGISTER POPUP */}

      {showRegister && (
        <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-md flex items-center justify-center">

          <div className="relative w-full max-w-md bg-[#07111d] border border-cyan-500/30 rounded-[35px] p-10 shadow-[0_0_50px_#00ffff]">

            <button
              onClick={() => setShowRegister(false)}
              className="absolute top-5 right-5 text-2xl text-gray-400"
            >
              ✕
            </button>

            <h2 className=" font-black text-center mb-10 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              REGISTER
            </h2>

            <div className="space-y-6">

              <input
                type="text"
                placeholder="Full Name"
                onChange={(e) => setName(e.target.value)}
                className="w-full p-5 rounded-2xl bg-black border border-cyan-500/20 outline-none"
              />

              <input
                type="email"
                placeholder="Enter Email"
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-5 rounded-2xl bg-black border border-cyan-500/20 outline-none"
              />

              <input
                type="password"
                placeholder="Enter Password"
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-5 rounded-2xl bg-black border border-cyan-500/20 outline-none"
              />

              <button
                onClick={handleRegister}
                className="w-full p-5 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-black text-xl shadow-[0_0_40px_#00ffff]"
              >
                Create Account
              </button>

            </div>

          </div>

        </div>
      )}

    </main>
  )
}