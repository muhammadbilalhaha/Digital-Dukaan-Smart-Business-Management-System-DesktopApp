// src/features/dashboard/services/dashboardService.js
import { invoke } from '../../../tauri/commands';

class DashboardService {
    async getDashboardData() {
        return await invoke('get_dashboard_data');
    }
}

export const dashboardService = new DashboardService();