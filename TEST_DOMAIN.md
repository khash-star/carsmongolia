# Domain тест хийх заавар

## ✅ Domain ажиллаж байгаа эсэхийг шалгах

### 1. Үндсэн domain тест

Браузер дээр нээх:
```
https://carsmongolia.mn
```

Хэрэв React app харагдаж байвал ✅ ажиллаж байна.

### 2. Facebook Catalog Feed тест

Браузер дээр нээх:
```
https://carsmongolia.mn/catalog/facebook.csv
```

Эсвэл:
```
https://carsmongolia.mn/catalog/facebook
```

**Хүлээгдэж буй үр дүн:**
- CSV файл татагдах эсвэл CSV data харагдах
- Кирилл/Монгол тэмдэгтүүд зөв харагдах

### 3. Terminal дээр тест хийх

```bash
curl https://carsmongolia.mn/catalog/facebook.csv
```

Эсвэл PowerShell дээр:
```powershell
Invoke-WebRequest -Uri "https://carsmongolia.mn/catalog/facebook.csv" -OutFile "test.csv"
```

## 🎯 Facebook Commerce Manager дээр нэмэх

Domain ажиллаж байгаа бол:

1. **Facebook Commerce Manager** руу орох: https://business.facebook.com/commerce
2. Catalog сонгох
3. **Data Sources** → **Scheduled Feeds** → **Add Scheduled Feed**
4. **Upload** method сонгох
5. **Feed URL** оруулах:
   ```
   https://carsmongolia.mn/catalog/facebook.csv
   ```
6. **Schedule** сонгох: **Hourly** (зөвлөмжтэй) эсвэл **Daily**
7. **Save**

## ✅ Амжилттай болсон эсэх

- ✅ Domain ажиллаж байна
- ✅ Feed URL ажиллаж байна
- ✅ Facebook дээр нэмсэн
- ✅ Автоматаар шинэчлэгдэнэ

## 🔄 Автомат шинэчлэлт

- Шинэ машин баталгаажсаны дараа каталог автоматаар шинэчлэгдэнэ
- Facebook каталог автоматаар татагдана
- Хэдэн цагийн дараа Facebook дээр харагдана

## 📝 Дэлгэрэнгүй

- Feed URL: `https://carsmongolia.mn/catalog/facebook.csv`
- Functions URL: `https://us-central1-carsmongolia-d410a.cloudfunctions.net/facebookCatalogFeed`
- Frontend URL: `https://carsmongolia.mn`

