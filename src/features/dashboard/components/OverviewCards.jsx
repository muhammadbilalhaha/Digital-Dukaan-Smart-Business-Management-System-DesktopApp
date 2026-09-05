// src/features/dashboard/components/OverviewCards.jsx
import React from 'react';
import { TrendingUp, Wallet, Users, DollarSign } from 'lucide-react';
import { formatCurrency } from '../../../shared/utils/currency';
import MetricCard from './MetricCard';

const OverviewCards = ({ data = {}, onNavigate }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <MetricCard
                title="Today's Sales"
                value={formatCurrency(data.today_sales || 0)}
                subtext={`${data.today_sales_count || 0} transaction${data.today_sales_count !== 1 ? 's' : ''}`}
                icon={TrendingUp}
                onClick={() => onNavigate?.('sales')}
                trend="up"
                trendValue="12%"
            />
            <MetricCard
                title="Money Received"
                value={formatCurrency(data.money_received || 0)}
                subtext={`${data.payment_count || 0} payment${data.payment_count !== 1 ? 's' : ''}`}
                icon={Wallet}
                onClick={() => onNavigate?.('payment-system')}
            />
            <MetricCard
                title="Customer Due"
                value={formatCurrency(data.customer_due || 0)}
                subtext={`${data.customer_count || 0} customer${data.customer_count !== 1 ? 's' : ''}`}
                icon={Users}
                onClick={() => onNavigate?.('customers')}
            />
            <MetricCard
                title="Today's Expenses"
                value={formatCurrency(data.today_expenses || 0)}
                subtext={`${data.expense_count || 0} entry${data.expense_count !== 1 ? 'ies' : ''}`}
                icon={DollarSign}
                onClick={() => onNavigate?.('expenses')}
            />
        </div>
    );
};

export default OverviewCards;