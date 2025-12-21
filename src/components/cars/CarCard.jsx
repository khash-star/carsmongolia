import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Gauge, Fuel, Calendar, Star, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CarCard({ car, index = 0 }) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('mn-MN').format(price) + '₮';
  };

  const formatMileage = (mileage) => {
    return new Intl.NumberFormat('mn-MN').format(mileage) + ' км';
  };

  const fuelTypeLabels = {
    gasoline: 'Бензин',
    diesel: 'Дизель',
    hybrid: 'Хайбрид',
    electric: 'Цахилгаан',
    lpg: 'Хий'
  };

  const locationLabels = {
    ulaanbaatar: 'Улаанбаатар',
    darkhan: 'Дархан',
    erdenet: 'Эрдэнэт',
    choibalsan: 'Чойбалсан',
    murun: 'Мөрөн',
    other: 'Бусад'
  };

  const defaultImage = "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="w-full"
    >
      <Link 
        to={createPageUrl(`CarDetails?id=${car.id}`)}
        className="block w-full"
      >
        <Card className="group border-0 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden bg-white cursor-pointer w-full">
          <div className="relative aspect-[16/10] overflow-hidden">
            <img
              src={car.images?.[0] || defaultImage}
              alt={car.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 pointer-events-none"
              loading="lazy"
              decoding="async"
            />
            
            {car.is_featured && (
              <Badge className="absolute top-3 left-3 bg-amber-500 text-white pointer-events-none">
                <Star className="w-3 h-3 mr-1 fill-current" />
                VIP
              </Badge>
            )}
            
            {car.status === 'sold' && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center pointer-events-none">
                <Badge className="bg-red-500 text-white text-lg px-4 py-1">ЗАРАГДСАН</Badge>
              </div>
            )}

            {car.status === 'pending' && (
              <Badge className="absolute top-3 right-3 bg-yellow-500 text-white pointer-events-none">
                Хүлээгдэж буй
              </Badge>
            )}

            <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/50 text-white text-xs px-2 py-1 rounded-full pointer-events-none">
              <Eye className="w-3 h-3" />
              {car.view_count || 0}
            </div>
          </div>
          
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-sm text-gray-500">{car.year} • {car.make}</p>
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                  {car.model}
                </h3>
              </div>
            </div>
            
            <p className="text-xl font-bold text-blue-600 mb-3">{formatPrice(car.price)}</p>
            
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-500">
              {car.mileage && (
                <div className="flex items-center gap-1">
                  <Gauge className="w-4 h-4" />
                  <span>{formatMileage(car.mileage)}</span>
                </div>
              )}
              {car.fuel_type && (
                <div className="flex items-center gap-1">
                  <Fuel className="w-4 h-4" />
                  <span>{fuelTypeLabels[car.fuel_type]}</span>
                </div>
              )}
              {car.year && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{car.year} он</span>
                </div>
              )}
              {car.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{locationLabels[car.location]}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}