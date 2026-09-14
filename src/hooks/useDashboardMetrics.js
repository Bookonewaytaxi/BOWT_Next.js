import { useState, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';

const PAGE_SIZE = 1000;
const REVENUE_STATUSES = new Set(['Pending', 'Confirmed', 'Driver Assigned', 'Trip Started', 'Trip Completed']);
const RUNNING_STATUSES = new Set(['Trip Started', 'Driver Assigned']);
const URGENT_STATUSES = new Set(['Confirmed', 'Driver Assigned']);

async function fetchAll(queryFactory) {
  const rows = [];
  let from = 0;
  while (true) {
    const { data, error } = await queryFactory(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    const page = data || [];
    rows.push(...page);
    if (page.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }
  return rows;
}

function startOfLocalDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
}

export function useDashboardMetrics() {
  const [metrics, setMetrics] = useState({ urgentPickups: 0, revenueToday: 0, revenueYesterday: 0, newBookings: 0, runningTrips: 0, conversionRate: 0, revenueChange: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const calculateMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const now = new Date();
      const todayStart = startOfLocalDay(now);
      const tomorrowStart = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
      const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);
      const twelveHoursLater = new Date(now.getTime() + 12 * 60 * 60 * 1000);

      const [bookingsToday, bookingsYesterday, activeTrips, inquiryCountResult, convertedResult] = await Promise.all([
        fetchAll((from, to) => supabase.from('bookings').select('total_amount, pickup_date, pickup_time, status, created_at').gte('created_at', todayStart.toISOString()).lt('created_at', tomorrowStart.toISOString()).range(from, to)),
        fetchAll((from, to) => supabase.from('bookings').select('total_amount, status, created_at').gte('created_at', yesterdayStart.toISOString()).lt('created_at', todayStart.toISOString()).range(from, to)),
        fetchAll((from, to) => supabase.from('bookings').select('pickup_date, pickup_time, status').in('status', Array.from(URGENT_STATUSES).concat(Array.from(RUNNING_STATUSES))).range(from, to)),
        supabase.from('inquiries').select('*', { count: 'exact', head: true }),
        supabase.from('inquiries').select('*', { count: 'exact', head: true }).eq('status', 'Converted to Booking')
      ]);

      if (inquiryCountResult.error) throw inquiryCountResult.error;
      if (convertedResult.error) throw convertedResult.error;

      const newBookingsCount = bookingsToday.length;
      const revenueTodayTotal = bookingsToday.reduce((sum, b) => REVENUE_STATUSES.has(b.status) ? sum + (Number(b.total_amount) || 0) : sum, 0);
      const revenueYesterdayTotal = bookingsYesterday.reduce((sum, b) => REVENUE_STATUSES.has(b.status) ? sum + (Number(b.total_amount) || 0) : sum, 0);
      const revenueChangePercent = revenueYesterdayTotal > 0
        ? Math.round(((revenueTodayTotal - revenueYesterdayTotal) / revenueYesterdayTotal) * 100)
        : (revenueTodayTotal > 0 ? 100 : 0);

      const runningTripsCount = activeTrips.filter(b => RUNNING_STATUSES.has(b.status)).length;
      const urgentCount = activeTrips.filter(b => {
        if (!URGENT_STATUSES.has(b.status) || !b.pickup_date || !b.pickup_time) return false;
        const pickupDateTime = new Date(`${b.pickup_date}T${String(b.pickup_time).slice(0, 8)}`);
        return !Number.isNaN(pickupDateTime.getTime()) && pickupDateTime > now && pickupDateTime <= twelveHoursLater;
      }).length;

      const inquiryCount = inquiryCountResult.count || 0;
      const convertedInquiryCount = convertedResult.count || 0;
      const conversionRateVal = inquiryCount > 0 ? Math.round((convertedInquiryCount / inquiryCount) * 100) : 0;

      setMetrics({ urgentPickups: urgentCount, revenueToday: revenueTodayTotal, revenueYesterday: revenueYesterdayTotal, newBookings: newBookingsCount, runningTrips: runningTripsCount, conversionRate: conversionRateVal, revenueChange: revenueChangePercent });
    } catch (err) {
      console.error('Dashboard Metrics Error:', err);
      setError(err.message || 'Failed to fetch dashboard metrics');
    } finally {
      setLoading(false);
    }
  }, []);

  return { metrics, loading, error, refreshMetrics: calculateMetrics };
}
