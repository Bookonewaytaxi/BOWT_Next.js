import React, { useEffect } from 'react';
import { initializeGTM, verifyGTMInstallation } from '@/utils/gtm';

const GTMInitializer = () => {
  useEffect(() => {
    // Initialize GTM using the utility function
    initializeGTM();
    
    // Log status for debugging in development
    if ((process.env.NODE_ENV !== 'production')) {
      setTimeout(() => {
        verifyGTMInstallation();
      }, 1000);
    }
  }, []);

  return null;
};

export default GTMInitializer;