import React, { useState } from 'react';
import FAQItem from './FAQItem';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      question: "What is one-way taxi pricing?",
      answer: "One-way pricing means you only pay for the distance you travel from your pickup city to your drop city. Unlike round-trip bookings where you pay for both ways even if you don't return, our service charges you only for the one-side journey."
    },
    {
      question: "What is your cancellation policy?",
      answer: "We offer free cancellation up to 6 hours before your scheduled pickup time. Cancellations made within 6 hours may attract a small fee. Refunds are processed within 5-7 working days."
    },
    {
      question: "Are there any night charges?",
      answer: "No, we do not have any hidden night charges. You can travel at any time of the day or night at the same fixed rate provided during booking."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major payment methods including Cash, UPI (GPay, PhonePe, Paytm), Credit/Debit Cards, and Net Banking. You can pay partially online to confirm booking and the rest to the driver."
    },
    {
      question: "Are toll and parking charges included?",
      answer: "Our fixed pricing typically includes toll taxes and driver allowance. Parking charges, if applicable at airport or specific locations, are to be paid by the customer on actuals."
    },
    {
      question: "Can I book a taxi for multiple days?",
      answer: "Yes, you can book our Outstation Round Trip service for multiple days. The pricing will be based on minimum km per day (usually 250km/300km) plus driver allowance."
    },
    {
      question: "How do I track my taxi?",
      answer: "Once a driver is assigned (usually 2 hours before pickup), you will receive an SMS/WhatsApp with the driver's details and a tracking link to view their real-time location."
    },
    {
      question: "What if I need to change my booking?",
      answer: "You can modify your booking details like date, time, or vehicle type by calling our 24/7 customer support or contacting us via WhatsApp. Changes are subject to vehicle availability."
    }
  ];

  return (
    <section className="py-20 bg-[#0F1419]">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            FREQUENTLY ASKED <span className="text-[#FFD700] border-b-4 border-[#FFD700] pb-1">QUESTIONS</span>
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}