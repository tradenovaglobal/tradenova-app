"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { auth, db } from "../lib/firebase"

export default function RegisterPage() {

  const router = useRouter()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleRegister = async () => {

    if (!name || !email || !password) {
      alert("Please fill all fields")
      return
    }

    try {

      setLoading(true)

      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        )

      await setDoc(
        doc(db, "users", email),
        {
          uid: userCredential.user.uid,
          name,
          email,
          balance: 0,
          role: "user",
          kycStatus: "Pending",
          createdAt: new Date(),
        }
      )

      alert("Account Created Successfully")

      router.push("/login")

    } catch (error: any) {

      if (error.code === "auth/email-already-in-use") {
        alert("Email already registered")
      } else {
        alert(error.message)
      }

    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-10">

      <div className="w-full max-w-md bg-[#07111d] border border-cyan-500/20 rounded-[40px] p-10">

        <h1 className="text-5xl font-black text-cyan-400 text-center mb-10">
          REGISTER
        </h1>

        <div className="space-y-5">

          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-5 rounded-2xl bg-black text-white"
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-5 rounded-2xl bg-black text-white"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-5 rounded-2xl bg-black text-white"
          />

          <button
            onClick={handleRegister}
            disabled={loading}
            className="w-full p-5 rounded-2xl bg-cyan-400 text-black font-bold"
          >
            {loading ? "Creating..." : "Create Account"}
          </button>

        </div>

      </div>

    </main>
  )
}