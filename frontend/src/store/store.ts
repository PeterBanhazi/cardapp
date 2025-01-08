import { create } from 'zustand';

export interface DashboardItem {
    id: string;
    path: string;
    title: string;
    isCollapsed: boolean;
    key?: number; // Used for forcing refresh
  }

  interface DashboardState {
    dashboards: DashboardItem[];
    addDashboard: (dashboard: Omit<DashboardItem, 'isCollapsed' | 'key'>) => void;
    removeDashboard: (id: string) => void;
    toggleCollapse: (id: string) => void;
    refreshDashboard: (id: string) => void;
    initializeDashboard: () => void;
  }

  export const useDashboardStore = create<DashboardState>((set) => ({
    dashboards: [],
    
    initializeDashboard: () => set((state) => ({
      dashboards: [{
        id: 'landing',
        path: '/',
        title: 'Welcome',
        isCollapsed: false,
        key: Date.now()
      }]
    })),
  
    addDashboard: (dashboard) => set((state) => {
      const existingDashboard = state.dashboards.find(d => d.path === dashboard.path);
      
      if (existingDashboard) {
        return {
          dashboards: state.dashboards.map(d => 
            d.id === existingDashboard.id 
              ? { ...d, isCollapsed: false }
              : d
          )
        };
      }
      
      return {
        dashboards: [
          { ...dashboard, isCollapsed: false, key: Date.now() },
          ...state.dashboards
        ]
      };
    }),
    
    removeDashboard: (id) => set((state) => ({
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
    }))
  }));