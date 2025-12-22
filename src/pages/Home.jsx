import React, { useState } from 'react';
import { getCurrentUser } from '@/services/auth';
import { list as listCars } from '@/services/cars';
import { useQuery } from '@tanstack/react-query';
import HeroSection from '@/components/cars/HeroSection.jsx';
import SearchFilters from '@/components/cars/SearchFilters.jsx';
import CarCard from '@/components/cars/CarCard.jsx';
import CompareDrawer from '@/components/cars/CompareDrawer.jsx';
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Car, TrendingUp, Scale } from 'lucide-react';

export default function Home() {
  const [filters, setFilters] = useState({
    search: '',
    make: '',
    minPrice: '',
    maxPrice: '',
    minYear: '',
    maxYear: '',
    bodyType: '',
    fuelType: '',
    hasLicensePlate: ''
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [sortBy, setSortBy] = useState('-created_date');
  const [compareCars, setCompareCars] = useState([]);

  const toggleCompare = (car) => {
    setCompareCars(prev => {
      const exists = prev.find(c => c.id === car.id);
      if (exists) {
        return prev.filter(c => c.id !== car.id);
      }
      if (prev.length >= 4) {
        return prev;
      }
      return [...prev, car];
    });
  };

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          return JSON.parse(storedUser);
        } catch {
          return await getCurrentUser();
        }
      }
      return await getCurrentUser();
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const { data: cars = [], isLoading } = useQuery({
    queryKey: ['cars', user?.role],
    queryFn: async () => {
      if (user?.role === 'ADMIN') {
        // Admin хэрэглэгчид бүх машин харуулах (сүүлд нэмэгдсэн эхэнд)
        return await listCars({ orderBy: '-created_at' });
      } else {
        // Энгийн хэрэглэгчид зөвхөн баталгаажсан машин харуулах (сүүлд нэмэгдсэн эхэнд)
        return await listCars({ status: 'approved', orderBy: '-created_at' });
      }
    },
    enabled: user !== undefined
  });

  // VIP зарууд (Урсдаг зар) - БҮХ VIP зарууд, ямар ч фильтерт хамаарахгүй
  // is_featured === true эсвэл is_featured === 'true' эсвэл is_featured === 1
  const featuredCars = cars.filter(car => {
    // is_featured талбарыг бүх боломжит форматаар шалгах
    const isFeatured = 
      car.is_featured === true || 
      car.is_featured === 'true' || 
      car.is_featured === 1 ||
      car.is_featured === '1' ||
      String(car.is_featured).toLowerCase() === 'true';
    
    // VIP зарууд зөвхөн баталгаажсан байх ёстой (admin-д бүх зарууд харагдана)
    if (user?.role === 'ADMIN') {
      return isFeatured;
    } else {
      return isFeatured && car.status === 'approved';
    }
  });

  // Debug: VIP заруудыг console дээр харах
  if (process.env.NODE_ENV === 'development') {
    console.log('VIP зарууд шалгах:', {
      totalCars: cars.length,
      featuredCars: featuredCars.length,
      userRole: user?.role,
      featuredCarsDetails: featuredCars.map(c => ({ 
        id: c.id, 
        title: c.title, 
        is_featured: c.is_featured,
        is_featured_type: typeof c.is_featured,
        status: c.status 
      })),
      allCarsWithFeatured: cars.filter(c => c.is_featured).map(c => ({
        id: c.id,
        title: c.title,
        is_featured: c.is_featured,
        is_featured_type: typeof c.is_featured,
        status: c.status
      }))
    });
  }

  // Filter cars (VIP биш зарууд)
  const filteredCars = cars.filter(car => {
    // VIP заруудыг энд оруулахгүй (тэд featuredCars дээр байна)
    const isFeatured = car.is_featured === true || car.is_featured === 'true' || car.is_featured === 1;
    if (isFeatured) return false;
    
    if (filters.search) {
      const search = filters.search.toLowerCase();
      const matchesSearch = 
        car.title?.toLowerCase().includes(search) ||
        car.make?.toLowerCase().includes(search) ||
        car.model?.toLowerCase().includes(search);
      if (!matchesSearch) return false;
    }
    if (filters.make && filters.make !== 'all' && car.make !== filters.make) return false;
          if (filters.bodyType && filters.bodyType !== 'all' && car.body_type !== filters.bodyType) return false;
          if (filters.fuelType && filters.fuelType !== 'all' && car.fuel_type !== filters.fuelType) return false;
          if (filters.hasLicensePlate && filters.hasLicensePlate !== 'all') {
            const hasPlate = filters.hasLicensePlate === 'true';
            if (car.has_license_plate !== hasPlate) return false;
          }
    if (filters.minPrice && car.price < Number(filters.minPrice)) return false;
    if (filters.maxPrice && car.price > Number(filters.maxPrice)) return false;
    if (filters.minYear && car.year < Number(filters.minYear)) return false;
    if (filters.maxYear && car.year > Number(filters.maxYear)) return false;
    return true;
  });
  
  // Бусад зарууд (VIP биш) - filteredCars дээр байгаа зарууд
  const regularCars = filteredCars;

  // Sort cars
  const sortCars = (cars) => {
    return [...cars].sort((a, b) => {
      switch (sortBy) {
        case '-created_date':
          // Сүүлд нэмэгдсэн зарууд эхэнд (created_at эсвэл created_date ашиглах)
          const aDate = a.created_at || a.created_date || '';
          const bDate = b.created_at || b.created_date || '';
          if (!aDate && !bDate) return 0;
          if (!aDate) return 1; // aDate байхгүй бол сүүлд
          if (!bDate) return -1; // bDate байхгүй бол сүүлд
          return new Date(bDate) - new Date(aDate); // Шинэ нь эхэнд
        case 'price_asc':
          return a.price - b.price;
        case 'price_desc':
          return b.price - a.price;
        case 'mileage_asc':
          return (a.mileage || 0) - (b.mileage || 0);
        case 'year_desc':
          return b.year - a.year;
        default:
          // Default: сүүлд нэмэгдсэн зарууд эхэнд
          const defaultADate = a.created_at || a.created_date || '';
          const defaultBDate = b.created_at || b.created_date || '';
          if (!defaultADate && !defaultBDate) return 0;
          if (!defaultADate) return 1;
          if (!defaultBDate) return -1;
          return new Date(defaultBDate) - new Date(defaultADate);
      }
    });
  };

  const sortedFeaturedCars = sortCars(featuredCars);
  const sortedRegularCars = sortCars(regularCars);
  const sortedCars = [...sortedFeaturedCars, ...sortedRegularCars]; // VIP зарууд эхэнд

  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection />
      
      <div id="listings" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <SearchFilters
          filters={filters}
          setFilters={setFilters}
          showAdvanced={showAdvanced}
          setShowAdvanced={setShowAdvanced}
        />

        {/* Урсдаг зар (VIP зарууд) */}
        {!isLoading && sortedFeaturedCars.length > 0 && (
          <div className="mt-8 mb-12">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">
                Урсдаг зар
              </h2>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                {sortedFeaturedCars.length}
              </span>
            </div>
            {/* Debug info - remove in production */}
            {process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-gray-500 mb-2 space-y-1">
                <div>VIP зарууд (ID): {sortedFeaturedCars.map(c => c.id).join(', ') || 'Байхгүй'}</div>
                <div>VIP зарууд (Нийт): {featuredCars.length}, Эрэмбэлсэн: {sortedFeaturedCars.length}</div>
                <div>Бүх зарууд: {cars.length}, VIP биш: {regularCars.length}</div>
              </div>
            )}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedFeaturedCars.map((car, index) => (
                <div key={car.id} className="relative">
                  <CarCard car={car} index={index} />
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2 bg-white/90 backdrop-blur z-10"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleCompare(car);
                    }}
                  >
                    <Scale className={`w-4 h-4 ${compareCars.find(c => c.id === car.id) ? 'text-blue-600' : ''}`} />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results Header */}
        <div className="flex items-center justify-between mt-8 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Бүх зарууд
            </h2>
            <p className="text-gray-500">{sortedRegularCars.length} машин олдлоо</p>
          </div>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48 rounded-xl">
              <TrendingUp className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Эрэмбэлэх" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="-created_date">Шинэ нь эхэнд</SelectItem>
              <SelectItem value="price_asc">Үнэ: Бага → Их</SelectItem>
              <SelectItem value="price_desc">Үнэ: Их → Бага</SelectItem>
              <SelectItem value="mileage_asc">Гүйлт: Бага → Их</SelectItem>
              <SelectItem value="year_desc">Он: Шинэ → Хуучин</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Car Grid - Бүх зарууд (VIP биш) */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden">
                <Skeleton className="aspect-[16/10] w-full" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-6 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : sortedRegularCars.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedRegularCars.map((car, index) => (
              <div key={car.id} className="relative">
                <CarCard car={car} index={index} />
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute top-2 right-2 bg-white/90 backdrop-blur z-10"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleCompare(car);
                  }}
                >
                  <Scale className={`w-4 h-4 ${compareCars.find(c => c.id === car.id) ? 'text-blue-600' : ''}`} />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Car className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Машин олдсонгүй</h3>
            <p className="text-gray-500">Шүүлтүүрээ өөрчилж дахин хайна уу</p>
          </div>
        )}
      </div>
    </div>
  );
}