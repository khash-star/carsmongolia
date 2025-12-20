# Firebase Security Rules Тохируулах

## 1. Firebase Storage Rules

Firebase Console → Storage → Rules таб дээр дараах rules-г оруулна:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Public read access for images
    match /{allPaths=**} {
      allow read: if true;
      // Write access only for authenticated users
      allow write: if request.auth != null;
    }
  }
}
```

**Тайлбар:**
- `allow read: if true` - Бүх хүмүүс зураг харж болно
- `allow write: if request.auth != null` - Зөвхөн нэвтэрсэн хэрэглэгчид зураг upload хийж болно

## 2. Firestore Security Rules

Firebase Console → Firestore Database → Rules таб дээр дараах rules-г оруулна:

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

**Тайлбар:**
- **cars/businesses**: Бүх хүмүүс уншиж болно, нэвтэрсэн хэрэглэгчид бичиж болно
- **favorites**: Хэрэглэгч зөвхөн өөрийн дуртай заруудыг удирдаж болно
- **messages**: Хэрэглэгч зөвхөн өөрт ирсэн/илгээсэн мессежүүдийг харж болно
- **users**: Хэрэглэгч зөвхөн өөрийн профайлыг удирдаж болно, admin бүгдийг удирдаж болно

## 3. Admin User Үүсгэх

**⚠️ ЧУХАЛ: Зөвхөн нэг админ байх боломжтой!**

### Арга 1: Browser Console (Хамгийн хялбар)

1. Бүртгүүлсэн хэрэглэгчээр нэвтрэх
2. Browser Console нээх (F12)
3. Дараах командыг ажиллуулах:
```javascript
await window.makeCurrentUserAdmin()
```
4. Хуудас refresh хийх

**Админыг арилгах:**
```javascript
await window.removeAdminFromCurrentUser() // Одоогийн хэрэглэгчийг USER болгох
await window.removeAdminFromUser('user-uid-here') // Тодорхой хэрэглэгчийг USER болгох
```

### Арга 2: Firebase Console

1. Firebase Console → Firestore Database руу орох
2. `users` collection үүсгэх (хэрэв байхгүй бол)
3. User-ийн UID-тай document үүсгэх
4. Дараах field-ууд нэмэх:
   - `email`: "admin@example.com"
   - `role`: "ADMIN"
   - `full_name`: "Admin User"
   - `created_at`: (timestamp)

**UID олох:**
- Firebase Console → Authentication → Users таб дээр харна
- Эсвэл browser console дээр: `JSON.parse(localStorage.getItem('user')).uid`

## 4. Authentication Тохируулах

Firebase Console → Authentication → Sign-in method таб дээр:

1. **Email/Password** идэвхжүүлэх (Enable)
2. Бусад sign-in method-ууд шаардлагатай бол идэвхжүүлэх

## Шалгалт

Rules тохируулсны дараа:

1. **Storage Rules Playground** ашиглан тест хийх
2. **Firestore Rules Playground** ашиглан тест хийх
3. App дээр нэвтрэх, upload хийх, унших зэргийг тест хийх

