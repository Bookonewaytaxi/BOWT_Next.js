import React, { useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useInquiryStats } from '@/hooks/useInquiryStats';
import { useInquiries } from '@/hooks/useInquiries';
import InquiryTable from './InquiryTable';
import InquiryFilters from './InquiryFilters';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  BarChart3, PlusCircle, TrendingUp, AlertTriangle, RefreshCw, MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function InquiryDashboard() {
  const { stats, loading: statsLoading, refetch: refetchStats } = useInquiryStats();
  const { fetchInquiries, loading: listLoading } = useInquiries();
  
  const [inquiries, setInquiries] = useState([]);
  const [filters, setFilters] = useState({});

  // Fetch list
  React.useEffect(() => {
     loadInquiries();
  }, [filters]);

  const loadInquiries = async () => {
     const result = await fetchInquiries(1, 50, filters); // Simple pagination for dashboard view
     setInquiries(result.data);
  };

  const handleRefresh = () => {
     refetchStats();
     loadInquiries();
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-20 p-6">
       <div className="flex justify-between items-center">
          <div>
             <h2 className="text-3xl font-bold text-white tracking-tight">Inquiry Dashboard</h2>
             <p className="text-slate-400 mt-1">Real-time leads overview and management</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh} className="border-slate-700 text-slate-300 hover:bg-slate-800">
             <RefreshCw className={`w-4 h-4 mr-2 ${listLoading ? 'animate-spin' : ''}`} /> Refresh Data
          </Button>
       </div>

       {/* Stats Cards */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
             title="Total Today" 
             value={stats.totalToday} 
             icon={BarChart3} 
             color="blue" 
             loading={statsLoading}
             sub="Inquiries Received"
          />
          <StatCard 
             title="New Inquiries" 
             value={stats.newToday} 
             icon={PlusCircle} 
             color="indigo" 
             loading={statsLoading}
             sub="Requires Attention"
          />
          <StatCard 
             title="Action Needed" 
             value={stats.followUpRequired} 
             icon={AlertTriangle} 
             color="amber" 
             loading={statsLoading}
             sub="Pending Follow-ups"
          />
          <StatCard 
             title="Conversion Rate" 
             value={`${stats.conversionRate}%`} 
             icon={TrendingUp} 
             color="emerald" 
             loading={statsLoading}
             sub="Lead to Booking"
          />
       </div>

       {/* Main Content Area */}
       <div className="bg-[#1e293b] rounded-xl border border-slate-700/50 p-6 shadow-xl">
          <div className="mb-6">
             <h3 className="text-xl font-bold text-white mb-4">Inquiry List</h3>
             <InquiryFilters onFilterChange={setFilters} />
          </div>

          <InquiryTable 
             inquiries={inquiries} 
             loading={listLoading} 
             onUpdate={handleRefresh} 
          />
       </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, loading, sub }) {
   const colors = {
      blue: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      indigo: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
      amber: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      emerald: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
   };

   return (
      <div className={`p-6 rounded-xl border flex flex-col justify-between h-36 backdrop-blur-sm ${colors[color]}`}>
         <div className="flex justify-between items-start">
            <span className="text-sm font-bold tracking-wider opacity-80 uppercase">{title}</span>
            <div className={`p-2 rounded-lg bg-white/5`}>
               <Icon className="h-5 w-5 opacity-90" />
            </div>
         </div>
         <div>
            <div className="text-4xl font-black tracking-tight">
               {loading ? "..." : value}
            </div>
            <div className="text-xs font-medium mt-1 opacity-70">
               {sub}
            </div>
         </div>
      </div>
   );
}