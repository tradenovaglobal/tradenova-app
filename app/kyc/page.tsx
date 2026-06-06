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

useEffect(() => {

  const loadStatus = async () => {

    const user =
      JSON.parse(localStorage.getItem("user") || "{}")

    if (!user.email) {
      setLoadingStatus(false)
      return
    }

    const q = query(
      collection(db, "kycData"),
      where("email", "==", user.email)
    )

    const snap = await getDocs(q)

    console.log("EMAIL =", user.email)
console.log("DOCS FOUND =", snap.size)
console.log("DATA =", snap.docs.map(d => d.data()))

    if (!snap.empty) {

      const approvedDoc = snap.docs.find(
        (doc) => doc.data().status === "Approved"
      )

      if (approvedDoc) {
        setKycStatus("Approved")
      } else {
        setKycStatus(
          snap.docs[0].data().status || "Pending"
        )
      }

    }

    setLoadingStatus(false)

  }

  loadStatus()

}, [])

  const handleKYC = async () => {

    try {

      if (!documentImage || !selfieImage) {
        alert("Please upload document and selfie")
        return
      }

      const user =
        JSON.parse(localStorage.getItem("user") || "{}")

      // Document Upload

      const formData1 = new FormData()
      formData1.append("file", documentImage)
      formData1.append("upload_preset", "kyc_upload")

      const upload1 = await axios.post(
        "https://api.cloudinary.com/v1_1/deqaaukdk/image/upload",
        formData1
      )

      // Selfie Upload

      const formData2 = new FormData()
      formData2.append("file", selfieImage)
      formData2.append("upload_preset", "kyc_upload")

      const upload2 = await axios.post(
        "https://api.cloudinary.com/v1_1/deqaaukdk/image/upload",
        formData2
      )

      // Save KYC

      await addDoc(
        collection(db, "kycData"),
        {
          email: user.email || "",
          fullName,
          documentType,
          idNumber,
          address,
          dob,

          documentImage:
            upload1.data.secure_url,

          selfieImage:
            upload2.data.secure_url,

          status: "Pending",
          createdAt: new Date(),
        }
      )

      alert("KYC Submitted Successfully")

      setFullName("")
      setDocumentType("Aadhaar Card")
      setIdNumber("")
      setAddress("")
      setDob("")
      setDocumentImage(null)
      setSelfieImage(null)

    } catch (error) {

      console.log(error)

      alert("KYC Submit Failed")

    }

  }

  if (loadingStatus) {
  return <div>Loading...</div>
}

if (kycStatus === "Approved") {
  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-6">

      <div className="w-full max-w-xl bg-[#07111d] border border-green-500/30 rounded-[40px] p-10 text-center shadow-[0_0_40px_#00ff6630]">

        <div className="text-7xl mb-4">
          ✅
        </div>

        <h1 className="text-5xl font-black text-green-400 mb-4">
          KYC VERIFIED
        </h1>

        <p className="text-gray-300 text-lg mb-8">
          Your identity verification has been completed successfully.
        </p>

        <div className="bg-black border border-green-500/20 rounded-2xl p-5">

          <p className="text-white text-lg">
            Status:

            <p className="text-gray-400 mt-4">
Account Verification Completed
</p>

<p className="text-green-400 mt-2 font-bold">
Trading & Withdrawals Enabled
</p>

            <span className="text-green-400 font-black ml-2">
              APPROVED
            </span>
          </p>

        </div>

        <a
          href="/dashboard"
          className="block mt-8 bg-green-500 text-black font-black py-4 rounded-2xl text-xl"
        >
          Go To Dashboard
        </a>

      </div>

    </main>
  )
}

if (kycStatus === "Pending") {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center text-yellow-500 text-5xl font-black">
      KYC UNDER REVIEW ⏳
    </div>
  )
}

if (kycStatus === "Rejected") {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center text-red-500 text-5xl font-black">
      KYC REJECTED ❌
    </div>
  )
}

return (

    <main className="min-h-screen bg-black flex items-center justify-center p-10">

      <div className="w-full max-w-3xl bg-[#07111d] border border-yellow-500/20 rounded-[40px] p-10 shadow-[0_0_50px_#ffff0022]">

        <h1 className="text-5xl font-black text-yellow-400 text-center mb-10">
          Premium KYC Verification
        </h1>

        <div className="space-y-5">

          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full p-5 rounded-2xl bg-black text-white border border-yellow-500/20"
          />

          <select
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            className="w-full p-5 rounded-2xl bg-black text-white border border-yellow-500/20"
          >
            <option>Aadhaar Card</option>
            <option>PAN Card</option>
            <option>Driving Licence</option>
            <option>Passport</option>
          </select>

          <input
            type="text"
            placeholder="Document Number"
            value={idNumber}
            onChange={(e) => setIdNumber(e.target.value)}
            className="w-full p-5 rounded-2xl bg-black text-white border border-yellow-500/20"
          />

          <input
            type="text"
            placeholder="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full p-5 rounded-2xl bg-black text-white border border-yellow-500/20"
          />

          <input
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            className="w-full p-5 rounded-2xl bg-black text-white border border-yellow-500/20"
          />

          <div>
            <p className="text-yellow-400 mb-2">
              Upload Document
            </p>

            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setDocumentImage(
                  e.target.files?.[0] || null
                )
              }
              className="w-full p-4 rounded-2xl bg-black text-white border border-yellow-500/20"
            />
          </div>

          <div>
            <p className="text-yellow-400 mb-2">
              Upload Selfie
            </p>

            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setSelfieImage(
                  e.target.files?.[0] || null
                )
              }
              className="w-full p-4 rounded-2xl bg-black text-white border border-yellow-500/20"
            />
          </div>

          <button
            onClick={handleKYC}
            className="w-full p-5 rounded-2xl bg-yellow-400 text-black font-black text-xl shadow-[0_0_30px_#ffff00]"
          >
            Submit KYC
          </button>

        </div>

      </div>

    </main>

  )
}