# cPanel дээр Domain тохируулах заавар

## 🎯 Зорилго

cPanel дээрх domain-ийг Firebase Hosting-тай холбох

## 📋 Алхам 1: Firebase Console дээр Custom Domain нэмэх

1. **Firebase Console** руу орох: https://console.firebase.google.com/project/carsmongolia-d410a/hosting
2. **"Add custom domain"** товч дарах
3. Domain оруулах: `carsmongolia.mn` (эсвэл `catalog.carsmongolia.mn`)
4. Firebase-аас өгсөн **DNS records**-ийг хуулах:
   - Type: A
   - IP addresses (2 ширхэг)

## 📋 Алхам 2: cPanel дээр DNS тохируулах

### 2.1 cPanel руу нэвтрэх

1. cPanel URL руу орох (жишээ: `https://yourdomain.com:2083`)
2. Username, password оруулах

### 2.2 DNS Zone Editor нээх

1. cPanel дээр **"Zone Editor"** эсвэл **"DNS Zone Editor"** хайх
2. Domain-ийг сонгох (жишээ: `carsmongolia.mn`)

### 2.3 A Records нэмэх/засах

Firebase-аас авсан IP addresses-ийг нэмэх:

**Сонголт 1: Root domain (@)**
- **Type:** A
- **Name:** @ (эсвэл хоосон)
- **TTL:** 3600 (эсвэл default)
- **Address:** [Firebase-аас өгсөн 1-р IP]
- **Add Record** дарах

- **Type:** A  
- **Name:** @ (эсвэл хоосон)
- **TTL:** 3600
- **Address:** [Firebase-аас өгсөн 2-р IP]
- **Add Record** дарах

**Сонголт 2: Subdomain (catalog.carsmongolia.mn)**
- **Type:** A
- **Name:** catalog
- **TTL:** 3600
- **Address:** [Firebase-аас өгсөн 1-р IP]
- **Add Record** дарах

- **Type:** A
- **Name:** catalog
- **TTL:** 3600
- **Address:** [Firebase-аас өгсөн 2-р IP]
- **Add Record** дарах

### 2.4 Хуучин A Records устгах (хэрэв байвал)

- Firebase-тай холбохгүй A records-ийг устгах
- Эсвэл Firebase IP-д засах

## 📋 Алхам 3: DNS Propagation хүлээх

- DNS changes 5-30 минут хүлээх хэрэгтэй
- Шалгах: https://www.whatsmydns.net/#A/carsmongolia.mn

## 📋 Алхам 4: Firebase дээр SSL Certificate хүлээх

1. Firebase Console → Hosting
2. Custom domain-ийн статусыг шалгах
3. SSL certificate автоматаар үүснэ (5-10 минут)

## ✅ Тест хийх

DNS propagation болсны дараа:

1. **Custom domain URL:**
   ```
   https://carsmongolia.mn/catalog/facebook.csv
   ```

2. **Эсвэл subdomain:**
   ```
   https://catalog.carsmongolia.mn/catalog/facebook.csv
   ```

## 🛠️ cPanel-ийн өөр нэрс

Зарим cPanel дээр:
- **Zone Editor**
- **DNS Zone Editor**  
- **Advanced DNS Zone Editor**
- **DNS Management**

Бүгд ижил зүйл хийх - A records нэмэх/засах.

## ⚠️ Чухал

1. **Хуучин A records устгах** - Firebase-тай холбохгүй IP addresses устгах
2. **TTL тохируулах** - 3600 секунд (1 цаг) зөвлөмжтэй
3. **DNS propagation хүлээх** - 5-30 минут
4. **SSL certificate хүлээх** - Firebase автоматаар үүсгэнэ

## 📝 Жишээ DNS Records

```
Type    Name      TTL     Address
A       @         3600    151.101.1.195
A       @         3600    151.101.65.195
```

Эсвэл subdomain:

```
Type    Name      TTL     Address
A       catalog   3600    151.101.1.195
A       catalog   3600    151.101.65.195
```

## 🎯 Дараагийн алхам

1. ✅ Firebase Console дээр custom domain нэмэх
2. ✅ Firebase-аас IP addresses авах
3. ✅ cPanel дээр A records нэмэх
4. ✅ DNS propagation хүлээх
5. ✅ SSL certificate хүлээх
6. ✅ Feed URL тест хийх

## 🔍 Troubleshooting

### DNS propagation хэт удаан байвал:
- TTL-ийг бага тохируулах (300 секунд)
- DNS cache цэвэрлэх (`ipconfig /flushdns` Windows дээр)

### SSL certificate үүсэхгүй байвал:
- DNS records зөв эсэхийг шалгах
- 24 цаг хүлээх (зарим тохиолдолд удаан байдаг)

