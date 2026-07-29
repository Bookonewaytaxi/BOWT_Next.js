import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useToast } from '@/components/ui/use-toast';
import BackButton from '@/components/admin/BackButton';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

import SitemapStatusCard from '@/components/admin/sitemap/SitemapStatusCard';
import SitemapStatisticsCard from '@/components/admin/sitemap/SitemapStatisticsCard';
import SitemapSettingsCard from '@/components/admin/sitemap/SitemapSettingsCard';

import { 
  getSitemapSettings, 
  getSitemapStatistics, 
  regenerateSitemap, 
  updateSitemapSettings,
  downloadSitemap
} from '@/utils/sitemapUtils';

export default function SitemapSettingsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [regenerating, setRegenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [settings, setSettings] = useState(null);
  const [stats, setStats] = useState({ citiesCount: 0, routesCount: 0, filesCount: 0, files: [] });
  const [lastResult, setLastResult] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [settingsData, statsData] = await Promise.all([
        getSitemapSettings(),
        getSitemapStatistics()
      ]);
      setSettings(settingsData);
      setStats(statsData);
    } catch (err) {
      console.error(err);
      setError('Failed to load sitemap configuration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      const result = await regenerateSitemap();
      setLastResult(result);
      setSettings(result.settings);
      toast({
        title: "Sitemap Regenerated",
        description: `Indexed ${result.routeCount ?? '?'} routes and ${result.cityCount ?? '?'} cities.`,
        variant: "default", // Success uses default with standard styling in shadcn usually, or specific if configured
        className: "bg-green-600 text-white border-green-700"
      });
      // Refresh the DB-backed stats too, in case they now differ from the estimate
      const statsData = await getSitemapStatistics();
      setStats(statsData);
    } catch (err) {
      toast({
        title: "Regeneration Failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setRegenerating(false);
    }
  };

  const handleDownload = async () => {
    try {
      await downloadSitemap();
      toast({
        title: "Download Started",
        description: "Your sitemap files are being downloaded.",
      });
    } catch (err) {
      toast({
        title: "Download Failed",
        description: "Could not download the sitemap file.",
        variant: "destructive",
      });
    }
  };

  const handleSaveSettings = async (newSettings) => {
    setSaving(true);
    try {
      const updated = await updateSitemapSettings(newSettings);
      setSettings(updated);
      toast({
        title: "Settings Saved",
        description: "Your sitemap configuration has been updated.",
        className: "bg-blue-600 text-white border-blue-700"
      });
    } catch (err) {
      toast({
        title: "Save Failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-[#0f172a] p-8 flex items-center justify-center">
        <div className="bg-red-900/20 border border-red-500/30 p-8 rounded-xl text-center flex flex-col items-center max-w-md">
          <div className="bg-red-900/30 p-4 rounded-full mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Error Loading Settings</h3>
          <p className="text-red-400 mb-6">{error}</p>
          <div className="flex gap-4">
             <BackButton to="/admin" label="Go Back" />
             <Button onClick={fetchData} variant="outline" className="border-red-500 text-red-500 hover:bg-red-950">Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Sitemap Settings | Admin Dashboard</title>
        <meta name="description" content="Manage XML sitemaps for SEO" />
      </Head>
      
      <div className="min-h-screen bg-[#0f172a] p-4 md:p-8 pb-20">
        <div className="max-w-[1600px] mx-auto">
          
          <div className="mb-8">
            <BackButton to="/admin" label="Back to Dashboard" />
            <div className="mt-6">
               <h1 className="text-3xl font-bold text-white tracking-tight">Sitemap Settings</h1>
               <p className="text-slate-400 mt-1">Manage XML sitemaps generation, frequency, and status for SEO optimization</p>
            </div>
          </div>

          {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-pulse">
                <div className="h-64 bg-slate-900 rounded-xl"></div>
                <div className="h-64 bg-slate-900 rounded-xl"></div>
                <div className="h-64 bg-slate-900 rounded-xl"></div>
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {/* Column 1: Status & Actions */}
              <div className="xl:col-span-1 h-full">
                <SitemapStatusCard 
                  settings={settings}
                  isRegenerating={regenerating}
                  onRegenerate={handleRegenerate}
                  onDownload={handleDownload}
                  lastResult={lastResult}
                />
              </div>

              {/* Column 2: Statistics */}
              <div className="xl:col-span-1 h-full">
                <SitemapStatisticsCard 
                  stats={stats}
                  loading={loading}
                />
              </div>

              {/* Column 3: Configuration */}
              <div className="xl:col-span-1 h-full">
                <SitemapSettingsCard 
                  settings={settings}
                  onSave={handleSaveSettings}
                  loading={saving}
                />
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
