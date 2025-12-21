import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator, Info, RefreshCw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function ExciseTaxCalculator({ car }) {
  const [transportCostUSD, setTransportCostUSD] = useState(0);
  const [exchangeRate, setExchangeRate] = useState(3580); // Default ханш
  const [exciseTax, setExciseTax] = useState(0);
  const [totalBeforeTax, setTotalBeforeTax] = useState(0);
  const [finalTax, setFinalTax] = useState(0);
  const [finalTotal, setFinalTotal] = useState(0);

  // Хаан банкны USD зарах ханш татах (Firebase Function ашиглах)
  const { data: fetchedRate, isLoading: isLoadingRate, refetch: refetchRate } = useQuery({
    queryKey: ['khanBankExchangeRate'],
    queryFn: async () => {
      try {
        // Firebase Function ашиглаж backend-аас ханш татах
        const functionUrl = 'https://us-central1-carsmongolia-d410a.cloudfunctions.net/getKhanBankRate';
        const response = await fetch(functionUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch');
        }
        
        const data = await response.json();
        return data.rate || 3580;
      } catch (error) {
        console.error('Error fetching exchange rate:', error);
        // Fallback: default ханш ашиглах
        toast.error('Ханш автоматаар татагдахгүй байна. Гараар засах боломжтой.');
        return 3580;
      }
    },
    staleTime: 60 * 60 * 1000, // 1 цаг cache
    retry: 2,
  });

  // Ханш татагдвал state-д хадгалах
  useEffect(() => {
    if (fetchedRate) {
      setExchangeRate(fetchedRate);
    }
  }, [fetchedRate]);

  // USD-аас MNT руу хөрвүүлэх
  const transportCostMNT = transportCostUSD * exchangeRate;

  // Онцгой албан татварын хүснэгт
  const getExciseTaxRate = (engineCapacity, fuelType, carAge) => {
    // Насыг тодорхойлох
    let ageCategory;
    if (carAge <= 3) ageCategory = '0-3';
    else if (carAge <= 6) ageCategory = '4-6';
    else if (carAge <= 9) ageCategory = '7-9';
    else ageCategory = '10+';

    // Хөдөлгүүрийн багтаамжийн ангилал
    let capacityCategory;
    if (engineCapacity <= 1500) capacityCategory = '1500';
    else if (engineCapacity <= 2500) capacityCategory = '1501-2500';
    else if (engineCapacity <= 3500) capacityCategory = '2501-3500';
    else if (engineCapacity <= 4500) capacityCategory = '3501-4500';
    else capacityCategory = '4501+';

    // Бензин/Дизель
    if (fuelType === 'gasoline' || fuelType === 'diesel') {
      const rates = {
        '1500': { '0-3': 750000, '4-6': 1600000, '7-9': 3350000, '10+': 10000000 },
        '1501-2500': { '0-3': 2300000, '4-6': 3200000, '7-9': 5000000, '10+': 11700000 },
        '2501-3500': { '0-3': 3050000, '4-6': 4000000, '7-9': 6700000, '10+': 13350000 },
        '3501-4500': { '0-3': 6850000, '4-6': 8000000, '7-9': 10850000, '10+': 17500000 },
        '4501+': { '0-3': 14210000, '4-6': 27200000, '7-9': 39150000, '10+': 65975000 }
      };
      return rates[capacityCategory]?.[ageCategory] || 0;
    }
    
    // Hybrid/LPG
    if (fuelType === 'hybrid' || fuelType === 'lpg') {
      const rates = {
        '1500': { '0-3': 375000, '4-6': 800000, '7-9': 1675000, '10+': 5000000 },
        '1501-2500': { '0-3': 1150000, '4-6': 1600000, '7-9': 2500000, '10+': 5850000 },
        '2501-3500': { '0-3': 1525000, '4-6': 2000000, '7-9': 3350000, '10+': 6675000 },
        '3501-4500': { '0-3': 3425000, '4-6': 4000000, '7-9': 5425000, '10+': 8750000 },
        '4501+': { '0-3': 7105000, '4-6': 13600000, '7-9': 19575000, '10+': 32987500 }
      };
      return rates[capacityCategory]?.[ageCategory] || 0;
    }
    
    // Цахилгаан
    if (fuelType === 'electric') {
      const rates = {
        '0-3': 375000,
        '4-6': 800000,
        '7-9': 1675000,
        '10+': 5000000
      };
      return rates[ageCategory] || 0;
    }

    return 0;
  };

  useEffect(() => {
    if (!car) return;

    const carPrice = car.price || 0;
    const engineCapacity = car.engine_capacity || 0;
    const fuelType = car.fuel_type || 'gasoline';
    const carYear = car.year || new Date().getFullYear();
    const currentYear = new Date().getFullYear();
    const carAge = currentYear - carYear;

    // Онцгой албан татвар тооцох
    const excise = getExciseTaxRate(engineCapacity, fuelType, carAge);
    setExciseTax(excise);

    // Нийт дүн (машины үнэ + тээвэр (MNT) + онцгой албан татвар)
    const total = carPrice + transportCostMNT + excise;
    setTotalBeforeTax(total);

    // Нийт дүнгээс 15.5% татвар
    const tax = total * 0.155;
    setFinalTax(tax);

    // Эцсийн дүн
    const final = total + tax;
    setFinalTotal(final);
  }, [car, transportCostUSD, exchangeRate, transportCostMNT]);

  const formatNumber = (num) => {
    return new Intl.NumberFormat('mn-MN').format(Math.round(num));
  };

  if (!car) return null;

  const carYear = car.year || new Date().getFullYear();
  const currentYear = new Date().getFullYear();
  const carAge = currentYear - carYear;

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calculator className="w-5 h-5" />
          Автомашины гаалийн татварын тооцоолуур
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Машины мэдээлэл */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Машины үнэ:</span>
            <span className="font-semibold">{formatNumber(car.price || 0)}₮</span>
          </div>
          {car.engine_capacity && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Хөдөлгүүр:</span>
              <span className="font-semibold">{car.engine_capacity} cc</span>
            </div>
          )}
          {car.fuel_type && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Түлш:</span>
              <span className="font-semibold">
                {car.fuel_type === 'gasoline' ? 'Бензин' :
                 car.fuel_type === 'diesel' ? 'Дизель' :
                 car.fuel_type === 'hybrid' ? 'Хайбрид' :
                 car.fuel_type === 'electric' ? 'Цахилгаан' :
                 car.fuel_type === 'lpg' ? 'LPG' : car.fuel_type}
              </span>
            </div>
          )}
          {car.year && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Он:</span>
              <span className="font-semibold">{car.year} ({carAge} жил)</span>
            </div>
          )}
        </div>

        {/* Тээврийн зардал */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="transport">Тээвэр оруулна уу</Label>
            <button
              type="button"
              onClick={() => refetchRate()}
              disabled={isLoadingRate}
              className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
              title="Ханш шинэчлэх"
            >
              <RefreshCw className={`w-3 h-3 ${isLoadingRate ? 'animate-spin' : ''}`} />
              Ханш Шинэчлэх $
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="transport" className="text-sm text-gray-600 mb-1 block">Тоон утга USD</Label>
              <Input
                id="transport"
                type="number"
                value={transportCostUSD === 0 ? '' : transportCostUSD}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || value === null || value === undefined) {
                    setTransportCostUSD(0);
                  } else {
                    const numValue = parseFloat(value);
                    if (!isNaN(numValue) && numValue >= 0) {
                      setTransportCostUSD(numValue);
                    }
                  }
                }}
                onBlur={(e) => {
                  if (e.target.value === '') {
                    setTransportCostUSD(0);
                  }
                }}
                placeholder="Тоон утга USD"
                className="mt-1"
                min="0"
                step="100"
              />
            </div>
            <div>
              <Label htmlFor="exchangeRate" className="text-sm text-gray-600 mb-1 block">Ханш Хаан Банк</Label>
              <Input
                id="exchangeRate"
                type="number"
                value={exchangeRate}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || value === null || value === undefined) {
                    setExchangeRate(3580);
                  } else {
                    const numValue = parseFloat(value);
                    if (!isNaN(numValue) && numValue > 0) {
                      setExchangeRate(numValue);
                    }
                  }
                }}
                placeholder="USD ханш"
                className="mt-1"
                min="1"
                step="0.01"
              />
            </div>
          </div>
          
          {transportCostUSD > 0 && (
            <p className="text-xs text-gray-500">
              Тээврийн зардал: {formatNumber(transportCostMNT)}₮ ({transportCostUSD} USD × {exchangeRate})
            </p>
          )}
        </div>

        {/* Тооцооллын үр дүн */}
        <div className="pt-4 border-t space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Онцгой албан татвар:</span>
            <span className="font-semibold text-blue-600">{formatNumber(exciseTax)}₮</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Нийт дүн (үнэ + тээвэр + онцгой татвар):</span>
            <span className="font-semibold">{formatNumber(totalBeforeTax)}₮</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Нийт дүнгээс 15.5% татвар:</span>
            <span className="font-semibold text-red-600">{formatNumber(finalTax)}₮</span>
          </div>

          <div className="pt-3 border-t">
            <div className="flex justify-between items-center">
              <span className="text-base font-semibold text-gray-900">Эцсийн дүн:</span>
              <span className="text-2xl font-bold text-blue-600">{formatNumber(finalTotal)}₮</span>
            </div>
          </div>
        </div>

        {/* Мэдээлэл */}
        <div className="bg-blue-50 p-3 rounded-lg flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-blue-800">
            Онцгой албан татварыг хөдөлгүүрийн багтаамж, түлшний төрөл, машины насаар тооцдог. 
            Нийт дүнгээс 15.5% татвар нэмэгдэнэ.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

