# Firebase Email Template Тохируулах

## 🔴 Асуудал
Нууц үг сэргээх email ирэхгүй байна.

## ✅ Шийдэл

### Алхам 1: Firebase Console руу орох

1. Браузер дээр оч: https://console.firebase.google.com
2. **carsmongolia-d410a** project сонгох
3. Зүүн цэснээс **Authentication** дээр дарах

### Алхам 2: Email Templates тохируулах

1. **Authentication** хуудас дээр **"Templates"** таб дээр дарах
2. **"Password reset"** template олох
3. **"Edit"** эсвэл **"Customize"** товч дарах

### Алхам 3: Email Template засах

**Subject (Гарчиг):**
```
Нууц үг сэргээх - AutoZar
```

**Email body (Мэдээлэл):**
```
Сайн байна уу,

Та нууц үг сэргээх хүсэлт илгээсэн байна.

Дараах линк дээр дараад шинэ нууц үг тохируулна уу:
%LINK%

Энэ линк 24 цагийн дараа дуусна.

Хэрэв та нууц үг сэргээх хүсэлт илгээгээгүй бол энэ email-ийг үл тоомсорлож болно.

Хүндэтгэсэн,
AutoZar баг
```

**Action URL (Линк):**

Firebase email template дээр зөвхөн `%LINK%` placeholder ашиглах (автоматаар зөв URL үүсгэнэ):

```
%LINK%
```

**Эсвэл тодорхой URL оруулах:**

**Localhost (Development):**
```
http://localhost:5173/__/auth/action?mode=%MODE%&oobCode=%OOB_CODE%
```

**Production (Firebase Hosting):**
```
https://carsmongolia-d410a.firebaseapp.com/__/auth/action?mode=%MODE%&oobCode=%OOB_CODE%
```

**Custom Domain (хэрэв байгаа бол):**
```
https://your-domain.com/__/auth/action?mode=%MODE%&oobCode=%OOB_CODE%
```

**⚠️ Чухал:** `%LINK%` placeholder ашиглах нь хамгийн сайн арга (Firebase автоматаар зөв URL үүсгэнэ)

### Алхам 4: Email илгээгч тохируулах

**⚠️ Чухал:** Firebase Authentication нь өөрийн email service ашигладаг бөгөөд sender email (`noreply@carsmongolia.mn`) тохируулах боломжгүй. Firebase-ийн default sender email: `noreply@[project-id].firebaseapp.com`

**Хэрэв `noreply@carsmongolia.mn`-аас email илгээх хэрэгтэй бол:**

**⚠️ Чухал:** Firebase Authentication email-үүд (нууц үг сэргээх, email verification) нь Firebase-ийн дотоод системээр илгээгддэг бөгөөд sender email өөрчлөх боломжгүй. Extensions нь Authentication email-д ажиллахгүй.

#### Сонголт 1: Cloud Functions ашиглах (Зөвлөмж)

Custom email service (SMTP, SendGrid, Mailgun) ашиглах Cloud Functions үүсгэх:

1. **Cloud Functions үүсгэх:**
   - Authentication trigger ашиглах
   - Custom email service ашиглах
   - `noreply@carsmongolia.mn`-аас email илгээх

2. **SMTP Settings:**
   - **SMTP Host:** `smtp.itools.mn` (эсвэл email provider-ийн SMTP)
   - **SMTP Port:** `587` (эсвэл `465`)
   - **SMTP User:** `noreply@carsmongolia.mn`
   - **SMTP Password:** Email account password
   - **From Email:** `noreply@carsmongolia.mn`

#### Сонголт 2: Firebase Extensions (Firestore Email)

**"Trigger Email from Firestore"** extension ашиглах (Authentication email биш, Firestore trigger email):

1. **Firebase Console → Extensions** руу орох
2. **"Trigger Email from Firestore"** extension суулгах
3. Firestore document-д үндэслэн email илгээх
4. SMTP settings тохируулах:
   - **SMTP Host:** `smtp.itools.mn`
   - **SMTP Port:** `587`
   - **SMTP User:** `noreply@carsmongolia.mn`
   - **SMTP Password:** Email account password
   - **From Email:** `noreply@carsmongolia.mn`
   - **From Name:** `AutoZar`

**Чухал:** Энэ extension нь Authentication email-д ажиллахгүй, зөвхөн Firestore trigger email-д ажиллана.

