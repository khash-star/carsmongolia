# GitHub болон Firebase холбох заавар

## Одоогийн байдал:
- **GitHub Repository:** https://github.com/khash-star/carsmongolia.git
- **Firebase Project:** carsmongolia-d410a
- **Custom Domain:** carsmongolia.mn

## GitHub Actions ашиглах (Автомат Deploy)

### Алхам 1: Firebase Service Account үүсгэх

1. Firebase Console руу орох: https://console.firebase.google.com/project/carsmongolia-d410a/settings/serviceaccounts/adminsdk
2. "Generate new private key" товч дарах
3. JSON файл татаж авах (энэ нь Service Account key байна)

### Алхам 2: GitHub Secret нэмэх

1. GitHub repository руу орох: https://github.com/khash-star/carsmongolia
2. **Settings** → **Secrets and variables** → **Actions** руу орох
3. **New repository secret** товч дарах
4. Дараах мэдээллийг оруулах:
   - **Name:** `FIREBASE_SERVICE_ACCOUNT`
   - **Secret:** Firebase-аас татсан JSON файлын бүх агуулгыг хуулах

### Алхам 3: GitHub Actions ажиллах

Одоо `main` branch руу push хийхэд автоматаар Firebase руу deploy хийгдэнэ.

## Firebase Console дээр GitHub холбох (Сонголт 2)

1. Firebase Console → Project Settings → Integrations
2. GitHub-ийг сонгох
3. Repository сонгох: `khash-star/carsmongolia`
4. Branch сонгох: `main`
5. Build configuration тохируулах:
   - Build command: `npm run build`
   - Output directory: `dist`

## Deploy хийх

### Гараар deploy хийх:
```bash
npm run build
firebase deploy --only hosting
```

### GitHub Actions ашиглах (автомат):
`main` branch руу push хийхэд автоматаар deploy хийгдэнэ.

## Домайн тохиргоо

Домайн Firebase Console дээр тохируулагдсан:
- **Custom Domain:** carsmongolia.mn
- **Status:** Active (SSL сертификат үүсгэгдсэн)

