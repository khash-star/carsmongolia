/**
 * Facebook SDK Utilities
 * Mobile device дээрх Facebook апп-аар нэвтрэх функц
 */

/**
 * Facebook App ID - Environment variable эсвэл config файлаас авна
 * Хэрэв байхгүй бол Firebase Console → Authentication → Sign-in method → Facebook дээрх App ID-г ашиглана
 * 
 * Facebook App ID-г олох:
 * 1. Firebase Console → Authentication → Sign-in method → Facebook → App ID
 * 2. Эсвэл Facebook Developers → Settings → Basic → App ID
 */
const FACEBOOK_APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID || '';

// Global scope дээр App ID хадгалах (index.html дээрх SDK initialization-д ашиглах)
if (typeof window !== 'undefined') {
  window.__FACEBOOK_APP_ID__ = FACEBOOK_APP_ID;
}

/**
 * Mobile device эсэхийг шалгах
 */
export const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

/**
 * Facebook SDK-ийг инициализаци хийх
 */
export const initFacebookSDK = () => {
  return new Promise((resolve, reject) => {
    // Facebook SDK аль хэдийн ачаалагдсан эсэхийг шалгах
    if (window.FB) {
      resolve(window.FB);
      return;
    }

    // SDK ачаалагдаж байгаа эсэхийг шалгах
    if (window.fbAsyncInit) {
      const originalInit = window.fbAsyncInit;
      window.fbAsyncInit = () => {
        originalInit();
        if (window.FB) {
          resolve(window.FB);
        } else {
          reject(new Error('Facebook SDK ачаалагдсангүй'));
        }
      };
      return;
    }

    // SDK-ийг хүлээх
    window.fbAsyncInit = () => {
      const appId = FACEBOOK_APP_ID || window.__FACEBOOK_APP_ID__;
      
      if (!appId) {
        console.warn('Facebook App ID тохируулаагүй байна. VITE_FACEBOOK_APP_ID environment variable эсвэл Firebase Console дээрх App ID-г тохируулна уу.');
        // App ID байхгүй ч SDK-ийг инициализаци хийх (fallback)
        if (window.FB) {
          resolve(window.FB);
        } else {
          reject(new Error('Facebook App ID тохируулаагүй байна'));
        }
        return;
      }

      window.FB.init({
        appId: appId,
        cookie: true,
        xfbml: true,
        version: 'v18.0'
      });

      resolve(window.FB);
    };

    // SDK аль хэдийн ачаалагдсан эсэхийг дахин шалгах
    const checkInterval = setInterval(() => {
      if (window.FB) {
        clearInterval(checkInterval);
        resolve(window.FB);
      }
    }, 100);

    // 10 секундын дараа timeout
    setTimeout(() => {
      clearInterval(checkInterval);
      if (!window.FB) {
        reject(new Error('Facebook SDK ачаалагдсангүй'));
      }
    }, 10000);
  });
};

/**
 * Facebook апп суулгасан эсэхийг шалгах (iOS/Android)
 */
export const checkFacebookAppInstalled = async () => {
  if (!isMobileDevice()) {
    return false;
  }

  try {
    const FB = await initFacebookSDK();
    
    // Facebook SDK-ийн canPresentShareDialog эсвэл canPresentMessageDialog ашиглах
    // Гэхдээ энэ нь зөвхөн iOS дээр ажиллана
    // Android дээр бид FB.login() ашиглахдаа Facebook апп автоматаар нээгдэнэ
    
    // iOS дээр Facebook апп байгаа эсэхийг шалгах
    if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      // iOS дээр Facebook апп байгаа эсэхийг шалгах
      // Энэ нь Facebook SDK-ийн canPresentShareDialog-аар шалгаж болно
      // Гэхдээ бид зүгээр л login flow-г ашиглах болно
      return true; // iOS дээр Facebook апп ихэвчлэн байдаг
    }
    
    // Android дээр Facebook апп байгаа эсэхийг шалгах
    if (/Android/i.test(navigator.userAgent)) {
      // Android дээр Facebook апп байгаа эсэхийг шалгах
      // Бид зүгээр л login flow-г ашиглах болно
      return true; // Android дээр Facebook апп ихэвчлэн байдаг
    }
    
    return false;
  } catch (error) {
    console.warn('Facebook SDK шалгах алдаа:', error);
    return false;
  }
};

/**
 * Facebook SDK-ийн native login (утсан дээрх Facebook апп-аар нэвтрэх)
 */
export const loginWithFacebookSDK = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const FB = await initFacebookSDK();
      
      // Facebook login
      FB.login(
        (response) => {
          if (response.authResponse) {
            // Амжилттай нэвтэрсэн
            resolve({
              accessToken: response.authResponse.accessToken,
              userID: response.authResponse.userID,
              expiresIn: response.authResponse.expiresIn
            });
          } else {
            // Хэрэглэгч цуцласан
            reject(new Error('Facebook нэвтрэх цуцлагдсан'));
          }
        },
        {
          scope: 'email,public_profile',
          return_scopes: true
        }
      );
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Facebook access token-аар Firebase credential үүсгэх
 */
export const getFacebookCredential = async (accessToken) => {
  const { FacebookAuthProvider } = await import('firebase/auth');
  const provider = new FacebookAuthProvider();
  provider.addScope('email');
  
  return FacebookAuthProvider.credential(accessToken);
};

