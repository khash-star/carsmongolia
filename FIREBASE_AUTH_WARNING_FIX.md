# Firebase Auth Warning Засах

## ⚠️ Console Warning

```
A Partitioned cookie or storage access was provided to "https://carsmongolia-d410a.firebaseapp.com//auth/iframe..."
```

Энэ нь Firefox-ийн **Dynamic State Partitioning** feature-тэй холбоотой warning байна.

## 🔍 Тайлбар

- Firebase Auth нь iframe ашиглан authentication хийж байна
- Firefox нь third-party cookies-ийг partition хийж байна
- Энэ нь ихэвчлэн warning байдаг, гэхдээ функц ажиллах ёстой

## ✅ Шийдэл

### 1. Browser Settings шалгах

**Firefox:**
1. `about:preferences#privacy` руу орох
2. **Cookies and Site Data** хэсэг
3. **Enhanced Tracking Protection** settings шалгах
4. **Custom** сонгох, **Cookies** → **All cookies** сонгох

**Chrome:**
1. Settings → Privacy and security → Cookies and other site data
2. **Allow all cookies** сонгох (development-д)

### 2. Facebook Login Settings шалгах

1. [Facebook Developers](https://developers.facebook.com/) → Таны App
2. **Settings** → **Basic**:
   - **App Domains**: `carsmongolia.mn` байгаа эсэхийг шалгах
   - **Website** → **Site URL**: `https://carsmongolia.mn`
3. **Facebook Login** → **Settings**:
   - **Valid OAuth Redirect URIs**:
     ```
     https://carsmongolia.mn/__/auth/handler
     https://carsmongolia-d410a.firebaseapp.com/__/auth/handler
     ```

### 3. Firebase Authorized Domains шалгах

1. [Firebase Console](https://console.firebase.google.com/) → `carsmongolia-d410a`
2. **Authentication** → **Settings**
3. **Authorized domains** хэсэг:
   - `carsmongolia.mn` байгаа эсэхийг шалгах
   - Хэрэв байхгүй бол **Add domain** → `carsmongolia.mn` нэмэх

### 4. HTTPS шалгах

Facebook Login зөвхөн HTTPS дээр ажиллана:
- `http://carsmongolia.mn` - ❌ Ажиллахгүй
- `https://carsmongolia.mn` - ✅ Ажиллана

### 5. Browser Cache цэвэрлэх

1. **Ctrl + Shift + Delete**
2. **Cookies and site data** сонгох
3. **Clear data** дарна
4. Хуудас refresh хийх

### 6. Incognito/Private Mode ашиглах

Warning-ийг тест хийхэд:
1. Incognito/Private window нээх
2. `https://carsmongolia.mn/login` руу орох
3. Facebook login тест хийх

## 🔧 Code Level Fix (Хэрэв шаардлагатай бол)

Хэрэв warning нь Facebook login-д нөлөөлж байгаа бол, `signInWithRedirect` ашиглах:

```javascript
// src/services/auth.js
import { signInWithRedirect, getRedirectResult } from 'firebase/auth';

// Popup-ийн оронд redirect ашиглах
export const loginWithFacebook = async () => {
  try {
    const provider = new FacebookAuthProvider();
    provider.addScope('email');
    
    // Redirect ашиглах (popup-ийн оронд)
    await signInWithRedirect(auth, provider);
  } catch (error) {
    // Error handling
  }
};

// Redirect result-ийг handle хийх
export const handleFacebookRedirect = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      // User logged in
      return result.user;
    }
  } catch (error) {
    // Error handling
  }
};
```

## 📝 Тест хийх

1. Browser Console (F12) нээх
2. Warning харагдаж байгаа эсэхийг шалгах
3. Facebook login товч дарна
4. Popup нээгдэж байгаа эсэхийг шалгах
5. Нэвтрэх ажиллаж байгаа эсэхийг шалгах

## ⚠️ Чухал

- Энэ warning нь ихэвчлэн хэвийн байдаг
- Firebase Auth ажиллах ёстой
- Хэрэв Facebook login ажиллахгүй байгаа бол:
  1. Authorized domains шалгах
  2. Facebook App Settings шалгах
  3. HTTPS шалгах
  4. Browser settings шалгах

## 🔗 Холбогдох файлууд

- `src/services/auth.js` - Facebook login функц
- `src/config/firebase.js` - Firebase config
- `FACEBOOK_LOGIN_SETUP.md` - Facebook login тохируулах

