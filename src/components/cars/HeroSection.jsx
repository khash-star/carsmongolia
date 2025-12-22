import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { list as listCars } from '@/services/cars';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Search, ChevronDown, Wrench, CircleDot, Settings, Headphones, Car } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HeroSection() {
  const scrollToListings = () => {
    document.getElementById('listings')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch VIP/featured cars first, then latest approved cars for background slider
  const { data: featuredCars = [] } = useQuery({
    queryKey: ['featuredCarsHero'],
    queryFn: async () => {
      const allCars = await listCars({ status: 'approved', orderBy: '-created_date', limit: 20 });
      // Filter VIP cars (is_featured === true)
      return allCars.filter(car => car.is_featured === true || car.is_featured === 'true' || car.is_featured === 1);
    },
    refetchInterval: 10000,
    refetchOnWindowFocus: true
  });

  // Fetch latest approved cars for background slider (if not enough featured cars)
  const { data: latestCars = [] } = useQuery({
    queryKey: ['latestCarsHero'],
    queryFn: () => listCars({ status: 'approved', orderBy: '-created_date', limit: 10 }),
    refetchInterval: 10000,
    refetchOnWindowFocus: true
  });

  // Prioritize featured cars, fallback to latest cars
  const carsToShow = featuredCars.length > 0 ? featuredCars : latestCars;
  
  // Filter cars that have images
  const carsWithImages = carsToShow.filter(car => car.images && car.images.length > 0);

  return (
    <div className="relative min-h-[600px] flex items-start pt-6 overflow-hidden pt-15">
      {/* Enhanced Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40" />

      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-4">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <motion.span 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600/30 to-indigo-600/30 backdrop-blur-md border border-blue-400/30 rounded-full text-blue-200 text-sm font-semibold shadow-lg shadow-blue-500/20"
            >
              🇲🇳 Монголын #1 Автомашины Зах
            </motion.span>

            <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight tracking-tight">
              Таны хүссэн машин<br />
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                энд байна
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300/90 leading-relaxed max-w-2xl">
              Мянга мянган машинаас шууд худалдан аваарай.
            </p>

            <div className="flex flex-wrap items-center gap-2 -mt-6">
              <Link to={createPageUrl('Services?type=parts')}>
                <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    size="sm" 
                    className="h-11 px-4 bg-gradient-to-br from-orange-500 to-orange-600 shadow-md border-0 text-white hover:from-orange-600 hover:to-orange-700 hover:shadow-lg font-semibold rounded-xl text-xs transition-all"
                  >
                    <Wrench className="w-3.5 h-3.5 mr-1.5" />
                    Авто сэлбэг
                  </Button>
                </motion.div>
              </Link>
              <Link to={createPageUrl('Services?type=rental')}>
                <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    size="sm" 
                    className="h-11 px-4 bg-gradient-to-br from-yellow-500 to-yellow-600 shadow-md border-0 text-white hover:from-yellow-600 hover:to-yellow-700 hover:shadow-lg font-semibold rounded-xl text-xs transition-all"
                  >
                    <Car className="w-3.5 h-3.5 mr-1.5" />
                    Машин түрээс
                  </Button>
                </motion.div>
              </Link>
              <Link to={createPageUrl('Services?type=tires')}>
                <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    size="sm" 
                    className="h-11 px-4 bg-gradient-to-br from-green-500 to-green-600 shadow-md border-0 text-white hover:from-green-600 hover:to-green-700 hover:shadow-lg font-semibold rounded-xl text-xs transition-all"
                  >
                    <CircleDot className="w-3.5 h-3.5 mr-1.5" />
                    Дугуй худалдаа
                  </Button>
                </motion.div>
              </Link>
              <Link to={createPageUrl('Services?type=repair')}>
                <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    size="sm" 
                    className="h-11 px-4 bg-gradient-to-br from-red-500 to-red-600 shadow-md border-0 text-white hover:from-red-600 hover:to-red-700 hover:shadow-lg font-semibold rounded-xl text-xs transition-all"
                  >
                    <Settings className="w-3.5 h-3.5 mr-1.5" />
                    Авто засвар
                  </Button>
                </motion.div>
              </Link>
              <Link to={createPageUrl('Services?type=service')}>
                <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    size="sm" 
                    className="h-11 px-4 bg-gradient-to-br from-purple-500 to-purple-600 shadow-md border-0 text-white hover:from-purple-600 hover:to-purple-700 hover:shadow-lg font-semibold rounded-xl text-xs transition-all"
                  >
                    <Headphones className="w-3.5 h-3.5 mr-1.5" />
                    Бусад
                  </Button>
                </motion.div>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-wrap gap-8 md:gap-12 pt-4"
          >
            <div className="group">
              <p className="text-4xl md:text-5xl font-extrabold bg-gradient-to-br from-white to-blue-200 bg-clip-text text-transparent">5,000+</p>
              <p className="text-gray-400 text-sm md:text-base mt-1 group-hover:text-gray-300 transition-colors">Нийт зар</p>
            </div>
            <div className="group">
              <p className="text-4xl md:text-5xl font-extrabold bg-gradient-to-br from-white to-blue-200 bg-clip-text text-transparent">10,000+</p>
              <p className="text-gray-400 text-sm md:text-base mt-1 group-hover:text-gray-300 transition-colors">Хэрэглэгч</p>
            </div>
            <div className="group">
              <p className="text-4xl md:text-5xl font-extrabold bg-gradient-to-br from-white to-blue-200 bg-clip-text text-transparent">99%</p>
              <p className="text-gray-400 text-sm md:text-base mt-1 group-hover:text-gray-300 transition-colors">Сэтгэл ханамж</p>
            </div>
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 cursor-pointer z-20"
        onClick={scrollToListings}
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <ChevronDown className="w-8 h-8 text-white/60" />
        </motion.div>
      </motion.div>

      {/* Scrolling car images - front layer */}
      {carsWithImages.length > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-48 overflow-hidden z-30">
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent pointer-events-none z-10" />
          <motion.div
            className="flex gap-6 absolute bottom-4"
            animate={{ x: ['0%', '-50%'] }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: carsWithImages.length * 8,
                ease: "linear",
              },
            }}
          >
            {[...carsWithImages, ...carsWithImages].map((car, index) => (
              <Link
                key={`${car.id}-${index}`}
                to={createPageUrl(`CarDetails?id=${car.id}`)}
                className="flex-shrink-0 w-64 h-40 rounded-xl overflow-hidden cursor-pointer transform hover:scale-110 hover:-translate-y-2 transition-all duration-300 relative group shadow-2xl"
              >
                <img
                  src={car.images[0]}
                  alt={car.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors" />
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent">
                  <p className="text-blue-300 text-xs font-bold uppercase tracking-wide mb-0.5">{car.make}</p>
                  <p className="text-white font-semibold text-sm truncate">{car.title}</p>
                  <p className="text-blue-300 text-sm font-bold">
                    {new Intl.NumberFormat('mn-MN').format(car.price)}₮
                  </p>
                </div>
              </Link>
            ))}
          </motion.div>
        </div>
      )}
    </div>
  );
}