import React from 'react';
import { Check, User, Briefcase } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import VehicleImage from '@/components/vehicle/VehicleImage';
import { VEHICLE_TYPES_CONSTANTS } from '@/lib/constants';

export default function VehicleOptionsSection({ route }) {
  if (!route) return null;

  // Helper to get price and ensure it exists
  const getPrice = (key1, key2) => {
    const val = Number(route[key1] || route[key2]);
    return !isNaN(val) && val > 0 ? val : null;
  };

  const vehicles = [
    {
      type: 'Sedan',
      description: 'Comfortable for small families',
      capacity: '4 Passengers',
      luggage: '2 Bags',
      price: getPrice('sedan_price'),
      imageKey: 'sedan',
      features: ['AC', 'Music System', 'Comfortable Seats']
    },
    {
      type: 'SUV (Ertiga)',
      description: 'Spacious for groups',
      capacity: '6 Passengers',
      luggage: '3 Bags',
      price: getPrice('ertiga_price', 'suv_ertiga_price'),
      imageKey: 'suv6',
      features: ['AC', 'Ample Boot Space', 'Leg Room']
    },
    {
      type: 'SUV Plus (Carens)',
      description: 'Premium comfort & space',
      capacity: '6 Passengers',
      luggage: '4 Bags',
      price: getPrice('carens_price', 'kia_carens_price'),
      imageKey: 'suv7',
      features: ['Rear AC Vents', 'Captain Seats', 'Luxury Interiors']
    },
    {
      type: 'Premium (Innova)',
      description: 'Ultimate luxury travel',
      capacity: '7 Passengers',
      luggage: '5 Bags',
      price: getPrice('innova_crysta_price', 'crysta_price'),
      imageKey: 'crysta',
      features: ['Leather Seats', 'Best Suspension', 'VIP Comfort']
    }
  ].filter(v => v.price !== null);

  if (vehicles.length === 0) return null;

  return (
    <section className="py-8">
      <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6 flex items-center gap-2">
        Choose Your Vehicle
        <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
          Best Prices
        </Badge>
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {vehicles.map((vehicle, idx) => {
           // Find matching constant for image URL if needed, or rely on VehicleImage component logic
           const constantData = VEHICLE_TYPES_CONSTANTS.find(v => v.type_key === vehicle.imageKey);
           
           return (
            <Card key={idx} className="group overflow-hidden border-slate-200 hover:border-amber-400 hover:shadow-lg transition-all duration-300 flex flex-col h-full">
              <CardHeader className="p-0 bg-slate-50 relative h-48 flex items-center justify-center overflow-hidden shrink-0">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-100 to-transparent opacity-50" />
                <div className="relative z-10 w-full h-full p-4 transform group-hover:scale-105 transition-transform duration-500">
                  <VehicleImage 
                    src={constantData?.image_url} 
                    alt={vehicle.type} 
                    className="w-full h-full object-contain drop-shadow-md"
                  />
                </div>
              </CardHeader>
              
              <CardContent className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">{vehicle.type}</h3>
                    <p className="text-xs text-slate-500">{vehicle.description}</p>
                  </div>
                </div>
                
                <div className="mt-4 space-y-2 mb-4">
                  <div className="flex items-center text-sm text-slate-600 gap-2">
                    <User className="w-4 h-4 text-slate-400" />
                    <span>{vehicle.capacity}</span>
                  </div>
                  <div className="flex items-center text-sm text-slate-600 gap-2">
                    <Briefcase className="w-4 h-4 text-slate-400" />
                    <span>{vehicle.luggage}</span>
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-slate-100 grid grid-cols-2 gap-2">
                  {vehicle.features.slice(0, 2).map((feat, i) => (
                    <div key={i} className="flex items-center text-xs text-slate-500">
                      <Check className="w-3 h-3 text-green-500 mr-1" /> {feat}
                    </div>
                  ))}
                </div>
              </CardContent>

              <CardFooter className="p-5 pt-0 bg-white mt-auto">
                <div className="w-full">
                  <div className="flex items-baseline justify-between mb-4">
                     <span className="text-sm text-slate-500 font-medium">One Way Fare</span>
                     <span className="text-2xl font-black text-slate-900">₹{vehicle.price.toLocaleString()}</span>
                  </div>
                  <Button 
                    className="w-full bg-slate-900 hover:bg-amber-500 hover:text-slate-900 font-bold transition-colors"
                    onClick={() => {
                      const text = `Hi, I want to book a ${vehicle.type} from ${route.from_city} to ${route.to_city}. Price: ₹${vehicle.price}`;
                      window.open(`https://wa.me/917567575578?text=${encodeURIComponent(text)}`, '_blank');
                    }}
                  >
                    BOOK NOW
                  </Button>
                </div>
              </CardFooter>
            </Card>
           );
        })}
      </div>
    </section>
  );
}