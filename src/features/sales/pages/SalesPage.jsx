// src/features/sales/pages/SalesPage.jsx
import React, { useState, useMemo, useCallback } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { useSales } from '../hooks/useSales';
import useUiStore from '../../../store/ui.store';
import useAuthStore from '../../../store/authStore';
import SalesStats from '../components/SalesStats';
import SalesFilters from '../components/SalesFilters';
import SalesList from '../components/SalesList';
import NewSaleModal from '../components/NewSaleModal/NewSaleModal';
import SaleDetailModal from '../components/SaleDetailModal';
import { saleService } from '../services/saleService';
import { useNavigate } from 'react-router-dom';

const SalesPage = () => {
    const { 
        sales, 
        customers, 
        stats, 
        salesSettings, // GET SETTINGS
        isLoading, 
        createSale, 
        searchProducts, 
        createCustomer, 
        refresh 
    } = useSales();
    
    const { addToast } = useUiStore();
    const user = useAuthStore((state) => state.user);
    const navigate = useNavigate();

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [paymentFilter, setPaymentFilter] = useState('all');

    const [showNewSale, setShowNewSale] = useState(false);
    const [selectedSale, setSelectedSale] = useState(null);
    const [isLoadingDetail, setIsLoadingDetail] = useState(false);

    const filteredSales = useMemo(() => {
        return sales.filter(s => {
            const matchSearch = !searchQuery ||
                s.sale_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.customer_name?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchStatus = statusFilter === 'all' || s.payment_status === statusFilter;
            const matchPayment = paymentFilter === 'all' || s.payment_method === paymentFilter;
            return matchSearch && matchStatus && matchPayment;
        });
    }, [sales, searchQuery, statusFilter, paymentFilter]);

    const handleSaleClick = useCallback(async (sale) => {
        setIsLoadingDetail(true);
        try {
            const fullSale = await saleService.getSale(sale.id);
            setSelectedSale(fullSale);
        } catch (err) {
            console.error('Failed to load sale details:', err);
            addToast({ type: 'error', title: 'Error', message: err.message });
            setSelectedSale(sale);
        } finally {
            setIsLoadingDetail(false);
        }
    }, [addToast]);

    return (
        <div className="p-1 mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-extrabold text-text-primary">Sales</h1>
                    <p className="text-sm text-text-muted mt-0.5">Manage sales invoices & payments</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={refresh} className="w-10 h-10 rounded-xl border border-border-light hover:bg-app-surface-alt text-text-muted flex items-center justify-center transition-colors">
                        <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                    <button onClick={() => setShowNewSale(true)} className="flex items-center gap-2 px-4 py-2.5 bg-[#f67315] hover:bg-[#ea580c] text-white font-semibold text-sm rounded-xl shadow-sm shadow-[#f67315]/20 transition-all">
                        <Plus size={18} /> New Sale
                    </button>
                </div>
            </div>

            <SalesStats stats={stats} />

            <SalesFilters 
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                paymentFilter={paymentFilter}
                setPaymentFilter={setPaymentFilter}
            />

            {isLoading ? (
                <div className="bg-card-bg rounded-2xl border border-border-light p-12 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-border-light border-t-[#f67315] rounded-full animate-spin" />
                </div>
            ) : (
                <SalesList sales={filteredSales} isLoading={isLoading} onSaleClick={handleSaleClick} />
            )}

            <NewSaleModal 
                isOpen={showNewSale}
                onClose={() => setShowNewSale(false)}
                customers={customers}
                createCustomer={createCustomer}
                searchProducts={searchProducts}
                createSale={createSale}
                user={user}
                addToast={addToast}
                settings={salesSettings} // PASS SETTINGS
            />

            {selectedSale && (
                <SaleDetailModal 
                    sale={selectedSale}
                    isOpen={!!selectedSale}
                    onClose={() => setSelectedSale(null)}
                    onViewCustomer={(sale) => {
                        setSelectedSale(null);
                        if (sale.customer_id && sale.customer_id !== 1) {
                            navigate('/customers', { state: { openCustomerId: sale.customer_id } });
                        }
                    }}
                    onViewPayment={(sale) => {
                        setSelectedSale(null);
                        navigate('/payment-system', { state: { openPaymentId: sale.id, paymentType: 'customer' } });
                    }}
                    onPrintReceipt={() => window.print()}
                    onReturnProducts={(sale) => {
                        setSelectedSale(null);
                        navigate('/returns', { state: { openReturnSaleId: sale.id } });
                    }}
                />
            )}

            {isLoadingDetail && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 backdrop-blur-sm">
                    <div className="w-10 h-10 border-4 border-border-light border-t-[#f67315] rounded-full animate-spin" />
                </div>
            )}
        </div>
    );
};

export default SalesPage;