import { db, storage, auth } from '../services/firebaseConfig'
import { 
  collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, 
  query, where, orderBy, onSnapshot, addDoc, serverTimestamp,
  writeBatch, increment
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'

// ====== USERS (Personal Trainers) ======
export const createPersonalTrainer = async (userId, data) => {
  try {
    await setDoc(doc(db, 'users', userId), {
      uid: userId,
      type: 'personal_trainer',
      name: data.name,
      email: data.email,
      phone: data.phone || '',
      bio: data.bio || '',
      specialty: data.specialty || '',
      profilePhoto: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
  } catch (error) {
    console.error('Erro ao criar personal trainer:', error)
    throw error
  }
}

export const getPersonalTrainer = async (userId) => {
  try {
    const docRef = doc(db, 'users', userId)
    const docSnap = await getDoc(docRef)
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null
  } catch (error) {
    console.error('Erro ao buscar personal trainer:', error)
    throw error
  }
}

export const updatePersonalTrainer = async (userId, data) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      ...data,
      updatedAt: serverTimestamp()
    })
  } catch (error) {
    console.error('Erro ao atualizar personal trainer:', error)
    throw error
  }
}

// ====== ALUNOS ======
export const createAluno = async (personalTrainerId, alunoData) => {
  try {
    const docRef = await addDoc(collection(db, 'alunos'), {
      personalTrainerId,
      type: 'student',
      name: alunoData.name,
      email: alunoData.email,
      phone: alunoData.phone || '',
      dateOfBirth: alunoData.dateOfBirth || null,
      gender: alunoData.gender || '',
      goal: alunoData.goal || '',
      startDate: serverTimestamp(),
      
      // Medidas Físicas
      measurements: {
        height: alunoData.height || 0,
        weight: alunoData.weight || 0,
        chest: alunoData.chest || 0,
        waist: alunoData.waist || 0,
        hips: alunoData.hips || 0,
        arm: alunoData.arm || 0,
        leg: alunoData.leg || 0,
        lastUpdate: serverTimestamp()
      },

      // Gamificação
      gamification: {
        points: 0,
        streak: 0,
        lastCheckIn: null,
        badges: [],
        totalWorkouts: 0,
        totalPoints: 0
      },

      // Status
      status: 'active',
      profilePhoto: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    
    return docRef.id
  } catch (error) {
    console.error('Erro ao criar aluno:', error)
    throw error
  }
}

export const getAlunosByTrainer = (personalTrainerId, callback) => {
  try {
    const q = query(
      collection(db, 'alunos'),
      where('personalTrainerId', '==', personalTrainerId),
      orderBy('createdAt', 'desc')
    )
    return onSnapshot(q, (snapshot) => {
      const alunos = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      callback(alunos)
    }, (error) => {
      console.error('Erro ao buscar alunos:', error)
      callback([])
    })
  } catch (error) {
    console.error('Erro na subscription alunos:', error)
  }
}

export const getAluno = async (alunoId) => {
  try {
    const docRef = doc(db, 'alunos', alunoId)
    const docSnap = await getDoc(docRef)
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null
  } catch (error) {
    console.error('Erro ao buscar aluno:', error)
    throw error
  }
}

export const updateAluno = async (alunoId, data) => {
  try {
    await updateDoc(doc(db, 'alunos', alunoId), {
      ...data,
      updatedAt: serverTimestamp()
    })
  } catch (error) {
    console.error('Erro ao atualizar aluno:', error)
    throw error
  }
}

export const updateAlunoMeasurements = async (alunoId, measurements) => {
  try {
    await updateDoc(doc(db, 'alunos', alunoId), {
      'measurements.height': measurements.height,
      'measurements.weight': measurements.weight,
      'measurements.chest': measurements.chest,
      'measurements.waist': measurements.waist,
      'measurements.hips': measurements.hips,
      'measurements.arm': measurements.arm,
      'measurements.leg': measurements.leg,
      'measurements.lastUpdate': serverTimestamp(),
      updatedAt: serverTimestamp()
    })
  } catch (error) {
    console.error('Erro ao atualizar medidas:', error)
    throw error
  }
}

export const deleteAluno = async (alunoId) => {
  try {
    await deleteDoc(doc(db, 'alunos', alunoId))
  } catch (error) {
    console.error('Erro ao deletar aluno:', error)
    throw error
  }
}

// ====== EXERCÍCIOS (Biblioteca) ======
export const createExercise = async (exerciseData) => {
  try {
    const docRef = await addDoc(collection(db, 'exercicios'), {
      name: exerciseData.name,
      description: exerciseData.description || '',
      category: exerciseData.category, // peito, costa, perna, braço, ombro, etc
      imageUrl: exerciseData.imageUrl || '',
      videoUrl: exerciseData.videoUrl || '',
      instructions: exerciseData.instructions || '',
      difficulty: exerciseData.difficulty || 'intermediario',
      createdAt: serverTimestamp()
    })
    return docRef.id
  } catch (error) {
    console.error('Erro ao criar exercício:', error)
    throw error
  }
}

export const getExercises = async () => {
  try {
    const snapshot = await getDocs(collection(db, 'exercicios'))
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Erro ao buscar exercícios:', error)
    throw error
  }
}

export const getExercisesByCategory = async (category) => {
  try {
    const q = query(
      collection(db, 'exercicios'),
      where('category', '==', category)
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Erro ao buscar exercícios por categoria:', error)
    throw error
  }
}

// ====== TREINOS ======
export const createTreino = async (personalTrainerId, alunoId, treinoData) => {
  try {
    const docRef = await addDoc(collection(db, 'treinos'), {
      personalTrainerId,
      alunoId,
      name: treinoData.name,
      description: treinoData.description || '',
      difficulty: treinoData.difficulty || 'moderado',
      exercises: treinoData.exercises, // Array de objetos: {exerciseId, series, reps, weight, rest, notes}
      startDate: serverTimestamp(),
      endDate: treinoData.endDate || null,
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    
    // Enviar notificação para o aluno
    await sendNotification(alunoId, {
      type: 'workout',
      title: 'Novo Treino Atribuído! 💪',
      body: `${treinoData.name} foi prescrito para você`,
      actionUrl: `/dashboard`
    })

    return docRef.id
  } catch (error) {
    console.error('Erro ao criar treino:', error)
    throw error
  }
}

export const getTreinosByAluno = (alunoId, callback) => {
  try {
    const q = query(
      collection(db, 'treinos'),
      where('alunoId', '==', alunoId),
      orderBy('createdAt', 'desc')
    )
    return onSnapshot(q, (snapshot) => {
      const treinos = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startDate: doc.data().startDate?.toDate?.() || new Date(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date()
      }))
      callback(treinos)
    }, (error) => {
      console.error('Erro ao buscar treinos:', error)
      callback([])
    })
  } catch (error) {
    console.error('Erro na subscription treinos:', error)
  }
}

export const getTreino = async (treinoId) => {
  try {
    const docRef = doc(db, 'treinos', treinoId)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        startDate: docSnap.data().startDate?.toDate?.() || new Date()
      }
    }
    return null
  } catch (error) {
    console.error('Erro ao buscar treino:', error)
    throw error
  }
}

export const updateTreino = async (treinoId, data) => {
  try {
    await updateDoc(doc(db, 'treinos', treinoId), {
      ...data,
      updatedAt: serverTimestamp()
    })
  } catch (error) {
    console.error('Erro ao atualizar treino:', error)
    throw error
  }
}

export const deleteTreino = async (treinoId) => {
  try {
    await deleteDoc(doc(db, 'treinos', treinoId))
  } catch (error) {
    console.error('Erro ao deletar treino:', error)
    throw error
  }
}

// ====== WORKOUTS COMPLETED ======
export const completeWorkout = async (alunoId, treinoId, completionData) => {
  try {
    const docRef = await addDoc(collection(db, 'workouts_completed'), {
      alunoId,
      treinoId,
      exercises_done: completionData.exercises_done,
      duration: completionData.duration,
      notes: completionData.notes || '',
      photos: completionData.photos || [],
      completed_at: serverTimestamp()
    })

    // Adicionar pontos
    await addPoints(alunoId, 100, 'workout_completed')
    
    // Atualizar streak
    await updateStreak(alunoId)
    
    // Atualizar total de treinos
    const aluno = await getAluno(alunoId)
    await updateAluno(alunoId, {
      'gamification.totalWorkouts': (aluno.gamification?.totalWorkouts || 0) + 1
    })

    return docRef.id
  } catch (error) {
    console.error('Erro ao completar treino:', error)
    throw error
  }
}

export const getWorkoutsCompleted = async (alunoId) => {
  try {
    const q = query(
      collection(db, 'workouts_completed'),
      where('alunoId', '==', alunoId),
      orderBy('completed_at', 'desc')
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      completed_at: doc.data().completed_at?.toDate?.() || new Date()
    }))
  } catch (error) {
    console.error('Erro ao buscar treinos completos:', error)
    throw error
  }
}