#### Сонголт 3: Firebase Default Email Service (Одоогийн)

Firebase-ийн default email service ашиглах:
- Sender: `noreply@carsmongolia-d410a.firebaseapp.com`
- Email authentication зөв тохируулагдсан бол spam folder-д бага орох
- Authentication email-үүд автоматаар илгээгдэнэ

#### Сонголт 3: Firebase Default Email Service (Одоогийн)

Firebase-ийн default email service ашиглах (sender email өөрчлөх боломжгүй):
- Sender: `noreply@carsmongolia-d410a.firebaseapp.com`
- Email authentication зөв тохируулагдсан бол spam folder-д бага орох

**Authentication Settings:**

1. **Authentication** → **Settings** таб руу орох
2. **"Authorized domains"** хэсэгт:
   - `localhost` байгаа эсэхийг шалгах
   - Хэрэв байхгүй бол нэмэх
3. **"Email action handler URL"** хэсэгт:
   - **Localhost (Development):** `http://localhost:5173/__/auth/action`
   - **Production:** `https://carsmongolia-d410a.firebaseapp.com/__/auth/action`
   - **Custom Domain:** `https://carsmongolia.mn/__/auth/action`
   - Хэрэв байхгүй бол нэмэх
   - **Эсвэл зөвхөн:** `%LINK%` (Firebase автоматаар зөв URL үүсгэнэ)

### Алхам 5: Email илгээх service идэвхжүүлэх

1. Firebase Console → **Project Settings** (⚙️ icon) → **Cloud Messaging** таб
2. **"Cloud Messaging API (Legacy)"** идэвхтэй эсэхийг шалгах
3. Хэрэв идэвхгүй бол идэвхжүүлэх

---

## 🔍 Тест хийх

### Арга 1: App дээр тест хийх

1. `/login` хуудас руу орох
2. "Нууц үг мартсан уу?" линк дээр дарах
3. Email оруулах (`khashpay@gmail.com`)
4. "Илгээх" товч дарах
5. Email-ээ шалгах (spam folder-ийг бас шалгах)

### Арга 2: Firebase Console дээр тест хийх

1. Firebase Console → Authentication → Users
2. `khashpay@gmail.com` хэрэглэгчийг олох
3. Хэрэглэгчийн мөр дээр дарах
4. **"Reset password"** товч дарах
5. Email-ээ шалгах

---

## 🆘 Хэрэв email ирэхгүй байсаар байвал

### 1. Spam Folder шалгах

- Gmail: Spam folder
- Outlook: Junk folder
- Бусад email provider: Spam/Junk folder

### 2. Email Address шалгах

- Email зөв байгаа эсэхийг шалгах
- Firebase Console → Authentication → Users дээр email зөв байгаа эсэхийг шалгах

### 3. Firebase Email Service шалгах

- Firebase Console → Project Settings → Cloud Messaging
- Email service идэвхтэй эсэхийг шалгах

### 4. Email Template шалгах

- Firebase Console → Authentication → Templates
- Password reset template идэвхтэй эсэхийг шалгах
- Email body дээр `%LINK%` placeholder байгаа эсэхийг шалгах

### 5. Authorized Domains шалгах

- Firebase Console → Authentication → Settings → Authorized domains
- `localhost` байгаа эсэхийг шалгах
- Production domain байгаа эсэхийг шалгах

---

## 📝 Чухал Тайлбар

- Email ирэхэд 1-5 минутын хугацаа шаардагдана
- Email spam folder-д орох магадлалтай
- Email template тохируулаагүй бол default template ашиглана
- Authorized domains тохируулаагүй бол email илгээхгүй байж магадгүй

---

## 🔧 Альтернатив: Firebase Console дээр шууд нууц үг тохируулах

Хэрэв email ирэхгүй байвал:

1. Firebase Console → Authentication → Users
2. `khashpay@gmail.com` хэрэглэгчийг олох
3. Хэрэглэгчийн мөр дээр дарах
4. **"..."** (гурван цэг) товч дарах
5. **"Change password"** эсвэл **"Reset password"** сонгох
6. Шинэ нууц үг оруулах
7. **"Save"** товч дарах

Энэ аргаар email-гүйгээр шууд нууц үг тохируулах боломжтой.

