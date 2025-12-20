import React from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Star, Check } from 'lucide-react';
import { toast } from 'sonner';
import QPayButton from '@/components/payment/QPayButton.jsx';
import { db } from '@/config/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export default function VipUpgradeButton({ car, onUpgrade }) {
  const handleUpgrade = async () => {
    try {
      const carRef = doc(db, 'cars', car.id);
      await updateDoc(carRef, { is_featured: true });
      toast.success('VIP болгогдлоо! Таны зар одоо онцлох байрлалд байна.');
      if (onUpgrade) onUpgrade();
    } catch (error) {
      toast.error('Алдаа гарлаа: ' + error.message);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 border-amber-500 text-amber-600 hover:bg-amber-50">
          <Star className="w-4 h-4" />
          VIP болгох
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500" />
            VIP зар болгох
          </DialogTitle>
          <DialogDescription>
            Таны зар илүү олон хүнд хүрнэ
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* QPay Анхааруулга */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-900 font-medium">
              ⚠️ QPay төлбөрийн систем тохируулагдсан байх ёстой
            </p>
            <p className="text-xs text-blue-700 mt-1">
              Админ dashboard-аас QPAY_MERCHANT_ID болон QPAY_API_KEY secrets-г тохируулна уу
            </p>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border-2 border-amber-200">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Star className="w-5 h-5 text-white fill-current" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">VIP зарын давуу тал</h4>
                <p className="text-sm text-gray-600">Таны зар онцлох байрлалд гарч илүү их үзэлттэй болно</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-600" />
                <span>Нүүр хуудсанд тусгайлан харагдана</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-600" />
                <span>Хайлтын үр дүнд эхэнд гарна</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-600" />
                <span>Шар зоосон дизайн</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-600" />
                <span>3-5 дахин их үзэлт</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">VIP үнэ:</span>
              <span className="text-2xl font-bold text-gray-900">50,000₮</span>
            </div>
            <p className="text-xs text-gray-500">7 хоногийн хугацаанд</p>
          </div>
        </div>

        <div className="flex gap-3">
          <DialogTrigger asChild>
            <Button variant="outline" className="flex-1">Цуцлах</Button>
          </DialogTrigger>
          <QPayButton 
            amount={50000} 
            description={`VIP зар: ${car.title || 'Машины зар'}`}
            onSuccess={handleUpgrade}
          >
            <Button className="flex-1 bg-amber-500 hover:bg-amber-600">
              <Star className="w-4 h-4 mr-2" />
              Төлбөр төлөх
            </Button>
          </QPayButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}