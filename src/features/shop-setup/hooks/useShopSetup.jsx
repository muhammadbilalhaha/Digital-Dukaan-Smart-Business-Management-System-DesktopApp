// src/features/shop-setup/hooks/useShopSetup.js
import { useState, useCallback } from 'react';
import { setupService } from '../services/setupService';
import useAuthStore from '../../../store/authStore';

export const useShopSetup = () => {
  const { loginSuccess } = useAuthStore();

  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState(null);

  const [shopData, setShopData] = useState({
    shopName: '',
    ownerName: '',
    phone: '',
    address: '',
    currency: 'PKR',
    logoPath: '',
  });

  const [ownerData, setOwnerData] = useState({
    name: '',
    pin: '',
    confirmPin: '',
  });

  const updateShopData = useCallback((field, value) => {
    setShopData(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateOwnerData = useCallback((field, value) => {
    setOwnerData(prev => ({ ...prev, [field]: value }));
  }, []);

  /**
   * Submit setup - NOW ACCEPTS pin directly
   */
  const submitSetup = useCallback(async (pin) => {
    console.log('🟢 submitSetup called with pin:', pin);
    console.log('🟢 shopData:', shopData);

    setIsLoading(true);
    setError(null);

    try {
      // Build the owner data with the pin passed directly
      const finalOwnerData = {
        name: shopData.ownerName,  // Use shopData.ownerName directly
        pin: pin,                   // Use the pin passed from Setup.jsx
        confirmPin: pin,
      };

      console.log('🟢 finalOwnerData:', finalOwnerData);

      const result = await setupService.setupShop(shopData, finalOwnerData);
      console.log('🟢 Setup result:', result);

      if (result.user && result.session) {
        loginSuccess(result.user, result.session);
      }

      setIsComplete(true);
    } catch (err) {
      console.error('🔴 Setup error:', err);
      setError(err.message || 'Setup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [shopData, loginSuccess]);

  const goToDashboard = useCallback(() => {
    window.location.href = '/dashboard';
  }, []);

  return {
    isLoading,
    isComplete,
    error,
    shopData,
    ownerData,
    submitSetup,
    updateShopData,
    updateOwnerData,
    goToDashboard,
    setError,
  };
};