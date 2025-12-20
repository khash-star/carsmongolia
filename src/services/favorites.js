import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  deleteDoc,
  query,
  where
} from 'firebase/firestore';
import { db } from '@/config/firebase';

const COLLECTION = 'favorites';

/**
 * Get all favorites (with optional filters)
 */
export const list = async (filters = {}) => {
  let q = collection(db, COLLECTION);
  
  if (filters.user_email) {
    q = query(q, where('user_email', '==', filters.user_email));
  }
  
  if (filters.car_id) {
    q = query(q, where('car_id', '==', filters.car_id));
  }
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

/**
 * Create favorite
 */
export const create = async (favoriteData) => {
  // Check if already exists
  const existing = await list({ 
    user_email: favoriteData.user_email, 
    car_id: favoriteData.car_id 
  });
  
  if (existing.length > 0) {
    return existing[0];
  }
  
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...favoriteData,
    created_at: new Date().toISOString()
  });
  return { id: docRef.id, ...favoriteData };
};

/**
 * Delete favorite
 */
export const remove = async (id) => {
  const docRef = doc(db, COLLECTION, id);
  await deleteDoc(docRef);
};

/**
 * Filter favorites (compatible with base44 API)
 */
export const filter = async (filters = {}) => {
  return list(filters);
};

