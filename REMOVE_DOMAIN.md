# Domain салгах заавар

## ⚠️ Анхаар

Domain салгах нь:
- Firebase Hosting-тай холбоогүй болгоно
- cPanel дээрх DNS records хэвээр үлдэнэ
- Сайт cPanel дээр ажиллах болно

## 🔄 Domain салгах арга

### Арга 1: Firebase Console дээр устгах (Зөвлөмжтэй)

1. **Firebase Console** руу орох: https://console.firebase.google.com/project/carsmongolia-d410a/hosting
2. **Domains** хэсэг олох
3. `carsmongolia.mn` domain дээр дарах
4. **"Remove domain"** эсвэл **"Delete"** товч дарах
5. Баталгаажуулах

### Арга 2: DNS records өөрчлөх

cPanel дээр DNS records-ийг өөрчлөх:
- Firebase IP addresses (`199.36.158.100`) устгах
- cPanel hosting IP address нэмэх

## 📋 Domain салгасны дараа

### Firebase Hosting:
- `https://carsmongolia-d410a.web.app` ажиллана
- `https://carsmongolia-d410a.firebaseapp.com` ажиллана
- Custom domain ажиллахгүй болно

### cPanel Hosting:
- `https://carsmongolia.mn` cPanel дээрх сайт ажиллана
- DNS records cPanel IP-д чиглэнэ

## ⚠️ Чухал

Domain салгахын өмнө:
- ✅ cPanel дээр сайт бэлэн эсэхийг шалгах
- ✅ DNS records зөв тохируулсан эсэхийг шалгах
- ✅ Backup авсан эсэхийг шалгах

## 🔄 Дахин холбох

Хэрэв дараа нь дахин холбох хүсвэл:
1. Firebase Console → Hosting → Add custom domain
2. DNS records дахин тохируулах

