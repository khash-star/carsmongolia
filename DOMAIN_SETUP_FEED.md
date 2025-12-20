# Domain-тай Facebook Catalog Feed холбох заавар

## 🎯 Зорилго

Custom domain-тай Facebook Catalog Feed URL:
- `https://carsmongolia.mn/catalog/facebook.csv`
- `https://carsmongolia.mn/catalog/facebook`

## 📋 Алхам 1: Firebase Hosting Deploy хийх

```bash
# Build хийх
npm run build

# Hosting deploy хийх
firebase deploy --only hosting
```

## 📋 Алхам 2: Custom Domain нэмэх

1. **Firebase Console** руу орох: https://console.firebase.google.com
2. **Hosting** → **Add custom domain**
3. Domain оруулах: `carsmongolia.mn` (эсвэл `catalog.carsmongolia.mn`)
4. DNS records-ийг тохируулах:
   - Firebase-аас өгсөн DNS records-ийг domain provider дээрээ нэмэх
   - Жишээ:
     ```
     Type: A
     Name: @
     Value: [Firebase-аас өгсөн IP]
     
     Type: A
     Name: @
     Value: [Firebase-аас өгсөн IP]
     ```

## 📋 Алхам 3: SSL Certificate хүлээх

- Firebase автоматаар SSL certificate үүсгэнэ
- 5-10 минут хүлээх хэрэгтэй

## ✅ Тест хийх

Deploy хийсний дараа:

1. **Custom domain URL:**
   ```
   https://carsmongolia.mn/catalog/facebook.csv
   ```

2. **Эсвэл subdomain:**
   ```
   https://catalog.carsmongolia.mn/facebook.csv
   ```

## 🔄 Deploy хийх

### Бүгдийг нэг дор:
```bash
npm run build
firebase deploy
```

### Зөвхөн hosting:
```bash
npm run build
firebase deploy --only hosting
```

## 📝 Чухал

- `firebase.json` дээр rewrites нэмэгдсэн
- `/catalog/facebook.csv` → `facebookCatalogFeed` function руу чиглэнэ
- Custom domain нэмсний дараа SSL certificate автоматаар үүснэ

## 🎯 Facebook Commerce Manager дээр

Одоо энэ URL-ийг ашиглана:
```
https://carsmongolia.mn/catalog/facebook.csv
```

Эсвэл:
```
https://catalog.carsmongolia.mn/facebook.csv
```

