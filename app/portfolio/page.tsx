"use client"

import { useEffect, useState } from "react"
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore"
import { db } from "../lib/firebase"
import Link from "next/link"

// ✅ Helper Functions Component Ke Bahar (Global) - Isse Red Error 100% Fix Hoga
const safeGetTime = (timestamp: any): number => {
  if (!timestamp) return 0
  try {
    if (timestamp?.seconds) return timestamp.seconds * 1000
    if (timestamp instanceof Date) return timestamp.getTime()
    return new Date(timestamp).getTime()
  } catch {
    return 0
  }
}

const safeFormatDate = (timestamp: any): string => {
  if (!timestamp) return "N/A"
  try {
    return new Date(safeGetTime(timestamp)).toLocaleString()
  } catch {
    return "N/A"
  }
}

// Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
  const lowerStatus = (status || "pending").toLowerCase()
  const styles: Record<string, string> = {
    approved: "bg-[#0ECB81]/10 text-[#0ECB81] border-[#0ECB81]/30",
    win: "bg-[#0ECB81]/10 text-[#0ECB81] border-[#0ECB81]/30",
    pending: "bg-[#FCD535]/10 text-[#FCD535] border-[#FCD535]/30",
    active: "bg-[#FCD535]/10 text-[#FCD535] border-[#FCD535]/30",
    rejected: "bg-[#F6465D]/10 text-[#F6465D] border-[#F6465D]/30",
    loss: "bg-[#F6465D]/10 text-[#F6465D] border-[#F6465D]/30",
  }
  
  const styleKey = Object.keys(styles).find(key => lowerStatus.includes(key)) || "pending"
  
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-bold border capitalize ${styles[styleKey]}`}>
      {status || "Pending"}
    </span>
  )
}

export default function PortfolioPage() {
  const [userData, setUserData] = useState<any>(null)
  const [kycStatus, setKycStatus] = useState("Pending")
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPortfolioData()
  }, [])

  const loadPortfolioData = async () => {
    setLoading(true)
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}")
      if (!user.email) return

      // 1. Fetch User Balance & Data
      const userRef = doc(db, "users", user.email)
      const userSnap = await getDoc(userRef)
      if (userSnap.exists()) {
        setUserData(userSnap.data())
      }

      // 2. Fetch KYC Status
      const kycQuery = query(collection(db, "kycData"), where("email", "==", user.email))
      const kycSnap = await getDocs(kycQuery)
      if (!kycSnap.empty) {
        setKycStatus(kycSnap.docs[0].data().status || "Pending")
      }

      // 3. Fetch Deposits & Withdrawals
      const depositQuery = query(collection(db, "deposits"), where("email", "==", user.email))
      const depositSnap = await getDocs(depositQuery)
      const deposits = depositSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), type: "Deposit" }))

      const withdrawQuery = query(collection(db, "withdrawals"), where("email", "==", user.email))
      const withdrawSnap = await getDocs(withdrawQuery)
      const withdrawals = withdrawSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), type: "Withdrawal" }))

      // Combine and sort by date (newest first) - 100% FIXED
      const allTransactions = [...deposits, ...withdrawals].sort((a, b) => {
        return safeGetTime(b.createdAt) - safeGetTime(a.createdAt)
      })

      setTransactions(allTransactions)
    } catch (error) {
      console.error("Error loading portfolio:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0B0E11] flex items-center justify-center">
        <div className="flex flex-col items-center text-[#848E9C]">
          <div className="w-12 h-12 border-4 border-[#2B3139] border-t-[#FCD535] rounded-full animate-spin mb-4"></div>
          <p className="font-semibold">Loading Portfolio...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0B0E11] text-[#EAECEF] p-6 md:p-10">
      
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white">Portfolio Overview</h1>
          <p className="text-sm text-[#848E9C] mt-1">Your account summary and recent transaction activity</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          
          <div className="bg-[#1E2329] p-5 rounded-xl border border-[#2B3139] shadow-md hover:border-[#FCD535]/30 transition-colors">
            <div className="flex justify-between items-start mb-3">
              <p className="text-[#848E9C] text-xs uppercase tracking-wider">Total Balance</p>
              <span className="text-lg">💰</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#FCD535]">
              ${userData?.balance?.toFixed(2) || "0.00"}
            </h2>
          </div>

          <div className="bg-[#1E2329] p-5 rounded-xl border border-[#2B3139] shadow-md hover:border-[#0ECB81]/30 transition-colors">
            <div className="flex justify-between items-start mb-3">
              <p className="text-[#848E9C] text-xs uppercase tracking-wider">Total Deposits</p>
              <span className="text-lg">📥</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#0ECB81]">
              {transactions.filter(t => t.type === "Deposit").length}
            </h2>
          </div>

          <div className="bg-[#1E2329] p-5 rounded-xl border border-[#2B3139] shadow-md hover:border-[#F6465D]/30 transition-colors">
            <div className="flex justify-between items-start mb-3">
              <p className="text-[#848E9C] text-xs uppercase tracking-wider">Total Withdrawals</p>
              <span className="text-lg">📤</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#F6465D]">
              {transactions.filter(t => t.type === "Withdrawal").length}
            </h2>
          </div>

          <div className="bg-[#1E2329] p-5 rounded-xl border border-[#2B3139] shadow-md hover:border-[#FCD535]/30 transition-colors">
            <div className="flex justify-between items-start mb-3">
              <p className="text-[#848E9C] text-xs uppercase tracking-wider">KYC Status</p>
              <span className="text-lg">🛡️</span>
            </div>
            <StatusBadge status={kycStatus} />
            {kycStatus !== "Approved" && (
              <Link href="/kyc" className="block text-xs text-[#FCD535] mt-3 hover:underline">
                Complete Verification →
              </Link>
            )}
          </div>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left: Quick Actions & Account Info */}
          <div className="space-y-6">
             <div className="bg-[#1E2329] border border-[#2B3139] rounded-xl p-6 shadow-md">
                <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link href="/deposit" className="flex items-center gap-3 p-3 rounded-lg bg-[#0B0E11] border border-[#2B3139] hover:border-[#0ECB81] transition-colors group">
                    <span className="text-xl">💵</span>
                    <div>
                      <p className="text-sm font-bold text-white group-hover:text-[#0ECB81]">Deposit Funds</p>
                      <p className="text-xs text-[#848E9C]">Add USDT to your wallet</p>
                    </div>
                  </Link>
                  <Link href="/withdraw" className="flex items-center gap-3 p-3 rounded-lg bg-[#0B0E11] border border-[#2B3139] hover:border-[#F6465D] transition-colors group">
                    <span className="text-xl">💸</span>
                    <div>
                      <p className="text-sm font-bold text-white group-hover:text-[#F6465D]">Withdraw Funds</p>
                      <p className="text-xs text-[#848E9C]">Send crypto to external wallet</p>
                    </div>
                  </Link>
                  <Link href="/trading" className="flex items-center gap-3 p-3 rounded-lg bg-[#0B0E11] border border-[#2B3139] hover:border-[#FCD535] transition-colors group">
                    <span className="text-xl">📈</span>
                    <div>
                      <p className="text-sm font-bold text-white group-hover:text-[#FCD535]">Start Trading</p>
                      <p className="text-xs text-[#848E9C]">Trade BTC, ETH, SOL</p>
                    </div>
                  </Link>
                </div>
             </div>

             <div className="bg-[#1E2329] border border-[#2B3139] rounded-xl p-6 shadow-md">
                <h3 className="text-lg font-bold text-white mb-4">Account Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#848E9C]">Email</span>
                    <span className="text-white font-medium truncate ml-4">{userData?.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#848E9C]">Name</span>
                    <span className="text-white font-medium">{userData?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#848E9C]">Role</span>
                    <span className="text-[#FCD535] font-medium capitalize">{userData?.role || "User"}</span>
                  </div>
                </div>
             </div>
          </div>

          {/* Right: Recent Activity Feed */}
          <div className="lg:col-span-2 bg-[#1E2329] border border-[#2B3139] rounded-xl shadow-md overflow-hidden">
            
            <div className="p-5 border-b border-[#2B3139] flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Recent Activity</h3>
              <Link href="/history" className="text-sm text-[#FCD535] hover:underline font-medium">View All →</Link>
            </div>

            <div className="divide-y divide-[#2B3139] max-h-[600px] overflow-y-auto">
              {transactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-[#5E6673]">
                  <span className="text-4xl mb-3">📭</span>
                  <p className="font-semibold text-[#848E9C]">No Activity Yet</p>
                  <p className="text-sm mt-1">Make your first deposit to get started!</p>
                </div>
              ) : (
                transactions.slice(0, 10).map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 hover:bg-[#0B0E11]/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                        item.type === "Deposit" ? "bg-[#0ECB81]/10" : "bg-[#F6465D]/10"
                      }`}>
                        {item.type === "Deposit" ? "📥" : "📤"}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{item.type}</p>
                        <p className="text-xs text-[#848E9C]">{safeFormatDate(item.createdAt)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-mono font-bold ${
                        item.type === "Deposit" ? "text-[#0ECB81]" : "text-[#F6465D]"
                      }`}>
                        {item.type === "Deposit" ? "+" : "-"}${Number(item.amount).toFixed(2)}
                      </p>
                      <StatusBadge status={item.status} />
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>

        </div>

      </div>
    </main>
  )
}