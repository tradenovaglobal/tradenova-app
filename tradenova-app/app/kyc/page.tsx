"use client"

import { useState } from "react"
import axios from "axios"
import { addDoc, collection } from "firebase/firestore"
import { db } from "../lib/firebase"

export default function KYCPage() {

  const [fullName, setFullName] = useState("")
  const [documentType, setDocumentType] = useState("Aadhaar Card")
  const [idNumber, setIdNumber] = useState("")
  const [address, setAddress] = useState("")
  const [dob, setDob] = useState("")

  const [documentImage, setDocumentImage] = useState<File | null>(null)
  const [selfieImage, setSelfieImage] = useState<File | null>(null)

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