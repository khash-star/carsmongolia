# AutoZar - Автомашины Зах

React/Vite төсөл - Firebase-тэй холбогдсон автомашины заруудын платформ.

## Технологи

- **Frontend**: React 18 + Vite
- **Backend**: Firebase (Firestore, Storage, Authentication)
- **UI**: Tailwind CSS + Radix UI
- **State Management**: TanStack Query (React Query)

## Суулгалт

```bash
npm install
```

## Хөгжүүлэлт

```bash
npm run dev
```

## Production Build

```bash
npm run build
```

## Firebase Тохиргоо

Firebase config нь `src/config/firebase.js` файлд байрлана.

## Хувилбар

- Firebase Authentication (Email/Password)
- Firestore database (cars, businesses, favorites, messages)
- Firebase Storage (зураг upload)
- Role-based access control (USER, ADMIN)
- Protected routes