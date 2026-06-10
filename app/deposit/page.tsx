"use client"

import { useState } from "react"
import { addDoc, collection } from "firebase/firestore"
import { db } from "../lib/firebase"
import axios from "axios"

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

import { useEffect } from "react"

export default function DepositPage() {
  const [amount, setAmount] = useState("")
  const [wallet, setWallet] = useState("")
  const [hash, setHash] = useState("")
  const [proof, setProof] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)
  const [copied, setCopied] = useState(false)

  const walletAddress = "TTRUMgWMU1YK1h9RETLKLR1ZvVBuXG6EY5"

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDeposit = async () => {
    if (!amount || Number(amount) <= 0) {
      setToast({ message: "Please enter a valid amount!", type: "error" })
      return
    }
    if (!proof) {
      setToast({ message: "Please upload payment screenshot!", type: "error" })
      return
    }

    setIsSubmitting(true)

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}")

      // Upload to Cloudinary
      const formData = new FormData()
      formData.append("file", proof)
      formData.append("upload_preset", "kyc_upload")

      const upload = await axios.post(
        "https://api.cloudinary.com/v1_1/deqaaukdk/image/upload",
        formData
      )

      // Save to Firebase
      await addDoc(collection(db, "deposits"), {
        email: user.email || "",
        amount: Number(amount),
        wallet,
        txHash: hash,
        screenshot: upload.data.secure_url,
        coin: "USDT (TRC20)",
        status: "Pending",
        createdAt: new Date(),
      })

      setToast({ message: "Deposit submitted successfully!", type: "success" })

      // Reset form
      setAmount("")
      setWallet("")
      setHash("")
      setProof(null)
      
      // Reset file input visually
      const fileInput = document.getElementById("file-input") as HTMLInputElement
      if (fileInput) fileInput.value = ""

    } catch (error) {
      console.log(error)
      setToast({ message: "Deposit failed. Please try again.", type: "error" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#0B0E11] text-[#EAECEF] p-6 md:p-10 flex items-center justify-center">
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="w-full max-w-3xl bg-[#1E2329] border border-[#2B3139] rounded-xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-[#2B3139] bg-[#181A20]">
          <h1 className="text-2xl font-bold text-white">Deposit Crypto</h1>
          <p className="text-sm text-[#848E9C] mt-1">Transfer USDT to the address below and submit proof</p>
        </div>

        <div className="p-6 md:p-8 space-y-8">

          {/* Wallet Info Box */}
          <div className="bg-[#0B0E11] border border-[#2B3139] rounded-xl p-6 space-y-5">
            
            <div>
              <p className="text-xs text-[#848E9C] uppercase tracking-wider mb-1">Network</p>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                <span className="font-bold text-white">TRC20 - Tron Network</span>
              </div>
            </div>

            <div>
              <p className="text-xs text-[#848E9C] uppercase tracking-wider mb-2">Deposit Address</p>
              <div className="flex items-center gap-3 bg-[#181A20] border border-[#2B3139] p-3 rounded-lg">
                <p className="font-mono text-sm md:text-base text-[#FCD535] break-all flex-1">
                  {walletAddress}
                </p>
                <button 
                  onClick={copyAddress}
                  className="shrink-0 bg-[#2B3139] hover:bg-[#3B4149] text-white px-4 py-2 rounded-lg text-xs font-bold transition-all active:scale-95"
                >
                  {copied ? "✅ Copied" : "📋 Copy"}
                </button>
              </div>
              <p className="text-xs text-[#F6465D] mt-2 font-medium">⚠️ Transfer only USDT via TRC20 network. Other assets may be lost.</p>
            </div>

            {/* QR Code */}
            <div className="flex justify-center pt-2">
              <div className="bg-white p-3 rounded-xl">
                <img
                  src="/trc20.png"
                  alt="TRC20 QR"
                  className="w-44 h-44 object-contain"
                />
              </div>
            </div>

          </div>

          {/* Form Inputs */}
          <div className="space-y-5">

            <div>
              <label className="text-xs text-[#848E9C] uppercase tracking-wider block mb-2">Deposit Amount (USDT)</label>
              <input
                type="number"
                placeholder="e.g. 500"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-4 rounded-xl bg-[#0B0E11] border border-[#2B3139] outline-none text-white font-mono text-lg placeholder-[#5E6673] focus:border-[#FCD535] transition-colors"
              />
            </div>

            <div>
              <label className="text-xs text-[#848E9C] uppercase tracking-wider block mb-2">Your Wallet Address (Optional)</label>
              <input
                type="text"
                placeholder="From where you sent the funds"
                value={wallet}
                onChange={(e) => setWallet(e.target.value)}
                className="w-full p-4 rounded-xl bg-[#0B0E11] border border-[#2B3139] outline-none text-white font-mono text-sm placeholder-[#5E6673] focus:border-[#FCD535] transition-colors"
              />
            </div>

            <div>
              <label className="text-xs text-[#848E9C] uppercase tracking-wider block mb-2">Transaction Hash / TxID</label>
              <input
                type="text"
                placeholder="Paste your transaction hash here"
                value={hash}
                onChange={(e) => setHash(e.target.value)}
                className="w-full p-4 rounded-xl bg-[#0B0E11] border border-[#2B3139] outline-none text-white font-mono text-sm placeholder-[#5E6673] focus:border-[#FCD535] transition-colors"
              />
            </div>

            {/* Custom File Upload */}
            <div>
              <label className="text-xs text-[#848E9C] uppercase tracking-wider block mb-2">Upload Payment Screenshot</label>
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-[#2B3139] rounded-xl cursor-pointer hover:border-[#FCD535] transition-colors bg-[#0B0E11] group">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {proof ? (
                    <>
                      <span className="text-3xl mb-2">✅</span>
                      <p className="text-sm text-[#0ECB81] font-medium">{proof.name}</p>
                      <p className="text-xs text-[#848E9C] mt-1">Click to change</p>
                    </>
                  ) : (
                    <>
                      <span className="text-3xl mb-2 text-[#5E6673] group-hover:text-[#FCD535] transition-colors">📷</span>
                      <p className="text-sm text-[#848E9C] font-medium">Click to upload screenshot</p>
                      <p className="text-xs text-[#5E6673] mt-1">PNG, JPG up to 5MB</p>
                    </>
                  )}
                </div>
                <input 
                  id="file-input"
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => setProof(e.target.files?.[0] || null)}
                />
              </label>
            </div>

          </div>

          {/* Submit Button */}
          <button
            onClick={handleDeposit}
            disabled={isSubmitting}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
              isSubmitting 
                ? "bg-[#2B3139] text-[#848E9C] cursor-not-allowed" 
                : "bg-[#FCD535] text-black hover:bg-yellow-300 active:scale-[0.98] shadow-lg"
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-[#848E9C]/30 border-t-[#848E9C] rounded-full animate-spin"></div>
                Processing...
              </>
            ) : (
              "Submit Deposit Request"
            )}
          </button>

          {/* Alternative Methods */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#2B3139]">
            <button
              onClick={() => window.location.href = "/support"}
              className="p-4 rounded-xl bg-[#0B0E11] border border-[#2B3139] text-[#0ECB81] font-bold text-sm hover:bg-[#181A20] transition-colors"
            >
              💵 Deposit via UPI
            </button>
            <button
              onClick={() => window.location.href = "/support"}
              className="p-4 rounded-xl bg-[#0B0E11] border border-[#2B3139] text-[#848E9C] font-bold text-sm hover:bg-[#181A20] transition-colors"
            >
              🏦 Deposit via Bank
            </button>
          </div>

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