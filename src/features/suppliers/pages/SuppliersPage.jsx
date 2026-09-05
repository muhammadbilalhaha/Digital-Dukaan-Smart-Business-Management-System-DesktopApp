// src/features/suppliers/pages/SuppliersPage.jsx
import React, { useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { useSuppliers } from '../hooks/useSuppliers';
import useUiStore from '../../../store/ui.store';
import SupplierStats from '../components/SupplierStats';
import SupplierSearch from '../components/SupplierSearch';
import SupplierTable from '../components/SupplierTable';
import SupplierForm from '../components/SupplierForm';
import SupplierDialog from '../components/SupplierDialog';
import SupplierDetailModal from '../components/SupplierDetailModal';
import PaymentDialog from '../components/PaymentDialog';
import PaymentForm from '../components/PaymentForm';
import DeleteConfirmDialog from '../components/DeleteConfirmDialog';
import { formatCurrency } from '../../../shared/utils/currency';
import useAuthStore from '../../../store/authStore';

const SuppliersPage = () => {
    const {
        suppliers, stats, isLoading, error,
        searchQuery, filterType, sortBy,
        setSearchQuery, setFilterType, setSortBy,
        createSupplier, updateSupplier, deleteSupplier,
        recordPayment, refresh,
    } = useSuppliers();

    const { addToast } = useUiStore();
    const user = useAuthStore((state) => state.user);

    // Form state
    const [showForm, setShowForm] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Delete state
    const [deletingSupplier, setDeletingSupplier] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Detail modal state
    const [selectedSupplier, setSelectedSupplier] = useState(null);

    // Payment state
    const [showPayment, setShowPayment] = useState(false);
    const [paymentSupplier, setPaymentSupplier] = useState(null);
    const [isPaying, setIsPaying] = useState(false);

    // ─── Handlers ────────────────────────────────────────

    const handleAdd = () => { setEditingSupplier(null); setShowForm(true); };

    const handleEdit = (s) => { setEditingSupplier(s); setShowForm(true); };

    const handleRowClick = (s) => setSelectedSupplier(s);

    const handleDelete = (s) => setDeletingSupplier(s);

    const handleRecordPayment = (supplier) => {
        setPaymentSupplier(supplier);
        setShowPayment(true);
    };

    // ─── Submit: Add/Edit Supplier ──────────────────────

    const handleSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            if (editingSupplier) {
                await updateSupplier(editingSupplier.id, data);
                addToast({ type: 'success', title: 'Supplier Updated', message: `${data.name} updated` });
            } else {
                await createSupplier(data);
                addToast({ type: 'success', title: 'Supplier Added', message: `${data.name} added` });
            }
            setShowForm(false);
            setEditingSupplier(null);
        } catch (err) {
            addToast({ type: 'error', title: 'Error', message: err.message });
        } finally { setIsSubmitting(false); }
    };

    // ─── Submit: Delete Supplier ────────────────────────

    const handleConfirmDelete = async () => {
        if (!deletingSupplier) return;
        setIsDeleting(true);
        try {
            await deleteSupplier(deletingSupplier.id);
            addToast({ type: 'success', title: 'Supplier Deleted', message: `${deletingSupplier.name} deleted` });
            setDeletingSupplier(null);
        } catch (err) {
            addToast({ type: 'error', title: 'Error', message: err.message });
        } finally { setIsDeleting(false); }
    };

    // ─── Submit: Record Payment ─────────────────────────

    const handlePaymentSubmit = async (data) => {
        console.log(data, user)
        setIsPaying(true);
        try {
            await recordPayment({
                ...data,
                created_by: user?.name || 'Unknown',
            });
            addToast({ type: 'success', title: 'Payment Recorded', message: `${formatCurrency(data.amount)} payment recorded` });
            setShowPayment(false);
            setPaymentSupplier(null);
        } catch (err) {
            addToast({ type: 'error', title: 'Error', message: err.message });
        } finally { setIsPaying(false); }
    };

    // ─── Render ──────────────────────────────────────────

    return (
        <div className="p-1 mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-extrabold text-text-primary">Suppliers</h1>
                    <p className="text-sm text-text-muted mt-0.5">Manage your suppliers & vendors</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={refresh} className="w-10 h-10 rounded-xl border border-border-light hover:bg-app-surface-alt text-text-muted flex items-center justify-center transition-colors">
                        <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                    <button onClick={handleAdd} className="flex items-center gap-2 px-4 py-2.5 bg-[#f67315] hover:bg-[#ea580c] text-white font-semibold text-sm rounded-xl shadow-sm shadow-[#f67315]/20 transition-all">
                        <Plus size={18} /> Add Supplier
                    </button>
                </div>
            </div>

            {/* Stats */}
            <SupplierStats stats={stats} />

            {/* Search */}
            <SupplierSearch
                searchQuery={searchQuery} onSearchChange={setSearchQuery}
                filterType={filterType} onFilterChange={setFilterType}
                sortBy={sortBy} onSortChange={setSortBy}
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
                <SupplierTable
                    suppliers={suppliers}
                    onRowClick={handleRowClick}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            )}

            {/* Add/Edit Dialog */}
            <SupplierDialog
                isOpen={showForm}
                onClose={() => { setShowForm(false); setEditingSupplier(null); }}
                title={editingSupplier ? 'Edit Supplier' : 'Add Supplier'}
                isEditing={!!editingSupplier}
            >
                <SupplierForm
                    defaultValues={editingSupplier || {}}
                    onSubmit={handleSubmit}
                    onCancel={() => { setShowForm(false); setEditingSupplier(null); }}
                    isSubmitting={isSubmitting}
                    isEditing={!!editingSupplier}
                />
            </SupplierDialog>

            {/* Supplier Detail Modal */}
            <SupplierDetailModal
                supplier={selectedSupplier}
                isOpen={!!selectedSupplier}
                onClose={() => setSelectedSupplier(null)}
                onEdit={(s) => { setSelectedSupplier(null); handleEdit(s); }}
                onDelete={(s) => { setSelectedSupplier(null); handleDelete(s); }}
                onRecordPayment={handleRecordPayment}
            />

            {/* Record Payment Dialog */}
            <PaymentDialog
                isOpen={showPayment}
                onClose={() => { setShowPayment(false); setPaymentSupplier(null); }}
                title="Record Payment"
            >
                <PaymentForm
                    supplier={paymentSupplier}
                    onSubmit={handlePaymentSubmit}
                    onCancel={() => { setShowPayment(false); setPaymentSupplier(null); }}
                    isSubmitting={isPaying}
                />
            </PaymentDialog>

            {/* Delete Confirmation */}
            <DeleteConfirmDialog
                isOpen={!!deletingSupplier}
                onClose={() => setDeletingSupplier(null)}
                onConfirm={handleConfirmDelete}
                supplierName={deletingSupplier?.name || ''}
                isLoading={isDeleting}
            />
        </div>
    );
};

export default SuppliersPage;