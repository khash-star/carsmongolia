const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp();

/**
 * Facebook Catalog Feed - CSV Format
 * Public endpoint: https://YOUR_REGION-YOUR_PROJECT.cloudfunctions.net/facebookCatalogFeed
 * 
 * This endpoint generates a CSV feed compatible with Facebook Commerce Manager
 * The feed is dynamically generated from Firestore "cars" collection
 * Only includes cars with status: "approved"
 */
exports.facebookCatalogFeed = functions.https.onRequest(async (req, res) => {
  try {
    // Set CORS headers for public access
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }

    // Only allow GET requests
    if (req.method !== 'GET') {
      res.status(405).send('Method Not Allowed');
      return;
    }

    // Get all approved cars from Firestore
    const carsSnapshot = await admin.firestore()
      .collection('cars')
      .where('status', '==', 'approved')
      .get();

    if (carsSnapshot.empty) {
      // Return empty CSV with headers if no cars
      const headers = [
        'id',
        'title',
        'description',
        'availability',
        'condition',
        'price',
        'link',
        'image_link',
        'additional_image_link',
        'brand'
      ].join(',');
      
      // UTF-8 BOM for Excel compatibility with Cyrillic/Mongolian characters
      const BOM = '\uFEFF';
      const csvContent = BOM + headers + '\n';
      
      res.set('Content-Type', 'text/csv; charset=utf-8');
      res.set('Content-Disposition', 'attachment; filename="facebook_catalog.csv"');
      res.status(200).send(csvContent);
      return;
    }

    // Base URL for car detail pages
    // Update this to match your actual domain
    const baseUrl = process.env.BASE_URL || 'https://carsmongolia.mn';
    
    // Convert cars to Facebook Catalog format
    const csvRows = [];
    
    // CSV Headers (Facebook required fields)
    const headers = [
      'id',
      'title',
      'description',
      'availability',
      'condition',
      'price',
      'link',
      'image_link',
      'additional_image_link',
      'brand'
    ];
    csvRows.push(headers.join(','));

    // Process each car
    carsSnapshot.forEach((doc) => {
      const car = { id: doc.id, ...doc.data() };
      
      // Build title: year + brand + model
      const title = [
        car.year || '',
        car.make || '',
        car.model || ''
      ].filter(Boolean).join(' ').trim() || car.title || 'Car';

      // Build description
      const descriptionParts = [];
      if (car.description) descriptionParts.push(car.description);
      if (car.mileage) descriptionParts.push(`Гүйлт: ${car.mileage.toLocaleString('mn-MN')} км`);
      if (car.fuel_type) {
        const fuelType = car.fuel_type === 'gasoline' ? 'Бензин' : 
                        car.fuel_type === 'diesel' ? 'Дизель' : car.fuel_type;
        descriptionParts.push(`Түлш: ${fuelType}`);
      }
      if (car.transmission) {
        const transmission = car.transmission === 'automatic' ? 'Автомат' : 
                           car.transmission === 'manual' ? 'Механик' : car.transmission;
        descriptionParts.push(`Хурдны хайрцаг: ${transmission}`);
      }
      if (car.body_type) descriptionParts.push(`Бие: ${car.body_type}`);
      if (car.exterior_color) descriptionParts.push(`Өнгө: ${car.exterior_color}`);
      
      const description = descriptionParts.join(' | ') || 'Машины зар';

      // Price in MNT (Facebook requires number only, no currency symbol)
      const price = car.price ? Math.round(car.price).toString() : '0';

      // Car detail link
      const link = `${baseUrl}/CarDetails?id=${car.id}`;

      // Main image (first image)
      const imageLink = car.images && car.images.length > 0 ? car.images[0] : '';

      // Additional images (comma-separated, max 20 for Facebook)
      const additionalImages = car.images && car.images.length > 1 
        ? car.images.slice(1, 21).join(',') 
        : '';

      // Brand
      const brand = car.make || '';

      // Build CSV row
      // Escape commas and quotes in CSV values
      const escapeCsv = (value) => {
        if (value === null || value === undefined) return '';
        const str = String(value);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      const row = [
        escapeCsv(car.id),
        escapeCsv(title),
        escapeCsv(description),
        escapeCsv('in stock'), // Always in stock for used cars
        escapeCsv('used'), // Condition
        escapeCsv(price),
        escapeCsv(link),
        escapeCsv(imageLink),
        escapeCsv(additionalImages),
        escapeCsv(brand)
      ];

      csvRows.push(row.join(','));
    });

    // Send CSV response
    // UTF-8 BOM for Excel compatibility with Cyrillic/Mongolian characters
    const BOM = '\uFEFF';
    const csvContent = BOM + csvRows.join('\n');
    
    res.set('Content-Type', 'text/csv; charset=utf-8');
    res.set('Content-Disposition', 'attachment; filename="facebook_catalog.csv"');
    res.set('Cache-Control', 'public, max-age=300'); // Cache for 5 minutes
    res.status(200).send(csvContent);

  } catch (error) {
    console.error('Error generating Facebook catalog feed:', error);
    res.status(500).send('Error generating catalog feed: ' + error.message);
  }
});

