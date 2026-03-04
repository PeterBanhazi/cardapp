import { useEffect } from 'react';
import { useDashboardStore } from './useDashboardStore';
import { DashboardStatus } from './useDashboardStore';

export const useBackendStatus = (dashboardId: string) => {
  const { updateDashboardStatus } = useDashboardStore();

  useEffect(() => {
    // Example WebSocket or polling implementation
    const ws = new WebSocket('your-backend-url');
    
    ws.onmessage = (event) => {
      const status: DashboardStatus = JSON.parse(event.data);
      updateDashboardStatus(dashboardId, status);
    };

    return () => ws.close();
  }, [dashboardId, updateDashboardStatus]);
};