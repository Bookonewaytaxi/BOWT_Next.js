// Task 15: Add data validation utility
export const validateInquiryForm = (formData) => {
  const errors = {};
  
  // Validate Pickup City
  if (!formData.pickup_city || !formData.pickup_city.trim()) {
    errors.pickup_city = "Pickup city is required";
  }

  // Validate Drop City
  if (!formData.drop_city || !formData.drop_city.trim()) {
    errors.drop_city = "Drop city is required";
  } else if (formData.pickup_city && formData.pickup_city.toLowerCase() === formData.drop_city.toLowerCase()) {
    errors.drop_city = "Drop city cannot be same as pickup city";
  }

  // Validate Travel Date
  if (!formData.travel_date) {
    errors.travel_date = "Travel date is required";
  } else {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(formData.travel_date);
    if (selectedDate < today) {
      errors.travel_date = "Travel date cannot be in the past";
    }
  }

  // Validate Travel Time
  if (!formData.travel_time) {
    errors.travel_time = "Travel time is required";
  } else {
    // Simple HH:MM validation regex
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(formData.travel_time)) {
      errors.travel_time = "Invalid time format (HH:MM)";
    }
  }

  // Validate Customer Name
  if (!formData.customer_name || !formData.customer_name.trim()) {
    errors.customer_name = "Name is required";
  } else if (formData.customer_name.trim().length < 3) {
    errors.customer_name = "Name must be at least 3 characters";
  } else if (formData.customer_name.length > 100) {
    errors.customer_name = "Name is too long";
  }

  // Validate Mobile Number
  if (!formData.customer_mobile) {
    errors.customer_mobile = "Mobile number is required";
  } else if (!/^\d{10}$/.test(formData.customer_mobile)) {
    errors.customer_mobile = "Mobile number must be exactly 10 digits";
  }

  return errors;
};