// ====== DIETAS ======
export const createDieta = async (personalTrainerId, alunoId, dietaData) => {
  try {
    const docRef = await addDoc(collection(db, 'dietas'), {
      personalTrainerId,
      alunoId,
      objetivo: dietaData.objetivo, // ganhar, perder, manter
      refeicoes: dietaData.refeicoes, // Array: {nome, alimentos, calorias, horario}
      notas: dietaData.notas || '',
      startDate: serverTimestamp(),
      status: 'active',
      createdAt: serverTimestamp()
    })

    // Notificar aluno
    await sendNotification(alunoId, {
      type: 'diet',
      title: 'Nova Dieta! 🥗',
      body: 'Sua nova prescrição nutricional está pronta',
      actionUrl: `/dashboard`
    })

    return docRef.id
  } catch (error) {
    console.error('Erro ao criar dieta:', error)
    throw error
  }
}

export const getDietaByAluno = async (alunoId) => {
  try {
    const q = query(
      collection(db, 'dietas'),
      where('alunoId', '==', alunoId),
      where('status', '==', 'active'),
      orderBy('startDate', 'desc')
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))[0] || null
  } catch (error) {
    console.error('Erro ao buscar dieta:', error)
    throw error
  }
}

export const updateDieta = async (dietaId, data) => {
  try {
    await updateDoc(doc(db, 'dietas', dietaId), data)
  } catch (error) {
    console.error('Erro ao atualizar dieta:', error)
    throw error
  }
}

