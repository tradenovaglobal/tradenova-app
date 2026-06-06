"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signInWithEmailAndPassword } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "../lib/firebase"

export default function LoginPage() {

  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = async () => {

    try {

      const userCredential =
        await signInWithEmailAndPassword(
          auth,
          email,
          password
        )

      const user = userCredential.user

      const userDoc = await getDoc(
        doc(db, "users", user.email!)
      )

      if (!userDoc.exists()) {
        alert("User data not found")
        return
      }

      const userData = userDoc.data()

localStorage.setItem(
  "user",
  JSON.stringify(userData)
)

localStorage.setItem(
  "loginTime",
  new Date().toLocaleString()
)

localStorage.setItem(
  "userName",
  userData.name
)

alert("Login Success")

      if (userData.role === "admin") {
        router.push("/admin")
      } else {
        router.push("/dashboard")
      }

    } catch (error) {
      console.log(error)
      alert("Wrong Email or Password")
    }
  }

  return (
    <main className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#00ffff22,transparent_40%),radial-gradient(circle_at_bottom_right,#0066ff22,transparent_40%)]" />

      <div className="relative z-10 w-full max-w-md bg-[#081222]/90 backdrop-blur-2xl border border-cyan-500/20 rounded-[40px] p-10 shadow-[0_0_60px_#00ffff22]">

        <h1 className="text-5xl font-black text-center mb-10 bg-gradient-to-r from-cyan-300 to-blue-500 text-transparent bg-clip-text">
          LOGIN
        </h1>

        <div className="space-y-5">

          <input
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-black border border-cyan-500/20 rounded-2xl p-5 outline-none text-white"
          />

          <input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-black border border-cyan-500/20 rounded-2xl p-5 outline-none text-white"
          />

          <button
            onClick={handleLogin}
            className="w-full py-5 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-black text-xl shadow-[0_0_30px_#00ffff66]"
          >
            Login Now
          </button>

        </div>

      </div>

    </main>
  )
}