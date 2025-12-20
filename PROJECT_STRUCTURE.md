# Төслийн Бүтэц - Файлуудын Байршил

## 📁 Үндсэн Folder-ууд

```
auto-market-copy-37f7adcc (2)/
├── src/                          # Эх код
│   ├── components/               # React компонентүүд
│   ├── pages/                    # Хуудсууд (Pages)
│   ├── services/                 # Firebase services (Auth, Firestore, Storage)
│   ├── config/                   # Тохиргоо файлууд
│   └── utils/                    # Utility функцүүд
├── dist/                         # Production build (npm run build хийсний дараа)
├── public/                       # Public файлууд
└── node_modules/                 # Dependencies
```

## 🔧 Чухал Файлууд

### 1. Firebase Тохиргоо
**`src/config/firebase.js`**
- Firebase config
- Firestore, Storage, Auth initialization

### 2. Authentication (Нэвтрэх)
**`src/services/auth.js`**
- `login()` - Имэйл/нууц үгээр нэвтрэх
- `register()` - Бүртгүүлэх
- `loginWithFacebook()` - Facebook-ээр нэвтрэх
- `logout()` - Гарах
- `resetPassword()` - Нууц үг сэргээх

### 3. Хуудсууд (Pages)

**`src/pages/Login.jsx`**
- Нэвтрэх / Бүртгүүлэх хуудас
- Facebook login товч

**`src/pages/Home.jsx`**
- Нүүр хуудас (машины зарууд)

**`src/pages/AddCar.jsx`**
- Машины зар нэмэх

**`src/pages/AddBusiness.jsx`**
- Бизнес нэмэх

**`src/pages/Admin.jsx`**
- Админ хуудас (зарууд батлах)

**`src/pages/Layout.jsx`**
- Header, Navigation menu

**`src/pages/index.jsx`**
- Routing тохиргоо

### 4. Services (Firebase)

**`src/services/cars.js`**
- Машины зарууд CRUD

**`src/services/businesses.js`**
- Бизнесүүд CRUD

**`src/services/storage.js`**
- Зураг upload (Firebase Storage)

**`src/services/favorites.js`**
- Дуртай зарууд

**`src/services/messages.js`**
- Мессежүүд

### 5. Routing

**`src/pages/index.jsx`**
- Бүх route-уудын тохиргоо
- Protected routes
- Admin routes

### 6. Deploy Файлууд

**`.htaccess`**
- Apache server configuration
- SPA routing

**`autozar-deploy.zip`**
- Production build файлууд
- cPanel дээр upload хийх

## 🛠️ Засвар Хийхэд

### Facebook Login засах:
1. `src/services/auth.js` → `loginWithFacebook()` функц
2. `src/pages/Login.jsx` → Facebook товч

### Нэвтрэх хуудас засах:
- `src/pages/Login.jsx`

### Navigation menu засах:
- `src/pages/Layout.jsx`

### Routing засах:
- `src/pages/index.jsx`

### Firebase config засах:
- `src/config/firebase.js`

### Машины зарууд засах:
- `src/services/cars.js`
- `src/pages/Home.jsx`
- `src/pages/CarDetails.jsx`

### Бизнес засах:
- `src/services/businesses.js`
- `src/pages/Services.jsx`
- `src/pages/BusinessDetails.jsx`

## 📝 Build хийх

```bash
npm run build
```

Build хийсний дараа `dist/` folder үүснэ.

## 🔍 Файл хайх

**VS Code / Cursor дээр:**
- `Ctrl + P` (Windows) эсвэл `Cmd + P` (Mac)
- Файлын нэрийг бичих

**Terminal дээр:**
```bash
# Файл хайх
dir /s /b *Login.jsx

# Эсвэл PowerShell
Get-ChildItem -Recurse -Filter "Login.jsx"
```

## 📂 Folder бүтэц

```
src/
├── components/          # UI компонентүүд
│   ├── ui/             # Shadcn UI компонентүүд
│   └── cars/           # Машины компонентүүд
├── pages/              # Хуудсууд
│   ├── Login.jsx       # Нэвтрэх
│   ├── Home.jsx        # Нүүр
│   ├── AddCar.jsx      # Зар нэмэх
│   ├── AddBusiness.jsx # Бизнес нэмэх
│   ├── Admin.jsx       # Админ
│   ├── Layout.jsx      # Layout
│   └── index.jsx       # Routing
├── services/           # Firebase services
│   ├── auth.js        # Authentication
│   ├── cars.js        # Машины зарууд
│   ├── businesses.js  # Бизнесүүд
│   ├── storage.js     # Зураг upload
│   ├── favorites.js   # Дуртай зарууд
│   └── messages.js    # Мессежүүд
├── config/
│   └── firebase.js    # Firebase config
└── utils/             # Utility функцүүд
```

## 🎯 Хамгийн их засвар хийгддэг файлууд

1. **`src/pages/Login.jsx`** - Нэвтрэх хуудас
2. **`src/pages/Layout.jsx`** - Navigation menu
3. **`src/services/auth.js`** - Authentication логик
4. **`src/pages/Home.jsx`** - Нүүр хуудас
5. **`src/pages/Admin.jsx`** - Админ хуудас

## 💡 Зөвлөмж

- Файл засахын өмнө backup хийх
- Git ашиглах (version control)
- Засвар хийсний дараа `npm run build` хийж тест хийх

