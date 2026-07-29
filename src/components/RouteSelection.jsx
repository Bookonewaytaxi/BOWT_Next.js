import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Car, ArrowRight, Clock, Route } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RouteSelection({ routes, onSelectVehicle }) {
  if (!routes || routes.length === 0) return null;

  const handleVehicleSelect = (route, vehicleType, price) => {
    onSelectVehicle({
      from_city: route.from_city,
      to_city: route.to_city,
      car_type: vehicleType,
      price: price,
      distance: route.distance,
      duration: route.duration
    });
  };

  return (
    <div className="py-12 px-4 bg-slate-100">
      <div className="container mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-navy mb-2">Available Routes</h2>
          <p className="text-slate-600">Select your preferred vehicle for your journey</p>
        </div>

        <div className="grid gap-6 max-w-5xl mx-auto">
          {routes.map((route) => (
            <motion.div
              key={route.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-shadow"
            >
              {/* Route Header */}
              <div className="bg-gradient-to-r from-navy to-slate-800 p-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-500 rounded-xl">
                      <MapPin className="h-6 w-6 text-navy" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 text-white">
                        <span className="text-xl font-bold">{route.from_city}</span>
                        <ArrowRight className="h-5 w-5 text-amber-400" />
                        <span className="text-xl font-bold">{route.to_city}</span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-slate-300 text-sm">
                        {route.distance && (
                          <span className="flex items-center gap-1">
                            <Route className="h-3 w-3" />
                            {route.distance}
                          </span>
                        )}
                        {route.duration && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {route.duration}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vehicle Options */}
              <div className="p-6">
                <p className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-4">Choose Your Vehicle</p>
                <div className="grid md:grid-cols-3 gap-4">
                  {/* Sedan */}
                  <motion.div
                    whileHover={{ y: -5 }}
                    className="border-2 border-slate-200 rounded-xl p-5 hover:border-amber-500 hover:shadow-lg transition-all cursor-pointer group"
                    onClick={() => handleVehicleSelect(route, 'Sedan', route.sedan_price)}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-amber-100 transition-colors">
                        <Car className="h-5 w-5 text-slate-600 group-hover:text-amber-600" />
                      </div>
                      <span className="font-bold text-navy">Sedan</span>
                    </div>
                    <p className="text-xs text-slate-500 mb-3">Dzire, Etios (4 Seater)</p>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-xs text-slate-500">Starting at</p>
                        <p className="text-2xl font-black text-amber-600">₹{route.sedan_price}</p>
                      </div>
                      <Button
                        size="sm"
                        className="bg-amber-500 hover:bg-amber-600 text-navy font-bold"
                      >
                        Select
                      </Button>
                    </div>
                  </motion.div>

                  {/* SUV */}
                  <motion.div
                    whileHover={{ y: -5 }}
                    className="border-2 border-slate-200 rounded-xl p-5 hover:border-amber-500 hover:shadow-lg transition-all cursor-pointer group"
                    onClick={() => handleVehicleSelect(route, 'SUV', route.suv_price)}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-amber-100 transition-colors">
                        <Car className="h-5 w-5 text-slate-600 group-hover:text-amber-600" />
                      </div>
                      <span className="font-bold text-navy">SUV</span>
                    </div>
                    <p className="text-xs text-slate-500 mb-3">Ertiga, Innova (6-7 Seater)</p>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-xs text-slate-500">Starting at</p>
                        <p className="text-2xl font-black text-amber-600">₹{route.suv_price}</p>
                      </div>
                      <Button
                        size="sm"
                        className="bg-amber-500 hover:bg-amber-600 text-navy font-bold"
                      >
                        Select
                      </Button>
                    </div>
                  </motion.div>

                  {/* Crysta */}
                  <motion.div
                    whileHover={{ y: -5 }}
                    className="border-2 border-slate-200 rounded-xl p-5 hover:border-amber-500 hover:shadow-lg transition-all cursor-pointer group"
                    onClick={() => handleVehicleSelect(route, 'Crysta', route.crysta_price)}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-amber-100 transition-colors">
                        <Car className="h-5 w-5 text-slate-600 group-hover:text-amber-600" />
                      </div>
                      <span className="font-bold text-navy">Crysta</span>
                    </div>
                    <p className="text-xs text-slate-500 mb-3">Innova Crysta (Premium 7 Seater)</p>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-xs text-slate-500">Starting at</p>
                        <p className="text-2xl font-black text-amber-600">₹{route.crysta_price}</p>
                      </div>
                      <Button
                        size="sm"
                        className="bg-amber-500 hover:bg-amber-600 text-navy font-bold"
                      >
                        Select
                      </Button>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}