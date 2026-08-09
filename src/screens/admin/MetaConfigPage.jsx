import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, Save, History, RotateCcw, AlertCircle, CheckCircle2, Monitor, Smartphone } from 'lucide-react';
import {
  loadActiveSeoConfig,
  saveSeoConfigTemplate,
  getSeoConfigVersionHistory,
  rollbackSeoConfigToVersion,
  validatePlaceholders,
  renderTemplate,
} from '@/lib/seo/metaTemplates';
import { SEO_VARIABLES, SAMPLE_ROUTE_FOR_PREVIEW } from '@/lib/seo/seoVariableRegistry';

/**
 * The known template types today. Adding a future type (e.g. og_title,
 * twitter_title, canonical, h1) later is adding ONE entry here — the
 * database (seo_config.template_key is free-text, not an enum) already
 * supports it with zero schema change.
 */
const TEMPLATE_TYPES = [
  { key: 'meta_title', label: 'Meta Title', valueType: 'single_string', defaultMaxLength: 60 },
  { key: 'meta_description', label: 'Meta Description', valueType: 'single_string', defaultMaxLength: 160 },
  { key: 'keywords', label: 'Keywords (one per line)', valueType: 'string_list', defaultMaxLength: null },
  { key: 'seo_content', label: 'SEO Content (HTML)', valueType: 'html', defaultMaxLength: null },
];

