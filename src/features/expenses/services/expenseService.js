// src/features/expenses/services/expenseService.js
import { invoke } from '../../../tauri/commands';

class ExpenseService {
    async getExpenses() { 
        return await invoke('get_expenses'); 
    }
    
    async getExpense(id) { 
        return await invoke('get_expense', { id }); 
    }
    
    async createExpense(data) { 
        return await invoke('create_expense', { request: data }); 
    }
    
    async updateExpense(id, data) { 
        return await invoke('update_expense', { 
            id, 
            request: data 
        }); 
    }
    
    async deleteExpense(id) { 
        return await invoke('delete_expense', { 
            id 
        }); 
    }
    
    async getExpenseStats() { 
        return await invoke('get_expense_stats'); 
    }
}

export const expenseService = new ExpenseService();