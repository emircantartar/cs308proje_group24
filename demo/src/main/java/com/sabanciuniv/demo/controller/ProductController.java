package com.sabanciuniv.demo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.sabanciuniv.demo.model.Product;
import com.sabanciuniv.demo.service.ProductService;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    /**
     * Get all products.
     */
    @GetMapping
    public List<Product> getAllProducts() {
        return productService.getAllProducts();
    }

    /**
     * Update stock for a product.
     *
     * @param productId The ID of the product.
     * @param quantity  Quantity to adjust (positive to add, negative to reduce).
     * @return ResponseEntity with success message.
     */
    @PutMapping("/{productId}/stock")
    public ResponseEntity<String> updateStock(@PathVariable Long productId, @RequestParam int quantity) {
        productService.updateStock(productId, quantity);
        return ResponseEntity.ok("Stock updated successfully for product ID: " + productId);
    }

    /**
     * Get current stock level for a product.
     *
     * @param productId The ID of the product.
     * @return Stock level of the product.
     */
    @GetMapping("/{productId}/stock")
    public ResponseEntity<Integer> getStock(@PathVariable Long productId) {
        int stock = productService.getStock(productId);
        return ResponseEntity.ok(stock);
    }

    /**
     * Get products with stock below a threshold.
     *
     * @param threshold The stock threshold.
     * @return A list of products with stock below the threshold.
     */
    @GetMapping("/low-stock")
    public ResponseEntity<List<Product>> getLowStockProducts(@RequestParam int threshold) {
        List<Product> products = productService.getProductsByLowStock(threshold);
        return ResponseEntity.ok(products);
    }

    /**
     * Get products that are out of stock.
     *
     * @return A list of out-of-stock products.
     */
    @GetMapping("/out-of-stock")
    public ResponseEntity<List<Product>> getOutOfStockProducts() {
        List<Product> products = productService.getOutOfStockProducts();
        return ResponseEntity.ok(products);
    }

    /**
     * Get a product's rating details.
     */
    @GetMapping("/{productId}/rating")
    public ResponseEntity<String> getProductRating(@PathVariable Long productId) {
        Product product = productService.getProductById(productId);
        return ResponseEntity.ok("Average Rating: " + product.getAverageRating() + ", Total Ratings: " + product.getRatingCount());
    }
}
