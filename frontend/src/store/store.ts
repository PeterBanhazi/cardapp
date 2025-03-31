// store.ts
import { createWithEqualityFn as create } from 'zustand/traditional'



export interface DashboardStatus {
  hasNewMessage: boolean;
  hasWarning: boolean;
  connectionStatus: 'connected' | 'disconnected' | 'pending';
}
export interface DashboardItem {
  id: string;
  path: string;
  title: string;
  isCollapsed: boolean;
  key?: number;
  status?: DashboardStatus;
}

interface DashboardState {
  dashboards: DashboardItem[];
  addDashboard: (dashboard: Omit<DashboardItem, 'isCollapsed' | 'key'>) => void;
  removeDashboard: (id: string) => void;
  toggleCollapse: (id: string) => void;
  refreshDashboard: (id: string) => void;
  initializeDashboard: () => void;
  updateDashboardStatus: (id: string, status: DashboardStatus) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  dashboards: [],
  
  // initializeDashboard: () => set((state) => ({
  //   dashboards: [{
  //     id: 'landing',
  //     path: '/',
  //     title: 'Welcome',
  //     isCollapsed: false,
  //     key: Date.now(),
  //     status: {
  //       hasNewMessage: true,
  //       hasWarning: true,
  //       connectionStatus: 'connected',
  //     },
      
  //   }]
  // })),
  
  initializeDashboard: () => set((state) => ({
    dashboards: [{
      id: 'landing',
      path: '/',
      title: 'Test Game',
      isCollapsed: false,
      key: Date.now(),
      status: {
        hasNewMessage: true,
        hasWarning: true,
        connectionStatus: 'connected',
      },
      
    }]
  })),

  addDashboard: (dashboard) => set((state) => {
    const existingDashboard = state.dashboards.find(d => d.path === dashboard.path);
    
    if (existingDashboard) {
      // Remove the existing dashboard and add it back at the top
      const otherDashboards = state.dashboards.filter(d => d.path !== dashboard.path);
      return {
        dashboards: [
          { 
            ...existingDashboard, 
            isCollapsed: false, // Ensure it's expanded
            key: Date.now() // Refresh the component
          },
          ...otherDashboards
        ]
      };
    }
    
    return {
      dashboards: [
        { ...dashboard, isCollapsed: false, key: Date.now() },
        ...state.dashboards
      ]
    };
  }),
  
  removeDashboard: (id) => 
    set((state) => ({
      dashboards: state.dashboards.filter(d => d.id !== id)
    })),
  
  toggleCollapse: (id) => set((state) => ({
    dashboards: state.dashboards.map(d => 
      d.id === id ? { ...d, isCollapsed: !d.isCollapsed } : d
    )
  })),

  refreshDashboard: (id) => set((state) => ({
    dashboards: state.dashboards.map(d =>
      d.id === id ? { ...d, key: Date.now() } : d
    )
  })),

  updateDashboardStatus: (id, status) => set((state) => ({
    dashboards: state.dashboards.map(d =>
      d.id === id ? { ...d, status } : d
    )
  })),
}));