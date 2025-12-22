# Email Authentication (SPF/DKIM) Тохируулах

## 🔴 Асуудал

`admin@carsmongolia.mn`-аас email илгээхэд Gmail дээр delivery failed алдаа гарч байна:

```
550-5.7.26 Your email has been blocked because the sender is unauthenticated.
550-5.7.26 Gmail requires all senders to authenticate with either SPF or DKIM.
550-5.7.26 DKIM = did not pass
550-5.7.26 SPF [carsmongolia.mn] with ip: [43.231.112.70] = did not pass
```

**Шалтгаан:**
- SPF record зөв тохируулагдаагүй
- DKIM record зөв тохируулагдаагүй
- Email server IP: `43.231.112.70`

## ✅ Шийдэл

### Алхам 1: Email Server-ийн мэдээлэл цуглуулах

**Одоогийн мэдээлэл:**
- **Domain:** `carsmongolia.mn`
- **Email server IP:** `43.231.112.70`
- **Email server hostname:** `linuxhost13.itools.mn`
- **Email addresses:** `admin@carsmongolia.mn`

### Алхам 2: SPF Record Тохируулах

SPF (Sender Policy Framework) record нь email server-ийн IP-г зөвшөөрөх record юм.

**DNS Management дээр (orderbox-dns.com эсвэл itools.mn):**

1. **TXT record нэмэх/засах:**
   - **Type:** TXT
   - **Name:** `@` (эсвэл `carsmongolia.mn`)
   - **Value:** `v=spf1 ip4:43.231.112.70 include:_spf.google.com ~all`
   - **TTL:** 3600 (эсвэл default)

**Тайлбар:**
- `v=spf1` - SPF version 1
- `ip4:43.231.112.70` - Email server IP зөвшөөрөх
- `include:_spf.google.com` - Google email services зөвшөөрөх (хэрэв Google ашиглаж байвал)
- `~all` - Бусад бүх IP-г "soft fail" гэж тэмдэглэх

**Эсвэл илүү энгийн:**
```
v=spf1 ip4:43.231.112.70 ~all
```

### Алхам 3: DKIM Record Тохируулах

DKIM (DomainKeys Identified Mail) нь email-ийн баталгаажуулалт юм.

**cPanel дээр DKIM мэдээлэл авах:**

#### Арга 1: Email Authentication хэсэгээр

1. **cPanel → Email → Email Authentication** (эсвэл **Email Deliverability**) руу орох
2. **DKIM** хэсэг олох
3. **DKIM record** харах эсвэл **Enable DKIM** товч дарах
4. **DKIM public key** хуулах:
   - **Name:** `default._domainkey` (эсвэл cPanel-аас өгсөн name)
   - **Value:** `v=DKIM1; k=rsa; p=...` (cPanel-аас өгсөн public key)

#### Арга 2: Email Accounts Management дээр

1. **cPanel → Email → Email Accounts** руу орох
2. Email account (`admin@carsmongolia.mn`) олох
3. **"Manage"** товч дарах
4. **"Email Authentication"** эсвэл **"DKIM"** хэсэг олох
5. **DKIM public key** хуулах

#### Арга 3: Zone Editor дээр шууд нэмэх

Хэрэв cPanel-аас DKIM public key авсан бол:

1. **cPanel → Zone Editor** (эсвэл **DNS Zone Editor**) руу орох
2. `carsmongolia.mn` domain сонгох
3. **Add Record** товч дарах
4. Дараах мэдээлэл оруулах:
   - **Type:** TXT
   - **Name:** `default._domainkey` (эсвэл cPanel-аас өгсөн name)
   - **Value:** `v=DKIM1; k=rsa; p=[cPanel-аас өгсөн public key]`
   - **TTL:** 3600
5. **Add Record** товч дарах

**Жишээ DKIM record:**
- **Type:** TXT
- **Name:** `default._domainkey` (эсвэл email provider-ээс өгсөн name)
- **Value:** `v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC...` (email provider-ээс өгсөн public key)
- **TTL:** 3600

**Чухал:** 
- DKIM public key-г email hosting provider-ээс авах хэрэгтэй
- cPanel дээр Email Authentication хэсэгт DKIM record автоматаар үүсгэж болно

### Алхам 4: DMARC Record Тохируулах (Сонголт)

DMARC (Domain-based Message Authentication) нь SPF болон DKIM-ийн бодлого юм.

**cPanel дээр DMARC Record нэмэх:**

1. **cPanel → Email → Email Authentication** (эсвэл **Email Deliverability**) руу орох
2. **DMARC** хэсэг олох
3. **DMARC record нэмэх** эсвэл **Enable DMARC** товч дарах
4. Дараах утга оруулах:
   - **Name:** `_dmarc`
   - **Value:** `v=DMARC1; p=none; rua=mailto:admin@carsmongolia.mn`

**Эсвэл DNS Management дээр шууд:**

