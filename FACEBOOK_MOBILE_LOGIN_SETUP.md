# Facebook Mobile App Login Тохируулах
# Утсан дээрх Facebook апп-аар нэвтрэх (Deep Linking)

## Тайлбар

Энэ функц нь утсан дээрх Facebook апп-аар шууд нэвтрэх боломжийг олгодог. Хэрэглэгчид вэб сайт дээрх "Facebook-ээр нэвтрэх" товчийг дарахад:

1. **Mobile device дээр**: Facebook SDK нь утсанд Facebook апп суулгасан байгаа эсэхийг шалгана
2. **Хэрэв апп байгаа бол**: Шууд Facebook апп нээгдэж, "Зөвшөөрөх үү?" гэсэн цонх гарч ирнэ
3. **Зөвшөөрсний дараа**: Буцаад таны сайт/апп руу нэвтэрсэн төлөвтэй шилжүүлнэ
4. **Хэрэв апп байхгүй эсвэл desktop дээр**: Одоогийн Firebase popup flow ашиглана

## Тохируулах

### 1. Facebook App ID олох

Facebook App ID-г олох 2 арга:

**Арга 1: Firebase Console**
1. [Firebase Console](https://console.firebase.google.com/) → Таны төсөл (`carsmongolia-d410a`)
2. **Authentication** → **Sign-in method** → **Facebook**
3. **App ID**-г тэмдэглэх

**Арга 2: Facebook Developers**
1. [Facebook Developers](https://developers.facebook.com/) → Таны App
2. **Settings** → **Basic**
3. **App ID**-г тэмдэглэх

### 2. Environment Variable тохируулах

`.env` файл үүсгэх (project root дээр):

```env
VITE_FACEBOOK_APP_ID=your_facebook_app_id_here
```

**Жишээ:**
```env
VITE_FACEBOOK_APP_ID=1234567890123456
```

### 3. Facebook App Settings тохируулах

#### 3.1. Facebook Login Settings

1. [Facebook Developers](https://developers.facebook.com/) → Таны App
2. **Facebook Login** → **Settings**
3. **Valid OAuth Redirect URIs** дээр дараах URI-уудыг нэмэх:
   ```
   https://carsmongolia-d410a.firebaseapp.com/__/auth/handler
   https://carsmongolia.mn/__/auth/handler
   ```

#### 3.2. Mobile App Settings (iOS/Android)

Хэрэв та native mobile app байгаа бол:

**iOS:**
1. **Settings** → **Basic** → **Add Platform** → **iOS**
2. **Bundle ID** оруулах
3. **Facebook Login** → **Settings** → **iOS Bundle ID** нэмэх

**Android:**
1. **Settings** → **Basic** → **Add Platform** → **Android**
2. **Package Name** оруулах
3. **Facebook Login** → **Settings** → **Android Package Name** нэмэх

### 4. Facebook App Review (Production)

Production mode-д Facebook Login ажиллахын тулд:

1. **App Review** → **Permissions and Features**
2. `email` permission-ийг review хийлгэх
3. App-ийг **Live Mode** болгох

**Development mode-д**: Зөвхөн app admin/developer нэвтрэх боломжтой

## Ашиглалт

### Хэрэглэгчийн хувьд:

1. Mobile device дээр вэб сайт руу орох
2. `/login` хуудас дээр **Facebook-ээр нэвтрэх** товч дарна
3. Facebook апп автоматаар нээгдэнэ (хэрэв суулгасан бол)
4. "Зөвшөөрөх үү?" гэсэн цонх дээр **Зөвшөөрөх** дарна
5. Буцаад сайт руу нэвтэрсэн төлөвтэй шилжүүлнэ

### Developer-ийн хувьд:

**Code дээр:**
```javascript
import { loginWithFacebook } from '@/services/auth';

// Mobile device дээр Facebook апп-аар нэвтрэх (автоматаар)
// Desktop дээр popup ашиглах
const user = await loginWithFacebook();
```

## Техникийн Дэлгэрэнгүй

### Файлууд:

- `src/utils/facebook.js` - Facebook SDK utilities
- `src/services/auth.js` - `loginWithFacebook()` функц
- `index.html` - Facebook SDK script

### Flow:

1. **Mobile device шалгах**: `isMobileDevice()` функц
2. **Facebook апп шалгах**: `checkFacebookAppInstalled()` функц
3. **Facebook SDK login**: `loginWithFacebookSDK()` функц
4. **Firebase credential**: `getFacebookCredential()` функц
5. **Firebase sign in**: `signInWithCredential()` функц
6. **Fallback**: Хэрэв SDK ажиллахгүй бол `signInWithPopup()` ашиглах

### Deep Linking:

Facebook SDK нь автоматаар deep linking хийж, Facebook апп-аас буцаад сайт руу redirect хийх боломжийг олгодог.

## Алдаа засах

### "Facebook App ID тохируулаагүй" алдаа

**Шалгах:**
1. `.env` файл байгаа эсэхийг шалгах
2. `VITE_FACEBOOK_APP_ID` environment variable зөв оруулсан эсэхийг шалгах
3. Development server-ийг дахин эхлүүлэх (`npm run dev`)

**Шийдэл:**
```bash
# .env файл үүсгэх
echo "VITE_FACEBOOK_APP_ID=your_app_id" > .env

# Development server дахин эхлүүлэх
npm run dev
```

### "Facebook SDK ачаалагдсангүй" алдаа

**Шалгах:**
1. Интернэт холболт байгаа эсэхийг шалгах
2. Browser console дээр алдаа байгаа эсэхийг шалгах
3. Facebook SDK script `index.html` дээр байгаа эсэхийг шалгах

**Шийдэл:**
- Browser cache цэвэрлэх
- Incognito/Private mode ашиглах
- Интернэт холболт шалгах

### Facebook апп нээгдэхгүй байна

**Шалгах:**
1. Facebook апп суулгасан эсэхийг шалгах
2. Facebook апп-д нэвтэрсэн эсэхийг шалгах
3. Facebook App ID зөв эсэхийг шалгах

**Шийдэл:**
- Facebook апп суулгах
- Facebook апп-д нэвтрэх
- Facebook App ID зөв эсэхийг шалгах

### Desktop дээр popup ажиллахгүй байна

**Шалгах:**
1. Browser popup блоклогдсон эсэхийг шалгах
2. Browser settings дээр popup зөвшөөрсөн эсэхийг шалгах

**Шийдэл:**
- Browser settings дээр popup зөвшөөрөх
- Эсвэл `signInWithRedirect` ашиглах (popup-ийн оронд)

## Тест хийх

### Mobile Device дээр:

1. Mobile device дээр вэб сайт руу орох
2. `/login` хуудас руу орох
3. **Facebook-ээр нэвтрэх** товч дарна
4. Facebook апп нээгдэж байгаа эсэхийг шалгах
5. "Зөвшөөрөх үү?" цонх дээр **Зөвшөөрөх** дарна
6. Буцаад сайт руу нэвтэрсэн эсэхийг шалгах

### Desktop дээр:

1. Desktop browser дээр вэб сайт руу орох
2. `/login` хуудас руу орох
3. **Facebook-ээр нэвтрэх** товч дарна
4. Popup цонх гарч ирэх ёстой
5. Facebook account-оороо нэвтрэх
6. Буцаад сайт руу нэвтэрсэн эсэхийг шалгах

## Чухал Тэмдэглэл

1. **Facebook App ID шаардлагатай**: `.env` файл дээр `VITE_FACEBOOK_APP_ID` тохируулах хэрэгтэй
2. **HTTPS шаардлагатай**: Facebook Login зөвхөн HTTPS дээр ажиллана
3. **Mobile device дээр**: Facebook апп суулгасан байх ёстой (ихэвчлэн байдаг)
4. **Desktop дээр**: Popup flow ашиглана (Facebook апп шаардлагагүй)
5. **Development mode**: Зөвхөн app admin/developer нэвтрэх боломжтой
6. **Production mode**: App Review хийлгэх хэрэгтэй

## Ашиг

✅ **Хэрэглэгчдэд хялбар**: Facebook апп-аар шууд нэвтрэх  
✅ **Нууц үг шаардлагагүй**: Facebook account-оороо нэвтрэх  
✅ **Хурдан**: Facebook апп аль хэдийн нээлттэй байдаг  
✅ **Аюулгүй**: Facebook OAuth ашиглах  
✅ **Fallback**: Хэрэв апп байхгүй бол popup ашиглах  

## Дэмжлэг

Асуулт эсвэл алдаа гарвал:
1. Browser console дээр алдаа шалгах
2. Network tab дээр request шалгах
3. Facebook App Settings шалгах
4. Firebase Console дээр Authentication settings шалгах

