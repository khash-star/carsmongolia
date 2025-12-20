# Firestore Rules Тохируулах - Permission Denied Алдаа Засах

## 🔴 Асуудал
Бизнес бүртгүүлэхэд `permission-denied` алдаа гарч байна: "Missing or insufficient permissions"

## ✅ Шийдэл - Алхам алхмаар

### Алхам 1: Firebase Console руу орох

1. Браузер дээр оч: https://console.firebase.google.com
2. **carsmongolia-d410a** project сонгох
3. Зүүн цэснээс **Firestore Database** дээр дарах

### Алхам 2: Firestore Rules таб руу орох

1. Firestore Database хуудас дээр дээд талд **"Rules"** таб дээр дарах
2. Одоогийн rules-г харах болно

### Алхам 3: Rules оруулах

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

### Алхам 4: Rules Publish хийх

1. **"Publish"** товч дарах (баруун дээд буланд, улаан товч)
2. Хүлээх (1-2 секунд)
3. "Rules published successfully" гэсэн мэдэгдэл харагдана

### Алхам 5: Rules Playground дээр Тест хийх

1. Rules хуудас дээр **"Rules Playground"** товч дарах
2. Дараах тохиргоо хийх:
   - **Simulation type**: `create` сонгох
   - **Location** → **Collection**: `businesses` оруулах
   - **Document ID**: `test-business-123` (ямар ч утга)
   - **Authenticated**: **ON** (checkbox-ийг сонгох)
   - **Firebase Auth UID**: `test-user-123` (ямар ч утга)
   - **Run** товч дарах
3. Хүлээгдэх үр дүн: ✅ **Allow** (ногоон)

Хэрэв ❌ **Deny** (улаан) гарвал rules буруу байна.

### Алхам 6: App дээр Тест хийх

1. Браузер дээр **F12** дараад **Console** таб нээх
2. Нэвтрэх (`/login`)
3. Бизнес нэмэх хуудас руу орох (`/AddBusiness`)
4. Form бөглөх:
   - Бизнесийн нэр
   - Ангилал
   - Утас
   - Зураг upload хийх (сонголттой)
5. **"Бүртгүүлэх"** товч дарах
6. Console дээр алдаа байхгүй, toast message "Бизнес амжилттай бүртгэгдлээ!" харагдах ёстой

## 🔍 Хэрэв асуудал байсаар байвал

### 1. Auth State Шалгах

Browser Console дээр дараах командыг ажиллуулна:

```javascript
import { auth } from '@/config/firebase';
console.log('Current user:', auth.currentUser);
console.log('User email:', auth.currentUser?.email);
console.log('User UID:', auth.currentUser?.uid);
```

### 2. Firestore Rules Шалгах

Firebase Console → Firestore Database → Rules дээр очоод:
- Rules дээр `isAuthenticated()` функц байгаа эсэхийг шалгах
- `businesses` collection дээр `allow create: if isAuthenticated();` байгаа эсэхийг шалгах
- Rules publish хийсэн эсэхийг шалгах (дээд талд "Published" гэсэн мэдэгдэл байх ёстой)

### 3. Browser Cache Цэвэрлэх

1. **Ctrl + Shift + Delete** дарах
2. "Cached images and files" сонгох
3. "Clear data" дарах
4. Браузер дахин ачаалах

## 📝 Чухал Тайлбар

- **Rules publish хийх шаардлагатай** - зөвхөн бичих хангалтгүй
- Rules publish хийсний дараа **1-2 минутын дараа** ажиллах болно
- Хэрэв rules буруу байвал **Rules Playground** дээр тест хийх
- Auth state зөв байгаа эсэхийг Console дээр шалгах

## 🆘 Хэрэв бүх зүйл зөв байгаа ч асуудал байсаар байвал

Firebase Console → Firestore Database → Rules дээр очоод дараах rules-г ашиглах (илүү энгийн хувилбар):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /businesses/{businessId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
      allow delete: if request.auth != null;
    }
  }
}
```

Энэ нь зөвхөн `businesses` collection-д зориулсан энгийн rules юм. Тест хийхэд ашиглаж болно.

