# Local дээрээс Deploy хийх заавар

## 🚀 Хурдан Deploy

### 1. Firebase CLI суулгах (хэрэв байхгүй бол)

```bash
npm install -g firebase-tools
```

### 2. Firebase руу нэвтрэх

```bash
firebase login
```

Браузер дээр нэвтрэх хэрэгтэй.

### 3. Project сонгох

```bash
firebase use carsmongolia-d410a
```

## 📦 Functions Deploy хийх

### Алхам 1: Functions dependencies суулгах

```bash
cd functions
npm install
cd ..
```

### Алхам 2: Deploy хийх

```bash
firebase deploy --only functions:facebookCatalogFeed
```

Эсвэл бүх functions:

```bash
firebase deploy --only functions
```

## 🌐 Frontend Deploy хийх

### Алхам 1: Build хийх

```bash
npm run build
```

### Алхам 2: Deploy хийх

```bash
firebase deploy --only hosting
```

## 🔄 Бүгдийг нэг дор Deploy хийх

```bash
# Functions + Frontend
firebase deploy
```

## ✅ Deploy хийсний дараа

### Functions URL:
```
https://us-central1-carsmongolia-d410a.cloudfunctions.net/facebookCatalogFeed
```

### Frontend URL:
```
https://carsmongolia-d410a.web.app
```

## 🛠️ Troubleshooting

### Firebase login алдаа гарвал:
```bash
firebase logout
firebase login
```

### Project сонгох:
```bash
firebase projects:list
firebase use carsmongolia-d410a
```

### Functions deploy алдаа:
```bash
cd functions
npm install
cd ..
firebase deploy --only functions:facebookCatalogFeed
```

## 📝 Чухал

- Token шаардлагагүй - зөвхөн `firebase login` хийх хэрэгтэй
- Local дээрээс шууд deploy хийж болно
- GitHub Actions хэрэггүй - зөвхөн local командууд ашиглана

