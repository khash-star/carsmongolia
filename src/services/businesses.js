import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '@/config/firebase';

const COLLECTION = 'businesses';

/**
 * Get all businesses (with optional filters)
 */
export const list = async (filters = {}) => {
  let q = collection(db, COLLECTION);
  const hasStatusFilter = !!filters.status;
  
  if (filters.status) {
    q = query(q, where('status', '==', filters.status));
  }
  
  if (filters.type) {
    q = query(q, where('type', '==', filters.type));
  }
  
  // Only use orderBy if no status filter (to avoid composite index requirement)
  if (!hasStatusFilter && filters.orderBy) {
    const [field, direction] = filters.orderBy.startsWith('-') 
      ? [filters.orderBy.slice(1), 'desc'] 
      : [filters.orderBy, 'asc'];
    q = query(q, orderBy(field, direction));
  }
  
  const snapshot = await getDocs(q);
  let results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  // If status filter was used, sort in memory
  if (hasStatusFilter) {
    if (filters.orderBy) {
      const [field, direction] = filters.orderBy.startsWith('-') 
        ? [filters.orderBy.slice(1), 'desc'] 
        : [filters.orderBy, 'asc'];
      results.sort((a, b) => {
        const aVal = a[field];
        const bVal = b[field];
        if (direction === 'desc') {
          return bVal > aVal ? 1 : bVal < aVal ? -1 : 0;
        }
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      });
    } else {
      // Default: sort by created_at desc
      results.sort((a, b) => {
        const aDate = a.created_at || '';
        const bDate = b.created_at || '';
        return bDate.localeCompare(aDate);
      });
    }
  }
  
  return results;
};

/**
 * Get business by ID
 */
export const getById = async (id) => {
  const docRef = doc(db, COLLECTION, id);
  const snapshot = await getDoc(docRef);
  if (snapshot.exists()) {
    return { id: snapshot.id, ...snapshot.data() };
  }
  return null;
};

/**
 * Create new business
 */
export const create = async (businessData) => {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...businessData,
    status: businessData.status || 'pending',
    created_at: new Date().toISOString(),
    view_count: 0
  });
  return { id: docRef.id, ...businessData };
};

/**
 * Update business
 */
export const update = async (id, updates) => {
  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, {
    ...updates,
    updated_at: new Date().toISOString()
  });
  return { id, ...updates };
};

/**
 * Delete business
 */
export const remove = async (id) => {
  const docRef = doc(db, COLLECTION, id);
  await deleteDoc(docRef);
};

/**
 * Filter businesses (compatible with base44 API)
 */
export const filter = async (filters = {}, orderByField = '-created_date') => {
  return list({ 
    ...filters, 
    orderBy: orderByField
  });
};

