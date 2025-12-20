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
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '@/config/firebase';

const COLLECTION = 'cars';

/**
 * Get all cars (with optional filters)
 */
export const list = async (filters = {}) => {
  const constraints = [];
  
  // Apply filters
  if (filters.status) {
    constraints.push(where('status', '==', filters.status));
  }
  
  // Apply ordering
  // Note: When using where() with orderBy(), Firestore requires a composite index
  // For now, we'll apply ordering after fetching if status filter is used
  if (filters.status) {
    // If status filter is used, we'll sort in memory to avoid index requirement
    // Just fetch with status filter
  } else {
    // No status filter, safe to use orderBy
    if (filters.orderBy) {
      const [field, direction] = filters.orderBy.startsWith('-') 
        ? [filters.orderBy.slice(1), 'desc'] 
        : [filters.orderBy, 'asc'];
      constraints.push(orderBy(field, direction));
    } else {
      // Default ordering
      constraints.push(orderBy('created_at', 'desc'));
    }
  }
  
  // Apply limit
  if (filters.limit) {
    constraints.push(limit(filters.limit));
  }
  
  const q = constraints.length > 0 
    ? query(collection(db, COLLECTION), ...constraints)
    : collection(db, COLLECTION);
    
  const snapshot = await getDocs(q);
  let results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  // If status filter was used, sort in memory
  if (filters.status) {
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
 * Get car by ID
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
 * Create new car
 */
export const create = async (carData) => {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...carData,
    status: carData.status || 'pending',
    created_at: new Date().toISOString(),
    view_count: 0
  });
  return { id: docRef.id, ...carData };
};

/**
 * Update car
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
 * Delete car
 */
export const remove = async (id) => {
  const docRef = doc(db, COLLECTION, id);
  await deleteDoc(docRef);
};

/**
 * Filter cars (compatible with base44 API)
 */
export const filter = async (filters = {}, orderByField = '-created_date', limitCount = null) => {
  return list({ 
    ...filters, 
    orderBy: orderByField,
    limit: limitCount 
  });
};

