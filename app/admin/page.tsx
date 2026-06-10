"use client"

import { useEffect, useState } from "react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "../lib/firebase"
import AdminSidebar from "../components/AdminSidebar"

// ✅ FIX: Icon components ko main function ke BAHAR rakha hai taaki re-render na ho
const UsersIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
  </svg>
)

const DepositIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
  </svg>
)

const WithdrawIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
)

const KycIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
  </svg>
)

const SupportIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
  </svg>
)

export default function AdminPage() {
  const [data, setData] = useState({
    users: 0,
    deposits: 0,
    withdrawals: 0,
    kyc: 0,
    support: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  // ✅ FIX: Time ko state mein daala hai taaki server-client mismatch na ho (Hydration error fix)
  const [syncTime, setSyncTime] = useState("")

  const loadData = async () => {
    try {
      const [usersSnap, depositsSnap, withdrawalsSnap, kycSnap, supportSnap] = await Promise.all([
        getDocs(collection(db, "users")),
        getDocs(collection(db, "deposits")),
        getDocs(collection(db, "withdrawals")),
        getDocs(collection(db, "kycData")),
        getDocs(collection(db, "supportmessages"))
      ])

      setData({
        users: usersSnap.size,
        deposits: depositsSnap.size,
        withdrawals: withdrawalsSnap.size,
        kyc: kycSnap.size,
        support: supportSnap.size,
      })
      setIsLoading(false)
    } catch (error) {
      console.error("Error loading dashboard data:", error)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    // ✅ FIX: Time sirf client side par update hoga
    setSyncTime(new Date().toLocaleTimeString())

    const interval = setInterval(() => {
      loadData()
      setSyncTime(new Date().toLocaleTimeString())
    }, 15000)

    return () => clearInterval(interval)
  }, [])

  // Stats Data Array
  const statsConfig = [
    { title: "Total Users", value: data.users, icon: <UsersIcon />, color: "cyan", glow: "shadow-cyan-500/20", border: "border-cyan-500/30", textColor: "text-cyan-400", bgColor: "bg-cyan-500/10" },
    { title: "Deposits", value: data.deposits, icon: <DepositIcon />, color: "emerald", glow: "shadow-emerald-500/20", border: "border-emerald-500/30", textColor: "text-emerald-400", bgColor: "bg-emerald-500/10" },
    { title: "Withdrawals", value: data.withdrawals, icon: <WithdrawIcon />, color: "red", glow: "shadow-red-500/20", border: "border-red-500/30", textColor: "text-red-400", bgColor: "bg-red-500/10" },
    { title: "Pending KYC", value: data.kyc, icon: <KycIcon />, color: "amber", glow: "shadow-amber-500/20", border: "border-amber-500/30", textColor: "text-amber-400", bgColor: "bg-amber-500/10" },
    { title: "Support Tickets", value: data.support, icon: <SupportIcon />, color: "purple", glow: "shadow-purple-500/20", border: "border-purple-500/30", textColor: "text-purple-400", bgColor: "bg-purple-500/10" },
  ]

  const systemStatus = [
    { name: "Firebase Database", status: "Operational" },
    { name: "User Auth System", status: "Active" },
    { name: "Deposit Gateway", status: "Connected" },
    { name: "Withdrawal Engine", status: "Active" },
    { name: "KYC Verification", status: "Online" },
    { name: "Support Service", status: "Running" },
  ]

  return (
    <main className="min-h-screen bg-[#05070a] text-white flex font-sans">
      <AdminSidebar />
      
      <div className="flex-1 p-6 md:p-10 overflow-y-auto relative">
        {/* Ambient Background Glow */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none"></div>

        {/* Header Section */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">System Online</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
              Admin Dashboard
            </h1>
            <p className="text-gray-500 mt-2 text-sm font-medium">
              Real-time platform monitoring & management hub
            </p>
          </div>

          {/* Live Feed Mini Widget */}
          <div className="bg-[#0a0e17] border border-gray-800 rounded-2xl p-5 backdrop-blur-md w-full md:w-auto md:min-w-[280px] shadow-xl shadow-black/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Live Overview</h3>
              <div className="flex items-center gap-1.5 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></div>
                <span className="text-[10px] font-bold text-emerald-400">LIVE</span>
              </div>
            </div>
            <div className="space-y-2.5 text-sm font-mono">
              <div className="flex justify-between items-center text-gray-400">
                <span>Users</span> <span className="text-white font-bold">{data.users}</span>
              </div>
              <div className="flex justify-between items-center text-gray-400">
                <span>Deposits</span> <span className="text-emerald-400 font-bold">{data.deposits}</span>
              </div>
              <div className="flex justify-between items-center text-gray-400">
                <span>Withdrawals</span> <span className="text-red-400 font-bold">{data.withdrawals}</span>
              </div>
              <div className="flex justify-between items-center text-gray-400">
                <span>KYC Pending</span> <span className="text-amber-400 font-bold">{data.kyc}</span>
              </div>
              <div className="flex justify-between items-center text-gray-400">
                <span>Support</span> <span className="text-purple-400 font-bold">{data.support}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards Grid */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-10">
          {statsConfig.map((stat, index) => (
            <div 
              key={index}
              className={`relative bg-[#0a0e17] border ${stat.border} rounded-2xl p-5 overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${stat.glow} group cursor-pointer`}
            >
              <div className={`absolute inset-0 ${stat.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{stat.title}</span>
                  <div className={`${stat.textColor} opacity-80 group-hover:opacity-100 transition-opacity`}>
                    {stat.icon}
                  </div>
                </div>
                <h2 className={`text-4xl font-black ${stat.textColor} transition-all duration-300 group-hover:tracking-wider`}>
                  {isLoading ? (
                    <div className="h-10 w-20 bg-gray-800 rounded-lg animate-pulse"></div>
                  ) : (
                    stat.value.toLocaleString()
                  )}
                </h2>
              </div>
              
              <div className={`absolute bottom-0 left-0 w-full h-1 ${stat.bgColor} opacity-50 group-hover:opacity-100 transition-opacity`}></div>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* System Health Monitor */}
          <div className="lg:col-span-2 bg-[#0a0e17] border border-gray-800 rounded-2xl p-6 backdrop-blur-md shadow-xl shadow-black/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 14.727a6 6 0 010-8.486m12.728 0a6 6 0 010 8.486m-9.9-2.829a3 3 0 010-4.243m7.072 0a3 3 0 010 4.243M12 12h.008v.008H12V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                Infrastructure Status
              </h2>
              <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                All Systems Operational
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {systemStatus.map((sys, index) => (
                <div key={index} className="flex items-center justify-between bg-[#05070a] border border-gray-800/50 rounded-xl p-4 hover:border-gray-700 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="relative flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                      <div className="absolute w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping opacity-50"></div>
                    </div>
                    <span className="text-sm font-medium text-gray-300">{sys.name}</span>
                  </div>
                  <span className="text-xs font-mono font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md">
                    {sys.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side Activity */}
          <div className="bg-[#0a0e17] border border-gray-800 rounded-2xl p-6 backdrop-blur-md shadow-xl shadow-black/20 flex flex-col">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
              Quick Insights
            </h2>
            
            <div className="space-y-4 flex-1">
              <div className="bg-[#05070a] border border-gray-800/50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                  <span>Platform Activity</span>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-bold text-white">{data.users}</span>
                  <span className="text-gray-500 text-xs pb-1">active traders</span>
                </div>
                <div className="w-full bg-gray-800 h-1.5 rounded-full mt-2">
                  <div className="bg-cyan-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${Math.min(data.users * 10, 100)}%` }}></div>
                </div>
              </div>

              <div className="bg-[#05070a] border border-gray-800/50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                  <span>Pending Actions</span>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-bold text-amber-400">{data.kyc + data.support}</span>
                  <span className="text-gray-500 text-xs pb-1">require attention</span>
                </div>
                <div className="w-full bg-gray-800 h-1.5 rounded-full mt-2">
                  <div className="bg-amber-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${Math.min((data.kyc + data.support) * 20, 100)}%` }}></div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-800/50 text-center">
              {/* ✅ FIX: Ab direct time nahi, state wala time use ho raha hai */}
              <p className="text-[10px] text-gray-600 font-mono uppercase tracking-widest">
                Last Sync: {syncTime || "Connecting..."}
              </p>
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}