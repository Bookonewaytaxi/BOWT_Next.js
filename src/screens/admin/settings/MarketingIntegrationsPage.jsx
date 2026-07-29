import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import BackButton from '@/components/admin/BackButton';
import { Save, Loader2, AlertTriangle, ShieldCheck, BarChart3, Target, Code2 } from 'lucide-react';
import {
  getMarketingIntegrations,
  updateMarketingIntegrations
} from '@/utils/marketingIntegrationsUtils';
import { injectRawHtml } from '@/utils/headScriptInjector';

const FIELDS = [
  {
    key: 'search_console_code',
    label: 'Google Search Console Verification Code',
    icon: ShieldCheck,
    description: 'Paste the meta tag Google gives you for the "HTML tag" verification method.',
    placeholder: '<meta name="google-site-verification" content="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" />',
    rows: 3
  },
  {
    key: 'ga_gtm_code',
    label: 'Google Analytics / Google Tag Manager (GTM) Code',
    icon: BarChart3,
    description: 'Paste the full <script> snippet Google gives you for GA4 or GTM.',
    placeholder: '<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX"></script>\n<script>...</script>',
    rows: 6
  },
  {
    key: 'google_ads_code',
    label: 'Google Ads Conversion / Tracking Script',
    icon: Target,
    description: 'Paste your Google Ads global site tag or conversion tracking snippet.',
    placeholder: '<script>\n  gtag(\'config\', \'AW-XXXXXXXXX\');\n</script>',
    rows: 6
  },
  {
    key: 'custom_script_code',
    label: 'Custom Global Script Box',
    icon: Code2,
    description: 'Anything else - chat widgets, Meta/Facebook Pixel, LinkedIn Insight Tag, etc.',
    placeholder: '<script>\n  // any other pixel or widget code\n</script>',
    rows: 6
  }
];

export default function MarketingIntegrationsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [values, setValues] = useState({});

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMarketingIntegrations();
      setValues(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load saved settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (key, value) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await updateMarketingIntegrations(values);
      setValues(updated);

      // Apply immediately on this page load too, so the admin sees it take
      // effect without needing to refresh the whole site.
      injectRawHtml('gsc-verification', updated.search_console_code);
      injectRawHtml('ga-gtm', updated.ga_gtm_code);
      injectRawHtml('google-ads', updated.google_ads_code);
      injectRawHtml('custom-script', updated.custom_script_code);

      toast({
        title: 'Configuration Saved',
        description: 'Your marketing & analytics codes are now live on every public page.',
        className: 'bg-green-600 text-white border-green-700'
      });
    } catch (err) {
      toast({
        title: 'Save Failed',
        description: err.message,
        variant: 'destructive'
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
            <Button onClick={fetchData} variant="outline" className="border-red-500 text-red-500 hover:bg-red-950">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Marketing & Analytics Integration | Admin Dashboard</title>
        <meta name="description" content="Manage Google Search Console, Analytics, Ads and custom tracking scripts" />
      </Head>

      <div className="min-h-screen bg-[#0f172a] p-4 md:p-8 pb-24">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <BackButton to="/admin" label="Back to Dashboard" />
            <div className="mt-6">
              <h1 className="text-3xl font-bold text-white tracking-tight">Marketing & Analytics Integration</h1>
              <p className="text-slate-400 mt-1">
                Paste verification and tracking codes here - no code changes or redeploys needed. Saved codes
                are injected into the &lt;head&gt; of every public page automatically.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="space-y-6 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-40 bg-slate-900 rounded-xl"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {FIELDS.map((field) => {
                const Icon = field.icon;
                return (
                  <Card key={field.key} className="bg-slate-900 border-slate-800 p-6">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="bg-slate-800 p-2 rounded-lg text-amber-500 shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <Label htmlFor={field.key} className="text-white font-semibold text-base">
                          {field.label}
                        </Label>
                        <p className="text-sm text-slate-400 mt-0.5">{field.description}</p>
                      </div>
                    </div>
                    <Textarea
                      id={field.key}
                      value={values[field.key] || ''}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      rows={field.rows}
                      className="bg-slate-950 border-slate-700 text-slate-200 font-mono text-sm focus-visible:ring-amber-500"
                    />
                  </Card>
                );
              })}

              <div className="sticky bottom-4 flex justify-end pt-2">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-amber-500 hover:bg-amber-600 text-white font-semibold shadow-lg shadow-amber-500/20 px-8 py-6 text-base"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" /> Save Configuration
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
