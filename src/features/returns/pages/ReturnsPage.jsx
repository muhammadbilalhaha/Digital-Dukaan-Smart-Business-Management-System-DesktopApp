// src/features/returns/pages/ReturnsPage.jsx
import React, { useState, useEffect } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useReturns } from '../hooks/useReturns';
import useUiStore from '../../../store/ui.store';
import useAuthStore from '../../../store/authStore';
import ReturnStats from '../components/ReturnStats';
import ReturnSearch from '../components/ReturnSearch';
import ReturnsTable from '../components/ReturnsTable';
import ReturnDetailModal from '../components/ReturnDetailModal';
import NewReturnWizard from '../components/NewReturnWizard';

const ReturnsPage = () => {
    const { 
        returns, 
        stats, 
        isLoading, 
        createReturn, 
        searchSales, 
        getSaleItemsForReturn, 
        getReturn,  // NEW
        refresh 
    } = useReturns();
    
    const { addToast } = useUiStore();
    const user = useAuthStore((state) => state.user);
    const location = useLocation();
    const navigate = useNavigate();

    const [searchQuery, setSearchQuery] = useState('');
    const [refundFilter, setRefundFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showNewReturn, setShowNewReturn] = useState(false);
    const [selectedReturn, setSelectedReturn] = useState(null);
    const [isLoadingDetail, setIsLoadingDetail] = useState(false);

    // Handle navigation state from sales page
    useEffect(() => {
        if (location.state?.openReturnSaleId) {
            const saleId = location.state.openReturnSaleId;
            console.log('Opening return for sale:', saleId);
            setShowNewReturn(true);
            // Clear state
            navigate('/returns', { replace: true, state: {} });
        }
    }, [location.state]);

    const filteredReturns = (returns || []).filter(r => {
        const matchSearch = !searchQuery ||
            r.return_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.sale_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.customer_name?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchRefund = refundFilter === 'all' || r.refund_method === refundFilter;
        const matchStatus = statusFilter === 'all' || r.status === statusFilter;
        return matchSearch && matchRefund && matchStatus;
    });

    // UPDATED: Fetch full return details when clicking a row
    const handleRowClick = async (returnItem) => {
        console.log('Row clicked:', returnItem);
        setIsLoadingDetail(true);
        try {
            const fullReturn = await getReturn(returnItem.id);
            console.log('Full return details:', fullReturn);
            setSelectedReturn(fullReturn);
        } catch (err) {
            console.error('Failed to load return details:', err);
            addToast({ 
                type: 'error', 
                title: 'Error', 
                message: err.message || 'Failed to load return details' 
            });
            setSelectedReturn(returnItem); // Fallback to basic data
        } finally {
            setIsLoadingDetail(false);
        }
    };

    return (
        <div className="p-1 mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-extrabold text-text-primary">Returns</h1>
                    <p className="text-sm text-text-muted mt-0.5">Manage customer product returns, refunds & stock adjustments</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={refresh} className="w-10 h-10 rounded-xl border border-border-light hover:bg-app-surface-alt text-text-muted flex items-center justify-center transition-colors">
                        <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                    <button onClick={() => setShowNewReturn(true)} className="flex items-center gap-2 px-4 py-2.5 bg-[#f67315] hover:bg-[#ea580c] text-white font-semibold text-sm rounded-xl shadow-sm shadow-[#f67315]/20 transition-all">
                        <Plus size={18} /> New Return
                    </button>
                </div>
            </div>

            <ReturnStats stats={stats} />

            <ReturnSearch 
                searchQuery={searchQuery} 
                onSearchChange={setSearchQuery} 
                refundFilter={refundFilter} 
                onRefundFilterChange={setRefundFilter} 
                statusFilter={statusFilter} 
                onStatusFilterChange={setStatusFilter} 
            />

            {isLoading ? (
                <div className="bg-card-bg rounded-2xl border border-border-light p-12 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-border-light border-t-[#f67315] rounded-full animate-spin" />
                </div>
            ) : (
                <ReturnsTable returns={filteredReturns} onRowClick={handleRowClick} />
            )}

            <NewReturnWizard 
                isOpen={showNewReturn} 
                onClose={() => { setShowNewReturn(false); refresh(); }} 
                user={user} 
                searchSales={searchSales} 
                getSaleItemsForReturn={getSaleItemsForReturn} 
                createReturn={createReturn} 
            />

            <ReturnDetailModal 
                returnData={selectedReturn} 
                isOpen={!!selectedReturn} 
                onClose={() => setSelectedReturn(null)} 
            />

            {/* Loading indicator for detail */}
            {isLoadingDetail && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 backdrop-blur-sm">
                    <div className="w-10 h-10 border-4 border-border-light border-t-[#f67315] rounded-full animate-spin" />
                </div>
            )}
        </div>
    );
};

export default ReturnsPage;