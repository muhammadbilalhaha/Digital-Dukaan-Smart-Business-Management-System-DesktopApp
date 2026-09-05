// src/features/purchases/pages/PurchasesPage.jsx
import React, { useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { usePurchases } from '../hooks/usePurchases';
import useUiStore from '../../../store/ui.store';
import useAuthStore from '../../../store/authStore';
import PurchaseStats from '../components/PurchaseStats';
import PurchaseSearch from '../components/PurchaseSearch';
import PurchaseTable from '../components/PurchaseTable';
import PurchaseDetailModal from '../components/PurchaseDetailModal';
import PurchaseWizard from '../components/purchaseWizard/PurchaseWizard';
import PurchasePaymentModal from '../components/PurchasePaymentModal';
import DeleteConfirmDialog from '../components/DeleteConfirmDialog';
import { formatCurrency } from '../../../shared/utils/currency';

const PurchasesPage = () => {
    const {
        purchases, suppliers, stats, purchaseSettings, isLoading, error,
        searchQuery, supplierFilter, statusFilter, sortBy,
        setSearchQuery, setSupplierFilter, setStatusFilter, setSortBy,
        createPurchase, deletePurchase, createSupplier, refresh,
    } = usePurchases();

    const { addToast } = useUiStore();
    const user = useAuthStore((state) => state.user);

    const [showWizard, setShowWizard] = useState(false);
    const [selectedPurchase, setSelectedPurchase] = useState(null);
    const [editingPurchase, setEditingPurchase] = useState(null);
    const [deletingPurchase, setDeletingPurchase] = useState(null);
    const [paymentPurchase, setPaymentPurchase] = useState(null);
    const [showPayment, setShowPayment] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isPaying, setIsPaying] = useState(false);

    // Get categories, types, names from products
    const [categories, setCategories] = useState([]);
    const [existingTypes, setExistingTypes] = useState([]);
    const [existingNames, setExistingNames] = useState([]);

    const handleOpenWizard = async () => {
        try {
            const { invoke } = await import('../../../tauri/commands');
            const [cats, prods] = await Promise.all([
                invoke('get_categories'),
                invoke('get_products'),
            ]);
            setCategories(cats || []);
            setExistingTypes([...new Set((prods || []).map(p => p.type).filter(Boolean))].sort());
            setExistingNames([...new Set((prods || []).map(p => p.name).filter(Boolean))].sort());
        } catch (err) { /* use empty arrays */ }
        setEditingPurchase(null);
        setShowWizard(true);
    };

    const handleRowClick = (p) => setSelectedPurchase(p);

    // ─── Edit Purchase ────────────────────────────────────

    const handleEditPurchase = (purchase) => {
        setSelectedPurchase(null);
        setEditingPurchase(purchase);
        // Load reference data
        (async () => {
            try {
                const { invoke } = await import('../../../tauri/commands');
                const [cats, prods] = await Promise.all([
                    invoke('get_categories'),
                    invoke('get_products'),
                ]);
                setCategories(cats || []);
                setExistingTypes([...new Set((prods || []).map(p => p.type).filter(Boolean))].sort());
                setExistingNames([...new Set((prods || []).map(p => p.name).filter(Boolean))].sort());
            } catch (err) { /* use empty arrays */ }
        })();
        setShowWizard(true);
    };

    // ─── Delete Purchase ──────────────────────────────────

    const handleDeletePurchase = (purchase) => {
        setSelectedPurchase(null);
        setDeletingPurchase(purchase);
    };

    const handleConfirmDelete = async () => {
        if (!deletingPurchase) return;
        setIsDeleting(true);
        try {
            await deletePurchase(deletingPurchase.id);
            addToast({ type: 'success', title: 'Purchase Deleted', message: 'Purchase has been deleted' });
            setDeletingPurchase(null);
        } catch (err) {
            addToast({ type: 'error', title: 'Error', message: err.message });
        } finally { setIsDeleting(false); }
    };

    // ─── Record Payment ──────────────────────────────────

    const handleRecordPayment = (purchase) => {
        setSelectedPurchase(null);
        setPaymentPurchase(purchase);
        setShowPayment(true);
    };

    const handlePaymentSubmit = async (data) => {
        setIsPaying(true);
        try {
            const { invoke } = await import('../../../tauri/commands');
            await invoke('record_purchase_payment', {
                purchaseId: paymentPurchase.id,
                amount: data.amount,
                paymentMethod: data.payment_method,
                notes: data.notes || null,
                createdBy: user?.name || 'Unknown',
            });
            addToast({ type: 'success', title: 'Payment Recorded', message: `${formatCurrency(data.amount)} payment recorded` });
            setShowPayment(false);
            setPaymentPurchase(null);
            refresh();
        } catch (err) {
            addToast({ type: 'error', title: 'Error', message: err.message });
        } finally { setIsPaying(false); }
    };

    // ─── Void Purchase (Future) ──────────────────────────

    const handleVoidPurchase = (purchase) => {
        // For V1, treat as delete
        handleDeletePurchase(purchase);
    };

    // ─── Wizard Submit ───────────────────────────────────

    const handleWizardSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            await createPurchase({ ...data, created_by: user?.name || 'Unknown' });
            addToast({ type: 'success', title: 'Purchase Saved', message: 'Purchase recorded successfully' });
            setShowWizard(false);
            setEditingPurchase(null);
        } catch (err) {
            addToast({ type: 'error', title: 'Error', message: err.message });
        } finally { setIsSubmitting(false); }
    };

    return (
        <div className="p-1 mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-extrabold text-text-primary">Purchases</h1>
                    <p className="text-sm text-text-muted mt-0.5">Manage inventory purchases and supplier transactions</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={refresh} className="w-10 h-10 rounded-xl border border-border-light hover:bg-app-surface-alt text-text-muted flex items-center justify-center transition-colors"><RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} /></button>
                    <button onClick={handleOpenWizard} className="flex items-center gap-2 px-4 py-2.5 bg-[#f67315] hover:bg-[#ea580c] text-white font-semibold text-sm rounded-xl shadow-sm shadow-[#f67315]/20 transition-all">
                        <Plus size={18} /> Add Purchase
                    </button>
                </div>
            </div>

            {/* Stats */}
            <PurchaseStats stats={stats} />

            {/* Search & Filters */}
            <PurchaseSearch
                searchQuery={searchQuery} onSearchChange={setSearchQuery}
                supplierFilter={supplierFilter} onSupplierChange={setSupplierFilter}
                statusFilter={statusFilter} onStatusChange={setStatusFilter}
                sortBy={sortBy} onSortChange={setSortBy}
                suppliers={suppliers}
            />

            {/* Error */}
            {error && <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-4"><p className="text-sm text-red-600 dark:text-red-400">{error}</p></div>}

            {/* Table */}
            {isLoading ? (
                <div className="bg-card-bg rounded-2xl border border-border-light p-12 flex items-center justify-center"><div className="w-8 h-8 border-4 border-border-light border-t-[#f67315] rounded-full animate-spin" /></div>
            ) : (
                <PurchaseTable purchases={purchases} onRowClick={handleRowClick} />
            )}


            <PurchaseWizard
                isOpen={showWizard}
                onClose={() => {
                    setShowWizard(false);
                    setEditingPurchase(null);
                    // Reset categories
                    setCategories([]);
                    setExistingTypes([]);
                    setExistingNames([]);
                }}
                suppliers={suppliers}
                categories={categories}
                existingTypes={existingTypes}
                existingNames={existingNames}
                onCreateSupplier={createSupplier}
                onSubmit={handleWizardSubmit}
                isSubmitting={isSubmitting}
                editPurchase={editingPurchase}
                settings={purchaseSettings}
            />

            {/* Detail Modal */}
            <PurchaseDetailModal
                purchase={selectedPurchase}
                isOpen={!!selectedPurchase}
                onClose={() => setSelectedPurchase(null)}
                onEdit={handleEditPurchase}
                onVoid={handleVoidPurchase}
                onRecordPayment={handleRecordPayment}
            />

            {/* Record Payment Modal */}
            <PurchasePaymentModal
                purchase={paymentPurchase}
                isOpen={showPayment}
                onClose={() => { setShowPayment(false); setPaymentPurchase(null); }}
                onSubmit={handlePaymentSubmit}
                isSubmitting={isPaying}
            />

            {/* Delete Confirmation */}
            <DeleteConfirmDialog
                isOpen={!!deletingPurchase}
                onClose={() => setDeletingPurchase(null)}
                onConfirm={handleConfirmDelete}
                purchaseNumber={deletingPurchase?.purchase_number || `P-${String(deletingPurchase?.id || 0).padStart(4, '0')}`}
                isLoading={isDeleting}
            />
        </div>
    );
};

export default PurchasesPage;