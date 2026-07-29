import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useRouter } from 'next/router';
import { Search, Edit, BarChart } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function RouteSeoDashboard() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    setLoading(true);
    // Join routes with routes_seo
    const { data, error } = await supabase
      .from('routes')
      .select(`
        id, 
        from_city, 
        to_city, 
        routes_seo (
            id,
            slug,
            seo_score,
            focus_keyword,
            is_auto
        )
      `)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setRoutes(data);
    }
    setLoading(false);
  };

  const filteredRoutes = routes.filter(r => 
      r.from_city.toLowerCase().includes(filter.toLowerCase()) || 
      r.to_city.toLowerCase().includes(filter.toLowerCase())
  );

  const getScoreColor = (score) => {
      if (score >= 71) return 'bg-green-100 text-green-800';
      if (score >= 41) return 'bg-yellow-100 text-yellow-800';
      return 'bg-red-100 text-red-800';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">SEO Dashboard</h1>
        <div className="w-64 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
                placeholder="Search routes..." 
                className="pl-9 bg-slate-800 border-slate-700 text-white"
                value={filter}
                onChange={e => setFilter(e.target.value)}
            />
        </div>
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
         <table className="w-full text-left text-sm text-slate-300">
             <thead className="bg-slate-950 text-slate-400 font-medium border-b border-slate-800">
                 <tr>
                     <th className="p-4">Route</th>
                     <th className="p-4">SEO Score</th>
                     <th className="p-4">Focus Keyword</th>
                     <th className="p-4">Status</th>
                     <th className="p-4 text-right">Actions</th>
                 </tr>
             </thead>
             <tbody className="divide-y divide-slate-800">
                 {filteredRoutes.map(route => {
                     const seo = route.routes_seo?.[0] || {};
                     return (
                         <tr key={route.id} className="hover:bg-slate-800/50">
                             <td className="p-4 font-medium text-white">
                                 {route.from_city} to {route.to_city}
                             </td>
                             <td className="p-4">
                                 {seo.seo_score !== undefined ? (
                                     <span className={`px-2 py-1 rounded text-xs font-bold ${getScoreColor(seo.seo_score)}`}>
                                         {seo.seo_score}/100
                                     </span>
                                 ) : (
                                     <span className="text-slate-500">N/A</span>
                                 )}
                             </td>
                             <td className="p-4">
                                 {seo.focus_keyword || <span className="text-slate-600 italic">Missing</span>}
                             </td>
                             <td className="p-4">
                                 {seo.is_auto ? (
                                     <Badge variant="secondary" className="bg-blue-900/30 text-blue-400 border-0">Auto</Badge>
                                 ) : (
                                     <Badge variant="secondary" className="bg-purple-900/30 text-purple-400 border-0">Manual</Badge>
                                 )}
                             </td>
                             <td className="p-4 text-right">
                                 <Button 
                                     size="sm" 
                                     variant="outline" 
                                     className="border-slate-700 hover:bg-slate-700"
                                     onClick={() => router.push(`/admin/routes/${route.id}/seo`)}
                                 >
                                     <Edit className="w-4 h-4 mr-2" /> Edit SEO
                                 </Button>
                             </td>
                         </tr>
                     );
                 })}
             </tbody>
         </table>
      </div>
    </div>
  );
}