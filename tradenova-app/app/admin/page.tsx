"use client"

import { useEffect, useState } from "react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "../lib/firebase"
import AdminSidebar from "../components/AdminSidebar"

export default function AdminPage() {

  const [users, setUsers] = useState(0)
  const [deposits, setDeposits] = useState(0)
  const [withdrawals, setWithdrawals] = useState(0)
  const [kyc, setKyc] = useState(0)
  const [support, setSupport] = useState(0)

  const loadData = async () => {

    const usersSnap = await getDocs(collection(db, "users"))
    setUsers(usersSnap.size)

    const depositsSnap = await getDocs(collection(db, "deposits"))
    setDeposits(depositsSnap.size)

    const withdrawalsSnap = await getDocs(collection(db, "withdrawals"))
    setWithdrawals(withdrawalsSnap.size)

    const kycSnap = await getDocs(collection(db, "kycData"))
    setKyc(kycSnap.size)

    const supportSnap = await getDocs(
      collection(db, "supportmessages")
    )
    setSupport(supportSnap.size)
  }

  useEffect(() => {

    loadData()

    const interval = setInterval(() => {
      loadData()
    }, 5000)

    return () => clearInterval(interval)

  }, [])

  return (
    <main className="min-h-screen bg-black flex">

      <AdminSidebar />

      <div className="flex-1 p-10">

        <div className="flex justify-between items-center mb-10">

          <div>
            <h1 className="text-5xl font-black text-white">
              TradeNova Admin Dashboard
            </h1>

            <p className="text-gray-400 mt-2">
              Live Monitoring System
            </p>
          </div>

          <div className="bg-[#081222] border border-cyan-500/20 rounded-3xl px-6 py-4">
            <h2 className="text-cyan-400 font-black">
              🔔 Notifications
            </h2>

            <p className="text-white text-sm mt-2">
              Users: {users}
            </p>

            <p className="text-white text-sm">
              Deposits: {deposits}
            </p>

            <p className="text-white text-sm">
              Withdrawals: {withdrawals}
            </p>

            <p className="text-white text-sm">
              KYC: {kyc}
            </p>

            <p className="text-white text-sm">
              Support: {support}
            </p>

          </div>

        </div>

        <div className="grid grid-cols-5 gap-6">

          <div className="bg-[#081222] border border-cyan-500/20 rounded-3xl p-6">
            <h2 className="text-gray-400">
              Total Users
            </h2>

            <h1 className="text-5xl text-cyan-400 font-black mt-2">
              {users}
            </h1>
          </div>

          <div className="bg-[#081222] border border-green-500/20 rounded-3xl p-6">
            <h2 className="text-gray-400">
              Deposits
            </h2>

            <h1 className="text-5xl text-green-400 font-black mt-2">
              {deposits}
            </h1>
          </div>

          <div className="bg-[#081222] border border-red-500/20 rounded-3xl p-6">
            <h2 className="text-gray-400">
              Withdrawals
            </h2>

            <h1 className="text-5xl text-red-400 font-black mt-2">
              {withdrawals}
            </h1>
          </div>

          <div className="bg-[#081222] border border-yellow-500/20 rounded-3xl p-6">
            <h2 className="text-gray-400">
              Pending KYC
            </h2>

            <h1 className="text-5xl text-yellow-400 font-black mt-2">
              {kyc}
            </h1>
          </div>

          <div className="bg-[#081222] border border-purple-500/20 rounded-3xl p-6">
            <h2 className="text-gray-400">
              Support
            </h2>

            <h1 className="text-5xl text-purple-400 font-black mt-2">
              {support}
            </h1>
          </div>

        </div>

        <div className="mt-10 bg-[#081222] border border-cyan-500/20 rounded-3xl p-8">

          <h2 className="text-3xl font-black text-cyan-400 mb-6">
            System Status
          </h2>

          <div className="space-y-3">

            <p className="text-green-400">
              ✅ Firebase Connected
            </p>

            <p className="text-green-400">
              ✅ User Registration Active
            </p>

            <p className="text-green-400">
              ✅ Deposit System Active
            </p>

            <p className="text-green-400">
              ✅ Withdrawal System Active
            </p>

            <p className="text-green-400">
              ✅ KYC System Active
            </p>

            <p className="text-green-400">
              ✅ Support System Active
            </p>

          </div>

        </div>

      </div>

    </main>
  )
}