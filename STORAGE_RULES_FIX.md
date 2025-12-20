# Firebase Storage Rules Тохируулах - 403 Алдаа Засах

## Асуудал
Нэвтэрсэн хэрэглэгч зураг upload хийхэд 403 Forbidden алдаа гарч байна.

## Шийдэл

### 1. Firebase Console дээр Storage Rules Publish хийх

1. **Firebase Console** руу орох: https://console.firebase.google.com
2. **carsmongolia-d410a** project сонгох
3. **Storage** → **Rules** таб руу орох
4. Дараах rules-г оруулна:

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

5. **"Publish"** товч дарах (баруун дээд буланд)

### 2. Rules Playground дээр Тест хийх

1. **Rules Playground** дээр:
   - **Simulation type**: `create` эсвэл `write` сонгох
   - **Location** → Resource path: `businesses/test.jpg` оруулах
   - **Authenticated**: **ON** (нэвтэрсэн хэрэглэгч)
   - **Run** дарах
   - Хүлээгдэх үр дүн: ✅ **Allow**

### 3. App дээр Тест хийх

1. Нэвтрэх (`/login`)
2. Бизнес нэмэх хуудас руу орох (`/AddBusiness`)
3. Зураг upload хийх
4. Амжилттай бол: Toast message "Зураг амжилттай орлоо"
5. Алдаа гарвал: Console дээрх алдааг шалгах

## Чухал

- Storage rules **Publish** хийх шаардлагатай (зөвхөн бичих хангалтгүй)
- Rules publish хийсний дараа 1-2 минутын дараа ажиллах болно
- Хэрэв асуудал байсаар байвал Firebase Console → Storage → Rules дээр "Rules Playground" ашиглан тест хийх

