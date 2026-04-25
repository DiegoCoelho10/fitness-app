import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: 'AIzaSyArWdCsMvkawY43cnSCR4pw_u9YIUropvw',
  authDomain: 'fitness-app-7aa96.firebaseapp.com',
  projectId: 'fitness-app-7aa96',
  storageBucket: 'fitness-app-7aa96.firebasestorage.app',
  messagingSenderId: '123102660519',
  appId: '1:123102660519:web:b71e04b17fea141e629882',
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export default app
