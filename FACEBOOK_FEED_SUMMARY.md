# Facebook Catalog Feed - Complete Solution

## ✅ What Was Created

A **Firebase Cloud Function** that generates a public Facebook Catalog Feed endpoint.

## 📍 Your Feed URL

After deployment, your feed URL will be:
```
https://us-central1-carsmongolia-d410a.cloudfunctions.net/facebookCatalogFeed
```

*(Region and project ID match your Firebase project)*

## 🎯 Solution Overview

### Best Approach: **Firebase Cloud Functions**

**Why this is best for your setup:**
- ✅ No separate server needed
- ✅ Integrates directly with Firestore
- ✅ Auto-scales automatically
- ✅ Public HTTP endpoint
- ✅ Very cost-effective (free tier: 2M requests/month)
- ✅ Real-time updates (generated on-demand)

### Alternative Approaches (Not Recommended)

1. **Express.js Endpoint** - Would require:
   - Setting up Node.js server
   - Hosting infrastructure
   - More complex deployment
   - ❌ Not needed since you're already on Firebase

2. **Static CSV Generation** - Would require:
   - Manual regeneration on every change
   - Not truly dynamic
   - ❌ Doesn't meet "automatic" requirement

## 📁 Files Created

```
functions/
  ├── index.js              # Main Cloud Function code
  ├── package.json          # Function dependencies
  ├── .eslintrc.js          # Linting config
  └── .gitignore           # Git ignore

.firebaserc                 # Firebase project config
firebase.json              # Firebase Functions config
DEPLOY_FACEBOOK_FEED.md    # Quick deployment guide
FACEBOOK_CATALOG_FEED_SETUP.md  # Detailed setup guide
```

## 🚀 Deployment Steps

### Step 1: Install Dependencies
```bash
cd functions
npm install
cd ..
```

### Step 2: Update Domain (if needed)
Edit `functions/index.js` line 47:
```javascript
const baseUrl = process.env.BASE_URL || 'https://carsmongolia.mn';
```

### Step 3: Deploy
```bash
firebase login
firebase deploy --only functions:facebookCatalogFeed
```

### Step 4: Copy Feed URL
After deployment, copy the Function URL from the output.

## 📊 Feed Format

The feed generates CSV with these Facebook-required fields:

| Field | Source | Example |
|-------|--------|---------|
| `id` | Firestore document ID | `abc123` |
| `title` | `year + make + model` | `2020 Toyota Camry` |
| `description` | Car details + specs | `Машины дэлгэрэнгүй...` |
| `availability` | Always `in stock` | `in stock` |
| `condition` | Always `used` | `used` |
| `price` | Price in MNT (number) | `45000000` |
| `link` | `https://carsmongolia.mn/CarDetails?id=abc123` | Full URL |
| `image_link` | First image URL | `https://...` |
| `additional_image_link` | Other images (comma-separated) | `https://...,https://...` |
| `brand` | Car make/brand | `Toyota` |

## 🔄 How Automatic Updates Work

1. **Car added/updated/deleted** in Firestore
2. **Facebook requests feed** (on schedule: hourly/daily)
3. **Cloud Function queries Firestore** (gets latest data)
4. **Function generates CSV** (formatted for Facebook)
5. **Function returns CSV** (Facebook processes it)
6. **No manual steps needed!** ✨

## 🎛️ Facebook Commerce Manager Setup

1. Go to: https://business.facebook.com/commerce
2. Select your catalog
3. **Data Sources** → **Scheduled Feeds** → **Add Scheduled Feed**
4. Method: **Upload**
5. URL: Paste your feed URL
6. Schedule: **Hourly** (recommended) or **Daily**
7. Save

Facebook will automatically fetch your feed on schedule!

## ⚙️ Configuration

### Only Approved Cars
- Only includes cars with `status: "approved"`
- Pending/rejected cars are excluded

### Real-time Generation
- Feed is generated on-demand (not cached)
- Always reflects latest Firestore data
- No stale data

### Performance
- Handles thousands of cars efficiently
- Response cached for 5 minutes
- Auto-scales with Firebase

## 💰 Cost

- **Free tier**: 2 million invocations/month
- **After free tier**: $0.40 per million invocations
- **Very cost-effective** for catalog feeds

Example: If Facebook fetches hourly = 24 requests/day = 720/month = **FREE** ✅

## 🔍 Testing

### Test in Browser
Open your feed URL:
```
https://us-central1-carsmongolia-d410a.cloudfunctions.net/facebookCatalogFeed
```

You should see CSV data.

### Test with curl
```bash
curl https://us-central1-carsmongolia-d410a.cloudfunctions.net/facebookCatalogFeed
```

### Verify in Firebase Console
1. Go to Firebase Console
2. Functions → Logs
3. Check for any errors

## 🐛 Troubleshooting

### Function Not Deploying
```bash
# Check login
firebase login

# Check project
firebase use carsmongolia-d410a

# Try deploy again
firebase deploy --only functions:facebookCatalogFeed
```

### Empty Feed
- Verify you have cars with `status: "approved"` in Firestore
- Check Firebase Console → Functions → Logs for errors

### Facebook Rejects Feed
- Verify CSV format (open URL in browser)
- Check all required fields are present
- Ensure image URLs are accessible
- Verify price is numeric (no currency symbols)

## 📝 Next Steps

1. ✅ Deploy the function (see DEPLOY_FACEBOOK_FEED.md)
2. ✅ Test the feed URL
3. ✅ Add to Facebook Commerce Manager
4. ✅ Set schedule (hourly recommended)
5. ✅ Done! Feed updates automatically 🎉

## 📚 Documentation

- **Quick Start**: See `DEPLOY_FACEBOOK_FEED.md`
- **Detailed Guide**: See `FACEBOOK_CATALOG_FEED_SETUP.md`
- **Function Code**: See `functions/index.js`

## ✨ Summary

You now have a **fully automatic Facebook Catalog Feed** that:
- ✅ Updates automatically when cars change
- ✅ Requires zero manual intervention
- ✅ Works with Facebook Commerce Manager
- ✅ Scales automatically
- ✅ Costs almost nothing (free tier covers it)

Just deploy and add the URL to Facebook! 🚀

