"use client"

import { useEffect, useState } from "react"
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
} from "firebase/firestore"

import { db } from "../../lib/firebase"
import AdminSidebar from "../../components/AdminSidebar"

export default function WithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<any[]>([])

  useEffect(() => {
    loadWithdrawals()
  }, [])

  const loadWithdrawals = async () => {
    const snapshot = await getDocs(
      collection(db, "withdrawals")
    )

    const data = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }))

    setWithdrawals(data)
  }

  const approveWithdrawal = async (withdrawal: any) => {
    try {
      const userQuery = query(
        collection(db, "users"),
        where("email", "==", withdrawal.email)
      )

      const userSnapshot = await getDocs(userQuery)

      if (userSnapshot.empty) {
        alert("User Not Found")
        return
      }

      const userDoc = userSnapshot.docs[0]

      const userData: any = userDoc.data()

      const currentBalance = Number(
        userData.balance || 0
      )

      const amount = Number(
        withdrawal.amount || 0
      )

      if (currentBalance < amount) {
        alert("Insufficient Balance")
        return
      }

      await updateDoc(userDoc.ref, {
        balance: currentBalance - amount,
      })

      await updateDoc(
        doc(
          db,
          "withdrawals",
          withdrawal.id
        ),
        {
          status: "Approved",
        }
      )

      alert(
        "Withdrawal Approved & Balance Deducted"
      )

      loadWithdrawals()
    } catch (error) {
      console.log(error)
      alert("Approval Failed")
    }
  }

  const rejectWithdrawal = async (
    withdrawal: any
  ) => {
    try {
      await updateDoc(
        doc(
          db,
          "withdrawals",
          withdrawal.id
        ),
        {
          status: "Rejected",
        }
      )

      alert("Withdrawal Rejected")

      loadWithdrawals()
    } catch (error) {
      console.log(error)
      alert("Reject Failed")
    }
  }

  return (
    <main className="min-h-screen bg-black flex">
      <AdminSidebar />

      <div className="flex-1 p-10">
        <h1 className="text-5xl font-black text-white mb-10">
          Withdrawal Requests
        </h1>

        <div className="bg-[#081222] rounded-3xl overflow-hidden border border-cyan-500/20">

          <table className="w-full text-white">

            <thead>

              <tr className="border-b border-cyan-500/20">
                <th className="p-5 text-left">
                  Email
                </th>

                <th className="p-5 text-left">
                  Amount
                </th>

                <th className="p-5 text-left">
                  Wallet
                </th>

                <th className="p-5 text-left">
                  Status
                </th>

                <th className="p-5 text-left">
                  Action
                </th>
              </tr>

            </thead>

            <tbody>

              {withdrawals.map(
                (withdrawal) => (
                  <tr
                    key={withdrawal.id}
                    className="border-b border-cyan-500/10"
                  >
                    <td className="p-5">
                      {withdrawal.email}
                    </td>

                    <td className="p-5 text-red-400">
                      $
                      {withdrawal.amount}
                    </td>

                    <td className="p-5">
                      {withdrawal.wallet}
                    </td>

                    <td className="p-5 text-yellow-400">
                      {withdrawal.status}
                    </td>

                    <td className="p-5">

                      {withdrawal.status !==
                        "Approved" &&
                        withdrawal.status !==
                          "Rejected" ? (
                        <div className="flex gap-2">

                          <button
                            onClick={() =>
                              approveWithdrawal(
                                withdrawal
                              )
                            }
                            className="bg-green-500 text-black px-4 py-2 rounded-xl font-bold"
                          >
                            Approve
                          </button>

                          <button
                            onClick={() =>
                              rejectWithdrawal(
                                withdrawal
                              )
                            }
                            className="bg-red-500 text-white px-4 py-2 rounded-xl font-bold"
                          >
                            Reject
                          </button>

                        </div>
                      ) : (
                        <span
                          className={
                            withdrawal.status ===
                            "Approved"
                              ? "text-green-400 font-bold"
                              : "text-red-400 font-bold"
                          }
                        >
                          {withdrawal.status}
                        </span>
                      )}

                    </td>
                  </tr>
                )
              )}

            </tbody>

          </table>

        </div>
      </div>
    </main>
  )
}