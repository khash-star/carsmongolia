# Deploy Facebook Catalog Feed - Quick Start

## 🚀 Quick Deployment Steps

### 1. Install Firebase CLI (if not installed)
```bash
npm install -g firebase-tools
```

### 2. Login to Firebase
```bash
firebase login
```

### 3. Install Function Dependencies
```bash
cd functions
npm install
cd ..
```

### 4. Update Domain (if needed)
Edit `functions/index.js` line 47:
```javascript
const baseUrl = process.env.BASE_URL || 'https://carsmongolia.mn';
```
Change `carsmongolia.mn` to your actual domain.

### 5. Deploy the Function
```bash
firebase deploy --only functions:facebookCatalogFeed
```

### 6. Get Your Feed URL
After deployment, you'll see output like:
```
✔  functions[facebookCatalogFeed(us-central1)]: Successful create operation.
Function URL: https://us-central1-carsmongolia-d410a.cloudfunctions.net/facebookCatalogFeed
```

**This is your feed URL!** Copy it.

## 📋 Add to Facebook Commerce Manager

1. Go to: https://business.facebook.com/commerce
2. Select your catalog
3. **Data Sources** → **Scheduled Feeds** → **Add Scheduled Feed**
4. Choose **Upload** method
5. Paste your feed URL
6. Set schedule: **Hourly** (recommended) or **Daily**
7. Save

## ✅ Test Your Feed

Open the URL in browser:
```
https://us-central1-carsmongolia-d410a.cloudfunctions.net/facebookCatalogFeed
```

You should see CSV data with all your approved cars.

## 🔄 How It Works

- **Automatic**: Feed updates automatically when cars are added/updated/deleted
- **Real-time**: Generated on-demand from Firestore
- **No manual upload**: Facebook fetches automatically on schedule
- **Only approved cars**: Only includes cars with `status: "approved"`

## 🛠️ Troubleshooting

**Function won't deploy?**
```bash
firebase use carsmongolia-d410a
firebase deploy --only functions:facebookCatalogFeed
```

**Empty feed?**
- Check if you have cars with `status: "approved"` in Firestore
- Check Firebase Console → Functions → Logs

**Need to change domain?**
- Edit `functions/index.js` line 47
- Redeploy: `firebase deploy --only functions:facebookCatalogFeed`

