import React from 'react';
import { MapPin, Phone, Mail, Globe, Calendar, User, Car, CreditCard, FileText, Navigation } from 'lucide-react';
import LogoImage from '@/components/ui/LogoImage';

export default function BillTemplate({ bill }) {
  if (!bill) return null;

  const invoice_number = bill.bill_number;
  // Use booking_ref if available (readable string), otherwise fallback to invoice_number or slice of UUID
  const display_booking_id = bill.booking_ref || bill.bill_number || (bill.booking_id ? bill.booking_id.slice(0, 8) : 'N/A');
  
  const invoice_date = bill.invoice_date || bill.created_at;
  const customer_name = bill.customer_name;
  const customer_mobile = bill.customer_phone;
  
  // Address Logic
  const pickup_city = bill.from_city || '';
  const pickup_address = bill.pickup_location || '';
  const drop_city = bill.to_city || '';
  const drop_address = bill.drop_location || '';
  
  const vehicle_type = bill.car_model;
  const trip_type = bill.trip_type;
  const base_fare = bill.payment_amount;
  const toll_charges = bill.toll_amount;
  const parking_charges = bill.parking_amount;
  const driver_allowance = bill.driver_da_amount;
  const total_amount = bill.total_amount;
  const payment_mode = bill.payment_mode;
  const payment_status = bill.payment_status;

  return (
    <div className="bill-template-scroll bg-white text-slate-900 shadow-none print:shadow-none min-h-[1000px] flex flex-col relative" id="printable-bill">
      <style>
        {`
          @media print {
            @page { margin: 0.5cm; }
            body * { visibility: hidden; }
            #printable-bill, #printable-bill * { visibility: visible; }
            #printable-bill { position: absolute; left: 0; top: 0; width: 100%; min-height: 100%; }
            .no-print { display: none !important; }
            .bill-template-scroll { overflow: visible !important; max-height: none !important; }
          }
        `}
      </style>

      {/* --- HEADER SECTION --- */}
      <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-8">
        <div className="flex gap-5 items-center">
           <LogoImage size="large" className="rounded-md border border-amber-500/30" />
           <div>
              <div className="text-3xl font-black text-amber-500 tracking-tighter uppercase">One Way Taxi</div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Excellence Defined</p>
           </div>
        </div>
        <div className="text-right space-y-1">
           <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tight mb-2">INVOICE</h2>
           <div className="text-sm font-medium text-slate-600">
             <p><span className="w-24 inline-block text-slate-400 uppercase text-xs font-bold">Invoice No:</span> <span className="font-mono font-bold text-slate-900">{invoice_number}</span></p>
             <p><span className="w-24 inline-block text-slate-400 uppercase text-xs font-bold">Date:</span> <span>{new Date(invoice_date).toLocaleDateString()}</span></p>
             <p><span className="w-24 inline-block text-slate-400 uppercase text-xs font-bold">Booking ID:</span> <span className="font-mono font-bold text-slate-900">{display_booking_id}</span></p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-12 mb-10">
         {/* --- CUSTOMER DETAILS SECTION --- */}
         <div>
            <h3 className="text-xs font-black text-white bg-slate-800 px-3 py-1.5 uppercase tracking-widest mb-4 inline-block rounded-sm">Bill To</h3>
            <div className="pl-1 space-y-2">
               <p className="font-bold text-xl text-slate-900">{customer_name}</p>
               <p className="flex items-center gap-2 text-slate-600 text-sm"><Phone className="h-3.5 w-3.5" /> {customer_mobile}</p>
            </div>
         </div>

         {/* --- TRIP SUMMARY SECTION --- */}
         <div>
            <h3 className="text-xs font-black text-white bg-slate-800 px-3 py-1.5 uppercase tracking-widest mb-4 inline-block rounded-sm">Trip Summary</h3>
             <div className="grid grid-cols-2 gap-4">
                 <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Trip Type</span>
                    <span className="text-sm font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded inline-block">{trip_type}</span>
                 </div>
                 <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Vehicle Type</span>
                    <div className="flex items-center gap-2">
                       <Car className="h-4 w-4 text-amber-600" />
                       <span className="text-sm font-bold text-slate-800">{vehicle_type}</span>
                    </div>
                 </div>
               </div>
         </div>
      </div>

      {/* --- ROUTE DETAILS SECTION --- */}
      <div className="mb-10">
          <h3 className="text-xs font-black text-white bg-slate-800 px-3 py-1.5 uppercase tracking-widest mb-4 inline-block rounded-sm">Route Details</h3>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-5">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-200">
                  <div className="bg-amber-100 p-2 rounded-full">
                      <Navigation className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Route</span>
                      <p className="text-lg font-bold text-slate-900">{pickup_city} <span className="text-slate-400 mx-2">to</span> {drop_city}</p>
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative pl-6 border-l-2 border-slate-300">
                      <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full border-4 border-white bg-green-500 shadow-sm"></div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Pickup From</span>
                      <p className="font-bold text-slate-800">{pickup_city}</p>
                      <p className="text-sm text-slate-600">{pickup_address}</p>
                  </div>
                  <div className="relative pl-6 border-l-2 border-slate-300">
                      <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full border-4 border-white bg-red-500 shadow-sm"></div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Drop To</span>
                      <p className="font-bold text-slate-800">{drop_city}</p>
                      <p className="text-sm text-slate-600">{drop_address}</p>
                  </div>
              </div>
          </div>
      </div>

      {/* --- CHARGES BREAKDOWN SECTION --- */}
      <div className="border border-slate-200 rounded-lg overflow-hidden mb-8">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
            <tr>
              <th className="py-3 px-6 text-left font-bold uppercase text-xs tracking-wider">Description</th>
              <th className="py-3 px-6 text-right font-bold uppercase text-xs tracking-wider">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr>
              <td className="py-3 px-6 font-medium text-slate-700">Base Fare</td>
              <td className="py-3 px-6 text-right font-mono text-slate-700">₹{base_fare}</td>
            </tr>
            {toll_charges > 0 && (
              <tr>
                <td className="py-3 px-6 text-slate-600">Toll Charges</td>
                <td className="py-3 px-6 text-right font-mono text-slate-700">₹{toll_charges}</td>
              </tr>
            )}
            {parking_charges > 0 && (
              <tr>
                <td className="py-3 px-6 text-slate-600">Parking Charges</td>
                <td className="py-3 px-6 text-right font-mono text-slate-700">₹{parking_charges}</td>
              </tr>
            )}
            {driver_allowance > 0 && (
              <tr>
                <td className="py-3 px-6 text-slate-600">Driver Allowance</td>
                <td className="py-3 px-6 text-right font-mono text-slate-700">₹{driver_allowance}</td>
              </tr>
            )}
          </tbody>
          <tfoot className="bg-slate-900 text-white">
            <tr>
              <td className="py-4 px-6 font-bold text-right uppercase text-xs tracking-wider">Total Amount</td>
              <td className="py-4 px-6 text-right font-black text-xl">₹{total_amount}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* --- PAYMENT DETAILS SECTION --- */}
      <div className="flex justify-between items-start border-b border-slate-200 pb-8 mb-8">
         <div className="text-sm text-slate-500 max-w-xs">
            <h4 className="font-bold text-slate-900 mb-2 uppercase text-xs">Payment Information</h4>
            <div className="grid grid-cols-2 gap-2 mb-2">
               <span className="text-slate-400 text-xs uppercase">Mode:</span>
               <span className="font-medium text-slate-800">{payment_mode || 'N/A'}</span>
               <span className="text-slate-400 text-xs uppercase">Status:</span>
               <span className={`font-bold text-xs uppercase px-2 py-0.5 rounded w-fit ${payment_status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  {payment_status || 'Pending'}
               </span>
            </div>
         </div>
      </div>

      {/* --- FOOTER & TERMS --- */}
      <div className="mt-auto">
        <div className="grid grid-cols-2 gap-8 items-end">
          
          {/* Terms & Conditions */}
          <div>
             <h4 className="font-bold text-slate-800 text-xs uppercase mb-3 flex items-center gap-2">
                <FileText className="h-3 w-3" /> Terms & Conditions
             </h4>
             <ul className="list-disc pl-4 text-[10px] text-slate-500 space-y-1 leading-relaxed">
                <li>Payment is due immediately upon receipt of this invoice.</li>
                <li>Toll tax, parking, and state tax are extra if not mentioned.</li>
                <li>One Way Taxi is not responsible for any delay due to traffic.</li>
                <li>This is a computer-generated invoice and needs no signature.</li>
                <li>All disputes are subject to Ahmedabad jurisdiction only.</li>
             </ul>
          </div>

          {/* Signatory */}
          <div className="text-right">
              <div className="mb-6">
                 <span className="font-dancing-script text-3xl text-slate-400 block mb-2">OneWayTaxi</span>
                 <span className="border-t border-slate-300 px-10 py-2 inline-block text-xs uppercase font-bold text-slate-400">Authorized Signatory</span>
              </div>
              <div className="text-xs text-slate-400 flex flex-col items-end gap-1">
                 <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> 123, Taxi Plaza, Ahmedabad</span>
                 <span className="flex items-center gap-1"><Globe className="h-3 w-3" /> www.bookonewaytaxi.com</span>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}