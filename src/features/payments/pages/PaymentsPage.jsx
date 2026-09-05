// src/features/payments/pages/PaymentsPage.jsx
import React, { useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { usePayments } from '../hooks/usePayments';
import useUiStore from '../../../store/ui.store';
import useAuthStore from '../../../store/authStore';
import PaymentStats from '../components/PaymentStats';
import PaymentTabs from '../components/PaymentTabs';
import PaymentTable from '../components/PaymentTable';
import PaymentDetailModal from '../components/PaymentDetailModal';
import RecordPaymentDialog from '../components/RecordPaymentDialog';
import RecordPaymentForm from '../components/RecordPaymentForm';
import { formatCurrency } from '../../../shared/utils/currency';

const PaymentsPage = () => {
    const { 
        payments, 
        customers, 
        suppliers, 
        stats, 
        isLoading, 
        error, 
        activeTab, 
        searchQuery, 
        sortBy, 
        setActiveTab, 
        setSearchQuery, 
        setSortBy, 
        recordPayment, 
        refresh 
    } = usePayments();
    
    const { addToast } = useUiStore();
    const user = useAuthStore((state) => state.user);

    const [showRecord, setShowRecord] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [filterStatus, setFilterStatus] = useState('all');

    const handleRowClick = (p) => setSelectedPayment(p);
    
    const handleRecordSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            await recordPayment({ ...data, created_by: user?.name || 'Unknown' });
            addToast({ type: 'success', title: 'Payment Recorded', message: `${formatCurrency(data.amount)} payment saved` });
            setShowRecord(false);
        } catch (err) {
            addToast({ type: 'error', title: 'Error', message: err.message });
        } finally { 
            setIsSubmitting(false); 
        }
    };

    // Filter payments based on filterStatus
    const getFilteredPayments = () => {
        if (filterStatus === 'all') return payments;
        return payments.filter(p => p.payment_method === filterStatus);
    };

    const filteredPayments = getFilteredPayments();

    return (
        <div className="p-1 mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-extrabold text-text-primary">Payments</h1>
                    <p className="text-sm text-text-muted mt-0.5">Track all incoming & outgoing payments</p>
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
                        onClick={() => setShowRecord(true)} 
                        className="flex items-center gap-2 px-4 py-2.5 bg-[#f67315] hover:bg-[#ea580c] text-white font-semibold text-sm rounded-xl shadow-sm shadow-[#f67315]/20 transition-all"
                    >
                        <Plus size={18} /> Record Payment
                    </button>
                </div>
            </div>

            {/* Stats */}
            <PaymentStats stats={stats} />

            {/* Tabs with Search, Filter, and Sort */}
            <PaymentTabs 
                activeTab={activeTab} 
                onTabChange={setActiveTab}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                filterStatus={filterStatus}
                onFilterChange={setFilterStatus}
                sortBy={sortBy}
                onSortChange={setSortBy}
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
                <PaymentTable 
                    payments={filteredPayments} 
                    onRowClick={handleRowClick} 
                    activeTab={activeTab} 
                />
            )}

            {/* Payment Detail Modal */}
            <PaymentDetailModal 
                payment={selectedPayment} 
                isOpen={!!selectedPayment} 
                onClose={() => setSelectedPayment(null)} 
                activeTab={activeTab} 
            />

            {/* Record Payment Dialog */}
            <RecordPaymentDialog 
                isOpen={showRecord} 
                onClose={() => setShowRecord(false)} 
                title="Record Payment"
            >
                <RecordPaymentForm 
                    activeTab={activeTab} 
                    customers={customers} 
                    suppliers={suppliers} 
                    onSubmit={handleRecordSubmit} 
                    onCancel={() => setShowRecord(false)} 
                    isSubmitting={isSubmitting} 
                />
            </RecordPaymentDialog>
        </div>
    );
};

export default PaymentsPage;