// ====== CHAT ======
export const getOrCreateConversation = async (userId1, userId2) => {
  try {
    const conversationId = [userId1, userId2].sort().join('_')
    const docRef = doc(db, 'chats', conversationId)
    const docSnap = await getDoc(docRef)
    
    if (!docSnap.exists()) {
      await setDoc(docRef, {
        participants: [userId1, userId2],
        createdAt: serverTimestamp(),
        lastMessage: '',
        lastMessageTime: serverTimestamp()
      })
    }
    
    return conversationId
  } catch (error) {
    console.error('Erro ao criar conversa:', error)
    throw error
  }
}

export const sendMessage = async (conversationId, senderId, text) => {
  try {
    const messagesRef = collection(db, 'chats', conversationId, 'messages')
    await addDoc(messagesRef, {
      senderId,
      text,
      timestamp: serverTimestamp(),
      read: false
    })

    // Atualizar último mensagem na conversa
    await updateDoc(doc(db, 'chats', conversationId), {
      lastMessage: text,
      lastMessageTime: serverTimestamp()
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
    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate?.() || new Date()
      }))
      callback(messages)
    }, (error) => {
      console.error('Erro ao buscar mensagens:', error)
      callback([])
    })
  } catch (error) {
    console.error('Erro na subscription chat:', error)
  }
}

// ====== NOTIFICAÇÕES ======
export const sendNotification = async (userId, notification) => {
  try {
    const notificationsRef = collection(db, 'notifications', userId, 'items')
    await addDoc(notificationsRef, {
      type: notification.type,
      title: notification.title,
      body: notification.body,
      actionUrl: notification.actionUrl || '',
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
    return onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate?.() || new Date()
      }))
      callback(notifications)
    }, (error) => {
      console.error('Erro ao buscar notificações:', error)
      callback([])
    })
  } catch (error) {
    console.error('Erro na subscription notificações:', error)
  }
}

export const markNotificationAsRead = async (userId, notificationId) => {
  try {
    await updateDoc(doc(db, 'notifications', userId, 'items', notificationId), {
      read: true
    })
  } catch (error) {
    console.error('Erro ao marcar notificação:', error)
  }
}

// ====== FOTOS ======
export const uploadProfilePhoto = async (userId, file, userType = 'user') => {
  try {
    const storageRef = ref(storage, `${userType}s/${userId}/profile`)
    
    // Delete existing photo if exists
    try {
      await deleteObject(storageRef)
    } catch (e) {
      // Photo doesn't exist, that's fine
    }

    await uploadBytes(storageRef, file)
    const url = await getDownloadURL(storageRef)

    if (userType === 'user') {
      await updatePersonalTrainer(userId, { profilePhoto: url })
    } else {
      await updateAluno(userId, { profilePhoto: url })
    }

    return url
  } catch (error) {
    console.error('Erro ao fazer upload de foto:', error)
    throw error
  }
}

