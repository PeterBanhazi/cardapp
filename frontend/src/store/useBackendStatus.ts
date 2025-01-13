import { useEffect } from 'react';
import { useDashboardStore } from './store';
import { DashboardStatus } from './store';

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