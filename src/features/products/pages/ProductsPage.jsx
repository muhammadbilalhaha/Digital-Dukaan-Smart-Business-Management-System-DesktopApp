/************************************* React Imports *************************************/
import React, { useState, useMemo } from 'react';

/************************************* Custom Hooks Imports *************************************/
import { useProducts } from '../hooks/useProducts';

/************************************* Store Imports *************************************/
import useUiStore from '../../../store/ui.store';
import useAuthStore from '../../../store/authStore';

/************************************* Components Imports *************************************/
import ProductsHeader from '../components/ProductsHeader';
import ProductStats from '../components/ProductStats';
import ProductSearch from '../components/ProductSearch';
import ProductTable from '../components/ProductTable';
import ProductDialog from '../components/ProductDialog';
import ProductForm from '../components/ProductForm';
import ProductDetailModal from '../components/ProductDetailModal';
import DeleteConfirmDialog from '../components/DeleteConfirmDialog';

// ==============================
// ProductsPage Component
// ==============================

// Main products management page with full CRUD operations
const ProductsPage = () => {
    // ==============================
    // Custom Hooks
    // ==============================
    const {
        products,
        allProducts,
        categories,
        stats,
        inventorySettings, // GET INVENTORY SETTINGS
        isLoading,
        error,
        searchQuery,
        categoryFilter,
        setSearchQuery,
        setCategoryFilter,
        createProduct,
        updateProduct,
        deleteProduct,
        createCategory,
        refresh,
        sortBy,
        setSortBy
    } = useProducts();

    const { addToast } = useUiStore();
    const user = useAuthStore((state) => state.user);

    // ==============================
    // Dialog & Modal State
    // ==============================
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [deletingProduct, setDeletingProduct] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // ==============================
    // Derived Data (Memoized)
    // ==============================

    // Extract and deduplicate product names for autocomplete suggestions
    const existingNames = useMemo(() => {
        return [...new Set(allProducts.map(p => p.name).filter(Boolean))].sort();
    }, [allProducts]);

    // Extract and deduplicate product types for autocomplete suggestions
    const existingTypes = useMemo(() => {
        return [...new Set(allProducts.map(p => p.type).filter(Boolean))].sort();
    }, [allProducts]);

    // ==============================
    // UI Action Handlers
    // ==============================

    // Open form dialog in add mode
    const handleAdd = () => {
        setEditingProduct(null);
        setShowForm(true);
    };

    // Open product detail modal on row click
    const handleRowClick = (product) => {
        setSelectedProduct(product);
    };

    // Close product detail modal
    const handleCloseDetail = () => {
        setSelectedProduct(null);
    };

    // Switch from detail modal to edit mode
    const handleEditFromDetail = (product) => {
        setSelectedProduct(null);
        setEditingProduct(product);
        setShowForm(true);
    };

    // Switch from detail modal to delete confirmation
    const handleDeleteFromDetail = (product) => {
        setSelectedProduct(null);
        setDeletingProduct(product);
    };

    // ==============================
    // Business Operations
    // ==============================

    // Handle form submission for both create and update operations
    const handleSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            const payload = {
                ...data,
                created_by: editingProduct ? undefined : user?.name || 'Unknown',
                updated_by: user?.name || 'Unknown',
            };

            if (editingProduct) {
                await updateProduct(editingProduct.id, payload);
                addToast({
                    type: 'success',
                    title: 'Product Updated',
                    message: `${data.name} updated successfully`
                });
            } else {
                await createProduct(payload);
                addToast({
                    type: 'success',
                    title: 'Product Added',
                    message: `${data.name} added successfully`
                });
            }

            setShowForm(false);
            setEditingProduct(null);
        } catch (err) {
            addToast({
                type: 'error',
                title: 'Error',
                message: err.message
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle soft delete confirmation with success/error feedback
    const handleConfirmDelete = async () => {
        if (!deletingProduct) return;

        setIsDeleting(true);
        try {
            await deleteProduct(deletingProduct.id);
            addToast({
                type: 'success',
                title: 'Product Deleted',
                message: `${deletingProduct.name} has been deactivated`
            });
            setDeletingProduct(null);
        } catch (err) {
            addToast({
                type: 'error',
                title: 'Error',
                message: err.message
            });
        } finally {
            setIsDeleting(false);
        }
    };

    // ==============================
    // Render: Products Page
    // ==============================
    return (
        <div className="p-1 mx-auto">
            {/* ============================== */}
            {/* Header Section */}
            {/* ============================== */}
            <ProductsHeader
                onAdd={handleAdd}
                onRefresh={refresh}
                isLoading={isLoading}
                totalProducts={stats.total_products}
            />

            {/* ============================== */}
            {/* Statistics Dashboard Section */}
            {/* ============================== */}
            <ProductStats 
                stats={stats} 
                defaultLowStockLimit={inventorySettings.default_low_stock_limit} // PASS SETTING
            />

            {/* ============================== */}
            {/* Search & Filters Section */}
            {/* ============================== */}
            <ProductSearch
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                categoryFilter={categoryFilter}
                onCategoryChange={setCategoryFilter}
                categories={categories}
                sortBy={sortBy}
                onSortChange={setSortBy}
            />

            {/* ============================== */}
            {/* Error Alert Section */}
            {/* ============================== */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-4">
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
            )}

            {/* ============================== */}
            {/* Products Table Section */}
            {/* ============================== */}
            {isLoading ? (
                <div className="bg-card-bg rounded-2xl border border-border-light p-12 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-border-light border-t-[#f67315] rounded-full animate-spin" />
                </div>
            ) : (
                <ProductTable
                    products={products}
                    onRowClick={handleRowClick}
                    defaultLowStockLimit={inventorySettings.default_low_stock_limit} 
                    showCostPrice={inventorySettings.show_cost_price}
                />
            )}

            {/* ============================== */}
            {/* Add/Edit Product Dialog */}
            {/* ============================== */}
            <ProductDialog
                isOpen={showForm}
                onClose={() => {
                    setShowForm(false);
                    setEditingProduct(null);
                }}
                title={editingProduct ? 'Edit Product' : 'Add New Product'}
                isEditing={!!editingProduct}
            >
                <ProductForm
                    defaultValues={editingProduct || {}}
                    categories={categories}
                    existingNames={existingNames}
                    existingTypes={existingTypes}
                    onSubmit={handleSubmit}
                    onCancel={() => {
                        setShowForm(false);
                        setEditingProduct(null);
                    }}
                    isSubmitting={isSubmitting}
                    onCreateCategory={createCategory}
                    isEditing={!!editingProduct}
                    defaultLowStockLimit={inventorySettings.default_low_stock_limit}
                    onBulkImport={refresh}
                />
            </ProductDialog>

            {/* ============================== */}
            {/* Product Detail Modal */}
            {/* ============================== */}
            <ProductDetailModal
                product={selectedProduct}
                isOpen={!!selectedProduct}
                onClose={handleCloseDetail}
                onEdit={handleEditFromDetail}
                onDelete={handleDeleteFromDetail}
            />

            {/* ============================== */}
            {/* Delete Confirmation Dialog */}
            {/* ============================== */}
            <DeleteConfirmDialog
                isOpen={!!deletingProduct}
                onClose={() => setDeletingProduct(null)}
                onConfirm={handleConfirmDelete}
                productName={deletingProduct?.name || ''}
                isLoading={isDeleting}
            />
        </div>
    );
};

export default ProductsPage;