export default function MetaConfigPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [selectedKey, setSelectedKey] = useState('meta_title');
  const [templateText, setTemplateText] = useState(''); // single string, or newline-joined for lists
  const [maxLength, setMaxLength] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const activeType = TEMPLATE_TYPES.find((t) => t.key === selectedKey);

  const loadCurrentTemplate = useCallback(async () => {
    setLoading(true);
    const config = await loadActiveSeoConfig('en', 'IN');
    const row = config[selectedKey];

    if (row) {
      setTemplateText(
        activeType.valueType === 'string_list' && Array.isArray(row.template_list)
          ? row.template_list.join('\n')
          : row.template_value || ''
      );
      setMaxLength(row.max_length || activeType.defaultMaxLength);
    } else {
      setTemplateText('');
      setMaxLength(activeType.defaultMaxLength);
    }
    setValidationError(null);
    setLoading(false);
  }, [selectedKey, activeType]);

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    const rows = await getSeoConfigVersionHistory(selectedKey, 'en', 'IN');
    setHistory(rows);
    setHistoryLoading(false);
  }, [selectedKey]);

  useEffect(() => {
    loadCurrentTemplate();
    loadHistory();
  }, [loadCurrentTemplate, loadHistory]);

  const handleTextChange = (value) => {
    setTemplateText(value);
    const validation = validatePlaceholders(value);
    setValidationError(
      validation.isValid
        ? null
        : `Invalid placeholder(s): ${validation.invalidPlaceholders.map((p) => `{{${p}}}`).join(', ')}`
    );
  };

  const handleSave = async () => {
    const validation = validatePlaceholders(templateText);
    if (!validation.isValid) {
      setValidationError(
        `Invalid placeholder(s): ${validation.invalidPlaceholders.map((p) => `{{${p}}}`).join(', ')}`
      );
      return;
    }

    setSaving(true);
    try {
      const isList = activeType.valueType === 'string_list';
      await saveSeoConfigTemplate({
        templateKey: selectedKey,
        languageCode: 'en',
        countryCode: 'IN',
        templateValue: isList ? null : templateText,
        templateList: isList
          ? templateText.split('\n').map((s) => s.trim()).filter(Boolean)
          : null,
        maxLength: maxLength,
      });
      toast({ title: 'Saved', description: `${activeType.label} template saved as a new version.`, className: 'bg-green-600 text-white' });
      loadHistory();
    } catch (err) {
      toast({ variant: 'destructive', title: 'Save failed', description: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleRollback = async (historyRowId) => {
    try {
      await rollbackSeoConfigToVersion(historyRowId);
      toast({ title: 'Rolled back', description: 'Previous version restored as the new active version.', className: 'bg-green-600 text-white' });
      loadCurrentTemplate();
      loadHistory();
    } catch (err) {
      toast({ variant: 'destructive', title: 'Rollback failed', description: err.message });
    }
  };

  // Live preview — rendered against sample data (Ahmedabad→Surat), since
  // this screen edits a shared template, not one specific route.
  const previewSource = activeType?.valueType === 'string_list'
    ? templateText.split('\n')[0] || ''
    : templateText;
  const previewRendered = renderTemplate(previewSource, SAMPLE_ROUTE_FOR_PREVIEW);
  const charCount = previewRendered.length;
  const overLimit = maxLength && charCount > maxLength;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="border-b border-slate-800 bg-slate-900 p-4 sticky top-0 z-10 flex items-center justify-between">
        <Button variant="ghost" className="text-slate-400 hover:text-white" onClick={() => router.push('/admin/seo-dashboard')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to SEO Dashboard
        </Button>
        <h1 className="text-lg font-bold">Meta Templates</h1>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <Card className="bg-slate-900 border-slate-800 p-6 space-y-4">
          <div>
            <Label className="text-slate-400 mb-2 block">Template Type</Label>
            <Select value={selectedKey} onValueChange={setSelectedKey}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TEMPLATE_TYPES.map((t) => (
                  <SelectItem key={t.key} value={t.key}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-slate-400 mb-2 block">
              Available placeholders: {SEO_VARIABLES.map((v) => (
                <code key={v.key} className="mx-1 text-xs bg-slate-800 px-1.5 py-0.5 rounded text-[#818cf8]">{`{{${v.key}}}`}</code>
              ))}
            </Label>
          </div>

          {loading ? (
            <p className="text-slate-500 text-sm">Loading template...</p>
          ) : (
            <>
              {activeType.valueType === 'html' ? (
                <Textarea
                  value={templateText}
                  onChange={(e) => handleTextChange(e.target.value)}
                  rows={10}
                  className="bg-slate-800 border-slate-700 text-white font-mono text-sm"
                  placeholder="<h2>{{from_city}} to {{to_city}} Taxi Service</h2>..."
                />
              ) : activeType.valueType === 'string_list' ? (
                <Textarea
                  value={templateText}
                  onChange={(e) => handleTextChange(e.target.value)}
                  rows={8}
                  className="bg-slate-800 border-slate-700 text-white font-mono text-sm"
                  placeholder={'{{from_city}} to {{to_city}} taxi\n{{from_city}} to {{to_city}} cab'}
                />
              ) : (
                <Input
                  value={templateText}
                  onChange={(e) => handleTextChange(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white"
                  placeholder="{{from_city}} to {{to_city}} Taxi | One Way Cab @ ₹{{price}}"
                />
              )}

              {validationError && (
                <div className="flex items-center gap-2 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" /> {validationError}
                </div>
              )}

              {activeType.valueType !== 'string_list' && (
                <div className="flex items-center justify-between text-sm">
                  <span className={overLimit ? 'text-red-400' : 'text-slate-500'}>
                    {charCount} / {maxLength || '—'} characters
                  </span>
                  {!overLimit && !validationError && templateText && (
                    <span className="flex items-center gap-1 text-green-400"><CheckCircle2 className="w-3.5 h-3.5" /> Looks good</span>
                  )}
                </div>
              )}

              <Button
                onClick={handleSave}
                disabled={saving || !!validationError}
                className="bg-[#667eea] hover:bg-[#5a67d8]"
              >
                <Save className="w-4 h-4 mr-2" /> {saving ? 'Saving...' : 'Save as New Version'}
              </Button>
            </>
          )}
        </Card>

        {/* Live Preview */}
        {activeType?.valueType !== 'string_list' && activeType?.valueType !== 'html' && (
          <Card className="bg-slate-900 border-slate-800 p-6 space-y-4">
            <h2 className="font-semibold text-slate-300">Live Preview <span className="text-xs text-slate-500 font-normal">(sample route: {SAMPLE_ROUTE_FOR_PREVIEW.from_city} → {SAMPLE_ROUTE_FOR_PREVIEW.to_city})</span></h2>

            <div className="bg-white text-slate-900 rounded-lg p-4">
              <p className="text-xs text-green-700 mb-1 truncate">bookonewaytaxi.in › routes › {SAMPLE_ROUTE_FOR_PREVIEW.from_city.toLowerCase()}-to-{SAMPLE_ROUTE_FOR_PREVIEW.to_city.toLowerCase()}-taxi</p>
              <p className="text-[#1a0dab] text-lg leading-snug">
                {selectedKey === 'meta_title' ? previewRendered : `${SAMPLE_ROUTE_FOR_PREVIEW.from_city} to ${SAMPLE_ROUTE_FOR_PREVIEW.to_city} Taxi`}
              </p>
              <p className="text-sm text-slate-600 mt-1">
                {selectedKey === 'meta_description' ? previewRendered : 'Meta description preview appears here.'}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="border border-slate-700 rounded-lg p-3">
                <p className="flex items-center gap-1.5 text-xs text-slate-400 mb-2"><Monitor className="w-3.5 h-3.5" /> Desktop (~60 chars)</p>
                <p className="text-sm text-slate-200">{previewRendered.slice(0, 60)}{previewRendered.length > 60 ? '…' : ''}</p>
              </div>
              <div className="border border-slate-700 rounded-lg p-3">
                <p className="flex items-center gap-1.5 text-xs text-slate-400 mb-2"><Smartphone className="w-3.5 h-3.5" /> Mobile (~78 chars)</p>
                <p className="text-sm text-slate-200">{previewRendered.slice(0, 78)}{previewRendered.length > 78 ? '…' : ''}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Version History */}
        <Card className="bg-slate-900 border-slate-800 p-6 space-y-3">
          <h2 className="font-semibold text-slate-300 flex items-center gap-2"><History className="w-4 h-4" /> Version History</h2>
          {historyLoading ? (
            <p className="text-slate-500 text-sm">Loading...</p>
          ) : history.length === 0 ? (
            <p className="text-slate-500 text-sm">No versions yet — this template has never been saved. The existing hardcoded generator is currently in use.</p>
          ) : (
            <ul className="space-y-2">
              {history.map((row) => (
                <li key={row.id} className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant={row.is_current ? 'default' : 'outline'} className={row.is_current ? 'bg-green-600' : ''}>
                      v{row.version_number}{row.is_current ? ' (active)' : ''}
                    </Badge>
                    <span className="text-slate-400 truncate max-w-xs">
                      {row.template_value || (row.template_list || []).join(', ')}
                    </span>
                  </div>
                  {!row.is_current && (
                    <Button size="sm" variant="ghost" onClick={() => handleRollback(row.id)} className="text-slate-400 hover:text-white">
                      <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Rollback
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