export const uploadProgressPhoto = async (alunoId, file) => {
  try {
    const timestamp = Date.now()
    const storageRef = ref(storage, `progress/${alunoId}/${timestamp}`)
    await uploadBytes(storageRef, file)
    const url = await getDownloadURL(storageRef)
    
    return url
  } catch (error) {
    console.error('Erro ao fazer upload de foto de progresso:', error)
    throw error
  }
}

// ====== GAMIFICAÇÃO ======
export const addPoints = async (alunoId, points, reason) => {
  try {
    // Registrar transação de pontos
    await addDoc(collection(db, 'pontos'), {
      alunoId,
      points,
      reason,
      timestamp: serverTimestamp()
    })

    // Atualizar total de pontos do aluno
    const aluno = await getAluno(alunoId)
    const currentPoints = aluno.gamification?.totalPoints || 0
    
    await updateAluno(alunoId, {
      'gamification.totalPoints': currentPoints + points,
      'gamification.points': currentPoints + points
    })
  } catch (error) {
    console.error('Erro ao adicionar pontos:', error)
    throw error
  }
}

export const updateStreak = async (alunoId) => {
  try {
    const today = new Date().toDateString()
    const aluno = await getAluno(alunoId)
    const lastCheckIn = aluno.gamification?.lastCheckIn

    if (lastCheckIn !== today) {
      const currentStreak = aluno.gamification?.streak || 0
      
      await updateAluno(alunoId, {
        'gamification.lastCheckIn': today,
        'gamification.streak': currentStreak + 1
      })

      // Bonus pontos por streak
      if ((currentStreak + 1) % 7 === 0) {
        await addPoints(alunoId, 100, 'streak_weekly')
      }
      if ((currentStreak + 1) % 30 === 0) {
        await addPoints(alunoId, 500, 'streak_monthly')
      }
    }
  } catch (error) {
    console.error('Erro ao atualizar streak:', error)
    throw error
  }
}

export const unlockBadge = async (alunoId, badgeId) => {
  try {
    const aluno = await getAluno(alunoId)
    const badges = aluno.gamification?.badges || []
    
    if (!badges.includes(badgeId)) {
      await updateAluno(alunoId, {
        'gamification.badges': [...badges, badgeId]
      })

      await addPoints(alunoId, 50, `badge_unlocked_${badgeId}`)
    }
  } catch (error) {
    console.error('Erro ao desbloquear badge:', error)
    throw error
  }
}

// ====== RANKING ======
export const getTopAlunosByTrainer = async (personalTrainerId, limit = 50) => {
  try {
    const q = query(
      collection(db, 'alunos'),
      where('personalTrainerId', '==', personalTrainerId),
      orderBy('gamification.totalPoints', 'desc')
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.slice(0, limit).map((doc, index) => ({
      id: doc.id,
      ...doc.data(),
      rank: index + 1
    }))
  } catch (error) {
    console.error('Erro ao buscar ranking:', error)
    throw error
  }
}

export const subscribeToRanking = (personalTrainerId, callback) => {
  try {
    const q = query(
      collection(db, 'alunos'),
      where('personalTrainerId', '==', personalTrainerId),
      orderBy('gamification.totalPoints', 'desc')
    )
    return onSnapshot(q, (snapshot) => {
      const alunos = snapshot.docs.map((doc, index) => ({
        id: doc.id,
        ...doc.data(),
        rank: index + 1
      }))
      callback(alunos)
    }, (error) => {
      console.error('Erro ao buscar ranking:', error)
      callback([])
    })
  } catch (error) {
    console.error('Erro na subscription ranking:', error)
  }
}

// ====== ANALYTICS / RELATÓRIOS ======
export const getAlunoProgress = async (alunoId) => {
  try {
    const aluno = await getAluno(alunoId)
    const workoutsCompleted = await getWorkoutsCompleted(alunoId)
    
    return {
      aluno,
      totalWorkouts: workoutsCompleted.length,
      lastWorkout: workoutsCompleted[0] || null,
      streakDays: aluno.gamification?.streak || 0,
      totalPoints: aluno.gamification?.totalPoints || 0,
      badges: aluno.gamification?.badges || []
    }
  } catch (error) {
    console.error('Erro ao buscar progresso:', error)
    throw error
  }
}
