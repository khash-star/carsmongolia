# Verify товч ажиллахгүй байвал - Шууд шийдэл

## 🎯 Одоо хийх зүйлс (Алхам алхмаар)

### 1️⃣ cPanel дээр DNS records шалгах

1. **cPanel** руу нэвтрэх
2. **Zone Editor** эсвэл **DNS Zone Editor** нээх
3. `carsmongolia.mn` domain сонгох

**Байх ёстой:**
- ✅ A record: `@` → `199.36.158.100`
- ✅ TXT record: `@` → `hosting-site=carsmongolia-d410a`

**Устгах ёстой:**
- ❌ A record: `@` → `43.231.112.70` (ХУУЧИН IP - ЗААВАЛ УСТГАХ!)

### 2️⃣ DNS propagation шалгах

**Online tool ашиглах:**
- https://www.whatsmydns.net/#A/carsmongolia.mn
- https://dnschecker.org/#A/carsmongolia.mn

**Харагдах ёстой:** `199.36.158.100`
**Харагдах ёсгүй:** `43.231.112.70`

**Хэрэв хуучин IP (`43.231.112.70`) харагдаж байвал:**
- DNS propagation хараахгүй байна
- 15-30 минут хүлээх
- Дахин шалгах

### 3️⃣ TXT record шалгах

**Online tool:**
- https://www.whatsmydns.net/#TXT/carsmongolia.mn

**Харагдах ёстой:** `hosting-site=carsmongolia-d410a`

### 4️⃣ Firebase Console дээр дахин verify хийх

1. Firebase Console → Hosting → Custom domains
2. `carsmongolia.mn` domain-ийг нээх
3. **"Verify"** товч дарах
4. **5-15 минут хүлээх**

## ⚠️ Хэрэв ажиллахгүй байвал

### Сонголт A: Domain устгаад дахин нэмэх

1. Firebase Console → Hosting
2. `carsmongolia.mn` domain-ийг **устгах** (Delete)
3. 10 минут хүлээх
4. Дахин **"Add custom domain"** хийх
5. Шинэ DNS records авах
6. cPanel дээр бүх records-ийг дахин тохируулах
7. 30 минут хүлээх (DNS propagation)
8. Verify хийх

### Сонголт B: Subdomain ашиглах

Root domain ажиллахгүй бол subdomain ашиглах:

1. Firebase Console дээр: `catalog.carsmongolia.mn` нэмэх
2. cPanel дээр:
   - **Type:** A
   - **Name:** `catalog`
   - **Value:** `199.36.158.100`
3. DNS propagation хүлээх (30 минут)
4. Verify хийх

## 🔍 Шалгах командууд (Terminal/Command Prompt)

```bash
# A record шалгах
nslookup carsmongolia.mn

# TXT record шалгах
nslookup -type=TXT carsmongolia.mn
```

## ⏱️ Хүлээх хугацаа

- **DNS propagation:** 15-30 минут (зарим тохиолдолд 1-2 цаг)
- **Verify process:** 5-15 минут
- **SSL certificate:** 5-10 минут (Firebase автоматаар үүсгэнэ)

## 📞 Хэрэв бүх зүйл хийсэн боловч ажиллахгүй бол

Firebase Support-тай холбогдох:
1. Firebase Console → Help & Support
2. Support ticket нээх
3. Алдааны мэдээлэл илгээх

