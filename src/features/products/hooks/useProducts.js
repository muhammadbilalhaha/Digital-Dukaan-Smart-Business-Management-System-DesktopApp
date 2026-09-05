// src/features/products/hooks/useProducts.js
import { useState, useEffect, useCallback, useMemo } from 'react';
import { productService } from '../services/productService';
import { settingsService } from '../../settings/services/settingsService'; // ADD THIS IMPORT

export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalStock: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    inventoryValue: 0,
  });
  
  // ADD THIS STATE
  const [inventorySettings, setInventorySettings] = useState({
    low_stock_notifications: true,
    default_low_stock_limit: 10,
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Load all data
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // ADD settingsService.getInventorySettings() to Promise.all
      const [productList, categoryList, productStats, settings] = await Promise.all([
        productService.getProducts(),
        productService.getCategories(),
        productService.getProductStats(),
        settingsService.getInventorySettings(), // ADD THIS
      ]);
      setProducts(productList);
      setCategories(categoryList);
      setStats(productStats);
      setInventorySettings(settings || {}); // ADD THIS
    } catch (err) {
      setError(err.message || 'Failed to load products');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Create product
  const createProduct = useCallback(async (data) => {
    await productService.createProduct(data);
    await loadData();
  }, [loadData]);

  // Update product
  const updateProduct = useCallback(async (id, data) => {
    await productService.updateProduct(id, data);
    await loadData();
  }, [loadData]);

  // Delete product (soft delete)
  const deleteProduct = useCallback(async (id) => {
    await productService.deleteProduct(id);
    await loadData();
  }, [loadData]);

  // Create category inline
  const createCategory = useCallback(async (name) => {
    const newCategory = await productService.createCategory(name);
    await loadData();
    return newCategory;
  }, [loadData]);

  // Filter + Sort products
  const filteredProducts = useMemo(() => {
    // Step 1: Filter
    let result = products.filter((product) => {
      const matchesSearch =
        !searchQuery ||
        product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        categoryFilter === 'all' ||
        product.category_id === parseInt(categoryFilter);

      return matchesSearch && matchesCategory;
    });

    // Step 2: Sort
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => b.id - a.id);
        break;
      case 'oldest':
        result.sort((a, b) => a.id - b.id);
        break;
      case 'name_asc':
        result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'name_desc':
        result.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
        break;
      case 'price_asc':
        result.sort((a, b) => (a.sale_price || 0) - (b.sale_price || 0));
        break;
      case 'price_desc':
        result.sort((a, b) => (b.sale_price || 0) - (a.sale_price || 0));
        break;
      case 'stock_asc':
        result.sort((a, b) => (a.stock || 0) - (b.stock || 0));
        break;
      case 'stock_desc':
        result.sort((a, b) => (b.stock || 0) - (a.stock || 0));
        break;
      default:
        break;
    }

    return result;
  }, [products, searchQuery, categoryFilter, sortBy]);

  return {
    products: filteredProducts,
    allProducts: products,
    categories,
    stats,
    inventorySettings,
    isLoading,
    error,
    searchQuery,
    categoryFilter,
    sortBy,
    setSearchQuery,
    setCategoryFilter,
    setSortBy,
    createProduct,
    updateProduct,
    deleteProduct,
    createCategory,
    refresh: loadData,
  };
};