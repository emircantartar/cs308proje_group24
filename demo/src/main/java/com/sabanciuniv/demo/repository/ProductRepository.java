package com.sabanciuniv.demo.repository;

import com.sabanciuniv.demo.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    // Find products by category
    List<Product> findByCategory(String category);

    // Find products within a price range
    List<Product> findByPriceBetween(double minPrice, double maxPrice);

    // Find products with stock below a certain threshold
    List<Product> findByStockLessThan(int stock);

    // Find products that are out of stock
    List<Product> findByStockEquals(int stock);

    // Find products with stock greater than a certain threshold
    List<Product> findByStockGreaterThan(int stock);
}
