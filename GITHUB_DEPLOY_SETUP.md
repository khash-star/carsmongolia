# GitHub дээр Deploy хийх заавар

## 🚀 Автомат Deploy Setup

GitHub Actions ашиглан Firebase Functions болон Frontend-ийг автоматаар deploy хийх боломжтой.

## 📋 Алхам 1: Firebase Service Account Key авах

1. **Firebase Console** руу орох: https://console.firebase.google.com
2. **Project Settings** → **Service Accounts** таб
3. **Generate New Private Key** товч дарах
4. JSON файл татаж авах

## 📋 Алхам 2: GitHub Secrets нэмэх

1. GitHub repository руу орох: https://github.com/khash-star/carsmongolia
2. **Settings** → **Secrets and variables** → **Actions**
3. **New repository secret** дарах
4. Дараах secret нэмэх:

   **Name:** `FIREBASE_SERVICE_ACCOUNT`
   
   **Value:** Service Account JSON файлын бүх агуулгыг хуулах

## 📋 Алхам 3: Firebase.json шинэчлэх

`firebase.json` файлд hosting config нэмэх:

```json
{
  "functions": {
    "source": "functions",
    "runtime": "nodejs20"
  },
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

## ✅ Хэрхэн ажилладаг вэ?

### Functions Deploy
- `functions/` folder-д өөрчлөлт ороход автоматаар deploy хийгдэнэ
- Эсвэл **Actions** таб дээр **Deploy Firebase Functions** workflow-ийг гараар ажиллуулж болно

### Frontend Deploy
- `src/` folder эсвэл config файлуудад өөрчлөлт ороход:
  1. Build хийгдэнэ (`npm run build`)
  2. Firebase Hosting руу deploy хийгдэнэ
- Эсвэл **Actions** таб дээр **Deploy Frontend** workflow-ийг гараар ажиллуулж болно

## 🔍 Deploy статус шалгах

1. GitHub repository → **Actions** таб
2. Deploy хийгдэж буй workflow-ийг харах
3. Амжилттай бол ✅, Алдаа гарвал ❌

## 🛠️ Гараар Deploy хийх

### Functions Deploy:
```bash
cd functions
npm install
cd ..
firebase deploy --only functions:facebookCatalogFeed
```

### Frontend Deploy:
```bash
npm run build
firebase deploy --only hosting
```

## 📝 Чухал тэмдэглэл

- **FIREBASE_SERVICE_ACCOUNT** secret нэмэх шаардлагатай
- Service Account key-г хэзээ ч public хийхгүй байх
- GitHub Actions дээр автоматаар deploy хийгдэнэ

## 🎯 Дараагийн алхам

1. ✅ Firebase Service Account key авах
2. ✅ GitHub Secrets дээр нэмэх
3. ✅ Code push хийх → Автоматаар deploy хийгдэнэ!

