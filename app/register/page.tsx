"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { auth, db } from "../lib/firebase"
import Link from "next/link"

// Toast Component
const Toast = ({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) => {
  useState(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  })

  return (
    <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl border backdrop-blur-md flex items-center gap-3 animate-slide-in ${
      type === "success" ? "bg-green-900/90 border-green-500/50 text-green-200" : "bg-red-900/90 border-red-500/50 text-red-200"
    }`}>
      <span className="text-xl">{type === "success" ? "✅" : "❌"}</span>
      <span className="font-semibold">{message}</span>
    </div>
  )
}

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)

  const handleRegister = async () => {
    if (!name || !email || !password) {
      setToast({ message: "Please fill all the fields!", type: "error" })
      return
    }

    if (password.length < 6) {
      setToast({ message: "Password must be at least 6 characters!", type: "error" })
      return
    }

    setLoading(true)

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      
      await setDoc(doc(db, "users", email), {
        uid: userCredential.user.uid,
        name,
        email,
        balance: 0,
        role: "user",
        kycStatus: "Pending",
        createdAt: new Date(),
      })

      setToast({ message: "Account created successfully! Redirecting...", type: "success" })

      // Small delay to show toast before redirecting
      setTimeout(() => {
        router.push("/login")
      }, 1500)

    } catch (error: any) {
      console.log("REGISTER ERROR:", error)
      
      // Friendly Firebase Error Messages
      if (error.code === "auth/email-already-in-use") {
        setToast({ message: "This email is already registered!", type: "error" })
      } else if (error.code === "auth/invalid-email") {
        setToast({ message: "Please enter a valid email address!", type: "error" })
      } else if (error.code === "auth/weak-password") {
        setToast({ message: "Password is too weak. Use at least 6 characters.", type: "error" })
      } else {
        setToast({ message: "Registration failed. Please try again.", type: "error" })
      }
    } finally {
      setLoading(false)
    }
  }

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !loading) {
      handleRegister()
    }
  }

  return (
    <main className="min-h-screen bg-[#0B0E11] flex items-center justify-center p-6 relative">
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#181A20_0%,#0B0E11_60%)] pointer-events-none" />

      <div className="relative z-10 w-full max-w-[420px]">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-[#848E9C] text-sm">Register to start your trading journey</p>
        </div>

        {/* Register Card */}
        <div className="bg-[#1E2329] border border-[#2B3139] rounded-xl p-8 shadow-2xl">
          
          <div className="space-y-5">
            
            <div>
              <label className="text-xs text-[#848E9C] uppercase tracking-wider block mb-2">Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full bg-[#0B0E11] border border-[#2B3139] rounded-lg p-3.5 outline-none text-white placeholder-[#5E6673] focus:border-[#FCD535] transition-colors text-sm"
              />
            </div>

            <div>
              <label className="text-xs text-[#848E9C] uppercase tracking-wider block mb-2">Email Address</label>
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full bg-[#0B0E11] border border-[#2B3139] rounded-lg p-3.5 outline-none text-white placeholder-[#5E6673] focus:border-[#FCD535] transition-colors text-sm"
              />
            </div>

            <div>
              <label className="text-xs text-[#848E9C] uppercase tracking-wider block mb-2">Password</label>
              <input
                type="password"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full bg-[#0B0E11] border border-[#2B3139] rounded-lg p-3.5 outline-none text-white placeholder-[#5E6673] focus:border-[#FCD535] transition-colors text-sm"
              />
            </div>

            {/* Register Button */}
            <button
              onClick={handleRegister}
              disabled={loading}
              className={`w-full py-3.5 rounded-lg font-bold text-base transition-all flex items-center justify-center gap-2 mt-2 ${
                loading 
                  ? "bg-[#2B3139] text-[#848E9C] cursor-not-allowed" 
                  : "bg-[#FCD535] text-black hover:bg-yellow-300 active:scale-[0.98] shadow-lg"
              }`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-[#848E9C]/30 border-t-[#848E9C] rounded-full animate-spin"></div>
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </button>

          </div>

          {/* Links */}
          <div className="flex items-center justify-center mt-6 text-sm">
            <span className="text-[#848E9C]">Already have an account?</span>
            <a href="/login" className="text-[#FCD535] hover:text-yellow-300 font-medium transition-colors ml-2">
              Log In
            </a>
          </div>

        </div>

        {/* Footer Note */}
        <p className="text-center text-[#5E6673] text-xs mt-8">
          By registering, you agree to our Terms of Service and Privacy Policy.
        </p>

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