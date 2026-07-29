import React, { useEffect, useState } from 'react';
import { runRouteDiagnostics } from '@/utils/routeDiagnostics';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, AlertTriangle, CheckCircle, Search, Download, RefreshCw, ArrowLeft, ShieldAlert, FileText } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/ui/use-toast';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import * as XLSX from 'xlsx';

export default function RouteDiagnosticsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredRoutes, setFilteredRoutes] = useState([]);

  useEffect(() => {
    fetchDiagnostics();
  }, []);

  useEffect(() => {
    if (report?.routes) {
      const lowerTerm = searchTerm.toLowerCase();
      const filtered = report.routes.filter(r => 
        r.from_city?.toLowerCase().includes(lowerTerm) || 
        r.to_city?.toLowerCase().includes(lowerTerm) ||
        r.slug?.toLowerCase().includes(lowerTerm) ||
        r.id?.includes(lowerTerm)
      );
      setFilteredRoutes(filtered);
    }
  }, [searchTerm, report]);

  const fetchDiagnostics = async () => {
    setLoading(true);
    try {
      const data = await runRouteDiagnostics();
      setReport(data);
      setFilteredRoutes(data.routes);
      toast({
        title: "Diagnostics Completed",
        description: `Analyzed ${data.summary.total_routes} routes successfully.`
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Diagnostics Failed",
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!report) return;
    
    // Create detailed export data
    const exportData = report.routes.map(r => ({
       ID: r.id,
       From: r.from_city,
       To: r.to_city,
       Slug: r.slug,
       Created: new Date(r.created_at).toLocaleDateString(),
       SedanPrice: r.sedan_price,
       SUVPrice: r.suv_price,
       HasIssues: report.integrity_issues.some(i => i.id === r.id) ? 'YES' : 'NO'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Route_Diagnostics");
    XLSX.writeFile(wb, `route_diagnostics_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  const isDuplicate = (slug) => {
    return report?.duplicate_slugs.some(d => d.slug === slug);
  };

  const hasIssue = (id) => {
    return report?.integrity_issues.some(i => i.id === id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 text-amber-500 animate-spin" />
          <p className="text-slate-500 font-medium">Running system diagnostics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <Link href="/admin" className="text-amber-500 hover:text-amber-400 flex items-center gap-2 mb-2 text-sm font-bold uppercase tracking-wider">
              <ArrowLeft className="h-4 w-4" /> Back to Dashboard
            </Link>
            <h1 className="text-3xl font-black text-white flex items-center gap-3">
              <ShieldAlert className="h-8 w-8 text-amber-500" />
              Route Diagnostics & Recovery
            </h1>
            <p className="text-slate-400 mt-2">System health check generated at {new Date(report.timestamp).toLocaleString()}</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={fetchDiagnostics} variant="outline" className="border-slate-600 text-slate-300 hover:text-white hover:bg-slate-800">
              <RefreshCw className="h-4 w-4 mr-2" /> Refresh
            </Button>
            <Button onClick={handleExport} className="bg-green-600 hover:bg-green-700 text-white font-bold">
              <Download className="h-4 w-4 mr-2" /> Export Report
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <p className="text-slate-400 text-xs font-bold uppercase mb-1">Total Routes</p>
            <p className="text-3xl font-black text-white">{report.summary.total_routes}</p>
          </div>
          <div className={`p-6 rounded-xl border ${report.summary.duplicate_slugs_count > 0 ? 'bg-red-500/10 border-red-500/30' : 'bg-slate-800 border-slate-700'}`}>
            <p className="text-slate-400 text-xs font-bold uppercase mb-1">Duplicate Slugs</p>
            <p className={`text-3xl font-black ${report.summary.duplicate_slugs_count > 0 ? 'text-red-500' : 'text-green-500'}`}>
              {report.summary.duplicate_slugs_count}
            </p>
          </div>
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <p className="text-slate-400 text-xs font-bold uppercase mb-1">Ahmedabad Routes</p>
            <p className="text-3xl font-black text-blue-400">{report.summary.ahmedabad_routes}</p>
          </div>
          <div className={`p-6 rounded-xl border ${report.summary.vadodara_routes === 0 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-800 border-slate-700'}`}>
            <p className="text-slate-400 text-xs font-bold uppercase mb-1">Vadodara Routes</p>
            <div className="flex items-end gap-2">
              <p className={`text-3xl font-black ${report.summary.vadodara_routes === 0 ? 'text-amber-500' : 'text-blue-400'}`}>
                {report.summary.vadodara_routes}
              </p>
              {report.summary.vadodara_routes === 0 && <span className="text-amber-500 text-xs font-bold mb-1">⚠ Missing</span>}
            </div>
          </div>
        </div>

        {/* Integrity Issues Banner */}
        {report.integrity_issues.length > 0 && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 mb-8">
            <h3 className="text-red-400 font-bold text-lg mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" /> Data Integrity Issues Detected
            </h3>
            <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-2">
              {report.integrity_issues.map((issue, idx) => (
                <div key={idx} className="flex items-start gap-3 text-sm text-red-300/80 bg-red-500/5 p-2 rounded">
                  <span className="font-mono text-xs bg-red-500/20 px-2 py-0.5 rounded text-red-300">{issue.type}</span>
                  <span>{issue.details}</span>
                  {issue.id !== 'SYSTEM_ALERT' && <span className="text-xs text-slate-500 ml-auto font-mono">{issue.id}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Duplicate Details */}
        {report.duplicate_slugs.length > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6 mb-8">
             <h3 className="text-amber-500 font-bold text-lg mb-4 flex items-center gap-2">
               <FileText className="h-5 w-5" /> Duplicate Slugs Detected
             </h3>
             <div className="grid gap-4">
                {report.duplicate_slugs.map((dup, i) => (
                   <div key={i} className="bg-slate-900/50 p-4 rounded-lg border border-amber-500/30">
                      <p className="text-amber-400 font-mono text-sm mb-2">/{dup.slug}</p>
                      <div className="grid grid-cols-2 gap-4 text-xs text-slate-400">
                         <div className="bg-slate-800 p-2 rounded">Conflict A: {dup.route_1}</div>
                         <div className="bg-slate-800 p-2 rounded">Conflict B: {dup.route_2}</div>
                      </div>
                   </div>
                ))}
             </div>
          </div>
        )}

        {/* Search & Filter */}
        <div className="flex items-center gap-4 bg-slate-800 p-4 rounded-xl border border-slate-700 mb-6 sticky top-4 z-10 shadow-xl">
           <Search className="h-5 w-5 text-slate-400" />
           <Input 
              placeholder="Search by city, slug, or ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none text-white focus-visible:ring-0 placeholder:text-slate-500 text-lg"
           />
           <div className="text-sm text-slate-400 font-mono whitespace-nowrap">
              {filteredRoutes.length} found
           </div>
        </div>

        {/* Routes Table */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
             <table className="w-full text-left text-sm">
                <thead>
                   <tr className="bg-slate-900/50 text-slate-400 uppercase tracking-wider text-xs border-b border-slate-700">
                      <th className="p-4 font-bold">Route Info</th>
                      <th className="p-4 font-bold">Slug / URL</th>
                      <th className="p-4 font-bold">Pricing</th>
                      <th className="p-4 font-bold">Status</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                   {filteredRoutes.slice(0, 100).map((route) => {
                      const isDup = isDuplicate(route.slug);
                      const hasErr = hasIssue(route.id);
                      
                      return (
                         <tr key={route.id} className={`hover:bg-slate-700/50 transition-colors ${isDup ? 'bg-red-500/5' : ''}`}>
                            <td className="p-4">
                               <div className="font-bold text-white">{route.from_city} <span className="text-slate-500">→</span> {route.to_city}</div>
                               <div className="text-xs text-slate-500 font-mono mt-1">{route.id}</div>
                            </td>
                            <td className="p-4">
                               <div className={`font-mono text-xs px-2 py-1 rounded inline-block ${isDup ? 'bg-red-500/20 text-red-300' : 'bg-slate-900 text-slate-300'}`}>
                                  /{route.slug}
                               </div>
                            </td>
                            <td className="p-4">
                               <div className="flex flex-col gap-1 text-xs text-slate-400">
                                  <span>Sedan: <span className="text-white">₹{route.sedan_price}</span></span>
                                  <span>SUV: <span className="text-white">₹{route.suv_price}</span></span>
                               </div>
                            </td>
                            <td className="p-4">
                               {hasErr ? (
                                  <span className="flex items-center gap-1 text-red-400 text-xs font-bold uppercase">
                                     <AlertTriangle className="h-3 w-3" /> Issue
                                  </span>
                               ) : (
                                  <span className="flex items-center gap-1 text-green-500 text-xs font-bold uppercase">
                                     <CheckCircle className="h-3 w-3" /> Active
                                  </span>
                               )}
                            </td>
                         </tr>
                      );
                   })}
                   {filteredRoutes.length === 0 && (
                      <tr>
                         <td colSpan={4} className="p-8 text-center text-slate-500">
                            No routes match your search
                         </td>
                      </tr>
                   )}
                </tbody>
             </table>
          </div>
          {filteredRoutes.length > 100 && (
             <div className="p-4 text-center text-xs text-slate-500 border-t border-slate-700 bg-slate-900/30">
                Showing first 100 of {filteredRoutes.length} results. Use search to filter.
             </div>
          )}
        </div>
      </div>
    </div>
  );
}