import { useEffect, useState, useCallback, useRef } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { syncAPI } from '../api/services';

/**
 * Hook for managing data synchronization between client and server
 * Handles offline mode, queuing, and bidirectional sync
 */
export const useSyncData = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useLocalStorage('lastSyncTime', null);
  const [syncError, setSyncError] = useState(null);
  const syncTimeoutRef = useRef(null);

  // Generate or retrieve device ID
  const [deviceId] = useLocalStorage(
    'deviceId',
    `device_${Date.now()}_${Math.random().toString(36).slice(2)}`
  );

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setSyncError(null);
    };
    
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync data when coming back online
  useEffect(() => {
    if (isOnline && !isSyncing) {
      // Add a small delay to ensure network is stable
      syncTimeoutRef.current = setTimeout(() => {
        performSync();
      }, 2000);
    }

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [isOnline]);

  // Perform bidirectional sync
  const performSync = useCallback(async () => {
    if (isSyncing || !isOnline) return;

    setIsSyncing(true);
    setSyncError(null);

    try {
      // Get pending orders and updates from localStorage
      const pendingOrders = JSON.parse(
        localStorage.getItem('pendingOrders') || '[]'
      );
      const pendingUpdates = JSON.parse(
        localStorage.getItem('pendingUpdates') || '[]'
      );

      // Perform bidirectional sync
      const response = await syncAPI.bidirectional({
        deviceId,
        lastSyncTime,
        orders: pendingOrders,
        updates: pendingUpdates,
      });

      if (response.data.success) {
        // Clear pending data
        localStorage.removeItem('pendingOrders');
        localStorage.removeItem('pendingUpdates');

        // Update last sync time
        const newSyncTime = response.data.data.syncTime;
        setLastSyncTime(newSyncTime);

        // Trigger a refresh of data
        window.dispatchEvent(
          new CustomEvent('dataSync', {
            detail: response.data.data,
          })
        );
      }
    } catch (error) {
      setSyncError(error.response?.data?.message || 'Sync failed');
      console.error('Sync error:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [deviceId, lastSyncTime, isSyncing, isOnline, setLastSyncTime]);

  // Queue order for sync
  const queueOrder = useCallback((order) => {
    if (!isOnline) {
      const pending = JSON.parse(localStorage.getItem('pendingOrders') || '[]');
      pending.push(order);
      localStorage.setItem('pendingOrders', JSON.stringify(pending));
    }
  }, [isOnline]);

  // Queue stock update for sync
  const queueStockUpdate = useCallback((itemId, stock) => {
    if (!isOnline) {
      const pending = JSON.parse(localStorage.getItem('pendingUpdates') || '[]');
      pending.push({ itemId, stock });
      localStorage.setItem('pendingUpdates', JSON.stringify(pending));
    }
  }, [isOnline]);

  return {
    isOnline,
    isSyncing,
    lastSyncTime,
    syncError,
    deviceId,
    performSync,
    queueOrder,
    queueStockUpdate,
  };
};

/**
 * Hook for localStorage with JSON serialization
 */
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error('Error writing to localStorage:', error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue];
};
