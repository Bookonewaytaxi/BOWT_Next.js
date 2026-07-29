import { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';

export function useInquiryStats() {
  const [stats, setStats] = useState({
    totalToday: 0,
    newToday: 0,
    followUpRequired: 0,
    conversionRate: 0,
    lostToday: 0
  });
  const [loading, setLoading] = useState(true);

  // Simple cache mechanism (in memory for this hook instance)
  // In a real app with global state like Redux/Zustand, we'd cache there.
  // Here we'll just rely on the component using this hook to re-fetch occasionally.

  const fetchStats = async () => {
    setLoading(true);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString();

    try {
      // Parallel requests for dashboard metrics
      // Updated to use only valid columns (id) for counting, avoiding 'select *' or invalid columns
      const [
        { count: totalToday },
        { count: newToday },
        { count: followUpRequired },
        { count: lostToday },
        { count: convertedTotal },
        { count: allTimeTotal }
      ] = await Promise.all([
        supabase.from('inquiries').select('id', { count: 'exact', head: true }).gte('created_at', todayStr),
        supabase.from('inquiries').select('id', { count: 'exact', head: true }).gte('created_at', todayStr).eq('status', 'new_inquiry'),
        supabase.from('inquiries').select('id', { count: 'exact', head: true }).gte('created_at', todayStr).eq('status', 'follow_up_required'),
        supabase.from('inquiries').select('id', { count: 'exact', head: true }).gte('created_at', todayStr).eq('status', 'lost_inquiry'),
        supabase.from('inquiries').select('id', { count: 'exact', head: true }).eq('status', 'converted_to_booking'),
        supabase.from('inquiries').select('id', { count: 'exact', head: true })
      ]);

      const conversionRate = allTimeTotal > 0 ? ((convertedTotal || 0) / allTimeTotal) * 100 : 0;

      setStats({
        totalToday: totalToday || 0,
        newToday: newToday || 0,
        followUpRequired: followUpRequired || 0,
        conversionRate: parseFloat(conversionRate.toFixed(1)),
        lostToday: lostToday || 0
      });
    } catch (err) {
      console.error('Error fetching inquiry stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Refresh every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return { stats, loading, refetch: fetchStats };
}