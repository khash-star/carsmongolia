# Facebook Login Тохируулах

## 1. Firebase Console дээр Facebook Provider идэвхжүүлэх

1. [Firebase Console](https://console.firebase.google.com/) руу орох
2. Таны төсөл (`carsmongolia-d410a`) сонгох
3. **Authentication** → **Sign-in method** руу орох
4. **Facebook** provider олох
5. **Enable** товч дарж идэвхжүүлэх
6. Дараах мэдээллийг оруулах:
   - **App ID**: Facebook App ID
   - **App secret**: Facebook App Secret

## 2. Facebook Developer Console дээр App үүсгэх

Хэрэв Facebook App байхгүй бол:

1. [Facebook Developers](https://developers.facebook.com/) руу орох
2. **My Apps** → **Create App** дарна
3. **Consumer** төрөл сонгох
4. App нэр оруулах (жишээ: "AutoZar")
5. **Create App** дарна

## 3. Facebook App Settings тохируулах

1. Facebook App dashboard дээр:
   - **Settings** → **Basic** руу орох
   - **App ID** болон **App Secret**-ийг тэмдэглэх
   - **Add Platform** → **Website** сонгох
   - **Site URL** оруулах:
     - Development: `http://localhost:5173`
     - Production: Таны production domain (жишээ: `https://yourdomain.com`)

2. **Facebook Login** → **Settings**:
   - **Valid OAuth Redirect URIs** дээр:
     ```
     https://carsmongolia-d410a.firebaseapp.com/__/auth/handler
     ```
     Энэ URI-г нэмэх

3. **App Review** (Production хэрэглэхэд):
   - Facebook Login permissions-ийг review хийлгэх хэрэгтэй
   - Development mode-д зөвхөн app admin/developer нэвтрэх боломжтой

## 4. Firebase Console дээр Facebook мэдээлэл оруулах

1. Firebase Console → Authentication → Sign-in method → Facebook
2. **App ID** болон **App Secret** оруулах
3. **Save** дарна

## 5. Authorized Domains шалгах

Firebase Console → Authentication → Settings → **Authorized domains**:
- `localhost` байх ёстой (development)
- Production domain-оо нэмэх

## 6. Тест хийх

1. Development server ажиллуулах: `npm run dev`
2. `/login` хуудас руу орох
3. **Facebook-ээр нэвтрэх** товч дарна
4. Facebook login popup гарч ирэх ёстой
5. Facebook account-оороо нэвтрэх
6. Амжилттай нэвтэрсэн бол home page руу redirect хийгдэнэ

## Алдаа засах

### "Popup blocked" алдаа
- Browser settings дээр popup зөвшөөрөх
- Эсвэл `signInWithRedirect` ашиглах (popup-ийн оронд)

### "App Not Setup" алдаа
- Facebook App ID болон Secret зөв оруулсан эсэхийг шалгах
- Firebase Console дээр Facebook provider идэвхтэй эсэхийг шалгах

### "Invalid OAuth Redirect URI" алдаа
- Facebook App Settings дээр Valid OAuth Redirect URIs-д Firebase auth handler URI нэмэх:
  ```
  https://carsmongolia-d410a.firebaseapp.com/__/auth/handler
  ```

### Development mode-д зөвхөн admin нэвтрэх боломжтой
- Facebook App-ийг **Development Mode**-д байгаа
- Production хэрэглэхэд **App Review** хийлгэх хэрэгтэй
- Эсвэл Facebook App Settings дээр **Test Users** нэмэх

## Ашиглалт

Одоо хэрэглэгчид `/login` хуудас дээр:
1. Имэйл/нууц үгээр нэвтрэх
2. **Facebook-ээр нэвтрэх** товч дарж Facebook account-оороо нэвтрэх

Facebook-ээр нэвтэрсэн хэрэглэгчид автоматаар Firestore дээр `users` collection-д бүртгэгдэнэ (`role: 'USER'`).

