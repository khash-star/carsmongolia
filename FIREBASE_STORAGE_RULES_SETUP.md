# Firebase Storage Rules Тохируулах - Дэлгэрэнгүй Заавар

## 🔴 Асуудал
403 Forbidden алдаа гарч байна. Нэвтэрсэн хэрэглэгч (`nyamaa@gmail.com`) зураг upload хийхэд эрхгүй байна.

## ✅ Шийдэл - Алхам алхмаар

### Алхам 1: Firebase Console руу орох

1. Браузер дээр оч: https://console.firebase.google.com
2. **carsmongolia-d410a** project сонгох
3. Зүүн цэснээс **Storage** дээр дарах

### Алхам 2: Storage Rules таб руу орох

1. Storage хуудас дээр дээд талд **"Rules"** таб дээр дарах
2. Одоогийн rules-г харах болно

### Алхам 3: Rules оруулах

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

### Алхам 4: Rules Publish хийх

1. **"Publish"** товч дарах (баруун дээд буланд, улаан товч)
2. Хүлээх (1-2 секунд)
3. "Rules published successfully" гэсэн мэдэгдэл харагдана

### Алхам 5: Rules Playground дээр Тест хийх

1. Rules хуудас дээр **"Rules Playground"** товч дарах
2. Дараах тохиргоо хийх:
   - **Simulation type**: `write` сонгох
   - **Location** → **Resource path**: `businesses/test.jpg` оруулах
   - **Authenticated**: **ON** (checkbox-ийг сонгох)
   - **Firebase Auth UID**: `test-user-123` (ямар ч утга)
   - **Run** товч дарах
3. Хүлээгдэх үр дүн: ✅ **Allow** (ногоон)

Хэрэв ❌ **Deny** (улаан) гарвал rules буруу байна.

### Алхам 6: App дээр Тест хийх

1. Браузер дээр **F12** дараад **Console** таб нээх
2. Нэвтрэх (`/login`) - `nyamaa@gmail.com` ашиглах
3. Бизнес нэмэх хуудас руу орох (`/AddBusiness`)
4. Зураг upload хийх
5. Console дээр алдаа байхгүй, toast message "зураг амжилттай орлоо" харагдах ёстой

## 🔍 Хэрэв асуудал байсаар байвал

### 1. Auth State Шалгах

Browser Console дээр дараах командыг ажиллуулна:

```javascript
import { auth } from '@/config/firebase';
console.log('Current user:', auth.currentUser);
console.log('User email:', auth.currentUser?.email);
console.log('User UID:', auth.currentUser?.uid);
```

### 2. Storage Rules Шалгах

Firebase Console → Storage → Rules дээр очоод:
- Rules дээр `request.auth != null` байгаа эсэхийг шалгах
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

Firebase Console → Storage → Rules дээр очоод дараах rules-г ашиглах:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid != null;
    }
  }
}
```

Энэ нь auth state-ийг илүү нарийн шалгана.

