# Facebook Catalog Feed Setup Guide

## Overview

This guide explains how to set up an automatic Facebook Catalog Feed that dynamically generates from your Firestore "cars" collection.

## Architecture

- **Technology**: Firebase Cloud Functions
- **Format**: CSV (Facebook Commerce Manager compatible)
- **Update Frequency**: Real-time (generated on-demand)
- **Access**: Public HTTP endpoint (no authentication required)

## Prerequisites

1. Firebase CLI installed: `npm install -g firebase-tools`
2. Firebase project initialized
3. Node.js 18+ installed

## Setup Instructions

### Step 1: Install Dependencies

```bash
cd functions
npm install
cd ..
```

### Step 2: Update Base URL

Edit `functions/index.js` and update the `baseUrl` variable:

```javascript
const baseUrl = 'https://carsmongolia.mn'; // Change to your actual domain
```

### Step 3: Deploy the Function

```bash
# Login to Firebase (if not already logged in)
firebase login

# Deploy the function
firebase deploy --only functions:facebookCatalogFeed
```

### Step 4: Get Your Feed URL

After deployment, you'll get a URL like:

```
https://us-central1-carsmongolia-d410a.cloudfunctions.net/facebookCatalogFeed
```

**Note**: The region (`us-central1`) and project ID (`carsmongolia-d410a`) will match your Firebase project.

### Step 5: Test the Feed

Open the URL in your browser or use curl:

```bash
curl https://us-central1-carsmongolia-d410a.cloudfunctions.net/facebookCatalogFeed
```

You should see CSV data with all approved cars.

## Facebook Commerce Manager Setup

1. Go to [Facebook Commerce Manager](https://business.facebook.com/commerce)
2. Select your catalog
3. Go to **Data Sources** → **Scheduled Feeds**
4. Click **Add Scheduled Feed**
5. Choose **Upload** method
6. Enter your feed URL:
   ```
   https://us-central1-carsmongolia-d410a.cloudfunctions.net/facebookCatalogFeed
   ```
7. Set schedule: **Daily** or **Hourly** (Facebook will fetch automatically)
8. Save

## Feed Format

The feed includes these Facebook-required fields:

| Field | Description | Example |
|-------|-------------|---------|
| `id` | Firestore document ID | `abc123xyz` |
| `title` | Year + Brand + Model | `2020 Toyota Camry` |
| `description` | Car details | `Машины дэлгэрэнгүй мэдээлэл` |
| `availability` | Always `in stock` | `in stock` |
| `condition` | Always `used` | `used` |
| `price` | Price in MNT (number only) | `45000000` |
| `link` | Car detail page URL | `https://carsmongolia.mn/CarDetails?id=abc123` |
| `image_link` | Main image URL | `https://...` |
| `additional_image_link` | Comma-separated other images | `https://...,https://...` |
| `brand` | Car brand/make | `Toyota` |

## How It Works

1. **Facebook requests the feed** → Calls your Cloud Function URL
2. **Function queries Firestore** → Gets all cars with `status: "approved"`
3. **Function generates CSV** → Formats data according to Facebook requirements
4. **Function returns CSV** → Facebook downloads and processes it
5. **Automatic updates** → Facebook fetches on schedule (hourly/daily)

## Important Notes

### Only Approved Cars
- Only cars with `status: "approved"` are included
- Pending or rejected cars are excluded

### Real-time Updates
- Feed is generated on-demand (not cached)
- Changes in Firestore are immediately reflected
- No manual upload needed

### Performance
- Function caches response for 5 minutes
- Handles up to thousands of cars efficiently
- Firebase automatically scales

### Cost
- Firebase Functions free tier: 2 million invocations/month
- After that: $0.40 per million invocations
- Very cost-effective for catalog feeds

## Troubleshooting

### Function Not Deploying
```bash
# Check Firebase login
firebase login

# Check project
firebase projects:list

# Set project
firebase use carsmongolia-d410a
```

### Feed Returns Empty
- Check if you have cars with `status: "approved"` in Firestore
- Check Firebase Console → Functions → Logs for errors

### Facebook Rejects Feed
- Verify CSV format is correct
- Check that all required fields are present
- Ensure image URLs are accessible
- Verify price is numeric only (no currency symbols)

### CORS Errors
- Function already includes CORS headers
- If issues persist, check Firebase Console logs

## Customization

### Add More Fields

Edit `functions/index.js` and add fields to the `headers` array and `row` array:

```javascript
const headers = [
  'id',
  'title',
  // ... existing fields
  'custom_field' // Add here
];

// In the row building section:
const row = [
  // ... existing values
  escapeCsv(car.custom_field) // Add here
];
```

### Change Update Frequency

The feed is generated on-demand. To change how often Facebook fetches:
- Go to Facebook Commerce Manager
- Edit your Scheduled Feed
- Change the schedule (Hourly, Daily, etc.)

## Support

For issues:
1. Check Firebase Console → Functions → Logs
2. Test the feed URL directly in browser
3. Verify Firestore data structure matches expected format

