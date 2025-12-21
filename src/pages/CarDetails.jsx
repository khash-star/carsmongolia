import React, { useState, useEffect } from 'react';
import { getCurrentUser } from '@/services/auth';
import { getById as getCarById, update as updateCar } from '@/services/cars';
import { list as listFavorites, create as createFavorite, remove as removeFavorite } from '@/services/favorites';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { doc, updateDoc, increment, collection, query, where, getDocs, limit as firestoreLimit } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import ExciseTaxCalculator from '@/components/cars/ExciseTaxCalculator.jsx';
import CarCard from '@/components/cars/CarCard.jsx';
import {
  ArrowLeft,
  Share2,
  Phone,
  MessageCircle,
  MapPin,
  Gauge,
  Fuel,
  Car,
  Palette,
  Settings,
  Globe,
  Eye,
  Star,
  ChevronLeft,
  ChevronRight,
  Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function CarDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const carId = urlParams.get('id');
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [viewCountUpdated, setViewCountUpdated] = useState(false);
  const queryClient = useQueryClient();

  const { data: car, isLoading } = useQuery({
    queryKey: ['car', carId],
    queryFn: () => getCarById(carId),
    enabled: !!carId
  });

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
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ['favorites', user?.email],
    queryFn: () => listFavorites({ user_email: user.email }),
    enabled: !!user?.email
  });

  const isFavorite = favorites.some(fav => fav.car_id === carId);

  // Ижил загварын заруудыг авах
  const { data: similarCars = [], isLoading: isLoadingSimilar } = useQuery({
    queryKey: ['similarCars', car?.make, car?.model, carId],
    queryFn: async () => {
      if (!car?.make || !car?.model) return [];
      
      try {
        // Эхлээд make болон status-оор шүүх (composite index шаардлагатай байж магадгүй)
        const q = query(
          collection(db, 'cars'),
          where('make', '==', car.make),
          where('status', '==', 'approved'),
          firestoreLimit(20)
        );
        const snapshot = await getDocs(q);
        let results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Одоогийн машиныг хасна
        results = results.filter(c => c.id !== carId);
        
        // Ижил model-тэй машинуудыг эхлээд харуулах
        const sameModel = results.filter(c => c.model === car.model);
        const sameMake = results.filter(c => c.model !== car.model);
        
        // Ижил model-тэй машинуудыг эхлээд, дараа нь ижил make-тэй машинуудыг харуулах
        return [...sameModel, ...sameMake].slice(0, 4);
      } catch (error) {
        console.error('Error fetching similar cars:', error);
        // Хэрэв query алдаа гарвал, бүх машинуудыг аваад filter хийх
        try {
          const allCarsQuery = query(
            collection(db, 'cars'),
            where('status', '==', 'approved'),
            firestoreLimit(50)
          );
          const allSnapshot = await getDocs(allCarsQuery);
          let allResults = allSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          
          // Одоогийн машиныг хасна
          allResults = allResults.filter(c => c.id !== carId);
          
          // Ижил make болон model-тэй машинуудыг эхлээд харуулах
          const sameModel = allResults.filter(c => c.make === car.make && c.model === car.model);
          const sameMake = allResults.filter(c => c.make === car.make && c.model !== car.model);
          
          return [...sameModel, ...sameMake].slice(0, 4);
        } catch (fallbackError) {
          console.error('Fallback query also failed:', fallbackError);
          return [];
        }
      }
    },
    enabled: !!car?.make && !!car?.model && !!carId
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (isFavorite) {
        const fav = favorites.find(f => f.car_id === carId);
        await removeFavorite(fav.id);
      } else {
        await createFavorite({ car_id: carId, user_email: user.email });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['favorites']);
      toast.success(isFavorite ? 'Дуртайгаас хасагдлаа' : 'Дуртайд нэмэгдлээ');
    }
  });

  // Хуудас руу ороход дээд хэсэгт scroll хийх
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [carId]);

  useEffect(() => {
    if (car && !viewCountUpdated) {
      const updateViewCount = async () => {
        try {
          const carRef = doc(db, 'cars', carId);
          await updateDoc(carRef, { view_count: increment(1) });
          setViewCountUpdated(true);
        } catch (error) {
          console.error('View count update failed');
        }
      };
      updateViewCount();
    }
  }, [car, carId, viewCountUpdated]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('mn-MN').format(price) + '₮';
  };

  const formatMileage = (mileage) => {
    return new Intl.NumberFormat('mn-MN').format(mileage) + ' км';
  };



  const labels = {
    fuel: { gasoline: 'Бензин', diesel: 'Дизель', hybrid: 'Хайбрид', electric: 'Цахилгаан', lpg: 'Хий' },
    transmission: { automatic: 'Автомат', manual: 'Механик' },
    body: { sedan: 'Седан', suv: 'SUV', hatchback: 'Хэтчбэк', coupe: 'Купе', wagon: 'Вагон', van: 'Микро', truck: 'Ачааны', crossover: 'Кроссовер' },
    drive: { fwd: 'Урд', rwd: 'Хойд', awd: 'Бүх дугуй', '4wd': '4WD' },
    origin: { korea: 'Солонгос', japan: 'Япон', usa: 'Америк', germany: 'Герман', china: 'Хятад', other: 'Бусад' },
    location: { ulaanbaatar: 'Улаанбаатар', darkhan: 'Дархан', erdenet: 'Эрдэнэт', choibalsan: 'Чойбалсан', murun: 'Мөрөн', other: 'Бусад' }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="aspect-[4/3] rounded-2xl" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Машин олдсонгүй</h2>
          <Link to={createPageUrl('Home')}>
            <Button>Нүүр хуудас руу буцах</Button>
          </Link>
        </div>
      </div>
    );
  }

  const images = car.images?.length > 0 ? car.images : ["https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80"];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link to={createPageUrl('Home')} className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Буцах
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentImageIndex}
                  src={images[currentImageIndex]}
                  alt={car.title}
                  className="w-full h-full object-cover"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </AnimatePresence>
              
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center hover:bg-white"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center hover:bg-white"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {car.is_featured && (
                <Badge className="absolute top-4 left-4 bg-amber-500 text-white">
                  <Star className="w-3 h-3 mr-1 fill-current" />
                  VIP
                </Badge>
              )}

              <div className="absolute bottom-4 right-4 flex items-center gap-1 bg-black/50 text-white text-sm px-3 py-1 rounded-full">
                <Eye className="w-4 h-4" />
                {car.view_count || 0} үзсэн
              </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      idx === currentImageIndex ? 'border-blue-600' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Car Info */}
          <div className="space-y-6">
            <div>
              <p className="text-gray-500 mb-1">{car.year} • {car.make}</p>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{car.model}</h1>
              <p className="text-3xl font-bold text-blue-600">{formatPrice(car.price)}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => user ? toggleFavoriteMutation.mutate() : toast.error('Нэвтэрнэ үү')}
                className={`flex-1 h-12 ${isFavorite ? 'bg-red-50 border-red-200' : ''}`}
              >
                <Heart className={`w-5 h-5 mr-2 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                {isFavorite ? 'Дуртай' : 'Дуртайд нэмэх'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: car.title, url: window.location.href });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success('Холбоос хуулагдлаа');
                  }
                }}
                className="flex-1 h-12"
              >
                <Share2 className="w-5 h-5 mr-2" />
                Хуваалцах
              </Button>
            </div>

            {/* Specs Grid */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  {car.mileage && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                        <Gauge className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Гүйлт</p>
                        <p className="font-medium">{formatMileage(car.mileage)}</p>
                      </div>
                    </div>
                  )}
                  {car.fuel_type && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                        <Fuel className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Түлш</p>
                        <p className="font-medium">{labels.fuel[car.fuel_type]}</p>
                      </div>
                    </div>
                  )}
                  {car.transmission && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                        <Settings className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Хурдны хайрцаг</p>
                        <p className="font-medium">{labels.transmission[car.transmission]}</p>
                      </div>
                    </div>
                  )}
                  {car.body_type && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                        <Car className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Төрөл</p>
                        <p className="font-medium">{labels.body[car.body_type]}</p>
                      </div>
                    </div>
                  )}
                  {car.engine_capacity && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                        <Settings className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Хөдөлгүүр</p>
                        <p className="font-medium">{car.engine_capacity} cc</p>
                      </div>
                    </div>
                  )}
                  {car.origin_country && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                        <Globe className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Орж ирсэн</p>
                        <p className="font-medium">{labels.origin[car.origin_country]}</p>
                      </div>
                    </div>
                  )}
                  {car.exterior_color && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-pink-50 rounded-lg flex items-center justify-center">
                        <Palette className="w-5 h-5 text-pink-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Гадна өнгө</p>
                        <p className="font-medium">{car.exterior_color}</p>
                      </div>
                    </div>
                  )}
                  {car.location && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-teal-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Байршил</p>
                        <p className="font-medium">{labels.location[car.location]}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            {car.description && (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Тайлбар</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">{car.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Contact */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Холбоо барих</h3>
                <div className="flex flex-wrap gap-3">
                  {car.contact_phone && (
                    <a href={`tel:${car.contact_phone}`}>
                      <Button className="h-12 bg-blue-600 hover:bg-blue-700">
                        <Phone className="w-5 h-5 mr-2" />
                        {car.contact_phone}
                      </Button>
                    </a>
                  )}
                  {car.contact_whatsapp && (
                    <a href={`https://wa.me/${car.contact_whatsapp}`} target="_blank" rel="noopener noreferrer">
                      <Button className="h-12 bg-green-600 hover:bg-green-700">
                        <MessageCircle className="w-5 h-5 mr-2" />
                        WhatsApp
                      </Button>
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>

            {!car.has_license_plate && <ExciseTaxCalculator car={car} />}
          </div>
        </div>

        {/* Ижил загварын зарууд */}
        {similarCars.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Ижил загварын зарууд</h2>
            {isLoadingSimilar ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="aspect-[16/10] rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {similarCars.map((similarCar, index) => (
                  <CarCard key={similarCar.id} car={similarCar} index={index} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}