import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  Plus, Search, Edit2, Trash2, MapPin, Loader2, RefreshCw, Eye, Sparkles, HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from '@/components/ui/use-toast';
import { useRouteManagement } from '@/hooks/useRouteManagement';
import { cn } from '@/lib/utils';
import RouteImportButton from './routes/RouteImportButton';
import RouteImportModal from './routes/RouteImportModal';
import RouteImportReport from './routes/RouteImportReport';
import { processRoutesImport } from '@/utils/RouteImportService';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { 
  generateSEOTitle, 
  generateMetaDescription, 
  generateKeywords,
  generateSEOContent
} from '@/utils/seoGeneratorService';
import { loadActiveSeoConfig } from '@/lib/seo/metaTemplates';
import { triggerAutoRegenerateIfEnabled } from '@/utils/sitemapUtils';

export default function RouteManagement() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const { fetchRoutes, deleteRoute } = useRouteManagement();
  
  const [routes, setRoutes] = useState([]);
  const [filteredRoutes, setFilteredRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); 
  const [deleteId, setDeleteId] = useState(null);

  // Import State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importReport, setImportReport] = useState(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [autoFillingSEO, setAutoFillingSEO] = useState(false);
  const [regeneratingContent, setRegeneratingContent] = useState(false);

  const loadRoutes = async () => {
    setLoading(true);
    const { success, data } = await fetchRoutes();
    if (success) {
      setRoutes(data);
      setFilteredRoutes(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadRoutes();
  }, []);

  useEffect(() => {
    let result = routes;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(route => 
        route.from_city.toLowerCase().includes(query) || 
        route.to_city.toLowerCase().includes(query)
      );
    }
    if (statusFilter !== 'all') {
      const isActive = statusFilter === 'active';
      result = result.filter(route => route.is_active === isActive);
    }
    setFilteredRoutes(result);
  }, [searchQuery, statusFilter, routes]);

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    const { success, error } = await deleteRoute(deleteId);
    if (success) {
      setRoutes(prev => prev.filter(r => r.id !== deleteId));
      triggerAutoRegenerateIfEnabled('route_deleted');
      toast({ title: "Route deleted successfully", className: "bg-green-600 text-white" });
    } else {
      toast({ variant: "destructive", title: "Delete Failed", description: error?.message });
    }
    setDeleteId(null);
  };

  const handleImportComplete = async (parsedData, fileName) => {
    setIsImportModalOpen(false);
    toast({ title: "Processing Import", description: "Please wait while we process the records..." });
    
    try {
      const report = await processRoutesImport(parsedData, user?.id);
      setImportReport(report);
      setIsReportOpen(true);
      if (report.createdCount > 0 || report.updatedCount > 0) {
        loadRoutes();
        triggerAutoRegenerateIfEnabled('bulk_import');
      }
    } catch (error) {
      console.error("Import error", error);
      toast({ 
        variant: "destructive", 
        title: "Import Failed", 
        description: error.message || "An unexpected error occurred during import." 
      });
    }
  };

  const handleAutoFillSEO = async () => {
    setAutoFillingSEO(true);
    let updatedCount = 0;
    
    try {
      // 1. Filter routes that need SEO
      const routesToUpdate = routes.filter(r => !r.seo_title || !r.seo_description || !r.seo_keywords || r.seo_keywords.length === 0);
      
      if (routesToUpdate.length === 0) {
        toast({ title: "SEO Up to Date", description: "All routes already have SEO data.", className: "bg-green-600 text-white" });
        setAutoFillingSEO(false);
        return;
      }

      toast({ title: "Auto-Filling SEO", description: `Generating SEO for ${routesToUpdate.length} routes...` });

      // Loaded once for the whole batch, not per-route — a single small
      // query, not N queries. Returns {} if no templates are configured
      // yet, in which case every generate call below falls back to its
      // original hardcoded behavior, unchanged.
      const seoConfig = await loadActiveSeoConfig();

      // 2. Process updates
      for (const route of routesToUpdate) {
        const updates = {};
        const price = route.sedan_price || route.route_price || 0;
        
        if (!route.seo_title) updates.seo_title = generateSEOTitle(route.from_city, route.to_city, price, seoConfig.meta_title);
        if (!route.seo_description) updates.seo_description = generateMetaDescription(route.from_city, route.to_city, seoConfig.meta_description);
        if (!route.seo_keywords || route.seo_keywords.length === 0) updates.seo_keywords = generateKeywords(route.from_city, route.to_city, price, seoConfig.keywords);
        if (!route.seo_content) updates.seo_content = generateSEOContent(route.from_city, route.to_city, route.distance_km || '0', price, seoConfig.seo_content);

        if (Object.keys(updates).length > 0) {
          updates.updated_at = new Date().toISOString();
          
          const { error } = await supabase.from('routes').update(updates).eq('id', route.id);
          if (!error) updatedCount++;
        }
      }

      toast({ title: "SEO Update Complete", description: `Updated SEO for ${updatedCount} routes.`, className: "bg-green-600 text-white" });
      if (updatedCount > 0) triggerAutoRegenerateIfEnabled('bulk_seo_update');
      loadRoutes();
    } catch (error) {
      console.error("SEO Autofill Error", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to auto-fill SEO data." });
    } finally {
      setAutoFillingSEO(false);
    }
  };

  const handleRegenerateAllContentEnglish = async () => {
    setRegeneratingContent(true);
    let updatedCount = 0;
    try {
      toast({ title: "Regenerating Content", description: `Updating page content for ${routes.length} routes to English...` });

      for (const route of routes) {
        const price = route.sedan_price || route.route_price || 0;
        const newContent = generateSEOContent(route.from_city, route.to_city, route.distance_km || '0', price);

        const { error } = await supabase.from('routes').update({
          seo_content: newContent,
          seo_content_language: 'english',
          content_last_updated: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }).eq('id', route.id);

        if (!error) updatedCount++;
      }

      toast({ title: "Content Regeneration Complete", description: `Updated ${updatedCount} of ${routes.length} routes to English.`, className: "bg-green-600 text-white" });
      loadRoutes();
    } catch (error) {
      console.error("Content Regeneration Error", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to regenerate content." });
    } finally {
      setRegeneratingContent(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search by city..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-slate-950 border-slate-800 w-full"
            />
          </div>
          <div className="flex gap-2 shrink-0">
            <Button variant={statusFilter === 'all' ? 'secondary' : 'outline'} onClick={() => setStatusFilter('all')} className="h-9 text-xs whitespace-nowrap">All</Button>
            <Button variant={statusFilter === 'active' ? 'secondary' : 'outline'} onClick={() => setStatusFilter('active')} className="h-9 text-xs text-green-500 whitespace-nowrap">Active</Button>
            <Button variant={statusFilter === 'inactive' ? 'secondary' : 'outline'} onClick={() => setStatusFilter('inactive')} className="h-9 text-xs text-red-500 whitespace-nowrap">Inactive</Button>
          </div>
          <Button variant="outline" size="icon" onClick={loadRoutes} disabled={loading} className="border-slate-700 text-slate-200 shrink-0 ml-auto sm:ml-0">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-slate-800 pt-4">
          <Button 
            variant="outline" 
            onClick={handleAutoFillSEO} 
            disabled={autoFillingSEO || loading}
            className="bg-purple-900/30 border-purple-800 text-purple-300 hover:bg-purple-900/50 whitespace-nowrap"
          >
            {autoFillingSEO ? <Loader2 className="w-4 h-4 animate-spin mr-2 shrink-0" /> : <Sparkles className="w-4 h-4 mr-2 shrink-0" />}
            Auto-fill SEO
          </Button>

          <Button 
            variant="outline" 
            onClick={handleRegenerateAllContentEnglish} 
            disabled={regeneratingContent || loading}
            className="bg-blue-900/30 border-blue-800 text-blue-300 hover:bg-blue-900/50 whitespace-nowrap"
          >
            {regeneratingContent ? <Loader2 className="w-4 h-4 animate-spin mr-2 shrink-0" /> : <Sparkles className="w-4 h-4 mr-2 shrink-0" />}
            Fix Content to English
          </Button>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center">
                    <RouteImportButton onClick={() => setIsImportModalOpen(true)} />
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-slate-800 text-slate-200 border-slate-700">
                <p>Upload CSV to bulk add routes</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button onClick={() => router.push('/admin/routes/create')} className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold whitespace-nowrap ml-auto">
            <Plus className="w-4 h-4 mr-2 shrink-0" /> Create New Route
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 flex justify-center items-center"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>
        ) : filteredRoutes.length === 0 ? (
          <div className="p-12 flex flex-col items-center text-center text-slate-500">
            <MapPin className="w-12 h-12 mb-4 opacity-20" />
            <h3 className="text-lg font-bold text-slate-300">No Routes Found</h3>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-slate-950/50 border-b border-slate-800 text-xs uppercase tracking-wider text-slate-400">
                  <th className="p-4 font-bold">From City</th>
                  <th className="p-4 font-bold">To City</th>
                  <th className="p-4 font-bold text-center">KM</th>
                  <th className="p-4 font-bold text-center">Sedan</th>
                  <th className="p-4 font-bold text-center">Ertiga</th>
                  <th className="p-4 font-bold text-center">Carens</th>
                  <th className="p-4 font-bold text-center">Crysta</th>
                  <th className="p-4 font-bold text-center">SEO</th>
                  <th className="p-4 font-bold text-center">Status</th>
                  <th className="p-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filteredRoutes.map((route) => (
                  <tr key={route.id} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 font-medium text-slate-200">{route.from_city}</td>
                    <td className="p-4 font-medium text-slate-200">{route.to_city}</td>
                    <td className="p-4 text-center text-slate-400">
                      {route.distance_km || '-'}
                    </td>
                    <td className="p-4 text-center font-mono text-emerald-400">
                      ₹{(route.sedan_price || 0).toLocaleString()}
                    </td>
                    <td className="p-4 text-center font-mono text-amber-400">
                      ₹{(route.ertiga_price || route.suv_ertiga_price || 0).toLocaleString()}
                    </td>
                    <td className="p-4 text-center font-mono text-blue-400">
                      ₹{(route.carens_price || route.kia_carens_price || 0).toLocaleString()}
                    </td>
                    <td className="p-4 text-center font-mono text-purple-400">
                      ₹{(route.innova_crysta_price || route.crysta_price || 0).toLocaleString()}
                    </td>
                    <td className="p-4 text-center">
                       {route.seo_title ? (
                         <Badge variant="outline" className="bg-green-900/10 text-green-500 border-green-900/30">OK</Badge>
                       ) : (
                         <Badge variant="outline" className="bg-red-900/10 text-red-500 border-red-900/30">Missing</Badge>
                       )}
                    </td>
                    <td className="p-4 text-center">
                      <Badge variant="outline" className={cn(
                        "uppercase text-[10px] tracking-wider border-0",
                        route.is_active ? "bg-green-900/30 text-green-500" : "bg-red-900/30 text-red-500"
                      )}>
                        {route.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => window.open(`/routes/${route.slug}`, '_blank')} 
                          className="h-8 w-8 hover:bg-slate-700 text-blue-400"
                          title="View Route"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => router.push(`/admin/routes/${route.id}/edit`)} 
                          className="h-8 w-8 hover:bg-slate-700 text-amber-500"
                          title="Edit Route"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => setDeleteId(route.id)} 
                          className="h-8 w-8 hover:bg-red-900/20 text-red-500"
                          title="Delete Route"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-slate-900 border-slate-800 text-slate-100">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              This will permanently delete this route. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-100">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modals */}
      <RouteImportModal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)} 
        onImportComplete={handleImportComplete}
      />

      <RouteImportReport 
        isOpen={isReportOpen} 
        onClose={() => setIsReportOpen(false)} 
        report={importReport}
      />
    </div>
  );
}
