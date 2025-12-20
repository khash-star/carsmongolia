import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { onAuthStateChanged } from 'firebase/auth';
import { storage, auth } from '@/config/firebase';

/**
 * Wait for auth state to be ready
 */
const waitForAuth = () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    }, reject);
    
    // Timeout after 5 seconds
    setTimeout(() => {
      unsubscribe();
      resolve(auth.currentUser);
    }, 5000);
  });
};

/**
 * Upload file to Firebase Storage
 * Returns the download URL
 */
export const uploadFile = async (file, path = 'uploads') => {
  // Wait for auth state to be ready
  const currentUser = await waitForAuth();
  
  if (!currentUser) {
    console.error('Auth state:', {
      currentUser: auth.currentUser,
      localStorage: localStorage.getItem('user')
    });
    throw new Error('Нэвтэрнэ үү. Зураг upload хийхэд нэвтрэх шаардлагатай.');
  }
  
  console.log('Uploading file as user:', currentUser.email);

  try {
    const timestamp = Date.now();
    // Sanitize filename - remove special characters
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${path}/${timestamp}_${sanitizedFileName}`;
    const storageRef = ref(storage, fileName);
    
    // Upload file
    await uploadBytes(storageRef, file);
    
    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);
    
    return {
      file_url: downloadURL,
      file_name: file.name,
      file_path: fileName
    };
  } catch (error) {
    console.error('Storage upload error:', {
      code: error.code,
      message: error.message,
      currentUser: auth.currentUser?.email,
      error: error
    });
    
    let errorMessage = 'Зураг upload хийхэд алдаа гарлаа';
    
    if (error.code === 'storage/unauthorized' || error.code === 'storage/permission-denied') {
      errorMessage = 'Зураг upload хийх эрхгүй байна. Firebase Console дээр Storage Rules шалгана уу.';
    } else if (error.code === 'storage/canceled') {
      errorMessage = 'Upload цуцлагдлаа';
    } else if (error.code === 'storage/unknown') {
      errorMessage = 'Тодорхойгүй алдаа гарлаа';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    // If 403 error, provide specific guidance
    if (error.code === 'storage/permission-denied' || error.message?.includes('403')) {
      errorMessage = '403 Алдаа: Firebase Console → Storage → Rules дээр "Publish" хийх шаардлагатай.';
    }
    
    throw new Error(errorMessage);
  }
};

/**
 * Upload multiple files
 */
export const uploadFiles = async (files, path = 'uploads') => {
  const uploadPromises = files.map(file => uploadFile(file, path));
  return Promise.all(uploadPromises);
};

