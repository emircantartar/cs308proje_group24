package com.sabanciuniv.demo.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.sabanciuniv.demo.model.Product;
import com.sabanciuniv.demo.repository.ProductRepository;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    /**
     * Get all products.
     */
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    /**
     * Update stock for a product.
     *
     * @param productId The ID of the product.
     * @param quantity  The quantity to adjust (positive to add, negative to reduce).
     */
    public void updateStock(Long productId, int quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        int newStock = product.getStock() + quantity; // Adjust stock based on quantity
        if (newStock < 0) {
            throw new IllegalArgumentException("Insufficient stock for product: " + product.getName());
        }

        product.setStock(newStock);
        productRepository.save(product);
    }

    /**
     * Get the current stock level for a product.
     *
     * @param productId The ID of the product.
     * @return The current stock level.
     */
    public int getStock(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));
        return product.getStock();
    }

    /**
     * Get products with stock below a certain threshold.
     *
     * @param threshold The stock threshold.
     * @return A list of products with stock below the threshold.
     */
    public List<Product> getProductsByLowStock(int threshold) {
        return productRepository.findByStockLessThan(threshold);
    }

    /**
     * Get products that are out of stock.
     *
     * @return A list of out-of-stock products.
     */
    public List<Product> getOutOfStockProducts() {
        return productRepository.findByStockEquals(0);
    }
}
