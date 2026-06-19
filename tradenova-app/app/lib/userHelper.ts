import { doc, setDoc, getDoc, onSnapshot } from "firebase/firestore"
import { db } from "./firebase"

// Default template for new user
const defaultUser = (name: string, email: string) => ({
  name,
  email,
  balance: 0,
  profit: 0,
  totalTrades: 0,
  referralBonus: 0,
  depositHistory: [],
  withdrawHistory: [],
  tradeHistory: [],
  kycStatus: "pending",
  role: "user",
  createdAt: new Date().toISOString(),
})

// ✅ Ensure user exists in Firestore (call on every page load)
export const ensureUser = async () => {
  const raw = localStorage.getItem("user")
  if (!raw) return null
  const user = JSON.parse(raw)
  if (!user.email) return null

  const ref = doc(db, "users", user.email)
  const snap = await getDoc(ref)

  if (!snap.exists()) {
    await setDoc(ref, defaultUser(user.name || user.email, user.email), { merge: true })
  }

  return user.email
}

// ✅ REAL-TIME listener — dashboard mein use karo
export const listenUser = (email: string, callback: (data: any) => void) => {
  const ref = doc(db, "users", email)
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) callback(snap.data())
  })
}

// ✅ UPDATE user data — deposit/withdraw/trading mein use karo
export const updateUser = async (email: string, updates: Record<string, any>) => {
  if (!email) return
  const ref = doc(db, "users", email)
  await setDoc(ref, updates, { merge: true })
}

// ✅ Get current user email from localStorage
export const getUserEmail = () => {
  const raw = localStorage.getItem("user")
  if (!raw) return null
  return JSON.parse(raw).email || null
}