/**
 * Utility to check pending cars and businesses in Firestore
 * Run this in browser console: checkPendingData()
 */
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/config/firebase';

export const checkPendingData = async () => {
  console.log('🔍 Checking pending data in Firestore...\n');
  
  try {
    // Check pending cars
    const carsQuery = query(collection(db, 'cars'), where('status', '==', 'pending'));
    const carsSnapshot = await getDocs(carsQuery);
    const pendingCars = carsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    console.log('1. Pending Cars:', pendingCars.length);
    pendingCars.forEach(car => {
      console.log(`   - ${car.title || car.id} (ID: ${car.id}, Status: ${car.status})`);
    });
    
    // Check all cars (to see if status field exists)
    const allCarsSnapshot = await getDocs(collection(db, 'cars'));
    const allCars = allCarsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log('\n2. All Cars:', allCars.length);
    const carsWithoutStatus = allCars.filter(car => !car.status);
    if (carsWithoutStatus.length > 0) {
      console.warn(`   ⚠️ ${carsWithoutStatus.length} машин status field байхгүй:`);
      carsWithoutStatus.forEach(car => {
        console.log(`   - ${car.title || car.id} (ID: ${car.id})`);
      });
    }
    
    // Check pending businesses
    const businessesQuery = query(collection(db, 'businesses'), where('status', '==', 'pending'));
    const businessesSnapshot = await getDocs(businessesQuery);
    const pendingBusinesses = businessesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    console.log('\n3. Pending Businesses:', pendingBusinesses.length);
    pendingBusinesses.forEach(business => {
      console.log(`   - ${business.name || business.id} (ID: ${business.id}, Status: ${business.status})`);
    });
    
    // Check all businesses (to see if status field exists)
    const allBusinessesSnapshot = await getDocs(collection(db, 'businesses'));
    const allBusinesses = allBusinessesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log('\n4. All Businesses:', allBusinesses.length);
    const businessesWithoutStatus = allBusinesses.filter(business => !business.status);
    if (businessesWithoutStatus.length > 0) {
      console.warn(`   ⚠️ ${businessesWithoutStatus.length} бизнес status field байхгүй:`);
      businessesWithoutStatus.forEach(business => {
        console.log(`   - ${business.name || business.id} (ID: ${business.id})`);
      });
    }
    
    return {
      pendingCars,
      pendingBusinesses,
      allCars,
      allBusinesses,
      carsWithoutStatus,
      businessesWithoutStatus
    };
  } catch (error) {
    console.error('❌ Error checking pending data:', error);
    return null;
  }
};

// Make it available globally
if (typeof window !== 'undefined') {
  window.checkPendingData = checkPendingData;
}

export default checkPendingData;

