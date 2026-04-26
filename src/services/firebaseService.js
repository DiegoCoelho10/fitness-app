import { db, storage } from '../services/firebaseConfig'
import { 
  collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, 
  query, where, orderBy, onSnapshot, addDoc, serverTimestamp
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
      category: exerciseData.category,
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
      exercises: treinoData.exercises,
      startDate: serverTimestamp(),
      endDate: treinoData.endDate || null,
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    
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

    await addPoints(alunoId, 100, 'workout_completed')
    await updateStreak(alunoId)
    
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
      objetivo: dietaData.objetivo,
      refeicoes: dietaData.refeicoes,
      notas: dietaData.notas || '',
      startDate: serverTimestamp(),
      status: 'active',
      createdAt: serverTimestamp()
    })

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
    console.error('Erro a
