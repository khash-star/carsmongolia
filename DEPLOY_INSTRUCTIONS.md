# Deploy файлууд татаж авах заавар

## ✅ Build хийгдсэн

Production build амжилттай хийгдлээ. Одоо татаж авах файлууд бэлэн байна.

## 📦 Татаж авах файл

**`autozar-deploy.zip`** - Энэ файлд:
- `dist/` folder-ийн бүх файлууд (index.html, assets/)
- `.htaccess` файл (SPA routing-ийн тулд)

## 📍 Файлын байршил

```
C:\Users\khash\Downloads\newsys\auto-market-copy-37f7adcc (2)\autozar-deploy.zip
```

## 🚀 cPanel/VPS дээр Deploy хийх

### 1. ZIP файл татаж авах
- `autozar-deploy.zip` файлыг татаж авах

### 2. cPanel File Manager дээр
1. cPanel → **File Manager** → `public_html/` folder руу орох
2. ZIP файлыг upload хийх
3. ZIP файл дээр right-click → **Extract** хийх
4. Extract хийсний дараа файлууд `public_html/` дээр байрлана:
   - `index.html`
   - `assets/` folder
   - `.htaccess` файл

### 3. FTP ашиглах бол
1. ZIP файлыг local дээр extract хийх
2. Extract хийсэн файлуудыг FTP client ашиглан `public_html/` руу upload хийх

## ⚠️ Чухал

1. **`.htaccess` файл заавал байх ёстой** - SPA routing ажиллахын тулд
2. **File permissions:**
   - Files: `644`
   - Folders: `755`
3. **SSL certificate** заавал хэрэгтэй (HTTPS) - Facebook login ажиллахын тулд

## 🔧 Дараагийн алхмууд

1. Firebase Console → Authentication → Settings → Authorized domains → `carsmongolia.mn` нэмэх
2. Facebook App → Settings → App Domains → `carsmongolia.mn` нэмэх
3. Facebook Login → Valid OAuth Redirect URIs → `https://carsmongolia.mn/__/auth/handler` нэмэх
4. Domain DNS records тохируулах
5. SSL certificate суулгах

## 📝 Тест хийх

Deploy хийсний дараа:
1. `https://carsmongolia.mn` руу орох
2. Home page харагдах ёстой
3. `/login` хуудас руу орох
4. Facebook login тест хийх

## 🔄 Update хийх

Шинэ version deploy хийхэд:
1. Local дээр `npm run build` хийх
2. `dist/` folder-ийн файлуудыг cPanel дээр upload хийх (хуучин файлуудыг солих)
3. `.htaccess` файл хэвээр үлдэнэ (өөрчлөх шаардлагагүй)

