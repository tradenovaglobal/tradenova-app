"use client"

import { useState } from "react"
import { addDoc, collection, getDoc, doc } from "firebase/firestore"
import { db } from "../lib/firebase"
import { getUserEmail, updateUser } from "../lib/userHelper"
import Link from "next/link"

export default function WithdrawPage() {

  const [amount, setAmount] = useState("")
  const [wallet, setWallet] = useState("")
  const [loading, setLoading] = useState(false)

  const handleWithdraw = async () => {

    if (!amount || Number(amount) <= 0) {
      alert("Enter valid amount")
      return
    }

    setLoading(true)

    try {

      const email = getUserEmail()
      if (!email) {
        alert("Login first")
        setLoading(false)
        return
      }

      // ✅ 1. User ka current data lo — balance check karo
      const userSnap = await getDoc(doc(db, "users", email))
      const userData = userSnap.data()
      const currentBalance = Number(userData?.balance || 0)
      const currentHistory = userData?.withdrawHistory || []

      if (Number(amount) > currentBalance) {
        alert("❌ Insufficient balance! Your balance: $" + currentBalance.toFixed(2))
        setLoading(false)
        return
      }

      if (Number(amount) < 10) {
        alert("❌ Minimum withdrawal is $10")
        setLoading(false)
        return
      }

      // ✅ 2. Admin ke liye withdrawals collection mein save
      await addDoc(collection(db, "withdrawals"), {
        email,
        amount: Number(amount),
        wallet,
        status: "Pending",
        createdAt: new Date().toISOString(),
      })

      // ✅ 3. User ka balance deduct + withdrawHistory update
      const newWithdraw = {
        id: Date.now().toString(),
        amount: Number(amount),
        wallet,
        status: "Pending",
        date: new Date().toISOString(),
      }

      await updateUser(email, {
        balance: currentBalance - Number(amount),
        withdrawHistory: [newWithdraw, ...currentHistory],
      })

      alert("✅ Withdraw Request Submitted! $" + amount)

      setAmount("")
      setWallet("")

    } catch (error) {

      console.log(error)
      alert("❌ Withdraw Failed! Try again")

    }

    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-black text-white overflow-x-hidden">

      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_left,#ff000008,transparent_35%),radial-gradient(circle_at_bottom_right,#ff000008,transparent_35%)] pointer-events-none" />

      <div className="relative z-10">

        {/* HEADER */}
        <div className="flex justify-between items-center px-4 md:px-8 py-4 md:py-6 border-b border-red-500/10 bg-[#020817cc]">
          <Link href="/dashboard" className="text-red-400 hover:text-red-300 text-sm md:text-base font-bold">← Back</Link>
          <h1 className="text-2xl md:text-4xl font-black bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent">
            Withdraw Funds
          </h1>
          <div className="w-16"></div>
        </div>

        <div className="flex items-center justify-center p-4 md:p-8">

          <div className="w-full max-w-xl">

            {/* INFO CARD */}
            <div className="bg-[#07111d] border border-red-500/20 rounded-[30px] p-6 md:p-8 mb-6 shadow-[0_0_40px_#ff000015]">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-red-500/20 flex items-center justify-center text-2xl">🏦</div>
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-red-400">USDT Withdrawal</h2>
                  <p className="text-gray-500 text-xs md:text-sm">TRC20 Network Only</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-black rounded-xl p-3 text-center border border-red-500/10">
                  <p className="text-gray-500 text-[10px] md:text-xs">Network</p>
                  <p className="text-white font-bold text-sm md:text-base">TRC20</p>
                </div>
                <div className="bg-black rounded-xl p-3 text-center border border-red-500/10">
                  <p className="text-gray-500 text-[10px] md:text-xs">Min Withdraw</p>
                  <p className="text-white font-bold text-sm md:text-base">$10</p>
                </div>
                <div className="bg-black rounded-xl p-3 text-center border border-red-500/10">
                  <p className="text-gray-500 text-[10px] md:text-xs">Fee</p>
                  <p className="text-green-400 font-bold text-sm md:text-base">FREE</p>
                </div>
              </div>
            </div>

            {/* WITHDRAW FORM */}
            <div className="bg-[#07111d] border border-red-500/20 rounded-[30px] p-6 md:p-8 shadow-[0_0_40px_#ff000015]">

              <h2 className="text-xl md:text-2xl font-black text-white mb-6 flex items-center gap-2">
                <span className="text-red-400">01.</span> Enter Withdrawal Details
              </h2>

              <div className="space-y-5">

                <div>
                  <label className="text-gray-400 text-xs md:text-sm mb-2 block">Amount (USD)</label>
                  <input
                    type="number"
                    placeholder="Enter Amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full p-4 md:p-5 rounded-2xl bg-black border border-red-500/20 outline-none text-lg md:text-xl font-mono focus:border-red-400 transition-all placeholder:text-gray-700"
                  />
                </div>

                <div>
                  <label className="text-gray-400 text-xs md:text-sm mb-2 block">Your USDT Wallet Address (TRC20)</label>
                  <input
                    type="text"
                    placeholder="Enter your TRC20 wallet address"
                    value={wallet}
                    onChange={(e) => setWallet(e.target.value)}
                    className="w-full p-4 md:p-5 rounded-2xl bg-black border border-red-500/20 outline-none text-sm md:text-base font-mono focus:border-red-400 transition-all placeholder:text-gray-700"
                  />
                </div>

                <button
                  onClick={handleWithdraw}
                  disabled={loading}
                  className={`w-full p-4 md:p-5 rounded-2xl font-black text-lg md:text-xl shadow-[0_0_30px_#ff0000] transition-all ${
                    loading
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed shadow-none"
                      : "bg-red-500 text-white hover:scale-[1.02] active:scale-[0.98]"
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-3">
                      <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    "Submit Withdraw"
                  )}
                </button>

              </div>
            </div>

            {/* WARNING */}
            <div className="mt-6 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 md:p-5">
              <p className="text-yellow-400 text-xs md:text-sm font-bold mb-1">⚠️ Important</p>
              <p className="text-gray-400 text-[11px] md:text-xs leading-relaxed">
                Only withdraw to TRC20 compatible wallets. Minimum withdrawal is $10. Funds will be sent within 1-24 hours after review. Balance will be deducted immediately.
              </p>
            </div>

          </div>
        </div>
      </div>
    </main>
  )
}