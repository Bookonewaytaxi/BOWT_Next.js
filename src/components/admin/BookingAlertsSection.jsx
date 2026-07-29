import React, { useMemo } from 'react';
import { AlertTriangle, Clock, UserX, CreditCard } from 'lucide-react';

export default function BookingAlertsSection({ bookings }) {
  const alerts = useMemo(() => {
    const now = new Date();
    const twelveHoursLater = new Date(now.getTime() + 12 * 60 * 60 * 1000);

    const urgentPickups = bookings.filter(b => {
      if (b.status === 'Cancelled' || b.status === 'Completed') return false;
      const pickupDate = new Date(`${b.pickup_date}T${b.pickup_time || '00:00'}`);
      // Handle invalid date parsing gracefully
      if (isNaN(pickupDate.getTime())) return false; 
      return pickupDate > now && pickupDate <= twelveHoursLater;
    });

    const unassignedDrivers = bookings.filter(b => 
      !b.driver_id && 
      !b.driver_name && 
      b.status !== 'Cancelled' && 
      b.status !== 'Completed'
    );

    const pendingPayments = bookings.filter(b => 
      b.payment_status === 'Pending' && 
      b.status === 'Completed'
    );

    return { urgentPickups, unassignedDrivers, pendingPayments };
  }, [bookings]);

  if (
    alerts.urgentPickups.length === 0 && 
    alerts.unassignedDrivers.length === 0 && 
    alerts.pendingPayments.length === 0
  ) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {alerts.urgentPickups.length > 0 && (
        <div className="bg-amber-900/20 border border-amber-500/30 rounded-xl p-4 flex items-start gap-4 shadow-lg shadow-amber-900/10">
          <div className="p-3 bg-amber-500/10 rounded-full shrink-0">
            <Clock className="h-6 w-6 text-amber-500 animate-pulse" />
          </div>
          <div>
            <h4 className="font-bold text-amber-500 text-sm uppercase tracking-wide">Urgent Pickups</h4>
            <p className="text-amber-200/70 text-xs mt-1">
              <span className="font-bold text-white text-lg mr-1">{alerts.urgentPickups.length}</span> 
              trips scheduled within the next 12 hours.
            </p>
          </div>
        </div>
      )}

      {alerts.unassignedDrivers.length > 0 && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 flex items-start gap-4 shadow-lg shadow-red-900/10">
          <div className="p-3 bg-red-500/10 rounded-full shrink-0">
            <UserX className="h-6 w-6 text-red-500" />
          </div>
          <div>
            <h4 className="font-bold text-red-500 text-sm uppercase tracking-wide">Unassigned Drivers</h4>
            <p className="text-red-200/70 text-xs mt-1">
              <span className="font-bold text-white text-lg mr-1">{alerts.unassignedDrivers.length}</span> 
              active bookings need a driver immediately.
            </p>
          </div>
        </div>
      )}

      {alerts.pendingPayments.length > 0 && (
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4 flex items-start gap-4 shadow-lg shadow-blue-900/10">
          <div className="p-3 bg-blue-500/10 rounded-full shrink-0">
            <CreditCard className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <h4 className="font-bold text-blue-500 text-sm uppercase tracking-wide">Pending Settlements</h4>
            <p className="text-blue-200/70 text-xs mt-1">
              <span className="font-bold text-white text-lg mr-1">{alerts.pendingPayments.length}</span> 
              completed trips have pending payments.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}