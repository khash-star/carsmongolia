import React, { useState, useEffect } from 'react';
import { list as listBusinesses } from '@/services/businesses';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Wrench, CircleDot, Settings, Headphones, Search, Plus, Phone, MapPin, Eye, Car, ShoppingCart, MessageCircle, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const SERVICE_TYPES = {
  parts: { label: 'Авто сэлбэг', icon: Wrench, color: 'bg-orange-500', categories: ['Хөдөлгүүр', 'Явах эд анги', 'Тоормос', 'Цахилгаан', 'Дотор эд анги', 'Гадна эд анги', 'Бусад'] },
  rental: { label: 'Машин түрээс', icon: Car, color: 'bg-yellow-500', categories: ['Жолоочтой', 'Жолоочгүй', 'Өдөр', 'Цаг', 'Долоо хоног', 'Сар', 'Бусад'] },
  tires: { label: 'Дугуй худалдаа', icon: CircleDot, color: 'bg-green-500', categories: ['Зуны дугуй', 'Өвлийн дугуй', '4 улирлын дугуй', 'Обуд', 'Дугуйн засвар', 'Бусад'] },
  repair: { label: 'Авто засвар', icon: Settings, color: 'bg-red-500', categories: ['Хөдөлгүүрийн засвар', 'Хурдны хайрцаг', 'Тоормосны засвар', 'Цахилгааны засвар', 'Бүхээгийн засвар', 'Будаг', 'Бусад'] },
  service: { label: 'Бусад', icon: Headphones, color: 'bg-purple-500', categories: ['Угаалга', 'Тос солих', 'Оношилгоо', 'Гүйцэтгэл тохируулах', 'Даатгал', 'Зээл', 'Бусад'] }
};

