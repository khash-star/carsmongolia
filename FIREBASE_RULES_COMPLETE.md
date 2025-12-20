# Firebase Rules Бүрэн Тохируулах Заавар

## 📋 Агуулга

Энэ заавар нь Firebase Firestore болон Storage rules-г бүрэн тохируулах заавар юм.

---

## 🔥 1. Firestore Database Rules

### Алхам 1: Firebase Console руу орох

1. Браузер дээр оч: https://console.firebase.google.com
2. **carsmongolia-d410a** project сонгох
3. Зүүн цэснээс **Firestore Database** дээр дарах
4. Дээд талд **"Rules"** таб дээр дарах

### Алхам 2: Firestore Rules оруулах

**Одоогийн rules-г устгаад** дараах rules-г оруулна:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is admin
    function isAdmin() {
      return request.auth != null && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'ADMIN';
    }
    
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Cars collection
    match /cars/{carId} {
      // Public read access
      allow read: if true;
      // Write access for authenticated users
      allow create: if isAuthenticated();
      allow update: if isAuthenticated();
      allow delete: if isAuthenticated() && (resource.data.created_by == request.auth.token.email || isAdmin());
    }
    
    // Businesses collection
    match /businesses/{businessId} {
      // Public read access
      allow read: if true;
      // Write access for authenticated users
      allow create: if isAuthenticated();
      allow update: if isAuthenticated();
      allow delete: if isAuthenticated() && (resource.data.created_by == request.auth.token.email || isAdmin());
    }
    
    // Favorites collection
    match /favorites/{favoriteId} {
      // Users can only read/write their own favorites
      allow read, write: if isAuthenticated() && 
        (resource == null || resource.data.user_email == request.auth.token.email);
      allow create: if isAuthenticated() && request.resource.data.user_email == request.auth.token.email;
    }
    
    // Messages collection
    match /messages/{messageId} {
      // Users can read messages sent to them or sent by them
      allow read: if isAuthenticated() && 
        (resource.data.receiver_email == request.auth.token.email || 
         resource.data.sender_email == request.auth.token.email);
      // Users can create messages
      allow create: if isAuthenticated() && request.resource.data.sender_email == request.auth.token.email;
      // Users can update their own received messages (mark as read)
      allow update: if isAuthenticated() && resource.data.receiver_email == request.auth.token.email;
      // Admin can delete any message
      allow delete: if isAdmin();
    }
    
    // Users collection
    match /users/{userId} {
      // Users can read their own profile or admin can read all
      allow read: if isAuthenticated() && (request.auth.uid == userId || isAdmin());
      // Users can create their own profile on registration
      allow create: if isAuthenticated() && request.auth.uid == userId;
      // Users can update their own profile, admin can update any
      allow update: if isAuthenticated() && (request.auth.uid == userId || isAdmin());
    }
  }
}
```

### Алхам 3: Firestore Rules Publish хийх

1. **"Publish"** товч дарах (баруун дээд буланд, улаан товч)
2. Хүлээх (1-2 секунд)
3. "Rules published successfully" гэсэн мэдэгдэл харагдана

### Алхам 4: Firestore Rules Playground дээр Тест хийх

1. Rules хуудас дээр **"Rules Playground"** товч дарах
2. **Cars collection тест:**
   - **Simulation type**: `create` сонгох
   - **Location** → **Collection**: `cars` оруулах
   - **Document ID**: `test-car-123` (ямар ч утга)
   - **Authenticated**: **ON** (checkbox-ийг сонгох)
   - **Firebase Auth UID**: `test-user-123` (ямар ч утга)
   - **Run** товч дарах
   - Хүлээгдэх үр дүн: ✅ **Allow** (ногоон)

3. **Businesses collection тест:**
   - **Simulation type**: `create` сонгох
   - **Location** → **Collection**: `businesses` оруулах
   - **Document ID**: `test-business-123` (ямар ч утга)
   - **Authenticated**: **ON** (checkbox-ийг сонгох)
   - **Firebase Auth UID**: `test-user-123` (ямар ч утга)
   - **Run** товч дарах
   - Хүлээгдэх үр дүн: ✅ **Allow** (ногоон)

---

## 📦 2. Firebase Storage Rules

### Алхам 1: Firebase Console руу орох

1. Браузер дээр оч: https://console.firebase.google.com
2. **carsmongolia-d410a** project сонгох
3. Зүүн цэснээс **Storage** дээр дарах
4. Дээд талд **"Rules"** таб дээр дарах

### Алхам 2: Storage Rules оруулах

**Одоогийн rules-г устгаад** дараах rules-г оруулна:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Public read access for all files
    match /{allPaths=**} {
      allow read: if true;
      // Write access only for authenticated users
      allow write: if request.auth != null;
    }
  }
}
```

