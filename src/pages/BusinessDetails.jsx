import React, { useState, useEffect } from 'react';
import { getById as getBusinessById, update as updateBusiness } from '@/services/businesses';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Phone, MessageCircle, MapPin, Eye, Share2, Wrench, CircleDot, Settings, Headphones, ChevronLeft, ChevronRight, Car } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const SERVICE_TYPES = {
  parts: { label: 'Авто сэлбэг', icon: Wrench, color: 'bg-orange-500' },
  rental: { label: 'Машин түрээс', icon: Car, color: 'bg-yellow-500' },
  tires: { label: 'Дугуй худалдаа', icon: CircleDot, color: 'bg-green-500' },
  repair: { label: 'Авто засвар', icon: Settings, color: 'bg-red-500' },
  service: { label: 'Бусад', icon: Headphones, color: 'bg-purple-500' }
};

export default function BusinessDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const businessId = urlParams.get('id');
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Debug: Log business ID
  useEffect(() => {
    if (businessId) {
      console.log('Business ID from URL:', businessId);
    } else {
      console.error('No business ID found in URL');
    }
  }, [businessId]);

  const { data: business, isLoading, error } = useQuery({
    queryKey: ['business', businessId],
    queryFn: async () => {
      if (!businessId) {
        console.error('Business ID is missing');
        return null;
      }
      try {
        const businessData = await getBusinessById(businessId);
        if (businessData) {
          // Update view count
          const businessRef = doc(db, 'businesses', businessId);
          await updateDoc(businessRef, { view_count: increment(1) });
          return { ...businessData, view_count: (businessData.view_count || 0) + 1 };
        }
        console.error('Business not found:', businessId);
        return null;
      } catch (err) {
        console.error('Error fetching business:', err);
        return null;
      }
    },
    enabled: !!businessId,
    retry: false
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="aspect-video rounded-2xl mb-6" />
          <Skeleton className="h-10 w-1/2 mb-4" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Wrench className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Бизнес олдсонгүй</h2>
          <Link to={createPageUrl('Services')}>
            <Button>Буцах</Button>
          </Link>
        </div>
      </div>
    );
  }

  const TypeIcon = SERVICE_TYPES[business.type]?.icon || Wrench;
  const images = business.images?.length > 0 ? business.images : [];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Link to={createPageUrl('Services?type=' + business.type)} className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Буцах
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Images */}
          <div>
            {images.length > 0 ? (
              <div className="space-y-4">
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-100">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={currentImageIndex}
                      src={images[currentImageIndex]}
                      alt={business.name}
                      className="w-full h-full object-cover"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    />
                  </AnimatePresence>
                  {images.length > 1 && (
                    <>
                      <button onClick={() => setCurrentImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1)} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center"><ChevronLeft className="w-6 h-6" /></button>
                      <button onClick={() => setCurrentImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1)} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center"><ChevronRight className="w-6 h-6" /></button>
                    </>
                  )}
                  <div className="absolute bottom-4 right-4 flex items-center gap-1 bg-black/50 text-white text-sm px-3 py-1 rounded-full">
                    <Eye className="w-4 h-4" />
                    {business.view_count || 0}
                  </div>
                </div>
                {images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto">
                    {images.map((img, idx) => (
                      <button key={idx} onClick={() => setCurrentImageIndex(idx)} className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${idx === currentImageIndex ? 'border-blue-600' : 'border-transparent'}`}>
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className={`aspect-video rounded-2xl ${SERVICE_TYPES[business.type]?.color} flex items-center justify-center`}>
                <TypeIcon className="w-24 h-24 text-white/50" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Badge className={SERVICE_TYPES[business.type]?.color + ' text-white'}>{SERVICE_TYPES[business.type]?.label}</Badge>
                <Badge variant="outline">{business.category}</Badge>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{business.name}</h1>
            </div>

            {business.description && (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">Тайлбар</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">{business.description}</p>
                </CardContent>
              </Card>
            )}

            {business.address && (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4 flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <span>{business.address}</span>
                </CardContent>
              </Card>
            )}

            {/* Машин түрээсийн мэдээлэл */}
            {business.type === 'rental' && (
              <Card className="border-0 shadow-sm bg-yellow-50 border-yellow-200">
                <CardContent className="p-4 space-y-3">
                  <h3 className="font-semibold">Түрээсийн мэдээлэл</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {business.has_driver && (
                      <div>
                        <span className="text-sm text-gray-600">Жолооч:</span>
                        <p className="font-medium">
                          {business.has_driver === 'with_driver' ? 'Жолоочтой' :
                           business.has_driver === 'without_driver' ? 'Жолоочгүй' :
                           business.has_driver === 'both' ? 'Хоёулаа' : business.has_driver}
                        </p>
                      </div>
                    )}
                    {business.rental_period && (
                      <div>
                        <span className="text-sm text-gray-600">Түрээсийн хугацаа:</span>
                        <p className="font-medium">
                          {business.rental_period === 'hour' ? 'Цаг' :
                           business.rental_period === 'day' ? 'Өдөр' :
                           business.rental_period === 'week' ? 'Долоо хоног' :
                           business.rental_period === 'month' ? 'Сар' : business.rental_period}
                        </p>
                      </div>
                    )}
                    {business.rental_price && (
                      <div className="col-span-2">
                        <span className="text-sm text-gray-600">Түрээсийн үнэ:</span>
                        <p className="font-medium text-lg text-blue-600">
                          {new Intl.NumberFormat('mn-MN').format(business.rental_price)}₮
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 space-y-3">
                <h3 className="font-semibold">Холбоо барих</h3>
                <div className="flex flex-wrap gap-3">
                  {business.phone && (
                    <a href={`tel:${business.phone}`}>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <Phone className="w-4 h-4 mr-2" />
                        {business.phone}
                      </Button>
                    </a>
                  )}
                  {business.whatsapp && (
                    <a href={`https://wa.me/${business.whatsapp}`} target="_blank" rel="noopener noreferrer">
                      <Button className="bg-green-600 hover:bg-green-700">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        WhatsApp
                      </Button>
                    </a>
                  )}
                  <Button variant="outline" onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Холбоос хуулагдлаа'); }}>
                    <Share2 className="w-4 h-4 mr-2" />
                    Хуваалцах
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}