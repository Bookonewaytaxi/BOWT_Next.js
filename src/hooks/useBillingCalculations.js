import { useCallback } from 'react';
import { formatCurrency } from '@/utils/billingUtils';

export function useBillingCalculations() {
  const calculateTax = useCallback((subtotal, taxRate = 0.05) => {
    return subtotal * taxRate;
  }, []);

  const calculateTotal = useCallback((subtotal, tax) => {
    return subtotal + tax;
  }, []);

  const calculateRemainingAmount = useCallback((total, amountPaid) => {
    return Math.max(0, total - (amountPaid || 0));
  }, []);

  // Helper to reverse calculate subtotal from a tax-inclusive total
  const calculateSubtotalFromTotal = useCallback((total, taxRate = 0.05) => {
    return total / (1 + taxRate);
  }, []);

  return {
    calculateTax,
    calculateTotal,
    calculateRemainingAmount,
    calculateSubtotalFromTotal,
    formatCurrency
  };
}