// src/features/purchases/components/purchaseWizard/StepProducts.jsx
import React from 'react';
import { Plus, ArrowRight, ArrowLeft, Package } from 'lucide-react';
import ProductRowItem from './ProductRowItem';
import { formatCurrency } from '../../../../shared/utils/currency';

const StepProducts = ({ items, setItems, categories, onCreateCategory, existingTypes, existingNames, onNext, onBack }) => {
    const subtotal = items.reduce((sum, item) => sum + (item.total_price || 0), 0);

    const addRow = () => {
        setItems([...items, {
            id: Date.now(),
            product_id: null,
            product_name: '',
            category_id: '',
            category_name: '',
            type: '',
            quantity: 1,
            cost_price: 0,
            sale_price: 0,
            total_price: 0,
            is_new: false,
        }]);
    };

    const updateRow = (id, fieldOrObject, value) => {
        setItems(prev => prev.map(item => {
            if (item.id !== id) return item;

            // Batch update: updateRow(id, { field1: val1, field2: val2 })
            if (typeof fieldOrObject === 'object' && fieldOrObject !== null) {
                const updated = { ...item, ...fieldOrObject };
                if (fieldOrObject.quantity !== undefined || fieldOrObject.cost_price !== undefined) {
                    updated.total_price = (updated.quantity || 0) * (updated.cost_price || 0);
                }
                return updated;
            }

            // Single field update: updateRow(id, 'field', value)
            const updated = { ...item, [fieldOrObject]: value };
            if (fieldOrObject === 'quantity' || fieldOrObject === 'cost_price') {
                updated.total_price = (updated.quantity || 0) * (updated.cost_price || 0);
            }
            return updated;
        }));
    };

    const removeRow = (id) => {
        setItems(items.filter(item => item.id !== id));
    };

    const canProceed = items.length > 0 && items.every(item => item.product_name && item.quantity > 0);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                        <Package size={20} className="text-emerald-600" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-text-primary">Add Products</h3>
                        <p className="text-xs text-text-muted">{items.length} items · {formatCurrency(subtotal)}</p>
                    </div>
                </div>
                <button onClick={addRow} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f67315] hover:bg-[#ea580c] text-white text-xs font-semibold rounded-lg transition-colors">
                    <Plus size={14} /> Add Row
                </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-border-light rounded-xl">
                <table className="w-full text-xs">
                    <thead className="bg-app-surface-alt/50 border-b border-border-light text-text-muted uppercase tracking-wider">
                        <tr>
                            <th className="px-3 py-2 text-left">Product</th>
                            <th className="px-3 py-2 text-left w-24">Category</th>
                            <th className="px-3 py-2 text-left w-20">Type</th>
                            <th className="px-3 py-2 text-center w-16">Qty</th>
                            <th className="px-3 py-2 text-right w-20">Cost</th>
                            <th className="px-3 py-2 text-right w-20">Sale</th>
                            <th className="px-3 py-2 text-right w-20">Total</th>
                            <th className="px-3 py-2 w-8"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-light">
                        {items.map((item) => (
                            <ProductRowItem
                                key={item.id}
                                item={item}
                                updateRow={updateRow}
                                removeRow={removeRow}
                                categories={categories}
                                existingTypes={existingTypes}
                                existingNames={existingNames}
                                onCreateCategory={onCreateCategory}
                            />
                        ))}
                        {items.length === 0 && (
                            <tr>
                                <td colSpan={8} className="px-4 py-8 text-center text-text-muted text-xs">
                                    Click "Add Row" to add products to this purchase
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Navigation */}
            <div className="flex gap-3 pt-4 border-t border-border-light">
                <button onClick={onBack} className="flex items-center gap-2 px-4 py-2.5 border border-border-medium text-text-secondary font-semibold text-sm rounded-xl hover:bg-app-surface-alt transition-colors">
                    <ArrowLeft size={16} /> Back
                </button>
                <button onClick={onNext} disabled={!canProceed} className="flex items-center gap-2 px-4 py-2.5 bg-[#f67315] hover:bg-[#ea580c] text-white font-semibold text-sm rounded-xl transition-colors disabled:opacity-50 ml-auto shadow-sm shadow-[#f67315]/20">
                    Payment <ArrowRight size={16} />
                </button>
            </div>
        </div>
    );
};

export default StepProducts;