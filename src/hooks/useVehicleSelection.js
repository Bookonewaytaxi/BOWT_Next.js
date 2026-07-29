import { useState, useCallback } from 'react';

export const useVehicleSelection = () => {
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const calculateFare = useCallback((distance, pricePerKm) => {
    if (!distance || !pricePerKm) return 0;
    
    // Parse distance if string (e.g., "150 km", "150.5 km")
    let distValue = distance;
    if (typeof distance === 'string') {
      distValue = parseFloat(distance.toLowerCase().replace('km', '').replace(/,/g, '').trim());
    }

    if (isNaN(distValue)) return 0;
    
    // Calculate base fare
    let fare = Math.ceil(distValue * pricePerKm);
    
    // Minimum fare logic could go here (e.g. min 250km for some routes)
    // For now, simple multiplication
    
    return fare;
  }, []);

  const selectVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
  };

  const clearSelection = () => {
    setSelectedVehicle(null);
  };

  return {
    selectedVehicle,
    selectVehicle,
    clearSelection,
    calculateFare
  };
};