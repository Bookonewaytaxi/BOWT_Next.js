import React from 'react';
import { Card } from '@/components/ui/card';
import { MapPin, Navigation, FileCode } from 'lucide-react';
import SitemapFileList from './SitemapFileList';
import { Skeleton } from '@/components/ui/skeleton';

export default function SitemapStatisticsCard({ stats, loading }) {
  if (loading) {
    return (
      <Card className="bg-slate-900 border-slate-800 p-6 shadow-lg h-full">
        <Skeleton className="h-6 w-32 mb-6 bg-slate-800" />
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full bg-slate-800 rounded-lg" />)}
        </div>
        <Skeleton className="h-48 w-full bg-slate-800 rounded-lg" />
      </Card>
    );
  }

  return (
    <Card className="bg-slate-900 border-slate-800 p-6 shadow-lg h-full flex flex-col">
      <h3 className="text-lg font-semibold text-white mb-6">Statistics</h3>
      
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-800 flex flex-col items-center justify-center text-center hover:bg-slate-800 transition-colors">
          <MapPin className="w-5 h-5 text-blue-400 mb-2" />
          <span className="text-2xl font-bold text-white">{stats.citiesCount?.toLocaleString() || 0}</span>
          <span className="text-xs text-slate-400 uppercase">Cities</span>
        </div>
        
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-800 flex flex-col items-center justify-center text-center hover:bg-slate-800 transition-colors">
          <Navigation className="w-5 h-5 text-amber-400 mb-2" />
          <span className="text-2xl font-bold text-white">{stats.routesCount?.toLocaleString() || 0}</span>
          <span className="text-xs text-slate-400 uppercase">Routes</span>
        </div>
        
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-800 flex flex-col items-center justify-center text-center hover:bg-slate-800 transition-colors">
          <FileCode className="w-5 h-5 text-purple-400 mb-2" />
          <span className="text-2xl font-bold text-white">{stats.filesCount || 0}</span>
          <span className="text-xs text-slate-400 uppercase">Files</span>
        </div>
      </div>
      
      <div className="flex-1">
        <SitemapFileList files={stats.files} />
      </div>
    </Card>
  );
}