1. **cPanel → Zone Editor** (эсвэл **DNS Zone Editor**) руу орох
2. **Add Record** товч дарах
3. Дараах мэдээлэл оруулах:
   - **Type:** TXT
   - **Name:** `_dmarc`
   - **Value:** `v=DMARC1; p=none; rua=mailto:admin@carsmongolia.mn`
   - **TTL:** 3600
4. **Add Record** товч дарах

**Тайлбар:**
- `v=DMARC1` - DMARC version 1
- `p=none` - Бодлого: юу ч хийхгүй (тест хийх)
- `rua=mailto:admin@carsmongolia.mn` - Report илгээх email

**Production дээр:**
```
v=DMARC1; p=quarantine; rua=mailto:admin@carsmongolia.mn
```

**⚠️ Алдаа: "DNS returned SERVFAIL"**

Хэрэв cPanel дээр "DNS returned SERVFAIL" алдаа гарч байвал:
1. **Zone Editor** дээр шууд TXT record нэмэх
2. **30 минут хүлээх** (DNS propagation)
3. cPanel дээр дахин шалгах

### Алхам 5: DNS Records Нэмэх

**Orderbox DNS эсвэл itools.mn дээр:**

#### 1. SPF Record (TXT)

```
Type: TXT
Name: @
Value: v=spf1 ip4:43.231.112.70 ~all
TTL: 3600
```

#### 2. DKIM Record (TXT) - Email provider-ээс авах

```
Type: TXT
Name: default._domainkey (эсвэл email provider-ээс өгсөн)
Value: [Email provider-ээс өгсөн DKIM public key]
TTL: 3600
```

#### 3. DMARC Record (TXT) - Сонголт

```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:admin@carsmongolia.mn
TTL: 3600
```

### Алхам 6: DNS Propagation Хүлээх

1. DNS records нэмсний дараа **30 минут - 2 цаг** хүлээх
2. Online tool ашиглах шалгах:
   - https://mxtoolbox.com/spf.aspx
   - https://mxtoolbox.com/dkim.aspx
   - https://dnschecker.org/#TXT/carsmongolia.mn

### Алхам 7: Тест Хийх

**SPF шалгах:**
```bash
# Terminal дээр
nslookup -type=TXT carsmongolia.mn
```

**Эсвэл online tool:**
- https://mxtoolbox.com/spf.aspx
- Domain оруулах: `carsmongolia.mn`
- SPF record харагдах ёстой

**Email илгээх тест:**
1. `admin@carsmongolia.mn`-аас `khashpay@gmail.com` руу email илгээх
2. Email хүрсэн эсэхийг шалгах
3. Хэрэв delivery failed болсон бол:
   - DNS records дахин шалгах
   - 30 минут хүлээх (DNS propagation)
   - Email server logs шалгах

## 🔍 Email Provider-ээс DKIM Мэдээлэл Авах

### itools.mn ашиглаж байгаа бол:

1. itools.mn вебсайт руу нэвтрэх
2. **Email settings** эсвэл **Email management** хэсэг олох
3. **DKIM settings** эсвэл **Email authentication** хэсэг олох
4. **DKIM public key** хуулах
5. DNS management дээр DKIM TXT record нэмэх

### Orderbox ашиглаж байгаа бол:

1. Orderbox control panel руу нэвтрэх
2. **Email** эсвэл **Mail settings** хэсэг олох
3. **DKIM** эсвэл **Email authentication** хэсэг олох
4. **DKIM public key** хуулах
5. DNS management дээр DKIM TXT record нэмэх

## 📋 DNS Records Хураангуй

**Одоо DNS дээр байх ёстой records:**

1. **A Record (Firebase):**
   - Name: `@`
   - Value: `199.36.158.100`
   - (Firebase hosting-ийн хувьд)

2. **TXT Record (Firebase verification):**
   - Name: `@`
   - Value: `hosting-site=carsmongolia-d410a`
   - (Firebase hosting-ийн хувьд)

3. **CNAME Record (www):**
   - Name: `www`
   - Value: `carsmongolia-d410a.web.app`
   - (www subdomain-ийн хувьд)

4. **TXT Record (SPF):**
   - Name: `@`
   - Value: `v=spf1 ip4:43.231.112.70 ~all`
   - (Email authentication-ийн хувьд) ⬅️ **ШИНЭ НЭМЭХ**

5. **TXT Record (DKIM):**
   - Name: `default._domainkey` (эсвэл email provider-ээс өгсөн)
   - Value: `[Email provider-ээс өгсөн DKIM public key]`
   - (Email authentication-ийн хувьд) ⬅️ **ШИНЭ НЭМЭХ**

6. **TXT Record (DMARC) - Сонголт:**
   - Name: `_dmarc`
   - Value: `v=DMARC1; p=none; rua=mailto:admin@carsmongolia.mn`
   - (Email authentication-ийн хувьд) ⬅️ **ШИНЭ НЭМЭХ**

