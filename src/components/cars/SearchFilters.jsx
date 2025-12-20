import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MAKES = ['Toyota', 'Hyundai', 'Kia', 'Honda', 'Nissan', 'Mazda', 'BMW', 'Mercedes-Benz', 'Audi', 'Lexus', 'Mitsubishi', 'Suzuki', 'Subaru', 'Ford', 'Chevrolet', 'Volkswagen', 'Peugeot', 'Land Rover', 'Jeep', 'Бусад'];

const BODY_TYPES = [
  { value: 'sedan', label: 'Седан' },
  { value: 'suv', label: 'SUV' },
  { value: 'hatchback', label: 'Хэтчбэк' },
  { value: 'coupe', label: 'Купе' },
  { value: 'wagon', label: 'Вагон' },
  { value: 'van', label: 'Микро' },
  { value: 'truck', label: 'Ачааны' },
  { value: 'crossover', label: 'Кроссовер' }
];

const FUEL_TYPES = [
  { value: 'gasoline', label: 'Бензин' },
  { value: 'diesel', label: 'Дизель' },
  { value: 'hybrid', label: 'Хайбрид' },
  { value: 'electric', label: 'Цахилгаан' },
  { value: 'lpg', label: 'Хий' }
];

const LICENSE_PLATE_OPTIONS = [
  { value: 'true', label: 'Дугаар авсан' },
  { value: 'false', label: 'Дугаар аваагүй' }
];

export default function SearchFilters({ filters, setFilters, showAdvanced, setShowAdvanced }) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 35 }, (_, i) => currentYear - i);

  const resetFilters = () => {
    setFilters({
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
  };

  const hasActiveFilters = Object.values(filters).some(v => v && v !== 'all' && v !== '');

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Машин хайх... (жишээ: Prius, Camry)"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="pl-12 h-12 text-base rounded-xl border-gray-200"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`h-12 px-4 rounded-xl ${showAdvanced ? 'bg-blue-50 border-blue-200 text-blue-600' : ''}`}
        >
          <SlidersHorizontal className="w-5 h-5 mr-2" />
          Шүүлтүүр
        </Button>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={resetFilters}
            className="h-12 px-4 rounded-xl text-gray-500 hover:text-red-500"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Цэвэрлэх
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <Select value={filters.make || 'all'} onValueChange={(v) => setFilters({ ...filters, make: v === 'all' ? '' : v })}>
          <SelectTrigger className="w-40 h-10 rounded-xl">
            <SelectValue placeholder="Үйлдвэрлэгч" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Бүгд</SelectItem>
            {MAKES.map(make => (
              <SelectItem key={make} value={make}>{make}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.hasLicensePlate || 'all'} onValueChange={(v) => setFilters({ ...filters, hasLicensePlate: v === 'all' ? '' : v })}>
          <SelectTrigger className="w-40 h-10 rounded-xl">
            <SelectValue placeholder="Дугаар" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Бүгд</SelectItem>
            {LICENSE_PLATE_OPTIONS.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-4 border-t grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <Select value={filters.bodyType || 'all'} onValueChange={(v) => setFilters({ ...filters, bodyType: v === 'all' ? '' : v })}>
                <SelectTrigger className="h-10 rounded-xl">
                  <SelectValue placeholder="Төрөл" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Бүгд</SelectItem>
                  {BODY_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.fuelType || 'all'} onValueChange={(v) => setFilters({ ...filters, fuelType: v === 'all' ? '' : v })}>
                <SelectTrigger className="h-10 rounded-xl">
                  <SelectValue placeholder="Түлш" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Бүгд</SelectItem>
                  {FUEL_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.minYear || 'all'} onValueChange={(v) => setFilters({ ...filters, minYear: v === 'all' ? '' : v })}>
                <SelectTrigger className="h-10 rounded-xl">
                  <SelectValue placeholder="Оноос" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Бүгд</SelectItem>
                  {years.map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                type="number"
                placeholder="Үнэ (доод)"
                value={filters.minPrice}
                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                className="h-10 rounded-xl"
              />

              <Input
                type="number"
                placeholder="Үнэ (дээд)"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                className="h-10 rounded-xl"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}