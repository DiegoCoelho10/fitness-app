import { create } from 'zustand'
import { auth } from '../services/firebaseConfig'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'
import { getPersonalTrainer, createPersonalTrainer, getAluno } from '../services/firebaseService'

export const useAuthStore = create((set) => {
  // Monitor de auth changes
  onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      try {
        const pt = await getPersonalTrainer(firebaseUser.uid)
        if (pt) {
          set({
            user: firebaseUser,
            userRole: 'personal_trainer',
            loading: false
          })
          return
        }

        const aluno = await getAluno(firebaseUser.uid)
        if (aluno) {
          set({
            user: firebaseUser,
            userRole: 'student',
            loading: false
          })
          return
        }

        // Usuário sem role atribuída
        set({
          user: firebaseUser,
          userRole: null,
          loading: false
        })
      } catch (error) {
        console.error('Erro ao carregar perfil:', error)
        set({ loading: false })
      }
    } else {
      set({
        user: null,
        userRole: null,
        loading: false
      })
    }
  })

  return {
    user: null,
    userRole: null,
    loading: true,

    login: async (email, password) => {
      try {
        const result = await signInWithEmailAndPassword(auth, email, password)
        return result.user
      } catch (error) {
        throw error
      }
    },

    signup: async (email, password, name, role) => {
      try {
        const result = await createUserWithEmailAndPassword(auth, email, password)
        const user = result.user

        if (role === 'personal_trainer') {
          await createPersonalTrainer(user.uid, {
            name,
            email,
            phone: '',
            bio: '',
            specialty: ''
          })
        }

        return user
      } catch (error) {
        throw error
      }
    },

    logout: async () => {
      try {
        await signOut(auth)
        set({
          user: null,
          userRole: null
        })
      } catch (error) {
        throw error
      }
    },

    checkAuth: () => {
      // Este método agora é chamado via onAuthStateChanged acima
      return true
    }
  }
})
