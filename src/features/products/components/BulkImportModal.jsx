// src/features/products/components/BulkImportModal.jsx
import React, { useState, useRef } from 'react';
import { X, Upload, FileSpreadsheet, FileJson, FileText, Loader2, CheckCircle2, AlertTriangle, Download } from 'lucide-react';
import { invoke } from '../../../tauri/commands';
import { readTextFile } from '@tauri-apps/plugin-fs';
import { open } from '@tauri-apps/plugin-dialog';
import useUiStore from '../../../store/ui.store';
import useAuthStore from '../../../store/authStore'; // ADDED: Import auth store

const BulkImportModal = ({ isOpen, onClose, categories, onCreateCategory, onImportComplete }) => {
    const [fileName, setFileName] = useState('');
    const [fileType, setFileType] = useState('');
    const [parsedData, setParsedData] = useState([]);
    const [isParsing, setIsParsing] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [previewData, setPreviewData] = useState([]);
    const [errors, setErrors] = useState([]);
    const [successCount, setSuccessCount] = useState(0);
    const fileInputRef = useRef(null);
    const { addToast } = useUiStore();
    const user = useAuthStore((state) => state.user); // ADDED: Get current user

    const capitalize = (str) => {
        if (!str || typeof str !== 'string') return '';
        return str.trim().split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    };

    const handleFileSelect = async () => {
        try {
            const selected = await open({
                title: 'Select Product File',
                filters: [
                    { name: 'Data Files', extensions: ['csv', 'json', 'xlsx', 'xls'] },
                    { name: 'CSV', extensions: ['csv'] },
                    { name: 'JSON', extensions: ['json'] },
                    { name: 'Excel', extensions: ['xlsx', 'xls'] },
                ]
            });

            if (!selected) return;

            const path = selected;
            const extension = path.split('.').pop().toLowerCase();
            const name = path.split('/').pop() || path.split('\\').pop() || 'file';
            
            setFileName(name);
            setFileType(extension);
            setIsParsing(true);

            const content = await readTextFile(path);
            let data = [];

            if (extension === 'csv') {
                data = parseCSV(content);
            } else if (extension === 'json') {
                data = parseJSON(content);
            } else if (extension === 'xlsx' || extension === 'xls') {
                addToast({ type: 'warning', title: 'Excel Support', message: 'Please convert Excel to CSV or JSON for import' });
                setIsParsing(false);
                return;
            }

            setParsedData(data);
            setPreviewData(data.slice(0, 10));
            
            const validationErrors = validateData(data);
            setErrors(validationErrors);

        } catch (err) {
            console.error('File read failed:', err);
            addToast({ type: 'error', title: 'File Error', message: err.message });
        } finally {
            setIsParsing(false);
        }
    };

    const parseCSV = (content) => {
        const lines = content.split('\n').filter(line => line.trim());
        if (lines.length < 2) return [];

        const headers = parseCSVLine(lines[0]);
        const data = [];

        for (let i = 1; i < lines.length; i++) {
            const values = parseCSVLine(lines[i]);
            if (values.length === 0) continue;

            const row = {};
            headers.forEach((header, index) => {
                row[header.trim().toLowerCase().replace(/\s+/g, '_')] = values[index]?.trim() || '';
            });
            data.push(row);
        }

        return data;
    };

    const parseCSVLine = (line) => {
        const result = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current);
        return result;
    };

    const parseJSON = (content) => {
        try {
            const parsed = JSON.parse(content);
            if (Array.isArray(parsed)) return parsed;
            if (parsed.products && Array.isArray(parsed.products)) return parsed.products;
            if (parsed.data && Array.isArray(parsed.data)) return parsed.data;
            return [];
        } catch (err) {
            throw new Error('Invalid JSON format');
        }
    };

    const validateData = (data) => {
        const errors = [];
        
        data.forEach((row, index) => {
            const name = row.name || row.product_name || row.product || '';
            const costPrice = parseFloat(row.cost_price || row.cost || row.purchase_price || 0);
            const salePrice = parseFloat(row.sale_price || row.sale || row.price || 0);
            
            if (!name) {
                errors.push(`Row ${index + 1}: Product name is required`);
            }
            if (isNaN(costPrice) || costPrice < 0) {
                errors.push(`Row ${index + 1}: Invalid cost price`);
            }
            if (isNaN(salePrice) || salePrice < 0) {
                errors.push(`Row ${index + 1}: Invalid sale price`);
            }
        });

        return errors;
    };

    const mapToProduct = (row) => {
        const categoryName = capitalize(row.category || row.category_name || row.category || '');
        const category = categories.find(c => c.name.toLowerCase() === categoryName.toLowerCase());
        
        return {
            name: capitalize(row.name || row.product_name || row.product || ''),
            category_id: category?.id || null,
            type: capitalize(row.type || ''),
            cost_price: parseFloat(row.cost_price || row.cost || row.purchase_price || 0),
            sale_price: parseFloat(row.sale_price || row.sale || row.price || 0),
            stock: parseInt(row.stock || row.quantity || row.qty || 0),
            low_stock_limit: parseInt(row.low_stock_limit || 0) || 10,
            created_by: user?.name || 'Unknown', // ADDED: Auto-add current user
        };
    };

    const handleImport = async () => {
        if (parsedData.length === 0) {
            addToast({ type: 'error', title: 'No Data', message: 'No valid data to import' });
            return;
        }

        if (errors.length > 0) {
            addToast({ type: 'error', title: 'Validation Errors', message: `Please fix ${errors.length} errors before importing` });
            return;
        }

        setIsImporting(true);
        let success = 0;
        const failedProducts = [];

        try {
            for (const row of parsedData) {
                try {
                    const productData = mapToProduct(row);
                    
                    if (productData.name) {
                        // FIXED: create_product already receives created_by in request
                        await invoke('create_product', { request: productData });
                        success++;
                    }
                } catch (err) {
                    failedProducts.push({
                        name: row.name || row.product_name || 'Unknown',
                        error: err.message
                    });
                }
            }

            setSuccessCount(success);

            if (success > 0) {
                addToast({ 
                    type: 'success', 
                    title: 'Import Complete', 
                    message: `${success} products imported successfully by ${user?.name || 'Unknown'}` 
                });
                onImportComplete?.();
            }

            if (failedProducts.length > 0) {
                addToast({ 
                    type: 'warning', 
                    title: 'Partial Import', 
                    message: `${failedProducts.length} products failed to import` 
                });
            }

        } catch (err) {
            console.error('Import failed:', err);
            addToast({ type: 'error', title: 'Import Failed', message: err.message });
        } finally {
            setIsImporting(false);
        }
    };

    const downloadTemplate = () => {
        const headers = ['name', 'category', 'type', 'cost_price', 'sale_price', 'stock', 'low_stock_limit'];
        const sampleData = [
            ['Math Book Grade 8', 'Books', 'Book', '350', '500', '100', '10'],
            ['Blue Pen', 'Stationery', 'Pen', '20', '30', '500', '50'],
            ['Notebook A4', 'Stationery', 'Notebook', '120', '180', '200', '20'],
        ];
        
        let csv = headers.join(',') + '\n';
        sampleData.forEach(row => {
            csv += row.join(',') + '\n';
        });

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'product_import_template.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            
            <div className="relative bg-card-bg rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col border border-border-light">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border-light shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                            <Upload size={20} className="text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-text-primary">Bulk Import Products</h2>
                            <p className="text-xs text-text-muted mt-0.5">
                                Upload CSV or JSON file • Imported by: {user?.name || 'Unknown'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-app-surface-alt flex items-center justify-center text-text-muted">
                        <X size={18} />
                    </button>
                </div>

                {/* Content - Remaining same as before */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                    {!fileName ? (
                        <div className="space-y-4">
                            <button
                                onClick={handleFileSelect}
                                className="w-full border-2 border-dashed border-border-light rounded-2xl p-10 text-center hover:border-[#f67315]/50 hover:bg-[#f67315]/5 transition-all"
                            >
                                <Upload size={40} className="text-text-muted mx-auto mb-3" />
                                <p className="text-sm font-bold text-text-primary">Click to Select File</p>
                                <p className="text-xs text-text-muted mt-1">Support: CSV, JSON</p>
                            </button>

                            <div className="flex items-center justify-between bg-app-surface-alt/50 rounded-xl p-4">
                                <div>
                                    <p className="text-xs font-bold text-text-primary">Need a template?</p>
                                    <p className="text-[10px] text-text-muted mt-0.5">Download sample CSV with correct format</p>
                                </div>
                                <button
                                    onClick={downloadTemplate}
                                    className="flex items-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded-lg transition-colors"
                                >
                                    <Download size={14} /> Template
                                </button>
                            </div>

                            <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
                                <p className="text-xs font-bold text-blue-700 dark:text-blue-400 mb-2">CSV Format Instructions:</p>
                                <div className="space-y-1 text-[11px] text-text-muted">
                                    <p><code className="font-mono">name</code> - Product name (required)</p>
                                    <p><code className="font-mono">category</code> - Category name (optional)</p>
                                    <p><code className="font-mono">type</code> - Product type (optional)</p>
                                    <p><code className="font-mono">cost_price</code> - Cost price (required)</p>
                                    <p><code className="font-mono">sale_price</code> - Sale price (required)</p>
                                    <p><code className="font-mono">stock</code> - Opening stock (optional, default 0)</p>
                                    <p><code className="font-mono">low_stock_limit</code> - Low stock alert (optional, default 10)</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* File Info */}
                            <div className="flex items-center justify-between bg-app-surface-alt/50 rounded-xl p-3">
                                <div className="flex items-center gap-3">
                                    {fileType === 'csv' ? (
                                        <FileSpreadsheet size={20} className="text-green-600" />
                                    ) : fileType === 'json' ? (
                                        <FileJson size={20} className="text-amber-600" />
                                    ) : (
                                        <FileText size={20} className="text-blue-600" />
                                    )}
                                    <div>
                                        <p className="text-xs font-bold text-text-primary">{fileName}</p>
                                        <p className="text-[10px] text-text-muted">{parsedData.length} products found</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => { setFileName(''); setParsedData([]); setPreviewData([]); setErrors([]); }}
                                    className="text-xs text-text-muted hover:text-red-500 transition-colors"
                                >
                                    Remove
                                </button>
                            </div>

                            {/* Validation Errors */}
                            {errors.length > 0 && (
                                <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-3">
                                    <div className="flex items-center gap-2 mb-2">
                                        <AlertTriangle size={14} className="text-red-500" />
                                        <span className="text-xs font-bold text-red-600">{errors.length} errors found</span>
                                    </div>
                                    <div className="max-h-24 overflow-y-auto space-y-1">
                                        {errors.slice(0, 10).map((err, idx) => (
                                            <p key={idx} className="text-[10px] text-red-500">{err}</p>
                                        ))}
                                        {errors.length > 10 && (
                                            <p className="text-[10px] text-red-400">...and {errors.length - 10} more</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Preview Table */}
                            {previewData.length > 0 && (
                                <div>
                                    <p className="text-xs font-bold text-text-primary mb-2">Preview (first {Math.min(10, previewData.length)} rows)</p>
                                    <div className="overflow-x-auto border border-border-light rounded-xl">
                                        <table className="w-full text-xs">
                                            <thead className="bg-app-surface-alt text-text-muted uppercase tracking-wider">
                                                <tr>
                                                    <th className="px-3 py-2 text-left">Name</th>
                                                    <th className="px-3 py-2 text-left">Category</th>
                                                    <th className="px-3 py-2 text-left">Type</th>
                                                    <th className="px-3 py-2 text-right">Cost</th>
                                                    <th className="px-3 py-2 text-right">Sale</th>
                                                    <th className="px-3 py-2 text-right">Stock</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border-light">
                                                {previewData.map((row, idx) => (
                                                    <tr key={idx}>
                                                        <td className="px-3 py-2 font-medium text-text-primary">{row.name || row.product_name || '—'}</td>
                                                        <td className="px-3 py-2 text-text-muted">{row.category || '—'}</td>
                                                        <td className="px-3 py-2 text-text-muted">{row.type || '—'}</td>
                                                        <td className="px-3 py-2 text-right">{row.cost_price || row.cost || 0}</td>
                                                        <td className="px-3 py-2 text-right">{row.sale_price || row.sale || 0}</td>
                                                        <td className="px-3 py-2 text-right">{row.stock || row.quantity || 0}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Import Button */}
                            <div className="flex gap-3 pt-4 border-t border-border-light">
                                <button
                                    onClick={() => { setFileName(''); setParsedData([]); setPreviewData([]); setErrors([]); }}
                                    className="flex-1 px-4 py-2.5 border border-border-light text-text-secondary font-semibold text-sm rounded-xl hover:bg-app-surface-alt transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleImport}
                                    disabled={isImporting || errors.length > 0}
                                    className="flex-1 px-4 py-2.5 bg-[#f67315] hover:bg-[#ea580c] text-white font-semibold text-sm rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isImporting ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                                    {isImporting ? 'Importing...' : `Import ${parsedData.length} Products`}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BulkImportModal;