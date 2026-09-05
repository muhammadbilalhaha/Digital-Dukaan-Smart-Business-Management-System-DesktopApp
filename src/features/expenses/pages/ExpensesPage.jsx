// src/features/expenses/pages/ExpensesPage.jsx
import React, { useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { useExpenses } from '../hooks/useExpenses';
import { expenseService } from '../services/expenseService';
import useUiStore from '../../../store/ui.store';
import useAuthStore from '../../../store/authStore';
import ExpenseStats from '../components/ExpenseStats';
import ExpenseSearch from '../components/ExpenseSearch';
import ExpensesTable from '../components/ExpensesTable';
import ExpenseFormModal from '../components/ExpenseFormModal';
import ExpenseDetailModal from '../components/ExpenseDetailModal';
import DeleteConfirmDialog from '../components/DeleteConfirmDialog'; // CHANGED: Import DeleteConfirmDialog

const ExpensesPage = () => {
    const { expenses: allExpenses, stats, isLoading, refresh } = useExpenses();
    const { addToast } = useUiStore();
    const user = useAuthStore((state) => state.user);

    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [paymentFilter, setPaymentFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    const [showForm, setShowForm] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [deletingExpense, setDeletingExpense] = useState(null); // CHANGED: voidingExpense → deletingExpense
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false); // CHANGED: isVoiding → isDeleting

    const filteredExpenses = (allExpenses || []).filter(e => {
        const matchSearch = !searchQuery || e.title?.toLowerCase().includes(searchQuery.toLowerCase()) || e.expense_number?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchCategory = categoryFilter === 'all' || e.category === categoryFilter;
        const matchPayment = paymentFilter === 'all' || e.payment_method === paymentFilter;
        const matchStatus = statusFilter === 'all' || e.status === statusFilter;
        return matchSearch && matchCategory && matchPayment && matchStatus;
    });

    const handleAdd = () => { setEditingExpense(null); setShowForm(true); };
    const handleEdit = (e) => { setEditingExpense(e); setSelectedExpense(null); setShowForm(true); };
    const handleRowClick = (e) => setSelectedExpense(e);
    const handleDelete = (e) => { setDeletingExpense(e); setSelectedExpense(null); }; // CHANGED: handleVoid → handleDelete

    const handleSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            if (editingExpense) {
                await expenseService.updateExpense(editingExpense.id, { ...data, updated_by: user?.id });
                addToast({ type: 'success', title: 'Expense Updated', message: `${data.title} updated` });
            } else {
                await expenseService.createExpense({ ...data, created_by: user?.id });
                addToast({ type: 'success', title: 'Expense Saved', message: `${data.title} recorded` });
            }
            setShowForm(false); setEditingExpense(null);
            refresh();
        } catch (err) { addToast({ type: 'error', title: 'Error', message: err.message }); }
        finally { setIsSubmitting(false); }
    };

    // CHANGED: handleConfirmVoid → handleConfirmDelete
    const handleConfirmDelete = async () => {
        if (!deletingExpense) return;
        setIsDeleting(true);
        try {
            await expenseService.deleteExpense(deletingExpense.id); // CHANGED: deleteExpense instead of voidExpense
            addToast({ type: 'success', title: 'Expense Deleted', message: `${deletingExpense.title} has been permanently deleted` }); // CHANGED: message
            setDeletingExpense(null);
            refresh();
        } catch (err) { addToast({ type: 'error', title: 'Error', message: err.message }); }
        finally { setIsDeleting(false); }
    };

    return (
        <div className="p-1 mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-extrabold text-text-primary">Expenses</h1>
                    <p className="text-sm text-text-muted mt-0.5">Track and manage your shop's operating expenses</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={refresh} className="w-10 h-10 rounded-xl border border-border-light hover:bg-app-surface-alt text-text-muted flex items-center justify-center transition-colors"><RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} /></button>
                    <button onClick={handleAdd} className="flex items-center gap-2 px-4 py-2.5 bg-[#f67315] hover:bg-[#ea580c] text-white font-semibold text-sm rounded-xl shadow-sm shadow-[#f67315]/20 transition-all"><Plus size={18} /> Add Expense</button>
                </div>
            </div>

            <ExpenseStats stats={stats} />

            <ExpenseSearch searchQuery={searchQuery} onSearchChange={setSearchQuery} categoryFilter={categoryFilter} onCategoryChange={setCategoryFilter} paymentFilter={paymentFilter} onPaymentChange={setPaymentFilter} statusFilter={statusFilter} onStatusChange={setStatusFilter} />

            {isLoading ? (
                <div className="bg-card-bg rounded-2xl border border-border-light p-12 flex items-center justify-center"><div className="w-8 h-8 border-4 border-border-light border-t-[#f67315] rounded-full animate-spin" /></div>
            ) : (
                <ExpensesTable expenses={filteredExpenses} onRowClick={handleRowClick} />
            )}

            <ExpenseFormModal isOpen={showForm} onClose={() => { setShowForm(false); setEditingExpense(null); }} onSubmit={handleSubmit} isEditing={!!editingExpense} defaultValues={editingExpense ? { title: editingExpense.title, category: editingExpense.category, amount: editingExpense.amount, payment_method: editingExpense.payment_method, expense_date: editingExpense.expense_date?.split('T')[0], notes: editingExpense.notes || '' } : null} isSubmitting={isSubmitting} />

            {/* CHANGED: onVoid → onDelete */}
            <ExpenseDetailModal expense={selectedExpense} isOpen={!!selectedExpense} onClose={() => setSelectedExpense(null)} onEdit={handleEdit} onDelete={handleDelete} />

            {/* CHANGED: VoidConfirmDialog → DeleteConfirmDialog */}
            <DeleteConfirmDialog isOpen={!!deletingExpense} onClose={() => setDeletingExpense(null)} onConfirm={handleConfirmDelete} expenseTitle={deletingExpense?.title || ''} isLoading={isDeleting} />
        </div>
    );
};

export default ExpensesPage;