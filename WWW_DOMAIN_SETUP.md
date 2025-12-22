# www.carsmongolia.mn домэйны тохиргоо

## Асуудал:
`www.carsmongolia.mn` дээр SSL алдаа гарч байна (`NET::ERR_CERT_COMMON_NAME_INVALID`).

## Шийдэл:

### Алхам 1: Firebase Console дээр www subdomain-ийн статус шалгах

**⚠️ Анхаар:** Хэрэв "This domain already exists" алдаа гарч байвал домэйн аль хэдийн бүртгэгдсэн байна.

1. Firebase Console руу орох:
   ```
   https://console.firebase.google.com/project/carsmongolia-d410a/hosting
   ```

2. "Domains" хэсэгт орох
3. `www.carsmongolia.mn` домэйныг олох
4. Домэйны статусыг шалгах:
   - **Pending** - DNS тохиргоо хийх хэрэгтэй
   - **Active** - Бүх зүйл зөв тохируулагдсан
   - **Error** - DNS тохиргоо алдаатай

**Хэрэв домэйн байхгүй бол:**
- "Add custom domain" товч дарах
- `www.carsmongolia.mn` оруулах
- "Continue" товч дарах

### Алхам 2: Firebase Console дээр DNS records шалгах

Firebase Console дээр `www.carsmongolia.mn` домэйныг дарж, дараах мэдээллийг шалгах:

1. **DNS records** хэсэгт Firebase-аас өгсөн records-ийг харах
2. **CNAME record** эсвэл **A records**-ийг тэмдэглэх

**Firebase-аас өгсөн DNS records:**

**CNAME record (ихэвчлэн):**
- **Name:** `www`
- **Value:** `carsmongolia-d410a.web.app` эсвэл Firebase-аас өгсөн утга

**Эсвэл A records (2 ширхэг):**
- **Name:** `www`
- **Value:** Firebase-аас өгсөн IP addresses (2 ширхэг)

### Алхам 3: DNS тохиргоо хийх

Домэйны DNS management (orderbox-dns.com эсвэл itools.mn) дээр:

1. DNS management хуудас руу орох
2. Дараах record нэмэх:
   - **Type:** CNAME
   - **Name:** www
   - **Value:** carsmongolia-d410a.web.app
   - **TTL:** 3600

### Алхам 4: SSL сертификат хүлээх

1. DNS тохиргоо хийсний дараа 5-30 минут хүлээх
2. Firebase Console дээр SSL сертификат үүсэх хүртэл хүлээх
3. "Active" статус болох хүртэл хүлээх

## Тайлбар:

- `carsmongolia.mn` (www-гүй) - одоо ажиллаж байна
- `www.carsmongolia.mn` - аль хэдийн Firebase дээр бүртгэгдсэн

Хоёр домэйныг нэгэн зэрэг ашиглах боломжтой.

## Асуудал шийдэх:

### "This domain already exists" алдаа гарч байвал:

1. **Firebase Console → Hosting → Domains** руу орох
2. `www.carsmongolia.mn` домэйныг олох
3. Домэйныг дарж дэлгэрэнгүй мэдээлэл харах:
   - **Status** - Pending/Active/Error
   - **DNS records** - Firebase-аас өгсөн records
   - **SSL certificate** - Status

### Хэрэв домэйн "Pending" статустай бол:

1. Firebase Console дээрх DNS records-ийг хуулах
2. DNS provider (orderbox-dns.com эсвэл itools.mn) дээр тохируулах
3. 5-30 минут хүлээх (DNS propagation)
4. Firebase Console дээр дахин шалгах

### Хэрэв домэйн "Minting certificate" статустай бол:

✅ **Сайн мэдээ!** Домэйн зөв тохируулагдсан, SSL сертификат үүсэж байна.

**Одоо хийх зүйл:**
1. **Хүлээх** - SSL сертификат үүсэхэд 5-30 минут зарцуулна
2. **Firebase Console дээр шалгах** - Домэйны статус "Connected" болох хүртэл хүлээх
3. **Тест хийх** - Статус "Connected" болсны дараа `https://www.carsmongolia.mn` руу орох

**Чухал:**
- "Minting certificate" гэдэг нь Firebase SSL сертификат үүсгэж байгаа гэсэн үг
- DNS тохиргоо зөв байна (өөрөөр certificate minting эхлэхгүй)
- Хүлээх хэрэгтэй - сертификат автоматаар үүснэ

### Хэрэв домэйн "Error" статустай бол:

1. DNS records-ийг дахин шалгах
2. DNS provider дээрх records-ийг Firebase-аас өгсөн утгатай харьцуулах
3. Хэрэв зөрүүтэй бол засах

### SSL сертификат алдаа (`NET::ERR_CERT_COMMON_NAME_INVALID`) засах:

**Алдаа:** `www.carsmongolia.mn` дээр SSL сертификат алдаа гарч байна.

**Шийдэл:**

1. **Firebase Console дээр домэйны статус шалгах:**
   - Firebase Console → Hosting → Domains
   - `www.carsmongolia.mn` домэйныг дарж нээх
   - **SSL certificate** статусыг шалгах:
     - **Pending** - SSL сертификат үүсэж байна (хүлээх хэрэгтэй)
     - **Active** - SSL сертификат идэвхтэй (DNS тохиргоо шалгах)
     - **Error** - SSL сертификат алдаатай (DNS тохиргоо засах)

2. **DNS records шалгах:**
   - Firebase Console дээрх DNS records-ийг хуулах
   - DNS provider (orderbox-dns.com эсвэл itools.mn) дээр шалгах:
     - `www` CNAME record байгаа эсэх
     - CNAME value зөв эсэх (`carsmongolia-d410a.web.app`)
   - Хэрэв буруу бол засах

3. **DNS propagation хүлээх:**
   - DNS тохиргоо хийсний дараа 5-30 минут хүлээх
   - Online DNS checker ашиглах: https://dnschecker.org
   - `www.carsmongolia.mn` CNAME record зөв propagation болсон эсэхийг шалгах

4. **Firebase SSL сертификат дахин үүсгэх:**
   - Хэрэв DNS зөв тохируулагдсан боловч SSL алдаатай бол:
     - Firebase Console дээр домэйныг устгах (хэрэв боломжтой)
     - Дахин нэмэх
     - Эсвэл Firebase support-д хандах

5. **Тест хийх:**
   - DNS propagation дууссан дараа:
     ```bash
     # DNS шалгах
     nslookup www.carsmongolia.mn
     
     # Эсвэл
     dig www.carsmongolia.mn
     ```
   - Хүлээгдэж буй үр дүн: `www.carsmongolia.mn` → `carsmongolia-d410a.web.app`

**Чухал:**
- SSL сертификат үүсэхэд 5-30 минут зарцуулна
- DNS propagation-д 5-30 минут зарцуулна
- Хэрэв 1 цагийн дараа ч ажиллахгүй бол DNS тохиргоог дахин шалгах

