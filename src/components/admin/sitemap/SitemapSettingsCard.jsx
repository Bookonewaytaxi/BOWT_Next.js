import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Settings, Save } from 'lucide-react';

export default function SitemapSettingsCard({ settings, onSave, loading }) {
  const [formData, setFormData] = useState({
    sitemap_enabled: true,
    auto_regenerate: false,
    regeneration_frequency: 'weekly'
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        sitemap_enabled: settings.sitemap_enabled ?? true,
        auto_regenerate: settings.auto_regenerate ?? false,
        regeneration_frequency: settings.regeneration_frequency ?? 'weekly'
      });
    }
  }, [settings]);

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <Card className="bg-slate-900 border-slate-800 p-6 shadow-lg h-full flex flex-col">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="w-5 h-5 text-slate-400" />
        <h3 className="text-lg font-semibold text-white">Configuration</h3>
      </div>

      <div className="space-y-8 flex-1">
        {/* Main Enable Switch */}
        <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg border border-slate-800">
          <div className="space-y-1">
            <Label className="text-base font-medium text-white">Enable Sitemap</Label>
            <p className="text-xs text-slate-400">Make sitemap available publicly</p>
          </div>
          <Switch 
            checked={formData.sitemap_enabled}
            onCheckedChange={(c) => handleChange('sitemap_enabled', c)}
            className="data-[state=checked]:bg-emerald-500"
          />
        </div>

        {/* Auto Regeneration */}
        <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg border border-slate-800">
          <div className="space-y-1">
            <Label className="text-base font-medium text-white">Auto Regeneration</Label>
            <p className="text-xs text-slate-400">Update sitemap automatically on schedule</p>
          </div>
          <Switch 
            checked={formData.auto_regenerate}
            onCheckedChange={(c) => handleChange('auto_regenerate', c)}
            className="data-[state=checked]:bg-amber-500"
          />
        </div>

        {/* Frequency */}
        <div className={`p-4 rounded-lg border border-slate-800 ${!formData.auto_regenerate ? 'opacity-50 pointer-events-none bg-slate-900' : 'bg-slate-800/30'}`}>
          <Label className="text-sm font-medium text-slate-300 mb-4 block">Regeneration Frequency</Label>
          <RadioGroup 
            value={formData.regeneration_frequency}
            onValueChange={(v) => handleChange('regeneration_frequency', v)}
            className="grid grid-cols-3 gap-4"
          >
            {['daily', 'weekly', 'monthly'].map((freq) => (
              <div key={freq}>
                <RadioGroupItem value={freq} id={freq} className="peer sr-only" />
                <Label
                  htmlFor={freq}
                  className="flex flex-col items-center justify-center rounded-md border-2 border-slate-700 bg-slate-800 p-3 hover:bg-slate-700 hover:text-white peer-data-[state=checked]:border-amber-500 peer-data-[state=checked]:text-amber-500 cursor-pointer transition-all"
                >
                  <span className="capitalize font-semibold">{freq}</span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-slate-800">
        <Button 
          onClick={handleSave} 
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6"
        >
          {loading ? (
            <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> Saving...</span>
          ) : (
            <span className="flex items-center gap-2"><Save className="w-4 h-4" /> Save Configuration</span>
          )}
        </Button>
      </div>
    </Card>
  );
}