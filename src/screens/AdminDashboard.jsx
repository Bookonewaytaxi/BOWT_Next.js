import React, { useState } from 'react';
import Head from 'next/head';
import { 
  LayoutDashboard, Map, Plane, FileText, BarChart, LogOut, Bell, 
  Receipt, ShipWheel as SteeringWheel, Car, Ticket, MessageSquare, Settings, ArrowRight, Menu, X, FileCode, Megaphone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import LoginForm from '@/components/LoginForm';
import RouteManagement from '@/components/admin/RouteManagement';
import SEOManagement from '@/components/admin/SEOManagement';
import BillsList from '@/components/admin/BillsList';
import DriverManagement from '@/components/admin/DriverManagement';
import BookingManagementDashboard from '@/components/admin/BookingManagementDashboard';
import CouponManagement from '@/components/admin/CouponManagement';
import VehicleManagement from '@/components/admin/VehicleManagement';
import LogoImage from '@/components/ui/LogoImage';
import { useRouter } from 'next/router';

export default function AdminDashboard() {
  const { user, signOut, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('User Dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();
  
  const sidebarItems = [
    { name: 'User Dashboard', icon: LayoutDashboard },
    { name: 'Booking Inquiries', icon: MessageSquare, action: () => router.push('/admin/inquiries') },
    { name: 'Route Management', icon: Map },
    { name: 'Driver Management', icon: SteeringWheel },
    { name: 'Bills', icon: Receipt },
    { name: 'Coupons', icon: Ticket },
    { name: 'Vehicles', icon: Car },
    { name: 'SEO Management', icon: BarChart },
    { name: 'Sitemap Settings', icon: FileCode, action: () => router.push('/admin/settings/seo/sitemap') },
    { name: 'Marketing & Analytics', icon: Megaphone, action: () => router.push('/admin/settings/marketing-integrations') },
    { name: 'Local Services', icon: Car },
    { name: 'Airport Services', icon: Plane },
    { name: 'Settings', icon: Settings },
  ];

  if (authLoading) return <div className="min-h-screen bg-[#0B1120] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent"></div></div>;
  if (!user) return <LoginForm />;

  const handleTabClick = (item) => {
    if (item.action) {
      item.action();
    } else {
      setActiveTab(item.name);
    }
    setIsSidebarOpen(false); // Close sidebar on mobile after selection
  };

  return (
    <>
      <Head>
        <title>Admin Dashboard | One Way Taxi</title>
      </Head>
      
      <div className="flex h-screen bg-[#0f172a] text-slate-100 font-sans overflow-hidden">
        
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside 
          className={`
            fixed inset-y-0 left-0 z-40 w-72 bg-[#0B1120] flex flex-col border-r border-slate-800 shadow-2xl 
            transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
          <div className="p-4 md:p-6 flex items-center justify-between border-b border-slate-800/50">
            <div className="flex items-center gap-3">
              <LogoImage size="small" className="rounded-full border border-amber-500/30" />
              <div>
                <h1 className="font-extrabold text-lg text-amber-500 tracking-wide">One Way Taxi</h1>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest">Admin Panel</p>
              </div>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-white">
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-6 px-3 space-y-2 scrollbar-thin scrollbar-thumb-slate-700">
            {sidebarItems.map((item) => (
              <button
                key={item.name}
                onClick={() => handleTabClick(item)}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group ${
                  activeTab === item.name 
                    ? 'bg-amber-500 text-slate-900 font-bold shadow-[0_0_20px_rgba(245,158,11,0.3)]' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <item.icon className={`h-5 w-5 ${activeTab === item.name ? 'text-slate-900' : 'text-slate-500 group-hover:text-amber-500'}`} />
                <span className="text-sm tracking-wide">{item.name}</span>
                {item.name === 'Booking Inquiries' && <ArrowRight className="w-4 h-4 ml-auto opacity-50" />}
              </button>
            ))}
          </div>

          <div className="p-4 border-t border-slate-800/50">
            <Button 
              onClick={() => signOut()} 
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold h-12 rounded-xl shadow-lg shadow-red-900/20 flex items-center justify-center gap-2"
            >
              <LogOut className="h-5 w-5" /> Logout
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#0f172a] relative">
          {/* Top Bar */}
          <header className="h-16 md:h-20 bg-[#1e293b]/50 backdrop-blur-md border-b border-slate-800 flex justify-between items-center px-4 md:px-8 z-10 sticky top-0">
            <div className="flex items-center gap-4">
               <button 
                 onClick={() => setIsSidebarOpen(true)}
                 className="md:hidden text-white hover:bg-slate-800 p-2 rounded-lg"
               >
                 <Menu className="h-6 w-6" />
               </button>
               <div>
                  <h2 className="text-lg md:text-2xl font-bold text-amber-500 truncate">{activeTab}</h2>
                  <p className="text-slate-400 text-xs md:text-sm mt-0.5 hidden md:block">Welcome back, Administrator</p>
               </div>
            </div>
            
            <div className="flex items-center gap-3 md:gap-6">
              <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
                <Bell className="h-6 w-6" />
                <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-[#1e293b]"></span>
              </button>
              <div className="flex items-center gap-3 pl-3 md:pl-6 border-l border-slate-700">
                <div className="text-right hidden md:block">
                  <p className="text-sm font-bold text-white">One Way Taxi</p>
                  <p className="text-xs text-slate-400">Super Admin</p>
                </div>
                <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-900 font-bold text-lg shadow-lg border border-amber-300">
                  A
                </div>
              </div>
            </div>
          </header>

          {/* Dashboard Content */}
          <div className="flex-1 overflow-y-auto p-3 md:p-8 scrollbar-thin scrollbar-thumb-amber-500/20">
            {activeTab === 'User Dashboard' && <BookingManagementDashboard />}
            
            {activeTab === 'Route Management' && <RouteManagement />}
            
            {activeTab === 'Driver Management' && <DriverManagement />}
            {activeTab === 'Bills' && (
              <div className="max-w-[1600px] mx-auto space-y-6">
                 <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                   <Receipt className="h-6 w-6 text-amber-500" /> Bill Management
                 </h2>
                 <BillsList />
              </div>
            )}
            {activeTab === 'SEO Management' && <SEOManagement />}
            {activeTab === 'Coupons' && <CouponManagement />}
            {activeTab === 'Vehicles' && <VehicleManagement />}
            
            {activeTab === 'Settings' && (
               <div className="max-w-4xl mx-auto bg-slate-800 p-6 md:p-8 rounded-xl border border-slate-700">
                  <h3 className="text-2xl font-bold text-white mb-1">System Settings</h3>
                  <p className="text-slate-400 mb-6">General application settings configuration.</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <button
                       onClick={() => router.push('/admin/settings/seo/sitemap')}
                       className="text-left p-5 rounded-xl border border-slate-700 bg-slate-900 hover:border-amber-500/50 hover:bg-slate-900/70 transition-all group"
                     >
                        <FileCode className="w-6 h-6 text-amber-500 mb-3" />
                        <p className="font-semibold text-white group-hover:text-amber-400 transition-colors">Sitemap Settings</p>
                        <p className="text-sm text-slate-400 mt-1">Manage XML sitemap generation for SEO.</p>
                     </button>

                     <button
                       onClick={() => router.push('/admin/settings/marketing-integrations')}
                       className="text-left p-5 rounded-xl border border-slate-700 bg-slate-900 hover:border-amber-500/50 hover:bg-slate-900/70 transition-all group"
                     >
                        <Megaphone className="w-6 h-6 text-amber-500 mb-3" />
                        <p className="font-semibold text-white group-hover:text-amber-400 transition-colors">Marketing & Analytics Integration</p>
                        <p className="text-sm text-slate-400 mt-1">Paste Search Console, GTM, Google Ads & custom scripts.</p>
                     </button>
                  </div>
               </div>
            )}

            {/* Placeholder for future modules */}
            {['Local Services', 'Airport Services'].includes(activeTab) && (
               <div className="flex flex-col items-center justify-center h-[70vh] text-slate-500 bg-[#1e293b]/20 rounded-2xl border-2 border-dashed border-slate-700">
                  <h3 className="text-2xl font-bold text-slate-300 mb-2">{activeTab}</h3>
                  <p className="max-w-md text-center text-sm">This module is currently under development.</p>
               </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
