import { db, storage } from '../services/firebaseConfig'
import { 
  collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, 
  query, where, orderBy, onSnapshot, addDoc, serverTimestamp 
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'

// ====== STUDENTS ======
export const addStudent = async (personalTrainerId, studentData) => {
  try {
    const studentsRef = collection(db, 'students')
    const docRef = await addDoc(studentsRef, {
      personalTrainerId,
      ...studentData,
      createdAt: serverTimestamp(),
      gamification: {
        points: 0,
        streak: 0,
        lastCheckIn: null,
        badges: [],
        totalWorkouts: 0
      }
    })
    return docRef.id
  } catch (error) {
    console.error('Erro ao adicionar aluno:', error)
    throw error
  }
}

export const getStudentsByTrainer = (personalTrainerId, callback) => {
  try {
    const q = query(
      collection(db, 'students'),
      where('personalTrainerId', '==', personalTrainerId),
      orderBy('createdAt', 'desc')
    )
    return onSnapshot(q, callback)
  } catch (error) {
    console.error('Erro ao buscar alunos:', error)
  }
}

export const getStudent = async (studentId) => {
  try {
    const docRef = doc(db, 'students', studentId)
    const docSnap = await getDoc(docRef)
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null
  } catch (error) {
    console.error('Erro ao buscar aluno:', error)
    throw error
  }
}

export const updateStudent = async (studentId, data) => {
  try {
    await updateDoc(doc(db, 'students', studentId), data)
  } catch (error) {
    console.error('Erro ao atualizar aluno:', error)
    throw error
  }
}

export const deleteStudent = async (studentId) => {
  try {
    await deleteDoc(doc(db, 'students', studentId))
  } catch (error) {
    console.error('Erro ao deletar aluno:', error)
    throw error
  }
}

// ====== WORKOUTS ======
export const createWorkout = async (personalTrainerId, studentId, workoutData) => {
  try {
    const workoutsRef = collection(db, 'workouts')
    const docRef = await addDoc(workoutsRef, {
      personalTrainerId,
      studentId,
      ...workoutData,
      createdAt: serverTimestamp(),
      completed: []
    })
    return docRef.id
  } catch (error) {
    console.error('Erro ao criar treino:', error)
    throw error
  }
}

export const getWorkoutsByStudent = (studentId, callback) => {
  try {
    const q = query(
      collection(db, 'workouts'),
      where('studentId', '==', studentId),
      orderBy('createdAt', 'desc')
    )
    return onSnapshot(q, callback)
  } catch (error) {
    console.error('Erro ao buscar treinos:', error)
  }
}

export const getWorkout = async (workoutId) => {
  try {
    const docRef = doc(db, 'workouts', workoutId)
    const docSnap = await getDoc(docRef)
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null
  } catch (error) {
    console.error('Erro ao buscar treino:', error)
    throw error
  }
}

export const completeWorkout = async (workoutId, completionData) => {
  try {
    const workoutRef = doc(db, 'workouts', workoutId)
    const workoutDoc = await getDoc(workoutRef)
    const completed = workoutDoc.data().completed || []
    
    await updateDoc(workoutRef, {
      completed: [...completed, {
        ...completionData,
        completedAt: serverTimestamp()
      }]
    })
  } catch (error) {
    console.error('Erro ao completar treino:', error)
    throw error
  }
}

// ====== CHAT ======
export const sendMessage = async (conversationId, senderId, text) => {
  try {
    const messagesRef = collection(db, 'chats', conversationId, 'messages')
    await addDoc(messagesRef, {
      senderId,
      text,
      timestamp: serverTimestamp(),
      read: false
    })
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error)
    throw error
  }
}

export const subscribeToChat = (conversationId, callback) => {
  try {
    const q = query(
      collection(db, 'chats', conversationId, 'messages'),
      orderBy('timestamp', 'asc')
    )
    return onSnapshot(q, callback)
  } catch (error) {
    console.error('Erro ao se inscrever no chat:', error)
  }
}

