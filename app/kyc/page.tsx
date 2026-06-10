"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import {
  addDoc,
  collection,
  query,
  where,
  getDocs
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

export default function KYCPage() {
  const [fullName, setFullName] = useState("")
  const [documentType, setDocumentType] = useState("Aadhaar Card")
  const [idNumber, setIdNumber] = useState("")
  const [address, setAddress] = useState("")
  const [dob, setDob] = useState("")
  const [documentImage, setDocumentImage] = useState<File | null>(null)
  const [selfieImage, setSelfieImage] = useState<File | null>(null)
  
  const [kycStatus, setKycStatus] = useState("")
  const [loadingStatus, setLoadingStatus] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)

  useEffect(() => {
    const loadStatus = async () => {
      const user = JSON.parse(localStorage.getItem("user") || "{}")
      if (!user.email) {
        setLoadingStatus(false)
        return
      }

      try {
        const q = query(collection(db, "kycData"), where("email", "==", user.email))
        const snap = await getDocs(q)

        if (!snap.empty) {
          const approvedDoc = snap.docs.find((doc) => doc.data().status === "Approved")
          if (approvedDoc) {
            setKycStatus("Approved")
          } else {
            setKycStatus(snap.docs[0].data().status || "Pending")
          }
        }
      } catch (error) {
        console.error("Error fetching KYC status:", error)
      } finally {
        setLoadingStatus(false)
      }
    }
    loadStatus()
  }, [])

  const handleKYC = async () => {
    if (!fullName || !idNumber || !address || !dob) {
      setToast({ message: "Please fill all the required fields!", type: "error" })
      return
    }
    if (!documentImage || !selfieImage) {
      setToast({ message: "Please upload both Document and Selfie!", type: "error" })
      return
    }

    setIsSubmitting(true)

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}")

      // Document Upload
      const formData1 = new FormData()
      formData1.append("file", documentImage)
      formData1.append("upload_preset", "kyc_upload")
      const upload1 = await axios.post("https://api.cloudinary.com/v1_1/deqaaukdk/image/upload", formData1)

      // Selfie Upload
      const formData2 = new FormData()
      formData2.append("file", selfieImage)
      formData2.append("upload_preset", "kyc_upload")
      const upload2 = await axios.post("https://api.cloudinary.com/v1_1/deqaaukdk/image/upload", formData2)

      // Save KYC
      await addDoc(collection(db, "kycData"), {
        email: user.email || "",
        fullName,
        documentType,
        idNumber,
        address,
        dob,
        documentImage: upload1.data.secure_url,
        selfieImage: upload2.data.secure_url,
        status: "Pending",
        createdAt: new Date(),
      })

      setToast({ message: "KYC Submitted Successfully!", type: "success" })
      setKycStatus("Pending") // Switch to pending screen immediately

    } catch (error) {
      console.log(error)
      setToast({ message: "KYC Submit Failed. Please try again.", type: "error" })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Loading State
  if (loadingStatus) {
    return (
      <main className="min-h-screen bg-[#0B0E11] flex items-center justify-center">
        <div className="flex flex-col items-center text-[#848E9C]">
          <div className="w-12 h-12 border-4 border-[#2B3139] border-t-[#FCD535] rounded-full animate-spin mb-4"></div>
          <p className="font-semibold">Loading Verification Status...</p>
        </div>
      </main>
    )
  }

  // Approved State
  if (kycStatus === "Approved") {
    return (
      <main className="min-h-screen bg-[#0B0E11] flex items-center justify-center p-6">
        <div className="w-full max-w-lg bg-[#1E2329] border border-[#0ECB81]/30 rounded-xl p-10 text-center shadow-2xl">
          <div className="w-20 h-20 rounded-full bg-[#0ECB81]/10 border-2 border-[#0ECB81] flex items-center justify-center text-4xl mx-auto mb-6">
            ✅
          </div>
          <h1 className="text-3xl font-bold text-[#0ECB81] mb-3">Verified</h1>
          <p className="text-[#848E9C] mb-8">Your identity has been verified successfully. You now have full access to all trading and withdrawal features.</p>
          
          <div className="bg-[#0B0E11] border border-[#2B3139] rounded-lg p-5 text-left space-y-3 mb-8">
            <div className="flex justify-between text-sm">
              <span className="text-[#848E9C]">Verification Status</span>
              <span className="text-[#0ECB81] font-bold">Level 3 (Fully Verified)</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#848E9C]">Deposit Limit</span>
              <span className="text-white font-medium">Unlimited</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#848E9C]">Withdrawal Limit</span>
              <span className="text-white font-medium">100 BTC / day</span>
            </div>
          </div>

          <a href="/dashboard" className="block w-full bg-[#FCD535] text-black font-bold py-3 rounded-lg hover:bg-yellow-300 transition-all">
            Return to Dashboard
          </a>
        </div>
      </main>
    )
  }

  // Pending State
  if (kycStatus === "Pending") {
    return (
      <main className="min-h-screen bg-[#0B0E11] flex items-center justify-center p-6">
        <div className="w-full max-w-lg bg-[#1E2329] border border-[#FCD535]/30 rounded-xl p-10 text-center shadow-2xl">
          <div className="w-20 h-20 rounded-full bg-[#FCD535]/10 border-2 border-[#FCD535] flex items-center justify-center text-4xl mx-auto mb-6 animate-pulse">
            ⏳
          </div>
          <h1 className="text-3xl font-bold text-[#FCD535] mb-3">Under Review</h1>
          <p className="text-[#848E9C] mb-8">Your documents are being reviewed. This process usually takes a few minutes. You will be notified once verified.</p>
          
          <div className="bg-[#0B0E11] border border-[#2B3139] rounded-lg p-5 text-left space-y-3 mb-8">
            <div className="flex justify-between text-sm">
              <span className="text-[#848E9C]">Current Status</span>
              <span className="text-[#FCD535] font-bold">Processing</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#848E9C]">Estimated Time</span>
              <span className="text-white font-medium">15 - 30 Minutes</span>
            </div>
          </div>

          <a href="/dashboard" className="block w-full bg-[#2B3139] text-white font-bold py-3 rounded-lg hover:bg-[#3B4149] transition-all">
            Back to Dashboard
          </a>
        </div>
      </main>
    )
  }

  // Rejected State
  if (kycStatus === "Rejected") {
    return (
      <main className="min-h-screen bg-[#0B0E11] flex items-center justify-center p-6">
        <div className="w-full max-w-lg bg-[#1E2329] border border-[#F6465D]/30 rounded-xl p-10 text-center shadow-2xl">
          <div className="w-20 h-20 rounded-full bg-[#F6465D]/10 border-2 border-[#F6465D] flex items-center justify-center text-4xl mx-auto mb-6">
            ❌
          </div>
          <h1 className="text-3xl font-bold text-[#F6465D] mb-3">Verification Failed</h1>
          <p className="text-[#848E9C] mb-8">We couldn't verify your identity with the provided documents. This might be due to blurry images or mismatched information.</p>
          
          <div className="bg-[#0B0E11] border border-[#2B3139] rounded-lg p-5 text-left space-y-3 mb-8">
            <div className="flex justify-between text-sm">
              <span className="text-[#848E9C]">Reason</span>
              <span className="text-[#F6465D] font-bold">Document Not Readable</span>
            </div>
          </div>

          <button 
            onClick={() => setKycStatus("")} 
            className="block w-full bg-[#FCD535] text-black font-bold py-3 rounded-lg hover:bg-yellow-300 transition-all"
          >
            Try Again
          </button>
        </div>
      </main>
    )
  }

  // Default: KYC Form
  return (
    <main className="min-h-screen bg-[#0B0E11] text-[#EAECEF] p-6 md:p-10 flex items-center justify-center">
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="w-full max-w-3xl bg-[#1E2329] border border-[#2B3139] rounded-xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-[#2B3139] bg-[#181A20]">
          <h1 className="text-2xl font-bold text-white">Identity Verification</h1>
          <p className="text-sm text-[#848E9C] mt-1">Complete KYC to unlock deposits, trading, and withdrawals</p>
        </div>

        <div className="p-6 md:p-8 space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-xs text-[#848E9C] uppercase tracking-wider block mb-2">Full Name (As per ID)</label>
              <input
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full p-3.5 rounded-xl bg-[#0B0E11] border border-[#2B3139] outline-none text-white placeholder-[#5E6673] focus:border-[#FCD535] transition-colors text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-[#848E9C] uppercase tracking-wider block mb-2">Document Type</label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="w-full p-3.5 rounded-xl bg-[#0B0E11] border border-[#2B3139] outline-none text-white focus:border-[#FCD535] transition-colors text-sm appearance-none"
              >
                <option>Aadhaar Card</option>
                <option>PAN Card</option>
                <option>Driving Licence</option>
                <option>Passport</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-xs text-[#848E9C] uppercase tracking-wider block mb-2">Document Number</label>
              <input
                type="text"
                placeholder="e.g. XXXX-XXXX-XXXX"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                className="w-full p-3.5 rounded-xl bg-[#0B0E11] border border-[#2B3139] outline-none text-white font-mono placeholder-[#5E6673] focus:border-[#FCD535] transition-colors text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-[#848E9C] uppercase tracking-wider block mb-2">Date of Birth</label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full p-3.5 rounded-xl bg-[#0B0E11] border border-[#2B3139] outline-none text-white focus:border-[#FCD535] transition-colors text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-[#848E9C] uppercase tracking-wider block mb-2">Residential Address</label>
            <input
              type="text"
              placeholder="Street, City, State, ZIP"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-3.5 rounded-xl bg-[#0B0E11] border border-[#2B3139] outline-none text-white placeholder-[#5E6673] focus:border-[#FCD535] transition-colors text-sm"
            />
          </div>

          {/* Custom File Uploads */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-xs text-[#848E9C] uppercase tracking-wider block mb-2">Upload Document (Front)</label>
              <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-[#2B3139] rounded-xl cursor-pointer hover:border-[#FCD535] transition-colors bg-[#0B0E11] group">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {documentImage ? (
                    <>
                      <span className="text-2xl mb-1">📄</span>
                      <p className="text-sm text-[#0ECB81] font-medium px-4 text-center truncate w-full">{documentImage.name}</p>
                      <p className="text-xs text-[#848E9C] mt-1">Click to change</p>
                    </>
                  ) : (
                    <>
                      <span className="text-2xl mb-1 text-[#5E6673] group-hover:text-[#FCD535] transition-colors">🪪</span>
                      <p className="text-sm text-[#848E9C] font-medium">Upload ID Document</p>
                      <p className="text-xs text-[#5E6673] mt-1">PNG, JPG up to 5MB</p>
                    </>
                  )}
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => setDocumentImage(e.target.files?.[0] || null)} />
              </label>
            </div>

            <div>
              <label className="text-xs text-[#848E9C] uppercase tracking-wider block mb-2">Upload Selfie (Holding ID)</label>
              <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-[#2B3139] rounded-xl cursor-pointer hover:border-[#FCD535] transition-colors bg-[#0B0E11] group">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {selfieImage ? (
                    <>
                      <span className="text-2xl mb-1">🤳</span>
                      <p className="text-sm text-[#0ECB81] font-medium px-4 text-center truncate w-full">{selfieImage.name}</p>
                      <p className="text-xs text-[#848E9C] mt-1">Click to change</p>
                    </>
                  ) : (
                    <>
                      <span className="text-2xl mb-1 text-[#5E6673] group-hover:text-[#FCD535] transition-colors">📸</span>
                      <p className="text-sm text-[#848E9C] font-medium">Upload Selfie</p>
                      <p className="text-xs text-[#5E6673] mt-1">Face must be clearly visible</p>
                    </>
                  )}
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => setSelfieImage(e.target.files?.[0] || null)} />
              </label>
            </div>
          </div>

          <div className="bg-[#0B0E11] border border-[#2B3139] rounded-lg p-4 text-xs text-[#848E9C] space-y-1">
            <p>⚠️ Make sure your document is not expired.</p>
            <p>⚠️ All four corners of the document must be visible.</p>
            <p>⚠️ Selfie must clearly show your face and the ID document.</p>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleKYC}
            disabled={isSubmitting}
            className={`w-full py-4 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 ${
              isSubmitting 
                ? "bg-[#2B3139] text-[#848E9C] cursor-not-allowed" 
                : "bg-[#FCD535] text-black hover:bg-yellow-300 active:scale-[0.98] shadow-lg"
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-[#848E9C]/30 border-t-[#848E9C] rounded-full animate-spin"></div>
                Uploading & Verifying...
              </>
            ) : (
              "Submit Verification"
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