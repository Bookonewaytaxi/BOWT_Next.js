import React from 'react';
import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, RefreshCw, Download, ExternalLink, CalendarClock, Activity, FileText, AlertTriangle } from 'lucide-react';
import { getSitemapViewUrl } from '@/utils/sitemapUtils';

const FREQUENCY_LABEL = {
  daily: 'Scheduled daily',
  weekly: 'Scheduled weekly',
  monthly: 'Scheduled monthly'
};

export default function SitemapStatusCard({ settings, isRegenerating, onRegenerate, onDownload, lastResult }) {
  const isEnabled = settings?.sitemap_enabled ?? true;

  const lastGeneratedDisplay = settings?.last_generated
    ? format(new Date(settings.last_generated), "MMM d, yyyy 'at' h:mm a")
    : 'Never generated yet';

  const nextUpdateDisplay = settings?.auto_regenerate
    ? FREQUENCY_LABEL[settings?.regeneration_frequency] || 'Scheduled'
    : 'Manual only (auto-regeneration off)';

  return (
    <Card className="bg-slate-900 border-slate-800 shadow-lg relative overflow-hidden h-full">
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-500/10 to-transparent blur-3xl rounded-full -mr-32 -mt-32 pointer-events-none"></div>

      <div className="p-6 flex flex-col h-full justify-between">
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Sitemap Status</h3>
            {isEnabled ? (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full border bg-emerald-500/10 border-emerald-500/30 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wide">Active</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full border bg-slate-500/10 border-slate-500/30 text-slate-400">
                <XCircle className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wide">Disabled</span>
              </div>
            )}
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-3">
              <div className="bg-slate-800 p-2 rounded-lg text-slate-400">
                <CalendarClock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Last Generated</p>
                <p className="text-white font-medium">{lastGeneratedDisplay}</p>
                <p className="text-xs text-slate-500 mt-1">
                  Next update: <span className="text-slate-400">{nextUpdateDisplay}</span>
                </p>
              </div>
            </div>

            {/* Stats from the most recent regeneration in this session */}
            {lastResult ? (
              <div className="bg-slate-950/50 rounded-lg p-3 border border-slate-800 text-sm space-y-2 animate-in fade-in duration-500">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <span className="text-emerald-400 font-medium flex items-center gap-2">
                    <Activity className="w-3 h-3" /> Latest Stats
                  </span>
                  <span className="text-[10px] text-slate-500">Just now</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Routes Indexed:</span>
                  <span className="text-white font-mono">{lastResult.routeCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Cities Indexed:</span>
                  <span className="text-white font-mono">{lastResult.cityCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Files Created:</span>
                  <span className="text-white font-mono">{lastResult.files?.length || 0}</span>
                </div>
                {lastResult.files?.length > 0 && (
                  <div className="pt-2 mt-2 border-t border-slate-800">
                    <p className="text-xs text-slate-500 mb-1">Generated Files:</p>
                    <div className="flex flex-wrap gap-2 max-h-20 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
                      {lastResult.files.map((f, i) => (
                        <span key={i} className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300 flex items-center gap-1 border border-slate-700">
                          <FileText className="w-3 h-3 text-blue-400" /> {f}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-950/30 rounded-lg p-4 border border-slate-800/50 text-center text-slate-500 text-sm flex flex-col items-center justify-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500/50" />
                <span>Ready to generate sitemap</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mt-auto">
          <Button
            onClick={onRegenerate}
            disabled={isRegenerating}
            className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-semibold shadow-lg shadow-amber-500/20 transition-all"
          >
            {isRegenerating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Generating...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" /> Regenerate Now
              </>
            )}
          </Button>

          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              className="flex-1 bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white"
              onClick={onDownload}
            >
              <Download className="w-4 h-4 mr-2" /> Download
            </Button>

            <Button
              variant="outline"
              className="flex-1 bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white"
              asChild
            >
              <a href={getSitemapViewUrl('sitemap.xml')} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" /> View
              </a>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
