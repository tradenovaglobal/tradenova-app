"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signInWithEmailAndPassword } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "../lib/firebase"

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

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)

  const handleLogin = async () => {
    if (!email || !password) {
      setToast({ message: "Please enter both email and password!", type: "error" })
      return
    }

    setIsLoading(true)

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      const userDoc = await getDoc(doc(db, "users", user.email!))

      if (!userDoc.exists()) {
        setToast({ message: "User data not found in database!", type: "error" })
        setIsLoading(false)
        return
      }

      const userData = userDoc.data()

      // Save to localStorage
      localStorage.setItem("user", JSON.stringify(userData))
      localStorage.setItem("loginTime", new Date().toLocaleString())
      localStorage.setItem("userName", userData.name)

      setToast({ message: "Login Successful! Redirecting...", type: "success" })

      // Small delay to show toast before redirecting
      setTimeout(() => {
        if (userData.role === "admin") {
          router.push("/admin")
        } else {
          router.push("/dashboard")
        }
      }, 1000)

    } catch (error: any) {
      console.log(error)
      // Firebase specific error messages
      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
        setToast({ message: "Invalid email or password!", type: "error" })
      } else {
        setToast({ message: "Login failed. Please try again.", type: "error" })
      }
      setIsLoading(false)
    }
  }

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isLoading) {
      handleLogin()
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
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-[#848E9C] text-sm">Log in to your trading account</p>
        </div>

        {/* Login Card */}
        <div className="bg-[#1E2329] border border-[#2B3139] rounded-xl p-8 shadow-2xl">
          
          <div className="space-y-5">
            
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
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full bg-[#0B0E11] border border-[#2B3139] rounded-lg p-3.5 outline-none text-white placeholder-[#5E6673] focus:border-[#FCD535] transition-colors text-sm"
              />
            </div>

            {/* Login Button */}
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className={`w-full py-3.5 rounded-lg font-bold text-base transition-all flex items-center justify-center gap-2 mt-2 ${
                isLoading 
                  ? "bg-[#2B3139] text-[#848E9C] cursor-not-allowed" 
                  : "bg-[#FCD535] text-black hover:bg-yellow-300 active:scale-[0.98] shadow-lg"
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-[#848E9C]/30 border-t-[#848E9C] rounded-full animate-spin"></div>
                  Logging In...
                </>
              ) : (
                "Log In"
              )}
            </button>

          </div>

          {/* Links */}
          <div className="flex items-center justify-between mt-6 text-sm">
            <a href="#" className="text-[#848E9C] hover:text-[#FCD535] transition-colors">
              Forgot Password?
            </a>
            <a href="/register" className="text-[#FCD535] hover:text-yellow-300 font-medium transition-colors">
              Sign Up
            </a>
          </div>

        </div>

        {/* Footer Note */}
        <p className="text-center text-[#5E6673] text-xs mt-8">
          Protected by reCAPTCHA and subject to the Privacy Policy and Terms of Service.
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