import React from 'react';
import { getCurrentUser } from '@/services/auth';
import { list as listFavorites } from '@/services/favorites';
import { list as listCars } from '@/services/cars';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from "@/components/ui/skeleton";
import { Heart } from 'lucide-react';
import CarCard from '@/components/cars/CarCard.jsx';

export default function Favorites() {
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

  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ['favorites', user?.email],
    queryFn: () => listFavorites({ user_email: user.email }),
    enabled: !!user?.email
  });

  const { data: cars = [], isLoading: carsLoading } = useQuery({
    queryKey: ['favoriteCars', favorites],
    queryFn: async () => {
      const carIds = favorites.map(f => f.car_id);
      if (carIds.length === 0) return [];
      const allCars = await listCars({ status: 'approved' });
      return allCars.filter(car => carIds.includes(car.id));
    },
    enabled: favorites.length > 0
  });

  if (isLoading || carsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Heart className="w-8 h-8 text-red-500" />
            Дуртай зарууд
          </h1>
          <p className="text-gray-500 mt-2">{cars.filter(c => c).length} машин</p>
        </div>

        {cars.filter(c => c).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {cars.filter(c => c).map((car, index) => (
              <CarCard key={car.id} car={car} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Heart className="w-20 h-20 text-gray-300 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Дуртай зар байхгүй</h3>
            <p className="text-gray-500">Таалагдсан машинуудаа энд хадгална уу</p>
          </div>
        )}
      </div>
    </div>
  );
}