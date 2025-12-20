/**
 * Diagnostic utility to check Firebase Storage auth state
 * Run this in browser console: checkStorageAuth()
 */
import { auth } from '@/config/firebase';
import { ref, uploadBytes } from 'firebase/storage';
import { storage } from '@/config/firebase';

export const checkStorageAuth = async () => {
  console.log('🔍 Checking Firebase Storage Auth State...\n');
  
  // Check localStorage
  const storedUser = localStorage.getItem('user');
  console.log('1. localStorage user:', storedUser ? JSON.parse(storedUser) : '❌ Not found');
  
  // Check Firebase Auth
  const currentUser = auth.currentUser;
  console.log('2. Firebase Auth currentUser:', currentUser);
  console.log('   - Email:', currentUser?.email || '❌ No email');
  console.log('   - UID:', currentUser?.uid || '❌ No UID');
  console.log('   - Email verified:', currentUser?.emailVerified || '❌ Not verified');
  
  // Check auth state listener
  return new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log('3. Auth state changed:', user ? `✅ ${user.email}` : '❌ No user');
      unsubscribe();
      
      if (!user) {
        console.error('\n❌ ERROR: No authenticated user found!');
        console.log('💡 Solution: Please login at /login');
        resolve(false);
        return;
      }
      
      // Try a test upload
      console.log('\n4. Testing Storage write permission...');
      const testRef = ref(storage, `test/${Date.now()}_test.txt`);
      const testBlob = new Blob(['test'], { type: 'text/plain' });
      
      uploadBytes(testRef, testBlob)
        .then(() => {
          console.log('✅ Storage write test: SUCCESS');
          console.log('\n✅ All checks passed! Storage should work.');
          resolve(true);
        })
        .catch((error) => {
          console.error('❌ Storage write test: FAILED');
          console.error('   Error code:', error.code);
          console.error('   Error message:', error.message);
          
          if (error.code === 'storage/unauthorized' || error.code === 'storage/permission-denied') {
            console.error('\n🔴 PROBLEM: Firebase Storage Rules not configured correctly!');
            console.log('\n💡 SOLUTION:');
            console.log('1. Go to: https://console.firebase.google.com');
            console.log('2. Select project: carsmongolia-d410a');
            console.log('3. Go to: Storage → Rules');
            console.log('4. Paste these rules:');
            console.log(`
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}`);
            console.log('5. Click "Publish" button');
            console.log('6. Wait 1-2 minutes');
            console.log('7. Try again');
          }
          
          resolve(false);
        });
    });
  });
};

// Make it available globally
if (typeof window !== 'undefined') {
  window.checkStorageAuth = checkStorageAuth;
}

export default checkStorageAuth;