export default function Services() {
  const urlParams = new URLSearchParams(window.location.search);
  const typeFromUrl = urlParams.get('type') || 'parts';
  
  const [activeType, setActiveType] = useState(typeFromUrl);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const queryClient = useQueryClient();
  
  // Sync with URL changes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const type = params.get('type') || 'parts';
    if (type !== activeType) {
      setActiveType(type);
      setCategory('all');
    }
  }, [window.location.search]);

  const { data: businesses = [], isLoading } = useQuery({
    queryKey: ['businesses', activeType],
    queryFn: () => listBusinesses({ type: activeType, status: 'approved' })
  });

  const [tireSize, setTireSize] = useState({ width: '', profile: '', rim: '' });

  const filteredBusinesses = businesses.filter(b => {
    if (search && !b.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (category && category !== 'all' && b.category !== category) return false;
    // Tire size filter
    if (activeType === 'tires') {
      if (tireSize.width && b.tire_width && b.tire_width !== Number(tireSize.width)) return false;
      if (tireSize.profile && b.tire_profile && b.tire_profile !== Number(tireSize.profile)) return false;
      if (tireSize.rim && b.tire_rim && b.tire_rim !== Number(tireSize.rim)) return false;
    }
    return true;
  });

  const TypeIcon = SERVICE_TYPES[activeType]?.icon || Wrench;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className={`${SERVICE_TYPES[activeType]?.color} py-12`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <TypeIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">{SERVICE_TYPES[activeType]?.label}</h1>
                <p className="text-white/80">{filteredBusinesses.length} олдлоо</p>
              </div>
              </div>
              <div className="flex gap-3 items-end">
                <div className="flex flex-col gap-1 items-end">
                  <h3 className="text-white font-bold text-lg tracking-wide">СЭЛБЭГ ЗАХИАЛГА</h3>
                  <a href="https://shuurkhai.com" target="_blank" rel="noopener noreferrer" className="no-underline">
                    <Button 
                      className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-700 text-white font-bold px-6 py-4 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] border-0 h-auto hover:brightness-110"
                      style={{ borderRadius: '12px', minWidth: '180px' }}
                    >
                      <div className="flex flex-col items-start gap-1.5 w-full">
                        <div className="flex items-center gap-2">
                          <ShoppingCart className="w-4 h-4 flex-shrink-0" />
                          <span className="text-sm font-bold tracking-wide">товшино уу</span>
                          <div className="relative w-7 h-7 flex-shrink-0 opacity-80">
                            <div className="absolute inset-0 bg-gradient-to-br from-red-500 via-red-600 to-red-700 rounded-full shadow-lg border-2 border-gray-300 flex items-center justify-center">
                              <Play className="w-3.5 h-3.5 text-white fill-white ml-0.5" />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent rounded-full pointer-events-none" style={{ clipPath: 'inset(0 0 50% 0)' }} />
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs opacity-95 font-medium">
                          <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>72026471</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs opacity-95 font-medium">
                          <MessageCircle className="w-3.5 h-3.5 text-purple-100 flex-shrink-0" />
                          <span className="text-purple-100">Viber: 99086471</span>
                        </div>
                      </div>
                    </Button>
                  </a>
                </div>
                <Link to={createPageUrl('AddBusiness')} className="no-underline">
                  <Button className="bg-white text-gray-900 hover:bg-gray-100 font-bold px-8 py-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] border border-gray-200 h-auto"
                    style={{ borderRadius: '12px', minWidth: '220px' }}
                  >
                    <div className="flex items-center gap-2">
                      <Plus className="w-5 h-5" />
                      <span className="text-base font-bold">Бизнес нэмэх</span>
                    </div>
                  </Button>
                </Link>
              </div>
              </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Type Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {Object.entries(SERVICE_TYPES).map(([key, { label, icon: Icon, color }]) => (
            <Button
              key={key}
              variant={activeType === key ? 'default' : 'outline'}
              onClick={() => { setActiveType(key); setCategory('all'); }}
              className={`rounded-xl ${activeType === key ? color + ' text-white' : ''}`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {label}
            </Button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Хайх..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-12 rounded-xl"
            />
            {/* Tire Size inside search for tires */}
            {activeType === 'tires' && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-gray-50 rounded-lg px-2 py-1">
                <span className="text-xs text-gray-500">Хэмжээ:</span>
                <Input
                  placeholder="205"
                  value={tireSize.width}
                  onChange={(e) => setTireSize({...tireSize, width: e.target.value})}
                  className="w-12 h-7 text-center text-sm border-0 bg-white rounded p-0"
                />
                <span className="text-gray-400 text-sm">/</span>
                <Input
                  placeholder="55"
                  value={tireSize.profile}
                  onChange={(e) => setTireSize({...tireSize, profile: e.target.value})}
                  className="w-10 h-7 text-center text-sm border-0 bg-white rounded p-0"
                />
                <span className="text-gray-400 text-sm">R</span>
                <Input
                  placeholder="16"
                  value={tireSize.rim}
                  onChange={(e) => setTireSize({...tireSize, rim: e.target.value})}
                  className="w-10 h-7 text-center text-sm border-0 bg-white rounded p-0"
                />
              </div>
            )}
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-48 h-12 rounded-xl">
              <SelectValue placeholder="Ангилал" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Бүгд</SelectItem>
              {SERVICE_TYPES[activeType]?.categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Business Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-2xl" />
            ))}
          </div>
        ) : filteredBusinesses.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBusinesses.map((business, index) => (
              <motion.div
                key={business.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link to={createPageUrl(`BusinessDetails?id=${business.id}`)}>
                  <Card className="border-0 shadow-sm hover:shadow-lg transition-all overflow-hidden group">
                    <div className="aspect-video bg-gray-100 relative overflow-hidden">
                      {business.images?.[0] ? (
                        <img src={business.images[0]} alt={business.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      ) : (
                        <div className={`w-full h-full ${SERVICE_TYPES[activeType]?.color} flex items-center justify-center`}>
                          <TypeIcon className="w-16 h-16 text-white/50" />
                        </div>
                      )}
                      <Badge className="absolute top-3 left-3 bg-white text-gray-800">{business.category}</Badge>
                      <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                        <Eye className="w-3 h-3" />
                        {business.view_count || 0}
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-2">{business.name}</h3>
                      <p className="text-gray-500 text-sm line-clamp-2 mb-3">{business.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {business.phone}
                        </span>
                        {business.address && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {business.address.slice(0, 15)}...
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className={`w-20 h-20 ${SERVICE_TYPES[activeType]?.color} rounded-full flex items-center justify-center mx-auto mb-6`}>
              <TypeIcon className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Олдсонгүй</h3>
            <p className="text-gray-500 mb-6">Энэ ангилалд одоогоор бүртгэгдээгүй байна</p>
            <Link to={createPageUrl('AddBusiness')}>
              <Button className={SERVICE_TYPES[activeType]?.color}>
                <Plus className="w-4 h-4 mr-2" />
                Бизнес нэмэх
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}