## ⚠️ Чухал

- **SPF record нэмэх** - хамгийн чухал
- **DKIM record нэмэх** - email provider-ээс авах хэрэгтэй
- **DMARC record** - сонголт, гэхдээ зөвлөмж
- **DNS propagation:** 30 минут - 2 цаг
- **Firebase TXT record-ийг устгахгүй** - Firebase hosting-ийн хувьд хэрэгтэй

## 🎯 Алхам Алхмаар Хураангуй

1. ✅ Email server IP тодорхойлох: `43.231.112.70`
2. ✅ SPF TXT record нэмэх: `v=spf1 ip4:43.231.112.70 ~all`
3. ✅ Email provider-ээс DKIM public key авах
4. ✅ DKIM TXT record нэмэх
5. ✅ DMARC TXT record нэмэх (сонголт)
6. ✅ 30 минут - 2 цаг хүлээх (DNS propagation)
7. ✅ Online tool ашиглах шалгах
8. ✅ Email илгээх тест хийх

## 📧 Email Spam Folder-оос Гаргах

### Асуудал: Email spam folder-д ирж байна

Email authentication зөв тохируулагдсан ч email spam folder-д орох магадлалтай. Энэ нь email reputation сайжруулах хэрэгтэй гэсэн үг.

### Шийдэл:

#### 1. Gmail дээр Spam Folder-оос Гаргах

1. **Gmail → Spam folder** руу орох
2. Email олох (`admin@carsmongolia.mn`-аас ирсэн)
3. Email-ийг сонгох
4. **"Not spam"** товч дарах (эсвэл **"Report not spam"**)
5. Email inbox руу шилжинэ

#### 2. Gmail дээр Sender-ийг Trusted List-д Нэмэх

1. Email-ийг нээх
2. Sender (`admin@carsmongolia.mn`) дээр дарах
3. **"Add to contacts"** эсвэл **"Add to safe senders"** сонгох

#### 3. Email Reputation Сайжруулах

**Алхам 1: DMARC Policy Сайжруулах**

Одоо: `v=DMARC1; p=none;`
Сайжруулах: `v=DMARC1; p=quarantine; rua=mailto:admin@carsmongolia.mn`

**Алхам 2: Email Content Сайжруулах**

- Email subject line-ийг spam trigger үгсгүй байх
- Email body-д spam trigger үгсгүй байх
- HTML email-д зөв format ашиглах
- Email-д unsubscribe link нэмэх (хэрэв marketing email бол)

**Алхам 3: Email Sending Frequency**

- Хэт олон email илгээхгүй байх
- Recipient-үүд email хүлээн авахыг хүсч байгаа эсэхийг шалгах

**Алхам 4: Email List Hygiene**

- Invalid email addresses-ийг устгах
- Bounce rate-ийг бага байлгах
- Unsubscribe requests-ийг хурдан боловсруулах

#### 4. Email Reputation Checker Ашиглах

Online tool ашиглах email reputation шалгах:
- **Sender Score:** https://www.senderscore.org/
- **MXToolbox Blacklist Check:** https://mxtoolbox.com/blacklists.aspx
- **Google Postmaster Tools:** https://postmaster.google.com/

#### 5. Google Postmaster Tools-д Бүртгүүлэх

1. **Google Postmaster Tools** руу орох: https://postmaster.google.com/
2. **Add Property** товч дарах
3. Domain оруулах: `carsmongolia.mn`
4. DNS verification хийх (TXT record нэмэх)
5. Email reputation, spam rate, delivery rate харах

**DNS Verification Record:**
- **Type:** TXT
- **Name:** `@`
- **Value:** `[Google-аас өгсөн verification code]`

#### 6. Email Warm-up (Шинэ Domain-ийн хувьд)

Шинэ domain эсвэл email server ашиглаж байгаа бол email warm-up хийх:

1. **Эхний 7 хоног:** Өдөрт 5-10 email илгээх
2. **Дараагийн 7 хоног:** Өдөрт 20-30 email илгээх
3. **Дараагийн 7 хоног:** Өдөрт 50-100 email илгээх
4. **Дараа нь:** Normal volume руу шилжих

**Чухал:** Email warm-up хийхдээ trusted recipients-д илгээх (жишээ: өөрийн email addresses)

## 🔗 Холбогдох Линкүүд

- **SPF Checker:** https://mxtoolbox.com/spf.aspx
- **DKIM Checker:** https://mxtoolbox.com/dkim.aspx
- **DMARC Checker:** https://mxtoolbox.com/dmarc.aspx
- **DNS Checker:** https://dnschecker.org/#TXT/carsmongolia.mn
- **Google Email Authentication Guide:** https://support.google.com/mail/answer/81126#authentication
- **Google Postmaster Tools:** https://postmaster.google.com/
- **Sender Score:** https://www.senderscore.org/
- **MXToolbox Blacklist Check:** https://mxtoolbox.com/blacklists.aspx

