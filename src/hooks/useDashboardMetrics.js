import { useState, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';

export function useDashboardMetrics() {
  const [metrics, setMetrics] = useState({
    urgentPickups: 0,
    revenueToday: 0,
    revenueYesterday: 0,
    newBookings: 0,
    runningTrips: 0,
    conversionRate: 0,
    revenueChange: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const calculateMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      // Calculate 12 hours from now for urgent pickups
      const twelveHoursLater = new Date(now.getTime() + 12 * 60 * 60 * 1000);

      // Fetch Data
      const [
        { data: bookingsToday, error: err1 },
        { data: bookingsYesterday, error: err2 },
        { data: activeTrips, error: err3 },
        { count: inquiryCount, error: err4 },
        { count: convertedInquiryCount, error: err5 }
      ] = await Promise.all([
        // 1. Bookings Created Today (New Bookings & Revenue Today)
        supabase.from('bookings').select('total_amount, pickup_date, pickup_time, status').gte('created_at', todayStr + 'T00:00:00'),
        
        // 2. Bookings Created Yesterday (Revenue Comparison)
        supabase.from('bookings').select('total_amount').gte('created_at', yesterdayStr + 'T00:00:00').lt('created_at', todayStr + 'T00:00:00'),
        
        // 3. Active/Running Trips OR Urgent Pickups (Broader query to filter in JS for complex time logic)
        supabase.from('bookings').select('pickup_date, pickup_time, status').or('status.eq.Trip Started,status.eq.Driver Assigned,status.eq.Confirmed'),
        
        // 4. Total Inquiries
        supabase.from('inquiries').select('*', { count: 'exact', head: true }),
        
        // 5. Converted Inquiries
        supabase.from('inquiries').select('*', { count: 'exact', head: true }).eq('status', 'Converted to Booking')
      ]);

      if (err1 || err2 || err3 || err4 || err5) {
        throw new Error("Failed to fetch dashboard metrics");
      }

      // Calculations
      const newBookingsCount = bookingsToday?.length || 0;
      
      const revenueTodayTotal = bookingsToday?.reduce((sum, b) => sum + (Number(b.total_amount) || 0), 0) || 0;
      const revenueYesterdayTotal = bookingsYesterday?.reduce((sum, b) => sum + (Number(b.total_amount) || 0), 0) || 0;
      
      let revenueChangePercent = 0;
      if (revenueYesterdayTotal > 0) {
        revenueChangePercent = Math.round(((revenueTodayTotal - revenueYesterdayTotal) / revenueYesterdayTotal) * 100);
      } else if (revenueTodayTotal > 0) {
        revenueChangePercent = 100;
      }

      const runningTripsCount = activeTrips?.filter(b => 
        ['Trip Started', 'Driver Assigned'].includes(b.status)
      ).length || 0;

      // Urgent Pickups Logic: Status is Confirmed/Assigned AND pickup time is within next 12 hours
      const urgentCount = activeTrips?.filter(b => {
        if (['Cancelled', 'Trip Completed'].includes(b.status)) return false;
        if (!b.pickup_date || !b.pickup_time) return false;
        
        const pickupDateTime = new Date(`${b.pickup_date}T${b.pickup_time}`);
        return pickupDateTime > now && pickupDateTime <= twelveHoursLater;
      }).length || 0;

      const conversionRateVal = inquiryCount > 0 ? Math.round((convertedInquiryCount / inquiryCount) * 100) : 0;

      setMetrics({
        urgentPickups: urgentCount,
        revenueToday: revenueTodayTotal,
        revenueYesterday: revenueYesterdayTotal,
        newBookings: newBookingsCount,
        runningTrips: runningTripsCount,
        conversionRate: conversionRateVal,
        revenueChange: revenueChangePercent
      });

    } catch (err) {
      console.error("Dashboard Metrics Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { metrics, loading, error, refreshMetrics: calculateMetrics };
}