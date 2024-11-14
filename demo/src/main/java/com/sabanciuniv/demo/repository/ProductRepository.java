package com.sabanciuniv.demo.repository;

import com.sabanciuniv.demo.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByCategory(String category);  // Custom query method
    List<Product> findByPriceBetween(double minPrice, double maxPrice);  // Price filtering
}