### Алхам 3: Storage Rules Publish хийх

1. **"Publish"** товч дарах (баруун дээд буланд, улаан товч)
2. Хүлээх (1-2 секунд)
3. "Rules published successfully" гэсэн мэдэгдэл харагдана

### Алхам 4: Storage Rules Playground дээр Тест хийх

1. Rules хуудас дээр **"Rules Playground"** товч дарах
2. **Cars images тест:**
   - **Simulation type**: `write` сонгох
   - **Location** → **Resource path**: `cars/test.jpg` оруулах
   - **Authenticated**: **ON** (checkbox-ийг сонгох)
   - **Firebase Auth UID**: `test-user-123` (ямар ч утга)
   - **Run** товч дарах
   - Хүлээгдэх үр дүн: ✅ **Allow** (ногоон)

3. **Businesses images тест:**
   - **Simulation type**: `write` сонгох
   - **Location** → **Resource path**: `businesses/test.jpg` оруулах
   - **Authenticated**: **ON** (checkbox-ийг сонгох)
   - **Firebase Auth UID**: `test-user-123` (ямар ч утга)
   - **Run** товч дарах
   - Хүлээгдэх үр дүн: ✅ **Allow** (ногоон)

---

## ✅ 3. Тест хийх

### Firestore Тест:

1. Браузер дээр **F12** дараад **Console** таб нээх
2. Нэвтрэх (`/login`)
3. **Машины зар нэмэх** (`/AddCar`):
   - Form бөглөх
   - "Зар нэмэх" товч дарах
   - Console дээр алдаа байхгүй, toast message "Зар амжилттай нэмэгдлээ!" харагдах ёстой
4. **Бизнес нэмэх** (`/AddBusiness`):
   - Form бөглөх
   - "Бүртгүүлэх" товч дарах
   - Console дээр алдаа байхгүй, toast message "Бизнес амжилттай бүртгэгдлээ!" харагдах ёстой

### Storage Тест:

1. Нэвтрэх (`/login`)
2. **Машины зар нэмэх** (`/AddCar`):
   - Зураг upload хийх
   - Toast message "зураг амжилттай орлоо" харагдах ёстой
3. **Бизнес нэмэх** (`/AddBusiness`):
   - Зураг upload хийх
   - Toast message "зураг амжилттай орлоо" харагдах ёстой

---

## 🔍 Хэрэв асуудал байсаар байвал

### 1. Auth State Шалгах

Browser Console дээр дараах командыг ажиллуулна:

```javascript
import { auth } from '@/config/firebase';
console.log('Current user:', auth.currentUser);
console.log('User email:', auth.currentUser?.email);
console.log('User UID:', auth.currentUser?.uid);
```

### 2. Rules Шалгах

- **Firestore**: Firebase Console → Firestore Database → Rules дээр очоод rules publish хийсэн эсэхийг шалгах
- **Storage**: Firebase Console → Storage → Rules дээр очоод rules publish хийсэн эсэхийг шалгах

### 3. Browser Cache Цэвэрлэх

1. **Ctrl + Shift + Delete** дарах
2. "Cached images and files" сонгох
3. "Clear data" дарах
4. Браузер дахин ачаалах

---

## 📝 Чухал Тайлбар

- **Rules publish хийх шаардлагатай** - зөвхөн бичих хангалтгүй
- Rules publish хийсний дараа **1-2 минутын дараа** ажиллах болно
- Хэрэв rules буруу байвал **Rules Playground** дээр тест хийх
- Auth state зөв байгаа эсэхийг Console дээр шалгах

---

## 🆘 Хэрэв бүх зүйл зөв байгаа ч асуудал байсаар байвал

### Энгийн Rules (Тест хийхэд):

**Firestore:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

**Storage:**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

Эдгээр нь бүх collection-д зориулсан энгийн rules юм. Тест хийхэд ашиглаж болно.

