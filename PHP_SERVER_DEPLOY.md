# PHP Server дээр Deploy хийх (React Static App)

## ✅ Хувилбар

**Энэ төсөл нь React/Vite static app байна. PHP шаардлагагүй!**

- Frontend: React (static files - HTML, JS, CSS)
- Backend: Firebase (Firestore, Storage, Authentication)
- PHP хэрэггүй - зөвхөн static files upload хийх хэрэгтэй

## 📦 Deploy хийх

### 1. Build хийх

```bash
npm run build
```

`dist/` folder үүснэ (static files).

### 2. PHP Server дээр Upload

**cPanel File Manager:**
1. cPanel → **File Manager** → `public_html/` folder
2. `dist/` folder-ийн **бүх файлуудыг** upload хийх:
   - `index.html`
   - `assets/` folder
   - `.htaccess` файл

**FTP:**
- FTP client ашиглан `dist/` folder-ийн файлуудыг `public_html/` руу upload хийх

## ⚠️ Чухал

### PHP хэрэггүй
- React app нь static files тул PHP interpreter шаардлагагүй
- Зөвхөн web server (Apache/Nginx) хэрэгтэй
- `.htaccess` файл нь Apache-д SPA routing-ийн тулд

### Backend нь Firebase
- Бүх data Firebase дээр байна (Firestore, Storage)
- Authentication нь Firebase Auth
- PHP backend хэрэггүй

## 🔧 Server Requirements

**Хамгийн бага шаардлага:**
- Web server (Apache эсвэл Nginx)
- Static file serving
- `.htaccess` support (Apache-д)
- HTTPS (Facebook login-ийн тулд)

**Хэрэггүй:**
- PHP interpreter
- PHP extensions
- Database server (Firebase ашиглаж байна)

## 📝 .htaccess файл

`.htaccess` файл нь:
- SPA routing-ийн тулд (бүх route-ууд `index.html` руу redirect)
- Security headers
- Gzip compression
- Cache control

PHP-тай холбоогүй, зөвхөн Apache configuration.

## 🚀 Deploy Process

1. **Build хийх:**
   ```bash
   npm run build
   ```

2. **Upload хийх:**
   - `dist/` folder-ийн файлуудыг `public_html/` руу upload

3. **Тест хийх:**
   - `https://carsmongolia.mn` руу орох
   - App ажиллах ёстой

## ❓ FAQ

### Q: PHP файл шаардлагатай юу?
**A:** Үгүй. React app нь static files тул PHP хэрэггүй.

### Q: PHP server дээр ажиллах уу?
**A:** Тийм. PHP server нь static files serve хийж чадна. PHP interpreter хэрэггүй.

### Q: Backend хаана байна?
**A:** Firebase дээр (Firestore, Storage, Auth). PHP backend хэрэггүй.

### Q: .htaccess файл яагаад хэрэгтэй вэ?
**A:** SPA routing-ийн тулд. Бүх route-ууд `index.html` руу redirect хийх.

## 📋 Checklist

- [ ] `npm run build` хийсэн
- [ ] `dist/` folder-ийн файлуудыг upload хийсэн
- [ ] `.htaccess` файл байрлуулсан
- [ ] HTTPS идэвхтэй
- [ ] Firebase/Facebook settings тохируулсан
- [ ] Production URL дээр тест хийсэн

## 🔗 Холбогдох файлууд

- `autozar-deploy.zip` - Deploy хийх файлууд
- `CPANEL_VPS_DEPLOY.md` - Дэлгэрэнгүй зааварчилгаа
- `.htaccess` - Apache configuration

