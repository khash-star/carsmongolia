import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { db } from '@/config/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Eye, Heart, Car, Briefcase, Star } from 'lucide-react';

export default function Statistics() {
  const { data: cars = [], isLoading: carsLoading } = useQuery({
    queryKey: ['allCars'],
    queryFn: async () => {
      const snapshot = await getDocs(collection(db, 'cars'));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
  });

  const { data: businesses = [], isLoading: businessesLoading } = useQuery({
    queryKey: ['allBusinesses'],
    queryFn: async () => {
      const snapshot = await getDocs(collection(db, 'businesses'));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
  });

  const stats = useMemo(() => {
    const totalCars = cars.length;
    const approvedCars = cars.filter(c => c.status === 'approved').length;
    const pendingCars = cars.filter(c => c.status === 'pending').length;
    const vipCars = cars.filter(c => c.is_featured).length;
    const totalViews = cars.reduce((sum, c) => sum + (c.view_count || 0), 0);
    const totalBusinesses = businesses.length;

    // Most viewed cars
    const topCars = [...cars]
      .filter(c => c.status === 'approved')
      .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
      .slice(0, 10);

    // Cars by make
    const makeStats = cars.reduce((acc, car) => {
      if (car.status === 'approved' && car.make) {
        acc[car.make] = (acc[car.make] || 0) + 1;
      }
      return acc;
    }, {});
    const topMakes = Object.entries(makeStats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([name, value]) => ({ name, value }));

    // Price ranges
    const priceRanges = [
      { name: '0-20M', min: 0, max: 20000000, count: 0 },
      { name: '20-40M', min: 20000000, max: 40000000, count: 0 },
      { name: '40-60M', min: 40000000, max: 60000000, count: 0 },
      { name: '60-80M', min: 60000000, max: 80000000, count: 0 },
      { name: '80M+', min: 80000000, max: Infinity, count: 0 }
    ];
    cars.filter(c => c.status === 'approved').forEach(car => {
      const range = priceRanges.find(r => car.price >= r.min && car.price < r.max);
      if (range) range.count++;
    });

    // Status distribution
    const statusData = [
      { name: 'Батлагдсан', value: approvedCars, color: '#10b981' },
      { name: 'Хүлээгдэж буй', value: pendingCars, color: '#f59e0b' },
      { name: 'Цуцлагдсан', value: cars.filter(c => c.status === 'rejected').length, color: '#ef4444' }
    ].filter(s => s.value > 0);

    return {
      totalCars,
      approvedCars,
      pendingCars,
      vipCars,
      totalViews,
      totalBusinesses,
      topCars,
      topMakes,
      priceRanges: priceRanges.filter(r => r.count > 0),
      statusData
    };
  }, [cars, businesses]);

  if (carsLoading || businessesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-blue-600" />
            Статистик
          </h1>
          <p className="text-gray-500 mt-2">Аппын ерөнхий мэдээлэл</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Car className="w-8 h-8 opacity-80" />
              </div>
              <p className="text-3xl font-bold">{stats.totalCars}</p>
              <p className="text-blue-100 text-sm">Нийт машин</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Eye className="w-8 h-8 opacity-80" />
              </div>
              <p className="text-3xl font-bold">{stats.totalViews.toLocaleString()}</p>
              <p className="text-green-100 text-sm">Нийт үзэлт</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-500 to-amber-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Star className="w-8 h-8 opacity-80" />
              </div>
              <p className="text-3xl font-bold">{stats.vipCars}</p>
              <p className="text-amber-100 text-sm">VIP зарууд</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Briefcase className="w-8 h-8 opacity-80" />
              </div>
              <p className="text-3xl font-bold">{stats.totalBusinesses}</p>
              <p className="text-purple-100 text-sm">Бизнесүүд</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Viewed Cars */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Хамгийн их үзэлттэй
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.topCars.slice(0, 5).map((car, idx) => (
                  <div key={car.id} className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-sm">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{car.title}</p>
                      <p className="text-xs text-gray-500">{car.make} {car.model}</p>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Eye className="w-4 h-4" />
                      {car.view_count || 0}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Status Distribution */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Төлөвийн хуваарилалт</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={stats.statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {stats.statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Makes */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Үйлдвэрлэгчээр</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.topMakes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Price Ranges */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Үнийн хүрээ</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.priceRanges}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}