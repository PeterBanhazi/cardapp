import { create } from 'zustand';

export interface DashboardItem {
    id: string;
    path: string;
    title: string;
    isCollapsed: boolean;
  }

interface DashboardState {
  dashboards: DashboardItem[];
  addDashboard: (dashboard: Omit<DashboardItem, 'isCollapsed'>) => void;
  removeDashboard: (id: string) => void;
  toggleCollapse: (id: string) => void;
  focusDashboard: (id: string) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  dashboards: [],
  
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
        { ...dashboard, isCollapsed: false },
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
  
  focusDashboard: (id) => set((state) => ({
    dashboards: [
      ...state.dashboards.filter(d => d.id === id),
      ...state.dashboards.filter(d => d.id !== id)
    ]
  }))
}));