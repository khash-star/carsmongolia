/**
 * Remove admin role from a user (set to USER)
 * Run this in browser console
 * 
 * Usage:
 * await removeAdminFromUser('user-uid-here')
 * OR
 * await removeAdminFromCurrentUser() // Removes admin from currently logged in user
 */

import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';

/**
 * Remove admin role from a specific user
 * @param {string} userId - Firebase Auth UID
 */
export const removeAdminFromUser = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      console.error('❌ User not found');
      return false;
    }
    
    const userData = userDoc.data();
    if (userData.role !== 'ADMIN') {
      console.warn('⚠️ User is not an admin');
      return false;
    }
    
    await setDoc(userRef, {
      role: 'USER'
    }, { merge: true });
    
    console.log(`✅ User ${userData.email} is now USER`);
    return true;
  } catch (error) {
    console.error('❌ Error removing admin:', error);
    throw error;
  }
};

/**
 * Remove admin role from currently logged in user
 */
export const removeAdminFromCurrentUser = async () => {
  try {
    const { getCurrentUser } = await import('@/services/auth');
    const user = await getCurrentUser();
    
    if (!user) {
      console.error('❌ No user logged in');
      return false;
    }
    
    if (user.role !== 'ADMIN') {
      console.warn('⚠️ Current user is not an admin');
      return false;
    }
    
    await removeAdminFromUser(user.uid);
    console.log('✅ You are now USER. Please refresh the page.');
    return true;
  } catch (error) {
    console.error('❌ Error:', error);
    return false;
  }
};

// Make functions available globally for console use
if (typeof window !== 'undefined') {
  window.removeAdminFromUser = removeAdminFromUser;
  window.removeAdminFromCurrentUser = removeAdminFromCurrentUser;
}

