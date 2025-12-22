import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithPopup,
  signInWithCredential,
  FacebookAuthProvider
} from 'firebase/auth';
import { doc, getDoc, setDoc, getFirestore } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
import { 
  isMobileDevice, 
  checkFacebookAppInstalled, 
  loginWithFacebookSDK,
  getFacebookCredential 
} from '@/utils/facebook';

const USERS_COLLECTION = 'users';

/**
 * Get current authenticated user with role
 */
export const getCurrentUser = async () => {
  const user = auth.currentUser;
  if (!user) return null;

  // Get user role from Firestore
  const userDoc = await getDoc(doc(db, USERS_COLLECTION, user.uid));
  const userData = userDoc.data();
  
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    role: userData?.role || 'USER', // Default to USER if no role set
    full_name: userData?.full_name || user.displayName || user.email?.split('@')[0],
    ...userData
  };
};

/**
 * Login with email and password
 */
export const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Get user role from Firestore
    let userDoc = await getDoc(doc(db, USERS_COLLECTION, user.uid));
    let userData = userDoc.data();
    
    // If user document doesn't exist, create it
    if (!userData) {
      await setDoc(doc(db, USERS_COLLECTION, user.uid), {
        email: user.email,
        full_name: user.displayName || user.email?.split('@')[0],
        role: 'USER', // Default role
        created_at: new Date().toISOString()
      });
      userData = {
        email: user.email,
        full_name: user.displayName || user.email?.split('@')[0],
        role: 'USER'
      };
    }
    
    const userInfo = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      role: userData?.role || 'USER',
      full_name: userData?.full_name || user.displayName || user.email?.split('@')[0],
      ...userData
    };
    
    return userInfo;
  } catch (error) {
    // Handle specific Firebase Auth errors
    let errorMessage = 'Нэвтрэхэд алдаа гарлаа';
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'Хэрэглэгч олдсонгүй. Эхлээд бүртгүүлнэ үү.';
    } else if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
      errorMessage = 'Имэйл эсвэл нууц үг буруу байна. Дахин шалгана уу.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Имэйл буруу форматтай байна';
    } else if (error.code === 'auth/user-disabled') {
      errorMessage = 'Энэ хэрэглэгч идэвхгүй болгосон';
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = 'Хэт олон оролдлого. Дараа дахин оролдоно уу';
    } else if (error.code === 'auth/network-request-failed') {
      errorMessage = 'Сүлжээний алдаа. Интернэт холболтоо шалгана уу';
    } else if (error.message) {
      errorMessage = error.message;
    }
    throw new Error(errorMessage);
  }
};

/**
 * Register new user - Always creates USER role (only one admin allowed)
 */
export const register = async (email, password, fullName) => {
  let userCredential = null;
  try {
    // Step 1: Create Firebase Auth user
    userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    if (!user || !user.uid) {
      throw new Error('Хэрэглэгч үүсгэхэд алдаа гарлаа');
    }
    
    // Step 2: Create user document in Firestore
    const userData = {
      email: user.email,
      full_name: fullName || user.email?.split('@')[0],
      role: 'USER', // Always USER for new registrations
      created_at: new Date().toISOString()
    };
    
    try {
      await setDoc(doc(db, USERS_COLLECTION, user.uid), userData);
    } catch (firestoreError) {
      // If Firestore write fails, log but don't fail registration
      // User is already created in Auth, so we can still return user info
      console.warn('Firestore user document creation failed:', firestoreError);
      // User can still login, document will be created on first login
    }
    
    // Return user info with all necessary fields
    const userInfo = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      role: 'USER',
      full_name: userData.full_name,
      ...userData
    };
    
    return userInfo;
  } catch (error) {
    // If Auth user was created but Firestore failed, we still have a user
    // Try to get user info even if Firestore write failed
    if (userCredential && userCredential.user) {
      const user = userCredential.user;
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        role: 'USER',
        full_name: fullName || user.email?.split('@')[0]
      };
    }
    
    // Handle Firebase Auth errors
    let errorMessage = 'Бүртгэл үүсгэхэд алдаа гарлаа';
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'Энэ имэйл аль хэдийн бүртгэлтэй байна';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Имэйл буруу форматтай байна';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Нууц үг хэт сул байна. Хамгийн багадаа 6 тэмдэгт байх ёстой';
    } else if (error.code === 'auth/network-request-failed') {
      errorMessage = 'Сүлжээний алдаа. Интернэт холболтоо шалгана уу';
    } else if (error.message) {
      errorMessage = error.message;
    }
    throw new Error(errorMessage);
  }
};

/**
 * Set user role (Admin only function)
 * Only allows one ADMIN user at a time
 */
export const setUserRole = async (userId, role) => {
  try {
    // If setting to ADMIN, check if another admin already exists
    if (role === 'ADMIN') {
      const { collection, query, where, getDocs } = await import('firebase/firestore');
      const adminQuery = query(
        collection(db, USERS_COLLECTION),
        where('role', '==', 'ADMIN')
      );
      const adminSnapshot = await getDocs(adminQuery);
      
      // Check if there's already an admin (excluding current user)
      const existingAdmins = adminSnapshot.docs.filter(doc => doc.id !== userId);
      if (existingAdmins.length > 0) {
        throw new Error('Зөвхөн нэг админ байх боломжтой. Одоогийн админыг эхлээд USER болгоно уу.');
      }
    }
    
    await setDoc(doc(db, USERS_COLLECTION, userId), {
      role: role
    }, { merge: true });
    return true;
  } catch (error) {
    throw new Error('Role тохируулахад алдаа гарлаа: ' + error.message);
  }
};

