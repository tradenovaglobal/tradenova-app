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

export default function KYCPage() {

  const [kycData, setKycData] = useState<any[]>([])

  useEffect(() => {
    loadKYC()
  }, [])

  const loadKYC = async () => {

    const snapshot = await getDocs(
      collection(db, "kycData")
    )

    const list: any[] = []

    snapshot.forEach((docSnap) => {

      list.push({
        id: docSnap.id,
        ...docSnap.data()
      })

    })

    setKycData(list)

  }

  const approveKYC = async (item: any) => {

    await updateDoc(
      doc(db, "kycData", item.id),
      {
        status: "Approved"
      }
    )

    loadKYC()

  }

  const rejectKYC = async (item: any) => {

    await updateDoc(
      doc(db, "kycData", item.id),
      {
        status: "Rejected"
      }
    )

    loadKYC()

  }

  return (

    <main className="min-h-screen bg-black flex">

      <AdminSidebar />

      <div className="flex-1 p-8">

        <h1 className="text-5xl font-black text-white mb-8">
          Premium KYC Verification
        </h1>

        <div className="grid gap-6">

          {kycData.map((item, index) => (

            <div
              key={index}
              className="bg-[#081222] border border-cyan-500/20 rounded-3xl p-6 text-white"
            >

              <div className="grid md:grid-cols-2 gap-6">

                <div>

                  <p>
                    <span className="text-cyan-400 font-bold">
                      Name:
                    </span>{" "}
                    {item.fullName}
                  </p>

                  <p className="mt-2">
                    <span className="text-cyan-400 font-bold">
                      Email:
                    </span>{" "}
                    {item.email}
                  </p>

                  <p className="mt-2">
                    <span className="text-cyan-400 font-bold">
                      Document:
                    </span>{" "}
                    {item.documentType}
                  </p>

                  <p className="mt-2">
                    <span className="text-cyan-400 font-bold">
                      ID Number:
                    </span>{" "}
                    {item.idNumber}
                  </p>

                  <p className="mt-2">
                    <span className="text-cyan-400 font-bold">
                      Address:
                    </span>{" "}
                    {item.address}
                  </p>

                  <p className="mt-2">
                    <span className="text-cyan-400 font-bold">
                      DOB:
                    </span>{" "}
                    {item.dob}
                  </p>

                  <div className="mt-4">

                    {item.status === "Approved" && (
                      <span className="bg-green-500 text-black px-4 py-2 rounded-xl font-bold">
                        Approved
                      </span>
                    )}

                    {item.status === "Rejected" && (
                      <span className="bg-red-500 text-white px-4 py-2 rounded-xl font-bold">
                        Rejected
                      </span>
                    )}

                    {(!item.status ||
                      item.status === "Pending") && (
                      <span className="bg-yellow-500 text-black px-4 py-2 rounded-xl font-bold">
                        Pending
                      </span>
                    )}

                  </div>

                </div>

                <div>

                  <p className="font-bold text-cyan-400 mb-2">
                    Document Image
                  </p>

                  <img
                    src={item.documentImage}
                    alt=""
                    className="w-full h-56 object-cover rounded-2xl border border-cyan-500/20"
                  />

                  <a
                    href={item.documentImage}
                    target="_blank"
                    className="block mt-2 text-cyan-400"
                  >
                    View Full Image
                  </a>

                  <p className="font-bold text-cyan-400 mt-6 mb-2">
                    Selfie Image
                  </p>

                  <img
                    src={item.selfieImage}
                    alt=""
                    className="w-full h-56 object-cover rounded-2xl border border-cyan-500/20"
                  />

                  <a
                    href={item.selfieImage}
                    target="_blank"
                    className="block mt-2 text-cyan-400"
                  >
                    View Full Selfie
                  </a>

                </div>

              </div>

              {(!item.status ||
                item.status === "Pending") && (

                <div className="flex gap-4 mt-6">

                  <button
                    onClick={() => approveKYC(item)}
                    className="bg-green-500 text-black px-6 py-3 rounded-2xl font-black"
                  >
                    Approve KYC
                  </button>

                  <button
                    onClick={() => rejectKYC(item)}
                    className="bg-red-500 text-white px-6 py-3 rounded-2xl font-black"
                  >
                    Reject KYC
                  </button>

                </div>

              )}

            </div>

          ))}

        </div>

      </div>

    </main>

  )

}