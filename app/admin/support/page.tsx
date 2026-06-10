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

// Toast Notification Component
const Toast = ({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl border backdrop-blur-md flex items-center gap-3 animate-slide-in ${
      type === "success" ? "bg-green-900/90 border-green-500/50 text-green-200" : "bg-red-900/90 border-red-500/50 text-red-200"
    }`}>
      <span className="text-xl">{type === "success" ? "✅" : "❌"}</span>
      <span className="font-semibold">{message}</span>
    </div>
  )
}

export default function SupportPage() {
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"ALL" | "Pending" | "Answered">("ALL")
  const [replies, setReplies] = useState<Record<string, string>>({}) // Individual reply state for each message
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)

  useEffect(() => {
    loadMessages()
  }, [])

  const loadMessages = async () => {
    setLoading(true)
    try {
      const snap = await getDocs(collection(db, "supportmessages"))
      const data = snap.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data(),
      }))
      // Show newest messages first
      setMessages(data.reverse())
    } catch (error) {
      console.error("Error fetching messages:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleReplyChange = (id: string, value: string) => {
    setReplies(prev => ({ ...prev, [id]: value }))
  }

  const sendReply = async (id: string) => {
    const replyText = replies[id]?.trim()
    
    if (!replyText) {
      setToast({ message: "Please write a reply first!", type: "error" })
      return
    }

    try {
      await updateDoc(doc(db, "supportmessages", id), {
        adminReply: replyText,
        status: "Answered",
      })
      
      // Clear the specific input field
      setReplies(prev => ({ ...prev, [id]: "" }))
      setToast({ message: "Reply sent successfully!", type: "success" })
      loadMessages()
    } catch (error) {
      setToast({ message: "Failed to send reply.", type: "error" })
    }
  }

  // Filter Logic
  const filteredMessages = messages.filter((item) => {
    const status = item.status || "Pending"
    if (filter === "ALL") return true
    return status === filter
  })

  // Stats calculation
  const pendingCount = messages.filter(t => !t.status || t.status === "Pending").length
  const answeredCount = messages.filter(t => t.status === "Answered").length

  return (
    <main className="min-h-screen bg-[#0b0e11] text-white flex">
      <AdminSidebar />

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex-1 p-6 md:p-10 overflow-y-auto">
        {/* Header & Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white">
              Customer <span className="text-cyan-400">Support</span>
            </h1>
            <p className="text-gray-500 mt-1 text-sm">Manage and respond to user queries</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {["ALL", "Pending", "Answered"].map((f) => (
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
          <div className="bg-gradient-to-br from-[#1e2329] to-[#181a20] p-5 rounded-xl border border-gray-800 shadow-md">
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Total Tickets</p>
            <p className="text-2xl font-bold text-white">{messages.length}</p>
          </div>
          <div className="bg-gradient-to-br from-[#1e2329] to-[#181a20] p-5 rounded-xl border border-yellow-900/30 shadow-md">
            <p className="text-yellow-500 text-xs uppercase tracking-wider mb-1">Pending</p>
            <p className="text-2xl font-bold text-yellow-400">{pendingCount}</p>
          </div>
          <div className="bg-gradient-to-br from-[#1e2329] to-[#181a20] p-5 rounded-xl border border-green-900/30 shadow-md">
            <p className="text-green-500 text-xs uppercase tracking-wider mb-1">Answered</p>
            <p className="text-2xl font-bold text-green-400">{answeredCount}</p>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mb-4"></div>
            <p className="font-semibold">Loading Tickets...</p>
          </div>
        ) : (
          /* Messages List */
          <div className="space-y-6">
            {filteredMessages.length === 0 ? (
              <div className="text-center py-20 text-gray-600">
                <span className="text-5xl mb-3 block">📩</span>
                <p className="font-semibold text-gray-400">No Support Tickets Found</p>
                <p className="text-sm text-gray-600 mt-1">All clear! Waiting for new queries...</p>
              </div>
            ) : (
              filteredMessages.map((item) => {
                const status = item.status || "Pending"
                return (
                  <div
                    key={item.id}
                    className="bg-[#1e2329] border border-gray-800 rounded-2xl p-6 shadow-xl shadow-black/20 hover:border-gray-700 transition-colors"
                  >
                    {/* User Info Header */}
                    <div className="flex items-center justify-between mb-5 border-b border-gray-800 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-cyan-900/30 border border-cyan-800/50 flex items-center justify-center text-cyan-400 font-bold text-sm">
                          {item.name?.substring(0, 2).toUpperCase() || "U"}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white">{item.name || "Unknown User"}</h3>
                          <p className="text-sm text-gray-500">{item.email || "No email"}</p>
                        </div>
                      </div>
                      {status === "Answered" ? (
                        <span className="bg-green-900/40 text-green-400 border border-green-800/50 px-3 py-1 rounded-full text-xs font-bold">✅ Answered</span>
                      ) : (
                        <span className="bg-yellow-900/40 text-yellow-400 border border-yellow-800/50 px-3 py-1 rounded-full text-xs font-bold animate-pulse">⏳ Pending</span>
                      )}
                    </div>

                    <div className="space-y-4">
                      {/* User's Message (Chat Bubble Style) */}
                      <div className="flex justify-start">
                        <div className="bg-[#0b0e11] border border-gray-800 rounded-2xl rounded-bl-none p-4 max-w-[85%] md:max-w-[70%]">
                          <p className="text-gray-300 text-sm leading-relaxed">{item.message}</p>
                        </div>
                      </div>

                      {/* Admin's Reply (If exists) */}
                      {item.adminReply && (
                        <div className="flex justify-end">
                          <div className="bg-cyan-900/20 border border-cyan-800/30 rounded-2xl rounded-br-none p-4 max-w-[85%] md:max-w-[70%]">
                            <p className="text-cyan-400 text-xs font-bold mb-1">Admin Reply</p>
                            <p className="text-gray-200 text-sm leading-relaxed">{item.adminReply}</p>
                          </div>
                        </div>
                      )}

                      {/* Reply Input (Only if Pending) */}
                      {status === "Pending" && (
                        <div className="mt-4 pt-4 border-t border-gray-800">
                          <textarea
                            placeholder="Type your reply here..."
                            value={replies[item.id] || ""}
                            onChange={(e) => handleReplyChange(item.id, e.target.value)}
                            className="w-full h-28 bg-[#0b0e11] border border-gray-800 rounded-xl p-4 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors resize-none"
                          />
                          <div className="flex justify-end mt-2">
                            <button
                              onClick={() => sendReply(item.id)}
                              className="bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg hover:shadow-cyan-900/40 active:scale-95 flex items-center gap-2"
                            >
                              ✉️ Send Reply
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>

      {/* Tailwind Animation for Toast */}
      <style jsx>{`
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out forwards;
        }
      `}</style>
    </main>
  )
}