import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ExternalLink, Search, Smartphone, Monitor } from 'lucide-react';

export default function RouteSeoPreviewModal({ isOpen, onClose, data, onEdit }) {
  if (!data) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0 gap-0 bg-slate-50">
        <div className="p-6 bg-white border-b">
          <DialogHeader>
             <DialogTitle>SEO Preview</DialogTitle>
          </DialogHeader>
        </div>
        
        <Tabs defaultValue="google" className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6 pt-4 bg-white border-b">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="google">Google Search Result</TabsTrigger>
              <TabsTrigger value="page">Page Preview</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="google" className="flex-1 p-6 overflow-y-auto">
             <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex items-center gap-2 mb-4">
                   <Search className="w-5 h-5 text-blue-500" />
                   <div className="h-4 w-32 bg-slate-100 rounded-full"></div>
                </div>
                
                {/* Desktop Result */}
                <div className="mb-8 font-sans">
                   <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
                      <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-xs">🌐</div>
                      <div className="flex flex-col leading-tight">
                         <span className="text-slate-900">One Way Taxi</span>
                         <span className="text-slate-500 text-xs">https://bookonewaytaxi.in › routes › {data.slug}</span>
                      </div>
                      <MoreDots />
                   </div>
                   <h3 className="text-xl text-[#1a0dab] hover:underline cursor-pointer truncate font-medium">
                      {data.meta_title || "One Way Taxi Service"}
                   </h3>
                   <p className="text-sm text-[#4d5156] mt-1 leading-relaxed line-clamp-2">
                      {data.meta_description || "Book your taxi now. Best rates and reliable service."}
                   </p>
                </div>

                {/* Mobile Result Preview */}
                <div className="border-t pt-6">
                   <p className="text-xs text-slate-400 mb-2 uppercase font-bold tracking-wider">Mobile View Simulator</p>
                   <div className="max-w-[320px] border-x border-t rounded-t-2xl p-4 bg-white shadow-xl mx-auto border-slate-200">
                      <div className="flex items-center gap-2 mb-2">
                         <div className="w-6 h-6 bg-slate-100 rounded-full"></div>
                         <div className="text-xs text-slate-500 truncate">bookonewaytaxi.in</div>
                      </div>
                      <h3 className="text-base text-[#1967d2] font-medium leading-snug mb-1">
                         {data.meta_title}
                      </h3>
                      <p className="text-xs text-slate-600 line-clamp-3">
                         {data.meta_description}
                      </p>
                   </div>
                </div>
             </div>
          </TabsContent>

          <TabsContent value="page" className="flex-1 p-0 overflow-hidden bg-white">
            <ScrollArea className="h-full">
               <div className="max-w-3xl mx-auto p-8 font-sans">
                  {/* Mock Header */}
                  <div className="h-16 border-b mb-8 flex items-center justify-between opacity-50">
                     <div className="w-32 h-8 bg-slate-200 rounded"></div>
                     <div className="flex gap-4">
                        <div className="w-16 h-4 bg-slate-100 rounded"></div>
                        <div className="w-16 h-4 bg-slate-100 rounded"></div>
                     </div>
                  </div>

                  <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                    {data.h1_heading || "Route Heading"}
                  </h1>

                  <div 
                    className="prose prose-slate max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-p:text-slate-600 prose-li:text-slate-600"
                    dangerouslySetInnerHTML={{ __html: data.content || data.long_form_content }}
                  />

                  {data.faqs && data.faqs.length > 0 && (
                     <div className="mt-12 pt-12 border-t">
                        <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
                        <div className="space-y-4">
                           {data.faqs.map((faq, idx) => (
                              <div key={idx} className="border rounded-lg p-4 bg-slate-50">
                                 <h3 className="font-bold text-slate-900 mb-2">{faq.question}</h3>
                                 <p className="text-slate-600 text-sm">{faq.answer}</p>
                              </div>
                           ))}
                        </div>
                     </div>
                  )}
               </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <div className="p-4 bg-white border-t flex justify-end gap-2">
           <Button variant="outline" onClick={onClose}>Close</Button>
           <Button onClick={() => { onClose(); onEdit(); }} className="bg-amber-500 hover:bg-amber-600 text-white">
              <ExternalLink className="w-4 h-4 mr-2" /> Edit SEO
           </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const MoreDots = () => (
  <svg className="w-4 h-4 text-slate-400 ml-auto" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path></svg>
);