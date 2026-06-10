"use client"

import { useEffect, useState } from "react"
import {
  collection,
  getDocs,
  doc,
  updateDoc
} from "firebase/firestore"
import { db } from "../../lib/firebase"
import AdminSidebar from "../../components/AdminSidebar"

export default function KYCPage() {
  const [kycData, setKycData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"ALL" | "Pending" | "Approved" | "Rejected">("ALL")

  useEffect(() => {
    loadKYC()
  }, [])

  const loadKYC = async () => {
    setLoading(true)
    try {
      const snapshot = await getDocs(collection(db, "kycData"))
      const list: any[] = []
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() })
      })
      setKycData(list)
    } catch (error) {
      console.error("Error fetching KYC:", error)
    } finally {
      setLoading(false)
    }
  }

  const approveKYC = async (item: any) => {
    await updateDoc(doc(db, "kycData", item.id), { status: "Approved" })
    loadKYC()
  }

  const rejectKYC = async (item: any) => {
    await updateDoc(doc(db, "kycData", item.id), { status: "Rejected" })
    loadKYC()
  }

  // Filter Logic
  const filteredData = kycData.filter((item) => {
    const status = item.status || "Pending"
    if (filter === "ALL") return true
    return status === filter
  })

  // Stats calculation
  const pendingCount = kycData.filter(t => !t.status || t.status === "Pending").length
  const approvedCount = kycData.filter(t => t.status === "Approved").length
  const rejectedCount = kycData.filter(t => t.status === "Rejected").length

  return (
    <main className="min-h-screen bg-[#0b0e11] text-white flex">
      <AdminSidebar />

      <div className="flex-1 p-6 md:p-10 overflow-y-auto">
        {/* Header & Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white">
              KYC <span className="text-cyan-400">Verification</span>
            </h1>
            <p className="text-gray-500 mt-1 text-sm">Review and manage user identity documents</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {["ALL", "Pending", "Approved", "Rejected"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  filter === f 
                    ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 shadow-lg shadow-cyan-500/10" 
                    : "bg-[#1e2329] text-gray-400 border border-transparent hover:bg-[#2b3139]"
                }`}
              >
                {f} {f === "Pending" && pendingCount > 0 && `(${pendingCount})`}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-[#1e2329] to-[#181a20] p-5 rounded-xl border border-yellow-900/30 shadow-md">
            <p className="text-yellow-500 text-xs uppercase tracking-wider mb-1">Pending</p>
            <p className="text-2xl font-bold text-yellow-400">{pendingCount}</p>
          </div>
          <div className="bg-gradient-to-br from-[#1e2329] to-[#181a20] p-5 rounded-xl border border-green-900/30 shadow-md">
            <p className="text-green-500 text-xs uppercase tracking-wider mb-1">Approved</p>
            <p className="text-2xl font-bold text-green-400">{approvedCount}</p>
          </div>
          <div className="bg-gradient-to-br from-[#1e2329] to-[#181a20] p-5 rounded-xl border border-red-900/30 shadow-md">
            <p className="text-red-500 text-xs uppercase tracking-wider mb-1">Rejected</p>
            <p className="text-2xl font-bold text-red-400">{rejectedCount}</p>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mb-4"></div>
            <p className="font-semibold">Loading KYC Data...</p>
          </div>
        ) : (
          /* KYC Cards Grid */
          <div className="grid gap-6">
            {filteredData.length === 0 ? (
              <div className="text-center py-20 text-gray-600">
                <span className="text-5xl mb-3 block">🛡️</span>
                <p className="font-semibold text-gray-400">No KYC Requests Found</p>
                <p className="text-sm text-gray-600 mt-1">Waiting for users to submit documents...</p>
              </div>
            ) : (
              filteredData.map((item) => {
                const status = item.status || "Pending"
                return (
                  <div
                    key={item.id}
                    className="bg-[#1e2329] border border-gray-800 rounded-2xl p-6 shadow-xl shadow-black/20 hover:border-gray-700 transition-colors"
                  >
                    <div className="grid md:grid-cols-3 gap-8">
                      
                      {/* User Details Section */}
                      <div className="md:col-span-1">
                        <div className="flex items-center justify-between mb-5">
                          <h3 className="text-lg font-bold text-white">{item.fullName || "Unknown"}</h3>
                          {status === "Approved" && (
                            <span className="bg-green-900/40 text-green-400 border border-green-800/50 px-3 py-1 rounded-full text-xs font-bold">✅ Approved</span>
                          )}
                          {status === "Rejected" && (
                            <span className="bg-red-900/40 text-red-400 border border-red-800/50 px-3 py-1 rounded-full text-xs font-bold">❌ Rejected</span>
                          )}
                          {status === "Pending" && (
                            <span className="bg-yellow-900/40 text-yellow-400 border border-yellow-800/50 px-3 py-1 rounded-full text-xs font-bold animate-pulse">⏳ Pending</span>
                          )}
                        </div>

                        <div className="space-y-3 text-sm">
                          <div>
                            <p className="text-gray-500 text-xs uppercase tracking-wider">Email Address</p>
                            <p className="text-gray-200 font-medium">{item.email || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs uppercase tracking-wider">Document Type</p>
                            <p className="text-gray-200 font-medium">{item.documentType || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs uppercase tracking-wider">ID Number</p>
                            <p className="text-gray-200 font-mono font-medium">{item.idNumber || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs uppercase tracking-wider">Date of Birth</p>
                            <p className="text-gray-200 font-medium">{item.dob || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs uppercase tracking-wider">Address</p>
                            <p className="text-gray-200 font-medium leading-relaxed">{item.address || "N/A"}</p>
                          </div>
                        </div>
                      </div>

                      {/* Images Section */}
                      <div className="md:col-span-2 grid grid-cols-2 gap-6">
                        <div className="flex flex-col">
                          <p className="text-gray-400 text-xs uppercase tracking-wider font-bold mb-2">Document Image</p>
                          <div className="relative group flex-1 bg-[#0b0e11] rounded-xl overflow-hidden border border-gray-800">
                            <img
                              src={item.documentImage}
                              alt="Document"
                              className="w-full h-full object-cover absolute inset-0 transition-transform group-hover:scale-105"
                            />
                          </div>
                          <a
                            href={item.documentImage}
                            target="_blank"
                            className="block mt-2 text-cyan-500 hover:text-cyan-400 text-xs font-semibold transition-colors text-center"
                          >
                            🔍 View Full Image
                          </a>
                        </div>

                        <div className="flex flex-col">
                          <p className="text-gray-400 text-xs uppercase tracking-wider font-bold mb-2">Selfie Image</p>
                          <div className="relative group flex-1 bg-[#0b0e11] rounded-xl overflow-hidden border border-gray-800">
                            <img
                              src={item.selfieImage}
                              alt="Selfie"
                              className="w-full h-full object-cover absolute inset-0 transition-transform group-hover:scale-105"
                            />
                          </div>
                          <a
                            href={item.selfieImage}
                            target="_blank"
                            className="block mt-2 text-cyan-500 hover:text-cyan-400 text-xs font-semibold transition-colors text-center"
                          >
                            🔍 View Full Selfie
                          </a>
                        </div>
                      </div>

                    </div>

                    {/* Action Buttons (Only for Pending) */}
                    {status === "Pending" && (
                      <div className="flex gap-3 mt-6 pt-5 border-t border-gray-800 justify-end">
                        <button
                          onClick={() => rejectKYC(item)}
                          className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg hover:shadow-red-900/40 active:scale-95 flex items-center gap-2"
                        >
                          ❌ Reject
                        </button>
                        <button
                          onClick={() => approveKYC(item)}
                          className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg hover:shadow-green-900/40 active:scale-95 flex items-center gap-2"
                        >
                          ✅ Approve
                        </button>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>
    </main>
  )
}