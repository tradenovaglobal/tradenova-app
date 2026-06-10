"use client"

import { useEffect, useState, useRef } from "react"
import {
  addDoc,
  collection,
  getDocs,
} from "firebase/firestore"
import { db } from "../lib/firebase"

// Toast Component
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
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const loadMessages = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}")
      const snap = await getDocs(collection(db, "supportmessages"))
      
      const data = snap.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((msg: any) => msg.email === user.email)
        // Sort by oldest first for chat view
        .sort((a: any, b: any) => {
          const timeA = a.createdAt?.seconds || 0
          const timeB = b.createdAt?.seconds || 0
          return timeA - timeB
        })

      setMessages(data)
    } catch (error) {
      console.error("Error loading messages:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMessages()
  }, [])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = async () => {
    if (!message.trim()) {
      setToast({ message: "Please type a message first!", type: "error" })
      return
    }

    setIsSending(true)
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}")
      
      await addDoc(collection(db, "supportmessages"), {
        name: user.name || "User",
        email: user.email || "",
        userId: user.uid || "TNX-USER",
        message: message.trim(),
        status: "Pending",
        createdAt: new Date(),
      })

      setMessage("")
      setToast({ message: "Message sent successfully!", type: "success" })
      await loadMessages() // Refresh messages
    } catch (error) {
      console.error("Error sending message:", error)
      setToast({ message: "Failed to send message.", type: "error" })
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isSending) {
      sendMessage()
    }
  }

  return (
    <main className="min-h-screen bg-[#0B0E11] text-[#EAECEF] flex flex-col">
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Chat Header */}
      <div className="bg-[#1E2329] border-b border-[#2B3139] px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#FCD535] flex items-center justify-center text-black font-bold text-sm">CS</div>
          <div>
            <h1 className="font-bold text-white text-lg">Customer Support</h1>
            <p className="text-xs text-[#0ECB81] flex items-center gap-1"><span className="w-2 h-2 bg-[#0ECB81] rounded-full"></span> Online - Typically replies in minutes</p>
          </div>
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 max-w-3xl mx-auto w-full">
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#848E9C]">
            <div className="w-12 h-12 border-4 border-[#2B3139] border-t-[#FCD535] rounded-full animate-spin mb-4"></div>
            <p className="font-semibold">Loading Chat History...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#5E6673]">
            <span className="text-5xl mb-3">💬</span>
            <p className="font-semibold text-[#848E9C]">No Messages Yet</p>
            <p className="text-sm mt-1">Start a conversation with our support team below</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className="space-y-3">
                
                {/* User Message Bubble (Right Side) */}
                <div className="flex justify-end">
                  <div className="bg-[#FCD535] text-black rounded-xl rounded-br-sm max-w-[80%] md:max-w-[60%] p-4 shadow-md">
                    <p className="text-sm font-medium leading-relaxed">{msg.message}</p>
                  </div>
                </div>

                {/* Admin Reply Bubble (Left Side) */}
                {msg.adminReply && (
                  <div className="flex justify-start">
                    <div className="bg-[#2B3139] text-white rounded-xl rounded-bl-sm max-w-[80%] md:max-w-[60%] p-4 shadow-md border border-[#3B4149]">
                      <p className="text-xs text-[#0ECB81] font-bold mb-1 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-[#0ECB81] rounded-full"></span> Support Agent
                      </p>
                      <p className="text-sm leading-relaxed text-[#EAECEF]">{msg.adminReply}</p>
                    </div>
                  </div>
                )}

              </div>
            ))}
            {/* Dummy div to scroll to */}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Chat Input Area */}
      <div className="bg-[#1E2329] border-t border-[#2B3139] p-4 sticky bottom-0 z-40">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <input
            type="text"
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 bg-[#0B0E11] border border-[#2B3139] rounded-lg p-3.5 outline-none text-white placeholder-[#5E6673] focus:border-[#FCD535] transition-colors text-sm"
          />
          <button
            onClick={sendMessage}
            disabled={isSending}
            className={`px-6 py-3.5 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${
              isSending 
                ? "bg-[#2B3139] text-[#848E9C] cursor-not-allowed" 
                : "bg-[#FCD535] text-black hover:bg-yellow-300 active:scale-95"
            }`}
          >
            {isSending ? (
              <div className="w-5 h-5 border-2 border-[#848E9C]/30 border-t-[#848E9C] rounded-full animate-spin"></div>
            ) : (
              "Send ➤"
            )}
          </button>
        </div>
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