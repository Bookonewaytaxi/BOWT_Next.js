import React, { useState, useEffect } from 'react';
import { useBills } from '@/hooks/useBills';
import { Button } from '@/components/ui/button';
import { Eye, Send, CheckCircle, Clock, Search, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import BillDetailsView from './BillDetailsView';
import { Input } from '@/components/ui/input';

export default function BillsList() {
  const { getBills, sendBillEmail } = useBills();
  const [bills, setBills] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBill, setSelectedBill] = useState(null);

  useEffect(() => {
    fetchBills();
  }, []);

  useEffect(() => {
    if (bills) {
      const lowerSearch = searchTerm.toLowerCase();
      const filtered = bills.filter(bill => 
         bill.bill_number?.toLowerCase().includes(lowerSearch) ||
         bill.customer_name?.toLowerCase().includes(lowerSearch) ||
         bill.customer_email?.toLowerCase().includes(lowerSearch)
      );
      setFilteredBills(filtered);
    }
  }, [searchTerm, bills]);

  const fetchBills = async () => {
    setLoading(true);
    const data = await getBills();
    setBills(data || []);
    setFilteredBills(data || []);
    setLoading(false);
  };

  const handleSendEmail = async (bill) => {
    setSendingId(bill.id);
    await sendBillEmail(bill);
    setSendingId(null);
    fetchBills(); // Refresh status
  };

  if (loading) {
     return <div className="p-16 flex flex-col items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent mb-4"></div><p className="text-slate-400">Loading Invoices...</p></div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
      {/* Search Bar */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4 bg-slate-50/50">
         <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
               placeholder="Search bills..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="pl-9 bg-white border-slate-300"
            />
         </div>
         <div className="text-sm text-slate-500">
            Total Bills: {filteredBills.length}
         </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 uppercase text-xs tracking-wider">Bill Number</th>
              <th className="px-6 py-4 uppercase text-xs tracking-wider">Customer</th>
              <th className="px-6 py-4 uppercase text-xs tracking-wider">Date</th>
              <th className="px-6 py-4 uppercase text-xs tracking-wider">Total Amount</th>
              <th className="px-6 py-4 uppercase text-xs tracking-wider">Status</th>
              <th className="px-6 py-4 text-right uppercase text-xs tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredBills.length === 0 ? (
               <tr>
                  <td colSpan="6" className="px-6 py-16 text-center text-slate-400">
                     <FileText className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                     <p>No bills found matching your search.</p>
                  </td>
               </tr>
            ) : (
               filteredBills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium text-slate-900">{bill.bill_number}</td>
                    <td className="px-6 py-4">
                       <div className="font-medium text-slate-900">{bill.customer_name}</div>
                       <div className="text-xs text-slate-400">{bill.customer_email}</div>
                    </td>
                    <td className="px-6 py-4">{new Date(bill.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-bold text-slate-900">₹{bill.total_amount}</td>
                    <td className="px-6 py-4">
                       {bill.status === 'Sent' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                             <CheckCircle className="h-3 w-3" /> Sent
                          </span>
                       ) : bill.status === 'Paid' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">
                             <CheckCircle className="h-3 w-3" /> Paid
                          </span>
                       ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
                             <Clock className="h-3 w-3" /> {bill.status || 'Generated'}
                          </span>
                       )}
                    </td>
                    <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                       <Dialog>
                          <DialogTrigger asChild>
                             <Button variant="outline" size="sm" className="h-8 gap-2 border-slate-300 text-slate-600 hover:text-amber-600 hover:border-amber-500">
                                <Eye className="h-3.5 w-3.5" /> View
                             </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-[90vw] h-[90vh] p-0 bg-transparent border-0 shadow-none">
                             <BillDetailsView bill={bill} onSendEmail={() => handleSendEmail(bill)} sending={sendingId === bill.id} />
                          </DialogContent>
                       </Dialog>
                       
                       <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={() => handleSendEmail(bill)}
                          disabled={sendingId === bill.id}
                          title={bill.status === 'Sent' ? 'Resend Email' : 'Send Email'}
                        >
                          <Send className={`h-4 w-4 ${bill.status === 'Sent' ? 'text-slate-400' : 'text-blue-500'}`} />
                       </Button>
                    </td>
                  </tr>
               ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}