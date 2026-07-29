import React, { useEffect } from 'react';
import { 
  Users, Car, AlertTriangle, RefreshCw, Search, ArrowUpRight, ArrowDownRight, 
  MessageSquare, Clock, FilterX 
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useBookingFilters } from '@/hooks/useBookingFilters';
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics';

import BookingTable from './BookingTable';
import BookingCard from './BookingCard';
import BookingFilters from './BookingFilters';
import AdvancedBookingFilters from './AdvancedBookingFilters';
import BookingDetailsModal from './BookingDetailsModal';
import AssignDriverModal from './AssignDriverModal';
import DeleteBookingModal from './DeleteBookingModal';

export default function BookingManagementDashboard() {
  // Hooks
  const { 
    bookings, loading, refreshBookings,
    searchTerm, setSearchTerm,
    activeTab, setActiveTab,
    setFilter, clearAllFilters, getActiveFilterCount, activeFilters
  } = useBookingFilters();

  const { metrics, loading: metricsLoading, refreshMetrics } = useDashboardMetrics();

  // Modal States
  const [selectedBookingDetails, setSelectedBookingDetails] = React.useState(null);
  const [selectedBookingDriver, setSelectedBookingDriver] = React.useState(null);
  const [selectedBookingDelete, setSelectedBookingDelete] = React.useState(null);

  // Initial Load
  useEffect(() => {
    refreshMetrics();
  }, []);

  const handleRefresh = () => {
    refreshBookings();
    refreshMetrics();
  };

  const dummyCounts = { all: 0, today: 0, tomorrow: 0, week: 0, preorder: 0 }; 

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-20">
      
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
        {/* Urgent Alert Card */}
        <div className="p-4 rounded-xl border bg-amber-500/10 border-amber-500/30 backdrop-blur-sm flex flex-col justify-between h-28 md:h-32 relative overflow-hidden">
           <div className="absolute right-0 top-0 p-2 opacity-10"><Clock className="h-16 w-16" /></div>
           <div className="flex justify-between items-start">
              <h3 className="text-amber-500 text-xs uppercase font-bold tracking-wider">Urgent Pickups</h3>
              <AlertTriangle className="h-5 w-5 text-amber-500 animate-pulse" />
           </div>
           <div>
              <div className="text-2xl font-black text-white mt-1 md:mt-2">
                 {metricsLoading ? "..." : metrics.urgentPickups}
              </div>
              <p className="text-xs text-amber-200/70 mt-1">Pickups within 12 hours</p>
           </div>
        </div>

        {/* Revenue Card */}
        <div className="p-4 rounded-xl border bg-emerald-500/10 border-emerald-500/30 backdrop-blur-sm flex flex-col justify-between h-28 md:h-32">
           <div className="flex justify-between items-start">
              <h3 className="text-emerald-500 text-xs uppercase font-bold tracking-wider">Revenue Today</h3>
              <div className={`flex items-center text-xs font-bold ${metrics.revenueChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                 {metrics.revenueChange >= 0 ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                 {Math.abs(metrics.revenueChange)}%
              </div>
           </div>
           <div>
              <div className="text-xl md:text-2xl font-black text-white mt-1 md:mt-2">
                 {metricsLoading ? "..." : `₹${metrics.revenueToday.toLocaleString()}`}
              </div>
              <p className="text-[10px] md:text-xs text-slate-400 mt-1">vs ₹{metrics.revenueYesterday.toLocaleString()} yesterday</p>
           </div>
        </div>

        <StatCard title="New Bookings" value={metrics.newBookings} icon={Users} color="blue" subtitle="Created Today" loading={metricsLoading} />
        <StatCard title="Running Trips" value={metrics.runningTrips} icon={Car} color="cyan" subtitle="Active on Road" loading={metricsLoading} />
        
        <div className="p-4 rounded-xl border bg-purple-500/10 border-purple-500/30 backdrop-blur-sm flex flex-col justify-between h-28 md:h-32 hidden xl:flex">
           <div className="flex justify-between items-start">
              <h3 className="text-purple-500 text-xs uppercase font-bold tracking-wider">Conversion Rate</h3>
              <MessageSquare className="h-5 w-5 text-purple-500" />
           </div>
           <div>
              <div className="text-2xl font-black text-white mt-2">
                 {metricsLoading ? "..." : `${metrics.conversionRate}%`}
              </div>
              <p className="text-xs text-purple-200/70 mt-1">Inquiry to Booking</p>
           </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center bg-[#1e293b] p-4 rounded-xl border border-slate-700/50 shadow-lg">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center w-full lg:w-auto flex-wrap">
          {/* Search */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input 
              placeholder="Search ID, Name, Phone..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-[#0f172a] border-slate-700 text-slate-200 focus:border-amber-500 w-full"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                <FilterX className="h-3 w-3" />
              </button>
            )}
          </div>
          
          {/* Tabs */}
          <div className="overflow-x-auto pb-1 md:pb-0 -mx-4 md:mx-0 px-4 md:px-0">
             <BookingFilters activeFilter={activeTab} onFilterChange={setActiveTab} counts={dummyCounts} />
          </div>
          
          <div className="h-8 w-px bg-slate-700 hidden lg:block"></div>
          
          {/* Advanced Filters */}
          <AdvancedBookingFilters 
             onFilterChange={setFilter} 
             activeFiltersCount={getActiveFilterCount()} 
             onClearAll={clearAllFilters}
             currentFilters={activeFilters}
          />
        </div>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleRefresh} 
          className="border-slate-600 text-slate-400 hover:text-white hover:bg-slate-800 gap-2 w-full lg:w-auto"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      {/* Main Content Area - Responsive Switch between Table and Cards */}
      {loading ? (
        <div className="h-96 bg-[#1e293b] rounded-xl border border-slate-700/50 flex flex-col items-center justify-center gap-4 animate-pulse">
           <RefreshCw className="h-8 w-8 text-amber-500 animate-spin" />
           <p className="text-slate-500">Loading bookings...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-20 text-slate-500 bg-[#1e293b] rounded-xl border border-slate-700 border-dashed">
          <p>No bookings found.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block">
            <BookingTable 
              bookings={bookings} 
              onView={(b) => setSelectedBookingDetails(b)}
              onAssignDriver={(b) => setSelectedBookingDriver(b)}
              onDelete={(b) => setSelectedBookingDelete(b)}
            />
          </div>

          {/* Mobile Cards */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {bookings.map(booking => (
              <BookingCard 
                key={booking.id}
                booking={booking}
                onView={(b) => setSelectedBookingDetails(b)}
                onAssignDriver={(b) => setSelectedBookingDriver(b)}
                onDelete={(b) => setSelectedBookingDelete(b)}
              />
            ))}
          </div>
        </>
      )}

      {/* Modals */}
      {selectedBookingDetails && (
        <BookingDetailsModal 
          isOpen={!!selectedBookingDetails}
          onClose={() => setSelectedBookingDetails(null)}
          booking={selectedBookingDetails}
        />
      )}

      {selectedBookingDriver && (
        <AssignDriverModal
          isOpen={!!selectedBookingDriver}
          onClose={() => setSelectedBookingDriver(null)}
          booking={selectedBookingDriver}
          onAssignmentComplete={handleRefresh}
        />
      )}

      {selectedBookingDelete && (
        <DeleteBookingModal
          isOpen={!!selectedBookingDelete}
          onClose={() => setSelectedBookingDelete(null)}
          booking={selectedBookingDelete}
          onDeleteSuccess={handleRefresh}
        />
      )}

    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, subtitle, loading }) {
  const colors = {
    blue: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    cyan: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20",
    purple: "text-purple-500 bg-purple-500/10 border-purple-500/20",
    green: "text-green-500 bg-green-500/10 border-green-500/20",
    amber: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    red: "text-red-500 bg-red-500/10 border-red-500/20",
  };
  const activeColor = colors[color] || colors.blue;

  return (
    <div className={`p-4 rounded-xl border flex flex-col justify-between h-28 md:h-32 backdrop-blur-sm ${activeColor.replace('text-', 'border-')}`}>
      <div className="flex justify-between items-start">
        <h3 className="text-slate-400 text-xs uppercase font-bold tracking-wider">{title}</h3>
        <div className={`p-2 rounded-lg ${activeColor}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div>
        <div className="text-xl md:text-2xl font-black text-white mt-1 md:mt-2">
          {loading ? "..." : value}
        </div>
        {subtitle && <p className="text-[10px] md:text-xs text-slate-400 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}