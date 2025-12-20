# cPanel/VPS дээр Deploy хийх

## 1. Production Build хийх

```bash
npm run build
```

Build хийсний дараа `dist/` folder үүснэ. Энэ folder-ийг cPanel/VPS дээр upload хийх хэрэгтэй.

## 2. cPanel дээр Upload хийх

### 2.1. File Manager ашиглах

1. cPanel → **File Manager** руу орох
2. `public_html` folder (эсвэл domain-ийн root folder) руу орох
3. `dist/` folder-ийн бүх файлуудыг upload хийх:
   - `dist/` folder-ийн **доторх** бүх файлуудыг (folder биш)
   - `public_html/` дээр шууд байрлуулах

**Чухал:** `dist/` folder-ийн доторх файлуудыг upload хийх, `dist` folder-ийг биш.

### 2.2. FTP ашиглах

1. FTP client (FileZilla, WinSCP гэх мэт) ашиглах
2. cPanel-аас FTP credentials авна:
   - Host: `ftp.carsmongolia.mn` (эсвэл IP address)
   - Username: cPanel username
   - Password: cPanel password
3. `dist/` folder-ийн бүх файлуудыг `public_html/` руу upload хийх

## 3. .htaccess файл үүсгэх (SPA Routing)

React Router ашиглаж байгаа тул бүх route-ууд `index.html` руу redirect хийх хэрэгтэй.

`public_html/` folder дээр `.htaccess` файл үүсгэх:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# Security headers
<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set X-Frame-Options "SAMEORIGIN"
  Header set X-XSS-Protection "1; mode=block"
</IfModule>

# Gzip compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Cache control
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType application/pdf "access plus 1 month"
  ExpiresByType text/html "access plus 0 seconds"
</IfModule>
```

**cPanel File Manager дээр .htaccess үүсгэх:**
1. File Manager → `public_html/` folder
2. **+ File** товч дарна
3. Нэр: `.htaccess`
4. Дээрх контентыг paste хийх
5. **Save** дарна

## 4. Domain тохируулах

### 4.1. cPanel дээр Domain нэмэх

1. cPanel → **Addon Domains** эсвэл **Subdomains**
2. Domain нэмэх: `carsmongolia.mn`
3. Document Root: `public_html` (эсвэл `public_html/carsmongolia.mn`)

### 4.2. DNS Records тохируулах

Domain provider (DNS) дээр дараах records нэмэх:

**A Record:**
```
Type: A
Name: @ (эсвэл carsmongolia.mn)
Value: VPS IP address
TTL: 3600
```

**CNAME Record (www):**
```
Type: CNAME
Name: www
Value: carsmongolia.mn
TTL: 3600
```

## 5. SSL Certificate тохируулах (HTTPS)

Facebook Login зөвхөн HTTPS дээр ажиллана, тиймээс SSL certificate заавал хэрэгтэй.

### 5.1. Let's Encrypt (Free SSL)

1. cPanel → **SSL/TLS Status**
2. Domain сонгох: `carsmongolia.mn`
3. **Run AutoSSL** эсвэл **Install** товч дарна
4. Let's Encrypt certificate автоматаар сууна

### 5.2. Эсвэл cPanel AutoSSL

cPanel-д AutoSSL идэвхтэй бол автоматаар SSL certificate сууна.

## 6. Firebase Authorized Domains тохируулах

1. [Firebase Console](https://console.firebase.google.com/) → `carsmongolia-d410a`
2. **Authentication** → **Settings**
3. **Authorized domains** хэсэг
4. **Add domain** → `carsmongolia.mn` нэмэх

## 7. Facebook App Settings тохируулах

1. [Facebook Developers](https://developers.facebook.com/) → Таны App
2. **Settings** → **Basic**:
   - **App Domains**: `carsmongolia.mn`
   - **Website** → **Site URL**: `https://carsmongolia.mn`
3. **Facebook Login** → **Settings**:
   - **Valid OAuth Redirect URIs**:
     ```
     https://carsmongolia.mn/__/auth/handler
     https://carsmongolia-d410a.firebaseapp.com/__/auth/handler
     ```

## 8. File Permissions тохируулах

cPanel File Manager дээр:
- Files: `644`
- Folders: `755`
- `.htaccess`: `644`

## 9. Тест хийх

1. Browser дээр: `https://carsmongolia.mn`
2. Home page харагдах ёстой
3. `/login` хуудас руу орох
4. Facebook login тест хийх
5. Бүх route-ууд ажиллах ёстой (404 алдаа гарахгүй)

## 10. Update хийх (Deploy шинэ version)

1. Local дээр өөрчлөлт хийх
2. Build хийх: `npm run build`
3. `dist/` folder-ийн файлуудыг cPanel дээр upload хийх (хуучин файлуудыг солих)

**Зөвлөмж:** Хуучин файлуудыг backup хийх эсвэл version folder үүсгэх.

## 11. Troubleshooting

### 404 алдаа гарвал:
- `.htaccess` файл байгаа эсэхийг шалгах
- `mod_rewrite` module идэвхтэй эсэхийг шалгах
- File permissions зөв эсэхийг шалгах

### Facebook login ажиллахгүй байвал:
- HTTPS ашиглаж байгаа эсэхийг шалгах (HTTP дээр ажиллахгүй)
- Firebase Authorized domains дээр domain нэмсэн эсэхийг шалгах
- Facebook App Settings дээр OAuth Redirect URI зөв эсэхийг шалгах

### Build файлууд харагдахгүй байвал:
- `dist/` folder-ийн доторх файлуудыг upload хийсэн эсэхийг шалгах
- `public_html/` folder дээр `index.html` байгаа эсэхийг шалгах
- File permissions зөв эсэхийг шалгах

## 12. VPS дээр (SSH ашиглах)

Хэрэв VPS дээр SSH access байвал:

```bash
# VPS дээр нэвтрэх
ssh user@your-vps-ip

# Project folder руу орох
cd /var/www/html  # эсвэл таны web root folder

# Local дээр build хийсний дараа, dist/ folder-ийг VPS руу copy хийх
# SCP ашиглах:
scp -r dist/* user@your-vps-ip:/var/www/html/

# Эсвэл Git ашиглах:
git pull
npm install
npm run build
# dist/ folder-ийн файлуудыг web root руу copy хийх
cp -r dist/* /var/www/html/
```

## Checklist

- [ ] `npm run build` хийсэн
- [ ] `dist/` folder-ийн файлуудыг cPanel/VPS дээр upload хийсэн
- [ ] `.htaccess` файл үүсгэсэн
- [ ] Domain DNS records тохируулсан
- [ ] SSL certificate суулгасан (HTTPS)
- [ ] Firebase Authorized domains дээр `carsmongolia.mn` нэмсэн
- [ ] Facebook App Settings тохируулсан
- [ ] Production URL дээр тест хийсэн

