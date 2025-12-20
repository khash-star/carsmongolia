/**
 * Utility script to create admin user
 * Run this in browser console after logging in as the user you want to make admin
 * 
 * Usage:
 * 1. Login as the user
 * 2. Open browser console
 * 3. Run: await createAdminUser('user-email@example.com')
 */

import { setUserRole } from '@/services/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';

/**
 * Create or update user to admin role
 * Only allows one ADMIN user at a time
 * @param {string} userId - Firebase Auth UID
 * @param {string} email - User email (optional, for verification)
 */
export const createAdminUser = async (userId, email = null) => {
  try {
    const { collection, query, where, getDocs } = await import('firebase/firestore');
    
    // Check if there's already an admin
    const adminQuery = query(
      collection(db, 'users'),
      where('role', '==', 'ADMIN')
    );
    const adminSnapshot = await getDocs(adminQuery);
    
    // Check if there's already an admin (excluding current user)
    const existingAdmins = adminSnapshot.docs.filter(doc => doc.id !== userId);
    if (existingAdmins.length > 0) {
      const existingAdmin = existingAdmins[0].data();
      console.warn(`⚠️ Админ аль хэдийн байна: ${existingAdmin.email}`);
      console.log('Одоогийн админыг USER болгох шаардлагатай.');
      return false;
    }
    
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      // Create user document if it doesn't exist
      await setDoc(userRef, {
        email: email || 'admin@example.com',
        role: 'ADMIN',
        full_name: 'Admin User',
        created_at: new Date().toISOString()
      });
    } else {
      // Update existing user to admin
      await setDoc(userRef, {
        role: 'ADMIN'
      }, { merge: true });
    }
    
    console.log('✅ Admin user created/updated successfully!');
    console.log('ℹ️ Зөвхөн нэг админ байх боломжтой.');
    return true;
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    throw error;
  }
};

/**
 * Helper function to get current user ID and make them admin
 * Run this in browser console after logging in
 */
export const makeCurrentUserAdmin = async () => {
  try {
    const { getCurrentUser } = await import('@/services/auth');
    const user = await getCurrentUser();
    
    if (!user) {
      console.error('❌ No user logged in');
      return false;
    }
    
    await createAdminUser(user.uid, user.email);
    console.log(`✅ User ${user.email} is now ADMIN. Please refresh the page.`);
    return true;
  } catch (error) {
    console.error('❌ Error:', error);
    return false;
  }
};

// Make function available globally for console use
if (typeof window !== 'undefined') {
  window.makeCurrentUserAdmin = makeCurrentUserAdmin;
  window.createAdminUser = createAdminUser;
}

