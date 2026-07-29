import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useInquiries } from '@/hooks/useInquiries';
import InquiryFilters from '@/components/admin/inquiries/InquiryFilters';
import InquiryListTable from '@/components/admin/inquiries/InquiryListTable';
import InquiryPagination from '@/components/admin/inquiries/InquiryPagination';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import BackButton from '@/components/admin/BackButton'; // Import BackButton

export default function AdminInquiriesPage() {
  const { fetchInquiries, loading, error } = useInquiries();
  const [inquiries, setInquiries] = useState([]);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({});
  const [pagination, setPagination] = useState({ page: 1, limit: 20 });
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const loadData = async () => {
    console.log('AdminInquiriesPage: Loading data...');
    try {
      const { data, total: totalCount } = await fetchInquiries(pagination.page, pagination.limit, filters);
      
      // Ensure data is an array before setting state to prevent rendering crashes
      if (Array.isArray(data)) {
        setInquiries(data);
        setTotal(totalCount);
      } else {
        console.error('AdminInquiriesPage: Received non-array data', data);
        setInquiries([]);
        setTotal(0);
      }
    } catch (err) {
      console.error('AdminInquiriesPage: Critical error in loadData', err);
      setInquiries([]);
    } finally {
      setInitialLoadDone(true);
    }
  };

  useEffect(() => {
    loadData();
  }, [pagination.page, pagination.limit, filters]);

  const handleFilterChange = (newFilters) => {
    console.log('Filter changed:', newFilters);
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleLimitChange = (newLimit) => {
    setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }));
  };

  return (
    <>
      <Head>
        <title>Inquiry Management | Admin</title>
      </Head>
      
      <div className="min-h-screen bg-[#0f172a] p-4 md:p-8 pb-20">
        <div className="max-w-[1600px] mx-auto">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              {/* BackButton added here */}
              <BackButton to="/admin" label="Back to Dashboard" />
              <h1 className="text-3xl font-bold text-white tracking-tight mt-4">Inquiry Management</h1>
              <p className="text-slate-400 mt-1">Manage all customer inquiries and leads</p>
            </div>
            <Button 
              variant="outline" 
              onClick={loadData} 
              disabled={loading}
              className="bg-[#1e293b] border-slate-700 text-slate-300 hover:text-white hover:border-[#FFD700]"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> 
              {loading ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>

          {/* Error Boundary / Fallback UI for Filters */}
          <div className="mb-6">
             <InquiryFilters onFilterChange={handleFilterChange} />
          </div>

          {error ? (
            <div className="bg-red-900/20 border border-red-500/30 p-8 rounded-xl text-center flex flex-col items-center">
              <div className="bg-red-900/30 p-4 rounded-full mb-4">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Unable to Load Inquiries</h3>
              <p className="text-red-400 mb-6 max-w-md">{error}</p>
              <Button onClick={loadData} variant="destructive" className="px-8">Try Again</Button>
            </div>
          ) : (
            <div className="space-y-4">
              <InquiryListTable 
                inquiries={inquiries} 
                loading={loading && !initialLoadDone} // Show skeleton on initial load, overlay on refresh
              />
              
              <InquiryPagination 
                currentPage={pagination.page}
                itemsPerPage={pagination.limit}
                totalItems={total}
                onPageChange={handlePageChange}
                onLimitChange={handleLimitChange}
                loading={loading}
              />
            </div>
          )}

        </div>
      </div>
    </>
  );
}