import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { db } from '@/config/firebase';
import { collection, getDocs, query, where, documentId } from 'firebase/firestore';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Scale, Car, Check, X } from 'lucide-react';

export default function Compare() {
  const urlParams = new URLSearchParams(window.location.search);
  const carIds = urlParams.get('ids')?.split(',') || [];

  const { data: cars = [], isLoading } = useQuery({
    queryKey: ['compareCars', carIds],
    queryFn: async () => {
      if (carIds.length === 0) return [];
      const q = query(collection(db, 'cars'), where(documentId(), 'in', carIds));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    enabled: carIds.length > 0
  });

  const specs = [
    { label: 'Үнэ', key: 'price', format: (v) => `${new Intl.NumberFormat('mn-MN').format(v)}₮` },
    { label: 'Он', key: 'year' },
    { label: 'Гүйлт', key: 'mileage', format: (v) => `${new Intl.NumberFormat('mn-MN').format(v)}км` },
    { label: 'Үйлдвэрлэгч', key: 'make' },
    { label: 'Загвар', key: 'model' },
    { label: 'Түлш', key: 'fuel_type' },
    { label: 'Хурдны хайрцаг', key: 'transmission' },
    { label: 'Төрөл', key: 'body_type' },
    { label: 'Хөдөлгүүр', key: 'engine_capacity', format: (v) => `${v}cc` },
    { label: 'Хөтлөгч', key: 'drive_type' },
    { label: 'Орж ирсэн улс', key: 'origin_country' },
    { label: 'Гадна өнгө', key: 'exterior_color' },
    { label: 'Дотор өнгө', key: 'interior_color' },
    { label: 'Дугаар', key: 'has_license_plate', format: (v) => v ? 'Авсан' : 'Аваагүй', bool: true },
    { label: 'Байршил', key: 'location' }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (cars.length < 2) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full border-0 shadow-sm">
          <CardContent className="p-12 text-center">
            <Scale className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Харьцуулах машин хангалтгүй</h2>
            <p className="text-gray-500">2-оос дээш машин сонгоно уу</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Scale className="w-8 h-8" />
            Машин харьцуулах
          </h1>
          <p className="text-gray-500">{cars.length} машиныг харьцуулж байна</p>
        </div>

        {/* Car Images */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {cars.map((car) => (
            <Card key={car.id} className="border-0 shadow-sm overflow-hidden">
              <div className="aspect-[16/10] bg-gray-100">
                {car.images?.[0] ? (
                  <img src={car.images[0]} alt={car.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Car className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-sm">{car.title}</h3>
                <p className="text-2xl font-bold text-blue-600 mt-2">
                  {new Intl.NumberFormat('mn-MN').format(car.price)}₮
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Comparison Table */}
        <Card className="border-0 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4 font-semibold sticky left-0 bg-gray-50">Үзүүлэлт</th>
                  {cars.map((car) => (
                    <th key={car.id} className="text-left p-4 font-semibold min-w-[200px]">
                      {car.make} {car.model}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {specs.map((spec, index) => (
                  <tr key={spec.key} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="p-4 font-medium sticky left-0 bg-inherit">{spec.label}</td>
                    {cars.map((car) => {
                      const value = car[spec.key];
                      const displayValue = spec.format ? spec.format(value) : value;
                      
                      if (spec.bool) {
                        return (
                          <td key={car.id} className="p-4">
                            {value ? (
                              <Check className="w-5 h-5 text-green-600" />
                            ) : (
                              <X className="w-5 h-5 text-red-600" />
                            )}
                          </td>
                        );
                      }

                      if (spec.key === 'price') {
                        const minPrice = Math.min(...cars.map(c => c.price));
                        const isCheapest = value === minPrice;
                        return (
                          <td key={car.id} className="p-4">
                            <div className="flex items-center gap-2">
                              <span className={isCheapest ? 'font-bold text-green-600' : ''}>
                                {displayValue}
                              </span>
                              {isCheapest && <Badge className="bg-green-100 text-green-700">Хямд</Badge>}
                            </div>
                          </td>
                        );
                      }

                      if (spec.key === 'year') {
                        const maxYear = Math.max(...cars.map(c => c.year));
                        const isNewest = value === maxYear;
                        return (
                          <td key={car.id} className="p-4">
                            <div className="flex items-center gap-2">
                              <span className={isNewest ? 'font-bold text-blue-600' : ''}>
                                {displayValue}
                              </span>
                              {isNewest && <Badge className="bg-blue-100 text-blue-700">Шинэ</Badge>}
                            </div>
                          </td>
                        );
                      }

                      return (
                        <td key={car.id} className="p-4">
                          {displayValue || '-'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Features Comparison */}
        <Card className="border-0 shadow-sm mt-6">
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-4">Онцлог, тоноглол</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {cars.map((car) => (
                <div key={car.id}>
                  <p className="font-medium mb-2">{car.make} {car.model}</p>
                  <div className="space-y-1">
                    {car.features?.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    )) || <span className="text-gray-400 text-sm">Мэдээлэл байхгүй</span>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}