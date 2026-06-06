import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyAwKtweBpemvT0R2pzGvhACktgDlYPJ-GQ",
  authDomain: "tradenova-250e2.firebaseapp.com",
  projectId: "tradenova-250e2",
  storageBucket: "tradenova-250e2.firebasestorage.app",
  messagingSenderId: "293458210625",
  appId: "1:293458210625:web:332e1ed1aa6fda3fd3fbc0",
  measurementId: "G-P4NBNXP832"
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)

export default app