export const getOrCreateConversation = async (userId1, userId2) => {
  try {
    const conversationId = [userId1, userId2].sort().join('_')
    const docRef = doc(db, 'chats', conversationId)
    const docSnap = await getDoc(docRef)
    
    if (!docSnap.exists()) {
      await setDoc(docRef, {
        participants: [userId1, userId2],
        createdAt: serverTimestamp()
      })
    }
    
    return conversationId
  } catch (error) {
    console.error('Erro ao criar conversa:', error)
    throw error
  }
}

// ====== NOTIFICATIONS ======
export const sendNotification = async (userId, notification) => {
  try {
    const notificationsRef = collection(db, 'notifications', userId, 'items')
    await addDoc(notificationsRef, {
      ...notification,
      timestamp: serverTimestamp(),
      read: false
    })
  } catch (error) {
    console.error('Erro ao enviar notificação:', error)
    throw error
  }
}

export const subscribeToNotifications = (userId, callback) => {
  try {
    const q = query(
      collection(db, 'notifications', userId, 'items'),
      orderBy('timestamp', 'desc')
    )
    return onSnapshot(q, callback)
  } catch (error) {
    console.error('Erro ao se inscrever em notificações:', error)
  }
}

export const markNotificationAsRead = async (userId, notificationId) => {
  try {
    await updateDoc(doc(db, 'notifications', userId, 'items', notificationId), {
      read: true
    })
  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error)
  }
}

// ====== PHOTOS ======
export const uploadProfilePhoto = async (userId, file) => {
  try {
    const storageRef = ref(storage, `profiles/${userId}/photo`)
    await uploadBytes(storageRef, file)
    const url = await getDownloadURL(storageRef)
    
    await updateDoc(doc(db, 'users', userId), {
      'profile.photo': url
    })
    
    return url
  } catch (error) {
    console.error('Erro ao upload de foto:', error)
    throw error
  }
}

export const uploadProgressPhoto = async (studentId, file) => {
  try {
    const timestamp = Date.now()
    const storageRef = ref(storage, `progress/${studentId}/${timestamp}`)
    await uploadBytes(storageRef, file)
    const url = await getDownloadURL(storageRef)
    
    return url
  } catch (error) {
    console.error('Erro ao upload de foto de progresso:', error)
    throw error
  }
}

// ====== GAMIFICATION ======
export const addPoints = async (studentId, points, reason) => {
  try {
    const pointsRef = collection(db, 'points')
    await addDoc(pointsRef, {
      studentId,
      points,
      reason,
      timestamp: serverTimestamp()
    })
    
    const studentRef = doc(db, 'students', studentId)
    const studentSnap = await getDoc(studentRef)
    const currentPoints = studentSnap.data().gamification.points || 0
    
    await updateDoc(studentRef, {
      'gamification.points': currentPoints + points
    })
  } catch (error) {
    console.error('Erro ao adicionar pontos:', error)
    throw error
  }
}

export const updateStreak = async (studentId) => {
  try {
    const today = new Date().toDateString()
    const studentRef = doc(db, 'students', studentId)
    const studentSnap = await getDoc(studentRef)
    const lastCheckIn = studentSnap.data().gamification.lastCheckIn
    
    if (lastCheckIn !== today) {
      const currentStreak = studentSnap.data().gamification.streak || 0
      await updateDoc(studentRef, {
        'gamification.lastCheckIn': today,
        'gamification.streak': currentStreak + 1
      })
    }
  } catch (error) {
    console.error('Erro ao atualizar streak:', error)
    throw error
  }
}

// ====== RANKING ======
export const getTopStudents = async (personalTrainerId, limit = 10) => {
  try {
    const q = query(
      collection(db, 'students'),
      where('personalTrainerId', '==', personalTrainerId),
      orderBy('gamification.points', 'desc')
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.slice(0, limit).map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Erro ao buscar top estudantes:', error)
    throw error
  }
}
