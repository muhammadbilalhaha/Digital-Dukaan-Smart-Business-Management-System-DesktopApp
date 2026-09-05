// src/features/products/services/productService.js
import { invoke } from '../../../tauri/commands';

class ProductService {
    /**
     * Get all products with category names
     */
    async getProducts() {
        return await invoke('get_products');
    }

    /**
     * Get a single product by ID
     */
    async getProduct(id) {
        return await invoke('get_product', { id });
    }

    /**
     * Create a new product
     */
    async createProduct(productData) {
        return await invoke('create_product', {
            request: {
                name: productData.name,
                category_id: productData.category_id,
                type: productData.type || null,
                cost_price: productData.cost_price,
                sale_price: productData.sale_price,
                stock: productData.stock,
                low_stock_limit: productData.low_stock_limit || 0,
                created_by: productData.created_by || null,
                updated_by: null,
            },
        });
    }

    /**
     * Update an existing product
     */
    async updateProduct(id, productData) {
        return await invoke('update_product', {
            id,
            request: {
                name: productData.name,
                category_id: productData.category_id,
                type: productData.type || null,
                cost_price: productData.cost_price,
                sale_price: productData.sale_price,
                stock: productData.stock,
                low_stock_limit: productData.low_stock_limit || 0,
                created_by: null,
                updated_by: productData.updated_by || null,
            },
        });
    }

    /**
     * Soft delete a product (set as inactive)
     */
    async deleteProduct(id) {
        return await invoke('delete_product', { id });
    }

    /**
     * Get all active categories
     */
    async getCategories() {
        return await invoke('get_categories');
    }

    /**
     * Create a new category
     */
    async createCategory(name) {
        return await invoke('create_category', { name });
    }

    /**
     * Get product statistics
     */
    async getProductStats() {
        return await invoke('get_product_stats');
    }
}

export const productService = new ProductService();