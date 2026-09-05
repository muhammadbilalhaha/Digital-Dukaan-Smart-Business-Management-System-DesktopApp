/************************************* React Imports *************************************/
import React, { useState, useEffect, useRef } from 'react';

/************************************* Third-Party Library Imports *************************************/
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

/************************************* Icons Imports *************************************/
import { Plus, Loader2, Sparkles, ChevronDown, X, Upload, FileSpreadsheet, FileJson, CheckCircle2, AlertTriangle, Package } from 'lucide-react';

/************************************* Validation Imports *************************************/
import { productSchema } from '../validations/productSchema';

/************************************* Tauri Imports *************************************/
import { open } from '@tauri-apps/plugin-dialog';
import { readTextFile } from '@tauri-apps/plugin-fs';
import { invoke } from '../../../tauri/commands';

/************************************* Store Imports *************************************/
import useUiStore from '../../../store/ui.store';

// ==============================
// Capitalization Helper
// ==============================
const capitalize = (str) => {
    if (!str || typeof str !== 'string') return '';
    return str
        .trim()
        .split(/\s+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};

// ==============================
// Dropdown Component
// ==============================

const Dropdown = ({ options = [], value, onChange, placeholder, disabled = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const dropdownRef = useRef(null);
    const inputRef = useRef(null);

    const filtered = options.filter((opt) =>
        opt.toLowerCase().includes(search.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={search || value || ''}
                    onChange={(e) => { setSearch(e.target.value); onChange(e.target.value); setIsOpen(true); }}
                    onFocus={() => setIsOpen(true)}
                    placeholder={placeholder}
                    disabled={disabled}
                    className="w-full bg-input-bg border border-input-border text-text-primary placeholder:text-text-muted text-sm rounded-xl px-4 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#f67315]/20 focus:border-[#f67315] transition-colors duration-300"
                />
                <button
                    type="button"
                    onClick={() => { setIsOpen(!isOpen); inputRef.current?.focus(); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg hover:bg-app-surface-alt flex items-center justify-center text-text-muted transition-colors"
                >
                    {isOpen ? <X size={14} /> : <ChevronDown size={14} />}
                </button>
            </div>

            {isOpen && filtered.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-card-bg border border-border-light rounded-xl shadow-xl z-50 max-h-40 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                    {filtered.map((option, idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => { onChange(option); setSearch(''); setIsOpen(false); }}
                            className="w-full text-left px-4 py-2.5 text-sm text-text-primary hover:bg-app-surface-alt transition-colors duration-150 first:rounded-t-xl last:rounded-b-xl flex items-center gap-2"
                        >
                            <Sparkles size={12} className="text-[#f67315] shrink-0" />
                            <span className="truncate">{option}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

// ==============================
// ProductForm Component
// ==============================

const ProductForm = ({
    defaultValues = {},
    categories = [],
    existingNames = [],
    existingTypes = [],
    onSubmit,
    onCancel,
    isSubmitting,
    onCreateCategory,
    isEditing = false,
    defaultLowStockLimit = 10,
    onBulkImport,
}) => {
    const [showNewCategory, setShowNewCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [showFileImport, setShowFileImport] = useState(false);
    const [importedProducts, setImportedProducts] = useState([]);
    const [isReadingFile, setIsReadingFile] = useState(false);
    const [isImportingBulk, setIsImportingBulk] = useState(false);
    const [importProgress, setImportProgress] = useState({ success: 0, failed: 0, total: 0 });
    const { addToast } = useUiStore();

    const {
        register,
        handleSubmit,
        formState: { errors },
        control,
    } = useForm({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: defaultValues.name || '',
            category_id: defaultValues.category_id || '',
            type: defaultValues.type || '',
            cost_price: defaultValues.cost_price || '',
            sale_price: defaultValues.sale_price || '',
            stock: defaultValues.stock || '',
            low_stock_limit: defaultValues.low_stock_limit || defaultLowStockLimit,
        },
    });

    const handleFormSubmit = (data) => {
        const sanitizedData = {
            ...data,
            name: capitalize(data.name),
            type: capitalize(data.type || ''),
        };
        onSubmit(sanitizedData);
    };

    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) return;
        await onCreateCategory(capitalize(newCategoryName.trim()));
        setNewCategoryName('');
        setShowNewCategory(false);
    };

    // ═══════════════════════════════════════════════════════════
    // BULK FILE IMPORT
    // ═══════════════════════════════════════════════════════════

    const handleFileSelect = async () => {
        try {
            const selected = await open({
                title: 'Select Product File (CSV or JSON)',
                filters: [
                    { name: 'Data Files', extensions: ['csv', 'json'] },
                    { name: 'CSV', extensions: ['csv'] },
                    { name: 'JSON', extensions: ['json'] },
                ]
            });

            if (!selected) return;

            setIsReadingFile(true);
            const content = await readTextFile(selected);
            const extension = selected.split('.').pop().toLowerCase();
            
            let products = [];
            
            if (extension === 'csv') {
                products = parseCSVProducts(content);
            } else if (extension === 'json') {
                products = parseJSONProducts(content);
            }

            if (products.length > 0) {
                setImportedProducts(products);
                addToast({
                    type: 'success',
                    title: 'File Loaded',
                    message: `${products.length} products found in file`
                });
            } else {
                addToast({
                    type: 'error',
                    title: 'No Products',
                    message: 'No valid products found in file'
                });
            }
        } catch (err) {
            console.error('File read failed:', err);
            addToast({ type: 'error', title: 'File Error', message: err.message });
        } finally {
            setIsReadingFile(false);
        }
    };

    const parseCSVProducts = (content) => {
        const lines = content.split('\n').filter(line => line.trim());
        if (lines.length < 2) return [];

        const headers = parseCSVLine(lines[0]);
        const products = [];

        for (let i = 1; i < lines.length; i++) {
            const values = parseCSVLine(lines[i]);
            if (values.length === 0) continue;

            const row = {};
            headers.forEach((header, index) => {
                row[header.trim().toLowerCase().replace(/\s+/g, '_')] = values[index]?.trim() || '';
            });

            const name = row.name || row.product_name || row.product || '';
            if (name) {
                products.push({
                    name: capitalize(name),
                    category_name: capitalize(row.category || row.category_name || ''),
                    type: capitalize(row.type || ''),
                    cost_price: parseFloat(row.cost_price || row.cost || 0),
                    sale_price: parseFloat(row.sale_price || row.sale || 0),
                    stock: parseInt(row.stock || row.quantity || 0),
                    low_stock_limit: parseInt(row.low_stock_limit || 0) || defaultLowStockLimit,
                });
            }
        }

        return products;
    };

    const parseJSONProducts = (content) => {
        try {
            const parsed = JSON.parse(content);
            let products = [];

            if (Array.isArray(parsed)) {
                products = parsed;
            } else if (parsed.products && Array.isArray(parsed.products)) {
                products = parsed.products;
            } else if (parsed.data && Array.isArray(parsed.data)) {
                products = parsed.data;
            }

            return products
                .filter(p => p.name || p.product_name || p.product)
                .map(p => ({
                    name: capitalize(p.name || p.product_name || p.product || ''),
                    category_name: capitalize(p.category || p.category_name || ''),
                    type: capitalize(p.type || ''),
                    cost_price: parseFloat(p.cost_price || p.cost || 0),
                    sale_price: parseFloat(p.sale_price || p.sale || 0),
                    stock: parseInt(p.stock || p.quantity || 0),
                    low_stock_limit: parseInt(p.low_stock_limit || 0) || defaultLowStockLimit,
                }));
        } catch (err) {
            addToast({ type: 'error', title: 'Invalid JSON', message: 'Could not parse JSON file' });
            return [];
        }
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

    const handleBulkImport = async () => {
        if (importedProducts.length === 0) {
            addToast({ type: 'error', title: 'No Products', message: 'No products to import' });
            return;
        }

        setIsImportingBulk(true);
        setImportProgress({ success: 0, failed: 0, total: importedProducts.length });

        let successCount = 0;
        let failedCount = 0;

        for (const product of importedProducts) {
            if (!product.name) {
                failedCount++;
                continue;
            }

            try {
                let categoryId = null;
                if (product.category_name) {
                    const existingCategory = categories.find(
                        c => c.name.toLowerCase() === product.category_name.toLowerCase()
                    );
                    if (existingCategory) {
                        categoryId = existingCategory.id;
                    } else {
                        try {
                            const newCategory = await invoke('create_category', { name: product.category_name });
                            categoryId = newCategory.id;
                        } catch {
                            categoryId = null;
                        }
                    }
                }

                const productData = {
                    name: product.name,
                    category_id: categoryId,
                    type: product.type || null,
                    cost_price: product.cost_price || 0,
                    sale_price: product.sale_price || 0,
                    stock: product.stock || 0,
                    low_stock_limit: product.low_stock_limit || defaultLowStockLimit,
                };

                await invoke('create_product', { request: productData });
                successCount++;
            } catch (err) {
                failedCount++;
            }

            setImportProgress({ success: successCount, failed: failedCount, total: importedProducts.length });
        }

        setIsImportingBulk(false);

        if (successCount > 0) {
            addToast({
                type: 'success',
                title: 'Bulk Import Complete',
                message: `${successCount} products imported successfully`
            });
            if (onBulkImport) onBulkImport();
            if (failedCount === 0) onCancel();
        }

        if (failedCount > 0) {
            addToast({
                type: 'warning',
                title: 'Partial Import',
                message: `${failedCount} products failed`
            });
        }

        setImportedProducts([]);
        setShowFileImport(false);
    };

    const clearImportedFile = () => {
        setImportedProducts([]);
        setShowFileImport(false);
        setImportProgress({ success: 0, failed: 0, total: 0 });
    };

    const inputClass = (fieldError) => `
        w-full bg-input-bg border text-text-primary placeholder:text-text-muted 
        text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 
        transition-colors duration-300
        ${fieldError
            ? 'border-red-300 dark:border-red-700 focus:ring-red-500/20 focus:border-red-500'
            : 'border-input-border focus:ring-[#f67315]/20 focus:border-[#f67315]'
        }
    `;

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            {/* BULK IMPORT SECTION */}
            {!isEditing && (
                <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-3">
                    {!showFileImport ? (
                        <button
                            type="button"
                            onClick={() => setShowFileImport(true)}
                            className="w-full flex items-center justify-center gap-2 py-2 text-blue-600 font-semibold text-xs hover:text-blue-700 transition-colors"
                        >
                            <Upload size={14} />
                            Bulk Import from CSV/JSON (All Products)
                        </button>
                    ) : (
                        <div className="space-y-3">
                            {importedProducts.length > 0 ? (
                                <>
                                    <div className="flex items-center justify-between bg-white dark:bg-black/20 rounded-lg px-3 py-2">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 size={14} className="text-emerald-500" />
                                            <span className="text-xs font-medium text-text-primary">
                                                {importedProducts.length} products ready
                                            </span>
                                        </div>
                                        <button type="button" onClick={clearImportedFile} className="text-text-muted hover:text-red-500">
                                            <X size={14} />
                                        </button>
                                    </div>

                                    {isImportingBulk && (
                                        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-semibold text-emerald-700">Importing...</span>
                                                <span className="text-xs text-emerald-600">{importProgress.success} / {importProgress.total}</span>
                                            </div>
                                            <div className="w-full h-2 bg-emerald-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${(importProgress.success / importProgress.total) * 100}%` }} />
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        onClick={handleBulkImport}
                                        disabled={isImportingBulk}
                                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        {isImportingBulk ? (
                                            <><Loader2 size={14} className="animate-spin" /> Importing...</>
                                        ) : (
                                            <><Package size={14} /> Import All {importedProducts.length} Products</>
                                        )}
                                    </button>
                                </>
                            ) : (
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={handleFileSelect}
                                        disabled={isReadingFile}
                                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold text-xs rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        {isReadingFile ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                                        {isReadingFile ? 'Reading...' : 'Select CSV/JSON File'}
                                    </button>
                                    <button type="button" onClick={() => setShowFileImport(false)} className="px-3 py-2 border border-border-light text-text-muted text-xs rounded-lg">
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Divider */}
            <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-border-light" />
                <span className="text-[10px] font-bold text-text-muted uppercase">or add manually</span>
                <div className="flex-1 h-px bg-border-light" />
            </div>

            {/* Product Name + Category */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5">
                        Product Name *
                    </label>
                    {existingNames.length > 0 ? (
                        <Controller
                            name="name"
                            control={control}
                            render={({ field }) => (
                                <Dropdown
                                    options={existingNames}
                                    value={field.value}
                                    onChange={field.onChange}
                                    placeholder="e.g. Math Book Grade 8"
                                />
                            )}
                        />
                    ) : (
                        <input type="text" {...register('name')} placeholder="e.g. Math Book Grade 8" className={inputClass(errors.name)} />
                    )}
                    {errors.name && <p className="text-red-500 text-[10px] mt-1">{errors.name.message}</p>}
                </div>

                <div>
                    <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5">
                        Category *
                    </label>
                    {!showNewCategory ? (
                        <div className="flex gap-2">
                            <select {...register('category_id', { valueAsNumber: true })} className={inputClass(errors.category_id)}>
                                <option value="">Select Category</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                            <button type="button" onClick={() => setShowNewCategory(true)} className="w-10 h-10 rounded-xl bg-app-surface-alt hover:bg-[#f67315]/10 text-text-muted hover:text-[#f67315] flex items-center justify-center transition-colors shrink-0 border border-border-light" title="Add Category">
                                <Plus size={16} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <input type="text" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="New category name" className={inputClass(false)} autoFocus onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCategory())} />
                            <button type="button" onClick={handleAddCategory} className="px-3 py-2 bg-[#f67315] text-white text-xs font-bold rounded-xl hover:bg-[#ea580c] transition-colors">Add</button>
                            <button type="button" onClick={() => setShowNewCategory(false)} className="px-3 py-2 bg-app-surface-alt text-text-secondary text-xs font-bold rounded-xl hover:bg-border-light transition-colors border border-border-light">Cancel</button>
                        </div>
                    )}
                    {errors.category_id && <p className="text-red-500 text-[10px] mt-1">{errors.category_id.message}</p>}
                </div>
            </div>

            {/* Type */}
            <div>
                <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5">
                    Type
                </label>
                {existingTypes.length > 0 ? (
                    <Controller
                        name="type"
                        control={control}
                        render={({ field }) => (
                            <Dropdown
                                options={existingTypes}
                                value={field.value}
                                onChange={field.onChange}
                                placeholder="e.g. Book, Notebook, Pen"
                            />
                        )}
                    />
                ) : (
                    <input type="text" {...register('type')} placeholder="e.g. Book, Notebook, Pen" className={inputClass(false)} />
                )}
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5">Cost Price *</label>
                    <input type="number" step="0.01" {...register('cost_price', { valueAsNumber: true })} placeholder="0.00" className={inputClass(errors.cost_price)} />
                    {errors.cost_price && <p className="text-red-500 text-[10px] mt-1">{errors.cost_price.message}</p>}
                </div>
                <div>
                    <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5">Sale Price *</label>
                    <input type="number" step="0.01" {...register('sale_price', { valueAsNumber: true })} placeholder="0.00" className={inputClass(errors.sale_price)} />
                    {errors.sale_price && <p className="text-red-500 text-[10px] mt-1">{errors.sale_price.message}</p>}
                </div>
            </div>

            {/* Stock */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5">Opening Stock *</label>
                    <input type="number" {...register('stock', { valueAsNumber: true })} placeholder="0" className={inputClass(errors.stock)} />
                    {errors.stock && <p className="text-red-500 text-[10px] mt-1">{errors.stock.message}</p>}
                </div>
                <div>
                    <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5">Low Stock Alert</label>
                    <input type="number" {...register('low_stock_limit', { valueAsNumber: true })} placeholder={String(defaultLowStockLimit)} className={inputClass(false)} />
                </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4 border-t border-border-light">
                <button type="button" onClick={onCancel} className="flex-1 px-4 py-2.5 border border-border-medium text-text-secondary font-semibold text-sm rounded-xl hover:bg-app-surface-alt transition-colors duration-300">
                    Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2.5 bg-[#f67315] hover:bg-[#ea580c] text-white font-semibold text-sm rounded-xl transition-colors duration-300 disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm shadow-[#f67315]/20">
                    {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
                    {isEditing ? 'Save Changes' : 'Add Product'}
                </button>
            </div>
        </form>
    );
};

export default ProductForm;