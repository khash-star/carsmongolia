import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '@/config/firebase';

const COLLECTION = 'messages';

/**
 * Get all messages (with optional filters)
 */
export const list = async (filters = {}) => {
  let q = collection(db, COLLECTION);
  
  if (filters.receiver_email) {
    q = query(q, where('receiver_email', '==', filters.receiver_email));
  }
  
  if (filters.sender_email) {
    q = query(q, where('sender_email', '==', filters.sender_email));
  }
  
  // Apply ordering
  const orderByField = filters.orderBy || '-created_date';
  const [field, direction] = orderByField.startsWith('-') 
    ? [orderByField.slice(1), 'desc'] 
    : [orderByField, 'asc'];
  q = query(q, orderBy(field, direction));
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

/**
 * Create message
 */
export const create = async (messageData) => {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...messageData,
    is_read: false,
    created_date: new Date().toISOString()
  });
  return { id: docRef.id, ...messageData };
};

/**
 * Mark message as read
 */
export const markAsRead = async (id) => {
  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, { 
    is_read: true,
    read_at: new Date().toISOString()
  });
};

/**
 * Filter messages (compatible with base44 API)
 */
export const filter = async (filters = {}, orderByField = '-created_date') => {
  return list({ 
    ...filters, 
    orderBy: orderByField || '-created_date'
  });
};

