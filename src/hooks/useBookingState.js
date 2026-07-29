import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'owt_selected_vehicle';

export function useBookingState() {
  const [selectedVehicle, setSelectedVehicleState] = useState(null);

  // Initialize from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSelectedVehicleState(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to parse booking state', e);
    }
  }, []);

  const setSelectedVehicle = useCallback((vehicle) => {
    setSelectedVehicleState(vehicle);
    try {
      if (vehicle) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(vehicle));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      console.error('Failed to save booking state', e);
    }
  }, []);

  const clearBookingState = useCallback(() => {
    setSelectedVehicleState(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    selectedVehicle,
    setSelectedVehicle,
    clearBookingState
  };
}