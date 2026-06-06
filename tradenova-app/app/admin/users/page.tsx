"use client"

import { useEffect, useState } from "react"
import {
  collection,
  getDocs,
  doc,
  updateDoc
} from "firebase/firestore"

import { db } from "../../lib/firebase"
import AdminSidebar from "../../components/AdminSidebar"

export default function UsersPage() {

  const [users, setUsers] = useState<any[]>([])

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {

    const snapshot = await getDocs(
      collection(db, "users")
    )

    const list: any[] = []

    snapshot.forEach((docItem) => {

      list.push({
        id: docItem.id,
        ...docItem.data()
      })

    })

    setUsers(list)
  }

  const addFunds = async (
    id: string,
    currentBalance: number
  ) => {

    const amount =
      Number(prompt("Enter Amount"))

    if (!amount) return

    await updateDoc(
      doc(db, "users", id),
      {
        balance:
          Number(currentBalance || 0)
          + amount
      }
    )

    alert("Funds Added Successfully")

    loadUsers()
  }

  const removeFunds = async (
    id: string,
    currentBalance: number
  ) => {

    const amount =
      Number(prompt("Enter Amount"))

    if (!amount) return

    await updateDoc(
      doc(db, "users", id),
      {
        balance:
          Number(currentBalance || 0)
          - amount
      }
    )

    alert("Funds Removed Successfully")

    loadUsers()
  }

  return (

    <main className="min-h-screen bg-black flex">

      <AdminSidebar />

      <div className="flex-1 p-10">

        <h1 className="text-5xl font-black text-white mb-10">
          Users Management
        </h1>

        <div className="bg-[#081222] rounded-3xl overflow-hidden border border-cyan-500/20">

          <table className="w-full text-white">

            <thead>

              <tr className="border-b border-cyan-500/20">

                <th className="p-5 text-left">
                  Name
                </th>

                <th className="p-5 text-left">
                  Email
                </th>

                <th className="p-5 text-left">
                  Balance
                </th>

                <th className="p-5 text-left">
                  KYC
                </th>

                <th className="p-5 text-left">
                  Role
                </th>

                <th className="p-5 text-left">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {users.map((user, index) => (

                <tr
                  key={index}
                  className="border-b border-cyan-500/10"
                >

                  <td className="p-5">
                    {user.name}
                  </td>

                  <td className="p-5">
                    {user.email}
                  </td>

                  <td className="p-5 text-green-400 font-bold">
                    ${user.balance || 0}
                  </td>

                  <td className="p-5 text-yellow-400">
                    {user.kycStatus || "Pending"}
                  </td>

                  <td className="p-5 text-cyan-400">
                    {user.role || "user"}
                  </td>

                  <td className="p-5">

                    <button
                      onClick={() =>
                        addFunds(
                          user.id,
                          user.balance
                        )
                      }
                      className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-xl mr-2 font-bold"
                    >
                      + Funds
                    </button>

                    <button
                      onClick={() =>
                        removeFunds(
                          user.id,
                          user.balance
                        )
                      }
                      className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-xl font-bold"
                    >
                      - Funds
                    </button>

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