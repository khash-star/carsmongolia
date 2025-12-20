/**
 * Utility to check and fix user role
 * Run this in browser console: checkUserRole()
 */
import { getCurrentUser } from '@/services/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';

export const checkUserRole = async () => {
  console.log('🔍 Checking user role...\n');
  
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      console.error('❌ No user logged in');
      return null;
    }
    
    console.log('1. Current user from getCurrentUser():', {
      email: user.email,
      uid: user.uid,
      role: user.role
    });
    
    // Check Firestore directly
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const firestoreData = userDoc.data();
    
    console.log('2. Firestore user document:', {
      exists: userDoc.exists(),
      data: firestoreData
    });
    
    // Check localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      console.log('3. localStorage user:', {
        email: parsed.email,
        role: parsed.role
      });
    }
    
    // If role is USER but should be ADMIN
    if (user.role === 'USER' && user.email === 'khashpay@gmail.com') {
      console.warn('⚠️ User is USER but email suggests should be ADMIN');
      console.log('💡 To make this user ADMIN, run:');
      console.log('   await window.makeCurrentUserAdmin()');
    }
    
    return {
      currentUser: user,
      firestore: firestoreData,
      localStorage: storedUser ? JSON.parse(storedUser) : null
    };
  } catch (error) {
    console.error('❌ Error checking user role:', error);
    return null;
  }
};

// Make it available globally
if (typeof window !== 'undefined') {
  window.checkUserRole = checkUserRole;
}

export default checkUserRole;

