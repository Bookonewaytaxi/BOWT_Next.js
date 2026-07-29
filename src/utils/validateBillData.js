/**
 * Validates billing data for finalizing a bill.
 * @param {Object} billData - The billing data object.
 * @returns {Object} result - { isValid: boolean, errors: Object }
 */
export const validateBillData = (billData) => {
  const errors = {};

  // Customer Details
  if (!billData.name || billData.name.length < 2 || billData.name.length > 100) {
    errors.name = "Customer name must be 2-100 characters";
  }
  
  if (!billData.mobile_number || !/^\d{10}$/.test(String(billData.mobile_number).replace(/\D/g, '').slice(-10))) {
    errors.mobile_number = "Mobile number must be 10 digits";
  }

  // Email is often optional in taxi services, but if present, validate format
  if (billData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(billData.email)) {
    errors.email = "Invalid email format";
  }

  // Trip Details
  if (!billData.pickup_location || billData.pickup_location.length < 5) {
    errors.pickup_location = "Pickup address must be at least 5 characters";
  }
  
  if (!billData.drop_location || billData.drop_location.length < 5) {
    errors.drop_location = "Drop address must be at least 5 characters";
  }

  // Vehicle & Driver
  if (!billData.driver_car_no) {
    errors.vehicle_number = "Vehicle number is required";
  }
  
  if (!billData.driver_name || billData.driver_name.length < 2) {
    errors.driver_name = "Driver name must be at least 2 characters";
  }
  
  if (!billData.driver_phone || !/^\d{10}$/.test(String(billData.driver_phone).replace(/\D/g, '').slice(-10))) {
    errors.driver_mobile = "Driver mobile must be 10 digits";
  }

  // Payment
  if (!billData.payment_mode) {
    errors.payment_mode = "Payment mode is required";
  }
  
  if (!billData.payment_status) {
    errors.payment_status = "Payment status is required";
  }

  // Fare Validation (Handled dynamically in UI, but good to check here too)
  const bookingAmount = Number(billData.total_amount) || 0; // Using total_amount from booking as base
  const manualFare = Number(billData.manual_fare) || 0;
  
  if (manualFare > 0 && manualFare < bookingAmount) {
     errors.manual_fare = `Manual fare cannot be less than booking amount (₹${bookingAmount})`;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};