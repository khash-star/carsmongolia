# Orderbox DNS дээр DNS Records Засах

## 🔍 Одоогийн Байдал

Таны домэйн (`carsmongolia.mn`) дараах nameserver-үүдийг ашиглаж байна:
- `admi516687.earth.orderbox-dns.com`
- `admi516687.mars.orderbox-dns.com`
- `admi516687.mercury.orderbox-dns.com`
- `admi516687.venus.orderbox-dns.com`

**Энэ нь юу гэсэн үг вэ?**
- DNS records-ийг **orderbox-dns.com** дээр засах хэрэгтэй
- Энэ нь domain registrar-ийн DNS management систем байна

## ✅ Шууд Хийх Зүйлс

### Алхам 1: DNS Management Интерфейс Олох

1. Domain registrar вебсайт руу нэвтрэх
2. **"Домэйн нэрийн удирдлага/DNS management"** хэсэг олох
3. `carsmongolia.mn` domain сонгох

### Алхам 2: DNS Records Засах

DNS management интерфейс дээр дараах records-ийг тохируулах:

#### 1. Хуучин A Record Устгах

**Олох:**
- Type: A
- Name: @ (эсвэл `carsmongolia.mn`)
- Value: `43.231.112.70` ← ЭНЭ IP-ТЭЙ RECORD-ИЙГ УСТГАХ!

**Хийх:**
- Delete эсвэл Remove товч дарах
- Баталгаажуулах

#### 2. Шинэ A Record Нэмэх/Шалгах

**Нэмэх (хэрэв байхгүй бол):**
- Type: A
- Name: @ (эсвэл `carsmongolia.mn`)
- Value: `199.36.158.100` (Firebase IP)
- TTL: 3600 (эсвэл default)

**Шалгах (хэрэв аль хэдийн байгаа бол):**
- Зөв IP (`199.36.158.100`) байгаа эсэхийг шалгах
- Хэрэв хуучин IP (`43.231.112.70`) байвал засах

#### 3. TXT Record Нэмэх/Шалгах

**Нэмэх (хэрэв байхгүй бол):**
- Type: TXT
- Name: @ (эсвэл `carsmongolia.mn`)
- Value: `hosting-site=carsmongolia-d410a`
- TTL: 3600 (эсвэл default)

**Шалгах (хэрэв аль хэдийн байгаа бол):**
- Зөв value (`hosting-site=carsmongolia-d410a`) байгаа эсэхийг шалгах

### Алхам 3: Хадгалах

1. Бүх өөрчлөлтийг хийсний дараа
2. **Save** эсвэл **Update DNS** товч дарах
3. Баталгаажуулах

### Алхам 4: DNS Propagation Хүлээх

- **30 минут - 2 цаг** хүлээх
- https://www.whatsmydns.net/#A/carsmongolia.mn дээр шалгах
- `199.36.158.100` IP харагдаж эхэлсэн эсэхийг шалгах

### Алхам 5: Firebase Console Дээр Verify Хийх

1. Firebase Console → Hosting → Custom domains
2. `carsmongolia.mn` domain-ийг нээх
3. **"Verify"** товч дарах
4. **5-15 минут хүлээх**

## 📋 DNS Management Интерфейс Дээр Харагдах Ёстой Records

### ✅ Байх Ёстой:

1. **A Record:**
   - Type: A
   - Name: @
   - Value: `199.36.158.100`
   - TTL: 3600 (эсвэл default)
   - Status: Active

2. **TXT Record:**
   - Type: TXT
   - Name: @
   - Value: `hosting-site=carsmongolia-d410a`
   - TTL: 3600 (эсвэл default)
   - Status: Active

3. **CNAME Record (www):**
   - Type: CNAME
   - Name: www
   - Value: `carsmongolia.mn`
   - Status: Active

4. **NS Records:**
   - Type: NS
   - Name: @
   - Value: `admi516687.earth.orderbox-dns.com`
   - Value: `admi516687.mars.orderbox-dns.com`
   - Value: `admi516687.mercury.orderbox-dns.com`
   - Value: `admi516687.venus.orderbox-dns.com`

### ❌ Байх Ёсгүй:

1. **A Record:**
   - Type: A
   - Name: @
   - Value: `43.231.112.70` (ХУУЧИН IP - УСТГАХ!)

## 🔍 Хэрэв DNS Management Олохгүй Байвал

### Сонголт 1: Domain Registrar Support-тай Холбогдох

1. Domain registrar вебсайт дээр support хэсэг олох
2. Email эсвэл ticket илгээх
3. Дараах мэдээллийг өгөх:

**Email/Ticket агуулга:**
```
Сайн байна уу,

Би carsmongolia.mn домэйний DNS records засах хэрэгтэй байна.

Одоогийн nameserver-үүд:
- admi516687.earth.orderbox-dns.com
- admi516687.mars.orderbox-dns.com
- admi516687.mercury.orderbox-dns.com
- admi516687.venus.orderbox-dns.com

Хийх өөрчлөлтүүд:
1. Хуучин A record устгах:
   - Type: A
   - Name: @
   - Value: 43.231.112.70

2. Шинэ A record нэмэх/засах:
   - Type: A
   - Name: @
   - Value: 199.36.158.100

3. TXT record нэмэх/засах:
   - Type: TXT
   - Name: @
   - Value: hosting-site=carsmongolia-d410a

Эдгээр өөрчлөлтүүдийг хийж өгөх боломжтой юу?

Баярлалаа.
```

### Сонголт 2: DNS Management Интерфейс Хайх

Domain registrar вебсайт дээр дараах хэсгүүдээс нэгийг олох:
- **DNS Management**
- **DNS Records**
- **Zone Editor**
- **DNS Zone**
- **Manage DNS**
- **Domain Settings** → **DNS**

## ⚠️ Чухал

- ✅ **Orderbox DNS дээр DNS records засах** - энэ нь хамгийн чухал
- ❌ **Өөр DNS management дээр засварласан records ажиллахгүй** - nameserver өөр байна
- ⏳ **DNS propagation:** 30 минут - 2 цаг
- ⏳ **Verify process:** 5-15 минут

## 🎯 Алхам Алхмаар Хураангуй

1. ✅ Domain registrar вебсайт руу нэвтрэх
2. ✅ DNS management хэсэг олох
3. ✅ carsmongolia.mn domain сонгох
4. ✅ Хуучин A record (`43.231.112.70`) устгах
5. ✅ Шинэ A record (`199.36.158.100`) нэмэх/шалгах
6. ✅ TXT record (`hosting-site=carsmongolia-d410a`) нэмэх/шалгах
7. ✅ Хадгалах
8. ✅ 30 минут - 2 цаг хүлээх (DNS propagation)
9. ✅ Firebase Console дээр verify хийх

## 📝 Дэлгэрэнгүй

Өмнөх зааварчилгаанууд:
- `ITOOLS_DNS_SETUP.md` - itools.mn nameserver-үүдийн хувьд
- `ALTERNATIVE_SOLUTIONS.md` - Өөр аргууд
- `DNS_PROPAGATION_STATUS.md` - DNS propagation status

## 🎉 Амжилт Хүсье!

Orderbox DNS дээр DNS records засварласны дараа 30 минут - 2 цагийн дотор Firebase verify хийж болно!

