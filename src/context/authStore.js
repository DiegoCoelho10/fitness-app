import { create } from 'zustand'
import { auth, db } from '../services/firebaseConfig'
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged 
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'

export const useAuthStore = create((set) => ({
  user: null,
  loading: true,
  error: null,
  userRole: null,
  hasAccess: true,

  // Inicializa listener de autenticação
  initAuth: () => {
    onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Busca dados do usuário no Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
        const userData = userDoc.data()
        
        set({
          user: firebaseUser,
          userRole: userData?.role || 'student',
          loading: false,
        })
      } else {
        set({ user: null, userRole: null, loading: false })
      }
    })
  },

  // Login
  login: async (email, password) => {
    set({ loading: true, error: null })
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      const userDoc = await getDoc(doc(db, 'users', result.user.uid))
      const userData = userDoc.data()
      
      set({
        user: result.user,
        userRole: userData?.role || 'student',
        loading: false,
      })
      return result.user
    } catch (error) {
      set({ 
        error: error.message,
        loading: false 
      })
      throw error
    }
  },

  // Cadastro
  signup: async (email, password, name, role = 'student') => {
    set({ loading: true, error: null })
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      
      // Salva dados no Firestore
      await setDoc(doc(db, 'users', result.user.uid), {
        uid: result.user.uid,
        name,
        email,
        role,
        createdAt: new Date(),
        ...(role === 'personal_trainer' ? {
          bio: '',
          phone: '',
          profilePhoto: '',
          subscription: {
            status: 'trial',
            plan: 'free',
            startDate: new Date(),
            renewDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          }
        } : {
          personalTrainerId: null,
          goal: '',
          level: 'iniciante',
          gamification: {
            points: 0,
            streak: 0,
            lastCheckIn: null,
            badges: [],
            totalWorkouts: 0,
          },
          accessStatus: {
            hasAccess: true,
            reason: 'active',
          }
        })
      })

      // Salva informações de acesso (para alunos)
      if (role === 'student') {
        await setDoc(doc(db, 'access_control', result.user.uid), {
          status: 'active',
          reason: 'new_user',
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        })
      }

      set({
        user: result.user,
        userRole: role,
        loading: false,
      })
      return result.user
    } catch (error) {
      set({ 
        error: error.message,
        loading: false 
      })
      throw error
    }
  },

  // Logout
  logout: async () => {
    set({ loading: true, error: null })
    try {
      await signOut(auth)
      set({ 
        user: null, 
        userRole: null,
        loading: false 
      })
    } catch (error) {
      set({ 
        error: error.message,
        loading: false 
      })
      throw error
    }
  },

  // Verifica acesso do aluno
  checkAccess: async (userId) => {
    try {
      const accessDoc = await getDoc(doc(db, 'access_control', userId))
      const data = accessDoc.data()
      
      if (!data) {
        set({ hasAccess: true })
        return true
      }

      const expiresAt = data.expiresAt?.toDate?.() || new Date(data.expiresAt)
      const isActive = data.status === 'active' && expiresAt > new Date()
      
      set({ hasAccess: isActive })
      return isActive
    } catch (error) {
      console.error('Erro ao verificar acesso:', error)
      set({ hasAccess: true })
      return true
    }
  },
}))
