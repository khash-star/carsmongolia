# Domain Тохируулах (carsmongolia.mn)

## 1. Firebase Console дээр Authorized Domain нэмэх

1. [Firebase Console](https://console.firebase.google.com/) → Таны төсөл (`carsmongolia-d410a`)
2. **Authentication** → **Settings** (Settings tab)
3. **Authorized domains** хэсэг олох
4. **Add domain** товч дарна
5. Domain оруулах: `carsmongolia.mn`
6. **Add** дарна

**Одоогийн Authorized domains:**
- `localhost` (development)
- `carsmongolia.mn` (production) ← Шинээр нэмэх

## 2. Facebook App Settings дээр Domain тохируулах

### 2.1. Facebook Developer Console

1. [Facebook Developers](https://developers.facebook.com/) → Таны App
2. **Settings** → **Basic**:
   - **App Domains** дээр: `carsmongolia.mn` нэмэх
   - **Website** platform-д:
     - **Site URL**: `https://carsmongolia.mn`

### 2.2. Facebook Login Settings

1. **Facebook Login** → **Settings**
2. **Valid OAuth Redirect URIs** дээр дараах URI-уудыг нэмэх:
   ```
   https://carsmongolia.mn/__/auth/handler
   https://carsmongolia-d410a.firebaseapp.com/__/auth/handler
   ```

### 2.3. Facebook App Review (Production хэрэглэхэд)

Production mode-д Facebook Login ажиллахын тулд:
1. **App Review** → **Permissions and Features**
2. `email` permission-ийг review хийлгэх
3. App-ийг **Live Mode** болгох

## 3. Production Build хийх

```bash
npm run build
```

Build хийсний дараа `dist/` folder үүснэ.

## 4. Deploy хийх

### 4.1. Firebase Hosting ашиглах (Зөвлөмж)

1. Firebase Console → **Hosting**
2. **Get started** дарна (хэрэв анх удаа)
3. Terminal дээр:

```bash
# Firebase CLI суулгах (хэрэв байхгүй бол)
npm install -g firebase-tools

# Firebase-д нэвтрэх
firebase login

# Firebase project сонгох
firebase use carsmongolia-d410a

# Hosting идэвхжүүлэх
firebase init hosting

# Build хийх
npm run build

# Deploy хийх
firebase deploy --only hosting
```

### 4.2. Custom Domain тохируулах (Firebase Hosting)

1. Firebase Console → **Hosting** → **Add custom domain**
2. Domain оруулах: `carsmongolia.mn`
3. Firebase DNS records-ийг domain provider (DNS) дээр тохируулах:
   - A record эсвэл CNAME record нэмэх
   - Firebase-аас өгсөн DNS records-ийг ашиглах

### 4.3. Бусад Hosting Provider ашиглах

Хэрэв өөр hosting provider (жишээ: Vercel, Netlify, AWS) ашиглаж байвал:
- Тэдгээр provider-ийн documentation дагах
- Environment variables тохируулах
- Build command: `npm run build`
- Output directory: `dist`

## 5. SSL Certificate (HTTPS)

Firebase Hosting автоматаар SSL certificate өгдөг. Бусад provider ашиглаж байвал:
- Let's Encrypt ашиглах
- Эсвэл provider-ийн SSL service ашиглах

**Чухал:** Facebook Login зөвхөн HTTPS дээр ажиллана (HTTP дээр ажиллахгүй).

## 6. Environment Variables (Production)

Production дээр дараах environment variables тохируулах:

```env
VITE_FIREBASE_API_KEY=AIzaSyAEW1YnJ_xm_YnPzW9y1iSmdQIrgOsfjlA
VITE_FIREBASE_AUTH_DOMAIN=carsmongolia-d410a.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=carsmongolia-d410a
VITE_FIREBASE_STORAGE_BUCKET=carsmongolia-d410a.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=483533885994
VITE_FIREBASE_APP_ID=1:483533885994:web:e6718b4668f1896cf32953
```

## 7. Тест хийх

1. Production URL руу орох: `https://carsmongolia.mn`
2. `/login` хуудас руу орох
3. **Facebook-ээр нэвтрэх** товч дарна
4. Facebook login popup гарч ирэх ёстой
5. Нэвтэрсний дараа redirect зөв ажиллах ёстой

## 8. Troubleshooting

### Facebook login ажиллахгүй байвал:

1. **Authorized domains шалгах:**
   - Firebase Console → Authentication → Settings → Authorized domains
   - `carsmongolia.mn` байгаа эсэхийг шалгах

2. **Facebook App Settings шалгах:**
   - Valid OAuth Redirect URIs дээр `https://carsmongolia.mn/__/auth/handler` байгаа эсэхийг шалгах
   - App Domains дээр `carsmongolia.mn` байгаа эсэхийг шалгах

3. **HTTPS шалгах:**
   - Facebook Login зөвхөн HTTPS дээр ажиллана
   - Browser console дээр алдаа шалгах

4. **CORS алдаа гарвал:**
   - Firebase Storage болон Firestore rules шалгах
   - Authorized domains дээр domain нэмсэн эсэхийг шалгах

## 9. DNS Records (Domain Provider дээр)

Хэрэв Firebase Hosting ашиглаж байвал, domain provider (DNS) дээр дараах records нэмэх:

Firebase Console → Hosting → Custom domain → DNS configuration-оос records авна.

Ерөнхийдөө:
- **A record** эсвэл **CNAME record** нэмэх
- Firebase-аас өгсөн IP address эсвэл hostname ашиглах

## 10. Checklist

- [ ] Firebase Console → Authentication → Authorized domains дээр `carsmongolia.mn` нэмсэн
- [ ] Facebook App → Settings → App Domains дээр `carsmongolia.mn` нэмсэн
- [ ] Facebook App → Facebook Login → Valid OAuth Redirect URIs дээр `https://carsmongolia.mn/__/auth/handler` нэмсэн
- [ ] Domain DNS records тохируулсан
- [ ] SSL certificate идэвхтэй (HTTPS)
- [ ] Production build хийсэн (`npm run build`)
- [ ] Deploy хийсэн
- [ ] Production URL дээр тест хийсэн

