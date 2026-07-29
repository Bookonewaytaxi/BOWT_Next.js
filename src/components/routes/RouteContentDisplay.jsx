import React from 'react';
import { cn } from '@/lib/utils';
import { FileText, Car } from 'lucide-react';

export default function RouteContentDisplay({ route, className }) {
  if (!route?.seo_content) {
    return null;
  }

  // Helper to safely get and format price
  const getPrice = (key1, key2) => {
    const val = Number(route[key1] || route[key2]);
    return !isNaN(val) && val > 0 ? `₹${val.toLocaleString()}` : 'Contact for Price';
  };

  const sedanPrice = getPrice('sedan_price');
  const suvPrice = getPrice('ertiga_price', 'suv_ertiga_price');
  const suvPlusPrice = getPrice('carens_price', 'kia_carens_price');
  const premiumPrice = getPrice('innova_crysta_price', 'crysta_price');

  return (
    <section 
      className={cn(
        "bg-white rounded-2xl p-6 md:p-10 shadow-sm border border-slate-100 my-8",
        className
      )}
    >
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1">
          <div 
            className={cn(
              "prose prose-slate max-w-none",
              // Typography Styling
              "[&>h2]:text-2xl md:[&>h2]:text-3xl [&>h2]:mt-8 [&>h2]:mb-4 [&>h2]:text-slate-900 [&>h2]:font-bold [&>h2]:border-b [&>h2]:border-slate-100 [&>h2]:pb-2",
              "[&>h3]:text-xl md:[&>h3]:text-2xl [&>h3]:mt-6 [&>h3]:mb-3 [&>h3]:text-slate-800 [&>h3]:font-semibold",
              "[&>h4]:text-lg [&>h4]:mt-4 [&>h4]:mb-2 [&>h4]:text-slate-800 [&>h4]:font-semibold",
              "[&>p]:mb-4 [&>p]:leading-relaxed [&>p]:text-slate-600 [&>p]:text-base md:[&>p]:text-lg",
              
              // List Styling
              "[&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-6 [&>ul]:text-slate-600 [&>ul]:space-y-2",
              "[&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-6 [&>ol]:text-slate-600 [&>ol]:space-y-2",
              "[&>li]:mb-1",
              
              // Table styling
              "[&>table]:w-full [&>table]:border-collapse [&>table]:mb-6 [&>table]:border [&>table]:border-slate-200",
              "[&>table>thead>tr>th]:bg-slate-50 [&>table>thead>tr>th]:p-3 [&>table>thead>tr>th]:text-left [&>table>thead>tr>th]:font-semibold [&>table>thead>tr>th]:border-b [&>table>thead>tr>th]:border-slate-200",
              "[&>table>tbody>tr>td]:p-3 [&>table>tbody>tr>td]:border-b [&>table>tbody>tr>td]:border-slate-100 [&>table>tbody>tr:last-child>td]:border-0"
            )}
            dangerouslySetInnerHTML={{ __html: route.seo_content }} 
          />
        </div>

        {/* Sidebar Price Summary for SEO Context */}
        <div className="w-full md:w-80 shrink-0 hidden lg:block">
          <div className="bg-slate-50 rounded-xl p-6 sticky top-24 border border-slate-200">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Car className="w-5 h-5 text-amber-500" />
              Quick Fare Check
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="text-slate-600">Sedan (4+1)</span>
                <span className="font-bold text-slate-900">{sedanPrice}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="text-slate-600">SUV (6+1)</span>
                <span className="font-bold text-slate-900">{suvPrice}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="text-slate-600">SUV Plus (7+1)</span>
                <span className="font-bold text-slate-900">{suvPlusPrice}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Innova Crysta</span>
                <span className="font-bold text-slate-900">{premiumPrice}</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-200">
              <p className="text-xs text-slate-500 text-center">
                *Prices exclude toll tax & parking
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}