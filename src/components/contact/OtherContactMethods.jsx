import React from 'react';
import { MessageCircle, Mail, Phone } from 'lucide-react';
import ContactMethodCard from './ContactMethodCard';

export default function OtherContactMethods() {
  const contactInfo = {
    whatsapp: "+91 7567575578",
    phone: "+91 7567575578",
    email: "contact@bookonewaytaxi.com"
  };

  const methods = [
    {
      icon: MessageCircle,
      title: "WhatsApp",
      info: contactInfo.whatsapp,
      buttonText: "Chat Now",
      onClick: () => window.open(`https://wa.me/917567575578`, '_blank')
    },
    {
      icon: Mail,
      title: "Email",
      info: contactInfo.email,
      buttonText: "Email Us",
      onClick: () => window.location.href = `mailto:${contactInfo.email}`
    },
    {
      icon: Phone,
      title: "Phone",
      info: contactInfo.phone,
      buttonText: "Call Now",
      onClick: () => window.location.href = `tel:${contactInfo.phone.replace(/\s/g, '')}`
    }
  ];

  return (
    <section className="py-20 bg-[#0A0D11]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Other Ways to <span className="text-[#FFD700] border-b-4 border-[#FFD700] pb-1">Reach Us</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto mt-4">
            Choose the method that works best for you. We are always happy to help.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {methods.map((method, index) => (
            <ContactMethodCard 
              key={index}
              {...method}
              delay={index * 0.1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}