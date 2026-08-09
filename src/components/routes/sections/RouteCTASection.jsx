import React from 'react';
import { Phone, ArrowRight, IndianRupee } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Four CTA actions only — no inline form. "Book Now" and "Get Fare" both
 * lead into the SAME existing booking flow (handleBookNow), since a
 * distinct "Get Fare" flow does not exist as separate logic today; it
 * reuses the already-visible starting price instead of introducing a
 * new form. Call/WhatsApp reuse the exact existing tel:/wa.me links.
 */
export default function RouteCTASection({ fromCity, toCity, startingPrice, onBookNow }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <Button
        size="lg"
        onClick={onBookNow}
        className="bg-slate-900 text-white hover:bg-slate-800 h-14 rounded-xl shadow-sm"
      >
        Book Now
      </Button>
      <Button
        size="lg"
        variant="outline"
        onClick={() => window.open('tel:+917567575578')}
        className="h-14 rounded-xl"
      >
        <Phone className="w-4 h-4 mr-2" /> Call Now
      </Button>
      <Button
        size="lg"
        onClick={() =>
          window.open(
            `https://wa.me/917567575578?text=Hi, I am interested in booking a taxi from ${fromCity} to ${toCity}`,
            '_blank'
          )
        }
        className="bg-[#25D366] hover:bg-[#20bd5a] text-white h-14 rounded-xl shadow-sm"
      >
        WhatsApp
      </Button>
      <Button
        size="lg"
        variant="outline"
        onClick={onBookNow}
        className="h-14 rounded-xl"
      >
        <IndianRupee className="w-4 h-4 mr-1" /> Get Fare ({startingPrice ? `₹${startingPrice.toLocaleString()}` : '—'})
      </Button>
    </div>
  );
}
