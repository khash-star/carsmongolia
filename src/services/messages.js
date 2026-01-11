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
  const constraints = [];
  const hasEmailFilter = !!filters.receiver_email || !!filters.sender_email;
  
  // Apply filters
  if (filters.receiver_email) {
    constraints.push(where('receiver_email', '==', filters.receiver_email));
  }
  
  if (filters.sender_email) {
    constraints.push(where('sender_email', '==', filters.sender_email));
  }
  
  // Only use orderBy if no email filter (to avoid composite index requirement)
  if (!hasEmailFilter) {
    const orderByField = filters.orderBy || '-created_date';
    const [field, direction] = orderByField.startsWith('-') 
      ? [orderByField.slice(1), 'desc'] 
      : [orderByField, 'asc'];
    constraints.push(orderBy(field, direction));
  }
  
  const q = constraints.length > 0 
    ? query(collection(db, COLLECTION), ...constraints)
    : collection(db, COLLECTION);
  
  const snapshot = await getDocs(q);
  let results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  // If email filter was used, sort in memory
  if (hasEmailFilter) {
    const orderByField = filters.orderBy || '-created_date';
    const [field, direction] = orderByField.startsWith('-') 
      ? [orderByField.slice(1), 'desc'] 
      : [orderByField, 'asc'];
    
    results.sort((a, b) => {
      const aVal = a[field] || '';
      const bVal = b[field] || '';
      if (direction === 'desc') {
        return bVal > aVal ? 1 : bVal < aVal ? -1 : 0;
      }
      return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
    });
  }
  
  return results;
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

