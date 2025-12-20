import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Scale, X, Car } from 'lucide-react';

export default function CompareDrawer({ compareCars, onRemove }) {
  if (compareCars.length === 0) return null;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          className="fixed bottom-6 right-6 h-14 px-6 rounded-full shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 z-40"
          size="lg"
        >
          <Scale className="w-5 h-5 mr-2" />
          Харьцуулах ({compareCars.length})
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Scale className="w-5 h-5" />
            Машин харьцуулах
          </SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-4">
          {compareCars.map((car) => (
            <div key={car.id} className="relative border rounded-xl p-4">
              <button
                onClick={() => onRemove(car.id)}
                className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600"
              >
                <X className="w-4 h-4 text-white" />
              </button>
              
              <div className="flex gap-4">
                <div className="w-24 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  {car.images?.[0] ? (
                    <img src={car.images[0]} alt={car.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Car className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <h3 className="font-semibold">{car.title}</h3>
                  <p className="text-sm text-gray-500">{car.make} {car.model}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="outline">{car.year}он</Badge>
                    <Badge variant="outline">{new Intl.NumberFormat('mn-MN').format(car.mileage)}км</Badge>
                    <Badge variant="outline">{car.fuel_type}</Badge>
                  </div>
                  <p className="text-xl font-bold text-blue-600 mt-2">
                    {new Intl.NumberFormat('mn-MN').format(car.price)}₮
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {compareCars.length >= 2 && (
            <Link to={createPageUrl(`Compare?ids=${compareCars.map(c => c.id).join(',')}`)}>
              <Button className="w-full" size="lg">
                Дэлгэрэнгүй харьцуулах
              </Button>
            </Link>
          )}
          
          {compareCars.length < 2 && (
            <p className="text-center text-gray-500 text-sm">
              Харьцуулахын тулд 2-оос дээш машин сонгоно уу
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}