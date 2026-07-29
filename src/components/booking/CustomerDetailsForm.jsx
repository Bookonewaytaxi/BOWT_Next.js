import React, { useState, useEffect } from 'react';
import { User, Briefcase, Map, CreditCard, FileText, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FormSection from './forms/FormSection';
import FormInput from './forms/FormInput';
import FormSelect from './forms/FormSelect';
import FormRadio from './forms/FormRadio';
import FormCheckbox from './forms/FormCheckbox';
import FormTextarea from './forms/FormTextarea';

export default function CustomerDetailsForm({ 
  initialData, 
  routeData,
  onSubmit, 
  isSubmitting 
}) {
  const [formData, setFormData] = useState({
    namePrefix: 'Mr.',
    name: initialData.name || '',
    mobileNumber: initialData.mobileNumber || '',
    email: initialData.email || '',
    alternateMobile: '',
    travelingPersonName: '',
    passengerCount: '',
    luggageCount: '',
    pickupAddress: '', // New field
    dropAddress: '',   // New field
    paymentMode: 'Cash',
    specialInstructions: '',
    isConfirmed: false
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (initialData.name) {
      setFormData(prev => ({
        ...prev,
        name: initialData.name,
        mobileNumber: initialData.mobileNumber,
        email: initialData.email || 'customer@example.com'
      }));
    }
  }, [initialData]);

  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        return !value.trim() ? 'Required' : value.length < 3 ? 'Min 3 chars' : null;
      case 'mobileNumber':
        return !value.trim() ? 'Required' : !/^\d{10}$/.test(value) ? 'Invalid number' : null;
      case 'alternateMobile':
        return value && !/^\d{10}$/.test(value) ? 'Invalid number' : null;
      case 'travelingPersonName':
         return value && value.length < 3 ? 'Min 3 chars' : null;
      case 'passengerCount':
        return !value ? 'Required' : null;
      case 'luggageCount':
        return !value ? 'Required' : null;
      case 'pickupAddress': // New validation
        return !value.trim() ? 'Pickup address is required' : value.length < 5 ? 'Min 5 chars required' : value.length > 200 ? 'Max 200 chars allowed' : null;
      case 'dropAddress': // New validation
        return !value.trim() ? 'Drop address is required' : value.length < 5 ? 'Min 5 chars required' : value.length > 200 ? 'Max 200 chars allowed' : null;
      case 'isConfirmed':
        return value !== true ? 'Please confirm' : null;
      default:
        return null;
    }
  };

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (touched[name]) {
      setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleBlur = (name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, formData[name]) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    const fieldsToValidate = [
      'name', 'mobileNumber', 'passengerCount', 'luggageCount', 
      'pickupAddress', 'dropAddress', 'isConfirmed' // Added address fields
    ];
    
    if(formData.alternateMobile) {
       const altError = validateField('alternateMobile', formData.alternateMobile);
       if(altError) newErrors.alternateMobile = altError;
    }
    if(formData.travelingPersonName) {
       const nameError = validateField('travelingPersonName', formData.travelingPersonName);
       if(nameError) newErrors.travelingPersonName = nameError;
    }

    let isValid = true;
    fieldsToValidate.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched(fieldsToValidate.reduce((acc, curr) => ({ ...acc, [curr]: true }), {}));

    if (isValid) {
      const enhancedInstructions = `
        Passengers: ${formData.passengerCount}
        Luggage: ${formData.luggageCount}
        Traveler Name: ${formData.travelingPersonName || formData.name}
        Payment Mode: ${formData.paymentMode}
        ${formData.specialInstructions ? `Note: ${formData.specialInstructions}` : ''}
      `.trim();

      const submissionData = {
        name: formData.name,
        mobileNumber: formData.mobileNumber,
        email: formData.email || 'no-email@provided.com',
        alternateMobile: formData.alternateMobile,
        specialInstructions: enhancedInstructions,
        passengerCount: formData.passengerCount,
        luggageCount: formData.luggageCount,
        pickupAddress: formData.pickupAddress, // New
        dropAddress: formData.dropAddress,     // New
        paymentMode: formData.paymentMode,
      };

      onSubmit(submissionData);
    } else {
      const firstErrorField = document.querySelector('[aria-invalid="true"]');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 animate-in fade-in duration-500">
      
      {/* SECTION 1: Customer Details */}
      <FormSection title="Customer Details" icon={User}>
        <div className="grid grid-cols-4 gap-3">
          <FormSelect
            label="Prefix"
            options={[{value: 'Mr.', label: 'Mr.'}, {value: 'Mrs.', label: 'Mrs.'}, {value: 'Ms.', label: 'Ms.'}]}
            value={formData.namePrefix}
            onChange={(e) => handleChange('namePrefix', e.target.value)}
            className="col-span-1"
          />
          <FormInput
            label="Full Name"
            required
            placeholder="Name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            onBlur={() => handleBlur('name')}
            error={errors.name}
            isValid={touched.name && !errors.name}
            className="col-span-3"
            aria-invalid={!!errors.name}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <FormInput
            label="Mobile"
            required
            placeholder="10 digits"
            prefix="+91"
            type="tel"
            maxLength={10}
            value={formData.mobileNumber}
            onChange={(e) => handleChange('mobileNumber', e.target.value.replace(/\D/g, ''))}
            onBlur={() => handleBlur('mobileNumber')}
            error={errors.mobileNumber}
            isValid={touched.mobileNumber && !errors.mobileNumber}
            aria-invalid={!!errors.mobileNumber}
          />
          <FormInput
            label="Alt Mobile"
            placeholder="Optional"
            prefix="+91"
            type="tel"
            maxLength={10}
            value={formData.alternateMobile}
            onChange={(e) => handleChange('alternateMobile', e.target.value.replace(/\D/g, ''))}
            onBlur={() => handleBlur('alternateMobile')}
            error={errors.alternateMobile}
            isValid={formData.alternateMobile && !errors.alternateMobile}
          />
        </div>
      </FormSection>

      {/* SECTION 2: Travel Details */}
      <FormSection title="Travel Details" icon={Briefcase}>
         <div className="space-y-3">
           <FormInput
              label="Traveler Name (if different)"
              placeholder="Name of person traveling"
              value={formData.travelingPersonName}
              onChange={(e) => handleChange('travelingPersonName', e.target.value)}
              onBlur={() => handleBlur('travelingPersonName')}
              error={errors.travelingPersonName}
            />
            
            <div className="grid grid-cols-2 gap-3">
              <FormSelect
                label="Passengers"
                required
                options={[1,2,3,4,5,6,7].map(n => ({ value: n, label: `${n} Person${n>1?'s':''}` }))}
                value={formData.passengerCount}
                onChange={(e) => handleChange('passengerCount', e.target.value)}
                onBlur={() => handleBlur('passengerCount')}
                error={errors.passengerCount}
                aria-invalid={!!errors.passengerCount}
              />
              <FormSelect
                label="Luggage"
                required
                options={[
                  { value: 'Small', label: 'Small (1-2)' },
                  { value: 'Medium', label: 'Medium (3-4)' },
                  { value: 'Large', label: 'Large (5+)' },
                  { value: 'None', label: 'None' }
                ]}
                value={formData.luggageCount}
                onChange={(e) => handleChange('luggageCount', e.target.value)}
                onBlur={() => handleBlur('luggageCount')}
                error={errors.luggageCount}
                aria-invalid={!!errors.luggageCount}
              />
            </div>
         </div>
      </FormSection>

      {/* SECTION 3: Journey Details (Modified) */}
      <FormSection title="Journey Details" icon={Map}>
        <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-md border border-slate-100 mb-3">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Pickup City</span>
            <p className="text-xs font-medium text-slate-800 truncate">{routeData?.from_city}</p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Drop City</span>
            <p className="text-xs font-medium text-slate-800 truncate">{routeData?.to_city}</p>
          </div>
          <div className="space-y-1">
             <span className="text-[10px] uppercase font-bold text-slate-400">Date</span>
             <p className="text-xs font-medium text-slate-800">{routeData?.pickup_date}</p>
          </div>
           <div className="space-y-1">
             <span className="text-[10px] uppercase font-bold text-slate-400">Time</span>
             <p className="text-xs font-medium text-slate-800">{routeData?.pickup_time}</p>
          </div>
        </div>

        {/* New Address Inputs */}
        <div className="space-y-3">
          <FormTextarea
            id="pickupAddress"
            name="pickupAddress"
            label="Pickup Address"
            required
            placeholder={`Enter exact pickup location in ${routeData?.from_city || 'City'}`}
            value={formData.pickupAddress}
            onChange={(e) => handleChange('pickupAddress', e.target.value)}
            onBlur={() => handleBlur('pickupAddress')}
            error={errors.pickupAddress}
            isValid={touched.pickupAddress && !errors.pickupAddress}
            minLength={5}
            maxLength={200}
            rows={2}
            className="text-sm"
            aria-invalid={!!errors.pickupAddress}
          />

          <FormTextarea
            id="dropAddress"
            name="dropAddress"
            label="Drop Address"
            required
            placeholder={`Enter exact drop location in ${routeData?.to_city || 'City'}`}
            value={formData.dropAddress}
            onChange={(e) => handleChange('dropAddress', e.target.value)}
            onBlur={() => handleBlur('dropAddress')}
            error={errors.dropAddress}
            isValid={touched.dropAddress && !errors.dropAddress}
            minLength={5}
            maxLength={200}
            rows={2}
            className="text-sm"
            aria-invalid={!!errors.dropAddress}
          />
        </div>
      </FormSection>

      {/* SECTION 4: Payment Mode */}
      <FormSection title="Payment Mode" icon={CreditCard}>
        <FormRadio
          label="Method"
          required
          name="paymentMode"
          value={formData.paymentMode}
          onChange={(val) => handleChange('paymentMode', val)}
          options={[
            { value: 'Cash', label: 'Cash to Driver' },
            { value: 'UPI', label: 'UPI / Online' }
          ]}
        />
        <p className="text-[10px] text-slate-500 mt-2 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-green-500" /> 
          Pay after trip ends. No advance needed.
        </p>
      </FormSection>

      {/* SECTION 5: Special Note */}
      <FormSection title="Special Note" icon={FileText}>
        <FormTextarea
          label="Instructions"
          placeholder="Specific requirements? e.g. carrier, pet friendly..."
          maxLength={500}
          value={formData.specialInstructions}
          onChange={(e) => handleChange('specialInstructions', e.target.value)}
          helperText="Optional"
        />
      </FormSection>

      {/* SECTION 6: Confirmation */}
      <div className="bg-[#0F1419] rounded-lg p-4 border border-slate-800 text-white shadow-lg">
        <FormCheckbox
          label="I confirm all booking details."
          required
          checked={formData.isConfirmed}
          onChange={(val) => handleChange('isConfirmed', val)}
          error={errors.isConfirmed}
          className="mb-4 text-white"
        />
        
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full h-11 text-base font-bold bg-[#FFD700] text-[#0F1419] hover:bg-[#FFD700]/90 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Processing...' : 'Confirm Booking'}
        </Button>
      </div>

    </form>
  );
}