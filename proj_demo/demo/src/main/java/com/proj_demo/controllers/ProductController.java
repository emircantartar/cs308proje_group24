package com.proj_demo.controllers;

import com.proj_demo.models.Product;
import com.proj_demo.services.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    // Get all products
    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        try {
            List<Product> products = productService.getAllProducts();
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Get product by ID
    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable String id) {
        try {
            Product product = productService.getProductById(id);
            if (product != null) {
                return ResponseEntity.ok(product);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Search for products by name or description
    @GetMapping("/search")
    public ResponseEntity<List<Product>> searchProducts(@RequestParam String query) {
        try {
            List<Product> products = productService.searchProducts(query);
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Sort products by price or popularity
    @GetMapping("/sort")
    public ResponseEntity<List<Product>> sortProducts(
            @RequestParam String sortBy,
            @RequestParam(defaultValue = "asc") String order) {
        try {
            List<Product> sortedProducts = productService.sortProducts(sortBy, order);
            return ResponseEntity.ok(sortedProducts);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(null); // Invalid sort criteria
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Add a rating to a product
    @PostMapping("/{id}/rate")
    public ResponseEntity<String> rateProduct(
            @PathVariable String id,
            @RequestParam int rating) {
        try {
            boolean success = productService.addRating(id, rating);
            if (success) {
                return ResponseEntity.ok("Rating added successfully.");
            } else {
                return ResponseEntity.badRequest().body("Invalid rating or product not found.");
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("An error occurred while adding the rating.");
        }
    }
}