/**
 * Logout current user
 */
export const logout = async () => {
  await signOut(auth);
  // Clear localStorage
  localStorage.removeItem('user');
};

/**
 * Subscribe to auth state changes
 */
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      const user = await getCurrentUser();
      callback(user);
    } else {
      callback(null);
    }
  });
};

/**
 * Check if user is admin
 */
export const isAdmin = async () => {
  const user = await getCurrentUser();
  return user?.role === 'ADMIN';
};

/**
 * Send password reset email
 */
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return true;
  } catch (error) {
    let errorMessage = 'Нууц үг сэргээх email илгээхэд алдаа гарлаа';
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'Энэ имэйл бүртгэлтэй хэрэглэгч олдсонгүй';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Имэйл буруу форматтай байна';
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = 'Хэт олон оролдлого. Дараа дахин оролдоно уу';
    } else if (error.message) {
      errorMessage = error.message;
    }
    throw new Error(errorMessage);
  }
};

/**
 * Login with Facebook
 * Утсан дээрх Facebook апп-аар нэвтрэх (хэрэв боломжтой бол)
 * Эсвэл одоогийн Firebase popup ашиглах
 */
export const loginWithFacebook = async () => {
  try {
    // Mobile device дээр Facebook апп-аар нэвтрэх оролдлого
    if (isMobileDevice()) {
      try {
        const hasFacebookApp = await checkFacebookAppInstalled();
        
        if (hasFacebookApp) {
          // Facebook SDK-ийн native login ашиглах
          const facebookResponse = await loginWithFacebookSDK();
          const credential = await getFacebookCredential(facebookResponse.accessToken);
          const result = await signInWithCredential(auth, credential);
          const user = result.user;
          
          // Get user role from Firestore
          let userDoc = await getDoc(doc(db, USERS_COLLECTION, user.uid));
          let userData = userDoc.data();
          
          // If user document doesn't exist, create it
          if (!userData) {
            const newUserData = {
              email: user.email,
              full_name: user.displayName || user.email?.split('@')[0] || 'Facebook User',
              role: 'USER',
              created_at: new Date().toISOString(),
              provider: 'facebook'
            };
            
            try {
              await setDoc(doc(db, USERS_COLLECTION, user.uid), newUserData);
              userData = newUserData;
            } catch (firestoreError) {
              console.warn('Firestore user document creation failed:', firestoreError);
              userData = {
                email: user.email,
                full_name: user.displayName || user.email?.split('@')[0] || 'Facebook User',
                role: 'USER'
              };
            }
          }
          
          const userInfo = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            role: userData?.role || 'USER',
            full_name: userData?.full_name || user.displayName || user.email?.split('@')[0] || 'Facebook User',
            ...userData
          };
          
          return userInfo;
        }
      } catch (sdkError) {
        // Facebook SDK алдаа гарвал одоогийн popup flow ашиглах
        console.warn('Facebook SDK login алдаа, popup flow ашиглаж байна:', sdkError);
      }
    }
    
    // Desktop эсвэл Facebook SDK ажиллахгүй бол одоогийн popup flow ашиглах
    const provider = new FacebookAuthProvider();
    // Request email permission
    provider.addScope('email');
    
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    // Get user role from Firestore
    let userDoc = await getDoc(doc(db, USERS_COLLECTION, user.uid));
    let userData = userDoc.data();
    
    // If user document doesn't exist, create it
    if (!userData) {
      const newUserData = {
        email: user.email,
        full_name: user.displayName || user.email?.split('@')[0] || 'Facebook User',
        role: 'USER', // Default role for new Facebook users
        created_at: new Date().toISOString(),
        provider: 'facebook'
      };
      
      try {
        await setDoc(doc(db, USERS_COLLECTION, user.uid), newUserData);
        userData = newUserData;
      } catch (firestoreError) {
        console.warn('Firestore user document creation failed:', firestoreError);
        userData = {
          email: user.email,
          full_name: user.displayName || user.email?.split('@')[0] || 'Facebook User',
          role: 'USER'
        };
      }
    }
    
    const userInfo = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      role: userData?.role || 'USER',
      full_name: userData?.full_name || user.displayName || user.email?.split('@')[0] || 'Facebook User',
      ...userData
    };
    
    return userInfo;
  } catch (error) {
    let errorMessage = 'Facebook-ээр нэвтрэхэд алдаа гарлаа';
    
    if (error.code === 'auth/popup-closed-by-user') {
      errorMessage = 'Facebook нэвтрэх цонхыг хаасан байна';
    } else if (error.code === 'auth/popup-blocked') {
      errorMessage = 'Popup блоклогдсон байна. Browser settings-ээс зөвшөөрнө үү';
    } else if (error.code === 'auth/account-exists-with-different-credential') {
      errorMessage = 'Энэ имэйлээр өөр нэвтрэх аргаар бүртгэлтэй байна';
    } else if (error.code === 'auth/network-request-failed') {
      errorMessage = 'Сүлжээний алдаа. Интернэт холболтоо шалгана уу';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    throw new Error(errorMessage);
  }
};

