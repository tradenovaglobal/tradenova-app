"use client"

import { useEffect, useState } from "react"

import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  where
} from "firebase/firestore"

import { db } from "../../lib/firebase"
import AdminSidebar from "../../components/AdminSidebar"

export default function DepositsPage() {

  const [deposits, setDeposits] = useState<any[]>([])

  useEffect(() => {
    loadDeposits()
  }, [])

  const loadDeposits = async () => {

    const snapshot = await getDocs(
      collection(db, "deposits")
    )

    const list: any[] = []

    snapshot.forEach((docSnap) => {

      list.push({
        id: docSnap.id,
        ...docSnap.data()
      })

    })

    setDeposits(list)
  }

  const approveDeposit = async (deposit: any) => {

    try {

      const usersSnapshot = await getDocs(
        query(
          collection(db, "users"),
          where("email", "==", deposit.email)
        )
      )

      if (usersSnapshot.empty) {
        alert("User Not Found")
        return
      }

      const userDoc = usersSnapshot.docs[0]

      const userData: any = userDoc.data()

      const currentBalance =
        Number(userData.balance || 0)

      await updateDoc(
        userDoc.ref,
        {
          balance:
            currentBalance +
            Number(deposit.amount)
        }
      )

      await updateDoc(
        doc(db, "deposits", deposit.id),
        {
          status: "Approved"
        }
      )

      alert("Deposit Approved & Balance Added")

      loadDeposits()

    } catch (error) {

      console.log(error)

      alert("Approval Failed")

    }
  }

  return (

    <main className="min-h-screen bg-black flex">

      <AdminSidebar />

      <div className="flex-1 p-10">

        <h1 className="text-5xl font-black text-white mb-10">
          Deposit Requests
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
                  Coin
                </th>

                <th className="p-5 text-left">
                  Status
                </th>

                <th className="p-5 text-left">
                  Wallet
                </th>

                <th className="p-5 text-left">
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {deposits.map((deposit, index) => (

                <tr
                  key={index}
                  className="border-b border-cyan-500/10"
                >

                  <td className="p-5">
                    {deposit.email}
                  </td>

                  <td className="p-5 text-green-400 font-bold">
                    ${deposit.amount}
                  </td>

                  <td className="p-5">
                    {deposit.coin}
                  </td>

                  <td className="p-5 text-yellow-400">
                    {deposit.status}
                  </td>

                  <td className="p-5">
                    {deposit.wallet}
                  </td>

                  <td className="p-5">

                    {deposit.status !== "Approved" ? (

                      <button
                        onClick={() =>
                          approveDeposit(deposit)
                        }
                        className="bg-green-500 text-black px-4 py-2 rounded-xl font-bold"
                      >
                        Approve
                      </button>

                    ) : (

                      <span className="text-green-400 font-bold">
                        Approved
                      </span>

                    )}

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </main>

  )
}