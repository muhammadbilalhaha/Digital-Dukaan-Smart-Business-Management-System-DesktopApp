import React, { useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { useCustomers } from '../hooks/useCustomers';
import useUiStore from '../../../store/ui.store';
import useAuthStore from '../../../store/authStore'; // ADD THIS IMPORT
import { formatCurrency } from '../../../shared/utils/currency';
import CustomerStats from '../components/CustomerStats';
import CustomerFilters from '../components/CustomerFilters';
import CustomerList from '../components/CustomerList';
import CustomerFormModal from '../components/CustomerFormModal';
import CustomerDetailModal from '../components/CustomerDetailModal';
import CustomerPaymentModal from '../components/CustomerPaymentModal';
import DeleteConfirmDialog from '../components/DeleteConfirmDialog';
import { customerService } from '../services/customerService';

const CustomersPage = () => {
    const {
        customers, customerTypes, stats, isLoading, error,
        searchQuery, typeFilter, dueFilter,
        setSearchQuery, setTypeFilter, setDueFilter,
        createCustomer, updateCustomer, deleteCustomer,
        createCustomerType, refresh,
    } = useCustomers();

    const { addToast } = useUiStore();
    const user = useAuthStore((state) => state.user); // GET USER FROM AUTH STORE

    const [showForm, setShowForm] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [deletingCustomer, setDeletingCustomer] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    
    // Payment Modal State
    const [paymentCustomer, setPaymentCustomer] = useState(null);
    const [isPaymentSubmitting, setIsPaymentSubmitting] = useState(false);

    const handleAdd = () => { 
        setEditingCustomer(null); 
        setShowForm(true); 
    };
    
    const handleEdit = (c) => { 
        setEditingCustomer(c); 
        setShowForm(true); 
    };
    
    const handleRowClick = (c) => setSelectedCustomer(c);
    
    const handleDelete = (c) => setDeletingCustomer(c);

    // Handle Record Payment from Detail Modal
    const handleRecordPayment = (customer) => {
        setSelectedCustomer(null); // Close detail modal
        setPaymentCustomer(customer); // Open payment modal
    };

    const handleSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            // Pass user name from auth store
            const payload = {
                ...data,
                created_by: user?.name || 'Unknown',
                updated_by: user?.name || 'Unknown',
            };

            if (editingCustomer) {
                await updateCustomer(editingCustomer.id, payload);
                addToast({ type: 'success', title: 'Customer Updated', message: `${data.name} updated` });
            } else {
                await createCustomer(payload);
                addToast({ type: 'success', title: 'Customer Added', message: `${data.name} added` });
            }
            setShowForm(false); 
            setEditingCustomer(null);
        } catch (err) { 
            addToast({ type: 'error', title: 'Error', message: err.message }); 
        } finally { 
            setIsSubmitting(false); 
        }
    };

    // Handle Payment Submit
    const handlePaymentSubmit = async (data) => {
        if (!paymentCustomer) return;
        
        setIsPaymentSubmitting(true);
        try {
            await customerService.recordCustomerPayment({
                customer_id: paymentCustomer.id,
                amount: data.amount,
                payment_method: data.payment_method,
                notes: data.notes || null,
                created_by: user?.name || 'Unknown', // USE ACTUAL USER NAME
            });
            
            addToast({ 
                type: 'success', 
                title: 'Payment Recorded', 
                message: `${formatCurrency(data.amount)} payment received from ${paymentCustomer.name}` 
            });
            
            setPaymentCustomer(null);
            refresh(); // Refresh customer data
        } catch (err) {
            addToast({ type: 'error', title: 'Error', message: err.message });
        } finally {
            setIsPaymentSubmitting(false);
        }
    };

    const handleCreateType = async (typeName) => {
        try {
            await createCustomerType(typeName);
            addToast({ 
                type: 'success', 
                title: 'Type Added', 
                message: `${typeName} type added successfully` 
            });
        } catch (err) {
            addToast({ type: 'error', title: 'Error', message: err.message });
            throw err;
        }
    };

    const handleConfirmDelete = async () => {
        if (!deletingCustomer) return;
        setIsDeleting(true);
        try {
            await deleteCustomer(deletingCustomer.id);
            addToast({ type: 'success', title: 'Customer Deleted', message: `${deletingCustomer.name} deleted` });
            setDeletingCustomer(null);
        } catch (err) { 
            addToast({ type: 'error', title: 'Error', message: err.message }); 
        } finally { 
            setIsDeleting(false); 
        }
    };

    return (
        <div className="p-1 mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-extrabold text-text-primary">Customers</h1>
                    <p className="text-sm text-text-muted mt-0.5">
                        Manage registered customers, purchases, payments & dues
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={refresh} 
                        className="w-10 h-10 rounded-xl border border-border-light hover:bg-app-surface-alt text-text-muted flex items-center justify-center transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                    <button 
                        onClick={handleAdd} 
                        type="button"
                        className="flex items-center gap-2 px-4 py-2.5 bg-[#f67315] hover:bg-[#ea580c] text-white font-semibold text-sm rounded-xl shadow-sm shadow-[#f67315]/20 transition-all cursor-pointer"
                    >
                        <Plus size={18} /> Add Customer
                    </button>
                </div>
            </div>

            {/* Stats */}
            <CustomerStats stats={stats} />

            {/* Search & Filter */}
            <CustomerFilters
                searchQuery={searchQuery} 
                onSearchChange={setSearchQuery}
                typeFilter={typeFilter} 
                onTypeFilterChange={setTypeFilter}
                dueFilter={dueFilter} 
                onDueFilterChange={setDueFilter}
                customerTypes={customerTypes}
            />

            {/* Error */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-4">
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
            )}

            {/* Table */}
            {isLoading ? (
                <div className="bg-card-bg rounded-2xl border border-border-light p-12 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-border-light border-t-[#f67315] rounded-full animate-spin" />
                </div>
            ) : (
                <CustomerList customers={customers} onRowClick={handleRowClick} />
            )}

            {/* Add/Edit Modal */}
            <CustomerFormModal 
                isOpen={showForm} 
                onClose={() => { setShowForm(false); setEditingCustomer(null); }} 
                title={editingCustomer ? 'Edit Customer' : 'Add Customer'} 
                isEditing={!!editingCustomer}
                defaultValues={editingCustomer || {}}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                customerTypes={customerTypes}
                onCreateType={handleCreateType}
            />

            {/* Detail Modal */}
            <CustomerDetailModal
                customer={selectedCustomer}
                isOpen={!!selectedCustomer}
                onClose={() => setSelectedCustomer(null)}
                onEdit={(c) => { setSelectedCustomer(null); handleEdit(c); }}
                onRecordPayment={handleRecordPayment}
            />

            {/* Payment Modal */}
            <CustomerPaymentModal
                customer={paymentCustomer}
                isOpen={!!paymentCustomer}
                onClose={() => setPaymentCustomer(null)}
                onSubmit={handlePaymentSubmit}
                isSubmitting={isPaymentSubmitting}
            />

            {/* Delete Confirmation */}
            <DeleteConfirmDialog 
                isOpen={!!deletingCustomer} 
                onClose={() => setDeletingCustomer(null)} 
                onConfirm={handleConfirmDelete} 
                customerName={deletingCustomer?.name || ''} 
                isLoading={isDeleting} 
            />
        </div>
    );
};

export default CustomersPage;